import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Screening } from './pages/Screening';
import { Candidates } from './pages/Candidates';
import { CandidateDetails } from './pages/CandidateDetails';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { Candidate, JobDescription, ScoringWeights } from './types';
import { api, getSavedCandidates, getSavedJob } from './services/api';

export default function App() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentJob, setCurrentJob] = useState<JobDescription>(getSavedJob());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch of candidates
    async function init() {
      const data = await api.getCandidates();
      setCandidates(data);
      setCurrentJob(getSavedJob());
      setLoading(false);
    }
    init();
  }, []);

  const handleJobUpdate = (job: JobDescription) => {
    setCurrentJob(job);
  };

  const handleAnalysisComplete = () => {
    const updated = getSavedCandidates();
    setCandidates(updated);
    setCurrentJob(getSavedJob());
  };

  const handleUpdateCandidateStatus = (candidateId: string, status: Candidate['status']) => {
    const updated = api.updateCandidateStatus(candidateId, status);
    setCandidates([...updated]);
  };

  const handleWeightsUpdated = (newWeights: ScoringWeights) => {
    const updated = getSavedCandidates();
    setCandidates([...updated]);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080808]">
        <div className="text-center space-y-3">
          <div className="h-9 w-9 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-zinc-300">Starting Recruitly AI Suite...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout currentJob={currentJob} candidateCount={candidates.length} />}>
          <Route 
            path="/" 
            element={<Dashboard currentJob={currentJob} candidates={candidates} />} 
          />
          <Route 
            path="/screening" 
            element={
              <Screening 
                currentJob={currentJob} 
                onJobUpdate={handleJobUpdate} 
                onAnalysisComplete={handleAnalysisComplete} 
              />
            } 
          />
          <Route 
            path="/candidates" 
            element={
              <Candidates 
                currentJob={currentJob} 
                candidates={candidates} 
                onUpdateCandidateStatus={handleUpdateCandidateStatus} 
              />
            } 
          />
          <Route 
            path="/candidates/:id" 
            element={
              <CandidateDetails 
                currentJob={currentJob} 
                onUpdateCandidateStatus={handleUpdateCandidateStatus} 
              />
            } 
          />
          <Route 
            path="/analytics" 
            element={<Analytics currentJob={currentJob} candidates={candidates} />} 
          />
          <Route 
            path="/settings" 
            element={<Settings onWeightsUpdated={handleWeightsUpdated} />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
