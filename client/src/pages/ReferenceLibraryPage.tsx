import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { ReferenceItem } from '../types';
import { Plus, ExternalLink, Trash2, Search } from 'lucide-react';

export const ReferenceLibraryPage: React.FC = () => {
  const [items, setItems] = useState<ReferenceItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [category, setCategory] = useState('Commercial');
  const [platform, setPlatform] = useState('Vimeo');
  const [whySaved, setWhySaved] = useState('');
  const [whatToLearn, setWhatToLearn] = useState('');
  const [loading, setLoading] = useState(false);

  const loadReferences = async () => {
    try {
      const res = await api.getReferences();
      setItems(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadReferences();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !link.trim()) return;

    setLoading(true);
    try {
      await api.createReference({
        title,
        link,
        category,
        platform,
        why_saved: whySaved,
        what_to_learn: whatToLearn
      });
      setShowModal(false);
      setTitle('');
      setLink('');
      setWhySaved('');
      setWhatToLearn('');
      loadReferences();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await api.deleteReference(id);
    loadReferences();
  };

  const categories = ['All', 'Commercial', 'Pacing & Flow', 'Sound Design', 'Color Grading', 'Motion Graphics', 'Transitions'];

  const filtered = items.filter((r) => {
    if (selectedCategory !== 'All' && r.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.why_saved.toLowerCase().includes(q) ||
        r.what_to_learn.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-zinc-100 uppercase">REFERENCE & INSPIRATION LIBRARY</h2>
          <p className="text-xs text-zinc-400 font-sans">
            Curated archive of top-tier videos, commercials, and audio mixes with exact takeaways on what to study.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>SAVE INSPIRATION</span>
        </button>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-1 overflow-x-auto bg-zinc-950 p-1 border border-zinc-800 rounded">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1 rounded transition-colors shrink-0 ${
                selectedCategory === c ? 'bg-zinc-100 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search inspiration..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 text-xs"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-lg p-5 flex flex-col justify-between space-y-4 transition-all text-xs"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-zinc-900 text-zinc-300 border border-zinc-800 rounded">
                  {item.category}
                </span>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono text-zinc-400">{item.platform}</span>
                  <button onClick={() => handleDelete(item.id)} className="p-1 text-zinc-500 hover:text-zinc-200">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold font-mono text-zinc-100">{item.title}</h3>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-100 font-mono mt-1 underline"
                >
                  <span>Open Video URL</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Why I saved this:</span>
                <p className="text-zinc-200 text-[11px] font-sans leading-relaxed">{item.why_saved}</p>
              </div>

              <div className="p-2.5 bg-zinc-900/40 border border-zinc-800/80 rounded space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">What to learn / dissect:</span>
                <p className="text-zinc-300 text-[11px] font-sans leading-relaxed">{item.what_to_learn}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-zinc-950 border border-zinc-700 w-full max-w-lg rounded-lg shadow-2xl p-6 font-sans space-y-4">
            <h3 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">
              SAVE INSPIRATION REFERENCE
            </h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-mono text-zinc-400 block mb-1">Title / Ad Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Nike — Never Done Evolving Spec Commercial"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full text-xs">
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Platform</label>
                  <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full text-xs">
                    <option value="Vimeo">Vimeo</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Behance">Behance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-mono text-zinc-400 block mb-1">Link URL *</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  required
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="font-mono text-zinc-400 block mb-1">Why did you save this? *</label>
                <input
                  type="text"
                  placeholder="e.g. Masterclass in kinetic montage and fast pacing"
                  value={whySaved}
                  onChange={(e) => setWhySaved(e.target.value)}
                  required
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="font-mono text-zinc-400 block mb-1">What do you want to learn / replicate? *</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Analyze frame duration between cuts in sprint sequence"
                  value={whatToLearn}
                  onChange={(e) => setWhatToLearn(e.target.value)}
                  required
                  className="w-full text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-900 font-mono">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !title.trim() || !link.trim()}
                  className="px-4 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded font-bold"
                >
                  Save Reference
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
