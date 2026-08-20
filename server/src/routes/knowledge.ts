import { Router } from 'express';
import { getDb, mutateDb, KnowledgeEntry } from '../db.js';

export const knowledgeRouter = Router();

knowledgeRouter.get('/', (req, res) => {
  const db = getDb();
  const enriched = db.knowledge_entries.map((k) => {
    const project = db.projects.find((p) => p.id === k.linked_project_id);
    return {
      ...k,
      linkedProjectName: project ? project.name : null
    };
  });
  res.json(enriched);
});

knowledgeRouter.post('/', (req, res) => {
  const { category, title, description, when_to_use = '', notes = '', linked_project_id = null } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({ error: 'Category, title and description are required' });
  }

  const newEntry: KnowledgeEntry = {
    id: `kb_${Date.now()}`,
    category,
    title,
    description,
    when_to_use,
    notes,
    linked_project_id,
    created_at: new Date().toISOString()
  };

  mutateDb((db) => {
    db.knowledge_entries.push(newEntry);
  });

  res.status(201).json(newEntry);
});

knowledgeRouter.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  let updated: KnowledgeEntry | null = null;
  mutateDb((db) => {
    const idx = db.knowledge_entries.findIndex((k) => k.id === id);
    if (idx !== -1) {
      db.knowledge_entries[idx] = { ...db.knowledge_entries[idx], ...updates };
      updated = db.knowledge_entries[idx];
    }
  });

  if (!updated) {
    return res.status(404).json({ error: 'Knowledge entry not found' });
  }

  res.json(updated);
});

knowledgeRouter.delete('/:id', (req, res) => {
  const { id } = req.params;

  mutateDb((db) => {
    db.knowledge_entries = db.knowledge_entries.filter((k) => k.id !== id);
  });

  res.json({ success: true });
});
