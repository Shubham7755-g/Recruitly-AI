import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Sparkles, 
  Award,
  ChevronRight,
  SlidersHorizontal,
  X,
  Scale
} from 'lucide-react';
import { Candidate, JobDescription, RecommendationTier } from '../types';
import { api } from '../services/api';

interface CandidatesProps {
  currentJob: JobDescription;
  candidates: Candidate[];
  onUpdateCandidateStatus: (candidateId: string, status: Candidate['status']) => void;
}

export const Candidates: React.FC<CandidatesProps> = ({ 
  currentJob, 
  candidates,
  onUpdateCandidateStatus 
}) => {
  const navigate = useNavigate();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [selectedExp, setSelectedExp] = useState<number | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'rank' | 'score' | 'name' | 'experience'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Candidate comparison selection
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Filter & Search Logic
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      // Search match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        c.candidate_name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.matched_skills.some(s => s.toLowerCase().includes(query)) ||
        c.additional_skills.some(s => s.toLowerCase().includes(query));

      // Tier match
      let matchesTier = true;
      if (selectedTier !== 'ALL') {
        matchesTier = c.recommendation === selectedTier;
      }

      // Experience match
      let matchesExp = true;
      if (selectedExp !== 'ALL') {
        matchesExp = c.experience.years >= Number(selectedExp);
      }

      return matchesSearch && matchesTier && matchesExp;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'rank') {
        comparison = b.match_score - a.match_score;
      } else if (sortBy === 'score') {
        comparison = b.match_score - a.match_score;
      } else if (sortBy === 'name') {
        comparison = a.candidate_name.localeCompare(b.candidate_name);
      } else if (sortBy === 'experience') {
        comparison = b.experience.years - a.experience.years;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [candidates, searchQuery, selectedTier, selectedExp, sortBy, sortOrder]);

  const handleExport = () => {
    api.exportCandidatesCSV(filteredCandidates);
  };

  const toggleCompare = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter(i => i !== id));
    } else {
      if (selectedForCompare.length >= 3) {
        alert('You can compare a maximum of 3 candidates simultaneously.');
        return;
      }
      setSelectedForCompare([...selectedForCompare, id]);
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'text-emerald-300 bg-emerald-950/50 border-emerald-800/60';
    if (score >= 80) return 'text-[#E5C07B] bg-[#C5A059]/15 border-[#C5A059]/40';
    if (score >= 70) return 'text-indigo-300 bg-indigo-950/50 border-indigo-800/60';
    if (score >= 60) return 'text-amber-300 bg-amber-950/50 border-amber-800/60';
    return 'text-rose-300 bg-rose-950/50 border-rose-800/60';
  };

  const getRecommendationBadge = (rec: RecommendationTier) => {
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

  const comparedCandidateObjects = candidates.filter(c => selectedForCompare.includes(c.candidate_id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
            Candidate Ranking & Evaluation
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Ranked candidates for <strong className="text-zinc-200 font-semibold">{currentJob.title}</strong> using deterministic ML and explainable weights.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedForCompare.length > 1 && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#C5A059] px-3.5 py-2 text-xs font-bold text-zinc-950 shadow-xs hover:bg-[#D4AF37] transition-colors cursor-pointer"
            >
              <Scale className="h-4 w-4" />
              <span>Compare Selected ({selectedForCompare.length})</span>
            </button>
          )}

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#151515] px-3.5 py-2 text-xs font-semibold text-zinc-300 shadow-xs hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="rounded-xl border border-zinc-800 bg-[#151515] p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
          {/* Search Input (5 cols) */}
          <div className="relative lg:col-span-5">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate name, email, or skill..."
              className="w-full rounded-lg border border-zinc-800 bg-[#0C0C0C] pl-9 pr-8 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Recommendation Tier Filter (3 cols) */}
          <div className="lg:col-span-3">
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-[#0C0C0C] px-3 py-2 text-xs text-zinc-300 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 focus:outline-hidden"
            >
              <option value="ALL">All Qualification Tiers</option>
              <option value="Excellent Match">Excellent Match (90-100%)</option>
              <option value="Strong Match">Strong Match (80-89%)</option>
              <option value="Good Match">Good Match (70-79%)</option>
              <option value="Moderate Match">Moderate Match (60-69%)</option>
              <option value="Low Match">Low Match (&lt;60%)</option>
            </select>
          </div>

          {/* Experience Filter (2 cols) */}
          <div className="lg:col-span-2">
            <select
              value={selectedExp}
              onChange={(e) => setSelectedExp(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="w-full rounded-lg border border-zinc-800 bg-[#0C0C0C] px-3 py-2 text-xs text-zinc-300 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 focus:outline-hidden"
            >
              <option value="ALL">All Experience</option>
              <option value="1">1+ Years</option>
              <option value="2">2+ Years</option>
              <option value="3">3+ Years</option>
              <option value="5">5+ Years</option>
            </select>
          </div>

          {/* Sort By (2 cols) */}
          <div className="lg:col-span-2 flex gap-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full rounded-lg border border-zinc-800 bg-[#0C0C0C] px-3 py-2 text-xs text-zinc-300 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 focus:outline-hidden"
            >
              <option value="rank">Sort by Rank</option>
              <option value="score">Sort by Score</option>
              <option value="name">Sort by Name</option>
              <option value="experience">Sort by Experience</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="rounded-lg border border-zinc-800 bg-[#0C0C0C] p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors cursor-pointer"
              title={`Toggle sort order (${sortOrder.toUpperCase()})`}
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter Summary Tags */}
        <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
          <div>
            Showing <strong className="text-zinc-200 font-semibold">{filteredCandidates.length}</strong> of {candidates.length} candidates
          </div>
          {(searchQuery || selectedTier !== 'ALL' || selectedExp !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTier('ALL');
                setSelectedExp('ALL');
              }}
              className="text-[#C5A059] hover:text-[#E5C07B] font-medium cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Main Candidates Ranking Table */}
      <div className="rounded-xl border border-zinc-800 bg-[#151515] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0C0C0C] text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3 text-center w-10">Select</th>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3 text-center">Match Score</th>
                <th className="px-4 py-3">Matched Skills</th>
                <th className="px-4 py-3">Missing Skills</th>
                <th className="px-4 py-3">Experience</th>
                <th className="px-4 py-3">Recommendation</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-zinc-500">
                    No candidates match the specified criteria or search query.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((cand) => {
                  const isSelected = selectedForCompare.includes(cand.candidate_id);
                  return (
                    <tr 
                      key={cand.candidate_id} 
                      className={`hover:bg-zinc-900/60 transition-colors ${
                        isSelected ? 'bg-[#C5A059]/10' : ''
                      }`}
                    >
                      {/* Compare Checkbox */}
                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCompare(cand.candidate_id)}
                          className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-[#C5A059] focus:ring-[#C5A059]"
                        />
                      </td>

                      {/* Rank Badge */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                          cand.rank === 1 ? 'bg-[#C5A059]/20 text-[#E5C07B] border border-[#C5A059]/50 ring-1 ring-[#C5A059]/50' :
                          cand.rank === 2 ? 'bg-zinc-800 text-zinc-200 ring-1 ring-zinc-700' :
                          cand.rank === 3 ? 'bg-zinc-800/80 text-zinc-300' :
                          'bg-zinc-900 text-zinc-500 border border-zinc-800'
                        }`}>
                          #{cand.rank}
                        </span>
                      </td>

                      {/* Candidate Name & Info */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-zinc-200 hover:text-[#E5C07B] cursor-pointer" onClick={() => navigate(`/candidates/${cand.candidate_id}`)}>
                          {cand.candidate_name}
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate max-w-[170px]">{cand.email}</div>
                        <div className="text-[10px] text-zinc-500">{cand.education.degree}</div>
                      </td>

                      {/* Match Score */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`rounded-lg px-2.5 py-1 text-xs font-extrabold border ${getScoreBadge(cand.match_score)}`}>
                            {cand.match_score}%
                          </span>
                          <span className="text-[10px] text-zinc-500 mt-0.5">
                            {cand.score_breakdown.skills + cand.score_breakdown.semantic_similarity} pts core
                          </span>
                        </div>
                      </td>

                      {/* Matched Skills */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {cand.matched_skills.slice(0, 4).map((s) => (
                            <span key={s} className="rounded bg-emerald-950/40 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300 border border-emerald-800/60">
                              {s}
                            </span>
                          ))}
                          {cand.matched_skills.length > 4 && (
                            <span className="text-[10px] text-zinc-500">+{cand.matched_skills.length - 4}</span>
                          )}
                        </div>
                      </td>

                      {/* Missing Skills */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[170px]">
                          {cand.missing_skills.length === 0 ? (
                            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>100% Match</span>
                            </span>
                          ) : (
                            cand.missing_skills.slice(0, 2).map((s) => (
                              <span key={s} className="rounded bg-rose-950/40 px-1.5 py-0.5 text-[10px] font-medium text-rose-300 border border-rose-800/60">
                                {s}
                              </span>
                            ))
                          )}
                          {cand.missing_skills.length > 2 && (
                            <span className="text-[10px] text-rose-400">+{cand.missing_skills.length - 2}</span>
                          )}
                        </div>
                      </td>

                      {/* Experience */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-zinc-200">{cand.experience.years} yrs</div>
                        <div className="text-[10px]">
                          {cand.experience.meets_requirement ? (
                            <span className="text-emerald-400 font-medium">Meets req</span>
                          ) : (
                            <span className="text-amber-400 font-medium">&lt; req ({cand.experience.required_years}y)</span>
                          )}
                        </div>
                      </td>

                      {/* Recommendation Tier */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${getRecommendationBadge(cand.recommendation)}`}>
                          {cand.recommendation}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-4 py-3.5">
                        <select
                          value={cand.status || 'Screened'}
                          onChange={(e) => onUpdateCandidateStatus(cand.candidate_id, e.target.value as any)}
                          className="rounded border border-zinc-800 bg-[#0C0C0C] px-2 py-1 text-[11px] font-medium text-zinc-300 focus:border-[#C5A059] focus:outline-hidden"
                        >
                          <option value="Screened">Screened</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Interview">Interview</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => navigate(`/candidates/${cand.candidate_id}`)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#C5A059]/15 px-2.5 py-1.5 text-xs font-semibold text-[#E5C07B] border border-[#C5A059]/30 hover:bg-[#C5A059]/25 transition-colors cursor-pointer"
                        >
                          <span>View</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[#151515] border border-zinc-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-[#C5A059]" />
                <h2 className="text-lg font-bold text-zinc-100">Side-by-Side Candidate Comparison</h2>
              </div>
              <button 
                onClick={() => setShowCompareModal(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comparedCandidateObjects.map(c => (
                <div key={c.candidate_id} className="rounded-xl border border-zinc-800 bg-[#0C0C0C] p-4 space-y-4">
                  <div className="text-center pb-3 border-b border-zinc-800">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-[#C5A059]/20 text-[#E5C07B] border border-[#C5A059]/40 mb-1">
                      Rank #{c.rank}
                    </span>
                    <h3 className="font-bold text-base text-zinc-100">{c.candidate_name}</h3>
                    <div className={`mt-2 text-2xl font-extrabold ${c.match_score >= 80 ? 'text-emerald-400' : 'text-zinc-200'}`}>
                      {c.match_score}%
                    </div>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getRecommendationBadge(c.recommendation)}`}>
                      {c.recommendation}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <strong className="block text-zinc-500 uppercase text-[10px]">Experience</strong>
                      <span className="font-bold text-zinc-200">{c.experience.years} years</span> ({c.experience.meets_requirement ? 'Meets req' : 'Below req'})
                    </div>

                    <div>
                      <strong className="block text-zinc-500 uppercase text-[10px]">Education</strong>
                      <span className="text-zinc-300">{c.education.degree}</span>
                    </div>

                    <div>
                      <strong className="block text-zinc-500 uppercase text-[10px] mb-1">Matched Skills ({c.matched_skills.length})</strong>
                      <div className="flex flex-wrap gap-1">
                        {c.matched_skills.map(s => (
                          <span key={s} className="bg-emerald-950/40 text-emerald-300 border border-emerald-800/50 text-[10px] px-1.5 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <strong className="block text-zinc-500 uppercase text-[10px] mb-1">Missing Skills ({c.missing_skills.length})</strong>
                      <div className="flex flex-wrap gap-1">
                        {c.missing_skills.length === 0 ? (
                          <span className="text-emerald-400 font-medium">None</span>
                        ) : (
                          c.missing_skills.map(s => (
                            <span key={s} className="bg-rose-950/40 text-rose-300 border border-rose-800/50 text-[10px] px-1.5 py-0.5 rounded">
                              {s}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <strong className="block text-zinc-500 uppercase text-[10px]">Key Strength</strong>
                      <p className="text-zinc-300 text-[11px] mt-0.5">{c.strengths[0] || 'Solid domain foundation'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowCompareModal(false);
                      navigate(`/candidates/${c.candidate_id}`);
                    }}
                    className="w-full rounded-lg bg-[#C5A059] py-2 text-xs font-bold text-zinc-950 hover:bg-[#D4AF37] transition-colors cursor-pointer"
                  >
                    View Full Profile
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
