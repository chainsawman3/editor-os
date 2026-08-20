import { Router } from 'express';
import { getDb, mutateDb, Goal } from '../db';

export const goalsRouter = Router();

goalsRouter.get('/', (req, res) => {
  const db = getDb();
  const goalsWithCategory = db.goals.map((g) => {
    const category = db.categories.find((c) => c.id === g.category_id);
    return {
      ...g,
      categoryName: category ? category.name : 'General'
    };
  });
  res.json(goalsWithCategory);
});

goalsRouter.post('/', (req, res) => {
  const { title, description = '', target_date = null, status = 'In Progress', category_id = null, next_action = '', notes = '' } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Goal title is required' });
  }

  const newGoal: Goal = {
    id: `goal_${Date.now()}`,
    title,
    description,
    target_date,
    status,
    category_id,
    next_action,
    notes,
    created_at: new Date().toISOString()
  };

  mutateDb((db) => {
    db.goals.push(newGoal);
  });

  res.status(201).json(newGoal);
});

goalsRouter.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  let updated: Goal | null = null;
  mutateDb((db) => {
    const idx = db.goals.findIndex((g) => g.id === id);
    if (idx !== -1) {
      db.goals[idx] = { ...db.goals[idx], ...updates };
      updated = db.goals[idx];
    }
  });

  if (!updated) {
    return res.status(404).json({ error: 'Goal not found' });
  }

  res.json(updated);
});

goalsRouter.delete('/:id', (req, res) => {
  const { id } = req.params;

  mutateDb((db) => {
    db.goals = db.goals.filter((g) => g.id !== id);
  });

  res.json({ success: true });
});
