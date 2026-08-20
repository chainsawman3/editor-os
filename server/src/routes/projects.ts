import { Router } from 'express';
import { getDb, mutateDb, Project, Task, Blocker, TimeLog, BeforeAfterEntry, Comment } from '../db';

export const projectsRouter = Router();

projectsRouter.get('/', (req, res) => {
  const db = getDb();
  const todayStr = new Date().toISOString().split('T')[0];

  const enrichedProjects = db.projects.map((p) => {
    const tasks = db.tasks.filter((t) => t.project_id === p.id);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed).length;
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const timeLogs = db.time_logs.filter((tl) => tl.project_id === p.id);
    const totalHours = timeLogs.reduce((acc, curr) => acc + curr.hours, 0);

    const activeBlockers = db.blockers.filter((b) => b.related_entity_id === p.id && b.active);
    const isOverdue = p.deadline && p.deadline < todayStr && p.status !== 'Completed';
    const category = db.categories.find((c) => c.id === p.category_id);

    return {
      ...p,
      categoryName: category ? category.name : 'General',
      totalTasks,
      completedTasks,
      progressPercent,
      totalHours,
      activeBlockersCount: activeBlockers.length,
      isOverdue: !!isOverdue
    };
  });

  res.json(enrichedProjects);
});

projectsRouter.get('/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const project = db.projects.find((p) => p.id === id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const tasks = db.tasks.filter((t) => t.project_id === id).sort((a, b) => a.order_index - b.order_index);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const blockers = db.blockers.filter((b) => b.related_entity_id === id);
  const timeLogs = db.time_logs.filter((tl) => tl.project_id === id).sort((a, b) => b.date.localeCompare(a.date));
  const totalHours = timeLogs.reduce((acc, curr) => acc + curr.hours, 0);

  const beforeAfter = db.before_after_entries.filter((ba) => ba.project_id === id);
  const comments = db.comments.filter((c) => c.related_entity_id === id).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const devLogs = db.development_logs.filter((dl) => dl.project_id === id).sort((a, b) => b.date.localeCompare(a.date));
  const knowledgeEntries = db.knowledge_entries.filter((k) => k.linked_project_id === id);
  const category = db.categories.find((c) => c.id === project.category_id);

  res.json({
    project: {
      ...project,
      categoryName: category ? category.name : 'General',
      totalTasks,
      completedTasks,
      progressPercent,
      totalHours
    },
    tasks,
    blockers,
    timeLogs,
    beforeAfter,
    comments,
    devLogs,
    knowledgeEntries
  });
});

