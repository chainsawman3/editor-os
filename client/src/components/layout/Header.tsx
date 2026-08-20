import React from 'react';
import { Flame, Plus, Clock } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  cycleDay: number;
  streakDays: number;
  onOpenQuickCapture: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  cycleDay,
  streakDays,
  onOpenQuickCapture
}) => {
  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="h-14 bg-zinc-950 border-b border-zinc-800 px-6 flex items-center justify-between shrink-0 font-mono">
      {/* Title / Breadcrumb */}
      <div>
        <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">{title}</h2>
        {subtitle && <p className="text-[11px] text-zinc-400 font-sans">{subtitle}</p>}
      </div>

      {/* Right Stats & Quick Actions */}
      <div className="flex items-center gap-4 text-xs">
        {/* Streak Counter */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded">
          <Flame className="w-3.5 h-3.5 text-zinc-200" />
          <span className="text-zinc-300 font-bold">{streakDays}</span>
          <span className="text-[10px] text-zinc-400 uppercase">Day Streak</span>
        </div>

        {/* Date Display */}
        <div className="text-zinc-400 text-xs hidden md:block">
          {currentDateFormatted} (Cycle Day {cycleDay})
        </div>

        {/* Quick Capture Button */}
        <button
          onClick={onOpenQuickCapture}
          className="px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded text-xs font-bold font-mono flex items-center gap-1 shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Capture</span>
        </button>
      </div>
    </header>
  );
};
