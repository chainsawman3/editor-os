import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Project } from '../types';
import { ProgressBar } from '../components/common/ProgressBar';
import { HealthBadge } from '../components/common/HealthBadge';
import { DifficultyBadge } from '../components/common/DifficultyBadge';
import { NextActionBadge } from '../components/common/NextActionBadge';
import {
  Plus,
  Clock,
  Trash2,
  Edit2
} from 'lucide-react';

interface ProjectsPageProps {
  onSelectProject: (id: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onSelectProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Project Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<'Portfolio' | 'Client' | 'Personal' | 'Learning' | 'Content'>('Portfolio');
  const [expectedDifficulty, setExpectedDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Extreme'>('Medium');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('High');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [nextAction, setNextAction] = useState('');

  const loadProjects = async () => {
    try {
      const res = await api.getProjects();
      setProjects(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const newProj = await api.createProject({
        name,
        type,
        expected_difficulty: expectedDifficulty,
        priority,
        deadline: deadline || null,
        description,
        next_action: nextAction || 'Define project tasks and references',
        tasks: [
          { title: 'Define visual concept & gather references', stage: 'Research' },
          { title: 'Import footage & rough assembly cut', stage: 'Editing' },
          { title: 'Detailed sound design pass', stage: 'Sound Design' },
          { title: 'Color grading & final master export', stage: 'Color Grading' }
        ]
      });

      setShowCreateModal(false);
      setName('');
      setDescription('');
      setNextAction('');
      loadProjects();
      onSelectProject(newProj.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      await api.deleteProject(id);
      loadProjects();
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (typeFilter === 'All') return true;
    return p.type === typeFilter;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header & Create */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-zinc-100 uppercase">PROJECT MANAGEMENT WORKSPACE</h2>
          <p className="text-xs text-zinc-400 font-sans">
            Section 7: Dedicated production workspaces with Next Action, Time Tracking, Difficulty Calibration & Focus Mode.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>NEW PROJECT</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs font-mono">
        {['All', 'Portfolio', 'Client', 'Personal', 'Learning', 'Content'].map((tab) => (
          <button
            key={tab}
            onClick={() => setTypeFilter(tab)}
            className={`px-3 py-1.5 rounded transition-colors ${
              typeFilter === tab
                ? 'bg-zinc-100 text-zinc-950 font-bold'
                : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((p) => (
          <div
            key={p.id}
            onClick={() => onSelectProject(p.id)}
            className="p-5 bg-zinc-950 hover:bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600 rounded-lg cursor-pointer transition-all flex flex-col justify-between space-y-4 text-xs group"
          >
            {/* Top row: Type, Health, Delete */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase px-2 py-0.5 bg-zinc-900 text-zinc-300 border border-zinc-800 rounded">
                  {p.type}
                </span>

                <div className="flex items-center gap-2">
                  <HealthBadge status={p.health_status} isOverdue={p.isOverdue} />
                  <button
                    onClick={(e) => handleDelete(e, p.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-zinc-300 transition-opacity"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-base font-bold font-mono text-zinc-100 group-hover:underline">
                  {p.name}
                </h3>
                {p.description && (
                  <p className="text-zinc-400 text-xs font-sans mt-1 line-clamp-2">
                    {p.description}
                  </p>
                )}
              </div>
            </div>

            {/* Middle: Difficulty & Next Action */}
            <div className="space-y-2.5 pt-2 border-t border-zinc-900">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <DifficultyBadge level={p.expected_difficulty} prefix="EXP" />
                {p.totalHours !== undefined && p.totalHours > 0 && (
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    {p.totalHours} hrs
                  </span>
                )}
              </div>

              {/* Next Action Pill */}
              <div className="text-[11px] font-mono text-zinc-300 bg-zinc-900/60 p-2 rounded border border-zinc-850 truncate">
                <span className="text-zinc-400 uppercase font-semibold mr-1">NEXT:</span>
                <span className="truncate">{p.next_action || 'None set'}</span>
              </div>
            </div>

            {/* Bottom Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>PROGRESS</span>
                <span>{p.completedTasks}/{p.totalTasks} Tasks</span>
              </div>
              <ProgressBar percent={p.progressPercent || 0} size="sm" />
            </div>
          </div>
        ))}
      </div>

      {/* CREATE PROJECT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-zinc-950 border border-zinc-700 w-full max-w-lg rounded-lg shadow-2xl p-6 font-sans space-y-4">
            <h3 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">
              CREATE NEW VIDEO PROJECT
            </h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-mono text-zinc-400 block mb-1">Project Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Nike Spec Commercial / 3x Client Reels"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Project Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full text-xs"
                  >
                    <option value="Portfolio">Portfolio</option>
                    <option value="Client">Client</option>
                    <option value="Personal">Personal</option>
                    <option value="Learning">Learning</option>
                    <option value="Content">Content</option>
                  </select>
                </div>

                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Expected Difficulty</label>
                  <select
                    value={expectedDifficulty}
                    onChange={(e) => setExpectedDifficulty(e.target.value as any)}
                    className="w-full text-xs"
                  >
                    <option value="Easy">Easy (1-2 days)</option>
                    <option value="Medium">Medium (3-5 days)</option>
                    <option value="Hard">Hard (1-2 weeks)</option>
                    <option value="Extreme">Extreme (Complex CGI/Audio)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full text-xs"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Target Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-zinc-400 block mb-1">Immediate Next Action</label>
                <input
                  type="text"
                  placeholder="e.g. Collect 5 sound design references for the opening drop"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="font-mono text-zinc-400 block mb-1">Description / Concept</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the creative concept..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="px-4 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded font-mono font-bold"
                >
                  Create & Launch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
