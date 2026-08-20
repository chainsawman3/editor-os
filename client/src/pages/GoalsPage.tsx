import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Goal, Category } from '../types';
import { NextActionBadge } from '../components/common/NextActionBadge';
import {
  Plus,
  Calendar,
  Trash2
} from 'lucide-react';

export const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [g, c] = await Promise.all([api.getGoals(), api.getCategories()]);
      setGoals(g);
      setCategories(c.filter((cat) => !cat.parent_id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await api.createGoal({
        title,
        description,
        target_date: targetDate || null,
        category_id: categoryId || null,
        next_action: nextAction || '',
        notes
      });
      setShowModal(false);
      setTitle('');
      setDescription('');
      setTargetDate('');
      setNextAction('');
      setNotes('');
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNextAction = async (goalId: string, newAction: string) => {
    await api.updateGoal(goalId, { next_action: newAction });
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this strategic goal?')) {
      await api.deleteGoal(id);
      loadData();
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-zinc-100 uppercase">STRATEGIC GOALS SYSTEM</h2>
          <p className="text-xs text-zinc-400 font-sans">
            Section 5: High-level objectives that anchor daily projects and learning sprints with individual Next Actions.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>NEW STRATEGIC GOAL</span>
        </button>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((g) => (
          <div
            key={g.id}
            className="p-5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-lg flex flex-col justify-between space-y-4 text-xs transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded font-bold">
                  {g.categoryName || 'General'}
                </span>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-zinc-400">
                    {g.status}
                  </span>
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-zinc-300 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold font-mono text-zinc-100">{g.title}</h3>
                {g.description && (
                  <p className="text-zinc-400 text-xs font-sans mt-1 leading-relaxed">
                    {g.description}
                  </p>
                )}
              </div>

              {g.target_date && (
                <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Target Date: {g.target_date}</span>
                </div>
              )}
            </div>

            {/* Next Action Box */}
            <div className="pt-3 border-t border-zinc-900 space-y-1">
              <NextActionBadge
                actionText={g.next_action}
                editable={true}
                onSave={(act) => handleSaveNextAction(g.id, act)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-zinc-950 border border-zinc-700 w-full max-w-md rounded-lg shadow-2xl p-6 font-sans space-y-4">
            <h3 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">
              NEW STRATEGIC GOAL
            </h3>

            <form onSubmit={handleCreateGoal} className="space-y-3 text-xs">
              <div>
                <label className="font-mono text-zinc-400 block mb-1">Goal Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Build 5 Tier-1 Commercial Portfolio Pieces"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Linked Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full text-xs"
                  >
                    <option value="">None (General)</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-zinc-400 block mb-1">Immediate Next Action</label>
                <input
                  type="text"
                  placeholder="e.g. Complete Sports Drink commercial sound mix"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="font-mono text-zinc-400 block mb-1">Strategic Description / Why</label>
                <textarea
                  rows={2}
                  placeholder="Why does this goal matter for business or growth?..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs resize-none"
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
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
