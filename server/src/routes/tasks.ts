import { Router } from 'express';
import { getDb, mutateDb, Task } from '../db';

export const tasksRouter = Router();

tasksRouter.get('/', (req, res) => {
  const db = getDb();
  res.json(db.tasks);
});

tasksRouter.post('/', (req, res) => {
  const { title, project_id = null, category_id = null, stage = null, due_date = null } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const db = getDb();
  const existingCount = db.tasks.filter((t) => t.project_id === project_id && t.category_id === category_id).length;

  const newTask: Task = {
    id: `t_${Date.now()}`,
    title,
    project_id,
    category_id,
    stage,
    due_date,
    completed: false,
    order_index: existingCount + 1,
    created_at: new Date().toISOString()
  };

  mutateDb((database) => {
    database.tasks.push(newTask);
  });

  res.status(201).json(newTask);
});

tasksRouter.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  let updated: Task | null = null;
  mutateDb((db) => {
    const idx = db.tasks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      if (updates.completed !== undefined && updates.completed !== db.tasks[idx].completed) {
        updates.completed_at = updates.completed ? new Date().toISOString() : null;
      }
      db.tasks[idx] = { ...db.tasks[idx], ...updates };
      updated = db.tasks[idx];
    }
  });

  if (!updated) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(updated);
});

tasksRouter.delete('/:id', (req, res) => {
  const { id } = req.params;

  mutateDb((db) => {
    db.tasks = db.tasks.filter((t) => t.id !== id);
  });

  res.json({ success: true });
});
