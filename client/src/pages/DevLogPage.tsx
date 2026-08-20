import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { DevelopmentLog, Category, Project } from '../types';
import { Plus, Trash2 } from 'lucide-react';

export const DevLogPage: React.FC = () => {
  const [logs, setLogs] = useState<DevelopmentLog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [strategyOnly, setStrategyOnly] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [isStrategyChange, setIsStrategyChange] = useState(false);
  const [oldStrategy, setOldStrategy] = useState('');
  const [newStrategy, setNewStrategy] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    try {
      const [l, c] = await Promise.all([api.getLogs(strategyOnly), api.getCategories()]);
      setLogs(l);
      setCategories(c);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [strategyOnly]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !comment.trim()) return;

    setLoading(true);
    try {
      await api.createLog({
        title,
        comment,
        date,
        category_id: categoryId || null,
        is_strategy_change: isStrategyChange,
        old_strategy: oldStrategy,
        new_strategy: newStrategy,
        change_reason: changeReason
      });
      setShowModal(false);
      setTitle('');
      setComment('');
      setIsStrategyChange(false);
      setOldStrategy('');
      setNewStrategy('');
      setChangeReason('');
      loadLogs();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await api.deleteLog(id);
    loadLogs();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-zinc-100 uppercase">DEVELOPMENT & STRATEGY CHANGE LOG</h2>
          <p className="text-xs text-zinc-400 font-sans">
            Preserve historical context, daily craft observations, and deliberate strategy pivots.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>LOG PROGRESS / PIVOT</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <button
          onClick={() => setStrategyOnly(false)}
          className={`px-3 py-1.5 rounded transition-colors ${
            !strategyOnly ? 'bg-zinc-100 text-zinc-950 font-bold' : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
          }`}
        >
          All Activity & Notes
        </button>
        <button
          onClick={() => setStrategyOnly(true)}
          className={`px-3 py-1.5 rounded transition-colors ${
            strategyOnly ? 'bg-zinc-100 text-zinc-950 font-bold' : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
          }`}
        >
          Strategy Pivots Only (Why It Changed)
        </button>
      </div>

      {/* Timeline List */}
      <div className="space-y-3">
        {logs.length === 0 ? (
          <p className="text-xs font-mono text-zinc-500 italic p-8 text-center border border-dashed border-zinc-800 rounded bg-zinc-950">
            No development logs recorded. Add your first entry above.
          </p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`p-5 rounded-lg border text-xs transition-all space-y-3 ${
                log.is_strategy_change
                  ? 'bg-zinc-950 border-zinc-600 shadow-md'
                  : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {log.is_strategy_change ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-zinc-100 text-zinc-950 font-bold rounded">
                      STRATEGY PIVOT
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded">
                      DAILY LOG
                    </span>
                  )}

                  {log.categoryName && (
                    <span className="text-[10px] font-mono text-zinc-400">[{log.categoryName}]</span>
                  )}
                  {log.projectName && (
                    <span className="text-[10px] font-mono text-zinc-400">[{log.projectName}]</span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-zinc-400 font-mono text-[11px]">
                  <span>{log.date}</span>
                  <button onClick={() => handleDelete(log.id)} className="hover:text-zinc-200">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-mono font-bold text-zinc-100">{log.title}</h4>
                <p className="text-zinc-300 font-sans mt-1 leading-relaxed">{log.comment}</p>
              </div>

              {/* Strategy Change Fields */}
              {log.is_strategy_change && (
                <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded space-y-2 font-mono text-[11px]">
                  <div className="flex items-start gap-2">
                    <span className="text-zinc-500 line-through shrink-0">OLD:</span>
                    <span className="text-zinc-400 line-through">{log.old_strategy}</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="text-zinc-100 font-bold shrink-0">NEW:</span>
                    <span className="text-zinc-100 font-bold">{log.new_strategy}</span>
                  </div>

                  <div className="pt-1 border-t border-zinc-800 text-zinc-300 font-sans">
                    <span className="text-zinc-400 font-mono text-[10px] block uppercase font-bold">Why Changed:</span>
                    {log.change_reason}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* CREATE LOG MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-zinc-950 border border-zinc-700 w-full max-w-lg rounded-lg shadow-2xl p-6 font-sans space-y-4">
            <h3 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">
              NEW DEVELOPMENT / STRATEGY LOG
            </h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="flex items-center gap-2 p-2 bg-zinc-900 border border-zinc-800 rounded">
                <input
                  type="checkbox"
                  id="is_strat"
                  checked={isStrategyChange}
                  onChange={(e) => setIsStrategyChange(e.target.checked)}
                  className="rounded bg-zinc-950"
                />
                <label htmlFor="is_strat" className="font-mono text-zinc-200 cursor-pointer font-bold">
                  Mark as Strategy Pivot (Pivoted approach or business decision)
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>

                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Linked Category</label>
                  <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full text-xs">
                    <option value="">None (General)</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-mono text-zinc-400 block mb-1">Log Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Changed outreach target to video audits"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="font-mono text-zinc-400 block mb-1">Observation / Note *</label>
                <textarea
                  rows={2}
                  placeholder="Details of what was learned or updated..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  className="w-full text-xs"
                />
              </div>

              {isStrategyChange && (
                <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded space-y-2">
                  <div>
                    <label className="text-[10px] font-mono text-zinc-400 block mb-1">Old Strategy (What we stopped doing)</label>
                    <input
                      type="text"
                      placeholder="e.g. Send 15 generic cold copy-paste messages per day"
                      value={oldStrategy}
                      onChange={(e) => setOldStrategy(e.target.value)}
                      className="w-full text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-zinc-400 block mb-1">New Strategy (What we do now)</label>
                    <input
                      type="text"
                      placeholder="e.g. Send 3 personalized Loom video audits"
                      value={newStrategy}
                      onChange={(e) => setNewStrategy(e.target.value)}
                      className="w-full text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-zinc-400 block mb-1">Why it was changed (Data / rationale)</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Generic outreach yielded zero responses over 2 weeks..."
                      value={changeReason}
                      onChange={(e) => setChangeReason(e.target.value)}
                      className="w-full text-xs"
                    />
                  </div>
                </div>
              )}

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
                  Save Log Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
