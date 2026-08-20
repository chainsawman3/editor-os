import React, { useState } from 'react';
import { api } from '../../api';
import { BeforeAfterEntry } from '../../types';
import { Video, Plus, ArrowRight, Eye } from 'lucide-react';

interface BeforeAfterSectionProps {
  projectId: string;
  entries: BeforeAfterEntry[];
  onRefresh: () => void;
}

export const BeforeAfterSection: React.FC<BeforeAfterSectionProps> = ({
  projectId,
  entries,
  onRefresh
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [beforeTitle, setBeforeTitle] = useState('Raw Log / Flat Footage');
  const [beforeUrl, setBeforeUrl] = useState('');
  const [afterTitle, setAfterTitle] = useState('Final Color & Sound Master');
  const [afterUrl, setAfterUrl] = useState('');
  const [improvements, setImprovements] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.addBeforeAfter(projectId, {
        before_title: beforeTitle,
        before_url: beforeUrl,
        after_title: afterTitle,
        after_url: afterUrl,
        improvements_notes: improvements
      });
      setShowAddModal(false);
      setBeforeUrl('');
      setAfterUrl('');
      setImprovements('');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-200">
            BEFORE VS. AFTER ARCHIVE (RAW VS. FINAL)
          </h4>
          <p className="text-[11px] text-zinc-400">
            Document visual transformations and technical improvements from initial cut to finished master.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded font-mono text-xs flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Comparison</span>
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="p-6 text-center border border-dashed border-zinc-800 rounded bg-zinc-950/40">
          <p className="text-zinc-500 font-mono">No Before/After comparisons logged yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-3"
            >
              {/* Dual Visual Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Before */}
                <div className="p-3 bg-zinc-900/60 border border-zinc-850 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase font-bold text-zinc-400 px-1.5 py-0.5 bg-zinc-950 rounded border border-zinc-800">
                      BEFORE: {entry.before_title}
                    </span>
                  </div>
                  {entry.before_url ? (
                    <div className="aspect-video bg-zinc-950 rounded overflow-hidden border border-zinc-800">
                      <img
                        src={entry.before_url}
                        alt="Before draft"
                        className="w-full h-full object-cover grayscale opacity-70"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-zinc-950 rounded flex items-center justify-center text-zinc-600 font-mono text-[10px]">
                      [Raw Cut Asset Preview]
                    </div>
                  )}
                </div>

                {/* After */}
                <div className="p-3 bg-zinc-900/60 border border-zinc-700 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase font-bold text-zinc-100 px-1.5 py-0.5 bg-zinc-950 rounded border border-zinc-500">
                      AFTER: {entry.after_title}
                    </span>
                  </div>
                  {entry.after_url ? (
                    <div className="aspect-video bg-zinc-950 rounded overflow-hidden border border-zinc-700">
                      <img
                        src={entry.after_url}
                        alt="After export"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-zinc-950 rounded flex items-center justify-center text-zinc-400 font-mono text-[10px]">
                      [Color Graded Master Preview]
                    </div>
                  )}
                </div>
              </div>

              {/* Logged Improvements */}
              {entry.improvements_notes && (
                <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block mb-1">
                    KEY IMPROVEMENTS & CRAFT NOTES:
                  </span>
                  <p className="text-zinc-300 font-sans text-xs whitespace-pre-line leading-relaxed">
                    {entry.improvements_notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-zinc-950 border border-zinc-700 w-full max-w-md rounded-lg shadow-2xl p-4 font-sans space-y-4">
            <h3 className="font-mono text-xs font-bold text-zinc-100 uppercase tracking-wider">
              LOG BEFORE VS AFTER COMPARISON
            </h3>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="font-mono text-zinc-400 block mb-1">Before Title</label>
                <input
                  type="text"
                  value={beforeTitle}
                  onChange={(e) => setBeforeTitle(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="font-mono text-zinc-400 block mb-1">Before Image / Video URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={beforeUrl}
                  onChange={(e) => setBeforeUrl(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="font-mono text-zinc-400 block mb-1">After Title</label>
                <input
                  type="text"
                  value={afterTitle}
                  onChange={(e) => setAfterTitle(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="font-mono text-zinc-400 block mb-1">After Image / Video URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={afterUrl}
                  onChange={(e) => setAfterUrl(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="font-mono text-zinc-400 block mb-1">What was improved? (Bullet points)</label>
                <textarea
                  rows={3}
                  placeholder="1. Audio noise reduction and EQ&#10;2. Cinematic contrast curve..."
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-900 font-mono">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded font-bold"
                >
                  Save Comparison
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
