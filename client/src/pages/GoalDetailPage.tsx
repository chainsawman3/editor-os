import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Goal, Project, Task, SectionType } from '../types';
import {
  ChevronLeft,
  Target,
  Video,
  Calendar,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Circle,
  Clock,
  Layers,
  Flame,
  Check,
  Megaphone,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { ProjectDetailSkeleton } from '../components/common/SkeletonLoader';

interface GoalDetailPageProps {
  goalId: string;
  onBack: () => void;
  onOpenProject: (projectId: string) => void;
}

export const GoalDetailPage: React.FC<GoalDetailPageProps> = ({ goalId, onBack, onOpenProject }) => {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Goal State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTargetDate, setEditTargetDate] = useState('');
  const [editPriority, setEditPriority] = useState('High');
  const [editStatus, setEditStatus] = useState('In Progress');
  const [editNextAction, setEditNextAction] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Add Project Modal
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjDeadline, setNewProjDeadline] = useState('');
  const [newProjPriority, setNewProjPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newProjClient, setNewProjClient] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [allGoals, allProjects, tasksList] = await Promise.all([
        api.getGoals(),
        api.getProjects(),
        api.getTasks()
      ]);

      const foundGoal = allGoals.find((g) => g.id === goalId) || null;
      setGoal(foundGoal);

      if (foundGoal) {
        setEditTitle(foundGoal.title);
        setEditDescription(foundGoal.description || '');
        setEditTargetDate(foundGoal.target_date || '');
        setEditPriority(foundGoal.priority || 'High');
        setEditStatus(foundGoal.status || 'In Progress');
        setEditNextAction(foundGoal.next_action || '');
        setEditNotes(foundGoal.notes || '');

        const linked = allProjects.filter((p) => p.goal_id === goalId);
        setProjects(linked);
      }
      setAllTasks(tasksList);
    } catch (err) {
      console.error('Error loading goal details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [goalId]);

  const handleSaveGoal = async () => {
    if (!goal) return;
    const updated = await api.updateGoal(goal.id, {
      title: editTitle,
      description: editDescription,
      target_date: editTargetDate,
      priority: editPriority as any,
      status: editStatus,
      next_action: editNextAction,
      notes: editNotes
    });
    setGoal(updated);
    setIsEditing(false);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal || !newProjName.trim()) return;

    await api.createProject({
      goal_id: goal.id,
      name: newProjName.trim(),
      description: newProjDesc.trim(),
      section: goal.section || 'video_editing',
      sub_section: goal.sub_section || undefined,
      deadline: newProjDeadline || undefined,
      priority: newProjPriority,
      client_name: newProjClient.trim() || undefined,
      status: 'Planning'
    });

    setNewProjName('');
    setNewProjDesc('');
    setNewProjDeadline('');
    setNewProjClient('');
    setShowAddProjectModal(false);
    loadData();
  };

  if (loading) {
    return <ProjectDetailSkeleton />;
  }

  if (!goal) {
    return (
      <div className="p-12 text-center max-w-xl mx-auto space-y-4">
        <p className="text-zinc-400 font-mono text-xs">Primary Objective not found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-750 rounded-xl text-xs font-semibold"
        >
          Back
        </button>
      </div>
    );
  }

  // Calculate Progress
  const readyProjectsCount = projects.filter(
    (p) => p.status === 'Ready' || p.status === 'Posted' || p.status === 'Completed'
  ).length;
  const progressPercent = projects.length > 0 ? Math.round((readyProjectsCount / projects.length) * 100) : 0;

  // Linked Tasks
  const linkedProjectIds = projects.map((p) => p.id);
  const goalTasks = allTasks.filter((t) => t.project_id && linkedProjectIds.includes(t.project_id));
  const completedGoalTasks = goalTasks.filter((t) => t.completed).length;

  const getPriorityColor = (p?: string) => {
    switch (p) {
      case 'Hard':
      case 'High':
        return 'text-rose-400 bg-rose-950/40 border-rose-800/80';
      case 'Medium':
        return 'text-amber-400 bg-amber-950/40 border-amber-800/80';
      case 'Low':
      default:
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/80';
    }
  };

  const getSectionBadge = (sec?: string) => {
    switch (sec) {
      case 'marketing':
        return { label: 'Marketing & Audience', icon: Megaphone, color: 'text-pink-300 bg-pink-950/70 border-pink-800/70' };
      case 'skills':
        return { label: 'Skills & Mastery', icon: GraduationCap, color: 'text-amber-300 bg-amber-950/70 border-amber-800/70' };
      case 'freelance':
        return { label: 'Freelance & Revenue', icon: Briefcase, color: 'text-purple-300 bg-purple-950/70 border-purple-800/70' };
      case 'video_editing':
      default:
        return { label: 'Video Production', icon: Video, color: 'text-blue-300 bg-blue-950/70 border-blue-800/70' };
    }
  };

  const secBadge = getSectionBadge(goal.section);
  const SectionIcon = secBadge.icon;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. TOP HEADER & METADATA BAR */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 transition-all shadow-sm group w-fit"
            title="Go back to previous page"
          >
            <ChevronLeft className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-1 text-[11px] font-mono rounded-lg border flex items-center gap-1.5 ${secBadge.color}`}>
              <SectionIcon className="w-3.5 h-3.5" />
              <span>{secBadge.label}</span>
            </span>

            <span className={`px-2.5 py-1 text-[11px] font-mono rounded-lg border font-bold ${getPriorityColor(goal.priority)}`}>
              {goal.priority || 'High'} Priority
            </span>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-purple-400" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Objective'}</span>
            </button>
          </div>
        </div>

        {/* Edit Form OR View Header */}
        {isEditing ? (
          <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Objective Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-zinc-100 font-bold outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Strategic Description & Rationale</label>
              <textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-200 outline-none focus:border-purple-500 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-400 uppercase">Target Deadline</label>
                <input
                  type="date"
                  value={editTargetDate}
                  onChange={(e) => setEditTargetDate(e.target.value)}
                  className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-200 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-400 uppercase">Priority</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-200 outline-none"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-400 uppercase">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-200 outline-none"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Planning">Planning</option>
                  <option value="Completed">Completed</option>
                  <option value="Paused">Paused</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-1.5 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGoal}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-purple-950/70 border border-purple-800/80 text-purple-400 shadow-inner">
                    <Target className="w-5 h-5" />
                  </span>
                  <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">{goal.title}</h1>
                </div>
                {goal.description && (
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal pt-1 max-w-4xl">
                    {goal.description}
                  </p>
                )}
              </div>
            </div>

            {/* Target Date Pill */}
            <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 pt-2 border-t border-zinc-850">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                {goal.target_date ? `Target Delivery: ${goal.target_date}` : 'Ongoing Strategic Objective'}
              </span>
              <span>•</span>
              <span className="text-zinc-300">{projects.length} Production Projects Attached</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. PROGRESS TELEMETRY BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2 shadow-sm">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Project Completion</span>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold font-mono text-zinc-100">{readyProjectsCount} / {projects.length}</span>
            <span className="text-xs font-bold font-mono text-purple-400">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2 shadow-sm">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Action Steps Executed</span>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold font-mono text-zinc-100">{completedGoalTasks} / {goalTasks.length}</span>
            <span className="text-xs font-bold font-mono text-emerald-400">
              {goalTasks.length > 0 ? Math.round((completedGoalTasks / goalTasks.length) * 100) : 0}%
            </span>
          </div>
          <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
              style={{ width: `${goalTasks.length > 0 ? (completedGoalTasks / goalTasks.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Objective Status</span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-lg font-bold text-zinc-100">{goal.status || 'Active Sprint'}</span>
          </div>
          <span className="text-[11px] text-zinc-400">All deliverables sync with Calendar & Dashboard</span>
        </div>
      </div>

      {/* 3. LINKED PRODUCTION PROJECTS SECTION */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
          <div>
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Video className="w-4 h-4 text-blue-400" /> Attached Production Projects ({projects.length})
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">
              Individual video deliverables, content pieces, and milestones powering this main objective
            </p>
          </div>

          <button
            onClick={() => setShowAddProjectModal(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Project to Goal</span>
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-zinc-900/30 border border-zinc-850 rounded-xl">
            <Video className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-xs text-zinc-400 font-medium">No production projects attached to this objective yet.</p>
            <button
              onClick={() => setShowAddProjectModal(true)}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-750 rounded-xl text-xs font-semibold"
            >
              + Create First Deliverable
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => {
              const pTasks = allTasks.filter((t) => t.project_id === p.id);
              const pDoneTasks = pTasks.filter((t) => t.completed).length;

              return (
                <div
                  key={p.id}
                  onClick={() => onOpenProject(p.id)}
                  className="p-4 bg-zinc-900/70 hover:bg-zinc-850 border border-zinc-800 hover:border-blue-500/80 rounded-xl cursor-pointer group transition-all space-y-3 flex flex-col justify-between shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-blue-950/80 border border-blue-800 text-blue-300 font-bold uppercase">
                        {p.status}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-mono rounded border ${getPriorityColor(p.priority)}`}>
                        {p.priority}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-zinc-100 group-hover:text-blue-300 transition-colors leading-snug">
                      {p.name}
                    </h3>

                    {p.description && (
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-normal">
                        {p.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                      <span>{p.client_name ? `Client: ${p.client_name}` : 'Internal Project'}</span>
                      <span>{pDoneTasks}/{pTasks.length} tasks</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        {p.deadline || 'No deadline'}
                      </span>
                      <span className="text-xs font-semibold text-blue-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Open Workspace <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. MODAL: ADD PROJECT TO GOAL */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" /> Add Project Deliverable
              </h3>
              <button
                onClick={() => setShowAddProjectModal(false)}
                className="text-zinc-500 hover:text-zinc-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400">Project Name *</label>
                <input
                  type="text"
                  required
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="e.g. Nike Commercial Reel"
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400">Description / Deliverable Specs</label>
                <textarea
                  rows={2}
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  placeholder="Key visual style, footage source, duration..."
                  className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-200 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400">Client / Brand</label>
                  <input
                    type="text"
                    value={newProjClient}
                    onChange={(e) => setNewProjClient(e.target.value)}
                    placeholder="e.g. Nike / Internal"
                    className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-200 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400">Deadline</label>
                  <input
                    type="date"
                    value={newProjDeadline}
                    onChange={(e) => setNewProjDeadline(e.target.value)}
                    className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-200 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400">Priority</label>
                <select
                  value={newProjPriority}
                  onChange={(e) => setNewProjPriority(e.target.value as any)}
                  className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-200 outline-none"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Create & Attach
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
