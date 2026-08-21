import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Goal, Project, Task, SectionType } from '../types';
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
  ExternalLink,
  Plus,
  Search,
  CalendarDays,
  ListOrdered,
  CalendarRange,
  Zap,
  Tag,
  Check
} from 'lucide-react';
import { CalendarSkeleton } from '../components/common/SkeletonLoader';

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
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'agenda'>('month');

  // Filters
  const [showGoals, setShowGoals] = useState(true);
  const [showProjects, setShowProjects] = useState(true);
  const [showTasks, setShowTasks] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  const handleToggleTask = async (task: Task, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updatedStatus = !task.completed;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: updatedStatus } : t)));
    await api.updateTask(task.id, { completed: updatedStatus });
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday

  // Days in previous month for leading days
  const prevMonthDays = new Date(year, month, 0).getDate();

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

  // Construct continuous calendar grid with previous and next month trailing days
  interface CalendarCell {
    dateStr: string;
    dayNum: number;
    isCurrentMonth: boolean;
  }

  const calendarCells: CalendarCell[] = [];

  // 1. Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const prevDate = new Date(year, month - 1, d);
    const yStr = prevDate.getFullYear();
    const mStr = String(prevDate.getMonth() + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    calendarCells.push({
      dateStr: `${yStr}-${mStr}-${dStr}`,
      dayNum: d,
      isCurrentMonth: false
    });
  }

  // 2. Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      dateStr: dStr,
      dayNum: d,
      isCurrentMonth: true
    });
  }

  // 3. Next month trailing days to complete 35 or 42 grid cells
  const remaining = (7 - (calendarCells.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const nextDate = new Date(year, month + 1, d);
    const yStr = nextDate.getFullYear();
    const mStr = String(nextDate.getMonth() + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    calendarCells.push({
      dateStr: `${yStr}-${mStr}-${dStr}`,
      dayNum: d,
      isCurrentMonth: false
    });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper filter by section & search
  const matchFilter = (item: { section?: string; name?: string; title?: string }) => {
    if (selectedSection !== 'all' && item.section && item.section !== selectedSection) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const text = `${item.title || item.name || ''}`.toLowerCase();
      return text.includes(q);
    }
    return true;
  };

  // Selected date events
  const selectedGoals = showGoals ? goals.filter((g) => g.target_date === selectedDate && matchFilter(g)) : [];
  const selectedProjects = showProjects ? projects.filter((p) => p.deadline === selectedDate && matchFilter(p)) : [];
  const selectedTasks = showTasks ? tasks.filter((t) => t.due_date === selectedDate && matchFilter(t)) : [];

  // All upcoming deadlines for Agenda view
  const allDeadlines: Array<{
    id: string;
    type: 'Goal' | 'Project' | 'Task';
    title: string;
    date: string;
    isOverdue: boolean;
    section?: string;
    priority?: string;
    raw: any;
  }> = [];

  if (showGoals) {
    goals.filter((g) => g.target_date && matchFilter(g)).forEach((g) => {
      allDeadlines.push({
        id: g.id,
        type: 'Goal',
        title: g.title,
        date: g.target_date!,
        isOverdue: g.target_date! < todayStr,
        section: g.section,
        priority: g.priority,
        raw: g
      });
    });
  }

  if (showProjects) {
    projects.filter((p) => p.deadline && matchFilter(p)).forEach((p) => {
      allDeadlines.push({
        id: p.id,
        type: 'Project',
        title: p.name,
        date: p.deadline!,
        isOverdue: p.deadline! < todayStr && p.status !== 'Ready' && p.status !== 'Posted' && p.status !== 'Completed',
        section: p.section,
        priority: p.priority,
        raw: p
      });
    });
  }

  if (showTasks) {
    tasks.filter((t) => t.due_date && matchFilter(t)).forEach((t) => {
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

  // Formatted date string for selected day header
  const getFormattedSelectedDate = () => {
    try {
      const parts = selectedDate.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return selectedDate;
    }
  };

  // Week View: Get current week (Mon-Sun) around selected date
  const getWeekDays = () => {
    const curr = new Date(selectedDate);
    const day = curr.getDay(); // 0 is Sun
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(curr.setDate(diff));

    const week: string[] = [];
    for (let i = 0; i < 7; i++) {
      const next = new Date(monday);
      next.setDate(monday.getDate() + i);
      const y = next.getFullYear();
      const m = String(next.getMonth() + 1).padStart(2, '0');
      const d = String(next.getDate()).padStart(2, '0');
      week.push(`${y}-${m}-${d}`);
    }
    return week;
  };

  const weekDays = getWeekDays();

  // Nearest 3 upcoming items if selected date is empty
  const nearestUpcoming = allDeadlines.filter((item) => item.date >= todayStr).slice(0, 3);

  if (loading) {
    return <CalendarSkeleton />;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. TOP HEADER & MAIN CONTROLS */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/80 text-purple-400 shadow-inner">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Production & Milestones Calendar</h1>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-purple-950/70 border border-purple-800/70 text-purple-300 font-bold uppercase">
                  Sprint Schedule
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">
                Visual timeline for Primary Objectives, Project Deliveries, and Daily Action Steps
              </p>
            </div>
          </div>

          {/* Month Navigation & View Modes */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleToday}
              className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-750 hover:border-zinc-600 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Today</span>
            </button>

            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 shadow-inner">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-bold text-zinc-100 min-w-[140px] text-center font-sans tracking-wide">
                {monthNames[month]} {year}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 shadow-inner">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === 'month'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Month</span>
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === 'week'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <CalendarRange className="w-3.5 h-3.5" />
                <span>Week Sprint</span>
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === 'agenda'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Agenda List</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. FILTER & SEARCH TOOLBAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-850">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-zinc-500 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-zinc-400" /> Filters:
            </span>

            {/* Toggle Goals */}
            <button
              onClick={() => setShowGoals(!showGoals)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                showGoals
                  ? 'bg-purple-950/80 border-purple-700/80 text-purple-300 shadow-sm'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showGoals ? 'bg-purple-400' : 'bg-zinc-600'}`} />
              🎯 Goals ({goals.filter((g) => g.target_date).length})
            </button>

            {/* Toggle Projects */}
            <button
              onClick={() => setShowProjects(!showProjects)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                showProjects
                  ? 'bg-blue-950/80 border-blue-700/80 text-blue-300 shadow-sm'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showProjects ? 'bg-blue-400' : 'bg-zinc-600'}`} />
              🎬 Projects ({projects.filter((p) => p.deadline).length})
            </button>

            {/* Toggle Tasks */}
            <button
              onClick={() => setShowTasks(!showTasks)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                showTasks
                  ? 'bg-emerald-950/80 border-emerald-700/80 text-emerald-300 shadow-sm'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showTasks ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
              ⚡ Tasks ({tasks.filter((t) => t.due_date).length})
            </button>

            <div className="h-4 w-px bg-zinc-800 mx-1 hidden sm:block" />

            {/* Category Filter */}
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl text-xs outline-none focus:border-zinc-600 font-medium"
            >
              <option value="all">All Categories</option>
              <option value="video_editing">Video Editing</option>
              <option value="marketing">Marketing & Content</option>
              <option value="skills">Skills & Mastery</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deadlines..."
              className="w-full pl-8 pr-3 py-1 bg-zinc-900 border border-zinc-800 focus:border-zinc-600 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. MONTH GRID VIEW */}
      {viewMode === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Month Calendar Grid (3 Cols) */}
          <div className="lg:col-span-3 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
            {/* Weekday Header Columns */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-zinc-400 pb-2 border-b border-zinc-850">
              <span className="text-zinc-500">Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span className="text-zinc-500">Sat</span>
            </div>

            {/* Days Grid Cells */}
            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((cell) => {
                const { dateStr, dayNum, isCurrentMonth } = cell;
                const dayGoals = showGoals ? goals.filter((g) => g.target_date === dateStr && matchFilter(g)) : [];
                const dayProjects = showProjects ? projects.filter((p) => p.deadline === dateStr && matchFilter(p)) : [];
                const dayTasks = showTasks ? tasks.filter((t) => t.due_date === dateStr && matchFilter(t)) : [];
                const totalDayItems = dayGoals.length + dayProjects.length + dayTasks.length;

                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;

                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`min-h-[110px] sm:min-h-[125px] p-2 rounded-xl border cursor-pointer transition-all duration-150 flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-zinc-900 border-blue-500/80 ring-2 ring-blue-500/20 shadow-lg'
                        : isToday
                        ? 'bg-[#0f172a]/60 border-blue-500/60 shadow-sm'
                        : isCurrentMonth
                        ? 'bg-zinc-900/60 hover:bg-zinc-850/90 border-zinc-800/80 hover:border-emerald-500/50 hover:ring-1 hover:ring-emerald-500/20'
                        : 'bg-zinc-950/40 border-zinc-900/60 text-zinc-600 hover:bg-zinc-900/40'
                    }`}
                  >
                    {/* Day Number Header */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-lg transition-colors font-mono ${
                          isToday
                            ? 'bg-blue-600 text-white font-bold shadow-sm'
                            : isSelected
                            ? 'bg-zinc-800 text-white'
                            : isCurrentMonth
                            ? 'text-zinc-300 group-hover:text-white'
                            : 'text-zinc-600'
                        }`}
                      >
                        {dayNum}
                      </span>

                      {totalDayItems > 0 && (
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                            isCurrentMonth ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-900 text-zinc-600'
                          }`}
                        >
                          {totalDayItems}
                        </span>
                      )}
                    </div>

                    {/* Event Badges in Cell */}
                    <div className="space-y-1 my-1 overflow-hidden">
                      {/* Goals */}
                      {dayGoals.slice(0, 1).map((g) => (
                        <div
                          key={g.id}
                          className="px-1.5 py-0.5 rounded-md bg-purple-950/80 border border-purple-800/80 text-purple-200 text-[10px] font-semibold truncate flex items-center gap-1 shadow-sm"
                          title={`Goal: ${g.title}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                          <span className="truncate">{g.title}</span>
                        </div>
                      ))}

                      {/* Projects */}
                      {dayProjects.slice(0, 1).map((p) => (
                        <div
                          key={p.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenProject(p.id);
                          }}
                          className="px-1.5 py-0.5 rounded-md bg-blue-950/80 hover:bg-blue-900 border border-blue-800/80 text-blue-200 text-[10px] font-semibold truncate flex items-center gap-1 transition-colors shadow-sm"
                          title={`Project: ${p.name}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                          <span className="truncate">{p.name}</span>
                        </div>
                      ))}

                      {/* Tasks */}
                      {dayTasks.slice(0, 1).map((t) => (
                        <div
                          key={t.id}
                          onClick={(e) => handleToggleTask(t, e)}
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium truncate flex items-center gap-1 transition-colors ${
                            t.completed
                              ? 'bg-zinc-900/80 text-zinc-500 line-through'
                              : 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-200'
                          }`}
                          title={`Task: ${t.title}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.completed ? 'bg-zinc-600' : 'bg-emerald-400'}`} />
                          <span className="truncate">{t.title}</span>
                        </div>
                      ))}

                      {totalDayItems > 3 && (
                        <div className="text-[9px] font-bold text-zinc-400 pl-1 font-mono">
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

          {/* 3. SELECTED DAY INSPECTOR SIDEBAR (1 Col) */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-5 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header */}
              <div className="border-b border-zinc-850 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                    Scheduled For
                  </span>
                  {selectedDate === todayStr ? (
                    <span className="px-2 py-0.5 rounded-full bg-blue-950 border border-blue-800 text-blue-300 text-[10px] font-bold uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> Today
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-zinc-500">{selectedDate}</span>
                  )}
                </div>
                <h3 className="text-base font-bold text-zinc-100 mt-1">{getFormattedSelectedDate()}</h3>
              </div>

              {/* Day Goals */}
              {selectedGoals.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-purple-400 tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" /> Primary Goals ({selectedGoals.length})
                  </span>
                  {selectedGoals.map((g) => (
                    <div key={g.id} className="p-3 bg-purple-950/30 border border-purple-800/60 rounded-xl space-y-1 shadow-sm">
                      <div className="text-xs font-bold text-purple-100">{g.title}</div>
                      {g.description && <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">{g.description}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Day Projects */}
              {selectedProjects.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-blue-400 tracking-wider flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" /> Projects Due ({selectedProjects.length})
                  </span>
                  {selectedProjects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => onOpenProject(p.id)}
                      className="p-3 bg-blue-950/30 hover:bg-blue-950/60 border border-blue-800/60 hover:border-blue-500 rounded-xl cursor-pointer group transition-all flex items-center justify-between shadow-sm"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-blue-100 group-hover:text-white flex items-center gap-1.5">
                          {p.name}
                        </div>
                        {p.client_name && <div className="text-[10px] text-zinc-400 font-medium">Client: {p.client_name}</div>}
                        <div className="text-[10px] text-blue-300/80 font-mono">Status: {p.status}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              {/* Day Tasks */}
              {selectedTasks.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Action Steps ({selectedTasks.length})
                  </span>
                  {selectedTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleToggleTask(t)}
                      className="p-2.5 bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 rounded-xl flex items-center justify-between cursor-pointer group transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <button type="button" className={t.completed ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-emerald-400 transition-colors'}>
                          {t.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                        </button>
                        <span className={`text-xs ${t.completed ? 'line-through text-zinc-500 font-normal' : 'text-zinc-200 font-medium'}`}>
                          {t.title}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {selectedGoals.length === 0 && selectedProjects.length === 0 && selectedTasks.length === 0 && (
                <div className="py-6 text-center space-y-4">
                  <div className="p-4 bg-zinc-900/50 border border-zinc-850 rounded-xl space-y-2">
                    <Clock className="w-5 h-5 text-zinc-500 mx-auto" />
                    <p className="text-xs text-zinc-400 font-medium">No deadlines or tasks scheduled on this day.</p>
                  </div>

                  {/* Nearest Upcoming Summary Widget */}
                  {nearestUpcoming.length > 0 && (
                    <div className="text-left space-y-2 pt-2 border-t border-zinc-850">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Nearest Upcoming Deliveries:
                      </span>
                      {nearestUpcoming.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => item.type === 'Project' && onOpenProject(item.id)}
                          className={`p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between text-xs transition-colors ${
                            item.type === 'Project' ? 'cursor-pointer hover:border-blue-500/50' : ''
                          }`}
                        >
                          <div className="truncate pr-2">
                            <span className="text-[9px] font-bold uppercase text-purple-400 block font-mono">
                              {item.type} • {item.date}
                            </span>
                            <span className="font-semibold text-zinc-200 truncate block">{item.title}</span>
                          </div>
                          {item.type === 'Project' && <ArrowRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="text-[11px] text-zinc-500 pt-3 border-t border-zinc-850 text-center font-medium">
              Click any project card to open its workspace
            </div>
          </div>
        </div>
      )}

      {/* 3. WEEK SPRINT VIEW */}
      {viewMode === 'week' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <CalendarRange className="w-4 h-4 text-purple-400" /> 7-Day Sprint Timeline ({weekDays[0]} — {weekDays[6]})
            </h2>
            <span className="text-xs text-zinc-400 font-mono">Select any day to inspect</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDays.map((dStr) => {
              const dayDate = new Date(dStr);
              const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = dStr.split('-')[2];
              const isToday = dStr === todayStr;
              const isSelected = dStr === selectedDate;

              const dayGoals = showGoals ? goals.filter((g) => g.target_date === dStr && matchFilter(g)) : [];
              const dayProjects = showProjects ? projects.filter((p) => p.deadline === dStr && matchFilter(p)) : [];
              const dayTasks = showTasks ? tasks.filter((t) => t.due_date === dStr && matchFilter(t)) : [];

              return (
                <div
                  key={dStr}
                  onClick={() => setSelectedDate(dStr)}
                  className={`min-h-[220px] p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-zinc-900 border-blue-500 ring-1 ring-blue-500/20'
                      : isToday
                      ? 'bg-[#0f172a]/70 border-blue-500/60'
                      : 'bg-zinc-900/60 hover:bg-zinc-850 border-zinc-800/80'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <span className="text-xs font-bold text-zinc-400 uppercase">{dayName}</span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-lg font-mono ${
                          isToday ? 'bg-blue-600 text-white' : 'text-zinc-200'
                        }`}
                      >
                        {dayNum}
                      </span>
                    </div>

                    {/* Events inside this Day */}
                    <div className="space-y-1.5">
                      {dayGoals.map((g) => (
                        <div key={g.id} className="p-2 bg-purple-950/80 border border-purple-800/80 text-purple-200 rounded-lg text-xs font-medium">
                          🎯 {g.title}
                        </div>
                      ))}

                      {dayProjects.map((p) => (
                        <div
                          key={p.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenProject(p.id);
                          }}
                          className="p-2 bg-blue-950/80 hover:bg-blue-900 border border-blue-800/80 text-blue-200 rounded-lg text-xs font-medium transition-colors"
                        >
                          🎬 {p.name}
                        </div>
                      ))}

                      {dayTasks.map((t) => (
                        <div
                          key={t.id}
                          onClick={(e) => handleToggleTask(t, e)}
                          className={`p-1.5 rounded-lg text-[11px] flex items-center gap-1.5 ${
                            t.completed ? 'bg-zinc-900 text-zinc-500 line-through' : 'bg-emerald-950/80 border border-emerald-800/80 text-emerald-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.completed ? 'bg-zinc-600' : 'bg-emerald-400'}`} />
                          <span className="truncate">{t.title}</span>
                        </div>
                      ))}

                      {dayGoals.length === 0 && dayProjects.length === 0 && dayTasks.length === 0 && (
                        <div className="text-[11px] text-zinc-600 text-center py-6">No deadlines</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. AGENDA LIST VIEW */}
      {viewMode === 'agenda' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" /> Chronological Deadlines Timeline ({allDeadlines.length})
            </h2>
          </div>

          {allDeadlines.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 text-xs font-medium">
              No deadlines found matching active filters.
            </div>
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
                    className={`p-4 sm:p-5 flex items-center justify-between hover:bg-zinc-900/50 transition-colors ${
                      isProject ? 'cursor-pointer group' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider font-mono ${
                          isGoal
                            ? 'bg-purple-950/80 border border-purple-800 text-purple-300'
                            : isProject
                            ? 'bg-blue-950/80 border border-blue-800 text-blue-300'
                            : 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                        }`}
                      >
                        {item.type}
                      </span>
                      <div>
                        <div className={`text-xs sm:text-sm font-bold text-zinc-100 ${isProject ? 'group-hover:text-blue-300 transition-colors' : ''}`}>
                          {item.title}
                        </div>
                        {isProject && item.raw.client_name && (
                          <div className="text-[11px] text-zinc-400">Client: {item.raw.client_name}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-mono font-bold ${item.isOverdue ? 'text-rose-400' : 'text-zinc-300'}`}>
                        {item.date} {item.isOverdue && '(Overdue)'}
                      </span>
                      {isProject && (
                        <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                      )}
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
