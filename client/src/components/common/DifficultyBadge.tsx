import React from 'react';

interface DifficultyBadgeProps {
  level: 'Easy' | 'Medium' | 'Hard' | 'Extreme' | string;
  prefix?: string;
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ level, prefix = '' }) => {
  const getPills = () => {
    switch (level) {
      case 'Extreme':
        return '■■■■';
      case 'Hard':
        return '■■■□';
      case 'Medium':
        return '■■□□';
      case 'Easy':
      default:
        return '■□□□';
    }
  };

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] px-2 py-0.5 rounded border border-zinc-800 bg-zinc-950 text-zinc-300">
      {prefix && <span className="text-zinc-500 text-[10px]">{prefix}:</span>}
      <span className="tracking-tighter text-zinc-400">{getPills()}</span>
      <span className="uppercase font-semibold">{level}</span>
    </span>
  );
};
