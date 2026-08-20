import React, { useState } from 'react';
import {
  Target,
  Clapperboard,
  Calendar,
  BarChart3,
  Inbox,
  Settings,
  PlusCircle,
  Video,
  Megaphone,
  Briefcase,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Sparkles
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
    { id: 'video_editing', label: '1. Video Editing', icon: Clapperboard },
    { id: 'marketing', label: '2. Marketing', icon: Megaphone },
    { id: 'freelance', label: '3. Freelance / Clients', icon: Briefcase },
    { id: 'skills', label: '4. Skills / Learning', icon: GraduationCap }
  ];

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between shrink-0 select-none h-screen font-sans">
      {/* Brand Header & Logo (Clicking navigates to Content Studio) */}
      <div className="flex flex-col">
        <div
          onClick={() => onSelectTab('content')}
          title="Go to Content Studio"
          className="p-4 border-b border-zinc-800 flex items-center justify-between cursor-pointer hover:bg-zinc-900/60 transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-zinc-100 group-hover:bg-white text-zinc-950 flex items-center justify-center font-bold text-xs rounded-lg shadow-sm transition-transform group-hover:scale-105">
              OS
            </div>
            <div>
              <h1 className="font-bold text-sm text-zinc-100 tracking-tight group-hover:text-white transition-colors">
                EDITOR OS
              </h1>
              <p className="text-[10px] text-zinc-400 font-medium group-hover:text-blue-400 transition-colors">
                Content Studio Dashboard ↗
              </p>
            </div>
          </div>
        </div>

        {/* 90-Day Cycle Status Badge */}
        <div className="mx-3 my-3 p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs space-y-2 shadow-inner">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400 font-semibold">90-DAY SPRINT CYCLE</span>
            <span className="font-bold text-zinc-100">
              DAY {cycleDay} / {cycleTotalDays}
            </span>
          </div>
          <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-zinc-100 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round((cycleDay / cycleTotalDays) * 100))}%` }}
            />
          </div>
        </div>

        {/* Quick Capture Button (⌘K) */}
        <div className="px-3 pb-2">
          <button
            onClick={onOpenQuickCapture}
            className="w-full py-2.5 px-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-700/80 hover:border-zinc-500 rounded-xl text-xs flex items-center justify-between transition-all group shadow-sm font-semibold"
          >
            <span className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-zinc-400 group-hover:text-zinc-100" />
              Quick Capture
            </span>
            <kbd className="px-1.5 py-0.5 text-[9px] bg-zinc-950 text-zinc-400 border border-zinc-800 rounded font-sans font-bold">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="p-2 space-y-1.5 overflow-y-auto max-h-[calc(100vh-280px)]">
          {/* 1. PRIMARY GOAL HUB */}
          <div className="space-y-0.5">
            <div
              onClick={() => {
                onSelectTab('goals');
                setIsGoalsExpanded(true);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-xl transition-colors cursor-pointer font-bold ${
                currentTab.startsWith('goal')
                  ? 'bg-zinc-900 text-zinc-100 border-l-2 border-purple-500 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Target className="w-4 h-4 text-purple-400" />
                <span>🎯 GOAL HUB</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsGoalsExpanded(!isGoalsExpanded);
                }}
                className="p-1 text-zinc-400 hover:text-zinc-200"
              >
                {isGoalsExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Sub-sections inside GOAL */}
            {isGoalsExpanded && (
              <div className="pl-6 pr-1 py-1 space-y-0.5 border-l border-zinc-850 ml-4">
                {goalSubSections.map((sub) => {
                  const isSubActive = currentTab === `goal_${sub.id}` || (currentTab === 'goals' && sub.id === 'video_editing');
                  const Icon = sub.icon;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => onSelectTab(`goal_${sub.id}`, sub.id)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left font-medium ${
                        isSubActive
                          ? 'bg-zinc-850 text-zinc-100 font-semibold'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{sub.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. CONTENT STUDIO (Kanban + Top 5 Tasks) */}
          <button
            onClick={() => onSelectTab('content')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs rounded-xl transition-colors font-bold ${
              currentTab === 'content'
                ? 'bg-zinc-900 text-zinc-100 border-l-2 border-blue-500 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            <Clapperboard className="w-4 h-4 text-blue-400" />
            <span>CONTENT STUDIO</span>
          </button>

          {/* 3. PROMINENT & ENLARGED CALENDAR BUTTON */}
          <div className="pt-1 pb-1">
            <button
              onClick={() => onSelectTab('calendar')}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${
                currentTab === 'calendar'
                  ? 'bg-purple-950/60 border-purple-600 text-white font-bold shadow-md ring-1 ring-purple-500/30'
                  : 'bg-zinc-900/90 hover:bg-zinc-850 border-purple-900/40 text-purple-200 hover:text-white hover:border-purple-600/70 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-900/60 border border-purple-700/80 text-purple-200">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold tracking-tight">📅 CALENDAR</div>
                  <div className="text-[10px] text-purple-300 font-medium">All Deadlines Schedule</div>
                </div>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-900/80 border border-purple-700 text-purple-200 font-bold uppercase">
                EXPANDED
              </span>
            </button>
          </div>

          {/* 4. ANALYTICS */}
          <button
            onClick={() => onSelectTab('analytics')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl transition-colors font-bold ${
              currentTab === 'analytics'
                ? 'bg-zinc-900 text-zinc-100 border-l-2 border-cyan-500 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>ANALYTICS</span>
          </button>

          {/* 5. IDEA INBOX */}
          <button
            onClick={() => onSelectTab('inbox')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl transition-colors font-bold ${
              currentTab === 'inbox'
                ? 'bg-zinc-900 text-zinc-100 border-l-2 border-amber-500 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            <Inbox className="w-4 h-4 text-amber-400" />
            <span>IDEA INBOX</span>
          </button>

          {/* 6. SETTINGS */}
          <button
            onClick={() => onSelectTab('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl transition-colors font-bold ${
              currentTab === 'settings'
                ? 'bg-zinc-900 text-zinc-100 border-l-2 border-zinc-400 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            <Settings className="w-4 h-4 text-zinc-400" />
            <span>SETTINGS</span>
          </button>
        </nav>
      </div>

      {/* Footer / User Profile */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950 text-xs text-zinc-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-zinc-200 font-semibold truncate max-w-[140px]">Alex (Editor)</span>
        </div>
        <span className="text-zinc-500 text-[10px] uppercase font-bold">Cloud Synced</span>
      </div>
    </aside>
  );
};
