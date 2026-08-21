import React, { useState } from 'react';
import {
  Clapperboard,
  Target,
  Calendar,
  BarChart3,
  Inbox,
  Settings,
  Flame,
  Sparkles,
  Video,
  Megaphone,
  Briefcase,
  GraduationCap,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string, section?: string) => void;
  onOpenQuickCapture: () => void;
  cycleDay: number;
  cycleTotalDays: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickCapture,
  cycleDay,
  cycleTotalDays
}) => {
  const [isGoalsExpanded, setIsGoalsExpanded] = useState(true);

  const goalSubSections = [
    { id: 'video_editing', label: 'Video Editing', icon: Video },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'freelance', label: 'Freelance & Clients', icon: Briefcase },
    { id: 'skills', label: 'Skills & Learning', icon: GraduationCap }
  ];

  const isContentActive = currentTab === 'content' || currentTab === 'dashboard';

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between shrink-0 select-none h-screen font-sans">
      {/* 1. Header & Navigation Top Section */}
      <div className="flex flex-col">
        {/* Brand Header */}
        <div
          onClick={() => onSelectTab('goals')}
          title="Go to Goals & Projects Hub"
          className="p-4 border-b border-zinc-850 flex items-center justify-between cursor-pointer hover:bg-zinc-900/50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-900 border border-zinc-700/80 flex items-center justify-center font-bold text-xs text-white shadow-sm group-hover:border-purple-500/50 transition-colors">
              OS
            </div>
            <div>
              <h1 className="font-bold text-sm text-zinc-100 tracking-tight group-hover:text-white transition-colors">
                Editor OS
              </h1>
              <p className="text-[11px] text-zinc-400 font-medium group-hover:text-purple-400 transition-colors">
                Goals & Projects Hub ↗
              </p>
            </div>
          </div>
        </div>

        {/* 90-Day Sprint Progress Card */}
        <div className="mx-3.5 my-3 p-3 bg-zinc-900/70 border border-zinc-800/90 rounded-xl text-xs space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400 font-medium flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-blue-400" />
              90-Day Sprint
            </span>
            <span className="font-mono font-bold text-zinc-200">
              Day {cycleDay} <span className="text-zinc-500 font-normal">/ {cycleTotalDays}</span>
            </span>
          </div>
          <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800/60">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round((cycleDay / cycleTotalDays) * 100))}%` }}
            />
          </div>
        </div>

        {/* Quick Capture Button (⌘K) */}
        <div className="px-3.5 pb-2">
          <button
            onClick={onOpenQuickCapture}
            className="w-full py-2 px-3 bg-zinc-900/80 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs flex items-center justify-between transition-all group font-medium shadow-sm"
          >
            <span className="flex items-center gap-2 text-zinc-400 group-hover:text-zinc-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Quick Capture
            </span>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-zinc-950 text-zinc-400 border border-zinc-800 rounded font-mono font-semibold">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="px-2.5 py-1.5 space-y-1 overflow-y-auto max-h-[calc(100vh-270px)]">
          {/* Main Landing: Content Studio */}
          <button
            onClick={() => onSelectTab('content')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              isContentActive
                ? 'bg-blue-600/15 border border-blue-500/40 text-blue-300 shadow-sm'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-900 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clapperboard className={`w-4 h-4 ${isContentActive ? 'text-blue-400' : 'text-zinc-400'}`} />
              <span>Content Studio</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-blue-950/80 border border-blue-800 text-blue-300 font-bold uppercase tracking-wider">
              Main
            </span>
          </button>

          {/* Goals Hub (Expandable) */}
          <div className="space-y-0.5 pt-1">
            <div
              onClick={() => {
                onSelectTab('goals');
                setIsGoalsExpanded(!isGoalsExpanded);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer font-medium ${
                currentTab.startsWith('goal')
                  ? 'bg-zinc-850 text-white font-semibold border border-zinc-750 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Target className={`w-4 h-4 ${currentTab.startsWith('goal') ? 'text-purple-400' : 'text-zinc-400'}`} />
                <span>Goals Hub</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsGoalsExpanded(!isGoalsExpanded);
                }}
                className="p-1 text-zinc-500 hover:text-zinc-300"
              >
                {isGoalsExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Sub-sections inside Goals */}
            {isGoalsExpanded && (
              <div className="pl-4 pr-1 py-1 space-y-0.5 border-l border-zinc-850 ml-4.5">
                {goalSubSections.map((sub) => {
                  const isSubActive =
                    currentTab === `goal_${sub.id}` || (currentTab === 'goals' && sub.id === 'video_editing');
                  const Icon = sub.icon;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => onSelectTab(`goal_${sub.id}`, sub.id)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left font-medium ${
                        isSubActive
                          ? 'bg-zinc-800/90 text-zinc-100 font-semibold'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSubActive ? 'text-purple-400' : 'text-zinc-500'}`} />
                      <span>{sub.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Calendar */}
          <button
            onClick={() => onSelectTab('calendar')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors font-medium ${
              currentTab === 'calendar'
                ? 'bg-zinc-850 text-white font-semibold border border-zinc-750 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Calendar className={`w-4 h-4 ${currentTab === 'calendar' ? 'text-purple-400' : 'text-zinc-400'}`} />
            <span>Calendar</span>
          </button>

          {/* Analytics */}
          <button
            onClick={() => onSelectTab('analytics')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors font-medium ${
              currentTab === 'analytics'
                ? 'bg-zinc-850 text-white font-semibold border border-zinc-750 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <BarChart3 className={`w-4 h-4 ${currentTab === 'analytics' ? 'text-cyan-400' : 'text-zinc-400'}`} />
            <span>Analytics</span>
          </button>

          {/* Idea Inbox */}
          <button
            onClick={() => onSelectTab('inbox')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors font-medium ${
              currentTab === 'inbox'
                ? 'bg-zinc-850 text-white font-semibold border border-zinc-750 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Inbox className={`w-4 h-4 ${currentTab === 'inbox' ? 'text-amber-400' : 'text-zinc-400'}`} />
            <span>Idea Inbox</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => onSelectTab('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors font-medium ${
              currentTab === 'settings'
                ? 'bg-zinc-850 text-white font-semibold border border-zinc-750 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Settings className={`w-4 h-4 ${currentTab === 'settings' ? 'text-zinc-200' : 'text-zinc-400'}`} />
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* 2. Footer / Cloud Sync Status */}
      <div className="p-3.5 border-t border-zinc-850 bg-zinc-950 text-xs text-zinc-400 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          <span className="text-zinc-200 font-medium truncate max-w-[130px]">Editor Workspace</span>
        </div>
        <span className="text-zinc-500 text-[10px] font-mono uppercase font-bold tracking-wider">
          Turso Cloud
        </span>
      </div>
    </aside>
  );
};
