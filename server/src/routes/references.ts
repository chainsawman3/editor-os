import { Router } from 'express';
import { getDb, mutateDb, ReferenceItem } from '../db';

export const referencesRouter = Router();

referencesRouter.get('/', (req, res) => {
  const db = getDb();
  res.json(db.reference_items);
});

referencesRouter.post('/', (req, res) => {
  const { title, link, category, platform = 'Vimeo', why_saved, what_to_learn } = req.body;

  if (!title || !link || !why_saved || !what_to_learn) {
    return res.status(400).json({ error: 'Title, link, why_saved, and what_to_learn are required' });
  }

  const newRef: ReferenceItem = {
    id: `ref_${Date.now()}`,
    title,
    link,
    category: category || 'Commercial',
    platform,
    why_saved,
    what_to_learn,
    created_at: new Date().toISOString()
  };

  mutateDb((db) => {
    db.reference_items.push(newRef);
  });

  res.status(201).json(newRef);
});

referencesRouter.delete('/:id', (req, res) => {
  const { id } = req.params;

  mutateDb((db) => {
    db.reference_items = db.reference_items.filter((r) => r.id !== id);
  });

  res.json({ success: true });
});
