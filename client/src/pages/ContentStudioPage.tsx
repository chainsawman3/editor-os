import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../api';
import { Project, Task, Goal, ProjectStatus, ProjectPriority } from '../types';
import {
  Clapperboard,
  CheckCircle2,
  Circle,
  Calendar as CalendarIcon,
  Video,
  Target,
  ArrowRight,
  Sparkles,
  Clock,
  User,
  Layers,
  Check,
  X,
  Plus
} from 'lucide-react';
import { ContentStudioSkeleton } from '../components/common/SkeletonLoader';

interface ContentStudioPageProps {
  onOpenProject: (projectId: string) => void;
  onOpenCalendar?: () => void;
}

export const ContentStudioPage: React.FC<ContentStudioPageProps> = ({ onOpenProject, onOpenCalendar }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Confirmation Modal State for Task Checkbox
  const [confirmTask, setConfirmTask] = useState<Task | null>(null);

  // Create Project Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projSection, setProjSection] = useState<'video_editing' | 'marketing' | 'freelance' | 'skills'>('video_editing');
  const [projPriority, setProjPriority] = useState<ProjectPriority>('Medium');
  const [projDeadline, setProjDeadline] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [p, g, t] = await Promise.all([api.getProjects(), api.getGoals(), api.getTasks()]);
      setProjects(p);
      setGoals(g);
      setTasks(t);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConfirmComplete = async () => {
    if (!confirmTask) return;
    const targetId = confirmTask.id;
    setConfirmTask(null);
    setTasks((prev) => prev.map((t) => (t.id === targetId ? { ...t, completed: true } : t)));
    await api.updateTask(targetId, { completed: true });
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;

    try {
      const newProj = await api.createProject({
        name: projName.trim(),
        description: projDesc.trim(),
        section: projSection,
        priority: projPriority,
        deadline: projDeadline || null,
        status: 'Planning'
      });

      setProjName('');
      setProjDesc('');
      setProjDeadline('');
      setShowCreateModal(false);
      
      // Navigate straight to the project workspace
      onOpenProject(newProj.id);
    } catch (err) {
      console.error(err);
      setShowCreateModal(false);
    }
  };

  // Top 5 Nearest Uncompleted Tasks
  const top5Tasks = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    })
    .slice(0, 5);

  // Kanban Columns
  const kanbanColumns: Array<{ id: ProjectStatus; title: string; color: string; desc: string }> = [
    { id: 'Planning', title: 'Planning / Outline', color: 'border-zinc-700', desc: 'Concept & Scripting' },
    { id: 'In Progress', title: 'In Production / Edit', color: 'border-blue-500', desc: 'Active Timeline' },
    { id: 'Ready', title: 'Ready / Polish', color: 'border-amber-500', desc: 'Sound & Color Review' },
    { id: 'Posted', title: 'Posted / Delivered', color: 'border-emerald-500', desc: 'Completed & Live' }
  ];

  const getPriorityColor = (p?: string) => {
    switch (p) {
      case 'Hard':
      case 'High':
        return 'text-rose-300 bg-rose-950/60 border-rose-800/80 font-bold';
      case 'Medium':
        return 'text-amber-300 bg-amber-950/60 border-amber-800/80 font-bold';
      case 'Low':
      default:
        return 'text-emerald-300 bg-emerald-950/60 border-emerald-800/80 font-bold';
    }
  };

  if (loading) {
    return <ContentStudioSkeleton />;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. TOP HEADER */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-700/80 text-zinc-100">
              <Clapperboard className="w-5 h-5 text-blue-400" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight">CONTENT STUDIO & RADAR</h1>
              <p className="text-xs text-zinc-400 font-medium">
                Visual Kanban Pipeline, Stage Distribution, and Dynamic Action Steps
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 font-semibold">
              {projects.length} Total Projects
            </span>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-1.5 shadow transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. TOP 5 NEAREST TASKS WIDGET */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
              Top 5 Upcoming Action Steps (Auto-Replenishing)
            </h2>
          </div>
          <span className="text-xs text-zinc-400 font-medium">
            Click card to open Project Workspace • Click circle to complete
          </span>
        </div>

        {top5Tasks.length === 0 ? (
          <p className="text-xs text-zinc-400 text-center py-6 font-medium">🎉 All nearest action steps completed!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {top5Tasks.map((t, idx) => {
              const p = projects.find((proj) => proj.id === t.project_id);
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    if (t.project_id) {
                      onOpenProject(t.project_id);
                    }
                  }}
                  className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-750 hover:border-emerald-500/60 ring-1 ring-white/[0.06] hover:ring-emerald-500/30 rounded-xl p-4 sm:p-5 cursor-pointer group transition-all duration-200 flex flex-col justify-between space-y-3.5 shadow-md shadow-black/40 hover:shadow-lg hover:shadow-emerald-950/40"
                  title="Click to open this project's workspace"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className="text-[11px] font-mono font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60 group-hover:border-emerald-500/40 group-hover:text-emerald-300 transition-colors">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-zinc-100 group-hover:text-white line-clamp-2 leading-snug transition-colors">
                        {t.title}
                      </span>
                    </div>

                    {/* Checkbox circle with confirmation modal trigger */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmTask(t);
                      }}
                      className="text-zinc-500 hover:text-emerald-400 shrink-0 p-1 hover:bg-emerald-950/50 rounded-full transition-colors"
                      title="Mark as completed"
                    >
                      <Circle className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pt-3 border-t border-zinc-800 text-[11px] flex items-center justify-between text-zinc-400">
                    <span className="truncate max-w-[110px] text-zinc-300 font-medium">{p?.name || 'Project'}</span>
                    <span className="text-purple-400 font-bold">{t.due_date || 'Today'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. PROJECT KANBAN PIPELINE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" /> Production Pipeline Columns
          </h2>
          <span className="text-xs text-zinc-400 font-medium">Click any card to open full Project Workspace</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map((col) => {
            const colProjects = projects.filter((p) => p.status === col.id);
            return (
              <div key={col.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-850">
                  <div>
                    <h3 className="font-bold text-xs text-zinc-200 uppercase">{col.title}</h3>
                    <p className="text-[10px] text-zinc-500">{col.desc}</p>
                  </div>
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
                    {colProjects.length}
                  </span>
                </div>

                <div className="space-y-3.5 min-h-[220px]">
                  {colProjects.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-xs text-zinc-500 border border-dashed border-zinc-900 rounded-lg font-medium">
                      No projects in this stage
                    </div>
                  ) : (
                    colProjects.map((p) => {
                      const goal = goals.find((g) => g.id === p.goal_id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => onOpenProject(p.id)}
                          className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-750 hover:border-emerald-500/60 ring-1 ring-white/[0.06] hover:ring-emerald-500/30 rounded-xl p-5 cursor-pointer group transition-all duration-200 space-y-3.5 shadow-md shadow-black/40 hover:shadow-lg hover:shadow-emerald-950/40"
                        >
                          <div className="flex items-center justify-between">
                            <span className={`px-2.5 py-1 text-[10px] rounded border ${getPriorityColor(p.priority)}`}>
                              {p.priority}
                            </span>
                            <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">{p.section.replace('_', ' ')}</span>
                          </div>

                          <h4 className="text-sm font-bold text-zinc-100 group-hover:text-white line-clamp-1 leading-snug">
                            {p.name}
                          </h4>

                          {p.description && (
                            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-normal">{p.description}</p>
                          )}

                          <div className="pt-3 border-t border-zinc-800 space-y-2 text-xs">
                            {goal && (
                              <div className="text-purple-300 font-medium truncate text-[11px]">
                                🎯 {goal.title}
                              </div>
                            )}
                            {p.client_name && (
                              <div className="text-cyan-300 font-medium truncate text-[11px]">
                                👤 {p.client_name}
                              </div>
                            )}
                            <div className="flex items-center justify-between text-zinc-400 pt-1 text-[11px]">
                              <span className="flex items-center gap-1.5 font-medium">
                                <CalendarIcon className="w-3.5 h-3.5 text-zinc-500" />
                                {p.deadline || 'No Date'}
                              </span>
                              <span className="text-zinc-200 group-hover:text-blue-400 flex items-center gap-1 font-bold transition-colors">
                                Workspace <ArrowRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. TASK COMPLETION CONFIRMATION DIALOG MODAL (MOUNTED TO BODY FOR TRUE CENTER) */}
      {confirmTask &&
        createPortal(
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl modal-transition">
              <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-zinc-100 font-sans">შეასრულეთ ეს თასქი?</h3>
                <p className="text-xs text-zinc-300 font-medium px-2.5 py-1.5 bg-zinc-900 rounded-lg border border-zinc-800 line-clamp-2">
                  "{confirmTask.title}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setConfirmTask(null)}
                  className="py-2.5 px-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" /> No / არა
                </button>

                <button
                  type="button"
                  onClick={handleConfirmComplete}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Yes / დიახ
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      {/* 5. CREATE NEW PROJECT MODAL */}
      {showCreateModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl modal-transition">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-400" /> Create New Project
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="text-zinc-500 hover:text-zinc-300">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Project Name / სათაური *
                  </label>
                  <input
                    type="text"
                    required
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    placeholder="მაგ: Show Reel 2026, YouTube VSL..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[10px]">
                      Category / სექცია
                    </label>
                    <select
                      value={projSection}
                      onChange={(e) => setProjSection(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-200 focus:outline-none focus:border-blue-500 font-sans"
                    >
                      <option value="video_editing">🎬 Video Editing</option>
                      <option value="marketing">🚀 Marketing & Content</option>
                      <option value="freelance">💼 Client / Freelance</option>
                      <option value="skills">⚡ Skills & Learning</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[10px]">
                      Priority / პრიორიტეტი
                    </label>
                    <select
                      value={projPriority}
                      onChange={(e) => setProjPriority(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-200 focus:outline-none focus:border-blue-500 font-sans"
                    >
                      <option value="High">🔴 High Priority</option>
                      <option value="Medium">🟡 Medium Priority</option>
                      <option value="Low">🟢 Low Priority</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Deadline (Optional)
                  </label>
                  <input
                    type="date"
                    value={projDeadline}
                    onChange={(e) => setProjDeadline(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-zinc-200 focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Description / აღწერა (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={projDesc}
                    onChange={(e) => setProjDesc(e.target.value)}
                    placeholder="პროექტის მოკლე აღწერა..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 rounded-xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <span>Create & Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
