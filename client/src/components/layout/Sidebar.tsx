import React from 'react';
import {
  FolderKanban,
  Target,
  Calendar,
  BarChart3,
  Inbox,
  Settings,
  Flame,
  Sparkles,
  Clock,
  StickyNote,
  CheckSquare,
  Dumbbell,
  Wallet,
  X,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string, section?: string) => void;
  onOpenQuickCapture: () => void;
  cycleDay: number;
  cycleTotalDays: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  activeUser?: string;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickCapture,
  cycleDay,
  cycleTotalDays,
  isMobileOpen = false,
  onCloseMobile,
  activeUser = 'gigi',
  onLogout
}) => {
  const handleTabClick = (tab: string, section?: string) => {
    onSelectTab(tab, section);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const isContentActive = currentTab === 'content' || currentTab === 'dashboard';

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      {/* 1. Header & Navigation Top Section */}
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="p-4 border-b border-zinc-850 flex items-center justify-between">
          <div
            onClick={() => handleTabClick('goals')}
            title="Go to Goals & Projects Hub"
            className="flex items-center gap-3 cursor-pointer group flex-1"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-900 border border-zinc-700/80 flex items-center justify-center font-bold text-xs text-white shadow-sm group-hover:border-purple-500/50 transition-colors">
              OS
            </div>
            <div>
              <h1 className="font-bold text-sm text-zinc-100 tracking-tight group-hover:text-white transition-colors">
                Flow OS
              </h1>
              <p className="text-[11px] text-zinc-400 font-medium group-hover:text-purple-400 transition-colors">
                Goals & Projects Hub ↗
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="px-2.5 py-2.5 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {/* Main Landing: Projects Pipeline */}
          <button
            onClick={() => handleTabClick('content')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              isContentActive
                ? 'bg-blue-600/15 border border-blue-500/40 text-blue-300 shadow-sm'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-900 border border-transparent'
            }`}
          >
            <FolderKanban className={`w-4 h-4 ${isContentActive ? 'text-blue-400' : 'text-zinc-400'}`} />
            <span>Projects Pipeline</span>
          </button>

          {/* Goals Hub */}
          <button
            onClick={() => handleTabClick('goals')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors font-medium ${
              currentTab.startsWith('goal')
                ? 'bg-purple-600/15 border border-purple-500/40 text-purple-300 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
            }`}
          >
            <Target className={`w-4 h-4 ${currentTab.startsWith('goal') ? 'text-purple-400' : 'text-zinc-400'}`} />
            <span>Goals Hub</span>
          </button>

          {/* Tasks & Standalone Deadlines */}
          <button
            onClick={() => handleTabClick('tasks')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all font-medium ${
              currentTab === 'tasks'
                ? 'bg-blue-600/15 border border-blue-500/40 text-blue-300 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
            }`}
          >
            <CheckSquare className={`w-4 h-4 ${currentTab === 'tasks' ? 'text-blue-400' : 'text-zinc-400'}`} />
            <span>Tasks</span>
          </button>

          {/* Workout / Fitness Schedule */}
          <button
            onClick={() => handleTabClick('workout')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all font-medium ${
              currentTab === 'workout'
                ? 'bg-emerald-600/15 border border-emerald-500/40 text-emerald-300 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-transparent'
            }`}
          >
            <Dumbbell className={`w-4 h-4 ${currentTab === 'workout' ? 'text-emerald-400' : 'text-zinc-400'}`} />
            <span>Workout & Pool</span>
          </button>

          {/* Economy & Budget Manager */}
          <button
            onClick={() => handleTabClick('economy')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all font-medium ${
              currentTab === 'economy'
                ? 'bg-amber-600/15 border border-amber-500/40 text-amber-300 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-amber-300 hover:bg-amber-500/10 border border-transparent'
            }`}
          >
            <Wallet className={`w-4 h-4 ${currentTab === 'economy' ? 'text-amber-400' : 'text-zinc-400'}`} />
            <span>Budget</span>
          </button>

          {/* Deadlines */}
          <button
            onClick={() => handleTabClick('deadlines')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors font-medium ${
              currentTab === 'deadlines'
                ? 'bg-zinc-850 text-white font-semibold border border-zinc-750 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Clock className={`w-4 h-4 ${currentTab === 'deadlines' ? 'text-rose-400' : 'text-zinc-400'}`} />
            <span>Deadlines</span>
          </button>

          {/* Notes & Daily Scratchpad */}
          <button
            onClick={() => handleTabClick('notes')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all font-medium ${
              currentTab === 'notes'
                ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 font-semibold shadow-sm shadow-amber-950/30'
                : 'text-zinc-400 hover:text-amber-200 hover:bg-amber-500/10 border border-transparent'
            }`}
          >
            <StickyNote className={`w-4 h-4 ${currentTab === 'notes' ? 'text-amber-400' : 'text-amber-500/80'}`} />
            <span>Notes</span>
          </button>

          {/* Calendar */}
          <button
            onClick={() => handleTabClick('calendar')}
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
            onClick={() => handleTabClick('analytics')}
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
            onClick={() => handleTabClick('inbox')}
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
            onClick={() => handleTabClick('settings')}
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

      {/* 2. User Profile Card & Switch / Logout */}
      <div className="border-t border-zinc-850 bg-zinc-950 flex flex-col">
        <div className="p-3 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-8 h-8 rounded-xl bg-gradient-to-br ${
                activeUser === 'ani' ? 'from-rose-500 to-pink-600 shadow-rose-950/50' : 'from-purple-600 to-indigo-600 shadow-purple-950/50'
              } flex items-center justify-center font-black text-xs text-white shadow-md shrink-0`}
            >
              {activeUser === 'ani' ? 'A' : 'G'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white truncate">
                  {activeUser === 'ani' ? 'ანი' : 'გიგი'}
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold leading-none ${
                    activeUser === 'ani'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}
                >
                  {activeUser === 'ani' ? 'Ani' : 'Gigi'}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 truncate">
                {activeUser === 'ani' ? 'Personal Workspace' : 'Core Workspace'}
              </p>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              title="პროფილის შეცვლა / გამოსვლა"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Cloud Sync Status */}
        <div className="px-3 pb-2.5 pt-0.5 text-xs text-zinc-500 flex items-center justify-between border-t border-zinc-900/60">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
            <span className="text-[10px] text-zinc-400 font-medium">Turso Cloud Synced</span>
          </div>
          <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-600">v2.1</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-zinc-950 border-r border-zinc-800 shrink-0 select-none h-screen font-sans">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Blur Overlay */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] bg-zinc-950 border-r border-zinc-800 h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
