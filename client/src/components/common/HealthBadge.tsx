import React from 'react';

interface HealthBadgeProps {
  status: 'On Track' | 'At Risk' | 'Blocked' | 'Overdue' | string;
  isOverdue?: boolean;
}

export const HealthBadge: React.FC<HealthBadgeProps> = ({ status, isOverdue }) => {
  if (isOverdue || status === 'Overdue') {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded border border-dashed border-zinc-400 text-zinc-100 bg-zinc-950 font-bold">
        <span>[✕]</span>
        <span>OVERDUE</span>
      </span>
    );
  }

  switch (status) {
    case 'Blocked':
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded border-2 border-zinc-100 text-zinc-950 bg-zinc-100 font-bold">
          <span>[!]</span>
          <span>BLOCKED</span>
        </span>
      );
    case 'At Risk':
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded border border-zinc-500 text-zinc-300 bg-zinc-900 font-medium">
          <span>[⏳]</span>
          <span>AT RISK</span>
        </span>
      );
    case 'On Track':
    default:
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded border border-zinc-800 text-zinc-400 bg-zinc-950">
          <span>[●]</span>
          <span>ON TRACK</span>
        </span>
      );
  }
};
