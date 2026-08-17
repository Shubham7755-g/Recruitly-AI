import { AnalysisResponse, Candidate, JobDescription, ScoringWeights } from '../types';
import { INITIAL_MOCK_CANDIDATES, SAMPLE_JOBS } from '../data/mockData';
import { DEFAULT_WEIGHTS, rankCandidates, scoreCandidate } from '../utils/nlpEngine';
import mammoth from 'mammoth';

const STORAGE_KEYS = {
  CANDIDATES: 'ai_resumescreen_candidates',
  CURRENT_JOB: 'ai_resumescreen_job',
  WEIGHTS: 'ai_resumescreen_weights',
};

// Client-side text extractors for PDF & DOCX
export async function extractTextFromFile(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop()?.toLowerCase();

  if (fileExt === 'docx') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (err) {
      console.warn('DOCX extraction fallback:', err);
      return await file.text();
    }
  } else if (fileExt === 'pdf') {
    const arrayBuffer = await file.arrayBuffer();

    try {
      // Use the worker bundled with pdfjs-dist instead of a CDN URL.
      // The previous CDN URL pointed at a non-existent worker for
      // pdfjs-dist 6.x, which caused extraction to fail and the code
      // to incorrectly send raw PDF bytes to FastAPI as text.
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();

      let pdf;

      try {
        pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      } catch (workerError) {
        // Safe fallback for environments where Vite cannot load the
        // bundled worker. This keeps extraction local and avoids the
        // broken CDN/fake-worker path.
        console.warn('PDF worker failed; retrying without worker:', workerError);
        pdf = await pdfjs.getDocument({
          data: arrayBuffer,
          disableWorker: true,
        }).promise;
      }

      const pages: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item?.str || '')
          .join(' ');
        pages.push(pageText);
      }

      const fullText = pages.join('\n').trim();

      if (!fullText) {
        throw new Error(
          `No selectable text found in ${file.name}. The PDF may be image-only.`
        );
      }

      return fullText;
    } catch (err) {
      // Never call file.text() for a PDF. A PDF is binary data, so
      // decoding it as UTF-8 produces garbage and breaks candidate
      // extraction downstream.
      console.error(`PDF text extraction failed for ${file.name}:`, err);
      throw new Error(`Could not extract text from ${file.name}. Please use a text-based PDF.`);
    }
  } else {
    // Plain text or markdown
    return await file.text();
  }
}

// Local Storage Helpers
export function getSavedCandidates(): Candidate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load saved candidates:', e);
  }
  // Initialize with rich mock data if empty
  localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(INITIAL_MOCK_CANDIDATES));
  return INITIAL_MOCK_CANDIDATES;
}

export function saveCandidates(candidates: Candidate[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
  } catch (e) {
    console.error('Failed to save candidates:', e);
  }
}

export function getSavedJob(): JobDescription {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_JOB);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load saved job:', e);
  }
  return SAMPLE_JOBS[0];
}

export function saveJob(job: JobDescription): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_JOB, JSON.stringify(job));
  } catch (e) {
    console.error('Failed to save job:', e);
  }
}

export function getSavedWeights(): ScoringWeights {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEIGHTS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load weights:', e);
  }
  return DEFAULT_WEIGHTS;
}

export function saveWeights(weights: ScoringWeights): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WEIGHTS, JSON.stringify(weights));
  } catch (e) {
    console.error('Failed to save weights:', e);
  }
}

