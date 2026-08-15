import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Target, 
  Award, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp,
  FileSearch,
  Sliders
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { Candidate, JobDescription } from '../types';
import { api } from '../services/api';

interface DashboardProps {
  currentJob: JobDescription;
  candidates: Candidate[];
  onRefresh?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentJob, candidates }) => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(api.calculateAnalytics(candidates));

  useEffect(() => {
    setAnalytics(api.calculateAnalytics(candidates));
  }, [candidates]);

  // Recommendation Badge Color Helper
  const getBadgeClass = (rec: string) => {
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 bg-emerald-950/50 border-emerald-800/60';
    if (score >= 80) return 'text-[#E5C07B] bg-[#C5A059]/15 border-[#C5A059]/40';
    if (score >= 70) return 'text-indigo-300 bg-indigo-950/50 border-indigo-800/60';
    if (score >= 60) return 'text-amber-300 bg-amber-950/50 border-amber-800/60';
    return 'text-rose-300 bg-rose-950/50 border-rose-800/60';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0C0C0C] via-[#151515] to-[#0C0C0C] border border-zinc-800 p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#C5A059]/15 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-2 text-[#E5C07B] border border-[#C5A059]/30">
              <Sparkles className="h-3.5 w-3.5 text-[#C5A059]" />
              <span>AI & ML-Powered Candidate Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
              Recruiter Screening Dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-400 max-w-2xl">
              Screen multiple PDF & DOCX resumes against job descriptions with explainable ML matching, semantic similarity, and automated skill-gap analysis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/screening"
              className="inline-flex items-center gap-2 rounded-xl bg-[#C5A059] px-4 py-2.5 text-sm font-bold text-zinc-950 shadow-sm hover:bg-[#D4AF37] transition-colors"
            >
              <FileSearch className="h-4 w-4" />
              <span>Screen New Resumes</span>
            </Link>
            <Link
              to="/candidates"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900/80 px-4 py-2.5 text-sm font-semibold text-zinc-200 backdrop-blur-md hover:bg-zinc-800 transition-colors border border-zinc-700"
            >
              <Users className="h-4 w-4" />
              <span>View All Rankings</span>
            </Link>
          </div>
        </div>

        {/* Decorative Grid Pattern */}
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-[#C5A059]/10 blur-3xl" />
      </div>

      {/* 4 Primary Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Resumes */}
        <div className="rounded-xl border border-zinc-800 bg-[#151515] p-5 shadow-xs hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Total Resumes
            </span>
            <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-[#C5A059]">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
              {candidates.length}
            </span>
            <span className="text-xs text-zinc-500">files in pool</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>PDF & DOCX supported</span>
          </div>
        </div>

        {/* Candidates Analyzed */}
        <div className="rounded-xl border border-zinc-800 bg-[#151515] p-5 shadow-xs hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Candidates Analyzed
            </span>
            <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-sky-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
              {analytics.total_candidates}
            </span>
            <span className="text-xs text-[#E5C07B] font-medium">100% processed</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400">
            <TrendingUp className="h-3.5 w-3.5 text-sky-400" />
            <span>Ranked by ML matching</span>
          </div>
        </div>

        {/* Average Match Score */}
        <div className="rounded-xl border border-zinc-800 bg-[#151515] p-5 shadow-xs hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Average Match Score
            </span>
            <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-emerald-400">
              <Target className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
              {analytics.avg_score}%
            </span>
            <span className="text-xs text-zinc-500">across cohort</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            <span>Weighted 5-pillar formula</span>
          </div>
        </div>

        {/* Strong Matches */}
        <div className="rounded-xl border border-zinc-800 bg-[#151515] p-5 shadow-xs hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Strong Matches (80%+)
            </span>
            <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-[#E5C07B]">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
              {analytics.strong_matches_count}
            </span>
            <span className="text-xs text-[#E5C07B] font-medium">
              {candidates.length > 0 ? `${Math.round((analytics.strong_matches_count / candidates.length) * 100)}% of pool` : '0%'}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="text-[#E5C07B] font-medium">Ready for interview</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Score Distribution Chart */}
        <div className="rounded-xl border border-zinc-800 bg-[#151515] p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <h2 className="text-base font-semibold text-zinc-100">Candidate Score Distribution</h2>
              <p className="text-xs text-zinc-500">Cohort distribution across standard qualification tiers</p>
            </div>
            <Link to="/analytics" className="text-xs font-medium text-[#C5A059] hover:text-[#E5C07B] flex items-center gap-1">
              <span>Detailed Breakdown</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.score_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#71717A' }} axisLine={{ stroke: '#27272A' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#71717A' }} axisLine={{ stroke: '#27272A' }} />
                <Tooltip
                  cursor={{ fill: '#27272A' }}
                  contentStyle={{ backgroundColor: '#151515', borderRadius: '8px', border: '1px solid #27272A', color: '#D4D4D8', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Candidates" radius={[6, 6, 0, 0]}>
                  {analytics.score_distribution.map((entry, index) => {
                    const colors = ['#10b981', '#C5A059', '#6366f1', '#f59e0b', '#ef4444'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Detected Skills */}
        <div className="rounded-xl border border-zinc-800 bg-[#151515] p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <h2 className="text-base font-semibold text-zinc-100">Top Detected Skills</h2>
              <p className="text-xs text-zinc-500">Most frequent candidate competencies</p>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            {analytics.top_skills.slice(0, 6).map((item, idx) => (
              <div key={item.skill} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-zinc-300">{item.skill}</span>
                  <span className="text-zinc-500">{item.count} resumes</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-900 border border-zinc-800">
                  <div 
                    className="h-full rounded-full bg-[#C5A059]"
                    style={{ width: `${Math.min(100, (item.count / (candidates.length || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Ranked Candidates Table */}
      <div className="rounded-xl border border-zinc-800 bg-[#151515] shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-zinc-800">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">Recent Candidate Rankings</h2>
            <p className="text-xs text-zinc-400">Screened against: <strong className="text-zinc-200">{currentJob.title}</strong></p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/candidates"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              <span>View All ({candidates.length})</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0C0C0C] text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3 text-center">Match Score</th>
                <th className="px-4 py-3">Matched Skills</th>
                <th className="px-4 py-3">Missing Skills</th>
                <th className="px-4 py-3">Experience</th>
                <th className="px-4 py-3">Recommendation</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {candidates.slice(0, 5).map((cand) => (
                <tr key={cand.candidate_id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-zinc-100">
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      cand.rank === 1 ? 'bg-[#C5A059]/20 text-[#E5C07B] border border-[#C5A059]/40' :
                      cand.rank === 2 ? 'bg-zinc-800 text-zinc-300 border border-zinc-700' :
                      cand.rank === 3 ? 'bg-zinc-800/80 text-zinc-400 border border-zinc-700/60' :
                      'bg-zinc-900 text-zinc-500 border border-zinc-800'
                    }`}>
                      #{cand.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-zinc-200">{cand.candidate_name}</div>
                    <div className="text-[11px] text-zinc-500 truncate max-w-[160px]">{cand.email}</div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold border ${getScoreColor(cand.match_score)}`}>
                      {cand.match_score}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {cand.matched_skills.slice(0, 3).map((s) => (
                        <span key={s} className="rounded bg-emerald-950/40 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300 border border-emerald-800/50">
                          {s}
                        </span>
                      ))}
                      {cand.matched_skills.length > 3 && (
                        <span className="text-[10px] text-zinc-500">+{cand.matched_skills.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      {cand.missing_skills.length === 0 ? (
                        <span className="text-[11px] text-emerald-400 font-medium">None (Full Match)</span>
                      ) : (
                        cand.missing_skills.slice(0, 2).map((s) => (
                          <span key={s} className="rounded bg-rose-950/40 px-1.5 py-0.5 text-[10px] font-medium text-rose-300 border border-rose-800/50">
                            {s}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-zinc-200">{cand.experience.years} yrs</div>
                    <div className="text-[10px] text-zinc-500">
                      {cand.experience.meets_requirement ? '✓ Meets Req' : 'Below target'}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border ${getBadgeClass(cand.recommendation)}`}>
                      {cand.recommendation}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => navigate(`/candidates/${cand.candidate_id}`)}
                      className="rounded-lg bg-[#C5A059]/15 px-2.5 py-1 text-xs font-semibold text-[#E5C07B] border border-[#C5A059]/30 hover:bg-[#C5A059]/25 transition-colors cursor-pointer"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
