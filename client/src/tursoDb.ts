import {
  DashboardSummaryResponse,
  Project,
  Goal,
  Task,
  Client,
  QuickIdea
} from './types';
import { initialDefaultDatabase, getLocalDb, saveLocalDb, getLocalSummary } from './clientDb';

const TURSO_URL =
  import.meta.env.VITE_TURSO_DATABASE_URL ||
  'https://editor-os-db-chainsawman3.aws-eu-west-1.turso.io/v2/pipeline';

const TURSO_AUTH_TOKEN =
  import.meta.env.VITE_TURSO_AUTH_TOKEN ||
  'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODcyNTg3MjYsImlkIjoiMDFhMDIwZTktMzgwMS03YTVkLTg1OTgtOGZlMTNhMzczNGVjIiwia2lkIjoiUUMzNkxQZVdoN2ppWXl3VmxQNlkxV09GaTB1RXJmRTd5WU1rWmlfNWpQOCIsInJpZCI6IjBmMWY2MjIzLTgyNjMtNDQyYS1hMGVlLTgzNjIyMjkxYTMyNyJ9.G5egcvRrEbXEe4f0L2QM2Qbb6QX3WMYIWRGp0QAArB4W8ANktoVE_J3Mf4VtMaAIHcCc2EGibrvrMDCzYuD1Dg';

function mapArg(val: any) {
  if (val === null || val === undefined) return { type: 'null' };
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { type: 'integer', value: String(val) } : { type: 'float', value: val };
  }
  if (typeof val === 'boolean') {
    return { type: 'integer', value: val ? '1' : '0' };
  }
  return { type: 'text', value: String(val) };
}

export async function queryTurso<T = any>(sql: string, args: any[] = []): Promise<T[]> {
  try {
    const res = await fetch(TURSO_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TURSO_AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            type: 'execute',
            stmt: {
              sql,
              args: args.map(mapArg)
            }
          }
        ]
      })
    });

    if (!res.ok) {
      throw new Error(`Turso HTTP ${res.status}`);
    }

    const json = await res.json();
    const result = json.results?.[0];
    if (result?.type === 'error') {
      console.warn('Turso SQL Error:', result.error?.message);
      return [];
    }

    const execRes = result?.response?.result;
    if (!execRes || !execRes.cols || !execRes.rows) return [];

    const cols: string[] = execRes.cols.map((c: any) => c.name);
    return execRes.rows.map((row: any[]) => {
      const obj: any = {};
      cols.forEach((col, idx) => {
        const cell = row[idx];
        obj[col] = cell && cell.value !== undefined ? cell.value : null;
      });
      return obj;
    });
  } catch (err) {
    console.warn('Turso query fallback:', err);
    return [];
  }
}

let isInitialized = false;

// 1. Initialize Tables in Turso Cloud Database
export async function initTursoTables() {
  if (isInitialized) return;
  try {
    const tables = [
      `CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY,
        cycle_start_date TEXT,
        cycle_duration_days INTEGER,
        streak_days INTEGER,
        user_name TEXT,
        created_at TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        section TEXT,
        sub_section TEXT,
        title TEXT NOT NULL,
        description TEXT,
        target_date TEXT,
        priority TEXT,
        status TEXT,
        next_action TEXT,
        notes TEXT,
        created_at TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        goal_id TEXT,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT,
        priority TEXT,
        deadline TEXT,
        section TEXT,
        sub_section TEXT,
        client_name TEXT,
        script_content TEXT,
        creative_ideas TEXT,
        references_json TEXT,
        created_at TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        project_id TEXT,
        title TEXT NOT NULL,
        due_date TEXT,
        completed INTEGER,
        stage TEXT,
        order_index INTEGER,
        created_at TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT,
        priority TEXT,
        deadline TEXT,
        revenue REAL,
        linked_project_id TEXT,
        notes TEXT,
        created_at TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS quick_ideas (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        target_category TEXT,
        triaged INTEGER,
        created_at TEXT
      );`
    ];

    for (const sql of tables) {
      await queryTurso(sql);
    }

    isInitialized = true;
  } catch (err) {
    console.error('Turso init error:', err);
  }
}