// Main API Service Class
export const api = {
  // Health check
  async checkHealth(): Promise<{ status: string }> {
    try {
      const res = await fetch('/api/health');
      if (res.ok) return await res.json();
    } catch {
      // client-side fallback
    }
    return { status: 'healthy (client mode)' };
  },

  // Get current candidate list
  async getCandidates(): Promise<Candidate[]> {
    try {
      const res = await fetch('/api/candidates');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          saveCandidates(data);
          return data;
        }
      }
    } catch {
      // fallback
    }
    return getSavedCandidates();
  },

  // Get candidate by ID
  async getCandidateById(candidateId: string): Promise<Candidate | null> {
    // First use the candidates produced by the latest resume analysis.
    // This prevents old/mock backend data from replacing the real uploaded resume.
    const candidates = getSavedCandidates();

    const localCandidate = candidates.find(
      c => c.candidate_id === candidateId
    );

    if (localCandidate) {
      return localCandidate;
    }

    // Only ask the backend if the candidate isn't available locally.
    try {
      const res = await fetch(`/api/candidates/${candidateId}`);

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Ignore backend failure and return null below.
    }
      
    return null;
  },

  // Analyze uploaded files against a Job Description
  async analyzeResumes(
    job: JobDescription,
    files: { filename: string; text: string; file?: File }[],
    weights?: ScoringWeights
  ): Promise<AnalysisResponse> {
    const activeWeights = weights || getSavedWeights();

    // Attempt Server API first. Real uploaded files are sent as multipart
    // so the backend can parse the ORIGINAL PDF/DOCX bytes. This prevents
    // browser PDF worker failures from silently removing candidates.
    try {
      const hasRealFiles = files.some((item) => item.file instanceof File);
      let res: Response;

      if (hasRealFiles) {
        const form = new FormData();
        form.append('job_title', job.title);
        form.append('job_description', job.description);
        form.append('required_experience', String(job.required_experience));
        form.append('required_education', job.required_education);
        form.append('required_skills', JSON.stringify(job.required_skills));
        form.append('weights', JSON.stringify(activeWeights));

        for (const item of files) {
          if (item.file) {
            form.append('resumes', item.file, item.filename);
          }
        }

        res = await fetch('/api/analyze', {
          method: 'POST',
          body: form,
        });
      } else {
        res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            job_title: job.title,
            job_description: job.description,
            required_experience: job.required_experience,
            required_education: job.required_education,
            required_skills: job.required_skills,
            weights: activeWeights,
            resumes: files.map(({ filename, text }) => ({ filename, text })),
          }),
        });
      }

      if (res.ok) {
        const data: AnalysisResponse = await res.json();
        saveJob(data.job);
        saveCandidates(data.candidates);
        return data;
      }
    } catch (e) {
      console.warn('Server analyze endpoint offline, running deterministic client NLP engine:', e);
    }

    // Client-side ML/NLP fallback execution
    const scoredList: Candidate[] = files.map((f) =>
      scoreCandidate(f.text, f.filename, job, activeWeights)
    );

    const ranked = rankCandidates(scoredList);
    saveJob(job);
    saveCandidates(ranked);

    return {
      job,
      candidates: ranked,
      analytics: api.calculateAnalytics(ranked),
    };
  },

  // Generate AI Summary with Gemini API
  async generateAISummary(candidate: Candidate, job: JobDescription): Promise<{ summary: string; questions: string[] }> {
    try {
      const res = await fetch('/api/generate-ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate, job }),
      });

      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {
      console.warn('AI summary API call failed:', e);
    }

    // High quality fallback summary
    return {
      summary: `AI Screening Assessment: Candidate matches ${candidate.matched_skills.length} core technical requirements (${candidate.matched_skills.slice(0, 3).join(', ')}). With ${candidate.experience.years} years of relevant experience, they present a ${candidate.recommendation.toLowerCase()} profile. Key focus area for interview: evaluate proficiency in ${candidate.missing_skills[0] || 'advanced architecture'}.`,
      questions: [
        `Can you describe your experience implementing ${candidate.matched_skills[0] || 'core technologies'} in production?`,
        `How would you quickly gain proficiency with ${candidate.missing_skills[0] || 'the job stack tools'}?`,
        `Walk us through the technical architecture of your project: ${candidate.projects[0]?.name || 'recent work'}.`
      ]
    };
  },

  // Recalculate candidate scores with new weights
  recalculateScores(weights: ScoringWeights): Candidate[] {
    saveWeights(weights);
    const candidates = getSavedCandidates();
    const job = getSavedJob();

    const updated = candidates.map((cand) => {
      const text = cand.resume_text || `${cand.candidate_name}\n${cand.matched_skills.join(' ')}\n${cand.experience.roles?.join(' ')}`;
      return scoreCandidate(text, cand.resume_filename, job, weights);
    });

    const ranked = rankCandidates(updated);
    saveCandidates(ranked);
    return ranked;
  },

  // Update candidate status (Shortlisted, Interview, Rejected)
  updateCandidateStatus(candidateId: string, status: Candidate['status']): Candidate[] {
    const candidates = getSavedCandidates();
    const updated = candidates.map(c => c.candidate_id === candidateId ? { ...c, status } : c);
    saveCandidates(updated);
    return updated;
  },

  // Calculate comprehensive analytics from candidate pool
  calculateAnalytics(candidates: Candidate[]) {
    const total = candidates.length;
    const avg_score = total > 0 
      ? Math.round(candidates.reduce((sum, c) => sum + c.match_score, 0) / total) 
      : 0;

    const strong_matches_count = candidates.filter(c => c.match_score >= 80).length;

    // Score distribution
    const scoreBuckets = {
      '90-100': 0,
      '80-89': 0,
      '70-79': 0,
      '60-69': 0,
      'Below 60': 0,
    };
    for (const c of candidates) {
      if (c.match_score >= 90) scoreBuckets['90-100']++;
      else if (c.match_score >= 80) scoreBuckets['80-89']++;
      else if (c.match_score >= 70) scoreBuckets['70-79']++;
      else if (c.match_score >= 60) scoreBuckets['60-69']++;
      else scoreBuckets['Below 60']++;
    }

    const score_distribution = Object.entries(scoreBuckets).map(([range, count]) => ({
      range,
      count,
    }));

    // Top detected skills
    const skillCounts: Record<string, number> = {};
    for (const c of candidates) {
      for (const s of c.matched_skills) {
        skillCounts[s] = (skillCounts[s] || 0) + 1;
      }
      for (const s of c.additional_skills) {
        skillCounts[s] = (skillCounts[s] || 0) + 1;
      }
    }
    const top_skills = Object.entries(skillCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Match categories
    const categories = {
      'Excellent Match': { count: 0, color: '#10b981' },
      'Strong Match': { count: 0, color: '#0ea5e9' },
      'Good Match': { count: 0, color: '#6366f1' },
      'Moderate Match': { count: 0, color: '#f59e0b' },
      'Low Match': { count: 0, color: '#ef4444' },
    };
    for (const c of candidates) {
      if (categories[c.recommendation]) {
        categories[c.recommendation].count++;
      }
    }
    const match_categories = Object.entries(categories).map(([name, data]) => ({
      name,
      count: data.count,
      color: data.color,
    }));

    // Experience distribution
    const expBuckets = {
      '0-1 yrs': 0,
      '1-3 yrs': 0,
      '3-5 yrs': 0,
      '5+ yrs': 0,
    };
    for (const c of candidates) {
      const y = c.experience.years;
      if (y <= 1) expBuckets['0-1 yrs']++;
      else if (y <= 3) expBuckets['1-3 yrs']++;
      else if (y <= 5) expBuckets['3-5 yrs']++;
      else expBuckets['5+ yrs']++;
    }
    const experience_distribution = Object.entries(expBuckets).map(([range, count]) => ({
      range,
      count,
    }));

    return {
      total_candidates: total,
      avg_score,
      strong_matches_count,
      score_distribution,
      top_skills,
      match_categories,
      experience_distribution,
    };
  },

  // Export ranking results as CSV
  exportCandidatesCSV(candidates: Candidate[]): void {
    const headers = [
      'Rank',
      'Candidate Name',
      'Match Score',
      'Recommendation',
      'Matched Skills',
      'Missing Skills',
      'Experience (Years)',
      'Meets Experience Req',
      'Education',
      'Email',
      'Phone',
      'Status'
    ];

    const rows = candidates.map(c => [
      c.rank,
      `"${c.candidate_name}"`,
      `${c.match_score}%`,
      `"${c.recommendation}"`,
      `"${c.matched_skills.join(', ')}"`,
      `"${c.missing_skills.join(', ')}"`,
      c.experience.years,
      c.experience.meets_requirement ? 'Yes' : 'No',
      `"${c.education.degree}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
      `"${c.status || 'Screened'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AI_ResumeScreen_Ranking_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
