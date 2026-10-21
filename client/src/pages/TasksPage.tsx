import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api';
import { Task, Project, TaskPriority, TaskReminderType } from '../types';
import {
  CheckCircle2,
  Circle,
  Plus,
  Calendar,
  Clock,
  Bell,
  BellOff,
  AlertTriangle,
  Search,
  Filter,
  Trash2,
  Edit2,
  ArrowRight,
  Flame,
  Check,
  X,
  Sparkles,
  CalendarDays,
  Tag,
  Folder,
  Volume2
} from 'lucide-react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  playNotificationSound,
  showTaskNotification
} from '../utils/notifications';

interface TasksPageProps {
  onOpenProject?: (projectId: string) => void;
  onNavigateToCalendar?: (dateStr: string) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({ onOpenProject, onNavigateToCalendar }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Search
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formDueTime, setFormDueTime] = useState('18:00');
  const [formPriority, setFormPriority] = useState<TaskPriority>('Medium');
  const [formReminderType, setFormReminderType] = useState<TaskReminderType>('same_day');
  const [formReminderDate, setFormReminderDate] = useState('');
  const [formReminderTime, setFormReminderTime] = useState('09:00');
  const [formProjectId, setFormProjectId] = useState<string>('');

  // Notification Permission State
  const [notificationPerm, setNotificationPerm] = useState<NotificationPermission>(getNotificationPermission());

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [t, p] = await Promise.all([api.getTasks(), api.getProjects()]);
      setTasks(t || []);
      setProjects(p || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setNotificationPerm(res);
    if (res === 'granted') {
      playNotificationSound();
    }
  };

  const handleTestNotification = () => {
    playNotificationSound();
    showTaskNotification({
      id: 'test_notification',
      title: 'ტესტური შეტყობინება / Test Alert',
      description: 'შეტყობინებების სისტემა წარმატებით ჩაირთო! შეხსენებები იმუშავებს დედლაინის დროს.',
      due_date: todayStr,
      due_time: '18:00',
      priority: 'High',
      completed: false,
      order_index: 0,
      created_at: new Date().toISOString()
    });
  };

