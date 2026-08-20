import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div
        className="bg-zinc-950 border border-zinc-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden font-sans modal-transition"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-zinc-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              QUICK CAPTURE INBOX (0 REQUIRED FIELDS)
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 p-1 transition-colors rounded-lg"
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
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 font-sans"
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  handleSubmit(e);
                }
              }}
            />
          </div>

          {/* Quick Category Tags */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
              Quick Tag (Optional)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setTargetCategory(cat)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                    targetCategory === cat
                      ? 'bg-zinc-100 text-zinc-950 font-bold shadow'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-zinc-850 flex items-center justify-between">
            <div className="text-[11px] text-zinc-500 font-medium">
              Press <kbd className="px-1 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[10px] text-zinc-300">⌘+Enter</kbd> to save
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !text.trim()}
                className="px-4 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl text-xs font-bold transition-all shadow disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Capture Idea</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
