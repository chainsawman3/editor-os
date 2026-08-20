import { createClient } from '@libsql/client/web';
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
  'https://editor-os-db-chainsawman3.aws-eu-west-1.turso.io';

const TURSO_AUTH_TOKEN =
  import.meta.env.VITE_TURSO_AUTH_TOKEN ||
  'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODcyNTg3MjYsImlkIjoiMDFhMDIwZTktMzgwMS03YTVkLTg1OTgtOGZlMTNhMzczNGVjIiwia2lkIjoiUUMzNkxQZVdoN2ppWXl3VmxQNlkxV09GaTB1RXJmRTd5WU1rWmlfNWpQOCIsInJpZCI6IjBmMWY2MjIzLTgyNjMtNDQyYS1hMGVlLTgzNjIyMjkxYTMyNyJ9.G5egcvRrEbXEe4f0L2QM2Qbb6QX3WMYIWRGp0QAArB4W8ANktoVE_J3Mf4VtMaAIHcCc2EGibrvrMDCzYuD1Dg';

export const tursoClient = createClient({
  url: TURSO_URL,
  authToken: TURSO_AUTH_TOKEN
});

let isInitialized = false;

// 1. Initialize Tables in Turso Cloud Database
export async function initTursoTables() {
  if (isInitialized) return;
  try {
    await tursoClient.batch([
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
    ]);

    // Check if empty, populate with default seed data
    const res = await tursoClient.execute('SELECT COUNT(*) as count FROM projects;');
    const count = Number(res.rows[0]?.count || 0);

    if (count === 0) {
      const local = getLocalDb();
      const goalsToSeed = local.goals.length > 0 ? local.goals : initialDefaultDatabase.goals;
      const projectsToSeed = local.projects.length > 0 ? local.projects : initialDefaultDatabase.projects;
      const tasksToSeed = local.tasks.length > 0 ? local.tasks : initialDefaultDatabase.tasks;
      const clientsToSeed = local.clients.length > 0 ? local.clients : initialDefaultDatabase.clients;
      const ideasToSeed = local.quick_ideas.length > 0 ? local.quick_ideas : initialDefaultDatabase.quick_ideas;

      const batchStatements = [];

      for (const g of goalsToSeed) {
        batchStatements.push({
          sql: `INSERT OR IGNORE INTO goals (id, section, sub_section, title, description, target_date, priority, status, next_action, notes, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          args: [
            g.id,
            g.section || '',
            g.sub_section || null,
            g.title,
            g.description || '',
            g.target_date || '',
            g.priority || 'Medium',
            g.status || 'Not Started',
            g.next_action || '',
            g.notes || '',
            g.created_at || new Date().toISOString()
          ]
        });
      }

      for (const p of projectsToSeed) {
        batchStatements.push({
          sql: `INSERT OR IGNORE INTO projects (id, goal_id, name, description, status, priority, deadline, section, sub_section, client_name, script_content, creative_ideas, references_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          args: [
            p.id,
            p.goal_id || null,
            p.name,
            p.description || '',
            p.status || 'Planning',
            p.priority || 'Medium',
            p.deadline || '',
            p.section || 'video_editing',
            p.sub_section || null,
            p.client_name || '',
            p.script_content || '',
            JSON.stringify(p.creative_ideas || []),
            JSON.stringify(p.references || []),
            p.created_at || new Date().toISOString()
          ]
        });
      }

      for (const t of tasksToSeed) {
        batchStatements.push({
          sql: `INSERT OR IGNORE INTO tasks (id, project_id, title, due_date, completed, stage, order_index, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          args: [
            t.id,
            t.project_id || null,
            t.title,
            t.due_date || '',
            t.completed ? 1 : 0,
            t.stage || 'Editing',
            t.order_index || 0,
            t.created_at || new Date().toISOString()
          ]
        });
      }

      for (const c of clientsToSeed) {
        batchStatements.push({
          sql: `INSERT OR IGNORE INTO clients (id, name, status, priority, deadline, revenue, linked_project_id, notes, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          args: [
            c.id,
            c.name,
            c.status || 'Contacted',
            c.priority || 'Medium',
            c.deadline || '',
            c.revenue || 0,
            c.linked_project_id || null,
            c.notes || '',
            c.created_at || new Date().toISOString()
          ]
        });
      }

      for (const idea of ideasToSeed) {
        batchStatements.push({
          sql: `INSERT OR IGNORE INTO quick_ideas (id, text, target_category, triaged, created_at)
                VALUES (?, ?, ?, ?, ?);`,
          args: [idea.id, idea.text, idea.target_category || 'General', idea.triaged ? 1 : 0, idea.created_at || new Date().toISOString()]
        });
      }

      if (batchStatements.length > 0) {
        await tursoClient.batch(batchStatements);
      }
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
      const [goalsRes, projectsRes, tasksRes] = await Promise.all([
        tursoClient.execute('SELECT * FROM goals;'),
        tursoClient.execute('SELECT * FROM projects;'),
        tursoClient.execute('SELECT * FROM tasks;')
      ]);

      const projects = projectsRes.rows.map(mapProjectRow);
      const goals = goalsRes.rows.map(mapGoalRow);
      const tasks = tasksRes.rows.map(mapTaskRow);

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
    } catch (err) {
      console.warn('Falling back to local summary:', err);
      return getLocalSummary();
    }
  },

  getGoals: async (section?: string): Promise<Goal[]> => {
    try {
      await initTursoTables();
      const res = section
        ? await tursoClient.execute({
            sql: 'SELECT * FROM goals WHERE section = ? ORDER BY created_at DESC;',
            args: [section]
          })
        : await tursoClient.execute('SELECT * FROM goals ORDER BY created_at DESC;');
      return res.rows.map(mapGoalRow);
    } catch {
      return getLocalDb().goals;
    }
  },

  createGoal: async (goalData: Partial<Goal>): Promise<Goal> => {
    await initTursoTables();
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

    await tursoClient.execute({
      sql: `INSERT INTO goals (id, section, sub_section, title, description, target_date, priority, status, next_action, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: [
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
        newGoal.created_at || new Date().toISOString()
      ]
    });

    const db = getLocalDb();
    db.goals.unshift(newGoal);
    saveLocalDb(db);

    return newGoal;
  },

  updateGoal: async (id: string, goalData: Partial<Goal>): Promise<Goal> => {
    await initTursoTables();
    const existingRes = await tursoClient.execute({
      sql: 'SELECT * FROM goals WHERE id = ?;',
      args: [id]
    });
    if (existingRes.rows.length === 0) throw new Error('Goal not found');
    const existing = mapGoalRow(existingRes.rows[0]);
    const updated: Goal = { ...existing, ...goalData };

    await tursoClient.execute({
      sql: `UPDATE goals SET section = ?, sub_section = ?, title = ?, description = ?, target_date = ?, priority = ?, status = ?, next_action = ?, notes = ?
            WHERE id = ?;`,
      args: [
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
    });

    return updated;
  },

  deleteGoal: async (id: string): Promise<void> => {
    await initTursoTables();
    await tursoClient.execute({ sql: 'DELETE FROM goals WHERE id = ?;', args: [id] });
  },

  getProjects: async (section?: string): Promise<Project[]> => {
    try {
      await initTursoTables();
      const res = section
        ? await tursoClient.execute({
            sql: 'SELECT * FROM projects WHERE section = ? ORDER BY created_at DESC;',
            args: [section]
          })
        : await tursoClient.execute('SELECT * FROM projects ORDER BY created_at DESC;');
      const projects = res.rows.map(mapProjectRow);

      const db = getLocalDb();
      db.projects = projects;
      saveLocalDb(db);

      return projects;
    } catch {
      return getLocalDb().projects;
    }
  },

  getProject: async (id: string): Promise<{ project: Project; tasks: Task[] }> => {
    await initTursoTables();
    const [projRes, tasksRes] = await Promise.all([
      tursoClient.execute({ sql: 'SELECT * FROM projects WHERE id = ?;', args: [id] }),
      tursoClient.execute({ sql: 'SELECT * FROM tasks WHERE project_id = ? ORDER BY order_index ASC, created_at ASC;', args: [id] })
    ]);

    if (projRes.rows.length === 0) throw new Error('Project not found');
    const project = mapProjectRow(projRes.rows[0]);
    const tasks = tasksRes.rows.map(mapTaskRow);
    return { project, tasks };
  },

  createProject: async (projData: Partial<Project>): Promise<Project> => {
    await initTursoTables();
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
      client_name: projData.client_name || '',
      script_content: projData.script_content || '',
      creative_ideas: projData.creative_ideas || [],
      references: projData.references || [],
      created_at: new Date().toISOString()
    };

    await tursoClient.execute({
      sql: `INSERT INTO projects (id, goal_id, name, description, status, priority, deadline, section, sub_section, client_name, script_content, creative_ideas, references_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: [
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
        newProj.created_at || new Date().toISOString()
      ]
    });

    const db = getLocalDb();
    db.projects.unshift(newProj);
    saveLocalDb(db);

    return newProj;
  },

  updateProject: async (id: string, projData: Partial<Project>): Promise<Project> => {
    await initTursoTables();
    const existingRes = await tursoClient.execute({ sql: 'SELECT * FROM projects WHERE id = ?;', args: [id] });
    if (existingRes.rows.length === 0) throw new Error('Project not found');
    const existing = mapProjectRow(existingRes.rows[0]);
    const updated: Project = { ...existing, ...projData };

    await tursoClient.execute({
      sql: `UPDATE projects SET goal_id = ?, name = ?, description = ?, status = ?, priority = ?, deadline = ?, section = ?, sub_section = ?, client_name = ?, script_content = ?, creative_ideas = ?, references_json = ?
            WHERE id = ?;`,
      args: [
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
    });

    const db = getLocalDb();
    db.projects = db.projects.map((p) => (p.id === id ? updated : p));
    saveLocalDb(db);

    return updated;
  },

  deleteProject: async (id: string): Promise<void> => {
    await initTursoTables();
    await tursoClient.execute({ sql: 'DELETE FROM projects WHERE id = ?;', args: [id] });
    await tursoClient.execute({ sql: 'DELETE FROM tasks WHERE project_id = ?;', args: [id] });

    const db = getLocalDb();
    db.projects = db.projects.filter((p) => p.id !== id);
    db.tasks = db.tasks.filter((t) => t.project_id !== id);
    saveLocalDb(db);
  },

  getTasks: async (projectId?: string): Promise<Task[]> => {
    try {
      await initTursoTables();
      const res = projectId
        ? await tursoClient.execute({ sql: 'SELECT * FROM tasks WHERE project_id = ? ORDER BY order_index ASC, created_at ASC;', args: [projectId] })
        : await tursoClient.execute('SELECT * FROM tasks ORDER BY created_at DESC;');
      const tasks = res.rows.map(mapTaskRow);

      const db = getLocalDb();
      db.tasks = tasks;
      saveLocalDb(db);

      return tasks;
    } catch {
      return getLocalDb().tasks;
    }
  },

  createTask: async (taskData: Partial<Task>): Promise<Task> => {
    await initTursoTables();
    const id = taskData.id || `task_${Date.now()}`;
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

    await tursoClient.execute({
      sql: `INSERT INTO tasks (id, project_id, title, due_date, completed, stage, order_index, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      args: [
        newTask.id,
        newTask.project_id || null,
        newTask.title,
        newTask.due_date || '',
        newTask.completed ? 1 : 0,
        newTask.stage || 'Editing',
        newTask.order_index || 0,
        newTask.created_at || new Date().toISOString()
      ]
    });

    const db = getLocalDb();
    db.tasks.unshift(newTask);
    saveLocalDb(db);

    return newTask;
  },

  updateTask: async (id: string, taskData: Partial<Task>): Promise<Task> => {
    await initTursoTables();
    const existingRes = await tursoClient.execute({ sql: 'SELECT * FROM tasks WHERE id = ?;', args: [id] });
    if (existingRes.rows.length === 0) throw new Error('Task not found');
    const existing = mapTaskRow(existingRes.rows[0]);
    const updated: Task = { ...existing, ...taskData };

    await tursoClient.execute({
      sql: `UPDATE tasks SET project_id = ?, title = ?, due_date = ?, completed = ?, stage = ?, order_index = ?
            WHERE id = ?;`,
      args: [
        updated.project_id || null,
        updated.title,
        updated.due_date || '',
        updated.completed ? 1 : 0,
        updated.stage || 'Editing',
        updated.order_index || 0,
        id
      ]
    });

    const db = getLocalDb();
    db.tasks = db.tasks.map((t) => (t.id === id ? updated : t));
    saveLocalDb(db);

    return updated;
  },

  deleteTask: async (id: string): Promise<void> => {
    await initTursoTables();
    await tursoClient.execute({ sql: 'DELETE FROM tasks WHERE id = ?;', args: [id] });

    const db = getLocalDb();
    db.tasks = db.tasks.filter((t) => t.id !== id);
    saveLocalDb(db);
  },

  getClients: async (): Promise<Client[]> => {
    try {
      await initTursoTables();
      const res = await tursoClient.execute('SELECT * FROM clients ORDER BY created_at DESC;');
      const clients = res.rows.map(mapClientRow);

      const db = getLocalDb();
      db.clients = clients;
      saveLocalDb(db);

      return clients;
    } catch {
      return getLocalDb().clients;
    }
  },

  createClient: async (clientData: Partial<Client>): Promise<Client> => {
    await initTursoTables();
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

    await tursoClient.execute({
      sql: `INSERT INTO clients (id, name, status, priority, deadline, revenue, linked_project_id, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      args: [
        newClient.id,
        newClient.name,
        newClient.status || 'Contacted',
        newClient.priority || 'Medium',
        newClient.deadline || '',
        newClient.revenue || 0,
        newClient.linked_project_id || null,
        newClient.notes || '',
        newClient.created_at || new Date().toISOString()
      ]
    });

    const db = getLocalDb();
    db.clients.unshift(newClient);
    saveLocalDb(db);

    return newClient;
  },

  updateClient: async (id: string, clientData: Partial<Client>): Promise<Client> => {
    await initTursoTables();
    const existingRes = await tursoClient.execute({ sql: 'SELECT * FROM clients WHERE id = ?;', args: [id] });
    if (existingRes.rows.length === 0) throw new Error('Client not found');
    const existing = mapClientRow(existingRes.rows[0]);
    const updated: Client = { ...existing, ...clientData };

    await tursoClient.execute({
      sql: `UPDATE clients SET name = ?, status = ?, priority = ?, deadline = ?, revenue = ?, linked_project_id = ?, notes = ?
            WHERE id = ?;`,
      args: [
        updated.name,
        updated.status || 'Contacted',
        updated.priority || 'Medium',
        updated.deadline || '',
        updated.revenue || 0,
        updated.linked_project_id || null,
        updated.notes || '',
        id
      ]
    });

    const db = getLocalDb();
    db.clients = db.clients.map((c) => (c.id === id ? updated : c));
    saveLocalDb(db);

    return updated;
  },

  deleteClient: async (id: string): Promise<void> => {
    await initTursoTables();
    await tursoClient.execute({ sql: 'DELETE FROM clients WHERE id = ?;', args: [id] });

    const db = getLocalDb();
    db.clients = db.clients.filter((c) => c.id !== id);
    saveLocalDb(db);
  },

  getQuickIdeas: async (): Promise<QuickIdea[]> => {
    try {
      await initTursoTables();
      const res = await tursoClient.execute('SELECT * FROM quick_ideas ORDER BY created_at DESC;');
      return res.rows.map(mapQuickIdeaRow);
    } catch {
      return getLocalDb().quick_ideas;
    }
  },

  createQuickIdea: async (text: string, category?: string): Promise<QuickIdea> => {
    await initTursoTables();
    const id = `idea_${Date.now()}`;
    const newIdea: QuickIdea = {
      id,
      text,
      target_category: category || 'General',
      triaged: false,
      captured_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    await tursoClient.execute({
      sql: `INSERT INTO quick_ideas (id, text, target_category, triaged, created_at) VALUES (?, ?, ?, ?, ?);`,
      args: [newIdea.id, newIdea.text, newIdea.target_category || 'General', 0, newIdea.created_at]
    });

    const db = getLocalDb();
    db.quick_ideas.unshift(newIdea);
    saveLocalDb(db);

    return newIdea;
  },

  deleteQuickIdea: async (id: string): Promise<void> => {
    await initTursoTables();
    await tursoClient.execute({ sql: 'DELETE FROM quick_ideas WHERE id = ?;', args: [id] });

    const db = getLocalDb();
    db.quick_ideas = db.quick_ideas.filter((i) => i.id !== id);
    saveLocalDb(db);
  },

  getAnalytics: async () => {
    await initTursoTables();
    const [clientsRes, tasksRes] = await Promise.all([
      tursoClient.execute('SELECT * FROM clients;'),
      tursoClient.execute('SELECT * FROM tasks;')
    ]);

    const clients = clientsRes.rows.map(mapClientRow);
    const tasks = tasksRes.rows.map(mapTaskRow);

    const contacted = clients.filter((c) => c.status === 'Contacted').length;
    const ignored = clients.filter((c) => c.status === 'Ignored').length;
    const agreed = clients.filter((c) => c.status === 'Agreed').length;
    const active = clients.filter((c) => c.status === 'Client' || c.status === 'Completed').length;

    const pipelineRevenue = clients
      .filter((c) => c.status === 'Agreed' || c.status === 'Client' || c.status === 'Completed')
      .reduce((acc, c) => acc + (c.revenue || 0), 0);

    return {
      crmFunnel: [
        { name: 'Contacted', count: contacted, color: '#3b82f6' },
        { name: 'Ignored', count: ignored, color: '#71717a' },
        { name: 'Agreed', count: agreed, color: '#a855f7' },
        { name: 'Client', count: active, color: '#10b981' }
      ],
      velocity: [
        { day: 'Mon', completed: 3, planned: 4 },
        { day: 'Tue', completed: 5, planned: 5 },
        { day: 'Wed', completed: 2, planned: 3 },
        { day: 'Thu', completed: 6, planned: 5 },
        { day: 'Fri', completed: 4, planned: 4 },
        { day: 'Sat', completed: 3, planned: 2 },
        { day: 'Sun', completed: 1, planned: 1 }
      ],
      stats: {
        totalOutreach: clients.length,
        conversionRate: clients.length > 0 ? Math.round(((agreed + active) / clients.length) * 100) : 0,
        pipelineRevenue,
        avgCompletionTime: '2.4 Days'
      }
    };
  }
};

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
    goal_id: row.goal_id ? String(row.goal_id) : null,
    name: String(row.name || ''),
    description: String(row.description || ''),
    status: row.status as any,
    priority: row.priority as any,
    deadline: row.deadline ? String(row.deadline) : '',
    section: row.section as any,
    sub_section: row.sub_section ? (row.sub_section as any) : null,
    client_name: row.client_name ? String(row.client_name) : '',
    script_content: row.script_content ? String(row.script_content) : '',
    creative_ideas,
    references,
    created_at: String(row.created_at || '')
  };
}

function mapGoalRow(row: any): Goal {
  return {
    id: String(row.id),
    section: row.section as any,
    sub_section: row.sub_section ? (row.sub_section as any) : null,
    title: String(row.title || ''),
    description: String(row.description || ''),
    target_date: row.target_date ? String(row.target_date) : '',
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
    project_id: row.project_id ? String(row.project_id) : null,
    title: String(row.title || ''),
    due_date: row.due_date ? String(row.due_date) : '',
    completed: Boolean(row.completed === 1 || row.completed === true),
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
    deadline: row.deadline ? String(row.deadline) : '',
    revenue: Number(row.revenue || 0),
    linked_project_id: row.linked_project_id ? String(row.linked_project_id) : null,
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
    triaged: Boolean(row.triaged === 1),
    created_at: String(row.created_at || '')
  };
}
