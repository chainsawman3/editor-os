import { Router } from 'express';
import { getDb, mutateDb, Win } from '../db';

export const winsRouter = Router();

winsRouter.get('/', (req, res) => {
  const db = getDb();
  const sorted = [...db.wins].sort((a, b) => b.date.localeCompare(a.date));
  res.json(sorted);
});

winsRouter.post('/', (req, res) => {
  const { title, date = new Date().toISOString().split('T')[0], description = '', category = 'Achievement' } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Win title is required' });
  }

  const newWin: Win = {
    id: `win_${Date.now()}`,
    title,
    date,
    description,
    category,
    created_at: new Date().toISOString()
  };

  mutateDb((db) => {
    db.wins.unshift(newWin);
  });

  res.status(201).json(newWin);
});

winsRouter.delete('/:id', (req, res) => {
  const { id } = req.params;

  mutateDb((db) => {
    db.wins = db.wins.filter((w) => w.id !== id);
  });

  res.json({ success: true });
});
