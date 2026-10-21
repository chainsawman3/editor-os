import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Goal, Project, Task, NoteItem, SectionType } from '../types';
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
  Check,
  Megaphone,
  Briefcase,
  GraduationCap,
  StickyNote
} from 'lucide-react';
import { CalendarSkeleton } from '../components/common/SkeletonLoader';

interface CalendarPageProps {
  onOpenProject: (projectId: string) => void;
  onOpenGoal?: (goalId: string) => void;
  onOpenNote?: (noteId: string) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ onOpenProject, onOpenGoal, onOpenNote }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'agenda'>('month');

  // Filters
  const [showGoals, setShowGoals] = useState(true);
  const [showProjects, setShowProjects] = useState(true);
  const [showTasks, setShowTasks] = useState(true);
  const [showNotes, setShowNotes] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [g, p, t, n] = await Promise.all([api.getGoals(), api.getProjects(), api.getTasks(), api.getNotes()]);
      setGoals(g || []);
      setProjects(p || []);
      setTasks(t || []);
      setNotes(n || []);
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

  // Helper to determine project badge style & icon based on category/section
  const getProjectBadge = (p: Project) => {
    const sec = p.section || 'video_editing';
    const sub = (p.sub_section || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    const name = p.name.toLowerCase();

    if (sec === 'video_editing') {
      return {
        icon: Video,
        label: 'Video Editing',
        style: 'bg-blue-950/90 border-blue-600/80 text-blue-300 hover:bg-blue-900 shadow-blue-950/40'
      };
    }
    if (sec === 'marketing') {
      if (sub === 'instagram' || name.includes('insta') || desc.includes('reel')) {
        return {
          icon: Megaphone,
          label: 'Instagram Reel',
          style: 'bg-pink-950/90 border-pink-600/80 text-pink-300 hover:bg-pink-900 shadow-pink-950/40'
        };
      }
      if (sub === 'tiktok' || name.includes('tiktok') || desc.includes('tiktok')) {
        return {
          icon: Megaphone,
          label: 'TikTok Content',
          style: 'bg-cyan-950/90 border-cyan-600/80 text-cyan-300 hover:bg-cyan-900 shadow-cyan-950/40'
        };
      }
      if (sub === 'youtube' || name.includes('youtube') || name.includes('yt')) {
        return {
          icon: Video,
          label: 'YouTube Video',
          style: 'bg-red-950/90 border-red-600/80 text-red-300 hover:bg-red-900 shadow-red-950/40'
        };
      }
      return {
        icon: Megaphone,
        label: 'Marketing & Social',
        style: 'bg-emerald-950/90 border-emerald-600/80 text-emerald-300 hover:bg-emerald-900 shadow-emerald-950/40'
      };
    }
    if (sec === 'freelance') {
      return {
        icon: Briefcase,
        label: 'Client Project',
        style: 'bg-purple-950/90 border-purple-600/80 text-purple-300 hover:bg-purple-900 shadow-purple-950/40'
      };
    }
    if (sec === 'skills') {
      return {
        icon: GraduationCap,
        label: 'Skills Mastery',
        style: 'bg-amber-950/90 border-amber-600/80 text-amber-300 hover:bg-amber-900 shadow-amber-950/40'
      };
    }
    return {
      icon: Layers,
      label: 'Project',
      style: 'bg-blue-950/90 border-blue-600/80 text-blue-300 hover:bg-blue-900 shadow-blue-950/40'
    };
  };

  // Helper for Task Badge color on Calendar (Changes color when completed and stays!)
  const getTaskCalendarBadge = (t: Task) => {
    if (t.completed) {
      return {
        style: 'bg-emerald-950/90 hover:bg-emerald-900 border-emerald-500/80 text-emerald-400 shadow-sm shadow-emerald-950/50',
        title: `✅ [Completed Task] ${t.title} (Click to reopen)`,
        iconColor: 'text-emerald-400'
      };
    }
    if (t.priority === 'High') {
      return {
        style: 'bg-rose-950/90 hover:bg-rose-900 border-rose-500/80 text-rose-300 shadow-sm shadow-rose-950/50',
        title: `⚡ [High Priority Task] ${t.title} ${t.due_time ? `@ ${t.due_time}` : ''} (Click to complete)`,
        iconColor: 'text-rose-400'
      };
    }
    if (t.priority === 'Low') {
      return {
        style: 'bg-zinc-850 hover:bg-zinc-800 border-zinc-700/80 text-zinc-300 shadow-sm',
        title: `⚡ [Low Priority Task] ${t.title} (Click to complete)`,
        iconColor: 'text-zinc-400'
      };
    }
    return {
      style: 'bg-blue-950/90 hover:bg-blue-900 border-blue-500/80 text-blue-300 shadow-sm shadow-blue-950/50',
      title: `⚡ [Task] ${t.title} ${t.due_time ? `@ ${t.due_time}` : ''} (Click to complete)`,
      iconColor: 'text-blue-400'
    };
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

  // Helper to extract note calendar date (custom date or created_at fallback)
  const getNoteDate = (n: NoteItem): string => {
    if (n.date && typeof n.date === 'string' && n.date.trim() !== '' && n.date !== 'null') {
      return n.date.trim().split('T')[0];
    }
    if (n.created_at && typeof n.created_at === 'string' && n.created_at !== 'null') {
      return n.created_at.split('T')[0];
    }
    return '';
  };

  // Selected date events
  const selectedGoals = showGoals ? goals.filter((g) => g.target_date === selectedDate && matchFilter(g)) : [];
  const selectedProjects = showProjects ? projects.filter((p) => p.deadline === selectedDate && matchFilter(p)) : [];
  const selectedTasks = showTasks ? tasks.filter((t) => t.due_date === selectedDate && matchFilter(t)) : [];
  const selectedNotes = showNotes ? notes.filter((n) => getNoteDate(n) === selectedDate && matchFilter(n)) : [];

  // All upcoming deadlines for Agenda view
  const allDeadlines: Array<{
    id: string;
    type: 'Goal' | 'Project' | 'Task' | 'Note';
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

  if (showNotes) {
    notes.filter((n) => getNoteDate(n) && matchFilter(n)).forEach((n) => {
      allDeadlines.push({
        id: n.id,
        type: 'Note',
        title: n.title,
        date: getNoteDate(n),
        isOverdue: false,
        raw: n
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
    <div className="p-2.5 sm:p-6 space-y-3.5 sm:space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. TOP HEADER & MAIN CONTROLS */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-6 shadow-sm space-y-3.5 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <span className="p-2 sm:p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/80 text-purple-400 shadow-inner shrink-0">
              <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-base sm:text-xl font-bold text-zinc-100 tracking-tight">Calendar</h1>
                <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-mono rounded bg-purple-950/70 border border-purple-800/70 text-purple-300 font-bold uppercase">
                  Schedule
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400 font-medium hidden sm:block">
                Visual radar for Primary Objectives, Project Deliveries, and Daily Notes
              </p>
            </div>
          </div>

          {/* Month Navigation & View Modes */}
          <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2.5 flex-wrap">
            <button
              onClick={handleToday}
              className="px-2.5 sm:px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-750 hover:border-zinc-600 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-1 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs">Today</span>
            </button>

            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 sm:p-1 shadow-inner">
              <button
                onClick={handlePrevMonth}
                className="p-1 sm:p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <span className="px-2 sm:px-3 text-xs font-bold text-zinc-100 min-w-[100px] sm:min-w-[140px] text-center font-sans tracking-wide">
                {monthNames[month]} {year}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 sm:p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 sm:p-1 shadow-inner">
              <button
                onClick={() => setViewMode('month')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs rounded-lg font-semibold transition-all flex items-center gap-1 ${
                  viewMode === 'month'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <CalendarDays className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Month</span>
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs rounded-lg font-semibold transition-all flex items-center gap-1 ${
                  viewMode === 'week'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <CalendarRange className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Week</span>
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs rounded-lg font-semibold transition-all flex items-center gap-1 ${
                  viewMode === 'agenda'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ListOrdered className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>List</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. FILTER & COLOR LEGEND TOOLBAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-zinc-850">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-zinc-500 font-semibold text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center gap-1 mr-0.5 shrink-0">
              <Filter className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-400" /> Filter:
            </span>

            {/* Toggle Goals */}
            <button
              onClick={() => setShowGoals(!showGoals)}
              className={`px-2 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all border shrink-0 ${
                showGoals
                  ? 'bg-purple-950/80 border-purple-700/80 text-purple-300 shadow-sm'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400" />
              <span>Goals ({goals.filter((g) => g.target_date).length})</span>
            </button>

            {/* Toggle Projects */}
            <button
              onClick={() => setShowProjects(!showProjects)}
              className={`px-2 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all border shrink-0 ${
                showProjects
                  ? 'bg-blue-950/80 border-blue-700/80 text-blue-300 shadow-sm'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Video className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400" />
              <span>Projects ({projects.filter((p) => p.deadline).length})</span>
            </button>

            {/* Toggle Tasks */}
            <button
              onClick={() => setShowTasks(!showTasks)}
              className={`px-2 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all border shrink-0 ${
                showTasks
                  ? 'bg-emerald-950/80 border-emerald-700/80 text-emerald-300 shadow-sm'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
              <span>Tasks ({tasks.filter((t) => t.due_date).length})</span>
            </button>

            {/* Toggle Notes */}
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`px-2 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all border shrink-0 ${
                showNotes
                  ? 'bg-amber-950/80 border-amber-600/80 text-amber-300 shadow-sm'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <StickyNote className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
              <span>Notes ({notes.filter((n) => Boolean(getNoteDate(n))).length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Category Filter */}
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl text-[11px] sm:text-xs outline-none focus:border-zinc-600 font-medium"
            >
              <option value="all">All Categories</option>
              <option value="video_editing">Video Editing</option>
              <option value="marketing">Marketing & Content</option>
              <option value="skills">Skills & Mastery</option>
              <option value="freelance">Freelance</option>
            </select>

            {/* Quick Search */}
            <div className="relative min-w-[140px] flex-1 sm:max-w-xs">
              <Search className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-7 sm:pl-8 pr-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-xl text-[11px] sm:text-xs text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-zinc-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. MONTH GRID VIEW */}
      {viewMode === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Main Month Calendar Grid (3 Cols) */}
          <div className="lg:col-span-3 bg-zinc-950 border border-zinc-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 space-y-2 sm:space-y-3 shadow-sm">
            {/* Weekday Header Columns */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs font-bold text-zinc-400 pb-1.5 sm:pb-2 border-b border-zinc-850">
              <span className="text-zinc-500"><span className="sm:hidden">S</span><span className="hidden sm:inline">Sun</span></span>
              <span><span className="sm:hidden">M</span><span className="hidden sm:inline">Mon</span></span>
              <span><span className="sm:hidden">T</span><span className="hidden sm:inline">Tue</span></span>
              <span><span className="sm:hidden">W</span><span className="hidden sm:inline">Wed</span></span>
              <span><span className="sm:hidden">T</span><span className="hidden sm:inline">Thu</span></span>
              <span><span className="sm:hidden">F</span><span className="hidden sm:inline">Fri</span></span>
              <span className="text-zinc-500"><span className="sm:hidden">S</span><span className="hidden sm:inline">Sat</span></span>
            </div>

            {/* Days Grid Cells */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {calendarCells.map((cell) => {
                const { dateStr, dayNum, isCurrentMonth } = cell;
                const dayGoals = showGoals ? goals.filter((g) => g.target_date === dateStr && matchFilter(g)) : [];
                const dayProjects = showProjects ? projects.filter((p) => p.deadline === dateStr && matchFilter(p)) : [];
                const dayTasks = showTasks ? tasks.filter((t) => t.due_date === dateStr && matchFilter(t)) : [];
                const dayNotes = showNotes ? notes.filter((n) => getNoteDate(n) === dateStr && matchFilter(n)) : [];
                const totalDayItems = dayGoals.length + dayProjects.length + dayTasks.length + dayNotes.length;

                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;

                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`min-h-[58px] sm:min-h-[105px] md:min-h-[120px] p-1 sm:p-2.5 rounded-lg sm:rounded-xl border cursor-pointer transition-all duration-150 flex flex-col justify-between group overflow-hidden ${
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
                        className={`text-[10px] sm:text-xs font-bold px-1 sm:px-2 py-0.2 sm:py-0.5 rounded sm:rounded-lg transition-colors font-mono ${
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
                          className={`hidden sm:inline-block text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                            isCurrentMonth ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-900 text-zinc-600'
                          }`}
                        >
                          {totalDayItems}
                        </span>
                      )}
                    </div>

                    {/* EVENT ICONS ONLY (CLEAN COLOR-CODED BADGES) */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1 sm:gap-1.5 my-0.5 sm:my-1.5 overflow-hidden">
                      {/* Goals */}
                      {dayGoals.map((g) => (
                        <div
                          key={g.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenGoal && onOpenGoal(g.id);
                          }}
                          className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-purple-950/90 hover:bg-purple-900 border border-purple-600/80 hover:border-zinc-200 text-purple-300 shadow-sm transition-colors cursor-pointer"
                          title={`🎯 [Primary Goal] ${g.title} (Click to open objective)`}
                        >
                          <Target className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                        </div>
                      ))}

                      {/* Projects (Color-coded by category/platform) */}
                      {dayProjects.map((p) => {
                        const badge = getProjectBadge(p);
                        const IconComponent = badge.icon;
                        return (
                          <div
                            key={p.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenProject(p.id);
                            }}
                            className={`p-1 sm:p-1.5 rounded-md sm:rounded-lg border shadow-sm transition-colors hover:border-zinc-200 cursor-pointer ${badge.style}`}
                            title={`🎬 [${badge.label}] ${p.name} ${p.client_name ? `(Client: ${p.client_name})` : ''}`}
                          >
                            <IconComponent className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                          </div>
                        );
                      })}

                      {/* Tasks (Color changes when marked completed and stays on calendar!) */}
                      {dayTasks.map((t) => {
                        const badge = getTaskCalendarBadge(t);
                        return (
                          <div
                            key={t.id}
                            onClick={(e) => handleToggleTask(t, e)}
                            className={`p-1 sm:p-1.5 rounded-md sm:rounded-lg border transition-all hover:scale-105 active:scale-95 cursor-pointer ${badge.style}`}
                            title={badge.title}
                          >
                            <CheckCircle2 className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 ${badge.iconColor}`} />
                          </div>
                        );
                      })}

                      {/* Notes (Scheduled Note with StickyNote icon) */}
                      {dayNotes.map((n) => (
                        <div
                          key={n.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenNote && onOpenNote(n.id);
                          }}
                          className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-amber-950/90 hover:bg-amber-900 border border-amber-500/80 hover:border-zinc-200 text-amber-300 shadow-sm shadow-amber-950/40 transition-colors cursor-pointer"
                          title={`📝 [Note] ${n.title} (Click to open note)`}
                        >
                          <StickyNote className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                        </div>
                      ))}
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
                    <div
                      key={g.id}
                      onClick={() => onOpenGoal && onOpenGoal(g.id)}
                      className="p-3 bg-purple-950/30 hover:bg-purple-950/60 border border-purple-800/60 hover:border-purple-500 rounded-xl space-y-1.5 shadow-sm cursor-pointer group transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-purple-100 group-hover:text-white flex items-center gap-1.5">
                          {g.title}
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </div>
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
                  {selectedProjects.map((p) => {
                    const badge = getProjectBadge(p);
                    const IconComponent = badge.icon;
                    return (
                      <div
                        key={p.id}
                        onClick={() => onOpenProject(p.id)}
                        className="p-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-blue-500 rounded-xl cursor-pointer group transition-all flex items-center justify-between shadow-sm"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`p-1 rounded border ${badge.style}`}>
                              <IconComponent className="w-3 h-3" />
                            </span>
                            <span className="text-xs font-bold text-zinc-100 group-hover:text-white">
                              {p.name}
                            </span>
                          </div>
                          {p.client_name && <div className="text-[10px] text-zinc-400 font-medium pl-6">Client: {p.client_name}</div>}
                          <div className="text-[10px] text-zinc-400 font-mono pl-6">
                            <span className="text-blue-400">{badge.label}</span> • Status: <strong className="text-zinc-300">{p.status}</strong>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Day Tasks (Visual Color Status and Toggle) */}
              {selectedTasks.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Tasks ({selectedTasks.length})
                    </span>
                    <span className="text-[10px] text-zinc-500 lowercase font-mono">click to toggle</span>
                  </span>
                  {selectedTasks.map((t) => {
                    const badge = getTaskCalendarBadge(t);
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleToggleTask(t)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer group transition-all ${
                          t.completed
                            ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                            : 'bg-zinc-900/90 hover:bg-zinc-850 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <button
                            type="button"
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              t.completed
                                ? 'bg-emerald-600 border-emerald-500 text-white'
                                : 'border-zinc-700 text-transparent group-hover:border-emerald-500'
                            }`}
                          >
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </button>
                          <div className="min-w-0 flex-1">
                            <span className={`text-xs block truncate ${t.completed ? 'line-through text-emerald-400/70 font-normal' : 'text-zinc-200 font-medium'}`}>
                              {t.title}
                            </span>
                            {(t.due_time || t.priority) && (
                              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono mt-0.5">
                                {t.due_time && <span>@ {t.due_time}</span>}
                                {t.priority && (
                                  <span className={`px-1 rounded text-[9px] font-bold ${
                                    t.priority === 'High' ? 'text-rose-400 bg-rose-950/60' : t.priority === 'Medium' ? 'text-amber-400 bg-amber-950/60' : 'text-zinc-400'
                                  }`}>
                                    {t.priority}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          t.completed ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {t.completed ? 'Done' : 'Active'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Day Notes (Scheduled in Calendar) */}
              {selectedNotes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                    <StickyNote className="w-3.5 h-3.5" /> Scheduled Notes ({selectedNotes.length})
                  </span>
                  {selectedNotes.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => onOpenNote && onOpenNote(n.id)}
                      className="p-3 bg-amber-950/25 hover:bg-amber-950/50 border border-amber-500/40 hover:border-amber-400 rounded-xl space-y-1 shadow-sm cursor-pointer group transition-all flex items-center justify-between"
                    >
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded bg-amber-950/80 border border-amber-500/50 text-amber-400">
                            <StickyNote className="w-3 h-3" />
                          </span>
                          <span className="text-xs font-bold text-amber-200 group-hover:text-white truncate">
                            {n.title}
                          </span>
                        </div>
                        {n.folder && (
                          <div className="text-[10px] text-zinc-400 font-mono pl-6">
                            Folder: <strong className="text-zinc-300">{n.folder}</strong>
                          </div>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {selectedGoals.length === 0 && selectedProjects.length === 0 && selectedTasks.length === 0 && selectedNotes.length === 0 && (
                <div className="py-6 text-center space-y-4">
                  <div className="p-4 bg-zinc-900/50 border border-zinc-850 rounded-xl space-y-2">
                    <Clock className="w-5 h-5 text-zinc-500 mx-auto" />
                    <p className="text-xs text-zinc-400 font-medium">No deadlines, notes, or tasks scheduled on this day.</p>
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
                          onClick={() => {
                            if (item.type === 'Project') onOpenProject(item.id);
                            else if (item.type === 'Goal' && onOpenGoal) onOpenGoal(item.id);
                          }}
                          className={`p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between text-xs transition-colors ${
                            item.type === 'Project' || item.type === 'Goal' ? 'cursor-pointer hover:border-purple-500/50' : ''
                          }`}
                        >
                          <div className="truncate pr-2">
                            <span className="text-[9px] font-bold uppercase text-purple-400 block font-mono">
                              {item.type} • {item.date}
                            </span>
                            <span className="font-semibold text-zinc-200 truncate block">{item.title}</span>
                          </div>
                          {(item.type === 'Project' || item.type === 'Goal') && <ArrowRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="text-[11px] text-zinc-500 pt-3 border-t border-zinc-850 text-center font-medium">
              Click any goal or project to open its dedicated workspace
            </div>
          </div>
        </div>
      )}

      {/* 3. WEEK SPRINT VIEW (ICON-CODED) */}
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
              const dayNotes = showNotes ? notes.filter((n) => getNoteDate(n) === dStr && matchFilter(n)) : [];

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

                    {/* Events inside this Day (Icon Grid) */}
                    <div className="flex flex-wrap items-center gap-2">
                      {dayGoals.map((g) => (
                        <div
                          key={g.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenGoal && onOpenGoal(g.id);
                          }}
                          className="p-2 rounded-lg bg-purple-950/90 hover:bg-purple-900 border border-purple-600/80 hover:border-zinc-200 text-purple-300 shadow-sm transition-colors cursor-pointer"
                          title={`🎯 [Primary Goal] ${g.title} (Click to open objective)`}
                        >
                          <Target className="w-4 h-4" />
                        </div>
                      ))}

                      {dayProjects.map((p) => {
                        const badge = getProjectBadge(p);
                        const IconComponent = badge.icon;
                        return (
                          <div
                            key={p.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenProject(p.id);
                            }}
                            className={`p-2 rounded-lg border shadow-sm transition-colors hover:border-zinc-200 cursor-pointer ${badge.style}`}
                            title={`🎬 [${badge.label}] ${p.name} ${p.client_name ? `(Client: ${p.client_name})` : ''}`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                        );
                      })}

                      {dayTasks.map((t) => {
                        const badge = getTaskCalendarBadge(t);
                        return (
                          <div
                            key={t.id}
                            onClick={(e) => handleToggleTask(t, e)}
                            className={`p-2 rounded-lg border transition-all hover:scale-105 active:scale-95 cursor-pointer ${badge.style}`}
                            title={badge.title}
                          >
                            <CheckCircle2 className={`w-4 h-4 ${badge.iconColor}`} />
                          </div>
                        );
                      })}

                      {dayNotes.map((n) => (
                        <div
                          key={n.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenNote && onOpenNote(n.id);
                          }}
                          className="p-2 rounded-lg bg-amber-950/90 hover:bg-amber-900 border border-amber-500/80 hover:border-zinc-200 text-amber-300 shadow-sm shadow-amber-950/40 transition-colors cursor-pointer"
                          title={`📝 [Note] ${n.title}`}
                        >
                          <StickyNote className="w-4 h-4" />
                        </div>
                      ))}

                      {dayGoals.length === 0 && dayProjects.length === 0 && dayTasks.length === 0 && dayNotes.length === 0 && (
                        <div className="text-[11px] text-zinc-600 text-center py-6 w-full">No events</div>
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
                const isNote = item.type === 'Note';

                return (
                  <div
                    key={`${item.type}_${item.id}`}
                    onClick={() => {
                      if (isProject) onOpenProject(item.id);
                      else if (isGoal && onOpenGoal) onOpenGoal(item.id);
                      else if (isNote && onOpenNote) onOpenNote(item.id);
                    }}
                    className={`p-4 sm:p-5 flex items-center justify-between hover:bg-zinc-900/50 transition-colors ${
                      isProject || isGoal || isNote ? 'cursor-pointer group' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider font-mono ${
                          isGoal
                            ? 'bg-purple-950/80 border border-purple-800 text-purple-300'
                            : isProject
                            ? 'bg-blue-950/80 border border-blue-800 text-blue-300'
                            : isNote
                            ? 'bg-amber-950/80 border border-amber-500/80 text-amber-300'
                            : 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                        }`}
                      >
                        {item.type}
                      </span>
                      <div>
                        <div className={`text-xs sm:text-sm font-bold text-zinc-100 ${isProject || isGoal ? 'group-hover:text-purple-300' : isNote ? 'group-hover:text-amber-300' : ''} transition-colors`}>
                          {item.title}
                        </div>
                        {isProject && item.raw.client_name && (
                          <div className="text-[11px] text-zinc-400">Client: {item.raw.client_name}</div>
                        )}
                        {isNote && item.raw.folder && (
                          <div className="text-[11px] text-zinc-400">Folder: {item.raw.folder}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-mono font-bold ${item.isOverdue ? 'text-rose-400' : 'text-zinc-300'}`}>
                        {item.date} {item.isOverdue && '(Overdue)'}
                      </span>
                      {(isProject || isGoal || isNote) && (
                        <ArrowRight className={`w-4 h-4 text-zinc-500 ${isNote ? 'group-hover:text-amber-400' : 'group-hover:text-purple-400'} group-hover:translate-x-0.5 transition-transform`} />
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