  const openCreateModal = (presetDate?: string) => {
    setEditingTask(null);
    setFormTitle('');
    setFormDescription('');
    setFormDueDate(presetDate || todayStr);
    setFormDueTime('18:00');
    setFormPriority('Medium');
    setFormReminderType('same_day');
    setFormReminderDate(presetDate || todayStr);
    setFormReminderTime('09:00');
    setFormProjectId('');
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || '');
    setFormDueDate(task.due_date || '');
    setFormDueTime(task.due_time || '18:00');
    setFormPriority(task.priority || 'Medium');
    setFormReminderType(task.reminder_type || 'same_day');
    setFormReminderDate(task.reminder_date || task.due_date || '');
    setFormReminderTime(task.reminder_time || '09:00');
    setFormProjectId(task.project_id || '');
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingTask) {
      const updates: Partial<Task> = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        due_date: formDueDate || null,
        due_time: formDueTime || null,
        priority: formPriority,
        reminder_type: formReminderType,
        reminder_date: formReminderDate || null,
        reminder_time: formReminderTime || null,
        project_id: formProjectId || null
      };

      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? { ...t, ...updates } : t)));
      setIsModalOpen(false);
      await api.updateTask(editingTask.id, updates);
    } else {
      const newTaskData: Partial<Task> = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        due_date: formDueDate || null,
        due_time: formDueTime || null,
        priority: formPriority,
        reminder_type: formReminderType,
        reminder_date: formReminderDate || null,
        reminder_time: formReminderTime || null,
        project_id: formProjectId || null,
        completed: false,
        stage: 'Editing',
        order_index: 0
      };

      setIsModalOpen(false);
      const created = await api.createTask(newTaskData);
      setTasks((prev) => [created, ...prev]);
    }
  };

  const handleToggleTask = async (task: Task) => {
    const updatedStatus = !task.completed;
    if (updatedStatus) {
      playNotificationSound();
    }
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, completed: updatedStatus, completed_at: updatedStatus ? new Date().toISOString() : null }
          : t
      )
    );
    await api.updateTask(task.id, { completed: updatedStatus });
  };

  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('დარწმუნებული ხართ, რომ გსურთ დავალების წაშლა?')) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await api.deleteTask(id);
  };

  // Helper for quick date button
  const setQuickDate = (daysFromToday: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysFromToday);
    const dateStr = target.toISOString().split('T')[0];
    setFormDueDate(dateStr);
    if (formReminderType === 'same_day' || formReminderType === 'custom') {
      setFormReminderDate(dateStr);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const today = tasks.filter((t) => !t.completed && t.due_date === todayStr).length;
    const overdue = tasks.filter((t) => !t.completed && t.due_date && t.due_date < todayStr).length;
    const upcoming = tasks.filter((t) => !t.completed && t.due_date && t.due_date > todayStr).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, today, overdue, upcoming, percent };
  }, [tasks, todayStr]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Tab filter
      if (activeTab === 'completed' && !task.completed) return false;
      if (activeTab === 'today') {
        if (task.completed || task.due_date !== todayStr) return false;
      }
      if (activeTab === 'overdue') {
        if (task.completed || !task.due_date || task.due_date >= todayStr) return false;
      }
      if (activeTab === 'upcoming') {
        if (task.completed || !task.due_date || task.due_date <= todayStr) return false;
      }

      // Priority filter
      if (priorityFilter !== 'all' && (task.priority || 'Medium') !== priorityFilter) return false;

      // Project filter
      if (projectFilter === 'standalone' && task.project_id) return false;
      if (projectFilter !== 'all' && projectFilter !== 'standalone' && task.project_id !== projectFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = (task.description || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }

      return true;
    });
  }, [tasks, activeTab, priorityFilter, projectFilter, searchQuery, todayStr]);

  // Sort: Overdue first, then by due_date ASC, then priority
  const sortedTasks = useMemo(() => {
    const priorityWeights: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
    return [...filteredTasks].sort((a, b) => {
      // Completed at the bottom
      if (a.completed !== b.completed) return a.completed ? 1 : -1;

      // Overdue priority
      const aOverdue = !a.completed && a.due_date && a.due_date < todayStr;
      const bOverdue = !b.completed && b.due_date && b.due_date < todayStr;
      if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;

      // Due date ASC
      if (a.due_date && b.due_date) {
        if (a.due_date !== b.due_date) return a.due_date.localeCompare(b.due_date);
        // Time ASC
        const aTime = a.due_time || '23:59';
        const bTime = b.due_time || '23:59';
        if (aTime !== bTime) return aTime.localeCompare(bTime);
      } else if (a.due_date && !b.due_date) {
        return -1;
      } else if (!a.due_date && b.due_date) {
        return 1;
      }

      // Priority DESC
      const aWeight = priorityWeights[a.priority || 'Medium'] || 2;
      const bWeight = priorityWeights[b.priority || 'Medium'] || 2;
      if (aWeight !== bWeight) return bWeight - aWeight;

      return b.created_at.localeCompare(a.created_at);
    });
  }, [filteredTasks, todayStr]);

  const getPriorityBadge = (p?: TaskPriority) => {
    switch (p) {
      case 'High':
        return { label: 'High', style: 'bg-rose-950/80 text-rose-300 border-rose-800/60' };
      case 'Low':
        return { label: 'Low', style: 'bg-zinc-800 text-zinc-400 border-zinc-700/60' };
      case 'Medium':
      default:
        return { label: 'Medium', style: 'bg-amber-950/80 text-amber-300 border-amber-800/60' };
    }
  };

  const formatDeadlineDisplay = (dueDate?: string | null, dueTime?: string | null) => {
    if (!dueDate) return { label: 'No Deadline', isOverdue: false, isToday: false };

    const isToday = dueDate === todayStr;
    const isOverdue = dueDate < todayStr;
    const timeStr = dueTime ? ` @ ${dueTime}` : '';

    if (isToday) return { label: `Today${timeStr}`, isOverdue: false, isToday: true };

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    if (dueDate === tomorrowStr) return { label: `Tomorrow${timeStr}`, isOverdue: false, isToday: false };

    try {
      const parts = dueDate.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { label: `${formatted}${timeStr}`, isOverdue, isToday: false };
    } catch {
      return { label: `${dueDate}${timeStr}`, isOverdue, isToday: false };
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. TOP HEADER & METRICS */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Tasks & To-Dos
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              მართე დამოუკიდებელი დავალებები, მიუთითე დედლაინები და მიიღე შეტყობინებები ზუსტ დროს.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Notification Permission Indicator */}
            {notificationPerm !== 'granted' && isNotificationSupported() && (
              <button
                onClick={handleRequestPermission}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 transition-all flex items-center gap-1.5 shadow-sm"
                title="ჩართე ბრაუზერის შეტყობინებები დედლაინის შეხსენებისთვის"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Enable Alerts</span>
              </button>
            )}

            {notificationPerm === 'granted' && (
              <button
                onClick={handleTestNotification}
                className="px-2.5 py-2 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 transition-colors flex items-center gap-1.5"
                title="გატესტე შეტყობინების ხმა და ფანჯარა"
              >
                <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Test Alert</span>
              </button>
            )}

            <button
              onClick={() => openCreateModal()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center gap-1.5 shadow-sm shadow-blue-900/30 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Notification Status Banner if not granted */}
        {notificationPerm === 'default' && isNotificationSupported() && (
          <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-300">
              <Bell className="w-4 h-4 shrink-0 text-amber-400 animate-pulse" />
              <span>
                გსურთ მიიღოთ შეტყობინებები დავალების დედლაინის დროს? დააჭირეთ ჩართვას.
              </span>
            </div>
            <button
              onClick={handleRequestPermission}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-xs shrink-0"
            >
              ჩართვა
            </button>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
          <div
            onClick={() => setActiveTab('all')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              activeTab === 'all'
                ? 'bg-zinc-900 border-zinc-700 shadow-sm'
                : 'bg-zinc-900/40 border-zinc-850 hover:bg-zinc-900/70'
            }`}
          >
            <span className="text-[11px] font-medium text-zinc-400 block">Total Tasks</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-zinc-100">{stats.total}</span>
              <span className="text-[10px] text-zinc-500">{stats.percent}% done</span>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('today')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              activeTab === 'today'
                ? 'bg-blue-950/40 border-blue-500/60 shadow-sm'
                : 'bg-zinc-900/40 border-zinc-850 hover:bg-zinc-900/70'
            }`}
          >
            <span className="text-[11px] font-medium text-blue-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Due Today
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-blue-200">{stats.today}</span>
              <span className="text-[10px] text-zinc-500">Active</span>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('overdue')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              activeTab === 'overdue'
                ? 'bg-rose-950/50 border-rose-500/60 shadow-sm'
                : 'bg-zinc-900/40 border-zinc-850 hover:bg-zinc-900/70'
            }`}
          >
            <span className="text-[11px] font-medium text-rose-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Overdue
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-rose-300">{stats.overdue}</span>
              <span className="text-[10px] text-rose-500 font-semibold">{stats.overdue > 0 ? 'Urgent' : 'Clear'}</span>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('completed')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              activeTab === 'completed'
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-sm'
                : 'bg-zinc-900/40 border-zinc-850 hover:bg-zinc-900/70'
            }`}
          >
            <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> Completed
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-emerald-300">{stats.completed}</span>
              <span className="text-[10px] text-zinc-500">{stats.percent}% rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FILTERS, SEARCH & TABS */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-3 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800/80 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'all'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'today'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-blue-300'
              }`}
            >
              Today ({stats.today})
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-purple-300'
              }`}
            >
              Upcoming ({stats.upcoming})
            </button>
            <button
              onClick={() => setActiveTab('overdue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'overdue'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-rose-300'
              }`}
            >
              Overdue ({stats.overdue})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'completed'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-emerald-300'
              }`}
            >
              Done ({stats.completed})
            </button>
          </div>

          {/* Search & Dropdown Filters */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-7 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500/60"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700"
            >
              <option value="all">All Priorities</option>
              <option value="High">🔴 High Priority</option>
              <option value="Medium">🟡 Medium Priority</option>
              <option value="Low">🟢 Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. TASKS LIST */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="p-12 text-center bg-zinc-950 border border-zinc-850 rounded-2xl">
            <div className="w-7 h-7 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-zinc-400">დავალებები იტვირთება...</p>
          </div>
        ) : sortedTasks.length === 0 ? (
          <div className="p-12 text-center bg-zinc-950 border border-zinc-850 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-200">დავალებები არ მოიძებნა</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                {activeTab === 'completed'
                  ? 'დასრულებული დავალებები ჯერ არ არის.'
                  : 'შექმენით ახალი დამოუკიდებელი დავალება და მიუთითეთ დედლაინი.'}
              </p>
            </div>
            <button
              onClick={() => openCreateModal()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>დაამატე დავალება</span>
            </button>
          </div>
        ) : (
          sortedTasks.map((task) => {
            const deadline = formatDeadlineDisplay(task.due_date, task.due_time);
            const priorityBadge = getPriorityBadge(task.priority);
            const linkedProject = projects.find((p) => p.id === task.project_id);

            return (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task)}
                className={`group p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-150 cursor-pointer flex items-start gap-3 sm:gap-4 select-none ${
                  task.completed
                    ? 'bg-zinc-950/50 border-zinc-850/60 opacity-70 hover:opacity-100'
                    : deadline.isOverdue
                    ? 'bg-rose-950/20 hover:bg-rose-950/30 border-rose-900/40 hover:border-rose-700/60'
                    : deadline.isToday
                    ? 'bg-blue-950/20 hover:bg-blue-950/30 border-blue-900/40 hover:border-blue-700/60'
                    : 'bg-zinc-950 hover:bg-zinc-900/80 border-zinc-850 hover:border-zinc-750'
                }`}
              >
                {/* Custom Checkbox */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleTask(task);
                  }}
                  className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                    task.completed
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm shadow-emerald-950'
                      : 'border-zinc-700 hover:border-emerald-500 bg-zinc-900 text-transparent hover:text-emerald-400'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>

                {/* Body Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className={`text-xs sm:text-sm font-semibold transition-colors break-words ${
                        task.completed
                          ? 'line-through text-zinc-500 font-normal'
                          : 'text-zinc-100 group-hover:text-white'
                      }`}
                    >
                      {task.title}
                    </h3>

                    {/* Action buttons (Edit, Delete, Calendar Jump) */}
                    <div className="flex items-center gap-1 shrink-0 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {task.due_date && onNavigateToCalendar && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToCalendar(task.due_date!);
                          }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-300 hover:bg-zinc-850 transition-colors"
                          title="კალენდარში ნახვა"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(task);
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors"
                        title="რედაქტირება"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteTask(task.id, e)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="წაშლა"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-normal whitespace-pre-line line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {/* Metadata Tags */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {/* Deadline Badge */}
                    {task.due_date && (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                          task.completed
                            ? 'bg-zinc-900 text-zinc-500 border-zinc-800'
                            : deadline.isOverdue
                            ? 'bg-rose-950/80 text-rose-300 border-rose-800/80'
                            : deadline.isToday
                            ? 'bg-blue-950/80 text-blue-300 border-blue-800/80'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                        }`}
                      >
                        <CalendarDays className="w-3 h-3" />
                        <span>{deadline.label}</span>
                      </span>
                    )}

                    {/* Reminder Badge */}
                    {task.reminder_type && task.reminder_type !== 'none' && !task.completed && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-950/60 text-purple-300 border border-purple-800/60">
                        <Bell className="w-3 h-3 text-purple-400" />
                        <span>
                          {task.reminder_type === 'same_day'
                            ? 'On deadline'
                            : task.reminder_type === '1_hour_before'
                            ? '1h before'
                            : task.reminder_type === '1_day_before'
                            ? '1d before'
                            : `${task.reminder_date || ''} ${task.reminder_time || ''}`}
                        </span>
                      </span>
                    )}

                    {/* Priority Badge */}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${priorityBadge.style}`}
                    >
                      {priorityBadge.label}
                    </span>

                    {/* Linked Project or Standalone */}
                    {linkedProject ? (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenProject && onOpenProject(linkedProject.id);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 hover:border-zinc-700 transition-colors"
                        title="გადადი პროექტზე"
                      >
                        <Folder className="w-3 h-3 text-blue-400" />
                        <span className="truncate max-w-[120px]">{linkedProject.name}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-500 font-mono">Independent</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. MODAL FOR CREATE / EDIT TASK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-8"
          >
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>{editingTask ? 'დავალების რედაქტირება' : 'ახალი დავალების დამატება'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
                  სათაური / Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="მაგ: ვიდეოს ხმის გაწმენდა & მასტერინგი"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
                  დეტალები / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="დამატებითი შენიშვნები ან ნაბიჯები..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Deadline Date & Time */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider flex items-center justify-between">
                  <span>დედლაინი / Deadline</span>
                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1 font-normal font-sans">
                    <button
                      type="button"
                      onClick={() => setQuickDate(0)}
                      className="px-2 py-0.5 rounded bg-zinc-850 hover:bg-zinc-800 text-[10px] text-zinc-300"
                    >
                      დღეს
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(1)}
                      className="px-2 py-0.5 rounded bg-zinc-850 hover:bg-zinc-800 text-[10px] text-zinc-300"
                    >
                      ხვალ
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(3)}
                      className="px-2 py-0.5 rounded bg-zinc-850 hover:bg-zinc-800 text-[10px] text-zinc-300"
                    >
                      +3 დღე
                    </button>
                  </div>
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="relative">
                    <input
                      type="date"
                      value={formDueDate}
                      onChange={(e) => {
                        setFormDueDate(e.target.value);
                        if (formReminderType === 'same_day') {
                          setFormReminderDate(e.target.value);
                        }
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type="time"
                      value={formDueTime}
                      onChange={(e) => setFormDueTime(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Priority & Reminder Settings */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
                    პრიორიტეტი / Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="High">🔴 მაღალი (High)</option>
                    <option value="Medium">🟡 საშუალო (Medium)</option>
                    <option value="Low">🟢 დაბალი (Low)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
                    შეტყობინება / Alert
                  </label>
                  <select
                    value={formReminderType}
                    onChange={(e) => setFormReminderType(e.target.value as TaskReminderType)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="same_day">🔔 იმავე დღეს (Same Day)</option>
                    <option value="1_hour_before">⏰ 1 საათით ადრე</option>
                    <option value="1_day_before">📅 1 დღით ადრე</option>
                    <option value="custom">⚙️ მითითებულ დროს</option>
                    <option value="none">🚫 შეტყობინების გარეშე</option>
                  </select>
                </div>
              </div>

              {/* Custom Reminder Date/Time if selected */}
              {formReminderType === 'custom' && (
                <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-purple-400 block">
                    ზუსტი შეხსენების დრო / Custom Reminder Date & Time:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={formReminderDate}
                      onChange={(e) => setFormReminderDate(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 font-mono"
                    />
                    <input
                      type="time"
                      value={formReminderTime}
                      onChange={(e) => setFormReminderTime(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Optional Project Association */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
                  პროექტი (სურვილისამებრ)
                </label>
                <select
                  value={formProjectId}
                  onChange={(e) => setFormProjectId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="">დამოუკიდებელი დავალება (No Project)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      🎬 {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-950"
                >
                  {editingTask ? 'შენახვა' : 'დამატება'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
