import React from 'react';
import { Flame, Plus, Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  cycleDay: number;
  streakDays: number;
  onOpenQuickCapture: () => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  cycleDay,
  streakDays,
  onOpenQuickCapture,
  onToggleMobileMenu
}) => {
  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="h-14 bg-zinc-950 border-b border-zinc-800 px-4 sm:px-6 flex items-center justify-between shrink-0 font-sans select-none">
      {/* Left: Mobile Menu Trigger + Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Open navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-zinc-100 uppercase tracking-wide truncate max-w-[160px] sm:max-w-none">{title}</h2>
          {subtitle && <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate max-w-[160px] sm:max-w-none">{subtitle}</p>}
        </div>
      </div>

      {/* Right Stats & Quick Actions */}
      <div className="flex items-center gap-4 text-xs">
        {/* Streak Counter */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg">
          <Flame className="w-3.5 h-3.5 text-zinc-200" />
          <span className="text-zinc-200 font-bold">{streakDays}</span>
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Day Streak</span>
        </div>

        {/* Date Display */}
        <div className="text-zinc-400 text-xs hidden md:block font-medium">
          {currentDateFormatted} (Cycle Day {cycleDay})
        </div>

        {/* Quick Capture Button */}
        <button
          onClick={onOpenQuickCapture}
          className="px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Capture</span>
        </button>
      </div>
    </header>
  );
};
