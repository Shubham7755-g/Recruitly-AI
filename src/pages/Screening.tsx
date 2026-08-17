import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  Sparkles, 
  Briefcase, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  FileCheck,
  Plus,
  X,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { JobDescription } from '../types';
import { api } from '../services/api';
import { SAMPLE_JOBS, SAMPLE_RESUME_TEXTS } from '../data/mockData';

interface ScreeningProps {
  currentJob: JobDescription;
  onJobUpdate: (job: JobDescription) => void;
  onAnalysisComplete: () => void;
}

interface UploadedFileItem {
  id: string;
  file?: File;
  name: string;
  size: number;
  type: string;
  text?: string;
  status: 'ready' | 'processing' | 'error';
  errorMsg?: string;
}

export const Screening: React.FC<ScreeningProps> = ({ 
  currentJob, 
  onJobUpdate, 
  onAnalysisComplete 
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [jobTitle, setJobTitle] = useState(currentJob.title);
  const [jobDescription, setJobDescription] = useState(currentJob.description);
  const [requiredExperience, setRequiredExperience] = useState(currentJob.required_experience);
  const [requiredEducation, setRequiredEducation] = useState(currentJob.required_education);
  const [skillsList, setSkillsList] = useState<string[]>(currentJob.required_skills);
  const [skillInput, setSkillInput] = useState('');

  // Uploaded Files State
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load a pre-set job template
  const handleSelectJobPreset = (job: JobDescription) => {
    setJobTitle(job.title);
    setJobDescription(job.description);
    setRequiredExperience(job.required_experience);
    setRequiredEducation(job.required_education);
    setSkillsList(job.required_skills);
  };

  // Add skill tag
  const handleAddSkill = () => {
    if (skillInput.trim() && !skillsList.includes(skillInput.trim())) {
      setSkillsList([...skillsList, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkillsList(skillsList.filter(s => s !== skillToRemove));
  };

  // Process selected native files
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    const validFiles: UploadedFileItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const ext = f.name.split('.').pop()?.toLowerCase();
      
      if (ext !== 'pdf' && ext !== 'docx' && ext !== 'txt') {
        setErrorMessage(`Unsupported file format: ${f.name}. Only PDF, DOCX, and TXT are supported.`);
        continue;
      }

      if (f.size > 15 * 1024 * 1024) {
        setErrorMessage(`File ${f.name} exceeds the 15MB limit.`);
        continue;
      }

      // Do not parse PDF/DOCX in the browser. The backend receives the
      // original file bytes and performs the authoritative extraction.
      // This removes the fragile pdf.js worker/CDN dependency entirely.
      let previewText = '';
      if (ext === 'txt') {
        try {
          previewText = await f.text();
        } catch {
          previewText = '';
        }
      }

      validFiles.push({
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        file: f,
        name: f.name,
        size: f.size,
        type: ext.toUpperCase(),
        text: previewText,
        status: 'ready',
      });
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  // Load sample resumes for 1-click test screening
  const handleLoadSampleResumes = () => {
    const samples: UploadedFileItem[] = SAMPLE_RESUME_TEXTS.map((sample, idx) => ({
      id: `sample_${idx}_${Date.now()}`,
      name: sample.filename,
      size: 48 * 1024 + idx * 8192,
      type: sample.filename.endsWith('.docx') ? 'DOCX' : 'PDF',
      text: sample.text,
      status: 'ready',
    }));

    setUploadedFiles(samples);
    setErrorMessage(null);
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  // Master Analyze Action
  const handleAnalyze = async () => {
    setErrorMessage(null);

    if (!jobTitle.trim()) {
      setErrorMessage('Please specify a Job Title.');
      return;
    }

    if (!jobDescription.trim() || jobDescription.trim().length < 20) {
      setErrorMessage('Please provide a complete Job Description (at least 20 characters).');
      return;
    }

    if (uploadedFiles.length === 0) {
      setErrorMessage('Please upload or load at least one candidate resume.');
      return;
    }

    // Keep EVERY uploaded file. Do not drop files just because browser-side
    // PDF extraction failed. The actual file is now sent to the backend,
    // where PyMuPDF/pypdf can parse it reliably.
    const analyzableFiles = uploadedFiles.filter((f) => f.file || f.text);

    if (analyzableFiles.length === 0) {
      setErrorMessage(
        'No usable resumes found. Please upload at least one PDF, DOCX, or TXT file.'
      );
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(15);
    setAnalysisStep('Parsing resumes & extracting candidate information...');

    const activeJob: JobDescription = {
      id: `job_${Date.now()}`,
      title: jobTitle,
      description: jobDescription,
      required_experience: Number(requiredExperience) || 0,
      required_education: requiredEducation,
      required_skills: skillsList,
      created_at: new Date().toISOString(),
    };

    onJobUpdate(activeJob);

    try {
      setAnalysisProgress(35);
      setAnalysisStep('Extracting candidate skills, experience, and educational background...');
      await new Promise((resolve) => setTimeout(resolve, 500));

      setAnalysisProgress(65);
      setAnalysisStep('Calculating cosine semantic similarity and scoring candidate matches...');
      await new Promise((resolve) => setTimeout(resolve, 500));

      const filesPayload = analyzableFiles.map((f) => ({
        filename: f.name,
        text: f.text || '',
        file: f.file,
      }));

      const result = await api.analyzeResumes(activeJob, filesPayload);

      setAnalysisProgress(100);
      setAnalysisStep(
        `Ranked ${result.candidates.length} candidates & generated explainable match breakdowns.`
      );

      await new Promise((resolve) => setTimeout(resolve, 400));

      setIsAnalyzing(false);
      onAnalysisComplete();
      navigate('/candidates');
    } catch (err: any) {
      console.error('[Screening] Analysis failed:', err);
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      setAnalysisStep('');
      setErrorMessage(
        err?.message ||
          'Failed to analyze candidate resumes. Please try again.'
      );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
            Resume Screening & AI Matching
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Specify job requirements and upload PDF/DOCX resumes to trigger automated ranking and skill-gap breakdown.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:inline">
            Presets:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_JOBS.map(job => (
              <button
                key={job.id}
                type="button"
                onClick={() => handleSelectJobPreset(job)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors cursor-pointer ${
                  jobTitle === job.title
                    ? 'bg-[#C5A059] text-zinc-950 border-[#C5A059] font-bold shadow-xs'
                    : 'bg-[#151515] text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                {job.title.split(' ')[0]} {job.title.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="rounded-xl border border-rose-900/60 bg-rose-950/40 p-4 text-sm text-rose-300 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
          <button 
            onClick={() => setErrorMessage(null)} 
            className="text-rose-400 hover:text-rose-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Grid: Left Column Job Info, Right Column Resume Upload */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Form: Job Information (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-[#151515] p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <Briefcase className="h-4 w-4 text-[#C5A059]" />
              <h2 className="text-base font-semibold text-zinc-100">Job Information & Criteria</h2>
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Job Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Machine Learning Engineer"
                className="w-full rounded-lg border border-zinc-800 bg-[#0C0C0C] px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 focus:outline-hidden"
              />
            </div>

            {/* Experience and Education in Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Required Experience (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={requiredExperience}
                  onChange={(e) => setRequiredExperience(Number(e.target.value))}
                  className="w-full rounded-lg border border-zinc-800 bg-[#0C0C0C] px-3.5 py-2 text-sm text-zinc-100 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Required Education
                </label>
                <input
                  type="text"
                  value={requiredEducation}
                  onChange={(e) => setRequiredEducation(e.target.value)}
                  placeholder="e.g. Bachelor's in CS / Engineering"
                  className="w-full rounded-lg border border-zinc-800 bg-[#0C0C0C] px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Required Skills Tag Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Required Technical Skills (for 40% Skill Matching Weight)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                  placeholder="Add skill (e.g. PyTorch, Docker, SQL)..."
                  className="flex-1 rounded-lg border border-zinc-800 bg-[#0C0C0C] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="rounded-lg bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Skills Chips */}
              <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-lg bg-[#0C0C0C] border border-zinc-800">
                {skillsList.length === 0 ? (
                  <span className="text-xs text-zinc-600 italic">No explicit skills added. Will extract automatically from description.</span>
                ) : (
                  skillsList.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 rounded-md bg-[#C5A059]/15 px-2 py-1 text-xs font-medium text-[#E5C07B] border border-[#C5A059]/30"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-[#C5A059] hover:text-[#E5C07B]"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Job Description Textarea */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Full Job Description <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={7}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description, responsibilities, and qualifications..."
                className="w-full rounded-lg border border-zinc-800 bg-[#0C0C0C] p-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 focus:outline-hidden font-normal leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Resume Upload & Batch Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-[#151515] p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-[#C5A059]" />
                <h2 className="text-base font-semibold text-zinc-100">Upload Candidate Resumes</h2>
              </div>
              <span className="text-xs font-semibold text-zinc-400">
                {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#C5A059] bg-[#C5A059]/10'
                  : 'border-zinc-800 bg-[#0C0C0C] hover:bg-zinc-900/50 hover:border-zinc-700'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.txt"
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />
              <div className="rounded-full bg-[#151515] border border-zinc-800 p-3 text-[#C5A059] mb-3">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-zinc-200">
                Click or drag & drop candidate resumes
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Supports PDF & DOCX (up to 15MB each)
              </p>
            </div>

            {/* Quick 1-Click Preset Load */}
            <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs">
              <div className="flex items-center gap-2 text-zinc-300 font-medium">
                <FolderOpen className="h-4 w-4 text-[#C5A059] shrink-0" />
                <span>Need test data for demonstration?</span>
              </div>
              <button
                type="button"
                onClick={handleLoadSampleResumes}
                className="rounded-md bg-[#C5A059] px-2.5 py-1 text-xs font-bold text-zinc-950 hover:bg-[#D4AF37] transition-colors shrink-0 shadow-xs cursor-pointer"
              >
                Load 5 Samples
              </button>
            </div>

            {/* Uploaded File List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {uploadedFiles.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-500">
                  No files added yet. Upload PDF/DOCX resumes or load the sample set.
                </div>
              ) : (
                uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-[#0C0C0C] p-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`rounded p-1 font-bold text-[10px] border ${
                        file.type === 'PDF' ? 'bg-rose-950/50 text-rose-300 border-rose-800/50' : 'bg-sky-950/50 text-sky-300 border-sky-800/50'
                      }`}>
                        {file.type}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-zinc-200 truncate max-w-[180px] sm:max-w-[220px]">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-zinc-500">
                          {formatFileSize(file.size)} • {file.status === 'ready' ? 'Ready to analyze' : 'Processing'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.id)}
                      className="rounded p-1 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Processing Progress Bar */}
            {isAnalyzing && (
              <div className="rounded-xl border border-[#C5A059]/40 bg-[#C5A059]/10 p-4 space-y-2 animate-pulse">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-200">
                  <div className="flex items-center gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#C5A059]" />
                    <span>{analysisStep}</span>
                  </div>
                  <span className="text-[#E5C07B]">{analysisProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-900 border border-zinc-800">
                  <div
                    className="h-full bg-[#C5A059] transition-all duration-300 rounded-full"
                    style={{ width: `${analysisProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Big Analyze Candidates Action Button */}
            <button
              type="button"
              disabled={isAnalyzing || uploadedFiles.length === 0}
              onClick={handleAnalyze}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold shadow-md transition-all cursor-pointer ${
                isAnalyzing || uploadedFiles.length === 0
                  ? 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed shadow-none'
                  : 'bg-[#C5A059] text-zinc-950 hover:bg-[#D4AF37] shadow-lg shadow-[#C5A059]/10'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Processing Candidate Resumes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-zinc-950" />
                  <span>Analyze & Rank Candidates ({uploadedFiles.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
