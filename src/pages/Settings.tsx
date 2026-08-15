import React, { useState } from 'react';
import { 
  Sliders, 
  Sparkles, 
  RotateCcw, 
  Save, 
  Check, 
  AlertTriangle, 
  BookOpen, 
  Plus, 
  Info, 
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { ScoringWeights } from '../types';
import { DEFAULT_WEIGHTS } from '../utils/nlpEngine';
import { SKILL_TAXONOMY, SkillDefinition } from '../utils/skillTaxonomy';
import { api, getSavedWeights } from '../services/api';

interface SettingsProps {
  onWeightsUpdated: (newWeights: ScoringWeights) => void;
}

export const Settings: React.FC<SettingsProps> = ({ onWeightsUpdated }) => {
  const [weights, setWeights] = useState<ScoringWeights>(getSavedWeights());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'weights' | 'taxonomy' | 'about'>('weights');

  // Custom skill addition state
  const [customSkills, setCustomSkills] = useState<SkillDefinition[]>(SKILL_TAXONOMY);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<SkillDefinition['category']>('Languages');

  const totalWeight = 
    Number(weights.skills) + 
    Number(weights.semantic_similarity) + 
    Number(weights.experience) + 
    Number(weights.education) + 
    Number(weights.projects);

  const isTotal100 = totalWeight === 100;

  const handleSaveWeights = () => {
    if (!isTotal100) return;
    api.recalculateScores(weights);
    onWeightsUpdated(weights);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetWeights = () => {
    setWeights(DEFAULT_WEIGHTS);
    api.recalculateScores(DEFAULT_WEIGHTS);
    onWeightsUpdated(DEFAULT_WEIGHTS);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    const exists = customSkills.some(s => s.canonical.toLowerCase() === newSkillName.trim().toLowerCase());
    if (!exists) {
      const added: SkillDefinition = {
        canonical: newSkillName.trim(),
        category: newSkillCategory,
        aliases: [newSkillName.trim().toLowerCase()]
      };
      setCustomSkills([...customSkills, added]);
      setNewSkillName('');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
          System & Scoring Configuration
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Customize explainable scoring weights, inspect NLP skill taxonomies, and manage AI recruitment parameters.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('weights')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'weights'
              ? 'border-[#C5A059] text-[#E5C07B]'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Scoring Algorithm Weights</span>
        </button>

        <button
          onClick={() => setActiveTab('taxonomy')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'taxonomy'
              ? 'border-[#C5A059] text-[#E5C07B]'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Skill Taxonomy Dictionary ({customSkills.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'about'
              ? 'border-[#C5A059] text-[#E5C07B]'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Info className="h-4 w-4" />
          <span>Architecture & Viva Guide</span>
        </button>
      </div>

      {/* Tab 1: Scoring Weights Customizer */}
      {activeTab === 'weights' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-[#151515] p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h2 className="text-base font-semibold text-zinc-100">Customizable 5-Pillar Weights</h2>
                <p className="text-xs text-zinc-400">Adjust the weight of each dimension in the deterministic 0-100 score.</p>
              </div>

              {/* Total Sum Indicator */}
              <div className={`px-3 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${
                isTotal100 
                  ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800' 
                  : 'bg-rose-950/50 text-rose-400 border-rose-800'
              }`}>
                {isTotal100 ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Total: 100% (Valid)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Total: {totalWeight}% (Must equal 100%)</span>
                  </>
                )}
              </div>
            </div>

            {/* Weights Sliders */}
            <div className="space-y-5">
              {/* 1. Skill Match */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-zinc-200">1. Required Skill Match Weight</span>
                  <span className="font-bold text-[#E5C07B]">{weights.skills}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={weights.skills}
                  onChange={(e) => setWeights({ ...weights, skills: Number(e.target.value) })}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
                />
                <p className="text-[11px] text-zinc-400">Direct presence of mandatory hard skills in resume.</p>
              </div>

              {/* 2. Semantic Similarity */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-zinc-200">2. NLP & Semantic Document Similarity Weight</span>
                  <span className="font-bold text-sky-400">{weights.semantic_similarity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={weights.semantic_similarity}
                  onChange={(e) => setWeights({ ...weights, semantic_similarity: Number(e.target.value) })}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <p className="text-[11px] text-zinc-400">TF-IDF and contextual vector cosine similarity with JD text.</p>
              </div>

              {/* 3. Experience */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-zinc-200">3. Years of Experience Weight</span>
                  <span className="font-bold text-[#E5C07B]">{weights.experience}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={weights.experience}
                  onChange={(e) => setWeights({ ...weights, experience: Number(e.target.value) })}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
                />
                <p className="text-[11px] text-zinc-400">Tenure ratio compared to required minimum years.</p>
              </div>

              {/* 4. Education */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-zinc-200">4. Education Level Weight</span>
                  <span className="font-bold text-purple-400">{weights.education}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="5"
                  value={weights.education}
                  onChange={(e) => setWeights({ ...weights, education: Number(e.target.value) })}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <p className="text-[11px] text-zinc-400">Detected degrees (B.Tech, M.S, Ph.D.) meeting criteria.</p>
              </div>

              {/* 5. Projects */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-zinc-200">5. Project Portfolio & Keywords Weight</span>
                  <span className="font-bold text-amber-400">{weights.projects}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="5"
                  value={weights.projects}
                  onChange={(e) => setWeights({ ...weights, projects: Number(e.target.value) })}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <p className="text-[11px] text-zinc-400">Extracted project portfolio depth and relevant keywords.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={handleResetWeights}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset to Default (40/30/15/10/5)</span>
              </button>

              <button
                type="button"
                disabled={!isTotal100}
                onClick={handleSaveWeights}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold shadow-xs transition-colors ${
                  isTotal100
                    ? 'bg-[#C5A059] hover:bg-[#b08e4c] text-black cursor-pointer'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                }`}
              >
                {savedSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Scores Recalculated & Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Apply Weights & Recalculate Pool</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Skill Taxonomy Dictionary */}
      {activeTab === 'taxonomy' && (
        <div className="space-y-6">
          {/* Add custom skill */}
          <div className="rounded-xl border border-zinc-800 bg-[#151515] p-5 shadow-xs">
            <h3 className="text-sm font-bold text-zinc-100 mb-3">Add Custom Keyword to NLP Taxonomy</h3>
            <form onSubmit={handleAddCustomSkill} className="flex flex-wrap gap-2">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="New skill (e.g. Rust, Snowflake, Terraform)..."
                className="flex-1 min-w-[200px] rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-[#C5A059] focus:outline-hidden"
              />
              <select
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value as any)}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200"
              >
                <option value="Languages">Languages</option>
                <option value="Frameworks & Libraries">Frameworks & Libraries</option>
                <option value="Databases">Databases</option>
                <option value="Cloud & DevOps">Cloud & DevOps</option>
                <option value="AI & ML">AI & ML</option>
                <option value="Data Science">Data Science</option>
                <option value="Tools & Methods">Tools & Methods</option>
              </select>
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-lg bg-[#C5A059] hover:bg-[#b08e4c] px-3.5 py-1.5 text-xs font-bold text-black cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Skill</span>
              </button>
            </form>
          </div>

          {/* Categorized Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['Languages', 'Frameworks & Libraries', 'Databases', 'Cloud & DevOps', 'AI & ML', 'Data Science', 'Tools & Methods'].map((category) => {
              const inCat = customSkills.filter(s => s.category === category);
              return (
                <div key={category} className="rounded-xl border border-zinc-800 bg-[#151515] p-4 shadow-xs space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <span className="text-xs font-bold text-zinc-200">{category}</span>
                    <span className="text-[10px] text-zinc-500">{inCat.length} skills</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {inCat.map(skill => (
                      <span
                        key={skill.canonical}
                        className="rounded-md bg-zinc-800/80 border border-zinc-700/50 px-2 py-1 text-[11px] font-medium text-zinc-300"
                      >
                        {skill.canonical}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: About & Capstone Information */}
      {activeTab === 'about' && (
        <div className="rounded-xl border border-zinc-800 bg-[#151515] p-6 shadow-xs space-y-5 text-xs text-zinc-300 leading-relaxed">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <Cpu className="h-5 w-5 text-[#C5A059]" />
            <h2 className="text-base font-bold text-zinc-100">System Architecture & Viva Highlights</h2>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-zinc-200">1. Hybrid Deterministic ML + LLM Explanation Architecture</h3>
            <p className="text-zinc-400">
              Unlike purely prompt-based systems that suffer from hallucination and random score variations, <strong className="text-zinc-200">Recruitly AI</strong> computes candidate match scores using a deterministic 5-pillar mathematical formula (TF-IDF vector cosine similarity, taxonomy skill overlap, regex tenure verification, and educational classification).
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-zinc-200">2. Explainability & Fair Recruitment Standards</h3>
            <p className="text-zinc-400">
              Every score point is traceable to specific text excerpts in the candidate's resume and job requirements. Recruiters can view exactly which skills matched, which critical tools are missing, and inspect the underlying raw text.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-zinc-200">3. Backend & Technology Stack</h3>
            <div className="rounded-lg bg-zinc-900/90 border border-zinc-800 p-3.5 space-y-1 font-mono text-[11px] text-zinc-300">
              <div>• <strong className="text-zinc-100">Frontend:</strong> React 19, Vite, Tailwind CSS, Lucide React, Recharts</div>
              <div>• <strong className="text-zinc-100">Backend:</strong> Express Full-Stack + Standalone Python FastAPI (PyMuPDF, python-docx, Scikit-learn)</div>
              <div>• <strong className="text-zinc-100">AI Layer:</strong> Server-side Gemini 3.7 Flash API for interview question generation and summaries</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
