import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { QuickCaptureModal } from './components/layout/QuickCaptureModal';

import { DashboardPage } from './pages/DashboardPage';
import { GoalsPage } from './pages/GoalsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ContentStudioPage } from './pages/ContentStudioPage';
import { ClientsPage } from './pages/ClientsPage';
import { CalendarPage } from './pages/CalendarPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { ReferenceLibraryPage } from './pages/ReferenceLibraryPage';
import { DevLogPage } from './pages/DevLogPage';
import { WinsPage } from './pages/WinsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { InboxPage } from './pages/InboxPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [cycleDay, setCycleDay] = useState(18);
  const [streakDays, setStreakDays] = useState(14);

  // Load summary on mount to get cycle day
  useEffect(() => {
    api.getSummary().then((res) => {
      if (res?.summary) {
        setCycleDay(res.summary.cycleDay);
        setStreakDays(res.summary.streakDays);
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

  const handleNavigate = (tab: string, entityId?: string) => {
    if (tab === 'project_detail' && entityId) {
      setSelectedProjectId(entityId);
      setCurrentTab('project_detail');
    } else if (tab.startsWith('cat_')) {
      setSelectedCategoryId(tab);
      setCurrentTab('categories');
    } else {
      setSelectedProjectId(null);
      setSelectedCategoryId(undefined);
      setCurrentTab(tab);
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} onOpenQuickCapture={() => setIsQuickCaptureOpen(true)} />;
      case 'goals':
        return <GoalsPage />;
      case 'inbox':
        return <InboxPage onOpenQuickCapture={() => setIsQuickCaptureOpen(true)} onNavigate={handleNavigate} />;
      case 'categories':
      case 'cat_video_editing':
      case 'cat_marketing':
      case 'cat_freelance':
      case 'cat_skills':
        return (
          <CategoriesPage
            selectedCategoryId={selectedCategoryId || (currentTab.startsWith('cat_') ? currentTab : undefined)}
            onNavigateToProject={(id) => handleNavigate('project_detail', id)}
          />
        );
      case 'projects':
        return <ProjectsPage onSelectProject={(id) => handleNavigate('project_detail', id)} />;
      case 'project_detail':
        return (
          <ProjectDetailPage
            projectId={selectedProjectId || 'proj_sports_drink'}
            onBack={() => handleNavigate('projects')}
          />
        );
      case 'content':
        return <ContentStudioPage />;
      case 'clients':
        return <ClientsPage />;
      case 'knowledge':
        return <KnowledgeBasePage />;
      case 'references':
        return <ReferenceLibraryPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'reports':
        return <ReportsPage />;
      case 'devlog':
        return <DevLogPage />;
      case 'wins':
        return <WinsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={handleNavigate} onOpenQuickCapture={() => setIsQuickCaptureOpen(true)} />;
    }
  };

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return { title: 'Dashboard', subtitle: 'Where am I right now & What needs to happen next' };
      case 'goals':
        return { title: 'Goals System', subtitle: 'Strategic objectives & high-level target milestones' };
      case 'inbox':
        return { title: 'Quick Idea Inbox', subtitle: 'Holding area for sudden thoughts and frictionless captures' };
      case 'categories':
      case 'cat_video_editing':
      case 'cat_marketing':
      case 'cat_freelance':
      case 'cat_skills':
        return { title: 'Growth Categories', subtitle: 'Platform checklists, craft modules & learning tracks' };
      case 'projects':
        return { title: 'Projects Workspace', subtitle: 'Portfolio, client, and learning project production hubs' };
      case 'project_detail':
        return { title: 'Project Workspace', subtitle: 'Tasks, Next Action, Time Tracking, and Focus Mode' };
      case 'content':
        return { title: 'Content Studio', subtitle: 'Kanban production pipeline & Effort vs. Result ROI' };
      case 'clients':
        return { title: 'Freelance CRM', subtitle: 'Client outreach, follow-ups, and revenue pipeline' };
      case 'knowledge':
        return { title: 'Knowledge Base', subtitle: 'Techniques, craft mastery, and experiments learned during projects' };
      case 'references':
        return { title: 'Reference Library', subtitle: 'Dissection of top-tier video and sound design inspirations' };
      case 'calendar':
        return { title: 'Deadlines & Calendar', subtitle: 'Month schedule and overdue item tracking' };
      case 'reports':
        return { title: 'Reports & Reviews', subtitle: 'Weekly reviews, monthly audits, and Day 30/60/90 milestones' };
      case 'devlog':
        return { title: 'Development Log', subtitle: 'Daily craft observations and strategy change pivots' };
      case 'wins':
        return { title: 'Wins & Achievements', subtitle: 'Documenting tangible career results' };
      case 'analytics':
        return { title: 'Performance Analytics', subtitle: 'Stage time distribution and content leverage' };
      case 'settings':
        return { title: 'Settings & Data Storage', subtitle: 'Sprint configuration and JSON database backup' };
      default:
        return { title: 'Editor OS', subtitle: 'Personal Video Editor Growth & Business Management System' };
    }
  };

  const pageHeader = getPageTitle();

  return (
    <div className="flex h-screen bg-black text-zinc-100 overflow-hidden font-sans">
      {/* Persistent Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleNavigate}
        onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
        cycleDay={cycleDay}
        cycleTotalDays={90}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={pageHeader.title}
          subtitle={pageHeader.subtitle}
          cycleDay={cycleDay}
          streakDays={streakDays}
          onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
        />

        <main className="flex-1 overflow-y-auto bg-black">
          {renderContent()}
        </main>
      </div>

      {/* Global Frictionless Quick Capture Modal */}
      <QuickCaptureModal
        isOpen={isQuickCaptureOpen}
        onClose={() => setIsQuickCaptureOpen(false)}
        onSuccess={() => {
          if (currentTab === 'inbox' || currentTab === 'dashboard') {
            setCurrentTab((t) => t);
          }
        }}
      />
    </div>
  );
}

export default App;
