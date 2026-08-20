import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../api';
import { X, Sparkles, Folder, Video, BookOpen, Send } from 'lucide-react';

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [text, setText] = useState('');
  const [targetCategory, setTargetCategory] = useState<string>('General');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setText('');
      setTargetCategory('General');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      await api.createQuickIdea(text.trim(), targetCategory === 'General' ? undefined : targetCategory);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['General', 'Project', 'Content', 'Marketing', 'Skill / Technique'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div
        className="bg-zinc-950 border border-zinc-700 w-full max-w-lg rounded-lg shadow-2xl overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-zinc-300" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-200">
              QUICK CAPTURE INBOX (0 REQUIRED FIELDS)
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <textarea
              ref={inputRef}
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Jot down a sudden video concept, client outreach idea, technique to learn..."
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 rounded p-3 text-xs focus:outline-none focus:border-zinc-500 transition-colors resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmit(e);
                }
              }}
            />
          </div>

          {/* Optional Tag Selector */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
            <span className="text-zinc-400 mr-1">TENTATIVE AREA:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setTargetCategory(cat)}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  targetCategory === cat
                    ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-bold'
                    : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Modal Footer */}
          <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400 text-[10px]">Press ⌘+Enter to instant save</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !text.trim()}
                className="px-4 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded font-bold flex items-center gap-1.5 disabled:opacity-50 transition-all"
              >
                <Send className="w-3 h-3" />
                <span>Save to Inbox</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
