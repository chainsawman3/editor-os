import React from 'react';
import { AlertOctagon, Check } from 'lucide-react';

interface BlockerTagProps {
  id: string;
  description: string;
  onResolve?: (id: string) => Promise<void>;
  resolving?: boolean;
  className?: string;
}

export const BlockerTag: React.FC<BlockerTagProps> = ({
  id,
  description,
  onResolve,
  resolving = false,
  className = ''
}) => {
  return (
    <div
      className={`flex items-start justify-between gap-3 p-3 bg-zinc-950 border-2 border-zinc-200 text-zinc-100 rounded font-sans text-xs ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <span className="font-mono font-bold text-zinc-950 bg-zinc-100 px-1 rounded shrink-0 mt-0.5">
          [!]
        </span>
        <div>
          <span className="font-mono text-[10px] uppercase text-zinc-400 block tracking-wider font-semibold">
            ACTIVE ROADBLOCK:
          </span>
          <p className="text-zinc-100 mt-0.5 font-medium leading-relaxed">{description}</p>
        </div>
      </div>

      {onResolve && (
        <button
          onClick={() => onResolve(id)}
          disabled={resolving}
          className="shrink-0 font-mono text-[11px] px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 rounded flex items-center gap-1 transition-all"
          title="Mark blocker as resolved"
        >
          <Check className="w-3 h-3 text-zinc-400" />
          <span>Resolve</span>
        </button>
      )}
    </div>
  );
};
