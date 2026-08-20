import { Router } from 'express';
import { getDb, mutateDb, DevelopmentLog } from '../db.js';

export const logsRouter = Router();

logsRouter.get('/', (req, res) => {
  const db = getDb();
  const { strategy_only } = req.query;

  let logs = db.development_logs;
  if (strategy_only === 'true') {
    logs = logs.filter((l) => l.is_strategy_change);
  }

  const enrichedLogs = logs.map((log) => {
    const category = db.categories.find((c) => c.id === log.category_id);
    const project = db.projects.find((p) => p.id === log.project_id);
    return {
      ...log,
      categoryName: category ? category.name : null,
      projectName: project ? project.name : null
    };
  });

  enrichedLogs.sort((a, b) => b.date.localeCompare(a.date));
  res.json(enrichedLogs);
});

logsRouter.post('/', (req, res) => {
  const {
    date = new Date().toISOString().split('T')[0],
    category_id = null,
    project_id = null,
    title,
    comment,
    attachment_url = '',
    is_strategy_change = false,
    old_strategy = '',
    new_strategy = '',
    change_reason = ''
  } = req.body;

  if (!title || !comment) {
    return res.status(400).json({ error: 'Title and comment are required' });
  }

  const newLog: DevelopmentLog = {
    id: `log_${Date.now()}`,
    date,
    category_id,
    project_id,
    title,
    comment,
    attachment_url,
    is_strategy_change,
    old_strategy,
    new_strategy,
    change_reason,
    created_at: new Date().toISOString()
  };

  mutateDb((db) => {
    db.development_logs.push(newLog);
  });

  res.status(201).json(newLog);
});

logsRouter.delete('/:id', (req, res) => {
  const { id } = req.params;

  mutateDb((db) => {
    db.development_logs = db.development_logs.filter((l) => l.id !== id);
  });

  res.json({ success: true });
});
