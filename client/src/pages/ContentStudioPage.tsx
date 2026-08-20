import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Project, Task, Goal, ProjectStatus, ProjectPriority } from '../types';
import {
  Clapperboard,
  CheckCircle2,
  Circle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Video,
  Target,
  ArrowRight,
  Sparkles,
  Clock,
  User,
  Layers
} from 'lucide-react';

interface ContentStudioPageProps {
  onOpenProject: (projectId: string) => void;
}

export const ContentStudioPage: React.FC<ContentStudioPageProps> = ({ onOpenProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

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

  const handleToggleTask = async (task: Task) => {
    await api.updateTask(task.id, { completed: !task.completed });
    loadData();
  };

  const handleMoveProjectStatus = async (projectId: string, newStatus: ProjectStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    await api.updateProject(projectId, { status: newStatus });
    loadData();
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
  const kanbanColumns: Array<{ id: ProjectStatus; title: string; color: string }> = [
    { id: 'Planning', title: '1. Planning', color: 'border-zinc-700' },
    { id: 'In Progress', title: '2. In Progress', color: 'border-blue-500' },
    { id: 'Ready', title: '3. Ready / Polish', color: 'border-amber-500' },
    { id: 'Posted', title: '4. Posted / Delivered', color: 'border-emerald-500' }
  ];

  // Calendar computations
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const calendarDays: Array<string | null> = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }

  const selectedDateGoals = goals.filter((g) => g.target_date === selectedDate);
  const selectedDateProjects = projects.filter((p) => p.deadline === selectedDate);
  const selectedDateTasks = tasks.filter((t) => t.due_date === selectedDate);

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

  if (loading) {
    return <div className="p-8 text-center font-mono text-xs text-zinc-500">LOADING CONTENT STUDIO...</div>;
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
              <h1 className="text-xl font-bold font-mono text-zinc-100 tracking-tight">CONTENT STUDIO & RADAR</h1>
              <p className="text-xs text-zinc-400 font-mono">
                Project Kanban Columns, Dynamic Top 5 Nearest Tasks, and Color-Coded Deadlines Calendar
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Goal
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Project
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Task
            </span>
          </div>
        </div>
      </div>

      {/* 2. TOP 5 NEAREST TASKS WIDGET */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" /> Top 5 Upcoming Action Steps (Auto-Replenishing)
          </h2>
          <span className="text-[11px] font-mono text-zinc-400">Ticking a task advances the queue</span>
        </div>

        {top5Tasks.length === 0 ? (
          <p className="text-xs font-mono text-zinc-400 text-center py-4">🎉 All nearest tasks completed!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {top5Tasks.map((t, idx) => {
              const p = projects.find((proj) => proj.id === t.project_id);
              return (
                <div
                  key={t.id}
                  onClick={() => handleToggleTask(t)}
                  className="bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-700/80 rounded-lg p-3 cursor-pointer group transition-all flex flex-col justify-between space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-zinc-400 group-hover:text-emerald-400">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-medium text-zinc-200 line-clamp-2">{t.title}</span>
                    </div>
                    <button type="button" className="text-zinc-400 group-hover:text-emerald-400 shrink-0 p-0.5">
                      <Circle className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-zinc-850 text-[10px] font-mono flex items-center justify-between text-zinc-400">
                    <span className="truncate max-w-[100px] text-zinc-300">{p?.name || 'Project'}</span>
                    <span className="text-purple-400">{t.due_date || 'Today'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. PROJECT KANBAN BOARD */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" /> Production Pipeline Kanban
          </h2>
          <span className="text-xs font-mono text-zinc-400">{projects.length} Total Projects</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map((col) => {
            const colProjects = projects.filter((p) => p.status === col.id);
            return (
              <div key={col.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-850">
                  <h3 className="font-mono font-bold text-xs text-zinc-200 uppercase">{col.title}</h3>
                  <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                    {colProjects.length}
                  </span>
                </div>

                <div className="space-y-2.5 min-h-[160px]">
                  {colProjects.length === 0 ? (
                    <div className="h-24 flex items-center justify-center text-[11px] font-mono text-zinc-400 border border-dashed border-zinc-900 rounded-lg">
                      Empty column
                    </div>
                  ) : (
                    colProjects.map((p) => {
                      const goal = goals.find((g) => g.id === p.goal_id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => onOpenProject(p.id)}
                          className="bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-600 rounded-lg p-3 cursor-pointer group transition-all space-y-2 shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className={`px-1.5 py-0.5 text-[9px] font-mono rounded border ${getPriorityColor(p.priority)}`}>
                              {p.priority}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400 uppercase">{p.section}</span>
                          </div>

                          <h4 className="text-xs font-bold text-zinc-100 group-hover:text-white line-clamp-1">{p.name}</h4>

                          {p.description && <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{p.description}</p>}

                          <div className="pt-2 border-t border-zinc-850 space-y-1 text-[10px] font-mono">
                            {goal && <div className="text-purple-300 truncate">🎯 {goal.title}</div>}
                            {p.client_name && <div className="text-cyan-300 truncate">👤 {p.client_name}</div>}
                            <div className="flex items-center justify-between text-zinc-400 pt-0.5">
                              <span>📅 {p.deadline || 'No Date'}</span>
                              <span className="text-zinc-300 group-hover:text-white flex items-center gap-0.5 font-bold">
                                Edit <ArrowRight className="w-3 h-3" />
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

      {/* 4. INTEGRATED COLOR-CODED DEADLINES CALENDAR */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">
              {monthNames[month]} {year} Deadlines Calendar
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-mono"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-mono"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Month Grid */}
          <div className="lg:col-span-2 space-y-2">
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] text-zinc-400 pb-1">
              <span>SUN</span>
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((dStr, idx) => {
                if (!dStr) {
                  return <div key={`empty_${idx}`} className="h-16 bg-zinc-900/10 rounded-lg border border-transparent" />;
                }

                const dayNum = parseInt(dStr.split('-')[2], 10);
                const hasGoals = goals.some((g) => g.target_date === dStr);
                const hasProjects = projects.some((p) => p.deadline === dStr);
                const hasTasks = tasks.some((t) => t.due_date === dStr);
                const isSelected = selectedDate === dStr;

                return (
                  <div
                    key={dStr}
                    onClick={() => setSelectedDate(dStr)}
                    className={`h-16 p-1.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-zinc-900 border-zinc-400 ring-1 ring-zinc-400'
                        : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <span className="font-mono text-xs font-bold text-zinc-300">{dayNum}</span>
                    <div className="flex items-center gap-1">
                      {hasGoals && <span className="w-2 h-2 rounded-full bg-purple-500" title="Main Goal" />}
                      {hasProjects && <span className="w-2 h-2 rounded-full bg-blue-500" title="Project" />}
                      {hasTasks && <span className="w-2 h-2 rounded-full bg-emerald-500" title="Task" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Inspector */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="border-b border-zinc-800 pb-2">
                <span className="text-[10px] font-mono text-zinc-400 uppercase block">Selected Date</span>
                <h3 className="text-sm font-mono font-bold text-zinc-100">{selectedDate}</h3>
              </div>

              {/* Goals on this date */}
              {selectedDateGoals.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-purple-400 block font-bold">🎯 Main Goals:</span>
                  {selectedDateGoals.map((g) => (
                    <div key={g.id} className="p-2 bg-purple-950/30 border border-purple-800/60 rounded text-xs text-purple-200">
                      {g.title}
                    </div>
                  ))}
                </div>
              )}

              {/* Projects on this date */}
              {selectedDateProjects.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-blue-400 block font-bold">🎬 Projects:</span>
                  {selectedDateProjects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => onOpenProject(p.id)}
                      className="p-2 bg-blue-950/30 hover:bg-blue-950/60 border border-blue-800/60 rounded text-xs text-blue-200 cursor-pointer flex items-center justify-between"
                    >
                      <span>{p.name}</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  ))}
                </div>
              )}

              {/* Tasks on this date */}
              {selectedDateTasks.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 block font-bold">✅ Tasks:</span>
                  {selectedDateTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleToggleTask(t)}
                      className="p-2 bg-emerald-950/30 border border-emerald-800/60 rounded text-xs text-emerald-200 flex items-center gap-2 cursor-pointer"
                    >
                      {t.completed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Circle className="w-3.5 h-3.5 text-emerald-400" />}
                      <span className={t.completed ? 'line-through text-zinc-400' : ''}>{t.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedDateGoals.length === 0 && selectedDateProjects.length === 0 && selectedDateTasks.length === 0 && (
                <p className="text-xs font-mono text-zinc-400 text-center py-6">No deadlines scheduled on {selectedDate}.</p>
              )}
            </div>

            <div className="text-[10px] font-mono text-zinc-400 pt-2 border-t border-zinc-800 text-center">
              All dates synced across devices
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
