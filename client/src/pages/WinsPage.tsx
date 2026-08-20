import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Win } from '../types';
import { Trophy, Plus, Trash2 } from 'lucide-react';

export const WinsPage: React.FC = () => {
  const [wins, setWins] = useState<Win[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Portfolio');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const loadWins = async () => {
    try {
      const res = await api.getWins();
      setWins(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadWins();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await api.createWin({
        title: title.trim(),
        date,
        category,
        description: description.trim()
      });
      setShowModal(false);
      setTitle('');
      setDescription('');
      loadWins();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await api.deleteWin(id);
    loadWins();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-zinc-100 uppercase">WINS & ACHIEVEMENTS TROPHY ROOM</h2>
          <p className="text-xs text-zinc-400 font-sans">
            Section 14: Tangible results and career highlights documented separately from task check-offs.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>LOG RESULT / WIN</span>
        </button>
      </div>

      {/* Summary Stat */}
      <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-lg flex items-center justify-between font-mono">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-900 border border-zinc-700 rounded-lg flex items-center justify-center">
            <Trophy className="w-5 h-5 text-zinc-100" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100 uppercase">TOTAL LOGGED WINS</h3>
            <p className="text-xs text-zinc-400 font-sans">Concrete proof of professional progression.</p>
          </div>
        </div>
        <div className="text-3xl font-bold text-zinc-100">{wins.length}</div>
      </div>

      {/* Wins Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wins.map((win) => (
          <div
            key={win.id}
            className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-lg p-5 flex flex-col justify-between space-y-4 transition-all text-xs"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-zinc-900 text-zinc-300 border border-zinc-800 rounded">
                  {win.category || 'Achievement'}
                </span>
                <span className="text-[10px] font-mono text-zinc-400">{win.date}</span>
              </div>

              <h4 className="text-base font-bold font-mono text-zinc-100 flex items-start gap-1.5">
                <Trophy className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <span>{win.title}</span>
              </h4>

              {win.description && (
                <p className="text-zinc-300 font-sans leading-relaxed text-xs">{win.description}</p>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-900">
              <button
                onClick={() => handleDelete(win.id)}
                className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors"
                title="Delete win"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-zinc-950 border border-zinc-700 w-full max-w-md rounded-lg shadow-2xl p-6 font-sans space-y-4">
            <h3 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">
              LOG CAREER WIN / RESULT
            </h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-mono text-zinc-400 block mb-1">Win Title *</label>
                <input
                  type="text"
                  placeholder="e.g. First $1,200 Project Discussion / 10 Portfolio Pieces"
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
                    <option value="Portfolio">Portfolio</option>
                    <option value="Revenue">Revenue / Financial</option>
                    <option value="Client">Client Signed</option>
                    <option value="Skill">Technical Skill Mastered</option>
                    <option value="Social">Social Media Viral</option>
                  </select>
                </div>

                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Date Achieved</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-zinc-400 block mb-1">Outcome & Reflection</label>
                <textarea
                  rows={2}
                  placeholder="Why this result matters for long-term growth..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  Save Win
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
