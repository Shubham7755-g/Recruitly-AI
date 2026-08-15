import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileSearch, 
  Users, 
  BarChart3, 
  Settings, 
  Sparkles,
  SlidersHorizontal,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/screening', label: 'Resume Screening', icon: FileSearch, badge: 'Workflow' },
    { to: '/candidates', label: 'Candidate Ranking', icon: Users },
    { to: '/analytics', label: 'Recruitment Analytics', icon: BarChart3 },
    { to: '/settings', label: 'Scoring & Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-800 bg-[#0C0C0C] transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#C5A059] to-[#8C6D2B] text-zinc-950 shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-zinc-100">
                Recruitly AI
              </span>
              <span className="block text-[10px] font-medium text-zinc-400">
                Candidate Ranking Suite
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
            Recruitment Suite
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#C5A059] text-zinc-950 font-bold shadow-xs'
                      : 'text-zinc-400 hover:bg-[#151515] hover:text-zinc-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-4 w-4 transition-colors ${
                          isActive ? 'text-zinc-950' : 'text-zinc-500 group-hover:text-zinc-300'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                          isActive
                            ? 'bg-black/20 text-zinc-950'
                            : 'bg-[#151515] text-[#C5A059] border border-[#C5A059]/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

          <div className="pt-6 px-3 pb-2 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
            Algorithm & Standards
          </div>

          {/* Quick Info Cards */}
          <div className="rounded-xl border border-zinc-800 bg-[#151515] p-3 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-200 pb-1.5 border-b border-zinc-800 mb-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#C5A059]" />
              <span>Scoring Model Weights</span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Skill Match:</span>
                <strong className="font-semibold text-zinc-200">40%</strong>
              </div>
              <div className="flex justify-between">
                <span>Semantic NLP:</span>
                <strong className="font-semibold text-zinc-200">30%</strong>
              </div>
              <div className="flex justify-between">
                <span>Experience:</span>
                <strong className="font-semibold text-zinc-200">15%</strong>
              </div>
              <div className="flex justify-between">
                <span>Education:</span>
                <strong className="font-semibold text-zinc-200">10%</strong>
              </div>
              <div className="flex justify-between">
                <span>Projects:</span>
                <strong className="font-semibold text-zinc-200">5%</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Academic / Internship Footer Badge */}
        <div className="border-t border-zinc-800 p-3 bg-[#080808]/60">
          <div className="flex items-center gap-2 rounded-lg p-2 text-xs text-zinc-400">
            <GraduationCap className="h-4 w-4 text-[#C5A059] shrink-0" />
            <div className="leading-tight">
              <div className="font-semibold text-zinc-300">Virtual Internship Capstone</div>
              <div className="text-[10px] text-zinc-500">ML/NLP Resume Screening Engine</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