projectsRouter.post('/', (req, res) => {
  const {
    name,
    type = 'Portfolio',
    category_id = null,
    status = 'Planning',
    priority = 'Medium',
    health_status = 'On Track',
    start_date = null,
    deadline = null,
    description = '',
    expected_difficulty = 'Medium',
    next_action = '',
    tasks = []
  } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Project name is required' });
  }

  const projectId = `proj_${Date.now()}`;
  const newProject: Project = {
    id: projectId,
    name,
    type,
    category_id,
    status,
    priority,
    health_status,
    start_date,
    deadline,
    description,
    expected_difficulty,
    actual_difficulty: null,
    next_action,
    final_output_url: '',
    lessons_learned: '',
    created_at: new Date().toISOString()
  };

  mutateDb((db) => {
    db.projects.push(newProject);

    if (Array.isArray(tasks) && tasks.length > 0) {
      tasks.forEach((t: { title: string; stage?: string }, idx: number) => {
        db.tasks.push({
          id: `t_${Date.now()}_${idx}`,
          title: t.title,
          project_id: projectId,
          stage: t.stage || 'Editing',
          completed: false,
          order_index: idx + 1,
          created_at: new Date().toISOString()
        });
      });
    }

    db.development_logs.push({
      id: `log_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      project_id: projectId,
      category_id,
      title: `Created Project: ${name}`,
      comment: `Project created with expected difficulty "${expected_difficulty}". Next action: "${next_action || 'None'}"`,
      is_strategy_change: false,
      created_at: new Date().toISOString()
    });
  });

  res.status(201).json(newProject);
});

projectsRouter.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  let updatedProject: Project | null = null;

  mutateDb((db) => {
    const idx = db.projects.findIndex((p) => p.id === id);
    if (idx !== -1) {
      db.projects[idx] = {
        ...db.projects[idx],
        ...updates
      };
      updatedProject = db.projects[idx];
    }
  });

  if (!updatedProject) {
    return res.status(404).json({ error: 'Project not found' });
  }

  res.json(updatedProject);
});

projectsRouter.delete('/:id', (req, res) => {
  const { id } = req.params;

  mutateDb((db) => {
    db.projects = db.projects.filter((p) => p.id !== id);
    db.tasks = db.tasks.filter((t) => t.project_id !== id);
    db.blockers = db.blockers.filter((b) => b.related_entity_id !== id);
    db.time_logs = db.time_logs.filter((tl) => tl.project_id !== id);
    db.before_after_entries = db.before_after_entries.filter((ba) => ba.project_id !== id);
  });

  res.json({ success: true });
});

projectsRouter.post('/:id/timelogs', (req, res) => {
  const { id } = req.params;
  const { stage, hours, date, notes } = req.body;

  if (!stage || hours === undefined) {
    return res.status(400).json({ error: 'Stage and hours are required' });
  }

  const newLog: TimeLog = {
    id: `tl_${Date.now()}`,
    project_id: id,
    stage,
    hours: Number(hours),
    date: date || new Date().toISOString().split('T')[0],
    notes: notes || '',
    created_at: new Date().toISOString()
  };

  mutateDb((db) => {
    db.time_logs.push(newLog);
  });

  res.status(201).json(newLog);
});

projectsRouter.delete('/:id/timelogs/:logId', (req, res) => {
  const { logId } = req.params;
  mutateDb((db) => {
    db.time_logs = db.time_logs.filter((tl) => tl.id !== logId);
  });
  res.json({ success: true });
});

projectsRouter.post('/:id/blockers', (req, res) => {
  const { id } = req.params;
  const { description } = req.body;

  if (!description || description.trim() === '') {
    return res.status(400).json({ error: 'Blocker description is required' });
  }

  const newBlocker: Blocker = {
    id: `blk_${Date.now()}`,
    related_entity_type: 'project',
    related_entity_id: id,
    description,
    active: true,
    created_at: new Date().toISOString()
  };

  mutateDb((db) => {
    db.blockers.push(newBlocker);
    const proj = db.projects.find((p) => p.id === id);
    if (proj && proj.health_status !== 'Blocked') {
      proj.health_status = 'Blocked';
    }
  });

  res.status(201).json(newBlocker);
});

projectsRouter.put('/:id/blockers/:blockerId/resolve', (req, res) => {
  const { blockerId, id } = req.params;

  mutateDb((db) => {
    const b = db.blockers.find((item) => item.id === blockerId);
    if (b) {
      b.active = false;
      b.resolved_at = new Date().toISOString();
    }

    const activeRemaining = db.blockers.filter((item) => item.related_entity_id === id && item.active);
    if (activeRemaining.length === 0) {
      const proj = db.projects.find((p) => p.id === id);
      if (proj && proj.health_status === 'Blocked') {
        proj.health_status = 'On Track';
      }
    }
  });

  res.json({ success: true });
});

projectsRouter.post('/:id/before-after', (req, res) => {
  const { id } = req.params;
  const { before_title, before_url, after_title, after_url, improvements_notes } = req.body;

  const newEntry: BeforeAfterEntry = {
    id: `ba_${Date.now()}`,
    project_id: id,
    before_title: before_title || 'Raw Footage / First Draft',
    before_url: before_url || '',
    after_title: after_title || 'Final Export',
    after_url: after_url || '',
    improvements_notes: improvements_notes || '',
    created_at: new Date().toISOString()
  };

  mutateDb((db) => {
    db.before_after_entries.push(newEntry);
  });

  res.status(201).json(newEntry);
});

projectsRouter.post('/:id/comments', (req, res) => {
  const { id } = req.params;
  const { text, author = 'Editor' } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Comment text is required' });
  }

  const newComment: Comment = {
    id: `comm_${Date.now()}`,
    related_entity_type: 'project',
    related_entity_id: id,
    text,
    author,
    created_at: new Date().toISOString()
  };

  mutateDb((db) => {
    db.comments.push(newComment);
  });

  res.status(201).json(newComment);
});
