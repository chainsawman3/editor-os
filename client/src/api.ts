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
import { getLocalDb, saveLocalDb, getLocalSummary, initialDefaultDatabase } from './clientDb';

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
  // Summary & Dashboard
  getSummary: async (): Promise<DashboardSummaryResponse> => {
    try {
      return await fetchJson<DashboardSummaryResponse>('/summary');
    } catch {
      return getLocalSummary();
    }
  },

  // Goals
  getGoals: async (section?: string): Promise<Goal[]> => {
    try {
      const query = section ? `?section=${section}` : '';
      return await fetchJson<Goal[]>(`/goals${query}`);
    } catch {
      const db = getLocalDb();
      return section ? db.goals.filter((g) => g.section === section) : db.goals;
    }
  },

  createGoal: async (data: Partial<Goal>): Promise<Goal> => {
    const db = getLocalDb();
    const newGoal: Goal = {
      id: `goal_${Date.now()}`,
      section: (data.section as any) || 'video_editing',
      sub_section: data.sub_section || null,
      title: data.title || 'New Main Goal',
      description: data.description || '',
      target_date: data.target_date || new Date().toISOString().split('T')[0],
      priority: data.priority || 'High',
      status: data.status || 'In Progress',
      next_action: data.next_action || '',
      notes: data.notes || '',
      created_at: new Date().toISOString()
    };
    db.goals.unshift(newGoal);
    saveLocalDb(db);
    try {
      return await fetchJson<Goal>('/goals', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      return newGoal;
    }
  },

  updateGoal: async (id: string, updates: Partial<Goal>): Promise<Goal> => {
    const db = getLocalDb();
    const idx = db.goals.findIndex((g) => g.id === id);
    if (idx !== -1) {
      db.goals[idx] = { ...db.goals[idx], ...updates };
      saveLocalDb(db);
    }
    try {
      return await fetchJson<Goal>(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    } catch {
      return db.goals[idx];
    }
  },

  deleteGoal: async (id: string): Promise<{ success: boolean }> => {
    const db = getLocalDb();
    db.goals = db.goals.filter((g) => g.id !== id);
    saveLocalDb(db);
    try {
      return await fetchJson<{ success: boolean }>(`/goals/${id}`, { method: 'DELETE' });
    } catch {
      return { success: true };
    }
  },

  // Projects
  getProjects: async (section?: string): Promise<Project[]> => {
    try {
      const query = section ? `?section=${section}` : '';
      return await fetchJson<Project[]>(`/projects${query}`);
    } catch {
      const db = getLocalDb();
      return section ? db.projects.filter((p) => p.section === section) : db.projects;
    }
  },

  getProject: async (id: string) => {
    try {
      return await fetchJson<{
        project: Project;
        tasks: Task[];
        blockers: Blocker[];
        timeLogs: TimeLog[];
        beforeAfter: BeforeAfterEntry[];
        comments: any[];
        devLogs: DevelopmentLog[];
        knowledgeEntries: KnowledgeEntry[];
      }>(`/projects/${id}`);
    } catch {
      const db = getLocalDb();
      const project = db.projects.find((p) => p.id === id) || db.projects[0];
      return {
        project,
        tasks: db.tasks.filter((t) => t.project_id === id),
        blockers: db.blockers.filter((b) => b.related_entity_id === id),
        timeLogs: db.time_logs.filter((tl) => tl.project_id === id),
        beforeAfter: db.before_after_entries.filter((ba) => ba.project_id === id),
        comments: db.comments.filter((c) => c.project_id === id),
        devLogs: db.development_logs.filter((dl) => dl.project_id === id),
        knowledgeEntries: db.knowledge_entries.filter((ke) => ke.linked_project_id === id)
      };
    }
  },

  createProject: async (data: Partial<Project> & { tasks?: Array<{ title: string; stage?: string; due_date?: string }> }): Promise<Project> => {
    const db = getLocalDb();
    const newProj: Project = {
      id: `proj_${Date.now()}`,
      goal_id: data.goal_id || null,
      section: (data.section as any) || 'video_editing',
      sub_section: data.sub_section || null,
      name: data.name || 'Untitled Project',
      description: data.description || '',
      priority: data.priority || 'Medium',
      deadline: data.deadline || null,
      client_name: data.client_name || '',
      status: data.status || 'Planning',
      health_status: data.health_status || 'On Track',
      start_date: data.start_date || new Date().toISOString().split('T')[0],
      script_content: data.script_content || '',
      references: data.references || [],
      creative_ideas: data.creative_ideas || [],
      next_action: data.next_action || '',
      final_output_url: data.final_output_url || '',
      lessons_learned: data.lessons_learned || '',
      created_at: new Date().toISOString()
    };
    db.projects.unshift(newProj);
    if (data.tasks) {
      data.tasks.forEach((t, i) => {
        db.tasks.push({
          id: `t_${Date.now()}_${i}`,
          title: t.title,
          project_id: newProj.id,
          stage: t.stage || 'Editing',
          due_date: t.due_date || newProj.deadline,
          completed: false,
          order_index: i + 1,
          created_at: new Date().toISOString()
        });
      });
    }
    saveLocalDb(db);
    try {
      return await fetchJson<Project>('/projects', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      return newProj;
    }
  },

  updateProject: async (id: string, updates: Partial<Project>): Promise<Project> => {
    const db = getLocalDb();
    const idx = db.projects.findIndex((p) => p.id === id);
    if (idx !== -1) {
      db.projects[idx] = { ...db.projects[idx], ...updates };
      saveLocalDb(db);
    }
    try {
      return await fetchJson<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    } catch {
      return db.projects[idx];
    }
  },

  deleteProject: async (id: string): Promise<{ success: boolean }> => {
    const db = getLocalDb();
    db.projects = db.projects.filter((p) => p.id !== id);
    db.tasks = db.tasks.filter((t) => t.project_id !== id);
    saveLocalDb(db);
    try {
      return await fetchJson<{ success: boolean }>(`/projects/${id}`, { method: 'DELETE' });
    } catch {
      return { success: true };
    }
  },

  // Tasks
  getTasks: async (projectId?: string): Promise<Task[]> => {
    try {
      const query = projectId ? `?project_id=${projectId}` : '';
      return await fetchJson<Task[]>(`/tasks${query}`);
    } catch {
      const db = getLocalDb();
      return projectId ? db.tasks.filter((t) => t.project_id === projectId) : db.tasks;
    }
  },

  createTask: async (data: Partial<Task>): Promise<Task> => {
    const db = getLocalDb();
    const newTask: Task = {
      id: `t_${Date.now()}`,
      title: data.title || 'New Task',
      project_id: data.project_id || null,
      goal_id: data.goal_id || null,
      category_id: data.category_id || null,
      stage: data.stage || 'Editing',
      due_date: data.due_date || null,
      completed: false,
      order_index: db.tasks.length + 1,
      created_at: new Date().toISOString()
    };
    db.tasks.push(newTask);
    saveLocalDb(db);
    try {
      return await fetchJson<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      return newTask;
    }
  },

  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const db = getLocalDb();
    const idx = db.tasks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      db.tasks[idx] = { ...db.tasks[idx], ...updates };
      if (updates.completed !== undefined) {
        db.tasks[idx].completed_at = updates.completed ? new Date().toISOString() : null;
      }
      saveLocalDb(db);
    }
    try {
      return await fetchJson<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    } catch {
      return db.tasks[idx];
    }
  },

  deleteTask: async (id: string): Promise<{ success: boolean }> => {
    const db = getLocalDb();
    db.tasks = db.tasks.filter((t) => t.id !== id);
    saveLocalDb(db);
    try {
      return await fetchJson<{ success: boolean }>(`/tasks/${id}`, { method: 'DELETE' });
    } catch {
      return { success: true };
    }
  },

  // Clients
  getClients: async () => {
    try {
      return await fetchJson<{
        clients: Client[];
        stats: { totalRevenue: number; potentialRevenue: number; totalLeads: number };
      }>('/clients');
    } catch {
      const db = getLocalDb();
      const totalRevenue = db.clients.filter((c) => c.status === 'Client' || c.status === 'Completed').reduce((sum, c) => sum + (c.revenue || 0), 0);
      const potentialRevenue = db.clients.filter((c) => c.status === 'Agreed' || c.status === 'Contacted').reduce((sum, c) => sum + (c.revenue || 0), 0);
      return {
        clients: db.clients,
        stats: { totalRevenue, potentialRevenue, totalLeads: db.clients.length }
      };
    }
  },

  createClient: async (data: Partial<Client>): Promise<Client> => {
    const db = getLocalDb();
    const newClient: Client = {
      id: `cli_${Date.now()}`,
      name: data.name || 'New Client',
      contact_method: data.contact_method || 'Email',
      status: data.status || 'Contacted',
      priority: data.priority || 'Medium',
      contact_date: data.contact_date || new Date().toISOString().split('T')[0],
      deadline: data.deadline || null,
      linked_project_id: data.linked_project_id || null,
      potential_project: data.potential_project || '',
      revenue: data.revenue || 0,
      notes: data.notes || '',
      created_at: new Date().toISOString()
    };
    db.clients.unshift(newClient);
    saveLocalDb(db);
    try {
      return await fetchJson<Client>('/clients', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      return newClient;
    }
  },

  updateClient: async (id: string, updates: Partial<Client>): Promise<Client> => {
    const db = getLocalDb();
    const idx = db.clients.findIndex((c) => c.id === id);
    if (idx !== -1) {
      db.clients[idx] = { ...db.clients[idx], ...updates };
      saveLocalDb(db);
    }
    try {
      return await fetchJson<Client>(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    } catch {
      return db.clients[idx];
    }
  },

  deleteClient: async (id: string): Promise<{ success: boolean }> => {
    const db = getLocalDb();
    db.clients = db.clients.filter((c) => c.id !== id);
    saveLocalDb(db);
    try {
      return await fetchJson<{ success: boolean }>(`/clients/${id}`, { method: 'DELETE' });
    } catch {
      return { success: true };
    }
  },

  // Quick Idea Inbox
  getQuickIdeas: async (): Promise<QuickIdea[]> => {
    try {
      return await fetchJson<QuickIdea[]>('/inbox');
    } catch {
      return getLocalDb().quick_ideas;
    }
  },

  createQuickIdea: async (text: string, target_category?: string): Promise<QuickIdea> => {
    const db = getLocalDb();
    const newIdea: QuickIdea = {
      id: `idea_${Date.now()}`,
      text,
      target_section: target_category,
      triaged: false,
      captured_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    db.quick_ideas.unshift(newIdea);
    saveLocalDb(db);
    try {
      return await fetchJson<QuickIdea>('/inbox', { method: 'POST', body: JSON.stringify({ text, target_category }) });
    } catch {
      return newIdea;
    }
  },

  triageIdea: async (id: string, data: { convert_to?: string; project_name?: string; content_title?: string }) => {
    const db = getLocalDb();
    const idea = db.quick_ideas.find((i) => i.id === id);
    if (idea) {
      idea.triaged = true;
      idea.converted_to_type = data.convert_to as any;
      if (data.convert_to === 'project') {
        const newProj: Project = {
          id: `proj_${Date.now()}`,
          name: data.project_name || idea.text,
          section: (idea.target_section as any) || 'video_editing',
          priority: 'Medium',
          status: 'Planning',
          script_content: idea.text,
          created_at: new Date().toISOString()
        };
        db.projects.unshift(newProj);
        idea.converted_entity_id = newProj.id;
      }
      saveLocalDb(db);
    }
    try {
      return await fetchJson<{ success: boolean; convertedEntity: any }>(`/inbox/${id}/triage`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      return { success: true, convertedEntity: idea };
    }
  },

  deleteQuickIdea: async (id: string): Promise<{ success: boolean }> => {
    const db = getLocalDb();
    db.quick_ideas = db.quick_ideas.filter((i) => i.id !== id);
    saveLocalDb(db);
    try {
      return await fetchJson<{ success: boolean }>(`/inbox/${id}`, { method: 'DELETE' });
    } catch {
      return { success: true };
    }
  },

  // Analytics
  getAnalytics: async () => {
    try {
      return await fetchJson<any>('/analytics');
    } catch {
      const db = getLocalDb();
      const clients = db.clients;
      const totalOutreach = clients.length;
      const contacted = clients.filter((c) => c.status === 'Contacted').length;
      const ignored = clients.filter((c) => c.status === 'Ignored').length;
      const agreed = clients.filter((c) => c.status === 'Agreed' || c.status === 'Client' || c.status === 'Completed').length;
      const activeClients = clients.filter((c) => c.status === 'Client').length;
      const totalRevenue = clients.filter((c) => c.status === 'Client' || c.status === 'Completed').reduce((sum, c) => sum + (c.revenue || 0), 0);

      const tasks = db.tasks;
      const completedTasks = tasks.filter((t) => t.completed).length;
      const totalTasks = tasks.length;
      const taskVelocityRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const projects = db.projects;
      const completedProjects = projects.filter((p) => p.status === 'Posted' || p.status === 'Ready').length;
      const inProgressProjects = projects.filter((p) => p.status === 'In Progress').length;
      const plannedProjects = projects.filter((p) => p.status === 'Planning').length;

      return {
        crmFunnel: {
          totalOutreach,
          contacted,
          ignored,
          agreed,
          activeClients,
          conversionRate: totalOutreach > 0 ? Math.round((agreed / totalOutreach) * 100) : 0,
          totalRevenue
        },
        velocity: {
          totalTasks,
          completedTasks,
          taskVelocityRate,
          completedProjects,
          inProgressProjects,
          plannedProjects,
          weeklyProgress: [
            { day: 'Mon', tasksDone: 2, projectsActive: 3 },
            { day: 'Tue', tasksDone: 4, projectsActive: 3 },
            { day: 'Wed', tasksDone: 3, projectsActive: 4 },
            { day: 'Thu', tasksDone: 5, projectsActive: 4 },
            { day: 'Fri', tasksDone: 1, projectsActive: 4 },
            { day: 'Sat', tasksDone: 2, projectsActive: 4 },
            { day: 'Sun', tasksDone: 3, projectsActive: 4 }
          ]
        },
        difficultyDistribution: { Low: 2, Medium: 3, Hard: 2 },
        stats: {
          totalHoursLogged: 24,
          totalRevenue,
          completedProjects,
          totalProjects: projects.length,
          totalWins: 4
        }
      };
    }
  },

  // Project Extra Workspaces (Blockers, Timelogs, Before/After)
  addTimeLog: async (projectId: string, data: { stage: string; hours: number; date?: string; notes?: string }) => {
    const db = getLocalDb();
    const newLog: TimeLog = {
      id: `tl_${Date.now()}`,
      project_id: projectId,
      stage: data.stage,
      hours: data.hours,
      date: data.date || new Date().toISOString().split('T')[0],
      notes: data.notes || '',
      created_at: new Date().toISOString()
    };
    db.time_logs.push(newLog);
    saveLocalDb(db);
    return newLog;
  },

  deleteTimeLog: async (projectId: string, logId: string) => {
    const db = getLocalDb();
    db.time_logs = db.time_logs.filter((t) => t.id !== logId);
    saveLocalDb(db);
    return { success: true };
  },

  addBlocker: async (projectId: string, description: string) => {
    const db = getLocalDb();
    const newBlocker: Blocker = {
      id: `blk_${Date.now()}`,
      related_entity_type: 'project',
      related_entity_id: projectId,
      description,
      active: true,
      created_at: new Date().toISOString()
    };
    db.blockers.push(newBlocker);
    saveLocalDb(db);
    return newBlocker;
  },

  resolveBlocker: async (projectId: string, blockerId: string) => {
    const db = getLocalDb();
    const idx = db.blockers.findIndex((b) => b.id === blockerId);
    if (idx !== -1) {
      db.blockers[idx].active = false;
      db.blockers[idx].resolved_at = new Date().toISOString();
      saveLocalDb(db);
    }
    return { success: true };
  },

  addBeforeAfter: async (projectId: string, data: Partial<BeforeAfterEntry>) => {
    const db = getLocalDb();
    const newEntry: BeforeAfterEntry = {
      id: `ba_${Date.now()}`,
      project_id: projectId,
      before_title: data.before_title || 'Before',
      before_url: data.before_url || '',
      after_title: data.after_title || 'After',
      after_url: data.after_url || '',
      improvements_notes: data.improvements_notes || '',
      created_at: new Date().toISOString()
    };
    db.before_after_entries.push(newEntry);
    saveLocalDb(db);
    return newEntry;
  },

  addProjectComment: async (projectId: string, text: string, author = 'Editor') => {
    const db = getLocalDb();
    const comment = { id: `c_${Date.now()}`, project_id: projectId, text, author, created_at: new Date().toISOString() };
    db.comments.push(comment);
    saveLocalDb(db);
    return comment;
  },

  // Legacy fallback interfaces
  getCategories: async (): Promise<Category[]> => [],
  getCategory: async (id: string) => ({ category: {} as any, subcategories: [], tasks: [], linkedProjects: [], devLogs: [] }),
  createCategory: async (data: any) => data,
  updateCategory: async (id: string, updates: any) => updates,
  deleteCategory: async (id: string) => ({ success: true }),
  getContent: async () => ({ items: [], analytics: {} as any }),
  createContent: async (data: any) => data,
  updateContent: async (id: string, updates: any) => updates,
  deleteContent: async (id: string) => ({ success: true }),
  getLogs: async (strategyOnly?: boolean) => {
    const logs = getLocalDb().development_logs;
    return strategyOnly ? logs.filter((l) => l.is_strategy_change) : logs;
  },
  createLog: async (data: any) => data,
  deleteLog: async (id: string) => ({ success: true }),
  getKnowledge: async () => [],
  createKnowledge: async (data: any) => data,
  updateKnowledge: async (id: string, updates: any) => updates,
  deleteKnowledge: async (id: string) => ({ success: true }),
  getReferences: async () => [],
  createReference: async (data: any) => data,
  deleteReference: async (id: string) => ({ success: true }),
  getWins: async () => [],
  createWin: async (data: any) => data,
  deleteWin: async (id: string) => ({ success: true }),
  getReports: async () => [],
  createReport: async (data: any) => data,
  deleteReport: async (id: string) => ({ success: true }),
  getAutoAggregatedReport: async () => ({ period_start: '', period_end: '', aggregated: {} }),
  getMilestoneBenchmark: async () => ({ day1_baseline: {}, current_milestone: {} }),

  // Settings
  getSettings: async (): Promise<Settings> => {
    try {
      return await fetchJson<Settings>('/settings');
    } catch {
      return getLocalDb().settings[0];
    }
  },

  updateSettings: async (data: Partial<Settings>): Promise<Settings> => {
    const db = getLocalDb();
    if (db.settings[0]) {
      db.settings[0] = { ...db.settings[0], ...data };
      saveLocalDb(db);
    }
    try {
      return await fetchJson<Settings>('/settings', { method: 'PUT', body: JSON.stringify(data) });
    } catch {
      return db.settings[0];
    }
  },

  resetCycleAndStreak: async (streakDays = 0) => {
    const db = getLocalDb();
    const todayStr = new Date().toISOString().split('T')[0];
    if (db.settings[0]) {
      db.settings[0].cycle_start_date = todayStr;
      db.settings[0].streak_days = streakDays;
      saveLocalDb(db);
    }
    try {
      return await fetchJson<{ success: boolean; message: string; settings: Settings }>('/settings/reset-cycle-streak', {
        method: 'POST',
        body: JSON.stringify({ streak_days: streakDays })
      });
    } catch {
      return { success: true, message: 'Reset cycle and streak', settings: db.settings[0] };
    }
  },

  importDatabase: async (databaseData: any) => {
    saveLocalDb(databaseData);
    try {
      return await fetchJson<{ success: boolean; message: string }>('/settings/import', {
        method: 'POST',
        body: JSON.stringify(databaseData)
      });
    } catch {
      return { success: true, message: 'Database imported successfully' };
    }
  },

  resetDatabase: async () => {
    saveLocalDb(initialDefaultDatabase);
    try {
      return await fetchJson<{ success: boolean; message: string }>('/settings/reset', { method: 'POST' });
    } catch {
      return { success: true, message: 'Database reset successfully' };
    }
  }
};