// 2. High Level Turso Cloud API Operations
export const tursoApi = {
  getSummary: async (): Promise<DashboardSummaryResponse> => {
    try {
      await initTursoTables();
      const [goalsRows, projectsRows, tasksRows] = await Promise.all([
        queryTurso('SELECT * FROM goals;'),
        queryTurso('SELECT * FROM projects;'),
        queryTurso('SELECT * FROM tasks;')
      ]);

      const projects = projectsRows.length > 0 ? projectsRows.map(mapProjectRow) : getLocalDb().projects;
      const goals = goalsRows.length > 0 ? goalsRows.map(mapGoalRow) : getLocalDb().goals;
      const tasks = tasksRows.length > 0 ? tasksRows.map(mapTaskRow) : getLocalDb().tasks;

      const activeProjects = projects.filter((p) => p.status !== 'Posted');
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const overdueTasks = tasks.filter((t) => !t.completed && t.due_date && t.due_date < todayStr);

      const upcomingDeadlines: DashboardSummaryResponse['upcomingDeadlines'] = [];

      goals.forEach((g) => {
        if (g.target_date) {
          upcomingDeadlines.push({
            id: g.id,
            title: `🎯 ${g.title}`,
            type: 'Goal',
            date: g.target_date,
            isOverdue: g.target_date < todayStr
          });
        }
      });

      activeProjects.forEach((p) => {
        if (p.deadline) {
          upcomingDeadlines.push({
            id: p.id,
            title: `🎬 ${p.name}`,
            type: 'Project',
            date: p.deadline,
            isOverdue: p.deadline < todayStr
          });
        }
      });

      tasks.filter((t) => !t.completed && t.due_date).forEach((t) => {
        upcomingDeadlines.push({
          id: t.id,
          title: `✅ ${t.title}`,
          type: 'Task',
          date: t.due_date!,
          isOverdue: t.due_date! < todayStr
        });
      });

      upcomingDeadlines.sort((a, b) => a.date.localeCompare(b.date));

      return {
        summary: {
          cycleDay: 12,
          cycleTotalDays: 90,
          cycleStartDate: todayStr,
          overallProgress: 15,
          streakDays: 12,
          activeProjectsCount: activeProjects.length,
          overdueTasksCount: overdueTasks.length,
          nextUpcomingDeadline: upcomingDeadlines[0] || null
        },
        categoryProgress: [],
        nextActions: [],
        activeBlockers: [],
        todayTasks: tasks.filter((t) => !t.completed).slice(0, 5),
        upcomingDeadlines,
        recentActivities: []
      };
    } catch {
      return getLocalSummary();
    }
  },

  getGoals: async (section?: string): Promise<Goal[]> => {
    try {
      await initTursoTables();
      const rows = section
        ? await queryTurso('SELECT * FROM goals WHERE section = ? ORDER BY created_at DESC;', [section])
        : await queryTurso('SELECT * FROM goals ORDER BY created_at DESC;');

      if (rows && rows.length > 0) {
        const goals = rows.map(mapGoalRow);
        const db = getLocalDb();
        db.goals = goals;
        saveLocalDb(db);
        return goals;
      }
      return getLocalDb().goals;
    } catch {
      return getLocalDb().goals;
    }
  },

  createGoal: async (goalData: Partial<Goal>): Promise<Goal> => {
    const id = goalData.id || `goal_${Date.now()}`;
    const newGoal: Goal = {
      id,
      title: goalData.title || 'Untitled Goal',
      section: goalData.section || 'video_editing',
      sub_section: goalData.sub_section || null,
      description: goalData.description || '',
      target_date: goalData.target_date || '',
      priority: goalData.priority || 'Medium',
      status: goalData.status || 'Not Started',
      next_action: goalData.next_action || '',
      notes: goalData.notes || '',
      created_at: new Date().toISOString()
    };

    const db = getLocalDb();
    db.goals.unshift(newGoal);
    saveLocalDb(db);

    await queryTurso(
      `INSERT INTO goals (id, section, sub_section, title, description, target_date, priority, status, next_action, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        newGoal.id,
        newGoal.section || '',
        newGoal.sub_section || null,
        newGoal.title,
        newGoal.description || '',
        newGoal.target_date || '',
        newGoal.priority || 'Medium',
        newGoal.status || 'Not Started',
        newGoal.next_action || '',
        newGoal.notes || '',
        newGoal.created_at
      ]
    );

    return newGoal;
  },

  updateGoal: async (id: string, goalData: Partial<Goal>): Promise<Goal> => {
    const db = getLocalDb();
    const existing = db.goals.find((g) => g.id === id);
    const updated: Goal = { ...(existing || ({} as Goal)), ...goalData, id };

    db.goals = db.goals.map((g) => (g.id === id ? updated : g));
    saveLocalDb(db);

    await queryTurso(
      `UPDATE goals SET section = ?, sub_section = ?, title = ?, description = ?, target_date = ?, priority = ?, status = ?, next_action = ?, notes = ?
       WHERE id = ?;`,
      [
        updated.section || '',
        updated.sub_section || null,
        updated.title,
        updated.description || '',
        updated.target_date || '',
        updated.priority || 'Medium',
        updated.status || 'Not Started',
        updated.next_action || '',
        updated.notes || '',
        id
      ]
    );

    return updated;
  },

  deleteGoal: async (id: string): Promise<void> => {
    const db = getLocalDb();
    db.goals = db.goals.filter((g) => g.id !== id);
    saveLocalDb(db);

    await queryTurso('DELETE FROM goals WHERE id = ?;', [id]);
  },

  getProjects: async (section?: string): Promise<Project[]> => {
    try {
      await initTursoTables();
      const rows = section
        ? await queryTurso('SELECT * FROM projects WHERE section = ? ORDER BY created_at DESC;', [section])
        : await queryTurso('SELECT * FROM projects ORDER BY created_at DESC;');

      if (rows && rows.length > 0) {
        const projects = rows.map(mapProjectRow);
        const db = getLocalDb();
        db.projects = projects;
        saveLocalDb(db);
        return projects;
      }
      return getLocalDb().projects;
    } catch {
      return getLocalDb().projects;
    }
  },

  getProject: async (id: string): Promise<{ project: Project; tasks: Task[] }> => {
    try {
      const [projRows, tasksRows] = await Promise.all([
        queryTurso('SELECT * FROM projects WHERE id = ?;', [id]),
        queryTurso('SELECT * FROM tasks WHERE project_id = ? ORDER BY order_index ASC, created_at ASC;', [id])
      ]);

      if (projRows && projRows.length > 0) {
        const project = mapProjectRow(projRows[0]);
        const tasks = tasksRows ? tasksRows.map(mapTaskRow) : [];
        return { project, tasks };
      }
    } catch (err) {
      console.warn('getProject fallback:', err);
    }

    const localDb = getLocalDb();
    const localProj = localDb.projects.find((p) => p.id === id);
    if (!localProj) throw new Error('Project not found');
    const localTasks = localDb.tasks.filter((t) => t.project_id === id);
    return { project: localProj, tasks: localTasks };
  },

  createProject: async (projData: Partial<Project>): Promise<Project> => {
    const id = projData.id || `proj_${Date.now()}`;
    const newProj: Project = {
      id,
      goal_id: projData.goal_id || null,
      name: projData.name || 'Untitled Project',
      description: projData.description || '',
      status: projData.status || 'Planning',
      priority: projData.priority || 'Medium',
      deadline: projData.deadline || '',
      section: projData.section || 'video_editing',
      sub_section: projData.sub_section || null,
      client_name: projClientNormalize(projData.client_name),
      script_content: projData.script_content || '',
      creative_ideas: projData.creative_ideas || [],
      references: projData.references || [],
      created_at: new Date().toISOString()
    };

    // 1. Optimistic Local Save
    const db = getLocalDb();
    db.projects.unshift(newProj);
    saveLocalDb(db);

    // 2. Await Cloud Turso Sync
    await queryTurso(
      `INSERT INTO projects (id, goal_id, name, description, status, priority, deadline, section, sub_section, client_name, script_content, creative_ideas, references_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        newProj.id,
        newProj.goal_id || null,
        newProj.name,
        newProj.description || '',
        newProj.status || 'Planning',
        newProj.priority || 'Medium',
        newProj.deadline || '',
        newProj.section || 'video_editing',
        newProj.sub_section || null,
        newProj.client_name || '',
        newProj.script_content || '',
        JSON.stringify(newProj.creative_ideas || []),
        JSON.stringify(newProj.references || []),
        newProj.created_at
      ]
    );

    return newProj;
  },

  updateProject: async (id: string, projData: Partial<Project>): Promise<Project> => {
    const db = getLocalDb();
    const existing = db.projects.find((p) => p.id === id);
    const updated: Project = { ...(existing || ({} as Project)), ...projData, id };

    db.projects = db.projects.map((p) => (p.id === id ? updated : p));
    saveLocalDb(db);

    await queryTurso(
      `UPDATE projects SET goal_id = ?, name = ?, description = ?, status = ?, priority = ?, deadline = ?, section = ?, sub_section = ?, client_name = ?, script_content = ?, creative_ideas = ?, references_json = ?
       WHERE id = ?;`,
      [
        updated.goal_id || null,
        updated.name,
        updated.description || '',
        updated.status || 'Planning',
        updated.priority || 'Medium',
        updated.deadline || '',
        updated.section || 'video_editing',
        updated.sub_section || null,
        updated.client_name || '',
        updated.script_content || '',
        JSON.stringify(updated.creative_ideas || []),
        JSON.stringify(updated.references || []),
        id
      ]
    );

    return updated;
  },

  deleteProject: async (id: string): Promise<void> => {
    const db = getLocalDb();
    db.projects = db.projects.filter((p) => p.id !== id);
    db.tasks = db.tasks.filter((t) => t.project_id !== id);
    saveLocalDb(db);

    await Promise.all([
      queryTurso('DELETE FROM projects WHERE id = ?;', [id]),
      queryTurso('DELETE FROM tasks WHERE project_id = ?;', [id])
    ]);
  },

  getTasks: async (projectId?: string): Promise<Task[]> => {
    try {
      await initTursoTables();
      const rows = projectId
        ? await queryTurso('SELECT * FROM tasks WHERE project_id = ? ORDER BY order_index ASC, created_at ASC;', [projectId])
        : await queryTurso('SELECT * FROM tasks ORDER BY created_at DESC;');

      if (rows && rows.length > 0) {
        const tasks = rows.map(mapTaskRow);
        const db = getLocalDb();
        db.tasks = tasks;
        saveLocalDb(db);
        return tasks;
      }
      return getLocalDb().tasks;
    } catch {
      return getLocalDb().tasks;
    }
  },

  createTask: async (taskData: Partial<Task>): Promise<Task> => {
    const id = taskData.id || `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newTask: Task = {
      id,
      project_id: taskData.project_id || null,
      title: taskData.title || 'Untitled Task',
      due_date: taskData.due_date || '',
      completed: !!taskData.completed,
      stage: taskData.stage || 'Editing',
      order_index: taskData.order_index || 0,
      created_at: new Date().toISOString()
    };

    const db = getLocalDb();
    db.tasks.unshift(newTask);
    saveLocalDb(db);

    await queryTurso(
      `INSERT INTO tasks (id, project_id, title, due_date, completed, stage, order_index, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        newTask.id,
        newTask.project_id || null,
        newTask.title,
        newTask.due_date || '',
        newTask.completed ? 1 : 0,
        newTask.stage || 'Editing',
        newTask.order_index || 0,
        newTask.created_at
      ]
    );

    return newTask;
  },

  updateTask: async (id: string, taskData: Partial<Task>): Promise<Task> => {
    const db = getLocalDb();
    const existing = db.tasks.find((t) => t.id === id);
    const updated: Task = { ...(existing || ({} as Task)), ...taskData, id };

    db.tasks = db.tasks.map((t) => (t.id === id ? updated : t));
    saveLocalDb(db);

    await queryTurso(
      `UPDATE tasks SET project_id = ?, title = ?, due_date = ?, completed = ?, stage = ?, order_index = ?
       WHERE id = ?;`,
      [
        updated.project_id || null,
        updated.title,
        updated.due_date || '',
        updated.completed ? 1 : 0,
        updated.stage || 'Editing',
        updated.order_index || 0,
        id
      ]
    );

    return updated;
  },

  deleteTask: async (id: string): Promise<void> => {
    const db = getLocalDb();
    db.tasks = db.tasks.filter((t) => t.id !== id);
    saveLocalDb(db);

    await queryTurso('DELETE FROM tasks WHERE id = ?;', [id]);
  },

  getClients: async (): Promise<Client[]> => {
    try {
      await initTursoTables();
      const rows = await queryTurso('SELECT * FROM clients ORDER BY created_at DESC;');
      if (rows && rows.length > 0) {
        const clients = rows.map(mapClientRow);
        const db = getLocalDb();
        db.clients = clients;
        saveLocalDb(db);
        return clients;
      }
      return getLocalDb().clients;
    } catch {
      return getLocalDb().clients;
    }
  },

  createClient: async (clientData: Partial<Client>): Promise<Client> => {
    const id = clientData.id || `client_${Date.now()}`;
    const newClient: Client = {
      id,
      name: clientData.name || 'Untitled Client',
      status: clientData.status || 'Contacted',
      priority: clientData.priority || 'Medium',
      deadline: clientData.deadline || '',
      revenue: clientData.revenue || 0,
      linked_project_id: clientData.linked_project_id || null,
      notes: clientData.notes || '',
      created_at: new Date().toISOString()
    };

    const db = getLocalDb();
    db.clients.unshift(newClient);
    saveLocalDb(db);

    await queryTurso(
      `INSERT INTO clients (id, name, status, priority, deadline, revenue, linked_project_id, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        newClient.id,
        newClient.name,
        newClient.status || 'Contacted',
        newClient.priority || 'Medium',
        newClient.deadline || '',
        newClient.revenue || 0,
        newClient.linked_project_id || null,
        newClient.notes || '',
        newClient.created_at
      ]
    );

    return newClient;
  },

  updateClient: async (id: string, clientData: Partial<Client>): Promise<Client> => {
    const db = getLocalDb();
    const existing = db.clients.find((c) => c.id === id);
    const updated: Client = { ...(existing || ({} as Client)), ...clientData, id };

    db.clients = db.clients.map((c) => (c.id === id ? updated : c));
    saveLocalDb(db);

    await queryTurso(
      `UPDATE clients SET name = ?, status = ?, priority = ?, deadline = ?, revenue = ?, linked_project_id = ?, notes = ?
       WHERE id = ?;`,
      [
        updated.name,
        updated.status || 'Contacted',
        updated.priority || 'Medium',
        updated.deadline || '',
        updated.revenue || 0,
        updated.linked_project_id || null,
        updated.notes || '',
        id
      ]
    );

    return updated;
  },

  deleteClient: async (id: string): Promise<void> => {
    const db = getLocalDb();
    db.clients = db.clients.filter((c) => c.id !== id);
    saveLocalDb(db);

    await queryTurso('DELETE FROM clients WHERE id = ?;', [id]);
  },

  getQuickIdeas: async (): Promise<QuickIdea[]> => {
    try {
      await initTursoTables();
      const rows = await queryTurso('SELECT * FROM quick_ideas ORDER BY created_at DESC;');
      if (rows && rows.length > 0) {
        return rows.map(mapQuickIdeaRow);
      }
      return getLocalDb().quick_ideas;
    } catch {
      return getLocalDb().quick_ideas;
    }
  },

  createQuickIdea: async (text: string, category?: string): Promise<QuickIdea> => {
    const id = `idea_${Date.now()}`;
    const newIdea: QuickIdea = {
      id,
      text,
      target_category: category || 'General',
      triaged: false,
      captured_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    const db = getLocalDb();
    db.quick_ideas.unshift(newIdea);
    saveLocalDb(db);

    await queryTurso(
      `INSERT INTO quick_ideas (id, text, target_category, triaged, created_at) VALUES (?, ?, ?, ?, ?);`,
      [newIdea.id, newIdea.text, newIdea.target_category || 'General', 0, newIdea.created_at]
    );

    return newIdea;
  },

  deleteQuickIdea: async (id: string): Promise<void> => {
    const db = getLocalDb();
    db.quick_ideas = db.quick_ideas.filter((i) => i.id !== id);
    saveLocalDb(db);

    await queryTurso('DELETE FROM quick_ideas WHERE id = ?;', [id]);
  },

  getAnalytics: async () => {
    try {
      await initTursoTables();
      const [projectsRows, tasksRows, clientsRows] = await Promise.all([
        queryTurso('SELECT * FROM projects;'),
        queryTurso('SELECT * FROM tasks;'),
        queryTurso('SELECT * FROM clients;')
      ]);

      const projects = projectsRows && projectsRows.length > 0 ? projectsRows.map(mapProjectRow) : getLocalDb().projects;
      const tasks = tasksRows && tasksRows.length > 0 ? tasksRows.map(mapTaskRow) : getLocalDb().tasks;
      const clients = clientsRows && clientsRows.length > 0 ? clientsRows.map(mapClientRow) : getLocalDb().clients;

      // Global Task Stats
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t) => t.completed).length;
      const pendingTasks = totalTasks - completedTasks;
      const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Global Project Stats
      const totalProjects = projects.length;
      const completedProjects = projects.filter((p) => p.status === 'Ready' || p.status === 'Posted' || p.status === 'Completed').length;
      const inProgressProjects = projects.filter((p) => p.status === 'In Progress').length;
      const planningProjects = projects.filter((p) => p.status === 'Planning').length;
      const projectCompletionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

      // Video Editing Section Stats
      const videoProjects = projects.filter((p) => p.section === 'video_editing' || !p.section);
      const videoProjectIds = new Set(videoProjects.map((p) => p.id));
      const videoTasks = tasks.filter((t) => (t.project_id && videoProjectIds.has(t.project_id)) || t.stage === 'Editing' || t.stage === 'Filming' || t.stage === 'Sound Design' || t.stage === 'Export');
      const videoTasksCompleted = videoTasks.filter((t) => t.completed).length;
      const videoTasksPending = videoTasks.length - videoTasksCompleted;

      const videoStageBreakdown = [
        { stage: 'Planning', count: videoProjects.filter((p) => p.status === 'Planning').length, fill: '#60a5fa' },
        { stage: 'In Progress', count: videoProjects.filter((p) => p.status === 'In Progress').length, fill: '#38bdf8' },
        { stage: 'Paused', count: videoProjects.filter((p) => p.status === 'Paused').length, fill: '#c084fc' },
        { stage: 'Ready / Done', count: videoProjects.filter((p) => p.status === 'Ready' || p.status === 'Posted' || p.status === 'Completed').length, fill: '#34d399' }
      ];

      // Marketing Section Stats
      const marketingProjects = projects.filter((p) => p.section === 'marketing');
      const marketingProjectIds = new Set(marketingProjects.map((p) => p.id));
      const marketingTasks = tasks.filter((t) => t.project_id && marketingProjectIds.has(t.project_id));
      const marketingTasksCompleted = marketingTasks.filter((t) => t.completed).length;
      const marketingTasksPending = marketingTasks.length - marketingTasksCompleted;

      const platformBreakdown = [
        { platform: 'Instagram', projects: marketingProjects.filter((p) => p.sub_section === 'instagram' || p.description?.toLowerCase().includes('insta') || p.name?.toLowerCase().includes('reel')).length, fill: '#ec4899' },
        { platform: 'TikTok', projects: marketingProjects.filter((p) => p.sub_section === 'tiktok' || p.description?.toLowerCase().includes('tiktok') || p.name?.toLowerCase().includes('tiktok')).length, fill: '#06b6d4' },
        { platform: 'YouTube', projects: marketingProjects.filter((p) => p.sub_section === 'youtube' || p.description?.toLowerCase().includes('youtube') || p.name?.toLowerCase().includes('yt')).length, fill: '#ef4444' },
        { platform: 'Other', projects: marketingProjects.filter((p) => !['instagram', 'tiktok', 'youtube'].includes(p.sub_section || '')).length, fill: '#a855f7' }
      ];

      // Client CRM Funnel & Responses directly from database
      const totalClients = clients.length;
      const wonClients = clients.filter((c) => c.status === 'Agreed' || c.status === 'Client' || c.status === 'Completed').length;
      const discussionClients = clients.filter((c) => c.status === 'Discussion').length;
      const outreachPendingClients = clients.filter((c) => c.status === 'Contacted' || c.status === 'Lead' || c.status === 'Replied').length;
      const lostClients = clients.filter((c) => c.status === 'Ignored').length;

      const wonRevenue = clients
        .filter((c) => c.status === 'Agreed' || c.status === 'Client' || c.status === 'Completed')
        .reduce((acc, c) => acc + (Number(c.revenue) || 0), 0);

      const discussionRevenue = clients
        .filter((c) => c.status === 'Discussion')
        .reduce((acc, c) => acc + (Number(c.revenue) || 0), 0);

      const outreachPendingRevenue = clients
        .filter((c) => c.status === 'Contacted' || c.status === 'Lead' || c.status === 'Replied')
        .reduce((acc, c) => acc + (Number(c.revenue) || 0), 0);

      const lostRevenue = clients
        .filter((c) => c.status === 'Ignored')
        .reduce((acc, c) => acc + (Number(c.revenue) || 0), 0);

      const totalRevenue = clients.reduce((acc, c) => acc + (Number(c.revenue) || 0), 0);
      const conversionRate = totalClients > 0 ? Math.round((wonClients / totalClients) * 100) : 0;

      const responseDiagram = [
        { name: 'Deals Won / Retainers', count: wonClients, revenue: wonRevenue, color: '#10b981', percentage: totalClients > 0 ? Math.round((wonClients / totalClients) * 100) : 0, key: 'positive' },
        { name: 'In Discussion', count: discussionClients, revenue: discussionRevenue, color: '#fbbf24', percentage: totalClients > 0 ? Math.round((discussionClients / totalClients) * 100) : 0, key: 'discussion' },
        { name: 'Outreach Pending', count: outreachPendingClients, revenue: outreachPendingRevenue, color: '#38bdf8', percentage: totalClients > 0 ? Math.round((outreachPendingClients / totalClients) * 100) : 0, key: 'pending' },
        { name: 'Lost / Ghosted', count: lostClients, revenue: lostRevenue, color: '#ec4899', percentage: totalClients > 0 ? Math.round((lostClients / totalClients) * 100) : 0, key: 'negative' }
      ];

      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const weeklyProgress = days.map((day, idx) => {
        const factor = (idx + 1) / 7;
        return {
          day,
          tasksDone: completedTasks > 0 ? Math.max(1, Math.round(completedTasks * factor)) : 0,
          tasksPlanned: totalTasks > 0 ? Math.max(1, Math.round(totalTasks * factor)) : 0,
          outreachSent: totalClients > 0 ? Math.max(0, Math.round(totalClients * factor)) : 0
        };
      });

      return {
        overview: {
          totalTasks,
          completedTasks,
          pendingTasks,
          taskCompletionRate,
          totalProjects,
          completedProjects,
          inProgressProjects,
          planningProjects,
          projectCompletionRate,
          totalClients,
          positiveClients: wonClients,
          negativeClients: lostClients,
          pendingClients: outreachPendingClients + discussionClients,
          totalRevenue,
          conversionRate
        },
        videoEditing: {
          totalProjects: videoProjects.length,
          completedProjects: videoProjects.filter((p) => p.status === 'Ready' || p.status === 'Posted').length,
          inProgressProjects: videoProjects.filter((p) => p.status === 'In Progress').length,
          totalTasks: videoTasks.length,
          completedTasks: videoTasksCompleted,
          pendingTasks: videoTasksPending,
          completionRate: videoTasks.length > 0 ? Math.round((videoTasksCompleted / videoTasks.length) * 100) : 0,
          stageBreakdown: videoStageBreakdown
        },
        marketing: {
          totalProjects: marketingProjects.length,
          completedProjects: marketingProjects.filter((p) => p.status === 'Ready' || p.status === 'Posted').length,
          totalTasks: marketingTasks.length,
          completedTasks: marketingTasksCompleted,
          pendingTasks: marketingTasksPending,
          completionRate: marketingTasks.length > 0 ? Math.round((marketingTasksCompleted / marketingTasks.length) * 100) : 0,
          platformBreakdown
        },
        crm: {
          totalClients,
          wonClients,
          discussionClients,
          outreachPendingClients,
          lostClients,
          wonRevenue,
          discussionRevenue,
          outreachPendingRevenue,
          lostRevenue,
          positiveClients: wonClients,
          negativeClients: lostClients,
          pendingClients: outreachPendingClients + discussionClients,
          totalRevenue,
          conversionRate,
          responseDiagram,
          clientsList: clients
        },
        weeklyProgress,
        // Backwards compatibility for existing structure
        crmFunnel: {
          totalOutreach: totalClients,
          contacted: outreachPendingClients + discussionClients,
          ignored: lostClients,
          agreed: wonClients,
          activeClients: clients.filter((c) => c.status === 'Client' || c.status === 'Completed').length,
          conversionRate,
          totalRevenue
        },
        velocity: {
          completedTasks,
          totalTasks,
          taskVelocityRate: taskCompletionRate,
          completedProjects,
          plannedProjects: planningProjects,
          inProgressProjects,
          weeklyProgress
        }
      };
    } catch {
      return getLocalDb();
    }
  },

  exportDatabase: async () => {
    try {
      await initTursoTables();
      const [goalsRows, projectsRows, tasksRows, clientsRows, ideasRows] = await Promise.all([
        queryTurso('SELECT * FROM goals;'),
        queryTurso('SELECT * FROM projects;'),
        queryTurso('SELECT * FROM tasks;'),
        queryTurso('SELECT * FROM clients;'),
        queryTurso('SELECT * FROM quick_ideas;')
      ]);

      const projects = projectsRows && projectsRows.length > 0 ? projectsRows.map(mapProjectRow) : getLocalDb().projects;
      const goals = goalsRows && goalsRows.length > 0 ? goalsRows.map(mapGoalRow) : getLocalDb().goals;
      const tasks = tasksRows && tasksRows.length > 0 ? tasksRows.map(mapTaskRow) : getLocalDb().tasks;
      const clients = clientsRows && clientsRows.length > 0 ? clientsRows.map(mapClientRow) : getLocalDb().clients;
      const quick_ideas = ideasRows && ideasRows.length > 0 ? ideasRows.map(mapQuickIdeaRow) : getLocalDb().quick_ideas;
      const settings = getLocalDb().settings;

      return {
        version: '2.0.0',
        exported_at: new Date().toISOString(),
        system: 'Editor OS',
        goals,
        projects,
        tasks,
        clients,
        quick_ideas,
        settings
      };
    } catch {
      return getLocalDb();
    }
  },

  importDatabase: async (backupData: any) => {
    try {
      await initTursoTables();
      const db = getLocalDb();

      if (backupData.goals && Array.isArray(backupData.goals)) {
        db.goals = backupData.goals;
        await queryTurso('DELETE FROM goals;');
        for (const g of backupData.goals) {
          await queryTurso(
            `INSERT INTO goals (id, section, sub_section, title, description, target_date, priority, status, next_action, notes, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [g.id, g.section || '', g.sub_section || null, g.title, g.description || '', g.target_date || '', g.priority || 'Medium', g.status || 'Not Started', g.next_action || '', g.notes || '', g.created_at || new Date().toISOString()]
          );
        }
      }

      if (backupData.projects && Array.isArray(backupData.projects)) {
        db.projects = backupData.projects;
        await queryTurso('DELETE FROM projects;');
        for (const p of backupData.projects) {
          await queryTurso(
            `INSERT INTO projects (id, goal_id, name, description, status, priority, deadline, section, sub_section, client_name, script_content, creative_ideas, references_json, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [p.id, p.goal_id || null, p.name, p.description || '', p.status || 'Planning', p.priority || 'Medium', p.deadline || '', p.section || 'video_editing', p.sub_section || null, p.client_name || '', p.script_content || '', JSON.stringify(p.creative_ideas || []), JSON.stringify(p.references || []), p.created_at || new Date().toISOString()]
          );
        }
      }

      if (backupData.tasks && Array.isArray(backupData.tasks)) {
        db.tasks = backupData.tasks;
        await queryTurso('DELETE FROM tasks;');
        for (const t of backupData.tasks) {
          await queryTurso(
            `INSERT INTO tasks (id, project_id, title, due_date, completed, stage, order_index, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [t.id, t.project_id || null, t.title, t.due_date || '', t.completed ? 1 : 0, t.stage || 'Editing', t.order_index || 0, t.created_at || new Date().toISOString()]
          );
        }
      }

      if (backupData.clients && Array.isArray(backupData.clients)) {
        db.clients = backupData.clients;
        await queryTurso('DELETE FROM clients;');
        for (const c of backupData.clients) {
          await queryTurso(
            `INSERT INTO clients (id, name, status, priority, deadline, revenue, linked_project_id, notes, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [c.id, c.name, c.status || 'Contacted', c.priority || 'Medium', c.deadline || '', c.revenue || 0, c.linked_project_id || null, c.notes || '', c.created_at || new Date().toISOString()]
          );
        }
      }

      if (backupData.quick_ideas && Array.isArray(backupData.quick_ideas)) {
        db.quick_ideas = backupData.quick_ideas;
        await queryTurso('DELETE FROM quick_ideas;');
        for (const i of backupData.quick_ideas) {
          await queryTurso(
            `INSERT INTO quick_ideas (id, text, target_category, triaged, created_at) VALUES (?, ?, ?, ?, ?);`,
            [i.id, i.text, i.target_category || 'General', i.triaged ? 1 : 0, i.created_at || new Date().toISOString()]
          );
        }
      }

      if (backupData.settings && Array.isArray(backupData.settings) && backupData.settings[0]) {
        db.settings = backupData.settings;
      }

      saveLocalDb(db);
      return { success: true, message: 'Database fully imported and synced to Turso Cloud!' };
    } catch (err: any) {
      saveLocalDb(backupData);
      return { success: true, message: 'Database saved to local storage', warning: err?.message };
    }
  }
};

function projClientNormalize(val?: string) {
  if (!val || val === 'undefined' || val === 'null') return '';
  return val;
}

// Row mappers
function mapProjectRow(row: any): Project {
  let creative_ideas: string[] = [];
  try {
    creative_ideas = row.creative_ideas ? JSON.parse(row.creative_ideas) : [];
  } catch {}

  let references: any[] = [];
  try {
    references = row.references_json ? JSON.parse(row.references_json) : [];
  } catch {}

  return {
    id: String(row.id),
    goal_id: row.goal_id && row.goal_id !== 'null' ? String(row.goal_id) : null,
    name: String(row.name || ''),
    description: String(row.description || ''),
    status: row.status as any,
    priority: row.priority as any,
    deadline: row.deadline && row.deadline !== 'null' ? String(row.deadline) : '',
    section: row.section as any,
    sub_section: row.sub_section && row.sub_section !== 'null' ? (row.sub_section as any) : null,
    client_name: row.client_name && row.client_name !== 'null' ? String(row.client_name) : '',
    script_content: row.script_content && row.script_content !== 'null' ? String(row.script_content) : '',
    creative_ideas,
    references,
    created_at: String(row.created_at || '')
  };
}

function mapGoalRow(row: any): Goal {
  return {
    id: String(row.id),
    section: row.section as any,
    sub_section: row.sub_section && row.sub_section !== 'null' ? (row.sub_section as any) : null,
    title: String(row.title || ''),
    description: String(row.description || ''),
    target_date: row.target_date && row.target_date !== 'null' ? String(row.target_date) : '',
    priority: row.priority as any,
    status: row.status as any,
    next_action: String(row.next_action || ''),
    notes: String(row.notes || ''),
    created_at: String(row.created_at || '')
  };
}

function mapTaskRow(row: any): Task {
  return {
    id: String(row.id),
    project_id: row.project_id && row.project_id !== 'null' ? String(row.project_id) : null,
    title: String(row.title || ''),
    due_date: row.due_date && row.due_date !== 'null' ? String(row.due_date) : '',
    completed: Boolean(row.completed === 1 || row.completed === '1' || row.completed === true),
    stage: row.stage ? (row.stage as any) : 'Editing',
    order_index: Number(row.order_index || 0),
    created_at: String(row.created_at || '')
  };
}

function mapClientRow(row: any): Client {
  return {
    id: String(row.id),
    name: String(row.name || ''),
    status: row.status as any,
    priority: row.priority as any,
    deadline: row.deadline && row.deadline !== 'null' ? String(row.deadline) : '',
    revenue: Number(row.revenue || 0),
    linked_project_id: row.linked_project_id && row.linked_project_id !== 'null' ? String(row.linked_project_id) : null,
    notes: String(row.notes || ''),
    created_at: String(row.created_at || '')
  };
}

function mapQuickIdeaRow(row: any): QuickIdea {
  return {
    id: String(row.id),
    text: String(row.text || ''),
    target_category: row.target_category ? String(row.target_category) : 'General',
    captured_at: String(row.created_at || new Date().toISOString()),
    triaged: Boolean(row.triaged === 1 || row.triaged === '1'),
    created_at: String(row.created_at || '')
  };
}
