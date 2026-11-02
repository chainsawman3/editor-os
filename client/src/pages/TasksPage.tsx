import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api';
import { Task, TaskPriority, TaskReminderType } from '../types';
import {
  CheckCircle2,
  Plus,
  Calendar,
  Clock,
  Bell,
  AlertTriangle,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  CalendarDays,
  Volume2,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Send,
  Smartphone,
  ExternalLink,
  Info
} from 'lucide-react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  playNotificationSound,
  showTaskNotification
} from '../utils/notifications';
import {
  getTelegramConfig,
  saveTelegramConfig,
  testTelegramConnection,
  sendTaskToTelegram,
  TelegramConfig
} from '../utils/telegram';

interface TasksPageProps {
  onOpenProject?: (projectId: string) => void;
  onNavigateToCalendar?: (dateStr: string) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({ onNavigateToCalendar }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Search
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

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

  // Notification Permission State
  const [notificationPerm, setNotificationPerm] = useState<NotificationPermission>(getNotificationPermission());

  // Telegram Modal & Config State
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState<boolean>(false);
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(getTelegramConfig());
  const [tgBotToken, setTgBotToken] = useState<string>(telegramConfig.botToken);
  const [tgChatId, setTgChatId] = useState<string>(telegramConfig.chatId);
  const [tgEnabled, setTgEnabled] = useState<boolean>(telegramConfig.isEnabled);
  const [tgTestStatus, setTgTestStatus] = useState<{ loading: boolean; success?: boolean; message?: string } | null>(null);
  const [sendingTaskId, setSendingTaskId] = useState<string | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const loadData = async () => {
    try {
      setLoading(true);
      const allTasks = await api.getTasks();
      // Filter strictly for independent / standalone tasks (tasks not attached to projects)
      const standalone = (allTasks || []).filter((t) => !t.project_id || t.project_id.trim() === '');
      setTasks(standalone);
    } catch (err) {
      console.error('Failed to load standalone tasks:', err);
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
      description: 'შეტყობინებების სისტემა წარმატებით ჩაირთო! დედლაინის შეხსენებები აქტიურია.',
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
        project_id: null // strictly standalone
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
        project_id: null, // strictly standalone
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

  // Telegram Config Handlers
  const handleSaveTelegram = (e: React.FormEvent) => {
    e.preventDefault();
    const newCfg: TelegramConfig = {
      botToken: tgBotToken.trim(),
      chatId: tgChatId.trim(),
      isEnabled: tgEnabled
    };
    saveTelegramConfig(newCfg);
    setTelegramConfig(newCfg);
    setTgTestStatus({ success: true, loading: false, message: 'კონფიგურაცია წარმატებით შეინახა!' });
    setTimeout(() => {
      setIsTelegramModalOpen(false);
      setTgTestStatus(null);
    }, 1500);
  };

  const handleTestTelegram = async () => {
    if (!tgBotToken.trim() || !tgChatId.trim()) {
      setTgTestStatus({ success: false, loading: false, message: 'შეიყვანეთ Bot Token და Chat ID!' });
      return;
    }
    setTgTestStatus({ loading: true });
    const res = await testTelegramConnection(tgBotToken, tgChatId);
    if (res.success) {
      setTgTestStatus({
        loading: false,
        success: true,
        message: 'ტესტური მესიჯი წარმატებით გაიგზავნა ტელეგრამში! შეამოწმეთ ტელეფონი. 📲'
      });
    } else {
      setTgTestStatus({
        loading: false,
        success: false,
        message: `შეცდომა: ${res.error || 'შეტყობინება ვერ გაიგზავნა'}. დარწმუნდით რომ ბოტში დააჭირეთ /start.`
      });
    }
  };

  const handleSendSingleTaskToTelegram = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setSendingTaskId(task.id);
    const res = await sendTaskToTelegram(task, 'გაგზავნილია ხელით საიტიდან');
    setSendingTaskId(null);
    if (res.success) {
      alert(`✅ ტასკი "${task.title}" წარმატებით გაიგზავნა ტელეგრამში!`);
    } else {
      alert(`⚠️ შეცდომა: ${res.error}\nგახსენით "Telegram" ღილაკი და შეამოწმეთ კონფიგურაცია.`);
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

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = (task.description || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }

      return true;
    });
  }, [tasks, activeTab, priorityFilter, searchQuery, todayStr]);

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
      const formatted = d.toLocaleDateString('ka-GE', { month: 'short', day: 'numeric' });
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
                დამოუკიდებელი ტასკები / Standalone Tasks
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              მართე ცალკე დამოუკიდებელი დავალებები დედლაინებითა და კომენტარებით. შეტყობინებები მოდის პირდაპირ თქვენს ტელეფონზე (Telegram) და კალენდარში.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Telegram Bot Setup Button */}
            <button
              onClick={() => setIsTelegramModalOpen(true)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                telegramConfig.isEnabled && telegramConfig.botToken && telegramConfig.chatId
                  ? 'bg-sky-500/15 border border-sky-500/40 text-sky-300 hover:bg-sky-500/25'
                  : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-800'
              }`}
              title="ტელეფონზე (Telegram) შეტყობინებების მართვა"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>{telegramConfig.isEnabled ? '📱 Telegram ჩართულია' : '📱 Telegram-ის მიბმა'}</span>
            </button>

            {/* Notification Permission Indicator */}
            {notificationPerm !== 'granted' && isNotificationSupported() && (
              <button
                onClick={handleRequestPermission}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 transition-all flex items-center gap-1.5 shadow-sm"
                title="ჩართე ბრაუზერის შეტყობინებები დედლაინის შეხსენებისთვის"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Browser Alerts</span>
              </button>
            )}

            {notificationPerm === 'granted' && (
              <button
                onClick={handleTestNotification}
                className="px-2.5 py-2 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 transition-colors flex items-center gap-1.5"
                title="გატესტე ბრაუზერის შეტყობინების ხმა და ფანჯარა"
              >
                <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Test Sound</span>
              </button>
            )}

            <button
              onClick={() => openCreateModal()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center gap-1.5 shadow-sm shadow-blue-900/30 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>ახალი ტასკი</span>
            </button>
          </div>
        </div>

        {/* Telegram Prompt Banner if not configured yet */}
        {(!telegramConfig.isEnabled || !telegramConfig.botToken || !telegramConfig.chatId) && (
          <div className="p-3 bg-sky-950/30 border border-sky-800/50 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-sky-300">
              <Smartphone className="w-4 h-4 shrink-0 text-sky-400" />
              <span>
                გსურთ ტასკების დედლაინის შეტყობინებები პირდაპირ <strong>ტელეფონში (Telegram)</strong> მოგდიოდეთ?
              </span>
            </div>
            <button
              onClick={() => setIsTelegramModalOpen(true)}
              className="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold rounded-lg text-xs shrink-0 flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              <span>ჩართვა</span>
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
            <span className="text-[11px] font-medium text-zinc-400 block">სულ ტასკები</span>
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
              <Clock className="w-3 h-3" /> დღეს შესასრულებელი
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
              <AlertTriangle className="w-3 h-3" /> ვადაგადაცილებული
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
              <Check className="w-3 h-3" /> შესრულებული
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
              ყველა ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'today'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-blue-300'
              }`}
            >
              დღეს ({stats.today})
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-purple-300'
              }`}
            >
              მომავალი ({stats.upcoming})
            </button>
            <button
              onClick={() => setActiveTab('overdue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'overdue'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-rose-300'
              }`}
            >
              ვადაგადაცილებული ({stats.overdue})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'completed'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-emerald-300'
              }`}
            >
              შესრულებული ({stats.completed})
            </button>
          </div>

          {/* Search & Priority Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ძიება სათაურით ან კომენტარით..."
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
              <option value="all">ყველა პრიორიტეტი</option>
              <option value="High">🔴 მაღალი (High)</option>
              <option value="Medium">🟡 საშუალო (Medium)</option>
              <option value="Low">🟢 დაბალი (Low)</option>
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
              <h3 className="text-sm font-bold text-zinc-200">დამოუკიდებელი ტასკები არ მოიძებნა</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                {activeTab === 'completed'
                  ? 'დასრულებული ტასკები ჯერ არ არის.'
                  : 'შექმენით ახალი დამოუკიდებელი ტასკი, მიუთითეთ დედლაინი და კომენტარი.'}
              </p>
            </div>
            <button
              onClick={() => openCreateModal()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>დაამატე ახალი ტასკი</span>
            </button>
          </div>
        ) : (
          sortedTasks.map((task) => {
            const deadline = formatDeadlineDisplay(task.due_date, task.due_time);
            const priorityBadge = getPriorityBadge(task.priority);

            return (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task)}
                className={`group p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-150 cursor-pointer flex items-start gap-3 sm:gap-4 select-none ${
                  task.completed
                    ? 'bg-zinc-950/50 border-zinc-850/60 opacity-75 hover:opacity-100'
                    : deadline.isOverdue
                    ? 'bg-rose-950/20 hover:bg-rose-950/30 border-rose-900/40 hover:border-rose-700/60'
                    : deadline.isToday
                    ? 'bg-blue-950/20 hover:bg-blue-950/30 border-blue-900/40 hover:border-blue-700/60'
                    : 'bg-zinc-950 hover:bg-zinc-900/80 border-zinc-850 hover:border-zinc-750'
                }`}
              >
                {/* Custom Checkbox (Turns emerald green when completed) */}
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
                  title={task.completed ? 'მონიშნე შეუსრულებლად' : 'მონიშნე შესრულებულად'}
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>

                {/* Body Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className={`text-xs sm:text-sm font-semibold transition-colors break-words leading-tight ${
                        task.completed
                          ? 'line-through text-zinc-500 font-normal'
                          : 'text-zinc-100 group-hover:text-white'
                      }`}
                    >
                      {task.title}
                    </h3>

                    {/* Action buttons (Telegram Push, Calendar Jump, Edit, Delete) */}
                    <div className="flex items-center gap-1 shrink-0 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {/* Send to Telegram Quick Action */}
                      {telegramConfig.isEnabled && (
                        <button
                          type="button"
                          onClick={(e) => handleSendSingleTaskToTelegram(task, e)}
                          disabled={sendingTaskId === task.id}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-sky-300 hover:bg-sky-950/40 transition-colors"
                          title="გაგზავნე ტელეგრამში ტელეფონზე"
                        >
                          <Send className={`w-3.5 h-3.5 ${sendingTaskId === task.id ? 'animate-bounce text-sky-400' : ''}`} />
                        </button>
                      )}

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

                  {/* Comment / Notes Block */}
                  {task.description && (
                    <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-[11px] text-zinc-300 leading-relaxed font-normal whitespace-pre-line flex items-start gap-2">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 shrink-0 pt-0.5 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-zinc-400" />
                        კომენტარი:
                      </span>
                      <span className="flex-1 text-zinc-300 font-sans">{task.description}</span>
                    </div>
                  )}

                  {/* Metadata Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    {/* Deadline Badge */}
                    {task.due_date && (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                          task.completed
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
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
                            ? 'დედლაინის დღეს'
                            : task.reminder_type === '1_hour_before'
                            ? '1 სთ ადრე'
                            : task.reminder_type === '1_day_before'
                            ? '1 დღით ადრე'
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

                    {/* Standalone Identifier Badge */}
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium text-zinc-500 bg-zinc-900 border border-zinc-800/80">
                      დამოუკიდებელი
                    </span>
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
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <span>{editingTask ? 'ტასკის რედაქტირება' : 'ახალი დამოუკიდებელი ტასკი'}</span>
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  დავალება დედლაინითა და კომენტარით (ავტომატურად აისახება კალენდარში)
                </p>
              </div>
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
                  placeholder="მაგ: კლიენტთან შეხვედრა / ანგარიშის ჩაბარება"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>

              {/* Deadline Date & Time */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider flex items-center justify-between">
                  <span>შესრულების დედლაინი / Deadline</span>
                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1 font-normal font-sans">
                    <button
                      type="button"
                      onClick={() => setQuickDate(0)}
                      className="px-2 py-0.5 rounded bg-zinc-850 hover:bg-zinc-800 text-[10px] text-zinc-300 transition-colors"
                    >
                      დღეს
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(1)}
                      className="px-2 py-0.5 rounded bg-zinc-850 hover:bg-zinc-800 text-[10px] text-zinc-300 transition-colors"
                    >
                      ხვალ
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(3)}
                      className="px-2 py-0.5 rounded bg-zinc-850 hover:bg-zinc-800 text-[10px] text-zinc-300 transition-colors"
                    >
                      +3 დღე
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(7)}
                      className="px-2 py-0.5 rounded bg-zinc-850 hover:bg-zinc-800 text-[10px] text-zinc-300 transition-colors"
                    >
                      +1 კვირა
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

              {/* Comment / Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
                  კომენტარი / Comment (დეტალები, შენიშვნები)
                </label>
                <textarea
                  rows={3}
                  placeholder="დაწერეთ კომენტარი, დეტალები ან შენიშვნები..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 leading-relaxed"
                />
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
                    ზუსტი შეხსენების დრო / Custom Reminder:
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

      {/* 5. MODAL FOR TELEGRAM BOT CONFIGURATION */}
      {isTelegramModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-8"
          >
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
                  <Send className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-white">Telegram ბოტის ინტეგრაცია</h2>
                  <p className="text-[11px] text-zinc-400">მიიღეთ დედლაინის შეტყობინებები პირდაპირ ტელეფონზე</p>
                </div>
              </div>
              <button
                onClick={() => setIsTelegramModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick 3-step Instructions */}
            <div className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-xl space-y-2 text-xs text-zinc-300">
              <div className="font-bold text-sky-300 flex items-center gap-1.5 text-xs">
                <Info className="w-3.5 h-3.5 text-sky-400" />
                <span>როგორ შევქმნათ ბოტი 1 წუთში:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-400 leading-relaxed">
                <li>
                  Telegram-ში მოძებნეთ <code className="text-sky-300 bg-sky-950/80 px-1 py-0.5 rounded font-mono">@BotFather</code> და გააგზავნეთ <code className="text-zinc-200">/newbot</code>.
                </li>
                <li>
                  დაარქვით სახელი (მაგ. <span className="text-zinc-200">EditorOSTaskBot</span>) და მიიღებთ <strong>API Token</strong>-ს.
                </li>
                <li>
                  გახსენით თქვენი ახალი ბოტი და აუცილებლად დააჭირეთ <strong>START</strong> (<code className="text-zinc-200">/start</code>).
                </li>
                <li>
                  თქვენი <strong>Chat ID</strong>-ის გასაგებად Telegram-ში ჩაწერეთ <code className="text-sky-300 bg-sky-950/80 px-1 py-0.5 rounded font-mono">@userinfobot</code>.
                </li>
              </ol>
            </div>

            <form onSubmit={handleSaveTelegram} className="space-y-3.5">
              {/* Bot Token */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
                  Bot Token <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="მაგ: 7123456789:AAHq_7xYz..."
                  value={tgBotToken}
                  onChange={(e) => setTgBotToken(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Chat ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
                  Telegram Chat ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="მაგ: 987654321"
                  value={tgChatId}
                  onChange={(e) => setTgChatId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Enable Switch */}
              <div className="flex items-center justify-between p-3 bg-zinc-900/40 border border-zinc-850 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-zinc-200 block">ტელეგრამ შეტყობინებების ჩართვა</span>
                  <span className="text-[10px] text-zinc-500">დედლაინის დადგომისას შეტყობინება გამოიგზავნება ტელეფონზე</span>
                </div>
                <input
                  type="checkbox"
                  checked={tgEnabled}
                  onChange={(e) => setTgEnabled(e.target.checked)}
                  className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                />
              </div>

              {/* Status Message */}
              {tgTestStatus && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-medium ${
                    tgTestStatus.success
                      ? 'bg-emerald-950/60 border border-emerald-800/80 text-emerald-300'
                      : 'bg-rose-950/60 border border-rose-800/80 text-rose-300'
                  }`}
                >
                  {tgTestStatus.message}
                </div>
              )}

              {/* Actions: Test Button & Save */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={handleTestTelegram}
                  disabled={tgTestStatus?.loading}
                  className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-850 text-sky-400 border border-zinc-800 hover:border-sky-500/50 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${tgTestStatus?.loading ? 'animate-spin' : ''}`} />
                  <span>{tgTestStatus?.loading ? 'იგზავნება...' : '🚀 ტესტი ტელეფონზე'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTelegramModalOpen(false)}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 rounded-xl text-xs font-semibold transition-colors"
                  >
                    დახურვა
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-sky-950"
                  >
                    შენახვა
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
