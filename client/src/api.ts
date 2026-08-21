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
import { tursoApi, initTursoTables } from './tursoDb';

// Initialize Turso tables on app launch
initTursoTables().catch(console.error);

export const api = {
  // Summary & Dashboard (Real-time Cloud Sync)
  getSummary: tursoApi.getSummary,

  // Goals
  getGoals: tursoApi.getGoals,
  createGoal: tursoApi.createGoal,
  updateGoal: tursoApi.updateGoal,
  deleteGoal: tursoApi.deleteGoal,

  // Projects
  getProjects: tursoApi.getProjects,
  getProject: tursoApi.getProject,
  createProject: tursoApi.createProject,
  updateProject: tursoApi.updateProject,
  deleteProject: tursoApi.deleteProject,

  // Tasks
  getTasks: tursoApi.getTasks,
  createTask: tursoApi.createTask,
  updateTask: tursoApi.updateTask,
  deleteTask: tursoApi.deleteTask,

  // Clients (Freelance / CRM)
  getClients: async (): Promise<any> => {
    const clients = await tursoApi.getClients();
    return { clients, stats: { total: clients.length, active: clients.length, pipeline_value: 0, conversion_rate: 0 } };
  },
  createClient: tursoApi.createClient,
  updateClient: tursoApi.updateClient,
  deleteClient: tursoApi.deleteClient,

  // Quick Ideas & Inbox
  getQuickIdeas: tursoApi.getQuickIdeas,
  createQuickIdea: tursoApi.createQuickIdea,
  deleteQuickIdea: tursoApi.deleteQuickIdea,

  // Analytics
  getAnalytics: tursoApi.getAnalytics,

  // Mock / extra endpoints preserved for compatibility
  getCategories: async (): Promise<Category[]> => [],
  getCategory: async (...args: any[]): Promise<any> => ({
    category: { id: args[0], name: 'General', icon: 'Folder', status: 'active', parent_id: null, order_index: 0, created_at: '' },
    subcategories: [],
    tasks: [],
    linkedProjects: [],
    devLogs: []
  }),
  createCategory: async (data: any) => data,
  updateCategory: async (...args: any[]) => args[1] || args[0],
  deleteCategory: async (id: string) => ({ success: true }),
  getBlockers: async (): Promise<Blocker[]> => [],
  createBlocker: async (data: any) => data,
  resolveBlocker: async (...args: any[]) => ({ success: true }),
  deleteBlocker: async (id: string) => ({ success: true }),
  getTimeLogs: async (): Promise<TimeLog[]> => [],
  createTimeLog: async (data: any) => data,
  addTimeLog: async (...args: any[]) => args[1] || args[0],
  deleteTimeLog: async (id: string) => ({ success: true }),
  getBeforeAfterEntries: async () => [],
  createBeforeAfterEntry: async (data: any) => data,
  addBeforeAfter: async (...args: any[]) => args[1] || args[0],
  deleteBeforeAfterEntry: async (id: string) => ({ success: true }),
  getContentItems: async () => [],
  createContentItem: async (data: any) => data,
  updateContentItem: async (id: string, updates: any) => updates,
  deleteContentItem: async (id: string) => ({ success: true }),
  getDevelopmentLogs: async () => [],
  getLogs: async (...args: any[]) => [],
  createLog: async (data: any) => data,
  deleteLog: async (id: string) => ({ success: true }),
  createDevelopmentLog: async (data: any) => data,
  deleteDevelopmentLog: async (id: string) => ({ success: true }),
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
  triageIdea: async (id: string, data: any) => data,
  getAutoAggregatedReport: async () => ({ period_start: '', period_end: '', aggregated: {} }),
  getMilestoneBenchmark: async () => ({ day1_baseline: {}, current_milestone: {} }),

  // Settings
  getSettings: async (): Promise<Settings> => {
    return getLocalDb().settings[0] || initialDefaultDatabase.settings[0];
  },

  updateSettings: async (data: Partial<Settings>): Promise<Settings> => {
    const db = getLocalDb();
    if (db.settings[0]) {
      db.settings[0] = { ...db.settings[0], ...data };
      saveLocalDb(db);
    }
    return db.settings[0];
  },

  resetCycleAndStreak: async (streakDays = 0) => {
    const db = getLocalDb();
    const todayStr = new Date().toISOString().split('T')[0];
    if (db.settings[0]) {
      db.settings[0].cycle_start_date = todayStr;
      db.settings[0].streak_days = streakDays;
      saveLocalDb(db);
    }
    return { success: true, message: 'Reset cycle and streak', settings: db.settings[0] };
  },

  exportDatabase: tursoApi.exportDatabase,
  importDatabase: tursoApi.importDatabase,

  resetDatabase: async () => {
    saveLocalDb(initialDefaultDatabase);
    return { success: true, message: 'Database reset successfully' };
  }
};
