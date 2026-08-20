import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { QuickCaptureModal } from './components/layout/QuickCaptureModal';

import { GoalsHubPage } from './pages/GoalsHubPage';
import { ContentStudioPage } from './pages/ContentStudioPage';
import { CalendarPage } from './pages/CalendarPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { InboxPage } from './pages/InboxPage';
import { SettingsPage } from './pages/SettingsPage';
import { SectionType } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('goals');
  const [selectedSection, setSelectedSection] = useState<SectionType>('video_editing');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [cycleDay, setCycleDay] = useState(1);
  const [cycleTotalDays, setCycleTotalDays] = useState(90);

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

  const handleNavigate = (tab: string, entityId?: string) => {
    if (tab === 'project_detail' && entityId) {
      setSelectedProjectId(entityId);
      setCurrentTab('project_detail');
    } else if (tab.startsWith('goal_')) {
      const section = tab.replace('goal_', '') as SectionType;
      setSelectedSection(section);
      setCurrentTab(tab);
    } else if (tab === 'goals') {
      setSelectedSection('video_editing');
      setCurrentTab('goals');
    } else {
      setSelectedProjectId(null);
      setCurrentTab(tab);
    }
  };

  const handleOpenProject = (projId: string) => {
    setSelectedProjectId(projId);
    setCurrentTab('project_detail');
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'goals':
      case 'goal_video_editing':
        return <GoalsHubPage initialSection="video_editing" onOpenProject={handleOpenProject} />;
      case 'goal_marketing':
        return <GoalsHubPage initialSection="marketing" onOpenProject={handleOpenProject} />;
      case 'goal_freelance':
        return <GoalsHubPage initialSection="freelance" onOpenProject={handleOpenProject} />;
      case 'goal_skills':
        return <GoalsHubPage initialSection="skills" onOpenProject={handleOpenProject} />;
      case 'content':
      case 'dashboard':
        return <ContentStudioPage onOpenProject={handleOpenProject} />;
      case 'calendar':
        return <CalendarPage onOpenProject={handleOpenProject} />;
      case 'project_detail':
        return (
          <ProjectDetailPage
            projectId={selectedProjectId || 'proj_talking_head_ad'}
            onBack={() => handleNavigate('goals')}
          />
        );
      case 'analytics':
        return <AnalyticsPage />;
      case 'inbox':
        return <InboxPage onOpenQuickCapture={() => setIsQuickCaptureOpen(true)} onNavigate={handleNavigate} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <GoalsHubPage initialSection="video_editing" onOpenProject={handleOpenProject} />;
    }
  };

  return (
    <div className="flex h-screen bg-black text-zinc-100 overflow-hidden font-sans">
      {/* 1. Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleNavigate}
        onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
        cycleDay={cycleDay}
        cycleTotalDays={cycleTotalDays}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={currentTab.replace('_', ' ').toUpperCase()}
          cycleDay={cycleDay}
          streakDays={12}
          onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
        />

        <main className="flex-1 overflow-y-auto bg-zinc-950/60 pb-12">
          <div key={currentTab + (selectedProjectId || '')} className="page-transition min-h-full">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* 3. Global Quick Capture Modal (⌘K) */}
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
