import React from 'react';

interface ProgressBarProps {
  percent: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percent,
  showLabel = true,
  size = 'md',
  className = ''
}) => {
  const clamped = Math.min(100, Math.max(0, Math.round(percent || 0)));

  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3.5'
  };

  return (
    <div className={`w-full flex items-center gap-2 font-mono ${className}`}>
      <div className={`flex-1 bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden ${heightClasses[size]}`}>
        <div
          className="h-full bg-zinc-100 transition-all duration-300 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-zinc-400 font-mono shrink-0 w-9 text-right">
          {clamped}%
        </span>
      )}
    </div>
  );
};
