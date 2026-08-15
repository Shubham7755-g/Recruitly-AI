import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { JobDescription } from '../../types';
import { Menu, ShieldAlert } from 'lucide-react';
import { api, getSavedCandidates } from '../../services/api';

interface LayoutProps {
  currentJob: JobDescription;
  candidateCount: number;
}

export const Layout: React.FC<LayoutProps> = ({ currentJob, candidateCount }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleExport = () => {
    const candidates = getSavedCandidates();
    api.exportCandidatesCSV(candidates);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#D4D4D8] flex">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onCloseMobile={() => setSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Mobile Header Bar with Hamburger */}
        <div className="lg:hidden flex items-center justify-between border-b border-zinc-800 bg-[#0C0C0C] px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-bold text-sm text-zinc-200">Recruitly AI</span>
          <div className="w-8" />
        </div>

        {/* Global Recruiter Navbar */}
        <Navbar 
          currentJob={currentJob} 
          candidateCount={candidateCount} 
          onExportCSV={handleExport}
        />

        {/* Main Routed Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Responsible AI Recruiter Disclaimer Footer */}
        <footer className="mt-auto border-t border-zinc-800/80 bg-[#0C0C0C]/80 px-6 py-4 text-xs text-zinc-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <ShieldAlert className="h-3.5 w-3.5 text-[#C5A059]" />
              <span>
                <strong className="text-zinc-200">Decision-Support Notice:</strong> Recruitly AI provides ML-assisted candidate scoring to help recruiters prioritize reviews. Hiring decisions should always involve human review.
              </span>
            </div>
            <div className="text-zinc-500 text-[11px]">
              FastAPI + React + Deterministic ML/NLP + Gemini AI
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
