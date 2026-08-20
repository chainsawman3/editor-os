import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { QuickIdea } from '../types';
import { Trash2, CheckCircle2, Video, FolderKanban, Plus } from 'lucide-react';

interface InboxPageProps {
  onOpenQuickCapture: () => void;
  onNavigate: (tab: string, entityId?: string) => void;
}

export const InboxPage: React.FC<InboxPageProps> = ({ onOpenQuickCapture, onNavigate }) => {
  const [ideas, setIdeas] = useState<QuickIdea[]>([]);

  const loadIdeas = async () => {
    try {
      const res = await api.getQuickIdeas();
      setIdeas(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadIdeas();
  }, []);

  const handleTriage = async (idea: QuickIdea, convertTo?: string) => {
    try {
      await api.triageIdea(idea.id, {
        convert_to: convertTo,
        project_name: idea.text,
        content_title: idea.text
      });
      loadIdeas();
      if (convertTo === 'project') onNavigate('projects');
      if (convertTo === 'content') onNavigate('content');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    await api.deleteQuickIdea(id);
    loadIdeas();
  };

  const untriaged = ideas.filter((i) => !i.triaged);
  const triaged = ideas.filter((i) => i.triaged);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-zinc-100 uppercase">QUICK CAPTURE IDEA INBOX</h2>
          <p className="text-xs text-zinc-400 font-sans">
            Section 13: Frictionless capture holding area. Review sudden thoughts and convert them into projects or content items.
          </p>
        </div>

        <button
          onClick={onOpenQuickCapture}
          className="px-3.5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>CAPTURE NEW IDEA (⌘K)</span>
        </button>
      </div>

      {/* Untriaged Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-zinc-200 uppercase tracking-wider">
            UNCATEGORIZED / PENDING TRIAGE ({untriaged.length})
          </span>
          <span className="text-zinc-400">Triage or convert to action</span>
        </div>

        {untriaged.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-zinc-800 rounded bg-zinc-950/50 space-y-2">
            <CheckCircle2 className="w-6 h-6 text-zinc-400 mx-auto" />
            <p className="text-xs font-mono text-zinc-300">Inbox is empty!</p>
            <p className="text-[11px] text-zinc-400">All captured ideas have been triaged.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {untriaged.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs transition-all"
              >
                <div className="space-y-1 max-w-xl">
                  <p className="text-zinc-100 font-medium text-sm leading-snug">{item.text}</p>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                    <span>Captured: {new Date(item.captured_at).toLocaleString()}</span>
                    {item.target_category && (
                      <span className="px-1.5 py-0.2 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded">
                        {item.target_category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Triage Actions */}
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <button
                    onClick={() => handleTriage(item, 'project')}
                    className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded flex items-center gap-1"
                    title="Create new project from idea"
                  >
                    <Video className="w-3 h-3" />
                    <span>→ Project</span>
                  </button>

                  <button
                    onClick={() => handleTriage(item, 'content')}
                    className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded flex items-center gap-1"
                    title="Create new content card from idea"
                  >
                    <FolderKanban className="w-3 h-3" />
                    <span>→ Content</span>
                  </button>

                  <button
                    onClick={() => handleTriage(item)}
                    className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded"
                    title="Mark triaged"
                  >
                    Archive
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-zinc-600 hover:text-zinc-300"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Triaged Archive */}
      {triaged.length > 0 && (
        <div className="pt-6 border-t border-zinc-900 space-y-3">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
            PROCESSED & ARCHIVED CAPTURES ({triaged.length})
          </span>

          <div className="space-y-1.5 opacity-60">
            {triaged.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-zinc-950 border border-zinc-900 rounded flex items-center justify-between text-xs font-mono text-zinc-400"
              >
                <span className="line-through truncate pr-4">{item.text}</span>
                <button onClick={() => handleDelete(item.id)} className="hover:text-zinc-200">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
