import {
  DashboardSummaryResponse,
  Project,
  Category,
  Goal,
  Task,
  Blocker,
  TimeLog,
  BeforeAfterEntry,
  ContentItem,
  Client,
  DevelopmentLog,
  KnowledgeEntry,
  ReferenceItem,
  QuickIdea,
  Win,
  Report,
  Settings
} from './types';

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '5173'
    ? 'http://localhost:3001/api'
    : '/api');

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Summary
  getSummary: () => fetchJson<DashboardSummaryResponse>('/summary'),

  // Projects
  getProjects: () => fetchJson<Project[]>('/projects'),
  getProject: (id: string) =>
    fetchJson<{
      project: Project;
      tasks: Task[];
      blockers: Blocker[];
      timeLogs: TimeLog[];
      beforeAfter: BeforeAfterEntry[];
      comments: any[];
      devLogs: DevelopmentLog[];
      knowledgeEntries: KnowledgeEntry[];
    }>(`/projects/${id}`),
  createProject: (data: Partial<Project> & { tasks?: Array<{ title: string; stage?: string }> }) =>
    fetchJson<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: string, updates: Partial<Project>) =>
    fetchJson<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteProject: (id: string) =>
    fetchJson<{ success: boolean }>(`/projects/${id}`, { method: 'DELETE' }),

  // Project Timelogs, Blockers, Before/After, Comments
  addTimeLog: (projectId: string, data: { stage: string; hours: number; date?: string; notes?: string }) =>
    fetchJson<TimeLog>(`/projects/${projectId}/timelogs`, { method: 'POST', body: JSON.stringify(data) }),
  deleteTimeLog: (projectId: string, logId: string) =>
    fetchJson<{ success: boolean }>(`/projects/${projectId}/timelogs/${logId}`, { method: 'DELETE' }),
  addBlocker: (projectId: string, description: string) =>
    fetchJson<Blocker>(`/projects/${projectId}/blockers`, { method: 'POST', body: JSON.stringify({ description }) }),
  resolveBlocker: (projectId: string, blockerId: string) =>
    fetchJson<{ success: boolean }>(`/projects/${projectId}/blockers/${blockerId}/resolve`, { method: 'PUT' }),
  addBeforeAfter: (projectId: string, data: Partial<BeforeAfterEntry>) =>
    fetchJson<BeforeAfterEntry>(`/projects/${projectId}/before-after`, { method: 'POST', body: JSON.stringify(data) }),
  addProjectComment: (projectId: string, text: string, author = 'Editor') =>
    fetchJson<any>(`/projects/${projectId}/comments`, { method: 'POST', body: JSON.stringify({ text, author }) }),

  // Categories
  getCategories: () => fetchJson<Category[]>('/categories'),
  getCategory: (id: string) =>
    fetchJson<{
      category: Category;
      subcategories: Category[];
      tasks: Task[];
      linkedProjects: Project[];
      devLogs: DevelopmentLog[];
    }>(`/categories/${id}`),
  createCategory: (data: Partial<Category>) =>
    fetchJson<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: string, updates: Partial<Category>) =>
    fetchJson<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteCategory: (id: string) =>
    fetchJson<{ success: boolean }>(`/categories/${id}`, { method: 'DELETE' }),

  // Goals
  getGoals: () => fetchJson<Goal[]>('/goals'),
  createGoal: (data: Partial<Goal>) =>
    fetchJson<Goal>('/goals', { method: 'POST', body: JSON.stringify(data) }),
  updateGoal: (id: string, updates: Partial<Goal>) =>
    fetchJson<Goal>(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteGoal: (id: string) =>
    fetchJson<{ success: boolean }>(`/goals/${id}`, { method: 'DELETE' }),

  // Tasks
  getTasks: () => fetchJson<Task[]>('/tasks'),
  createTask: (data: Partial<Task>) =>
    fetchJson<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, updates: Partial<Task>) =>
    fetchJson<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteTask: (id: string) =>
    fetchJson<{ success: boolean }>(`/tasks/${id}`, { method: 'DELETE' }),

  // Content Studio
  getContent: () =>
    fetchJson<{
      items: ContentItem[];
      analytics: {
        totalContent: number;
        postedCount: number;
        totalHours: number;
        totalViews: number;
        totalSaves: number;
        avgViewsPerHour: number;
      };
    }>('/content'),
  createContent: (data: Partial<ContentItem>) =>
    fetchJson<ContentItem>('/content', { method: 'POST', body: JSON.stringify(data) }),
  updateContent: (id: string, updates: Partial<ContentItem>) =>
    fetchJson<ContentItem>(`/content/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteContent: (id: string) =>
    fetchJson<{ success: boolean }>(`/content/${id}`, { method: 'DELETE' }),

  // Clients
  getClients: () =>
    fetchJson<{
      clients: Client[];
      stats: { totalRevenue: number; potentialRevenue: number; totalLeads: number };
    }>('/clients'),
  createClient: (data: Partial<Client>) =>
    fetchJson<Client>('/clients', { method: 'POST', body: JSON.stringify(data) }),
  updateClient: (id: string, updates: Partial<Client>) =>
    fetchJson<Client>(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteClient: (id: string) =>
    fetchJson<{ success: boolean }>(`/clients/${id}`, { method: 'DELETE' }),

  // Dev Logs & Strategy Changes
  getLogs: (strategyOnly = false) =>
    fetchJson<DevelopmentLog[]>(`/logs${strategyOnly ? '?strategy_only=true' : ''}`),
  createLog: (data: Partial<DevelopmentLog>) =>
    fetchJson<DevelopmentLog>('/logs', { method: 'POST', body: JSON.stringify(data) }),
  deleteLog: (id: string) =>
    fetchJson<{ success: boolean }>(`/logs/${id}`, { method: 'DELETE' }),

  // Knowledge Base & References
  getKnowledge: () => fetchJson<KnowledgeEntry[]>('/knowledge'),
  createKnowledge: (data: Partial<KnowledgeEntry>) =>
    fetchJson<KnowledgeEntry>('/knowledge', { method: 'POST', body: JSON.stringify(data) }),
  updateKnowledge: (id: string, updates: Partial<KnowledgeEntry>) =>
    fetchJson<KnowledgeEntry>(`/knowledge/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteKnowledge: (id: string) =>
    fetchJson<{ success: boolean }>(`/knowledge/${id}`, { method: 'DELETE' }),

  getReferences: () => fetchJson<ReferenceItem[]>('/references'),
  createReference: (data: Partial<ReferenceItem>) =>
    fetchJson<ReferenceItem>('/references', { method: 'POST', body: JSON.stringify(data) }),
  deleteReference: (id: string) =>
    fetchJson<{ success: boolean }>(`/references/${id}`, { method: 'DELETE' }),

  // Quick Idea Inbox
  getQuickIdeas: () => fetchJson<QuickIdea[]>('/inbox'),
  createQuickIdea: (text: string, target_category?: string) =>
    fetchJson<QuickIdea>('/inbox', { method: 'POST', body: JSON.stringify({ text, target_category }) }),
  triageIdea: (id: string, data: { convert_to?: string; project_name?: string; content_title?: string }) =>
    fetchJson<{ success: boolean; convertedEntity: any }>(`/inbox/${id}/triage`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  deleteQuickIdea: (id: string) =>
    fetchJson<{ success: boolean }>(`/inbox/${id}`, { method: 'DELETE' }),

  // Wins
  getWins: () => fetchJson<Win[]>('/wins'),
  createWin: (data: Partial<Win>) =>
    fetchJson<Win>('/wins', { method: 'POST', body: JSON.stringify(data) }),
  deleteWin: (id: string) =>
    fetchJson<{ success: boolean }>(`/wins/${id}`, { method: 'DELETE' }),

  // Reports
  getReports: () => fetchJson<Report[]>('/reports'),
  getAutoAggregatedReport: () =>
    fetchJson<{ period_start: string; period_end: string; aggregated: any }>('/reports/auto-aggregate'),
  getMilestoneBenchmark: () =>
    fetchJson<{ day1_baseline: any; current_milestone: any }>('/reports/milestones/benchmark'),
  createReport: (data: Partial<Report>) =>
    fetchJson<Report>('/reports', { method: 'POST', body: JSON.stringify(data) }),
  deleteReport: (id: string) =>
    fetchJson<{ success: boolean }>(`/reports/${id}`, { method: 'DELETE' }),

  // Analytics
  getAnalytics: () =>
    fetchJson<{
      stageHoursData: Array<{ stage: string; hours: number }>;
      contentRoiData: Array<{ title: string; type: string; hours: number; views: number; saves: number; roi: number }>;
      difficultyDistribution: Record<string, number>;
      stats: {
        totalHoursLogged: number;
        totalRevenue: number;
        completedProjects: number;
        totalProjects: number;
        totalWins: number;
      };
    }>('/analytics'),

  // Settings
  getSettings: () => fetchJson<Settings>('/settings'),
  updateSettings: (data: Partial<Settings>) =>
    fetchJson<Settings>('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  resetCycleAndStreak: (streakDays = 0) =>
    fetchJson<{ success: boolean; message: string; settings: Settings }>('/settings/reset-cycle-streak', {
      method: 'POST',
      body: JSON.stringify({ streak_days: streakDays })
    }),
  importDatabase: (db: any) =>
    fetchJson<{ success: boolean; message: string }>('/settings/import', {
      method: 'POST',
      body: JSON.stringify(db)
    }),
  resetDatabase: () =>
    fetchJson<{ success: boolean; message: string }>('/settings/reset', { method: 'POST' })
};
