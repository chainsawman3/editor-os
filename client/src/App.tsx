import React, { useState, useEffect, lazy, Suspense } from 'react';
import { api } from './api';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNavBar } from './components/layout/MobileNavBar';
import { QuickCaptureModal } from './components/layout/QuickCaptureModal';
import { SectionType } from './types';
import { PinScreen } from './components/PinScreen';
import { checkTaskReminders } from './utils/notifications';
import { Bell, X as XIcon, CheckCircle2 } from 'lucide-react';

// Dynamic code-split page imports for minimal bandwidth usage
const GoalsHubPage = lazy(() => import('./pages/GoalsHubPage').then((m) => ({ default: m.GoalsHubPage })));
const ContentStudioPage = lazy(() => import('./pages/ContentStudioPage').then((m) => ({ default: m.ContentStudioPage })));
const CalendarPage = lazy(() => import('./pages/CalendarPage').then((m) => ({ default: m.CalendarPage })));
const DeadlinesPage = lazy(() => import('./pages/DeadlinesPage').then((m) => ({ default: m.DeadlinesPage })));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage })));
const GoalDetailPage = lazy(() => import('./pages/GoalDetailPage').then((m) => ({ default: m.GoalDetailPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const InboxPage = lazy(() => import('./pages/InboxPage').then((m) => ({ default: m.InboxPage })));
const NotesPage = lazy(() => import('./pages/NotesPage').then((m) => ({ default: m.NotesPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const TasksPage = lazy(() => import('./pages/TasksPage').then((m) => ({ default: m.TasksPage })));

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>('content');
  const [selectedSection, setSelectedSection] = useState<SectionType>('video_editing');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [cycleDay, setCycleDay] = useState(1);
  const [cycleTotalDays, setCycleTotalDays] = useState(90);
  const [previousTab, setPreviousTab] = useState<string>('goals');
  const [reminderToast, setReminderToast] = useState<{ task: any; message: string } | null>(null);

  // Background Task Reminder Scanner (Runs on mount and every 60 seconds)
  useEffect(() => {
    const runCheck = async () => {
      try {
        const tasks = await api.getTasks();
        if (tasks && tasks.length > 0) {
          checkTaskReminders(tasks);
        }
      } catch (e) {
        // Silent error handling for background scanner
      }
    };

    runCheck();
    const interval = setInterval(runCheck, 60000);
    return () => clearInterval(interval);
  }, []);

  // Listen to in-app task reminder toasts & desktop click events
  useEffect(() => {
    const handleToast = (e: any) => {
      if (e.detail) {
        setReminderToast(e.detail);
        setTimeout(() => setReminderToast(null), 10000);
      }
    };

    const handleOpenTasks = () => {
      setCurrentTab('tasks');
    };

    window.addEventListener('editor_os_task_reminder_toast', handleToast);
    window.addEventListener('editor_os_open_tasks', handleOpenTasks);
    return () => {
      window.removeEventListener('editor_os_task_reminder_toast', handleToast);
      window.removeEventListener('editor_os_open_tasks', handleOpenTasks);
    };
  }, []);
  const [navFilterOptions, setNavFilterOptions] = useState<{
    status?: string;
    viewType?: 'all' | 'goals_only' | 'projects_only';
    clientStatus?: string;
    platform?: string;
  }>({});

  // Load summary on mount to get cycle day
  useEffect(() => {
    api.getSummary().then((res) => {
      if (res?.summary) {
        setCycleDay(res.summary.cycleDay);
        setCycleTotalDays(res.summary.cycleTotalDays || 90);
      }
    }).catch(console.error);
  }, [currentTab]);

  // Global Keyboard Shortcut (Cmd+K / Ctrl+K) for Quick Capture
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickCaptureOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    try {
      const authCookie = localStorage.getItem('editor_os_auth');
      if (authCookie) {
        const timestamp = parseInt(authCookie, 10);
        // 1 day = 24 * 60 * 60 * 1000
        if (Date.now() - timestamp < 86400000) {
          setIsAuthenticated(true);
        }
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthSuccess = () => {
    try {
      localStorage.setItem('editor_os_auth', Date.now().toString());
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <PinScreen onSuccess={handleAuthSuccess} />;
  }

  const handleNavigate = (tab: string, entityIdOrOptions?: string | any) => {
    let options: any = {};
    if (typeof entityIdOrOptions === 'string') {
      if (tab === 'project_detail') {
        if (currentTab !== 'project_detail' && currentTab !== 'goal_detail') {
          setPreviousTab(currentTab);
        }
        setSelectedProjectId(entityIdOrOptions);
        setCurrentTab('project_detail');
        return;
      }
      if (tab === 'goal_detail') {
        if (currentTab !== 'goal_detail' && currentTab !== 'project_detail') {
          setPreviousTab(currentTab);
        }
        setSelectedGoalId(entityIdOrOptions);
        setCurrentTab('goal_detail');
        return;
      }
    } else if (entityIdOrOptions && typeof entityIdOrOptions === 'object') {
      options = entityIdOrOptions;
    }

    setNavFilterOptions(options);

    if (tab === 'project_detail') {
      if (currentTab !== 'project_detail' && currentTab !== 'goal_detail') {
        setPreviousTab(currentTab);
      }
      if (options.projectId) {
        setSelectedProjectId(options.projectId);
      }
      setCurrentTab('project_detail');
    } else if (tab === 'goal_detail') {
      if (currentTab !== 'goal_detail' && currentTab !== 'project_detail') {
        setPreviousTab(currentTab);
      }
      if (options.goalId) {
        setSelectedGoalId(options.goalId);
      }
      setCurrentTab('goal_detail');
    } else if (tab.startsWith('goal_')) {
      const section = tab.replace('goal_', '') as SectionType;
      setSelectedSection(section);
      setCurrentTab(tab);
    } else if (tab === 'goals') {
      if (options.section) {
        setSelectedSection(options.section as SectionType);
      } else {
        setSelectedSection('video_editing');
      }
      setCurrentTab('goals');
    } else {
      setSelectedProjectId(null);
      setSelectedGoalId(null);
      setCurrentTab(tab);
    }
  };

  const handleOpenProject = (projId: string) => {
    if (currentTab !== 'project_detail' && currentTab !== 'goal_detail') {
      setPreviousTab(currentTab);
    }
    setSelectedProjectId(projId);
    setCurrentTab('project_detail');
  };

  const handleOpenGoal = (goalId: string) => {
    if (currentTab !== 'goal_detail' && currentTab !== 'project_detail') {
      setPreviousTab(currentTab);
    }
    setSelectedGoalId(goalId);
    setCurrentTab('goal_detail');
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'goals':
      case 'goal_video_editing':
        return (
          <GoalsHubPage
            initialSection={selectedSection || 'video_editing'}
            initialStatus={navFilterOptions.status}
            initialViewType={navFilterOptions.viewType}
            initialClientStatus={navFilterOptions.clientStatus}
            onOpenProject={handleOpenProject}
            onOpenGoal={handleOpenGoal}
          />
        );
      case 'goal_marketing':
        return (
          <GoalsHubPage
            initialSection="marketing"
            initialStatus={navFilterOptions.status}
            initialViewType={navFilterOptions.viewType}
            initialPlatform={navFilterOptions.platform}
            onOpenProject={handleOpenProject}
            onOpenGoal={handleOpenGoal}
          />
        );
      case 'goal_freelance':
        return (
          <GoalsHubPage
            initialSection="freelance"
            initialClientStatus={navFilterOptions.clientStatus}
            onOpenProject={handleOpenProject}
            onOpenGoal={handleOpenGoal}
          />
        );
      case 'goal_skills':
        return (
          <GoalsHubPage
            initialSection="skills"
            initialStatus={navFilterOptions.status}
            initialViewType={navFilterOptions.viewType}
            onOpenProject={handleOpenProject}
            onOpenGoal={handleOpenGoal}
          />
        );
      case 'content':
      case 'dashboard':
        return (
          <ContentStudioPage
            initialStatus={navFilterOptions.status}
            onOpenProject={handleOpenProject}
          />
        );
      case 'deadlines':
        return <DeadlinesPage onOpenProject={handleOpenProject} />;
      case 'calendar':
        return (
          <CalendarPage
            onOpenProject={handleOpenProject}
            onOpenGoal={handleOpenGoal}
            onOpenNote={(noteId) => {
              setSelectedNoteId(noteId);
              setCurrentTab('notes');
            }}
          />
        );
      case 'project_detail':
        return (
          <ProjectDetailPage
            projectId={selectedProjectId || 'proj_talking_head_ad'}
            onBack={() => handleNavigate(previousTab || 'goals')}
          />
        );
      case 'goal_detail':
        return (
          <GoalDetailPage
            goalId={selectedGoalId || 'goal_video_editing_1'}
            onBack={() => handleNavigate(previousTab || 'goals')}
            onOpenProject={handleOpenProject}
          />
        );
      case 'analytics':
        return <AnalyticsPage onNavigate={handleNavigate} />;
      case 'notes':
        return <NotesPage initialNoteId={selectedNoteId} />;
      case 'inbox':
        return <InboxPage onOpenQuickCapture={() => setIsQuickCaptureOpen(true)} onNavigate={handleNavigate} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <GoalsHubPage
            initialSection="video_editing"
            initialStatus={navFilterOptions.status}
            initialViewType={navFilterOptions.viewType}
            onOpenProject={handleOpenProject}
            onOpenGoal={handleOpenGoal}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-black text-zinc-100 overflow-hidden font-sans">
      {/* 1. Left Sidebar (Desktop Fixed & Mobile Slide-Over Drawer) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleNavigate}
        onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
        cycleDay={cycleDay}
        cycleTotalDays={cycleTotalDays}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header
          title={currentTab.replace('_', ' ').toUpperCase()}
          cycleDay={cycleDay}
          streakDays={12}
          onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
          onToggleMobileMenu={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto bg-zinc-950/60 pb-24 md:pb-12">
          <div key={currentTab + (selectedProjectId || '')} className="page-transition min-h-full">
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[50vh]">
                  <div className="w-7 h-7 border-2 border-amber-500/20 border-t-amber-400 rounded-full animate-spin" />
                </div>
              }
            >
              {renderContent()}
            </Suspense>
          </div>
        </main>

        {/* 3. Mobile Bottom Navigation Bar (< md) */}
        <MobileNavBar
          currentTab={currentTab}
          onSelectTab={handleNavigate}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        />
      </div>

      {/* In-App Deadline Alert Toast */}
      {reminderToast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-zinc-950/95 backdrop-blur-xl border border-blue-500/80 rounded-2xl p-4 shadow-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                Deadline Reminder
              </span>
              <button
                onClick={() => setReminderToast(null)}
                className="text-zinc-500 hover:text-white p-0.5"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            </div>
            <h4 className="text-xs font-bold text-white truncate">
              {reminderToast.task?.title || 'Task Reminder'}
            </h4>
            {reminderToast.task?.due_date && (
              <p className="text-[11px] text-zinc-400">
                Due: {reminderToast.task.due_date} {reminderToast.task.due_time ? '@ ' + reminderToast.task.due_time : ''}
              </p>
            )}
            <div className="pt-1.5 flex items-center gap-2">
              <button
                onClick={() => {
                  setReminderToast(null);
                  setCurrentTab('tasks');
                }}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold"
              >
                Open Tasks
              </button>
              <button
                onClick={() => setReminderToast(null)}
                className="px-2 py-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 text-[10px] rounded-lg"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Global Quick Capture Modal (⌘K) */}
      {isQuickCaptureOpen && (
        <QuickCaptureModal
          isOpen={isQuickCaptureOpen}
          onClose={() => setIsQuickCaptureOpen(false)}
          onSuccess={() => handleNavigate('inbox')}
        />
      )}
    </div>
  );
}
export default App;
