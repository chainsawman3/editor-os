import React, { useState } from 'react';
import { ArrowRight, Edit2, Check, X } from 'lucide-react';

interface NextActionBadgeProps {
  actionText?: string | null;
  onSave?: (newAction: string) => Promise<void>;
  editable?: boolean;
  className?: string;
}

export const NextActionBadge: React.FC<NextActionBadgeProps> = ({
  actionText,
  onSave,
  editable = false,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(actionText || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!onSave) return;
    setLoading(true);
    try {
      await onSave(value);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className={`flex items-center gap-1 font-mono text-xs ${className}`}>
        <span className="text-zinc-500 text-[10px]">NEXT:</span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          className="px-2 py-0.5 text-xs bg-zinc-900 border border-zinc-700 rounded text-zinc-100 min-w-[200px]"
        />
        <button
          onClick={handleSave}
          disabled={loading}
          className="p-1 hover:bg-zinc-800 rounded text-zinc-200"
          title="Save"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            setValue(actionText || '');
            setIsEditing(false);
          }}
          className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-300"
          title="Cancel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`group inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-200 ${className}`}
    >
      <ArrowRight className="w-3 h-3 text-zinc-400 shrink-0" />
      <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">NEXT:</span>
      <span className="truncate max-w-md font-medium text-zinc-100">
        {actionText || <span className="text-zinc-600 italic">No next action set</span>}
      </span>
      {editable && onSave && (
        <button
          onClick={() => setIsEditing(true)}
          className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-500 hover:text-zinc-300 transition-opacity ml-1"
          title="Edit next immediate action"
        >
          <Edit2 className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
