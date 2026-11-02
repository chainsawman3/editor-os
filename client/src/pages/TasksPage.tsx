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
  Info,
  Zap,
  Repeat,
  Flame
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
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'wip' | 'upcoming' | 'overdue' | 'completed'>('all');
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
  const [formReminderDate, setFormReminderDate] = useState('');
  const [formReminderTime, setFormReminderTime] = useState('12:00');
  const [formRepeat5Min, setFormRepeat5Min] = useState<boolean>(false);
  const [formStage, setFormStage] = useState<'Todo' | 'WIP' | 'Done'>('Todo');

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
    setFormReminderDate(presetDate || todayStr);
    setFormReminderTime('12:00');
    setFormRepeat5Min(false);
    setFormStage('Todo');
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || '');
    setFormDueDate(task.due_date || '');
    setFormDueTime(task.due_time || '18:00');
    setFormPriority(task.priority || 'Medium');
    setFormReminderDate(task.reminder_date || task.due_date || todayStr);
    setFormReminderTime(task.reminder_time || '12:00');
    setFormRepeat5Min(task.reminder_type === 'repeat_5min' || task.reminder_type === 'custom_repeat_5min');
    setFormStage(task.completed ? 'Done' : (task.stage as any) === 'WIP' ? 'WIP' : 'Todo');
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const reminderType: TaskReminderType = formRepeat5Min ? 'repeat_5min' : 'custom';
    const isCompleted = formStage === 'Done';

    if (editingTask) {
      const updates: Partial<Task> = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        due_date: formDueDate || null,
        due_time: formDueTime || null,
        priority: formPriority,
        reminder_type: reminderType,
        reminder_date: formReminderDate || null,
        reminder_time: formReminderTime || null,
        stage: formStage,
        completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
        project_id: null
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
        reminder_type: reminderType,
        reminder_date: formReminderDate || null,
        reminder_time: formReminderTime || null,
        project_id: null,
        stage: formStage,
        completed: isCompleted,
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
    const newStage = updatedStatus ? 'Done' : 'Todo';
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, completed: updatedStatus, stage: newStage, completed_at: updatedStatus ? new Date().toISOString() : null }
          : t
      )
    );
    await api.updateTask(task.id, { completed: updatedStatus, stage: newStage });
  };

  // Quick toggle WIP status
  const handleToggleWIP = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStage = task.stage === 'WIP' ? 'Todo' : 'WIP';
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, stage: newStage, completed: false } : t))
    );
    // If setting to WIP, clean up repeating interval storage
    if (newStage === 'WIP') {
      try {
        localStorage.removeItem(`editor_os_last_repeat_${task.id}`);
      } catch {}
    }
    await api.updateTask(task.id, { stage: newStage, completed: false });
  };

  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('დარწმუნებული ხართ, რომ გსურთ დავალების წაშლა?')) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await api.deleteTask(id);
  };

  // Helper for quick date button
  const setQuickDueDate = (daysFromToday: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysFromToday);
    const dateStr = target.toISOString().split('T')[0];
    setFormDueDate(dateStr);
    if (!formReminderDate || formReminderDate === formDueDate) {
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
    const wipCount = tasks.filter((t) => !t.completed && t.stage === 'WIP').length;
    const today = tasks.filter((t) => !t.completed && t.due_date === todayStr).length;
    const overdue = tasks.filter((t) => !t.completed && t.due_date && t.due_date < todayStr).length;
    const upcoming = tasks.filter((t) => !t.completed && t.due_date && t.due_date > todayStr).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, wipCount, today, overdue, upcoming, percent };
  }, [tasks, todayStr]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Tab filter
      if (activeTab === 'completed' && !task.completed) return false;
      if (activeTab === 'wip' && (task.completed || task.stage !== 'WIP')) return false;
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

  // Sort: Overdue first, then WIP, then by due_date ASC
  const sortedTasks = useMemo(() => {
    const priorityWeights: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
    return [...filteredTasks].sort((a, b) => {
      // Completed at the bottom
      if (a.completed !== b.completed) return a.completed ? 1 : -1;

      // Overdue priority
      const aOverdue = !a.completed && a.due_date && a.due_date < todayStr;
      const bOverdue = !b.completed && b.due_date && b.due_date < todayStr;
      if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;

      // WIP at the top among active
      if (a.stage === 'WIP' && b.stage !== 'WIP') return -1;
      if (a.stage !== 'WIP' && b.stage === 'WIP') return 1;

      // Due date ASC
      if (a.due_date && b.due_date) {
        if (a.due_date !== b.due_date) return a.due_date.localeCompare(b.due_date);
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
              მიუთითეთ ზუსტი დღე და საათი შეტყობინებისთვის. 5-წუთიანი განგაშის გამეორება ავტომატურად ჩერდება, როცა ტასკს <strong>WIP</strong>-ზე გადაიყვანთ.
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

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 pt-1">
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
            onClick={() => setActiveTab('wip')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              activeTab === 'wip'
                ? 'bg-amber-950/60 border-amber-500/80 shadow-sm'
                : 'bg-zinc-900/40 border-zinc-850 hover:bg-zinc-900/70'
            }`}
          >
            <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> WIP (მუშაობაში)
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-amber-200">{stats.wipCount}</span>
              <span className="text-[10px] text-zinc-500">In Progress</span>
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
              onClick={() => setActiveTab('wip')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                activeTab === 'wip'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                  : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>WIP ({stats.wipCount})</span>
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
                  : activeTab === 'wip'
                  ? 'WIP-ში მყოფი დავალებები არ არის.'
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
            const isWIP = task.stage === 'WIP';
            const isRepeating = task.reminder_type === 'repeat_5min' || task.reminder_type === 'custom_repeat_5min';

            return (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task)}
                className={`group p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-150 cursor-pointer flex items-start gap-3 sm:gap-4 select-none ${
                  task.completed
                    ? 'bg-zinc-950/50 border-zinc-850/60 opacity-75 hover:opacity-100'
                    : isWIP
                    ? 'bg-amber-950/20 hover:bg-amber-950/30 border-amber-600/60 hover:border-amber-500 ring-1 ring-amber-500/20'
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`text-xs sm:text-sm font-semibold transition-colors break-words leading-tight ${
                          task.completed
                            ? 'line-through text-zinc-500 font-normal'
                            : 'text-zinc-100 group-hover:text-white'
                        }`}
                      >
                        {task.title}
                      </h3>

                      {/* WIP Pill Indicator */}
                      {isWIP && !task.completed && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-zinc-950 shadow-sm animate-pulse">
                          <Zap className="w-3 h-3 fill-current" />
                          <span>WIP • მუშაობაში (შეხსენება გათიშულია)</span>
                        </span>
                      )}
                    </div>

                    {/* Action buttons (WIP Toggle, Telegram Push, Calendar Jump, Edit, Delete) */}
                    <div className="flex items-center gap-1 shrink-0 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {/* One-click WIP Toggle Button */}
                      {!task.completed && (
                        <button
                          type="button"
                          onClick={(e) => handleToggleWIP(task, e)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                            isWIP
                              ? 'bg-amber-500/20 border border-amber-500 text-amber-300 hover:bg-amber-500/30'
                              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-300 hover:border-amber-500/50 hover:bg-amber-950/20'
                          }`}
                          title={isWIP ? 'WIP-ის გაუქმება (შეხსენება აღდგება)' : 'დაიწყე მუშაობა (WIP - აჩერებს შეხსენებებს)'}
                        >
                          <Zap className={`w-3 h-3 ${isWIP ? 'text-amber-400 fill-amber-400' : 'text-zinc-400'}`} />
                          <span>{isWIP ? 'WIP Active' : 'Start WIP'}</span>
                        </button>
                      )}

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

                    {/* Exact Alert / Reminder Scheduled Time Badge */}
                    {task.reminder_date && !task.completed && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-purple-950/60 text-purple-300 border border-purple-800/60">
                        <Bell className="w-3 h-3 text-purple-400" />
                        <span>შეტყობინება: {task.reminder_date} @ {task.reminder_time || '12:00'}</span>
                      </span>
                    )}

                    {/* Repeating Alert Badge */}
                    {isRepeating && !task.completed && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                        isWIP
                          ? 'bg-zinc-900 text-zinc-400 border-zinc-800 line-through'
                          : 'bg-amber-950/70 text-amber-300 border-amber-700/80 animate-pulse'
                      }`}>
                        <Repeat className="w-3 h-3 text-amber-400" />
                        <span>{isWIP ? '5-წთ განგაში (შეჩერებულია WIP-ით)' : 'განგაში ყოველ 5 წთ-ში'}</span>
                      </span>
                    )}

                    {/* Priority Badge */}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${priorityBadge.style}`}
                    >
                      {priorityBadge.label}
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
                  დავალება დედლაინით, ზუსტი შეტყობინების დროითა და განგაშით
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
                  placeholder="მაგ: ვიდეოს ატვირთვა და კლიენტთან გაგზავნა"
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
                      onClick={() => setQuickDueDate(0)}
                      className="px-2 py-0.5 rounded bg-zinc-850 hover:bg-zinc-800 text-[10px] text-zinc-300 transition-colors"
                    >
                      დღეს
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDueDate(1)}
                      className="px-2 py-0.5 rounded bg-zinc-850 hover:bg-zinc-800 text-[10px] text-zinc-300 transition-colors"
                    >
                      ხვალ
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDueDate(3)}
                      className="px-2 py-0.5 rounded bg-zinc-850 hover:bg-zinc-800 text-[10px] text-zinc-300 transition-colors"
                    >
                      +3 დღე
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDueDate(7)}
                      className="px-2 py-0.5 rounded bg-zinc-850 hover:bg-zinc-800 text-[10px] text-zinc-300 transition-colors"
                    >
                      +1 კვირა
                    </button>
                  </div>
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => {
                      setFormDueDate(e.target.value);
                      if (!formReminderDate || formReminderDate === formDueDate) {
                        setFormReminderDate(e.target.value);
                      }
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <input
                    type="time"
                    value={formDueTime}
                    onChange={(e) => setFormDueTime(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Exact Notification Schedule (Date & Time) */}
              <div className="space-y-2 p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-sky-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Bell className="w-3.5 h-3.5" />
                    <span>როდის მოვიდეს შეტყობინება?</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (formDueDate) setFormReminderDate(formDueDate);
                      if (formDueTime) setFormReminderTime(formDueTime);
                    }}
                    className="text-[10px] text-sky-400 hover:text-sky-300 bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 rounded transition-colors"
                  >
                    დედლაინის დროს
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <span className="text-[10px] text-zinc-400 block mb-1">თარიღი (დღე):</span>
                    <input
                      type="date"
                      value={formReminderDate}
                      onChange={(e) => setFormReminderDate(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 font-mono focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block mb-1">დრო (საათი):</span>
                    <input
                      type="time"
                      value={formReminderTime}
                      onChange={(e) => setFormReminderTime(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 font-mono focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* 5-minute Repeating Alert Checkbox */}
                <div className="pt-2 border-t border-zinc-850/80 mt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formRepeat5Min}
                      onChange={(e) => setFormRepeat5Min(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-amber-500 rounded cursor-pointer shrink-0"
                    />
                    <div>
                      <span className="text-xs font-bold text-amber-300 block">
                        🔁 განმეორდეს ყოველ 5 წუთში (შეჩერდება, როცა WIP-ს მიუთითებთ)
                      </span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5 leading-relaxed">
                        დედლაინის/შეტყობინების დადგომისას ბოტი ყოველ 5 წუთში მოგწერთ შეხსენებას, სანამ საიტზე არ დააჭერთ <strong>WIP</strong>-ს ან არ დაასრულებთ.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Status / Stage Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
                  სტატუსი / Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormStage('Todo')}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                      formStage === 'Todo'
                        ? 'bg-zinc-800 border-zinc-600 text-white shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    ⏳ Todo (დასაწყები)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStage('WIP')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center flex items-center justify-center gap-1 ${
                      formStage === 'WIP'
                        ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm shadow-amber-950'
                        : 'bg-zinc-900 border-zinc-800 text-amber-400 hover:bg-amber-950/30'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>WIP (დაწყებულია)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStage('Done')}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                      formStage === 'Done'
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-emerald-400'
                    }`}
                  >
                    ✅ Done (შესრულდა)
                  </button>
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

              {/* Priority */}
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
                  დაარქვით სახელი და მიიღებთ <strong>API Token</strong>-ს (მაგ: <code className="text-zinc-200">123456789:AAG...</code> მთლიანად).
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
                  placeholder="მაგ: 8635727434:AAGy5e6NzY..."
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
                  placeholder="მაგ: 8635727434"
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
