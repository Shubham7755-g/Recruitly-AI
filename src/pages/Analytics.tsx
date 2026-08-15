import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  CartesianGrid
} from 'recharts';
import { 
  TrendingUp, 
  Award, 
  Users, 
  Target, 
  PieChart as PieIcon, 
  BarChart3, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Candidate, JobDescription } from '../types';
import { api } from '../services/api';

interface AnalyticsProps {
  currentJob: JobDescription;
  candidates: Candidate[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ currentJob, candidates }) => {
  const analytics = useMemo(() => {
    return api.calculateAnalytics(candidates);
  }, [candidates]);

  // Colors for charts
  const TIER_COLORS = ['#10b981', '#C5A059', '#6366f1', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
            Recruitment Cohort Analytics
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Data insights, score distribution, and talent pool skill frequency for <strong className="text-zinc-200 font-semibold">{currentJob.title}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#E5C07B] bg-[#C5A059]/15 px-3 py-1.5 rounded-lg border border-[#C5A059]/30">
          <Sparkles className="h-4 w-4 text-[#C5A059]" />
          <span>Cohort Size: {candidates.length} Applicants</span>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-[#151515] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 uppercase">Average Score</span>
            <Target className="h-4 w-4 text-[#C5A059]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-100">{analytics.avg_score}%</div>
          <p className="mt-1 text-[11px] text-zinc-500">Target benchmark: 75%+</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-[#151515] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 uppercase">Strong Matches (80%+)</span>
            <Award className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">{analytics.strong_matches_count}</div>
          <p className="mt-1 text-[11px] text-zinc-500">
            {candidates.length > 0 ? `${Math.round((analytics.strong_matches_count / candidates.length) * 100)}% of candidate pool` : '0%'}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-[#151515] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 uppercase">Avg Experience</span>
            <TrendingUp className="h-4 w-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-100">
            {candidates.length > 0
              ? (candidates.reduce((sum, c) => sum + c.experience.years, 0) / candidates.length).toFixed(1)
              : 0} yrs
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">Req: {currentJob.required_experience} yrs</p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-[#151515] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400 uppercase">Qualified Pool</span>
            <CheckCircle2 className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-400">
            {candidates.filter(c => c.match_score >= 70).length}
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">Good to Excellent candidates</p>
        </div>
      </div>

      {/* Charts Row 1: Score Distribution & Match Categories */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Score Distribution (7 cols) */}
        <div className="rounded-xl border border-zinc-800 bg-[#151515] p-6 shadow-xs lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#C5A059]" />
              <h2 className="text-base font-semibold text-zinc-100">Score Range Distribution</h2>
            </div>
            <span className="text-xs text-zinc-500">Cohort Spread</span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.score_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid #27272a', color: '#f4f4f5', fontSize: '12px' }}
                  itemStyle={{ color: '#f4f4f5' }}
                />
                <Bar dataKey="count" name="Candidates" radius={[6, 6, 0, 0]}>
                  {analytics.score_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TIER_COLORS[index % TIER_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Match Category Donut (5 cols) */}
        <div className="rounded-xl border border-zinc-800 bg-[#151515] p-6 shadow-xs lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-[#C5A059]" />
              <h2 className="text-base font-semibold text-zinc-100">Match Categories</h2>
            </div>
            <span className="text-xs text-zinc-500">Qualification Ratio</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.match_categories.filter(c => c.count > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="name"
                >
                  {analytics.match_categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color === '#0ea5e9' ? '#C5A059' : entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid #27272a', color: '#f4f4f5', fontSize: '12px' }}
                  itemStyle={{ color: '#f4f4f5' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#a1a1aa' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Skill Frequency & Experience Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Top Detected Skills Frequency (7 cols) */}
        <div className="rounded-xl border border-zinc-800 bg-[#151515] p-6 shadow-xs lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-[#C5A059]" />
              <h2 className="text-base font-semibold text-zinc-100">Skill Frequency in Applicant Pool</h2>
            </div>
            <span className="text-xs text-zinc-500">Top Competencies</span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={analytics.top_skills}
                margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#27272a" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                <YAxis type="category" dataKey="skill" tick={{ fontSize: 11, fill: '#d4d4d8' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid #27272a', color: '#f4f4f5', fontSize: '12px' }}
                  itemStyle={{ color: '#f4f4f5' }}
                />
                <Bar dataKey="count" name="Frequency" fill="#C5A059" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Experience Distribution (5 cols) */}
        <div className="rounded-xl border border-zinc-800 bg-[#151515] p-6 shadow-xs lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#C5A059]" />
              <h2 className="text-base font-semibold text-zinc-100">Experience Distribution</h2>
            </div>
            <span className="text-xs text-zinc-500">Years of Tenure</span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.experience_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid #27272a', color: '#f4f4f5', fontSize: '12px' }}
                  itemStyle={{ color: '#f4f4f5' }}
                />
                <Bar dataKey="count" name="Candidates" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
