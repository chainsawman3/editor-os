import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../api';
import { Project, Task, Goal, ProjectStatus, ProjectPriority, SectionType } from '../types';
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
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  Edit2
} from 'lucide-react';
import { ContentStudioSkeleton } from '../components/common/SkeletonLoader';
import { EditProjectModal } from '../components/common/EditProjectModal';

interface ContentStudioPageProps {
  initialStatus?: string;
  onOpenProject: (projectId: string) => void;
  onOpenCalendar?: () => void;
}

export const ContentStudioPage: React.FC<ContentStudioPageProps> = ({
  initialStatus,
  onOpenProject,
  onOpenCalendar
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus || 'all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Confirmation Modal State for Task Checkbox
  const [confirmTask, setConfirmTask] = useState<Task | null>(null);

  // Edit Project Modal State
  const [editingProject, setEditingProject] = useState<Project | null>(null);

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

  useEffect(() => {
    if (initialStatus) {
      setStatusFilter(initialStatus);
    }
  }, [initialStatus]);

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

  const handleUpdateProject = async (updated: Partial<Project> & { id: string }) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
    await api.updateProject(updated.id, updated);
    loadData();
  };

  // Filtered Projects
  const filteredProjects = projects.filter((p) => {
    // Status Filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'Ready' || statusFilter === 'Done' || statusFilter === 'Ready / Done') {
        if (p.status !== 'Ready' && p.status !== 'Posted' && p.status !== 'Completed') return false;
      } else if (statusFilter === 'In Progress') {
        if (p.status !== 'In Progress') return false;
      } else if (statusFilter === 'Planning') {
        if (p.status !== 'Planning') return false;
      } else if (p.status !== statusFilter) {
        return false;
      }
    }

    // Priority Filter
    if (priorityFilter !== 'all' && p.priority !== priorityFilter) return false;

    // Section Filter
    if (sectionFilter !== 'all' && p.section !== sectionFilter) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.client_name && p.client_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const isFiltersActive = statusFilter !== 'all' || priorityFilter !== 'all' || sectionFilter !== 'all' || searchQuery.trim() !== '';

  const resetFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setSectionFilter('all');
    setSearchQuery('');
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
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <span className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-800/80 text-blue-400 shadow-inner">
              <Clapperboard className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight">CONTENT STUDIO & RADAR</h1>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">
                Visual Kanban Pipeline, Stage Distribution, and Dynamic Action Steps
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 font-semibold font-mono">
              {filteredProjects.length} / {projects.length} Projects
            </span>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-blue-900/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. FILTER TOOLBAR */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Phase Filter Row */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-zinc-500 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" /> Stage:
            </span>
            {(['all', 'Planning', 'In Progress', 'Ready', 'Posted'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {st === 'Ready' ? 'Ready (Done)' : st === 'all' ? 'All Stages' : st}
              </button>
            ))}

            <div className="h-4 w-px bg-zinc-800 mx-1" />

            {/* Section Filter */}
            <span className="text-zinc-500 font-semibold text-[11px] uppercase tracking-wider mr-1">Category:</span>
            {(['all', 'video_editing', 'marketing', 'skills'] as const).map((sec) => (
              <button
                key={sec}
                onClick={() => setSectionFilter(sec)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  sectionFilter === sec
                    ? 'bg-purple-600 text-white font-bold shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {sec === 'all' ? 'All' : sec === 'video_editing' ? 'Video' : sec === 'marketing' ? 'Marketing' : 'Skills'}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pipeline projects..."
              className="w-full pl-9 pr-8 py-1.5 bg-zinc-900 border border-zinc-800 focus:border-zinc-600 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-500 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 text-zinc-500 hover:text-zinc-200 absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {isFiltersActive && (
          <div className="flex justify-end pt-2 border-t border-zinc-850">
            <button
              onClick={resetFilters}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* 3. TOP 5 NEAREST TASKS WIDGET */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
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

      {/* 4. PROJECT KANBAN PIPELINE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" /> Production Pipeline Columns
          </h2>
          <span className="text-xs text-zinc-400 font-medium">Click any card to open full Project Workspace</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map((col) => {
            const colProjects = filteredProjects.filter((p) => p.status === col.id);
            return (
              <div key={col.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
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
                    <div className="h-32 flex items-center justify-center text-xs text-zinc-500 border border-dashed border-zinc-900 rounded-xl font-medium">
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
                            <span className={`px-2.5 py-1 text-[10px] font-mono rounded border ${getPriorityColor(p.priority)}`}>
                              {p.priority}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">{p.section.replace('_', ' ')}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingProject(p);
                                }}
                                className="p-1 text-zinc-400 hover:text-blue-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Edit Project"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <h4 className="text-sm font-bold text-zinc-100 group-hover:text-white line-clamp-1 leading-snug font-sans">
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
                                Workspace <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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

      {/* CONFIRMATION PORTAL MODAL FOR CHECKBOX TASK */}
      {confirmTask &&
        createPortal(
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <button onClick={() => setConfirmTask(null)} className="text-zinc-500 hover:text-zinc-200">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-zinc-100">Complete this Action Step?</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                  <strong className="text-zinc-200 font-semibold">"{confirmTask.title}"</strong> will be marked as complete and replenished with the next priority task.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setConfirmTask(null)}
                  className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmComplete}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors shadow-md shadow-emerald-950/50"
                >
                  Yes, Complete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* CREATE PROJECT MODAL */}
      {showCreateModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Video className="w-4 h-4 text-blue-400" /> Create Production Project
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="text-zinc-500 hover:text-zinc-200">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-zinc-400 font-semibold block mb-1">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    placeholder="e.g. Nike Spec Commercial - Sound Design Reel"
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-750 rounded-xl text-zinc-100 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-semibold block mb-1">Description / Brief</label>
                  <textarea
                    rows={2}
                    value={projDesc}
                    onChange={(e) => setProjDesc(e.target.value)}
                    placeholder="Key concepts, pacing, music style..."
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-750 rounded-xl text-zinc-100 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-400 font-semibold block mb-1">Category / Section</label>
                    <select
                      value={projSection}
                      onChange={(e: any) => setProjSection(e.target.value)}
                      className="w-full p-2 bg-zinc-900 border border-zinc-750 rounded-xl text-zinc-100 outline-none"
                    >
                      <option value="video_editing">Video Editing</option>
                      <option value="marketing">Marketing & Content</option>
                      <option value="skills">Skills & VFX</option>
                      <option value="freelance">Client Freelance</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-400 font-semibold block mb-1">Priority</label>
                    <select
                      value={projPriority}
                      onChange={(e: any) => setProjPriority(e.target.value)}
                      className="w-full p-2 bg-zinc-900 border border-zinc-750 rounded-xl text-zinc-100 outline-none"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 font-semibold block mb-1">Target Deadline</label>
                  <input
                    type="date"
                    value={projDeadline}
                    onChange={(e) => setProjDeadline(e.target.value)}
                    className="w-full p-2 bg-zinc-900 border border-zinc-750 rounded-xl text-zinc-100 outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-3.5 py-2 bg-zinc-900 text-zinc-400 hover:text-zinc-200 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md"
                  >
                    Create & Open Workspace ↗
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={!!editingProject}
        project={editingProject}
        goals={goals}
        onClose={() => setEditingProject(null)}
        onSave={handleUpdateProject}
      />
    </div>
  );
};
