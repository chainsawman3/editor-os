import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Goal, Project, Task } from '../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Target,
  Video,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  Filter,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface CalendarPageProps {
  onOpenProject: (projectId: string) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ onOpenProject }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');

  // Filters
  const [showGoals, setShowGoals] = useState(true);
  const [showProjects, setShowProjects] = useState(true);
  const [showTasks, setShowTasks] = useState(true);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [g, p, t] = await Promise.all([api.getGoals(), api.getProjects(), api.getTasks()]);
      setGoals(g);
      setProjects(p);
      setTasks(t);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleToggleTask = async (task: Task) => {
    await api.updateTask(task.id, { completed: !task.completed });
    loadAllData();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  const calendarDays: Array<string | null> = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Selected date events
  const selectedGoals = showGoals ? goals.filter((g) => g.target_date === selectedDate) : [];
  const selectedProjects = showProjects ? projects.filter((p) => p.deadline === selectedDate) : [];
  const selectedTasks = showTasks ? tasks.filter((t) => t.due_date === selectedDate) : [];

  // All upcoming deadlines for Agenda view
  const allDeadlines: Array<{
    id: string;
    type: 'Goal' | 'Project' | 'Task';
    title: string;
    date: string;
    isOverdue: boolean;
    raw: any;
  }> = [];

  if (showGoals) {
    goals.filter((g) => g.target_date).forEach((g) => {
      allDeadlines.push({
        id: g.id,
        type: 'Goal',
        title: g.title,
        date: g.target_date!,
        isOverdue: g.target_date! < todayStr,
        raw: g
      });
    });
  }

  if (showProjects) {
    projects.filter((p) => p.deadline).forEach((p) => {
      allDeadlines.push({
        id: p.id,
        type: 'Project',
        title: p.name,
        date: p.deadline!,
        isOverdue: p.deadline! < todayStr,
        raw: p
      });
    });
  }

  if (showTasks) {
    tasks.filter((t) => t.due_date).forEach((t) => {
      allDeadlines.push({
        id: t.id,
        type: 'Task',
        title: t.title,
        date: t.due_date!,
        isOverdue: !t.completed && t.due_date! < todayStr,
        raw: t
      });
    });
  }

  allDeadlines.sort((a, b) => a.date.localeCompare(b.date));

  if (loading) {
    return <div className="p-8 text-center text-xs text-zinc-500 font-medium">Loading Deadlines Calendar...</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. TOP HEADER & CONTROLS */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-700/80 text-zinc-100">
              <CalendarIcon className="w-5 h-5 text-purple-400" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight">EXPANDED DEADLINES CALENDAR</h1>
              <p className="text-xs text-zinc-400">
                Full-screen schedule of your primary Goals, video production Projects, and Action Steps
              </p>
            </div>
          </div>

          {/* Month Navigation & View Modes */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleToday}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Today
            </button>

            <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded-lg p-0.5">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-bold text-zinc-200 min-w-[130px] text-center">
                {monthNames[month]} {year}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded-lg p-0.5 ml-2">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 text-xs rounded font-medium transition-all ${
                  viewMode === 'month' ? 'bg-zinc-100 text-zinc-950 font-bold shadow' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Month Grid
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`px-3 py-1 text-xs rounded font-medium transition-all ${
                  viewMode === 'agenda' ? 'bg-zinc-100 text-zinc-950 font-bold shadow' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Agenda List
              </button>
            </div>
          </div>
        </div>

        {/* Filter Badges Bar */}
        <div className="flex items-center gap-2 pt-3 border-t border-zinc-850 flex-wrap">
          <span className="text-xs font-medium text-zinc-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> FILTERS:
          </span>

          <button
            onClick={() => setShowGoals(!showGoals)}
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all border ${
              showGoals
                ? 'bg-purple-950/80 border-purple-700 text-purple-300 shadow-sm'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            🎯 Main Goals ({goals.filter((g) => g.target_date).length})
          </button>

          <button
            onClick={() => setShowProjects(!showProjects)}
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all border ${
              showProjects
                ? 'bg-blue-950/80 border-blue-700 text-blue-300 shadow-sm'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            🎬 Projects ({projects.filter((p) => p.deadline).length})
          </button>

          <button
            onClick={() => setShowTasks(!showTasks)}
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all border ${
              showTasks
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300 shadow-sm'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            ✅ Tasks ({tasks.filter((t) => t.due_date).length})
          </button>
        </div>
      </div>

      {/* 2. MONTH GRID VIEW */}
      {viewMode === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Expansive Month Calendar (3 Cols) */}
          <div className="lg:col-span-3 bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2 shadow-sm">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-zinc-400 pb-2 border-b border-zinc-850">
              <span className="text-zinc-500">Sunday</span>
              <span>Monday</span>
              <span>Tuesday</span>
              <span>Wednesday</span>
              <span>Thursday</span>
              <span>Friday</span>
              <span className="text-zinc-500">Saturday</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((dStr, idx) => {
                if (!dStr) {
                  return <div key={`empty_${idx}`} className="min-h-[120px] bg-zinc-900/10 rounded-lg border border-transparent" />;
                }

                const dayNum = parseInt(dStr.split('-')[2], 10);
                const dayGoals = showGoals ? goals.filter((g) => g.target_date === dStr) : [];
                const dayProjects = showProjects ? projects.filter((p) => p.deadline === dStr) : [];
                const dayTasks = showTasks ? tasks.filter((t) => t.due_date === dStr) : [];
                const totalDayItems = dayGoals.length + dayProjects.length + dayTasks.length;

                const isToday = dStr === todayStr;
                const isSelected = dStr === selectedDate;

                return (
                  <div
                    key={dStr}
                    onClick={() => setSelectedDate(dStr)}
                    className={`min-h-[125px] p-2 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-zinc-900 border-zinc-300 ring-2 ring-zinc-400/20 shadow-md'
                        : isToday
                        ? 'bg-zinc-900/90 border-blue-600/80'
                        : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    {/* Day Number Header */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                          isToday
                            ? 'bg-blue-600 text-white'
                            : isSelected
                            ? 'text-zinc-100'
                            : 'text-zinc-400'
                        }`}
                      >
                        {dayNum}
                      </span>

                      {totalDayItems > 0 && (
                        <span className="text-[10px] font-bold text-zinc-400">
                          {totalDayItems}
                        </span>
                      )}
                    </div>

                    {/* Event Pills inside Day Cell */}
                    <div className="space-y-1 my-1 overflow-hidden">
                      {dayGoals.slice(0, 1).map((g) => (
                        <div
                          key={g.id}
                          className="px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-800/80 text-purple-200 text-[10px] font-semibold truncate"
                          title={`Goal: ${g.title}`}
                        >
                          🎯 {g.title}
                        </div>
                      ))}

                      {dayProjects.slice(0, 2).map((p) => (
                        <div
                          key={p.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenProject(p.id);
                          }}
                          className="px-1.5 py-0.5 rounded bg-blue-950/80 hover:bg-blue-900 border border-blue-800/80 text-blue-200 text-[10px] font-semibold truncate transition-colors"
                          title={`Project: ${p.name}`}
                        >
                          🎬 {p.name}
                        </div>
                      ))}

                      {dayTasks.slice(0, 2).map((t) => (
                        <div
                          key={t.id}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center gap-1 ${
                            t.completed
                              ? 'bg-zinc-900 text-zinc-500 line-through'
                              : 'bg-emerald-950/80 border border-emerald-800/80 text-emerald-200'
                          }`}
                          title={`Task: ${t.title}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                          <span className="truncate">{t.title}</span>
                        </div>
                      ))}

                      {totalDayItems > 3 && (
                        <div className="text-[9px] font-bold text-zinc-400 pl-1">
                          +{totalDayItems - 3} more
                        </div>
                      )}
                    </div>

                    <div className="h-0.5" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. SELECTED DAY INSPECTOR PANEL (1 Col) */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between h-fit">
            <div className="space-y-4">
              <div className="border-b border-zinc-850 pb-3">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Scheduled for</span>
                <h3 className="text-lg font-bold text-zinc-100 mt-0.5">{selectedDate}</h3>
                {selectedDate === todayStr && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300 text-[10px] font-bold uppercase">
                    Today
                  </span>
                )}
              </div>

              {/* Goals */}
              {selectedGoals.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-purple-400 tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" /> Primary Goals ({selectedGoals.length})
                  </span>
                  {selectedGoals.map((g) => (
                    <div key={g.id} className="p-3 bg-purple-950/30 border border-purple-800/60 rounded-lg space-y-1">
                      <div className="text-xs font-bold text-purple-100">{g.title}</div>
                      {g.description && <p className="text-[11px] text-zinc-400 leading-relaxed">{g.description}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {selectedProjects.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-blue-400 tracking-wider flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" /> Projects Due ({selectedProjects.length})
                  </span>
                  {selectedProjects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => onOpenProject(p.id)}
                      className="p-3 bg-blue-950/30 hover:bg-blue-950/60 border border-blue-800/60 rounded-lg cursor-pointer group transition-all flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-blue-100 group-hover:text-white">{p.name}</div>
                        {p.client_name && <div className="text-[10px] text-zinc-400">Client: {p.client_name}</div>}
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  ))}
                </div>
              )}

              {/* Tasks */}
              {selectedTasks.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Action Steps ({selectedTasks.length})
                  </span>
                  {selectedTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleToggleTask(t)}
                      className="p-2.5 bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 rounded-lg flex items-center justify-between cursor-pointer group transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <button type="button" className={t.completed ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-200'}>
                          {t.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                        </button>
                        <span className={`text-xs ${t.completed ? 'line-through text-zinc-500' : 'text-zinc-200 font-medium'}`}>
                          {t.title}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedGoals.length === 0 && selectedProjects.length === 0 && selectedTasks.length === 0 && (
                <div className="text-center py-10 space-y-2">
                  <Clock className="w-6 h-6 text-zinc-600 mx-auto" />
                  <p className="text-xs text-zinc-400 font-medium">No deadlines or tasks scheduled on this day.</p>
                </div>
              )}
            </div>

            <div className="text-[11px] text-zinc-500 pt-3 border-t border-zinc-850 text-center font-medium">
              Click any project to open full workstation
            </div>
          </div>
        </div>
      )}

      {/* 3. AGENDA LIST VIEW */}
      {viewMode === 'agenda' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" /> Chronological Deadlines Timeline ({allDeadlines.length})
            </h2>
          </div>

          {allDeadlines.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-xs font-medium">No deadlines found matching active filters.</div>
          ) : (
            <div className="divide-y divide-zinc-900">
              {allDeadlines.map((item) => {
                const isGoal = item.type === 'Goal';
                const isProject = item.type === 'Project';
                const isTask = item.type === 'Task';

                return (
                  <div
                    key={`${item.type}_${item.id}`}
                    onClick={() => isProject && onOpenProject(item.id)}
                    className={`p-4 flex items-center justify-between hover:bg-zinc-900/40 transition-colors ${
                      isProject ? 'cursor-pointer group' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                          isGoal
                            ? 'bg-purple-950 border border-purple-800 text-purple-300'
                            : isProject
                            ? 'bg-blue-950 border border-blue-800 text-blue-300'
                            : 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                        }`}
                      >
                        {item.type}
                      </span>
                      <div>
                        <div className={`text-xs font-bold text-zinc-100 ${isProject ? 'group-hover:text-blue-300 transition-colors' : ''}`}>
                          {item.title}
                        </div>
                        {isProject && item.raw.client_name && (
                          <div className="text-[11px] text-zinc-400">Client: {item.raw.client_name}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-bold ${item.isOverdue ? 'text-rose-400' : 'text-zinc-300'}`}>
                        {item.date} {item.isOverdue && '(Overdue)'}
                      </span>
                      {isProject && <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
