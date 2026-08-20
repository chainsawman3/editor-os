import { Router } from 'express';
import { getDb, mutateDb, QuickIdea, Project, ContentItem } from '../db.js';

export const inboxRouter = Router();

inboxRouter.get('/', (req, res) => {
  const db = getDb();
  res.json(db.quick_ideas);
});

inboxRouter.post('/', (req, res) => {
  const { text, target_category = null } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Text is required' });
  }

  const newIdea: QuickIdea = {
    id: `qi_${Date.now()}`,
    text: text.trim(),
    captured_at: new Date().toISOString(),
    target_category,
    triaged: false,
    created_at: new Date().toISOString()
  };

  mutateDb((db) => {
    db.quick_ideas.unshift(newIdea);
  });

  res.status(201).json(newIdea);
});

inboxRouter.post('/:id/triage', (req, res) => {
  const { id } = req.params;
  const { convert_to, project_name, content_title } = req.body;

  let convertedEntity: any = null;

  mutateDb((db) => {
    const idea = db.quick_ideas.find((i) => i.id === id);
    if (!idea) return;

    idea.triaged = true;

    if (convert_to === 'project') {
      const newProj: Project = {
        id: `proj_${Date.now()}`,
        name: project_name || idea.text,
        type: 'Portfolio',
        category_id: 'cat_video_editing',
        status: 'Planning',
        priority: 'Medium',
        health_status: 'On Track',
        start_date: new Date().toISOString().split('T')[0],
        expected_difficulty: 'Medium',
        actual_difficulty: null,
        next_action: 'Define concept and gather references',
        created_at: new Date().toISOString()
      };
      db.projects.push(newProj);
      convertedEntity = { type: 'project', data: newProj };
    } else if (convert_to === 'content') {
      const newContent: ContentItem = {
        id: `cnt_${Date.now()}`,
        title: content_title || idea.text,
        platforms: ['Instagram'],
        status: 'Idea',
        content_type: 'Reel / Short',
        main_idea: idea.text,
        created_at: new Date().toISOString()
      };
      db.content_items.push(newContent);
      convertedEntity = { type: 'content', data: newContent };
    }
  });

  res.json({ success: true, convertedEntity });
});

inboxRouter.delete('/:id', (req, res) => {
  const { id } = req.params;

  mutateDb((db) => {
    db.quick_ideas = db.quick_ideas.filter((i) => i.id !== id);
  });

  res.json({ success: true });
});
