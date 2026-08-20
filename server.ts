import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import multer from 'multer';

import { INITIAL_MOCK_CANDIDATES, SAMPLE_JOBS } from './src/data/mockData';
import { Candidate, JobDescription } from './src/types';

dotenv.config();

const app = express();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 100,
    fileSize: 15 * 1024 * 1024,
  },
});

const PORT = Number(process.env.PORT) || 3000;

// FastAPI backend
const PYTHON_API_URL =
  process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';

// In-memory frontend/session data
let runtimeCandidates: Candidate[] = [...INITIAL_MOCK_CANDIDATES];
let runtimeJob: JobDescription = { ...SAMPLE_JOBS[0] };

// ---------------------------------------------------------
// Gemini
// ---------------------------------------------------------

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ---------------------------------------------------------
// Main server
// ---------------------------------------------------------

async function startServer() {
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // -------------------------------------------------------
  // API 1: Health
  // -------------------------------------------------------

  app.get('/api/health', async (_req, res) => {
    try {
      let pythonHealthy = false;

      try {
        const response = await fetch(`${PYTHON_API_URL}/health`);
        pythonHealthy = response.ok;
      } catch {
        pythonHealthy = false;
      }

      res.json({
        status: 'healthy',
        service: 'Recruitly AI',
        frontend_port: PORT,
        python_backend: PYTHON_API_URL,
        python_backend_healthy: pythonHealthy,
        candidates_count: runtimeCandidates.length,
        gemini_configured: !!process.env.GEMINI_API_KEY,
      });
    } catch (error: any) {
      res.status(500).json({
        error: error?.message || 'Health check failed',
      });
    }
  });

  // -------------------------------------------------------
  // API 2: Get Candidates
  // -------------------------------------------------------

  app.get('/api/candidates', (_req, res) => {
    res.json(runtimeCandidates);
  });

  // -------------------------------------------------------
  // API 3: Get Candidate by ID
  // -------------------------------------------------------

  app.get('/api/candidates/:id', (req, res) => {
    const found = runtimeCandidates.find(
      (candidate) => candidate.candidate_id === req.params.id
    );

    if (!found) {
      return res.status(404).json({
        error: 'Candidate not found',
      });
    }

    res.json(found);
  });

    // -------------------------------------------------------
  // API 4: Analyze Resumes
  // Frontend -> Express :3000
  // Express -> FastAPI :8000
  // -------------------------------------------------------

  app.post('/api/analyze', upload.array('resumes', 100), async (req, res) => {
    try {
      const body = req.body || {};
      const uploadedFiles = Array.isArray(req.files)
        ? (req.files as Express.Multer.File[])
        : [];

      const parseJsonField = <T,>(value: unknown, fallback: T): T => {
        if (value === undefined || value === null || value === '') return fallback;
        if (typeof value !== 'string') return value as T;
        try {
          return JSON.parse(value) as T;
        } catch {
          return fallback;
        }
      };

      const job_title = String(body.job_title || 'Untitled Job');
      const job_description = String(body.job_description || '');
      const required_experience = Number(body.required_experience) || 0;
      const required_education = String(body.required_education || "Bachelor's");
      const required_skills = parseJsonField<string[]>(body.required_skills, []);
      const weights = parseJsonField<any>(body.weights, null);
      const resumes = Array.isArray(body.resumes) ? body.resumes : [];

      console.log(
        `[Express] /api/analyze received ${
          uploadedFiles.length || resumes.length
        } resumes`
      );

      if (!job_description) {
        return res.status(400).json({ error: 'Missing job description' });
      }

      if (uploadedFiles.length === 0 && resumes.length === 0) {
        return res.status(400).json({ error: 'No resumes received' });
      }

      let pythonResponse: Response;

      if (uploadedFiles.length > 0) {
        // Forward original files to FastAPI. Do NOT convert PDF bytes to UTF-8 text.
        const form = new FormData();
        form.append('job_title', job_title);
        form.append('job_description', job_description);
        form.append('required_experience', String(required_experience));
        form.append('required_education', required_education);
        form.append('required_skills', JSON.stringify(required_skills));
        form.append('weights', JSON.stringify(weights));

        for (const file of uploadedFiles) {
          form.append(
            'resumes',
            new Blob(
              [
                file.buffer.buffer.slice(
                  file.buffer.byteOffset,
                  file.buffer.byteOffset + file.buffer.byteLength
                ) as ArrayBuffer,
              ],
              {
                type: file.mimetype || 'application/octet-stream',
              }
            ),
            file.originalname
        );
        }

        console.log(
          `[Express] Sending ${uploadedFiles.length} ORIGINAL files to FastAPI ${PYTHON_API_URL}/api/analyze`
        );

        pythonResponse = await fetch(`${PYTHON_API_URL}/api/analyze`, {
          method: 'POST',
          body: form,
        });
      } else {
        const payload = {
          job_title,
          job_description,
          required_experience,
          required_education,
          required_skills,
          weights,
          resumes: resumes.map((resume: any) => ({
            filename: String(resume?.filename || 'resume.txt'),
            text: String(resume?.text || ''),
          })),
        };

        console.log(
          `[Express] Sending ${payload.resumes.length} text resumes to FastAPI ${PYTHON_API_URL}/api/analyze`
        );

        pythonResponse = await fetch(`${PYTHON_API_URL}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const responseText =
        await pythonResponse.text();

      console.log(
        `[FastAPI] /api/analyze status: ${
          pythonResponse.status
        }`
      );

      // ---------------------------------------------------
      // Handle FastAPI errors
      // ---------------------------------------------------

      if (!pythonResponse.ok) {
        console.error(
          '[FastAPI] Error response:',
          responseText
        );

        return res
          .status(pythonResponse.status)
          .json({
            error:
              `FastAPI analysis failed: ${responseText}`,
          });
      }

      // ---------------------------------------------------
      // Parse FastAPI response
      // ---------------------------------------------------

      let pythonResult: any;

      try {
        pythonResult =
          JSON.parse(responseText);
      } catch {
        return res.status(500).json({
          error:
            'FastAPI returned invalid JSON',
          raw_response: responseText,
        });
      }

      // ---------------------------------------------------
      // Store REAL candidate results
      // ---------------------------------------------------

      if (
        Array.isArray(
          pythonResult.candidates
        )
      ) {
        runtimeCandidates =
          pythonResult.candidates;
      }

      // ---------------------------------------------------
      // Store current job
      // ---------------------------------------------------

      runtimeJob = {
        id: `job_${Date.now()}`,

        title:
          job_title ||
          'Untitled Job',

        description:
          job_description || '',

        required_experience:
          Number(
            required_experience
          ) || 0,

        required_education:
          required_education ||
          "Bachelor's",

        required_skills:
          Array.isArray(
            required_skills
          )
            ? required_skills
            : [],

        created_at:
          new Date().toISOString(),
      };

      console.log(
        `[Express] Successfully received ${
          runtimeCandidates.length
        } candidates from FastAPI`
      );

      // ---------------------------------------------------
      // Return result to frontend
      // ---------------------------------------------------

      return res.json({
        ...pythonResult,

        job:
          pythonResult.job ||
          runtimeJob,

        candidates:
          pythonResult.candidates ||
          runtimeCandidates,
      });

    } catch (error: any) {
      console.error(
        '[Express] Error in /api/analyze:',
        error
      );

      return res.status(500).json({
        error:
          error?.message ||
          'Analysis failed',

        python_backend:
          PYTHON_API_URL,
      });
    }
  });

  // -------------------------------------------------------
  // API 5: Generate AI Candidate Summary
  // -------------------------------------------------------

  app.post(
    '/api/generate-ai-summary',
    async (req, res) => {
      try {
        const { candidate, job } =
          req.body;

        if (!candidate || !job) {
          return res.status(400).json({
            error:
              'Candidate and job are required',
          });
        }

        const ai =
          getGeminiClient();

        // -------------------------------------------------
        // Fallback if Gemini API key isn't configured
        // -------------------------------------------------

        if (!ai) {
          return res.json({
            summary:
              `Candidate ${candidate.candidate_name} exhibits ${candidate.match_score}% qualification match for ${job.title}. Proficient in ${
                candidate.matched_skills?.join(', ') ||
                'the listed skills'
              } with ${
                candidate.experience?.years ||
                0
              } years of work experience. Key gap to probe: ${
                candidate.missing_skills?.join(', ') ||
                'none'
              }.`,

            questions: [
              `Can you describe your experience implementing ${
                candidate.matched_skills?.[0] ||
                'core technologies'
              } in production?`,

              `How do you approach learning and integrating ${
                candidate.missing_skills?.[0] ||
                'new technologies'
              }?`,

              `Walk through the technical architecture of your recent project.`,
            ],
          });
        }

        // -------------------------------------------------
        // Gemini prompt
        // -------------------------------------------------

        const prompt = `
You are a Senior Technical Recruiter and AI Talent Assessment expert.

Analyze this candidate against the job criteria and provide:

1. A concise, objective 2-3 sentence executive recruiter summary.
2. Exactly 3 targeted technical interview questions.

Job Title:
${job.title}

Job Description:
${job.description}

Candidate Name:
${candidate.candidate_name}

Match Score:
${candidate.match_score}%

Recommendation:
${candidate.recommendation}

Matched Skills:
${candidate.matched_skills?.join(', ') || 'None'}

Missing Skills:
${candidate.missing_skills?.join(', ') || 'None'}

Experience:
${candidate.experience?.years || 0} years

Required Experience:
${candidate.experience?.required_years || 0} years

Education:
${candidate.education?.degree || 'Not detected'}

Return JSON only:

{
  "summary": "Executive recruiter assessment text...",
  "questions": [
    "Question 1",
    "Question 2",
    "Question 3"
  ]
}
`;

        const response =
          await ai.models.generateContent({
            model:
              'gemini-3.7-flash',

            contents: prompt,

            config: {
              responseMimeType:
                'application/json',
            },
          });

        let parsed: any = {};

        try {
          parsed = JSON.parse(
            response.text || '{}'
          );
        } catch {
          parsed = {};
        }

        return res.json({
          summary:
            parsed.summary ||
            candidate.summary ||
            `${candidate.candidate_name} is a ${candidate.recommendation} candidate with a ${candidate.match_score}% match.`,

          questions:
            Array.isArray(
              parsed.questions
            ) &&
            parsed.questions.length > 0
              ? parsed.questions
              : [
                  `Can you describe your experience implementing ${
                    candidate.matched_skills?.[0] ||
                    'your core technologies'
                  }?`,

                  `What experience do you have with ${
                    candidate.missing_skills?.[0] ||
                    'the missing technical skills'
                  }?`,

                  `Walk through your most recent technical project.`,
                ],
        });

      } catch (error: any) {
        console.warn(
          'Gemini summary error:',
          error
        );

        const candidate =
          req.body?.candidate;

        return res.json({
          summary:
            `${candidate?.recommendation || 'Candidate'} candidate (${candidate?.match_score || 0}%) with background in ${
              candidate?.matched_skills
                ?.slice(0, 3)
                ?.join(', ') ||
              'the listed technologies'
            }.`,

          questions: [
            `How do you handle production challenges with ${
              candidate?.matched_skills?.[0] ||
              'your core stack'
            }?`,

            `What experience do you have with ${
              candidate?.missing_skills?.[0] ||
              'cloud systems'
            }?`,

            `Can you explain one of your recent technical projects?`,
          ],
        });
      }
    }
  );

  // -------------------------------------------------------
  // API 6: Current Job
  // -------------------------------------------------------

  app.get('/api/job', (_req, res) => {
    res.json(runtimeJob);
  });

  // -------------------------------------------------------
  // API 7: Analytics
  // -------------------------------------------------------

  app.get('/api/analytics', (_req, res) => {
    const candidates =
      runtimeCandidates || [];

    const total =
      candidates.length;

    const avgScore =
      total > 0
        ? Math.round(
            candidates.reduce(
              (sum, candidate) =>
                sum +
                Number(
                  candidate.match_score ||
                    0
                ),
              0
            ) / total
          )
        : 0;

    const strongMatches =
      candidates.filter(
        (candidate) =>
          Number(
            candidate.match_score || 0
          ) >= 80
      ).length;

    const scoreBuckets = {
      '90-100': 0,
      '80-89': 0,
      '70-79': 0,
      '60-69': 0,
      'Below 60': 0,
    };

    for (const candidate of candidates) {
      const score =
        Number(
          candidate.match_score || 0
        );

      if (score >= 90) {
        scoreBuckets['90-100']++;
      } else if (score >= 80) {
        scoreBuckets['80-89']++;
      } else if (score >= 70) {
        scoreBuckets['70-79']++;
      } else if (score >= 60) {
        scoreBuckets['60-69']++;
      } else {
        scoreBuckets['Below 60']++;
      }
    }

    const skillCounts: Record<
      string,
      number
    > = {};

    for (const candidate of candidates) {
      for (const skill of
        candidate.matched_skills || []) {
        skillCounts[skill] =
          (skillCounts[skill] || 0) +
          1;
      }
    }

    const topSkills =
      Object.entries(skillCounts)
        .map(
          ([skill, count]) => ({
            skill,
            count,
          })
        )
        .sort(
          (a, b) =>
            b.count - a.count
        )
        .slice(0, 8);

    const recommendations = [
      'Excellent Match',
      'Strong Match',
      'Good Match',
      'Moderate Match',
      'Low Match',
    ];

    const matchCategories =
      recommendations.map(
        (name) => ({
          name,
          count:
            candidates.filter(
              (candidate) =>
                candidate.recommendation ===
                name
            ).length,
        })
      );

    res.json({
      total_candidates: total,
      avg_score: avgScore,
      strong_matches_count:
        strongMatches,

      score_distribution:
        Object.entries(
          scoreBuckets
        ).map(
          ([range, count]) => ({
            range,
            count,
          })
        ),

      top_skills:
        topSkills,

      match_categories:
        matchCategories,
    });
  });

  // -------------------------------------------------------
  // Vite
  // -------------------------------------------------------

  if (
    process.env.NODE_ENV !==
    'production'
  ) {
    const vite =
      await createViteServer({
        server: {
          middlewareMode: true,
        },
        appType: 'spa',
      });

    app.use(
      vite.middlewares
    );
  } else {
    const distPath =
      path.join(
        process.cwd(),
        'dist'
      );

    app.use(
      express.static(
        distPath
      )
    );

    app.get(
      '*',
      (_req, res) => {
        res.sendFile(
          path.join(
            distPath,
            'index.html'
          )
        );
      }
    );
  }

  // -------------------------------------------------------
  // Start
  // -------------------------------------------------------

  app.listen(
    PORT,
    '0.0.0.0',
    () => {
      console.log('');
      console.log(
        '=============================================='
      );
      console.log(
        '       RECRUITLY AI SERVER STARTED'
      );
      console.log(
        '=============================================='
      );
      console.log(
        `Frontend:   http://localhost:${PORT}`
      );
      console.log(
        `FastAPI:    ${PYTHON_API_URL}`
      );
      console.log(
        `Candidates: ${runtimeCandidates.length}`
      );
      console.log(
        '=============================================='
      );
      console.log('');
    }
  );
}

startServer().catch(
  (error) => {
    console.error(
      'Failed to start server:',
      error
    );

    process.exit(1);
  }
);