import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api';
import { Project, Task } from '../types';
import {
  Clock,
  Calendar,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Filter,
  Search,
  ChevronRight,
  User,
  ArrowUpDown,
  Sparkles,
  Layers,
  Video,
  Megaphone,
  Briefcase,
  GraduationCap,
  Edit2,
  X,
  RotateCcw
} from 'lucide-react';
import { EditProjectModal } from '../components/common/EditProjectModal';

interface DeadlinesPageProps {
  onOpenProject: (projectId: string) => void;
}

export const DeadlinesPage: React.FC<DeadlinesPageProps> = ({ onOpenProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Filter & Search State
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'urgency' | 'urgency_desc' | 'priority' | 'progress' | 'name'>('urgency');

  const loadData = async () => {
    try {
      setLoading(true);
      const [p, t] = await Promise.all([api.getProjects(), api.getTasks()]);
      setProjects(p || []);
      setTasks(t || []);
    } catch (err) {
      console.error('Error loading deadlines data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateProject = async (updated: Partial<Project> & { id: string }) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
    await api.updateProject(updated.id, updated);
    loadData();
  };

  // Compute tasks count per project
  const tasksByProject = useMemo(() => {
    const map = new Map<string, { total: number; completed: number }>();
    tasks.forEach((task) => {
      if (!task.project_id) return;
      const current = map.get(task.project_id) || { total: 0, completed: 0 };
      current.total += 1;
      if (task.completed) current.completed += 1;
      map.set(task.project_id, current);
    });
    return map;
  }, [tasks]);

  // Helper to calculate days remaining and formatting
  const getDeadlineDetails = (deadlineStr?: string | null) => {
    if (!deadlineStr) {
      return {
        daysRemaining: 999999,
        isOverdue: false,
        isToday: false,
        isTomorrow: false,
        isThisWeek: false,
        isUpcoming: false,
        isUndated: true,
        formattedDate: 'No Deadline',
        urgencyLabel: 'No Deadline Set',
        badgeColor: 'bg-zinc-900 text-zinc-500 border-zinc-800',
        dotColor: 'bg-zinc-600'
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadlineDate = new Date(deadlineStr);
    deadlineDate.setHours(0, 0, 0, 0);

    const diffTime = deadlineDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const isOverdue = daysRemaining < 0;
    const isToday = daysRemaining === 0;
    const isTomorrow = daysRemaining === 1;
    const isThisWeek = daysRemaining >= 0 && daysRemaining <= 7;
    const isUpcoming = daysRemaining > 7;
    const isUndated = false;

    const formattedDate = deadlineDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: deadlineDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });

    let urgencyLabel = '';
    let badgeColor = '';
    let dotColor = '';

    if (isOverdue) {
      const overdueDays = Math.abs(daysRemaining);
      urgencyLabel = overdueDays === 1 ? '🚨 1 Day Overdue' : `🚨 ${overdueDays} Days Overdue`;
      badgeColor = 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.15)] animate-pulse';
      dotColor = 'bg-rose-400';
    } else if (isToday) {
      urgencyLabel = '🔥 Due Today!';
      badgeColor = 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-bold';
      dotColor = 'bg-amber-400 animate-ping';
    } else if (isTomorrow) {
      urgencyLabel = '⚡ Due Tomorrow';
      badgeColor = 'bg-amber-500/15 border-amber-500/35 text-amber-200';
      dotColor = 'bg-amber-400';
    } else if (daysRemaining <= 3) {
      urgencyLabel = `⏳ ${daysRemaining} Days Left`;
      badgeColor = 'bg-orange-500/15 border-orange-500/35 text-orange-300';
      dotColor = 'bg-orange-400';
    } else if (daysRemaining <= 7) {
      urgencyLabel = `📅 ${daysRemaining} Days Left`;
      badgeColor = 'bg-blue-500/15 border-blue-500/35 text-blue-300';
      dotColor = 'bg-blue-400';
    } else if (daysRemaining <= 30) {
      urgencyLabel = `🟢 ${daysRemaining} Days Left`;
      badgeColor = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
      dotColor = 'bg-emerald-400';
    } else {
      urgencyLabel = `🗓️ ${daysRemaining} Days Left`;
      badgeColor = 'bg-zinc-850 border-zinc-750 text-zinc-300';
      dotColor = 'bg-zinc-400';
    }

    return {
      daysRemaining,
      isOverdue,
      isToday,
      isTomorrow,
      isThisWeek,
      isUpcoming,
      isUndated,
      formattedDate,
      urgencyLabel,
      badgeColor,
      dotColor
    };
  };

  // Filter & Sort Projects
  const filteredAndSortedProjects = useMemo(() => {
    return projects
      .filter((p) => {
        // Section / Category Filter
        if (selectedSection !== 'all') {
          if (selectedSection === 'freelance') {
            // Freelance includes projects marked as freelance OR with a client name
            const isFreelance = p.section === 'freelance' || Boolean(p.client_name);
            if (!isFreelance) return false;
          } else if (p.section !== selectedSection) {
            return false;
          }
        }

        // Urgency Filter
        const info = getDeadlineDetails(p.deadline);
        if (selectedUrgency === 'overdue' && !info.isOverdue) return false;
        if (selectedUrgency === 'this_week' && !info.isThisWeek) return false;
        if (selectedUrgency === 'upcoming' && !info.isUpcoming) return false;
        if (selectedUrgency === 'undated' && !info.isUndated) return false;

        // Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchClient = p.client_name ? p.client_name.toLowerCase().includes(q) : false;
          const matchDesc = p.description ? p.description.toLowerCase().includes(q) : false;
          const matchSection = p.section ? p.section.toLowerCase().includes(q) : false;
          if (!matchName && !matchClient && !matchDesc && !matchSection) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const infoA = getDeadlineDetails(a.deadline);
        const infoB = getDeadlineDetails(b.deadline);

        if (sortBy === 'urgency') {
          // Strictly earliest deadline first!
          // Overdue first, then today, then upcoming, no-deadline at very end
          return infoA.daysRemaining - infoB.daysRemaining;
        }

        if (sortBy === 'urgency_desc') {
          // Latest deadline first, no-deadline at very end
          if (infoA.isUndated) return 1;
          if (infoB.isUndated) return -1;
          return infoB.daysRemaining - infoA.daysRemaining;
        }

        if (sortBy === 'priority') {
          const weight: Record<string, number> = { High: 3, Hard: 3, Medium: 2, Low: 1, Easy: 1 };
          const pA = weight[a.priority] || 1;
          const pB = weight[b.priority] || 1;
          if (pA !== pB) return pB - pA;
          return infoA.daysRemaining - infoB.daysRemaining;
        }

        if (sortBy === 'progress') {
          const statsA = tasksByProject.get(a.id) || { total: 0, completed: 0 };
          const statsB = tasksByProject.get(b.id) || { total: 0, completed: 0 };
          const pctA = statsA.total > 0 ? statsA.completed / statsA.total : 0;
          const pctB = statsB.total > 0 ? statsB.completed / statsB.total : 0;
          return pctB - pctA;
        }

        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }

        return 0;
      });
  }, [projects, selectedSection, selectedUrgency, searchQuery, sortBy, tasksByProject]);

  // Overall Statistics for Telemetry
  const stats = useMemo(() => {
    let overdueCount = 0;
    let dueThisWeekCount = 0;
    let upcomingCount = 0;
    let noDeadlineCount = 0;

    projects.forEach((p) => {
      const d = getDeadlineDetails(p.deadline);
      if (!p.deadline) {
        noDeadlineCount += 1;
      } else if (d.isOverdue) {
        overdueCount += 1;
      } else if (d.isThisWeek) {
        dueThisWeekCount += 1;
      } else {
        upcomingCount += 1;
      }
    });

    return { overdueCount, dueThisWeekCount, upcomingCount, noDeadlineCount };
  }, [projects]);

  // Category items count for badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: projects.length,
      video_editing: 0,
      marketing: 0,
      freelance: 0,
      skills: 0
    };

    projects.forEach((p) => {
      if (p.section === 'video_editing') counts.video_editing += 1;
      if (p.section === 'marketing') counts.marketing += 1;
      if (p.section === 'skills') counts.skills += 1;
      if (p.section === 'freelance' || Boolean(p.client_name)) counts.freelance += 1;
    });

    return counts;
  }, [projects]);

  const categories = [
    { id: 'all', label: 'All Categories', icon: Layers },
    { id: 'video_editing', label: 'Video Editing', icon: Video },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'freelance', label: 'Freelance & Clients', icon: Briefcase },
    { id: 'skills', label: 'Skills & Learning', icon: GraduationCap }
  ];

  const resetAllFilters = () => {
    setSelectedSection('all');
    setSelectedUrgency('all');
    setSearchQuery('');
    setSortBy('urgency');
  };

  const isAnyFilterActive = selectedSection !== 'all' || selectedUrgency !== 'all' || searchQuery.trim() !== '';

  const getPriorityColor = (p?: string) => {
    switch (p) {
      case 'Hard':
      case 'High':
        return 'text-rose-300 bg-rose-500/10 border-rose-500/30';
      case 'Medium':
        return 'text-amber-300 bg-amber-500/10 border-amber-500/30';
      case 'Low':
      default:
        return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ready':
      case 'Posted':
      case 'Completed':
        return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30';
      case 'In Progress':
        return 'text-amber-300 bg-amber-500/10 border-amber-500/30';
      case 'Paused':
        return 'text-zinc-400 bg-zinc-900 border-zinc-800';
      case 'Planning':
      default:
        return 'text-blue-300 bg-blue-500/10 border-blue-500/30';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans animate-pulse">
        <div className="h-24 bg-zinc-950/80 border border-zinc-800 rounded-2xl p-5" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-36 bg-zinc-950/80 border border-zinc-850 rounded-2xl p-4 space-y-3" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans page-transition">
      {/* 1. TOP HERO & DEADLINE TELEMETRY CARDS */}
      <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold font-sans text-zinc-100 tracking-tight">
                  Deadlines & Delivery Hub
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                  Track upcoming deliverables sorted strictly by urgency and remaining time
                </p>
              </div>
            </div>
          </div>

          {/* Quick Urgency Metric Pills (Interactive Toggles) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            {/* 1. Overdue */}
            <button
              type="button"
              onClick={() => setSelectedUrgency(selectedUrgency === 'overdue' ? 'all' : 'overdue')}
              className={`px-3 py-2 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                selectedUrgency === 'overdue'
                  ? 'bg-rose-950/80 border-rose-500 ring-2 ring-rose-500/40 shadow-lg shadow-rose-950/50 scale-[1.02]'
                  : 'bg-zinc-900/80 hover:bg-zinc-850 border-zinc-800/90 hover:border-zinc-700'
              }`}
              title="Filter to overdue projects"
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 text-[10px] text-rose-400 font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-3 h-3" /> Overdue
                </div>
                {selectedUrgency === 'overdue' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                )}
              </div>
              <div className="text-base font-bold font-mono text-zinc-100 mt-0.5">
                {stats.overdueCount} <span className="text-xs text-zinc-500 font-normal">items</span>
              </div>
            </button>

            {/* 2. This Week (<= 7 Days) */}
            <button
              type="button"
              onClick={() => setSelectedUrgency(selectedUrgency === 'this_week' ? 'all' : 'this_week')}
              className={`px-3 py-2 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                selectedUrgency === 'this_week'
                  ? 'bg-amber-950/80 border-amber-500 ring-2 ring-amber-500/40 shadow-lg shadow-amber-950/50 scale-[1.02]'
                  : 'bg-zinc-900/80 hover:bg-zinc-850 border-zinc-800/90 hover:border-zinc-700'
              }`}
              title="Filter to projects due within 7 days"
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  <Flame className="w-3 h-3" /> &le; 7 Days
                </div>
                {selectedUrgency === 'this_week' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>
              <div className="text-base font-bold font-mono text-zinc-100 mt-0.5">
                {stats.dueThisWeekCount} <span className="text-xs text-zinc-500 font-normal">items</span>
              </div>
            </button>

            {/* 3. Upcoming (> 7 Days) */}
            <button
              type="button"
              onClick={() => setSelectedUrgency(selectedUrgency === 'upcoming' ? 'all' : 'upcoming')}
              className={`px-3 py-2 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                selectedUrgency === 'upcoming'
                  ? 'bg-blue-950/80 border-blue-500 ring-2 ring-blue-500/40 shadow-lg shadow-blue-950/50 scale-[1.02]'
                  : 'bg-zinc-900/80 hover:bg-zinc-850 border-zinc-800/90 hover:border-zinc-700'
              }`}
              title="Filter to future upcoming deliverables"
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                  <Calendar className="w-3 h-3" /> Upcoming
                </div>
                {selectedUrgency === 'upcoming' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                )}
              </div>
              <div className="text-base font-bold font-mono text-zinc-100 mt-0.5">
                {stats.upcomingCount} <span className="text-xs text-zinc-500 font-normal">items</span>
              </div>
            </button>

            {/* 4. Undated (No Deadline) */}
            <button
              type="button"
              onClick={() => setSelectedUrgency(selectedUrgency === 'undated' ? 'all' : 'undated')}
              className={`px-3 py-2 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                selectedUrgency === 'undated'
                  ? 'bg-zinc-800 border-zinc-500 ring-2 ring-zinc-400/30 shadow-lg scale-[1.02]'
                  : 'bg-zinc-900/80 hover:bg-zinc-850 border-zinc-800/90 hover:border-zinc-700'
              }`}
              title="Filter to undated projects"
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" /> Undated
                </div>
                {selectedUrgency === 'undated' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                )}
              </div>
              <div className="text-base font-bold font-mono text-zinc-100 mt-0.5">
                {stats.noDeadlineCount} <span className="text-xs text-zinc-500 font-normal">items</span>
              </div>
            </button>
          </div>
        </div>

        {/* 2. CATEGORY PILLS & CONTROLS TOOLBAR */}
        <div className="pt-3 border-t border-zinc-850/90 flex items-center justify-between gap-4 flex-wrap">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isCatActive = selectedSection === cat.id;
              const count = categoryCounts[cat.id] ?? 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedSection(isCatActive && cat.id !== 'all' ? 'all' : cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
                    isCatActive
                      ? 'bg-zinc-800 text-white shadow-sm border border-zinc-600 ring-1 ring-white/10'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isCatActive ? 'text-purple-400' : 'text-zinc-500'}`} />
                  <span>{cat.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                    isCatActive ? 'bg-zinc-700 text-zinc-100' : 'bg-zinc-900 text-zinc-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects or clients..."
                className="pl-8 pr-8 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-zinc-600 w-48 sm:w-56"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-zinc-500 hover:text-zinc-200 absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent outline-none cursor-pointer text-xs font-medium text-zinc-200"
              >
                <option value="urgency" className="bg-zinc-950">Sort: Earliest Deadline</option>
                <option value="urgency_desc" className="bg-zinc-950">Sort: Latest Deadline</option>
                <option value="priority" className="bg-zinc-950">Sort: Highest Priority</option>
                <option value="progress" className="bg-zinc-950">Sort: Task Progress</option>
                <option value="name" className="bg-zinc-950">Sort: Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. ACTIVE FILTERS PILL & RESET BAR */}
        {isAnyFilterActive && (
          <div className="pt-2.5 border-t border-zinc-850/80 flex items-center justify-between gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-zinc-500 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3 h-3 text-purple-400" /> Active Filters:
              </span>
              {selectedSection !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-lg bg-zinc-850 border border-zinc-750 text-purple-300 font-semibold flex items-center gap-1 text-[11px]">
                  Category: {categories.find((c) => c.id === selectedSection)?.label}
                  <button onClick={() => setSelectedSection('all')} className="hover:text-white ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedUrgency !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-lg bg-zinc-850 border border-zinc-750 text-amber-300 font-semibold flex items-center gap-1 text-[11px]">
                  Urgency: {
                    selectedUrgency === 'overdue'
                      ? '🚨 Overdue'
                      : selectedUrgency === 'this_week'
                      ? '🔥 ≤ 7 Days'
                      : selectedUrgency === 'upcoming'
                      ? '📅 Upcoming'
                      : '✨ Undated'
                  }
                  <button onClick={() => setSelectedUrgency('all')} className="hover:text-white ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery.trim() && (
                <span className="px-2.5 py-0.5 rounded-lg bg-zinc-850 border border-zinc-750 text-cyan-300 font-semibold flex items-center gap-1 text-[11px]">
                  Query: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-white ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={resetAllFilters}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors px-2.5 py-1 rounded-lg hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50"
            >
              <RotateCcw className="w-3 h-3" /> Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* 4. COMPACT PROJECT CARDS GRID */}
      {filteredAndSortedProjects.length === 0 ? (
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-12 text-center space-y-4">
          <Clock className="w-10 h-10 text-zinc-600 mx-auto animate-pulse" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-200">No project deliverables match your filter</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Try clicking "Reset All Filters" or adjusting category, urgency, or search text.
            </p>
          </div>
          <button
            onClick={resetAllFilters}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-750 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
            <span>Show All Projects ({projects.length})</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedProjects.map((project) => {
            const deadlineInfo = getDeadlineDetails(project.deadline);
            const taskStats = tasksByProject.get(project.id) || { total: 0, completed: 0 };
            const taskProgressPct = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;

            return (
              <div
                key={project.id}
                onClick={() => onOpenProject(project.id)}
                className="bg-zinc-950/80 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700/90 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl group flex flex-col justify-between space-y-3 relative overflow-hidden"
              >
                {/* Overdue / Urgent Accent top bar */}
                {deadlineInfo.isOverdue && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-rose-600" />
                )}
                {deadlineInfo.isToday && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
                )}

                {/* Card Header: Category & Priority & Client */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 uppercase">
                        {project.section.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md border ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                    </div>

                    {/* Status Badge & Edit Button */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProject(project);
                        }}
                        className="p-1 text-zinc-400 hover:text-blue-400 rounded hover:bg-zinc-850 transition-colors"
                        title="Edit Project Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                  </div>

                  {/* Project Title */}
                  <h3 className="text-sm sm:text-base font-bold text-zinc-100 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                    {project.name}
                  </h3>

                  {/* Client Name (if present) */}
                  {project.client_name && (
                    <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-medium">
                      <User className="w-3.5 h-3.5" />
                      <span>{project.client_name}</span>
                    </div>
                  )}
                </div>

                {/* Card Bottom: Prominent Deadline Badge & Task Progress */}
                <div className="space-y-2.5 pt-2 border-t border-zinc-850/80">
                  {/* Deadline Urgency Banner */}
                  <div className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${deadlineInfo.badgeColor}`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${deadlineInfo.dotColor}`} />
                      <span>{deadlineInfo.urgencyLabel}</span>
                    </div>
                    <span className="font-mono text-[11px] opacity-80">{deadlineInfo.formattedDate}</span>
                  </div>

                  {/* Checklist & Arrow Row */}
                  <div className="flex items-center justify-between gap-3 text-xs text-zinc-400 font-medium">
                    <div className="flex items-center gap-2 flex-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-[11px] font-mono text-zinc-300">
                        {taskStats.completed}/{taskStats.total} Tasks
                      </span>
                      {taskStats.total > 0 && (
                        <div className="flex-1 bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800/80 max-w-[80px]">
                          <div
                            className="bg-emerald-400 h-full rounded-full transition-all"
                            style={{ width: `${taskProgressPct}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 group-hover:text-blue-400 transition-colors">
                      <span>Open</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={!!editingProject}
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onSave={handleUpdateProject}
      />
    </div>
  );
};
