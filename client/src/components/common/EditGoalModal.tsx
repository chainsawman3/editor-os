import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Goal } from '../../types';
import { X, Target, Calendar, Sparkles, Check, FileText } from 'lucide-react';

interface EditGoalModalProps {
  isOpen: boolean;
  goal: Goal | null;
  onClose: () => void;
  onSave: (updatedGoal: Partial<Goal> & { id: string }) => Promise<void> | void;
}

export const EditGoalModal: React.FC<EditGoalModalProps> = ({
  isOpen,
  goal,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('High');
  const [status, setStatus] = useState<string>('In Progress');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (goal) {
      setTitle(goal.title || '');
      setDescription(goal.description || '');
      setTargetDate(goal.target_date || '');
      setPriority((goal.priority as 'Low' | 'Medium' | 'High') || 'High');
      setStatus(goal.status || 'In Progress');
    }
  }, [goal, isOpen]);

  if (!isOpen || !goal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSaving(true);
      await onSave({
        id: goal.id,
        title: title.trim(),
        description: description.trim(),
        target_date: targetDate || null,
        priority,
        status
      });
      onClose();
    } catch (err) {
      console.error('Failed to update goal:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 relative ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">Edit Goal / Objective</h2>
              <p className="text-xs text-zinc-400 font-medium">Update title, deadline, priority, or description</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-850 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Goal Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Goal Title <span className="text-purple-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master High-End Sound Design & Glitch Transitions"
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all font-medium"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Description / Key Milestones</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key milestones, deliverables, or objectives..."
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Deadline / Target Date & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Target Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-purple-400" /> Deadline / Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-100 outline-none focus:border-purple-500 transition-all"
              />
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'Low' | 'Medium' | 'High')}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-100 outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="High" className="bg-zinc-950 text-rose-300">🔥 High Priority</option>
                <option value="Medium" className="bg-zinc-950 text-amber-300">⚡ Medium Priority</option>
                <option value="Low" className="bg-zinc-950 text-emerald-300">🌱 Low Priority</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-100 outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="In Progress" className="bg-zinc-950 text-amber-300">In Progress</option>
              <option value="Planning" className="bg-zinc-950 text-blue-300">Planning</option>
              <option value="Completed" className="bg-zinc-950 text-emerald-300">Completed / Done</option>
              <option value="Paused" className="bg-zinc-950 text-zinc-400">Paused</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-850">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !title.trim()}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-950/40 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
