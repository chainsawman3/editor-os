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
import { getLocalDb, saveLocalDb, getLocalSummary } from './clientDb';

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
  getSummary: async (): Promise<DashboardSummaryResponse> => {
    try {
      return await fetchJson<DashboardSummaryResponse>('/summary');
    } catch {
      return getLocalSummary();
    }
  },

  // Projects
  getProjects: async (): Promise<Project[]> => {
    try {
      return await fetchJson<Project[]>('/projects');
    } catch {
      return getLocalDb().projects;
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

  createProject: async (data: Partial<Project> & { tasks?: Array<{ title: string; stage?: string }> }): Promise<Project> => {
    const db = getLocalDb();
    const newProj: Project = {
      id: `proj_${Date.now()}`,
      name: data.name || 'Untitled Project',
      type: data.type || 'Portfolio',
      category_id: data.category_id || null,
      status: data.status || 'Planning',
      priority: data.priority || 'Medium',
      health_status: data.health_status || 'On Track',
      start_date: data.start_date || new Date().toISOString().split('T')[0],
      deadline: data.deadline || null,
      description: data.description || '',
      expected_difficulty: data.expected_difficulty || 'Medium',
      actual_difficulty: data.actual_difficulty || null,
      next_action: data.next_action || '',
      final_output_url: data.final_output_url || '',
      lessons_learned: data.lessons_learned || '',
      created_at: new Date().toISOString()
    };
    db.projects.push(newProj);
    if (data.tasks) {
      data.tasks.forEach((t, i) => {
        db.tasks.push({
          id: `t_${Date.now()}_${i}`,
          title: t.title,
          project_id: newProj.id,
          stage: t.stage || 'Editing',
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
    db.blockers = db.blockers.filter((b) => b.related_entity_id !== id);
    saveLocalDb(db);
    try {
      return await fetchJson<{ success: boolean }>(`/projects/${id}`, { method: 'DELETE' });
    } catch {
      return { success: true };
    }
  },

  // Project Timelogs, Blockers, Before/After, Comments
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
    try {
      return await fetchJson<TimeLog>(`/projects/${projectId}/timelogs`, { method: 'POST', body: JSON.stringify(data) });
    } catch {
      return newLog;
    }
  },

  deleteTimeLog: async (projectId: string, logId: string) => {
    const db = getLocalDb();
    db.time_logs = db.time_logs.filter((t) => t.id !== logId);
    saveLocalDb(db);
    try {
      return await fetchJson<{ success: boolean }>(`/projects/${projectId}/timelogs/${logId}`, { method: 'DELETE' });
    } catch {
      return { success: true };
    }
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
    try {
      return await fetchJson<Blocker>(`/projects/${projectId}/blockers`, { method: 'POST', body: JSON.stringify({ description }) });
    } catch {
      return newBlocker;
    }
  },

  resolveBlocker: async (projectId: string, blockerId: string) => {
    const db = getLocalDb();
    const idx = db.blockers.findIndex((b) => b.id === blockerId);
    if (idx !== -1) {
      db.blockers[idx].active = false;
      db.blockers[idx].resolved_at = new Date().toISOString();
      saveLocalDb(db);
    }
    try {
      return await fetchJson<{ success: boolean }>(`/projects/${projectId}/blockers/${blockerId}/resolve`, { method: 'PUT' });
    } catch {
      return { success: true };
    }
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
    try {
      return await fetchJson<BeforeAfterEntry>(`/projects/${projectId}/before-after`, { method: 'POST', body: JSON.stringify(data) });
    } catch {
      return newEntry;
    }
  },

  addProjectComment: async (projectId: string, text: string, author = 'Editor') => {
    const db = getLocalDb();
    const comment = { id: `c_${Date.now()}`, project_id: projectId, text, author, created_at: new Date().toISOString() };
    db.comments.push(comment);
    saveLocalDb(db);
    try {
      return await fetchJson<any>(`/projects/${projectId}/comments`, { method: 'POST', body: JSON.stringify({ text, author }) });
    } catch {
      return comment;
    }
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    try {
      return await fetchJson<Category[]>('/categories');
    } catch {
      const db = getLocalDb();
      return db.categories.map((cat) => {
        const subcategories = db.categories.filter((c) => c.parent_id === cat.id);
        const tasks = db.tasks.filter((t) => t.category_id === cat.id);
        const projects = db.projects.filter((p) => p.category_id === cat.id);
        return { ...cat, subcategories, tasks, projects };
      });
    }
  },

  getCategory: async (id: string) => {
    try {
      return await fetchJson<{
        category: Category;
        subcategories: Category[];
        tasks: Task[];
        linkedProjects: Project[];
        devLogs: DevelopmentLog[];
      }>(`/categories/${id}`);
    } catch {
      const db = getLocalDb();
      const cat = db.categories.find((c) => c.id === id) || db.categories[0];
      const subcategories = db.categories.filter((c) => c.parent_id === id);
      const subcatIds = [id, ...subcategories.map((s) => s.id)];
      return {
        category: cat,
        subcategories,
        tasks: db.tasks.filter((t) => t.category_id && subcatIds.includes(t.category_id)),
        linkedProjects: db.projects.filter((p) => p.category_id && subcatIds.includes(p.category_id)),
        devLogs: db.development_logs.filter((dl) => dl.category_id === id)
      };
    }
  },

  createCategory: async (data: Partial<Category>) => {
    const db = getLocalDb();
    const newCat: Category = {
      id: data.id || `cat_${Date.now()}`,
      name: data.name || 'New Category',
      icon: data.icon || 'Folder',
      status: data.status || 'In Progress',
      parent_id: data.parent_id || null,
      order_index: db.categories.length + 1,
      next_action: data.next_action || '',
      created_at: new Date().toISOString()
    };
    db.categories.push(newCat);
    saveLocalDb(db);
    try {
      return await fetchJson<Category>('/categories', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      return newCat;
    }
  },

  updateCategory: async (id: string, updates: Partial<Category>) => {
    const db = getLocalDb();
    const idx = db.categories.findIndex((c) => c.id === id);
    if (idx !== -1) {
      db.categories[idx] = { ...db.categories[idx], ...updates };
      saveLocalDb(db);
    }
    try {
      return await fetchJson<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    } catch {
      return db.categories[idx];
    }
  },

  deleteCategory: async (id: string) => {
    const db = getLocalDb();
    db.categories = db.categories.filter((c) => c.id !== id && c.parent_id !== id);
    saveLocalDb(db);
    try {
      return await fetchJson<{ success: boolean }>(`/categories/${id}`, { method: 'DELETE' });
    } catch {
      return { success: true };
    }
  },

  deleteCategoryTask: async (categoryId: string, taskId: string) => {
    const db = getLocalDb();
    db.tasks = db.tasks.filter((t) => t.id !== taskId);
    saveLocalDb(db);
    try {
      return await fetchJson<{ success: boolean }>(`/categories/${categoryId}/tasks/${taskId}`, { method: 'DELETE' });
    } catch {
      return { success: true };
    }
  },

  clearCategoryTasks: async (categoryId: string) => {
    const db = getLocalDb();
    db.tasks = db.tasks.filter((t) => t.category_id !== categoryId);
    saveLocalDb(db);
    try {
      return await fetchJson<{ success: boolean }>(`/categories/${categoryId}/tasks/clear-all`, { method: 'DELETE' });
    } catch {
      return { success: true };
    }
  },

  // Goals
  getGoals: async (): Promise<Goal[]> => {
    try {
      return await fetchJson<Goal[]>('/goals');
    } catch {
      return getLocalDb().goals;
    }
  },

  createGoal: async (data: Partial<Goal>): Promise<Goal> => {
    const db = getLocalDb();
    const newGoal: Goal = {
      id: `goal_${Date.now()}`,
      title: data.title || 'New Goal',
      category_id: data.category_id || 'cat_video_editing',
      target_date: data.target_date || new Date().toISOString().split('T')[0],
      status: data.status || 'In Progress',
      next_action: data.next_action || '',
      created_at: new Date().toISOString()
    };
    db.goals.push(newGoal);
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

  // Tasks
  getTasks: async (): Promise<Task[]> => {
    try {
      return await fetchJson<Task[]>('/tasks');
    } catch {
      return getLocalDb().tasks;
    }
  },

  createTask: async (data: Partial<Task>): Promise<Task> => {
    const db = getLocalDb();
    const newTask: Task = {
      id: `t_${Date.now()}`,
      title: data.title || 'New Task',
      project_id: data.project_id,
      category_id: data.category_id,
      stage: data.stage,
      due_date: data.due_date,
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

  // Content Studio
  getContent: async () => {
    try {
      return await fetchJson<{
        items: ContentItem[];
        analytics: {
          totalContent: number;
          postedCount: number;
          totalHours: number;
          totalViews: number;
          totalSaves: number;
          avgViewsPerHour: number;
        };
      }>('/content');
    } catch {
      const db = getLocalDb();
      return {
        items: db.content_items,
        analytics: {
          totalContent: db.content_items.length,
          postedCount: db.content_items.filter((c) => c.status === 'Posted').length,
          totalHours: 12,
          totalViews: 45000,
          totalSaves: 1200,
          avgViewsPerHour: 3750
        }
      };
    }
  },

  createContent: async (data: Partial<ContentItem>): Promise<ContentItem> => {
    const db = getLocalDb();
    const newItem: ContentItem = {
      id: `cont_${Date.now()}`,
      title: data.title || 'Untitled Post',
      platforms: data.platforms || ['Instagram'],
      status: data.status || 'Idea',
      content_type: data.content_type || 'Short Form',
      main_idea: data.main_idea || '',
      hook: data.hook || '',
      scheduled_date: data.scheduled_date || null,
      hours_invested: data.hours_invested || 1,
      views: data.views || 0,
      likes: data.likes || 0,
      saves: data.saves || 0,
      created_at: new Date().toISOString()
    };
    db.content_items.push(newItem);
    saveLocalDb(db);
    try {
      return await fetchJson<ContentItem>('/content', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      return newItem;
    }
  },

  updateContent: async (id: string, updates: Partial<ContentItem>): Promise<ContentItem> => {
    const db = getLocalDb();
    const idx = db.content_items.findIndex((c) => c.id === id);
    if (idx !== -1) {
      db.content_items[idx] = { ...db.content_items[idx], ...updates };
      saveLocalDb(db);
    }
    try {
      return await fetchJson<ContentItem>(`/content/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    } catch {
      return db.content_items[idx];
    }
  },

  deleteContent: async (id: string): Promise<{ success: boolean }> => {
    const db = getLocalDb();
    db.content_items = db.content_items.filter((c) => c.id !== id);
    saveLocalDb(db);
    try {
      return await fetchJson<{ success: boolean }>(`/content/${id}`, { method: 'DELETE' });
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
      const potentialRevenue = db.clients.filter((c) => c.status === 'Discussion' || c.status === 'Contacted').reduce((sum, c) => sum + (c.revenue || 0), 0);
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
      status: data.status || 'Lead',
      contact_date: data.contact_date || new Date().toISOString().split('T')[0],
      follow_up_date: data.follow_up_date || null,
      potential_project: data.potential_project || '',
      revenue: data.revenue || 0,
      notes: data.notes || '',
      created_at: new Date().toISOString()
    };
    db.clients.push(newClient);
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

  // Dev Logs
  getLogs: async (strategyOnly = false): Promise<DevelopmentLog[]> => {
    try {
      return await fetchJson<DevelopmentLog[]>(`/logs${strategyOnly ? '?strategy_only=true' : ''}`);
    } catch {
      const db = getLocalDb();
      return strategyOnly ? db.development_logs.filter((l) => l.is_strategy_change) : db.development_logs;
    }
  },

  createLog: async (data: Partial<DevelopmentLog>): Promise<DevelopmentLog> => {
    const db = getLocalDb();
    const newLog: DevelopmentLog = {
      id: `log_${Date.now()}`,
      date: data.date || new Date().toISOString().split('T')[0],
      project_id: data.project_id || null,
      category_id: data.category_id || null,
      title: data.title || 'Development Log',
      comment: data.comment || '',
      is_strategy_change: data.is_strategy_change || false,
      old_strategy: data.old_strategy,
      new_strategy: data.new_strategy,
      change_reason: data.change_reason,
      created_at: new Date().toISOString()
    };
    db.development_logs.unshift(newLog);
    saveLocalDb(db);
    try {
      return await fetchJson<DevelopmentLog>('/logs', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      return newLog;
    }
  },

  deleteLog: async (id: string): Promise<{ success: boolean }> => {
    const db = getLocalDb();
    db.development_logs = db.development_logs.filter((l) => l.id !== id);
    saveLocalDb(db);
    try {
      return await fetchJson<{ success: boolean }>(`/logs/${id}`, { method: 'DELETE' });
    } catch {
      return { success: true };
    }
  },

  // Knowledge Base & References
  getKnowledge: async (): Promise<KnowledgeEntry[]> => {
    try {
      return await fetchJson<KnowledgeEntry[]>('/knowledge');
    } catch {
      return getLocalDb().knowledge_entries;
    }
  },

  createKnowledge: async (data: Partial<KnowledgeEntry>): Promise<KnowledgeEntry> => {
    const db = getLocalDb();
    const newEntry: KnowledgeEntry = {
      id: `k_${Date.now()}`,
      title: data.title || 'New Note',
      category: data.category || 'Editing',
      description: data.description || '',
      when_to_use: data.when_to_use || '',
      notes: data.notes || '',
      linked_project_id: data.linked_project_id || null,
      created_at: new Date().toISOString()
    };
    db.knowledge_entries.unshift(newEntry);
    saveLocalDb(db);
    try {
      return await fetchJson<KnowledgeEntry>('/knowledge', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      return newEntry;
    }
  },

  updateKnowledge: async (id: string, updates: Partial<KnowledgeEntry>): Promise<KnowledgeEntry> => {
    const db = getLocalDb();
    const idx = db.knowledge_entries.findIndex((k) => k.id === id);
    if (idx !== -1) {
      db.knowledge_entries[idx] = { ...db.knowledge_entries[idx], ...updates };
      saveLocalDb(db);
    }
    try {
      return await fetchJson<KnowledgeEntry>(`/knowledge/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    } catch {
      return db.knowledge_entries[idx];
    }
  },

  deleteKnowledge: async (id: string): Promise<{ success: boolean }> => {
    const db = getLocalDb();
    db.knowledge_entries = db.knowledge_entries.filter((k) => k.id !== id);
    saveLocalDb(db);
    try {
      return await fetchJson<{ success: boolean }>(`/knowledge/${id}`, { method: 'DELETE' });
    } catch {
      return { success: true };
    }
  },

  getReferences: async (): Promise<ReferenceItem[]> => {
    try {
      return await fetchJson<ReferenceItem[]>('/references');
    } catch {
      return getLocalDb().reference_items;
    }
  },

  createReference: async (data: Partial<ReferenceItem>): Promise<ReferenceItem> => {
    const db = getLocalDb();
    const newRef: ReferenceItem = {
      id: `ref_${Date.now()}`,
      title: data.title || 'New Reference',
      link: data.link || '',
      category: data.category || 'Editing',
      why_saved: data.why_saved || '',
      what_to_learn: data.what_to_learn || '',
      created_at: new Date().toISOString()
    };
    db.reference_items.unshift(newRef);
    saveLocalDb(db);
    try {
      return await fetchJson<ReferenceItem>('/references', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      return newRef;
    }
  },

  deleteReference: async (id: string): Promise<{ success: boolean }> => {
    const db = getLocalDb();
    db.reference_items = db.reference_items.filter((r) => r.id !== id);
    saveLocalDb(db);
    try {
      return await fetchJson<{ success: boolean }>(`/references/${id}`, { method: 'DELETE' });
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
      target_category,
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

  // Wins
  getWins: async (): Promise<Win[]> => {
    try {
      return await fetchJson<Win[]>('/wins');
    } catch {
      return getLocalDb().wins;
    }
  },

  createWin: async (data: Partial<Win>): Promise<Win> => {
    const db = getLocalDb();
    const newWin: Win = {
      id: `win_${Date.now()}`,
      title: data.title || 'New Win',
      category: data.category || 'Project',
      date: data.date || new Date().toISOString().split('T')[0],
      description: data.description || '',
      created_at: new Date().toISOString()
    };
    db.wins.unshift(newWin);
    saveLocalDb(db);
    try {
      return await fetchJson<Win>('/wins', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      return newWin;
    }
  },

  deleteWin: async (id: string): Promise<{ success: boolean }> => {
    const db = getLocalDb();
    db.wins = db.wins.filter((w) => w.id !== id);
    saveLocalDb(db);
    try {
      return await fetchJson<{ success: boolean }>(`/wins/${id}`, { method: 'DELETE' });
    } catch {
      return { success: true };
    }
  },

  // Reports
  getReports: async (): Promise<Report[]> => {
    try {
      return await fetchJson<Report[]>('/reports');
    } catch {
      return getLocalDb().reports;
    }
  },

  getAutoAggregatedReport: async () => {
    try {
      return await fetchJson<{ period_start: string; period_end: string; aggregated: any }>('/reports/auto-aggregate');
    } catch {
      const todayStr = new Date().toISOString().split('T')[0];
      return {
        period_start: todayStr,
        period_end: todayStr,
        aggregated: {
          hoursLogged: 15,
          completedTasks: 8,
          activeProjectsCount: 2,
          revenueAdded: 1200
        }
      };
    }
  },

  getMilestoneBenchmark: async () => {
    try {
      return await fetchJson<{ day1_baseline: any; current_milestone: any }>('/reports/milestones/benchmark');
    } catch {
      return {
        day1_baseline: { projects: 1, clients: 1, avgEditSpeed: 'Medium' },
        current_milestone: { projects: 4, clients: 3, avgEditSpeed: 'Fast' }
      };
    }
  },

  createReport: async (data: Partial<Report>): Promise<Report> => {
    const db = getLocalDb();
    const newRep: Report = {
      id: `rep_${Date.now()}`,
      type: (data.type as any) || 'weekly',
      period_start: data.period_start,
      period_end: data.period_end,
      milestone_day: data.milestone_day,
      metrics_json: data.metrics_json || {},
      what_worked: data.what_worked,
      what_failed: data.what_failed,
      what_learned: data.what_learned,
      created_at: new Date().toISOString()
    };
    db.reports.unshift(newRep);
    saveLocalDb(db);
    try {
      return await fetchJson<Report>('/reports', { method: 'POST', body: JSON.stringify(data) });
    } catch {
      return newRep;
    }
  },

  deleteReport: async (id: string): Promise<{ success: boolean }> => {
    const db = getLocalDb();
    db.reports = db.reports.filter((r) => r.id !== id);
    saveLocalDb(db);
    try {
      return await fetchJson<{ success: boolean }>(`/reports/${id}`, { method: 'DELETE' });
    } catch {
      return { success: true };
    }
  },

  // Analytics
  getAnalytics: async () => {
    try {
      return await fetchJson<{
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
      }>('/analytics');
    } catch {
      return {
        stageHoursData: [
          { stage: 'Research', hours: 2 },
          { stage: 'Editing', hours: 8 },
          { stage: 'Sound Design', hours: 3 },
          { stage: 'Color Grading', hours: 1.5 },
          { stage: 'Motion Graphics', hours: 2.5 },
          { stage: 'Export', hours: 0.5 }
        ],
        contentRoiData: [
          { title: 'Fitness Commercial Spec', type: 'Short Form', hours: 3, views: 24000, saves: 850, roi: 8000 }
        ],
        difficultyDistribution: { Easy: 1, Medium: 3, Hard: 1, Extreme: 0 },
        stats: {
          totalHoursLogged: 17.5,
          totalRevenue: 3200,
          completedProjects: 2,
          totalProjects: 4,
          totalWins: 3
        }
      };
    }
  },

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
      return { success: true, message: 'Database imported successfully into local storage' };
    }
  },

  resetDatabase: async () => {
    const db = getLocalDb();
    db.projects = [];
    db.tasks = [];
    db.blockers = [];
    db.time_logs = [];
    db.content_items = [];
    db.clients = [];
    db.goals = [];
    db.development_logs = [];
    db.knowledge_entries = [];
    db.reference_items = [];
    db.quick_ideas = [];
    db.wins = [];
    db.reports = [];
    saveLocalDb(db);
    try {
      return await fetchJson<{ success: boolean; message: string }>('/settings/reset', { method: 'POST' });
    } catch {
      return { success: true, message: 'Database reset successfully' };
    }
  }
};
