import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { KnowledgeEntry, Project } from '../types';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';

export const KnowledgeBasePage: React.FC = () => {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);

  // Form State
  const [category, setCategory] = useState('After Effects');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [whenToUse, setWhenToUse] = useState('');
  const [notes, setNotes] = useState('');
  const [linkedProjectId, setLinkedProjectId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [k, p] = await Promise.all([api.getKnowledge(), api.getProjects()]);
      setEntries(k);
      setProjects(p);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingEntry(null);
    setCategory('After Effects');
    setTitle('');
    setDescription('');
    setWhenToUse('');
    setNotes('');
    setLinkedProjectId('');
    setShowModal(true);
  };

  const openEditModal = (entry: KnowledgeEntry) => {
    setEditingEntry(entry);
    setCategory(entry.category);
    setTitle(entry.title);
    setDescription(entry.description);
    setWhenToUse(entry.when_to_use || '');
    setNotes(entry.notes || '');
    setLinkedProjectId(entry.linked_project_id || '');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setLoading(true);
    try {
      if (editingEntry) {
        await api.updateKnowledge(editingEntry.id, {
          category,
          title,
          description,
          when_to_use: whenToUse,
          notes,
          linked_project_id: linkedProjectId || null
        });
      } else {
        await api.createKnowledge({
          category,
          title,
          description,
          when_to_use: whenToUse,
          notes,
          linked_project_id: linkedProjectId || null
        });
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await api.deleteKnowledge(id);
    loadData();
  };

  const categoriesList = [
    'All',
    'After Effects',
    'Premiere Pro',
    'DaVinci Resolve',
    'Sound Design',
    'Color Grading',
    'Storytelling',
    'AI Tools',
    'Business'
  ];

  const filtered = entries.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-zinc-100 uppercase">KNOWLEDGE BASE ("WHAT I LEARNED")</h2>
          <p className="text-xs text-zinc-400 font-sans">
            Structured repository for logging new editing techniques, sound craft, and experiments learned during projects.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-3.5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>LOG NEW SKILL / TECHNIQUE</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-1 overflow-x-auto bg-zinc-950 p-1 border border-zinc-800 rounded">
          {categoriesList.map((c) => (
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
            placeholder="Search techniques..."
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
                  <button onClick={() => openEditModal(item)} className="p-1 text-zinc-500 hover:text-zinc-200">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1 text-zinc-500 hover:text-zinc-200">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold font-mono text-zinc-100">{item.title}</h3>
                <p className="text-zinc-300 mt-1.5 font-sans leading-relaxed">{item.description}</p>
              </div>

              {item.when_to_use && (
                <div className="p-2.5 bg-zinc-900/60 border border-zinc-800/80 rounded space-y-0.5">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">When to use:</span>
                  <p className="text-zinc-300 text-[11px] font-sans">{item.when_to_use}</p>
                </div>
              )}

              {item.notes && (
                <p className="text-zinc-400 text-[11px] font-sans italic">Notes: {item.notes}</p>
              )}
            </div>

            {item.linkedProjectName && (
              <div className="pt-2 border-t border-zinc-900 text-[10px] font-mono text-zinc-500">
                Learned during: <span className="text-zinc-300">{item.linkedProjectName}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-zinc-950 border border-zinc-700 w-full max-w-lg rounded-lg shadow-2xl p-6 font-sans space-y-4">
            <h3 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">
              {editingEntry ? 'EDIT KNOWLEDGE ENTRY' : 'LOG NEW SKILL OR TECHNIQUE'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full text-xs">
                    {categoriesList.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Learned During Project</label>
                  <select
                    value={linkedProjectId}
                    onChange={(e) => setLinkedProjectId(e.target.value)}
                    className="w-full text-xs"
                  >
                    <option value="">None (Independent Study)</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-mono text-zinc-400 block mb-1">Technique / Principle Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Multi-Layer Impact Synthesis"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="font-mono text-zinc-400 block mb-1">Description / How It Works *</label>
                <textarea
                  rows={3}
                  placeholder="Explain the technical execution steps and theory..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="font-mono text-zinc-400 block mb-1">When to Use (Context & Trigger)</label>
                <input
                  type="text"
                  placeholder="e.g. Use on smash cuts, logo reveals, high energy commercials"
                  value={whenToUse}
                  onChange={(e) => setWhenToUse(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="font-mono text-zinc-400 block mb-1">Personal Notes / Settings</label>
                <input
                  type="text"
                  placeholder="e.g. Low-pass filter music by 6dB during the hit"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                  disabled={loading || !title.trim()}
                  className="px-4 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded font-bold"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
