export type RecommendationTier = 
  | 'Excellent Match'
  | 'Strong Match'
  | 'Good Match'
  | 'Moderate Match'
  | 'Low Match';

export interface ScoreBreakdown {
  skills: number;             // Max 40
  semantic_similarity: number;// Max 30
  experience: number;         // Max 15
  education: number;          // Max 10
  projects: number;           // Max 5
  total: number;              // Max 100
}

export interface ExperienceInfo {
  years: number;
  required_years: number;
  meets_requirement: boolean;
  roles?: string[];
  companies?: string[];
  details?: string[];
}

export interface EducationInfo {
  degree: string;
  institution?: string;
  graduation_year?: string | number;
  meets_requirement: boolean;
}

export interface ProjectInfo {
  name: string;
  technologies: string[];
  relevance: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface Candidate {
  candidate_id: string;
  candidate_name: string;
  email: string;
  phone: string;
  location?: string;
  rank: number;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  additional_skills: string[];
  experience: ExperienceInfo;
  education: EducationInfo;
  recommendation: RecommendationTier;
  recommendation_reason: string;
  summary: string;
  ai_generated_summary?: boolean;
  interview_questions?: string[];
  strengths: string[];
  weaknesses: string[];
  projects: ProjectInfo[];
  score_breakdown: ScoreBreakdown;
  resume_filename: string;
  resume_text?: string;
  analyzed_at: string;
  status?: 'Screened' | 'Shortlisted' | 'Interview' | 'Rejected';
}

export interface JobDescription {
  id?: string;
  title: string;
  description: string;
  required_experience: number;
  required_education: string;
  required_skills: string[];
  created_at?: string;
}

export interface AnalysisResponse {
  job: JobDescription;
  candidates: Candidate[];
  analytics: {
    total_candidates: number;
    avg_score: number;
    strong_matches_count: number;
    score_distribution: { range: string; count: number }[];
    top_skills: { skill: string; count: number }[];
    match_categories: { name: string; count: number; color: string }[];
    experience_distribution: { range: string; count: number }[];
  };
}

export interface ScoringWeights {
  skills: number;              // default 40
  semantic_similarity: number; // default 30
  experience: number;          // default 15
  education: number;           // default 10
  projects: number;            // default 5
}
