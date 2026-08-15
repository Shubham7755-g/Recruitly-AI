import React from 'react';
import { 
  Briefcase, 
  Sparkles, 
  Bell, 
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { JobDescription } from '../../types';

interface NavbarProps {
  currentJob: JobDescription;
  candidateCount: number;
  onOpenQuickScreen?: () => void;
  onExportCSV?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentJob, 
  candidateCount,
  onExportCSV 
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-800 bg-[#0C0C0C]/90 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Active Screening Context */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-[#151515] px-3 py-1.5 text-xs font-semibold text-[#C5A059] border border-[#C5A059]/30">
          <Briefcase className="h-3.5 w-3.5 text-[#C5A059]" />
          <span className="max-w-[200px] sm:max-w-[320px] truncate text-zinc-300">
            Active Job: <strong className="font-bold text-[#E5C07B]">{currentJob.title}</strong>
          </span>
        </div>
        <span className="hidden sm:inline-flex items-center rounded-full bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
          {candidateCount} Ranked Candidates
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onExportCSV && (
          <button
            onClick={onExportCSV}
            className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#151515] px-3 py-1.5 text-xs font-medium text-zinc-300 shadow-xs hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer"
            title="Export CSV Results"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        )}

        <div className="hidden lg:flex items-center gap-1.5 text-xs bg-emerald-950/40 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-800/50 font-medium">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span>ML Matching Active</span>
        </div>

        {/* Notifications & Recruiter Info */}
        <div className="flex items-center gap-2 border-l border-zinc-800 pl-3">
          <button 
            className="relative rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#C5A059]" />
          </button>

          <button
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            aria-label="Documentation & Help"
            title="System Documentation & Grading Viva Notes"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 pl-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-[#C5A059] to-[#8C6D2B] text-xs font-bold text-zinc-950 shadow-xs">
              HR
            </div>
            <div className="hidden xl:block text-left text-xs">
              <div className="font-semibold text-zinc-200">Recruiter Lead</div>
              <div className="text-[11px] text-zinc-500">Talent Acquisition</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
