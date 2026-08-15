import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { scoreCandidate, rankCandidates } from './src/utils/nlpEngine';
import { INITIAL_MOCK_CANDIDATES, SAMPLE_JOBS } from './src/data/mockData';
import { Candidate, JobDescription, ScoringWeights } from './src/types';

dotenv.config();

// In-memory runtime database for session persistence
let runtimeCandidates: Candidate[] = [...INITIAL_MOCK_CANDIDATES];
let runtimeJob: JobDescription = { ...SAMPLE_JOBS[0] };

// Lazy-safe Gemini initialization
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

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // API 1: Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      candidates_count: runtimeCandidates.length,
      gemini_configured: !!process.env.GEMINI_API_KEY,
    });
  });

  // API 2: Get Candidates List
  app.get('/api/candidates', (req, res) => {
    res.json(runtimeCandidates);
  });

  // API 3: Get Candidate by ID
  app.get('/api/candidates/:id', (req, res) => {
    const found = runtimeCandidates.find(c => c.candidate_id === req.params.id);
    if (!found) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json(found);
  });

  // API 4: Analyze Resumes against Job Description
  app.post('/api/analyze', async (req, res) => {
    try {
      const {
        job_title,
        job_description,
        required_experience,
        required_education,
        required_skills,
        weights,
        resumes, // Array of { filename: string, text: string }
      } = req.body;

      if (!job_description || !resumes || !Array.isArray(resumes) || resumes.length === 0) {
        return res.status(400).json({ error: 'Missing required job description or resumes payload' });
      }

      const job: JobDescription = {
        id: `job_${Date.now()}`,
        title: job_title || 'Untitled Job',
        description: job_description,
        required_experience: Number(required_experience) || 0,
        required_education: required_education || 'Degree in relevant field',
        required_skills: Array.isArray(required_skills) ? required_skills : [],
        created_at: new Date().toISOString(),
      };

      runtimeJob = job;

      // Score each resume using the deterministic ML/NLP engine
      const scoredCandidates: Candidate[] = resumes.map((r: { filename: string; text: string }) => {
        return scoreCandidate(r.text, r.filename, job, weights);
      });

      // Rank candidates
      const ranked = rankCandidates(scoredCandidates);
      runtimeCandidates = ranked;

      // Calculate cohort analytics
      const total = ranked.length;
      const avg_score = total > 0 
        ? Math.round(ranked.reduce((sum, c) => sum + c.match_score, 0) / total) 
        : 0;
      const strong_matches_count = ranked.filter(c => c.match_score >= 80).length;

      // Score distribution
      const scoreBuckets = {
        '90-100': 0,
        '80-89': 0,
        '70-79': 0,
        '60-69': 0,
        'Below 60': 0,
      };
      for (const c of ranked) {
        if (c.match_score >= 90) scoreBuckets['90-100']++;
        else if (c.match_score >= 80) scoreBuckets['80-89']++;
        else if (c.match_score >= 70) scoreBuckets['70-79']++;
        else if (c.match_score >= 60) scoreBuckets['60-69']++;
        else scoreBuckets['Below 60']++;
      }
      const score_distribution = Object.entries(scoreBuckets).map(([range, count]) => ({ range, count }));

      // Skills count
      const skillCounts: Record<string, number> = {};
      for (const c of ranked) {
        for (const s of c.matched_skills) {
          skillCounts[s] = (skillCounts[s] || 0) + 1;
        }
      }
      const top_skills = Object.entries(skillCounts)
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      const match_categories = [
        { name: 'Excellent Match', count: ranked.filter(c => c.recommendation === 'Excellent Match').length, color: '#10b981' },
        { name: 'Strong Match', count: ranked.filter(c => c.recommendation === 'Strong Match').length, color: '#0ea5e9' },
        { name: 'Good Match', count: ranked.filter(c => c.recommendation === 'Good Match').length, color: '#6366f1' },
        { name: 'Moderate Match', count: ranked.filter(c => c.recommendation === 'Moderate Match').length, color: '#f59e0b' },
        { name: 'Low Match', count: ranked.filter(c => c.recommendation === 'Low Match').length, color: '#ef4444' },
      ];

      const expBuckets = { '0-1 yrs': 0, '1-3 yrs': 0, '3-5 yrs': 0, '5+ yrs': 0 };
      for (const c of ranked) {
        const y = c.experience.years;
        if (y <= 1) expBuckets['0-1 yrs']++;
        else if (y <= 3) expBuckets['1-3 yrs']++;
        else if (y <= 5) expBuckets['3-5 yrs']++;
        else expBuckets['5+ yrs']++;
      }
      const experience_distribution = Object.entries(expBuckets).map(([range, count]) => ({ range, count }));

      res.json({
        job,
        candidates: ranked,
        analytics: {
          total_candidates: total,
          avg_score,
          strong_matches_count,
          score_distribution,
          top_skills,
          match_categories,
          experience_distribution,
        }
      });
    } catch (err: any) {
      console.error('Error in /api/analyze:', err);
      res.status(500).json({ error: err?.message || 'Analysis failed' });
    }
  });

  // API 5: Generate AI Candidate Summary with Gemini
  app.post('/api/generate-ai-summary', async (req, res) => {
    try {
      const { candidate, job } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // Safe deterministic response if API key is not yet set
        return res.json({
          summary: `Candidate ${candidate.candidate_name} exhibits ${candidate.match_score}% qualification match for ${job.title}. Proficient in ${candidate.matched_skills.join(', ')} with ${candidate.experience.years} years of work experience. Key gap to probe: ${candidate.missing_skills.join(', ') || 'none'}.`,
          questions: [
            `Can you describe your experience implementing ${candidate.matched_skills[0] || 'core technologies'} in production?`,
            `How do you approach learning and integrating ${candidate.missing_skills[0] || 'new cloud frameworks'}?`,
            `Walk through the technical architecture of your project: ${candidate.projects?.[0]?.name || 'recent engineering work'}.`
          ]
        });
      }

      const prompt = `You are a Senior Technical Recruiter and AI Talent Assessment expert.
Analyze this candidate against the job criteria and provide:
1. A concise, objective 2-3 sentence executive recruiter summary (highlighting matched skills, experience fit, and identified skill gaps).
2. Exactly 3 targeted technical interview questions tailored to verify this candidate's project claims and test their knowledge in missing skills (${candidate.missing_skills.join(', ') || 'core architecture'}).

Job Title: ${job.title}
Job Description: ${job.description}
Candidate Name: ${candidate.candidate_name}
Match Score: ${candidate.match_score}% (${candidate.recommendation})
Matched Skills: ${candidate.matched_skills.join(', ')}
Missing Skills: ${candidate.missing_skills.join(', ')}
Experience: ${candidate.experience.years} years (Required: ${candidate.experience.required_years} years)
Education: ${candidate.education.degree}

Output Format JSON:
{
  "summary": "Executive recruiter assessment text...",
  "questions": ["Question 1", "Question 2", "Question 3"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json({
        summary: parsed.summary || candidate.summary,
        questions: parsed.questions || [
          `Can you describe your experience implementing ${candidate.matched_skills[0] || 'core technologies'}?`,
          `How do you approach learning and integrating ${candidate.missing_skills[0] || 'new frameworks'}?`,
          `Walk through your recent technical project.`
        ]
      });
    } catch (err: any) {
      console.warn('Gemini summary error:', err);
      res.json({
        summary: `${req.body.candidate?.recommendation} candidate (${req.body.candidate?.match_score}%) with strong background in ${req.body.candidate?.matched_skills?.slice(0, 3)?.join(', ')}.`,
        questions: [
          `How do you handle production challenges with ${req.body.candidate?.matched_skills?.[0] || 'your core stack'}?`,
          `What experience do you have with ${req.body.candidate?.missing_skills?.[0] || 'cloud systems'}?`
        ]
      });
    }
  });

  // Vite middleware in development vs Static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Recruitly AI Server listening on port ${PORT}`);
  });
}

startServer();
