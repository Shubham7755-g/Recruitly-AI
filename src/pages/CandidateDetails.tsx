import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Briefcase, 
  GraduationCap, 
  FolderGit2, 
  ShieldAlert, 
  HelpCircle, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  RefreshCw,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  Layers
} from 'lucide-react';
import { Candidate, JobDescription, RecommendationTier } from '../types';
import { api } from '../services/api';

interface CandidateDetailsProps {
  currentJob: JobDescription;
  onUpdateCandidateStatus: (candidateId: string, status: Candidate['status']) => void;
}

export const CandidateDetails: React.FC<CandidateDetailsProps> = ({ 
  currentJob, 
  onUpdateCandidateStatus 
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [showRawResume, setShowRawResume] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      const found = await api.getCandidateById(id);
      setCandidate(found);
      setLoading(false);
    }
    loadData();
  }, [id]);

  const handleGenerateAI = async () => {
    if (!candidate) return;
    setGeneratingSummary(true);
    try {
      const result = await api.generateAISummary(candidate, currentJob);
      setCandidate({
        ...candidate,
        summary: result.summary,
        interview_questions: result.questions,
        ai_generated_summary: true,
      });
    } catch (e) {
      console.error('Failed to generate AI summary:', e);
    } finally {
      setGeneratingSummary(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-[#C5A059]" />
        <p className="text-sm font-medium text-zinc-400">Loading candidate evaluation profile...</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-[#151515] p-12 text-center space-y-4">
        <ShieldAlert className="mx-auto h-10 w-10 text-amber-500" />
        <h2 className="text-lg font-bold text-zinc-200">Candidate Not Found</h2>
        <p className="text-xs text-zinc-400">The requested candidate profile ID could not be located in the current screening pool.</p>
        <Link
          to="/candidates"
          className="inline-flex items-center gap-2 rounded-lg bg-[#C5A059] px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-[#D4AF37] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Candidate Rankings</span>
        </Link>
      </div>
    );
  }

  const getScoreBadgeClass = (score: number) => {
    if (score >= 90) return 'text-emerald-300 bg-emerald-950/50 border-emerald-800/60';
    if (score >= 80) return 'text-[#E5C07B] bg-[#C5A059]/15 border-[#C5A059]/40';
    if (score >= 70) return 'text-indigo-300 bg-indigo-950/50 border-indigo-800/60';
    if (score >= 60) return 'text-amber-300 bg-amber-950/50 border-amber-800/60';
    return 'text-rose-300 bg-rose-950/50 border-rose-800/60';
  };

  const getRecBadgeClass = (rec: RecommendationTier) => {
    switch (rec) {
      case 'Excellent Match':
        return 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60';
      case 'Strong Match':
        return 'bg-[#C5A059]/15 text-[#E5C07B] border-[#C5A059]/40';
      case 'Good Match':
        return 'bg-indigo-950/50 text-indigo-300 border-indigo-800/60';
      case 'Moderate Match':
        return 'bg-amber-950/50 text-amber-300 border-amber-800/60';
      default:
        return 'bg-rose-950/50 text-rose-300 border-rose-800/60';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back Link */}
      <button
        onClick={() => navigate('/candidates')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Candidate Rankings</span>
      </button>

      {/* Main Profile Header Card */}
      <div className="rounded-2xl border border-zinc-800 bg-[#151515] p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-800">
          {/* Left: Avatar & Candidate Info */}
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#C5A059] to-[#997938] text-xl font-extrabold text-zinc-950 shadow-md">
              {candidate.candidate_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">
                  {candidate.candidate_name}
                </h1>
                <span className="rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 px-2.5 py-0.5 text-xs font-bold text-[#E5C07B]">
                  Rank #{candidate.rank}
                </span>
                <span className={`rounded-full px-3 py-0.5 text-xs font-semibold border ${getRecBadgeClass(candidate.recommendation)}`}>
                  {candidate.recommendation}
                </span>
              </div>

              {/* Contact Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1">
                {candidate.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{candidate.email}</span>
                  </div>
                )}
                {candidate.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{candidate.phone}</span>
                  </div>
                )}
                {candidate.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{candidate.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-zinc-500">
                  <FileText className="h-3.5 w-3.5" />
                  <span>{candidate.resume_filename}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Score Gauge & Status Actions */}
          <div className="flex items-center gap-6 self-start md:self-auto">
            {/* Score Big Display */}
            <div className="text-center">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Match Score
              </div>
              <div className={`mt-1 inline-flex items-baseline px-4 py-1.5 rounded-2xl border text-3xl font-extrabold shadow-xs ${getScoreBadgeClass(candidate.match_score)}`}>
                {candidate.match_score}
                <span className="text-sm font-semibold ml-0.5">%</span>
              </div>
            </div>

            {/* Recruiter Status Action */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Recruiter Decision
              </label>
              <select
                value={candidate.status || 'Screened'}
                onChange={(e) => {
                  const newStatus = e.target.value as any;
                  onUpdateCandidateStatus(candidate.candidate_id, newStatus);
                  setCandidate({ ...candidate, status: newStatus });
                }}
                className="rounded-lg border border-zinc-800 bg-[#0C0C0C] px-3 py-1.5 text-xs font-semibold text-zinc-200 shadow-xs focus:border-[#C5A059] focus:outline-hidden"
              >
                <option value="Screened">Status: Screened</option>
                <option value="Shortlisted">Status: Shortlisted</option>
                <option value="Interview">Status: Interviewing</option>
                <option value="Rejected">Status: Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI Candidate Summary Card */}
        <div className="rounded-xl border border-[#C5A059]/30 bg-gradient-to-br from-[#C5A059]/10 via-[#151515] to-[#0C0C0C] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#E5C07B] font-bold text-sm">
              <Sparkles className="h-4 w-4 text-[#C5A059]" />
              <span>AI Candidate Assessment Summary</span>
              {candidate.ai_generated_summary && (
                <span className="rounded-md bg-[#C5A059]/20 border border-[#C5A059]/40 px-2 py-0.5 text-[10px] font-semibold text-[#E5C07B]">
                  Gemini Enhanced
                </span>
              )}
            </div>

            <button
              onClick={handleGenerateAI}
              disabled={generatingSummary}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#C5A059]/40 bg-[#0C0C0C] px-3 py-1.5 text-xs font-semibold text-[#E5C07B] shadow-2xs hover:bg-[#C5A059]/15 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${generatingSummary ? 'animate-spin text-[#C5A059]' : ''}`} />
              <span>{generatingSummary ? 'Analyzing with Gemini...' : 'Regenerate with Gemini AI'}</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
            {candidate.summary}
          </p>

          <div className="pt-2 text-[11px] text-zinc-500 flex items-center gap-1">
            <ShieldAlert className="h-3 w-3 text-zinc-500" />
            <span>AI explanation layer grounded on candidate resume text and job specifications.</span>
          </div>
        </div>
      </div>

      {/* 2-Column Evaluation Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: 5-Pillar Score Breakdown & Skills (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Explainable Score Breakdown Card */}
          <div className="rounded-xl border border-zinc-800 bg-[#151515] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#C5A059]" />
                <h2 className="text-base font-semibold text-zinc-100">Explainable Score Breakdown</h2>
              </div>
              <span className="text-xs font-bold text-zinc-200">
                {candidate.score_breakdown.total} / 100 pts
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* 1. Skill Match (40%) */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-zinc-300">Skill Match (40% Weight)</span>
                  <span className="font-bold text-zinc-100">{candidate.score_breakdown.skills} / 40 pts</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div 
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${(candidate.score_breakdown.skills / 40) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-zinc-500">
                  Matches {candidate.matched_skills.length} of {candidate.matched_skills.length + candidate.missing_skills.length} required skill sets.
                </p>
              </div>

              {/* 2. Semantic Similarity (30%) */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-zinc-300">Semantic & NLP Similarity (30% Weight)</span>
                  <span className="font-bold text-zinc-100">{candidate.score_breakdown.semantic_similarity} / 30 pts</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div 
                    className="h-full rounded-full bg-[#C5A059]"
                    style={{ width: `${(candidate.score_breakdown.semantic_similarity / 30) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-zinc-500">
                  TF-IDF vector cosine overlap against job description responsibilities.
                </p>
              </div>

              {/* 3. Experience (15%) */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-zinc-300">Experience Alignment (15% Weight)</span>
                  <span className="font-bold text-zinc-100">{candidate.score_breakdown.experience} / 15 pts</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div 
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${(candidate.score_breakdown.experience / 15) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-zinc-500">
                  Candidate has {candidate.experience.years} yrs vs {candidate.experience.required_years} yrs required.
                </p>
              </div>

              {/* 4. Education (10%) */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-zinc-300">Education & Degree (10% Weight)</span>
                  <span className="font-bold text-zinc-100">{candidate.score_breakdown.education} / 10 pts</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div 
                    className="h-full rounded-full bg-purple-500"
                    style={{ width: `${(candidate.score_breakdown.education / 10) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-zinc-500">
                  Detected qualification: {candidate.education.degree}.
                </p>
              </div>

              {/* 5. Projects (5%) */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-zinc-300">Projects & Portfolio (5% Weight)</span>
                  <span className="font-bold text-zinc-100">{candidate.score_breakdown.projects} / 5 pts</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div 
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${(candidate.score_breakdown.projects / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Skill Analysis Details */}
          <div className="rounded-xl border border-zinc-800 bg-[#151515] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <Award className="h-4 w-4 text-[#C5A059]" />
              <h2 className="text-base font-semibold text-zinc-100">Skill Taxonomy & Gap Analysis</h2>
            </div>

            {/* Matched Skills */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Matched Required Skills ({candidate.matched_skills.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {candidate.matched_skills.length === 0 ? (
                  <span className="text-xs text-zinc-500 italic">No direct required skills detected</span>
                ) : (
                  candidate.matched_skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg bg-emerald-950/40 px-2.5 py-1 text-xs font-semibold text-emerald-300 border border-emerald-800/60"
                    >
                      ✓ {skill}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                <XCircle className="h-4 w-4 text-rose-400" />
                <span>Missing Required Skills ({candidate.missing_skills.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {candidate.missing_skills.length === 0 ? (
                  <span className="text-xs text-emerald-400 font-medium">✓ No skill gaps! Candidate satisfies 100% of required technical stack.</span>
                ) : (
                  candidate.missing_skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg bg-rose-950/40 px-2.5 py-1 text-xs font-semibold text-rose-300 border border-rose-800/60"
                    >
                      ✗ {skill}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Additional Detected Skills */}
            {candidate.additional_skills.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div className="text-xs font-bold text-zinc-400">
                  Additional Detected Competencies ({candidate.additional_skills.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.additional_skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg bg-zinc-800/80 px-2.5 py-1 text-xs font-medium text-zinc-300 border border-zinc-700/50"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Extracted Projects */}
          <div className="rounded-xl border border-zinc-800 bg-[#151515] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <FolderGit2 className="h-4 w-4 text-[#C5A059]" />
              <h2 className="text-base font-semibold text-zinc-100">Extracted Project Portfolios</h2>
            </div>

            <div className="space-y-3">
              {candidate.projects.map((proj, idx) => (
                <div key={idx} className="rounded-lg border border-zinc-800 bg-[#0C0C0C] p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs sm:text-sm text-zinc-100">{proj.name}</h3>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      proj.relevance === 'High' ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/60' : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    }`}>
                      {proj.relevance} Relevance
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{proj.description}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {proj.technologies.map((t) => (
                      <span key={t} className="rounded bg-[#C5A059]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#E5C07B] border border-[#C5A059]/30">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Experience, Education, Strengths & Interview Questions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Experience & Education Cards */}
          <div className="rounded-xl border border-zinc-800 bg-[#151515] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <Briefcase className="h-4 w-4 text-[#C5A059]" />
              <h2 className="text-base font-semibold text-zinc-100">Experience & Tenure</h2>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Candidate Experience:</span>
                <strong className="font-bold text-zinc-100">{candidate.experience.years} Years</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Job Requirement:</span>
                <span className="text-zinc-200 font-semibold">{candidate.experience.required_years} Years</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-400">Requirement Status:</span>
                <span className={`font-bold ${candidate.experience.meets_requirement ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {candidate.experience.meets_requirement ? '✓ Satisfies Requirement' : 'Below Desired Target'}
                </span>
              </div>

              {candidate.experience.roles && candidate.experience.roles.length > 0 && (
                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Detected Roles & Titles
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {candidate.experience.roles.map((r) => (
                      <span key={r} className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-300 font-medium border border-zinc-700">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Education Sub-section */}
            <div className="pt-4 border-t border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-zinc-100 pb-1">
                <GraduationCap className="h-4 w-4 text-[#C5A059]" />
                <span>Education Background</span>
              </div>
              <div className="rounded-lg bg-[#0C0C0C] border border-zinc-800 p-3 space-y-1">
                <div className="font-bold text-zinc-100">{candidate.education.degree}</div>
                {candidate.education.institution && (
                  <div className="text-zinc-400">{candidate.education.institution}</div>
                )}
                {candidate.education.graduation_year && (
                  <div className="text-zinc-500 text-[10px]">Graduation: {candidate.education.graduation_year}</div>
                )}
              </div>
            </div>
          </div>

          {/* Strengths and Weaknesses */}
          <div className="rounded-xl border border-zinc-800 bg-[#151515] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <TrendingUp className="h-4 w-4 text-[#C5A059]" />
              <h2 className="text-base font-semibold text-zinc-100">Strengths & Potential Gaps</h2>
            </div>

            {/* Strengths */}
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                <ThumbsUp className="h-3.5 w-3.5 text-emerald-400" />
                <span>Key Candidate Strengths</span>
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {candidate.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 bg-emerald-950/30 p-2 rounded-lg border border-emerald-800/50">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses / Gaps */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                <ThumbsDown className="h-3.5 w-3.5 text-amber-400" />
                <span>Identified Evaluation Gaps</span>
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {candidate.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 bg-amber-950/30 p-2 rounded-lg border border-amber-800/50">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggested Technical Interview Questions */}
          <div className="rounded-xl border border-zinc-800 bg-[#151515] p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <HelpCircle className="h-4 w-4 text-[#C5A059]" />
              <h2 className="text-base font-semibold text-zinc-100">Suggested Interview Questions</h2>
            </div>
            <p className="text-xs text-zinc-400">
              Generated to probe candidate's skill gaps and verify production project claims:
            </p>
            <ul className="space-y-2 text-xs text-zinc-300">
              {(candidate.interview_questions || [
                `Can you describe your day-to-day architecture with ${candidate.matched_skills[0] || 'core tools'}?`,
                `How do you handle testing and error recovery in ${candidate.matched_skills[1] || 'backend pipelines'}?`,
                `What is your learning plan for ${candidate.missing_skills[0] || 'the rest of the job stack'}?`
              ]).map((q, idx) => (
                <li key={idx} className="rounded-lg bg-[#0C0C0C] p-2.5 border border-zinc-800 font-medium text-zinc-200">
                  <span className="font-bold text-[#C5A059] mr-1.5">Q{idx + 1}:</span>
                  {q}
                </li>
              ))}
            </ul>
          </div>

          {/* Raw Resume Text Toggle */}
          <div className="rounded-xl border border-zinc-800 bg-[#151515] p-4 shadow-xs">
            <button
              onClick={() => setShowRawResume(!showRawResume)}
              className="w-full flex items-center justify-between text-xs font-semibold text-zinc-300 hover:text-[#C5A059] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-zinc-500" />
                <span>{showRawResume ? 'Hide Raw Resume Text' : 'View Extracted Resume Text'}</span>
              </div>
              <span className="text-[10px] text-zinc-500">Click to expand</span>
            </button>

            {showRawResume && (
              <div className="mt-3 max-h-64 overflow-y-auto rounded-lg bg-[#080808] border border-zinc-800 p-3 font-mono text-[11px] text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {candidate.resume_text || 'No raw text stored.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
