import React from 'react';
import {
  LayoutDashboard,
  Target,
  FolderKanban,
  Video,
  Clapperboard,
  Calendar,
  Sparkles,
  Briefcase,
  BookOpen,
  Bookmark,
  History,
  Trophy,
  BarChart3,
  Settings,
  PlusCircle,
  Inbox
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
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
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'inbox', label: 'Idea Inbox', icon: Inbox },
    { id: 'categories', label: 'Categories', icon: FolderKanban },
    { id: 'projects', label: 'Projects Hub', icon: Video },
    { id: 'content', label: 'Content Studio', icon: Clapperboard },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'references', label: 'Reference Library', icon: Bookmark },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'devlog', label: 'Development Log', icon: History },
    { id: 'wins', label: 'Wins & Results', icon: Trophy },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const categorySubItems = [
    { id: 'cat_video_editing', label: 'Video Editing' },
    { id: 'cat_marketing', label: 'Marketing' },
    { id: 'cat_freelance', label: 'Freelance / Clients' },
    { id: 'cat_skills', label: 'Skills / Learning' }
  ];

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between shrink-0 select-none h-screen">
      {/* Brand Header */}
      <div className="flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-zinc-100 text-zinc-950 flex items-center justify-center font-mono font-bold text-xs rounded-sm">
              OS
            </div>
            <div>
              <h1 className="font-mono font-bold text-sm text-zinc-100 tracking-tight">EDITOR OS</h1>
              <p className="text-[10px] text-zinc-400 font-mono leading-none">v2.0 MERGED SYSTEM</p>
            </div>
          </div>
        </div>

        {/* 90-Day Cycle Status Badge */}
        <div className="mx-3 my-3 p-2.5 bg-zinc-900/80 border border-zinc-800 rounded font-mono text-xs space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">90-DAY CYCLE</span>
            <span className="font-bold text-zinc-100">
              DAY {cycleDay} / {cycleTotalDays}
            </span>
          </div>
          <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden">
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
            className="w-full py-2 px-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-700/80 hover:border-zinc-500 rounded text-xs font-mono flex items-center justify-between transition-all group"
          >
            <span className="flex items-center gap-2 font-medium">
              <PlusCircle className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-100" />
              Quick Capture
            </span>
            <kbd className="text-[10px] bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="px-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-290px)]">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-mono transition-colors text-left ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Subcategory shortcuts */}
          <div className="pt-3 pb-1 px-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Categories
            </span>
          </div>
          {categorySubItems.map((sub) => (
            <button
              key={sub.id}
              onClick={() => onSelectTab(sub.id)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-mono transition-colors text-left pl-6 ${
                currentTab === sub.id
                  ? 'text-zinc-100 font-bold bg-zinc-900'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="text-zinc-600">↳</span>
              <span className="truncate">{sub.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center font-bold text-[10px] text-zinc-200 shrink-0">
            AE
          </div>
          <div className="truncate">
            <p className="text-zinc-200 font-medium truncate">Video Editor</p>
            <p className="text-[10px] text-zinc-400">Personal OS</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
