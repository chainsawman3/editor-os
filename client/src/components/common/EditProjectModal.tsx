import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Project, ProjectPriority, ProjectStatus, Goal } from '../../types';
import { X, Video, Calendar, Sparkles, User, Check, Target, Layers } from 'lucide-react';

interface EditProjectModalProps {
  isOpen: boolean;
  project: Project | null;
  goals?: Goal[];
  onClose: () => void;
  onSave: (updatedProject: Partial<Project> & { id: string }) => Promise<void> | void;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  project,
  goals = [],
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<ProjectPriority>('Medium');
  const [status, setStatus] = useState<ProjectStatus>('Planning');
  const [clientName, setClientName] = useState('');
  const [goalId, setGoalId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setDescription(project.description || '');
      setDeadline(project.deadline || '');
      setPriority(project.priority || 'Medium');
      setStatus(project.status || 'Planning');
      setClientName(project.client_name || '');
      setGoalId(project.goal_id || '');
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSaving(true);
      await onSave({
        id: project.id,
        name: name.trim(),
        description: description.trim(),
        deadline: deadline || null,
        priority,
        status,
        client_name: clientName.trim() || undefined,
        goal_id: goalId || null
      });
      onClose();
    } catch (err) {
      console.error('Failed to update project:', err);
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
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">Edit Project Details</h2>
              <p className="text-xs text-zinc-400 font-medium">Update project title, deadline, client, or description</p>
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
          {/* Project Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Project Title <span className="text-blue-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Split Screen Before/After Reel"
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all font-medium"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Project Description / Brief</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of creative direction, assets, or client requirements..."
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Deadline & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Deadline */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-blue-400" /> Project Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-100 outline-none focus:border-blue-500 transition-all"
              />
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ProjectPriority)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-100 outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="High" className="bg-zinc-950 text-rose-300">🔥 High Priority</option>
                <option value="Medium" className="bg-zinc-950 text-amber-300">⚡ Medium Priority</option>
                <option value="Low" className="bg-zinc-950 text-emerald-300">🌱 Low Priority</option>
              </select>
            </div>
          </div>

          {/* Status & Client Name Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Project Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-100 outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Planning" className="bg-zinc-950 text-blue-300">Planning</option>
                <option value="In Progress" className="bg-zinc-950 text-amber-300">In Progress</option>
                <option value="Ready" className="bg-zinc-950 text-emerald-300">Ready for Review</option>
                <option value="Posted" className="bg-zinc-950 text-purple-300">Posted / Published</option>
                <option value="Paused" className="bg-zinc-950 text-zinc-400">Paused</option>
              </select>
            </div>

            {/* Client Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                <User className="w-3 h-3 text-cyan-400" /> Client Name (Optional)
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Apex Media, Sarah M."
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-blue-500 transition-all font-medium"
              />
            </div>
          </div>

          {/* Linked Goal (if available) */}
          {goals && goals.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                <Target className="w-3 h-3 text-purple-400" /> Linked Primary Goal (Optional)
              </label>
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-medium text-zinc-100 outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="" className="bg-zinc-950 text-zinc-500">None (Standalone Project)</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id} className="bg-zinc-950 text-zinc-200">
                    🎯 {g.title}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              disabled={isSaving || !name.trim()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-950/40 flex items-center gap-1.5"
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
