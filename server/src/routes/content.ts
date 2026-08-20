import { Router } from 'express';
import { getDb, mutateDb, ContentItem } from '../db';

export const contentRouter = Router();

contentRouter.get('/', (req, res) => {
  const db = getDb();

  const itemsWithMetrics = db.content_items.map((item) => {
    const hours = item.hours_invested || 1;
    const views = item.views || 0;
    const saves = item.saves || 0;
    const viewsPerHour = Math.round(views / hours);
    const savesPerHour = Math.round(saves / hours);

    return {
      ...item,
      viewsPerHour,
      savesPerHour
    };
  });

  const totalContent = itemsWithMetrics.length;
  const postedCount = itemsWithMetrics.filter((i) => i.status === 'Posted').length;
  const totalHours = itemsWithMetrics.reduce((acc, curr) => acc + (curr.hours_invested || 0), 0);
  const totalViews = itemsWithMetrics.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalSaves = itemsWithMetrics.reduce((acc, curr) => acc + (curr.saves || 0), 0);

  res.json({
    items: itemsWithMetrics,
    analytics: {
      totalContent,
      postedCount,
      totalHours,
      totalViews,
      totalSaves,
      avgViewsPerHour: totalHours > 0 ? Math.round(totalViews / totalHours) : 0
    }
  });
});

contentRouter.post('/', (req, res) => {
  const {
    title,
    platforms = ['Instagram'],
    status = 'Idea',
    content_type = 'Reel / Short',
    main_idea = '',
    hook = '',
    structure = '',
    required_footage = '',
    caption = '',
    hashtags = '',
    scheduled_date = null,
    project_id = null,
    draft_url = '',
    thumbnail_url = '',
    hours_invested = 0,
    notes = ''
  } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Content title is required' });
  }

  const newItem: ContentItem = {
    id: `cnt_${Date.now()}`,
    title,
    platforms,
    status,
    content_type,
    main_idea,
    hook,
    structure,
    required_footage,
    caption,
    hashtags,
    scheduled_date,
    project_id,
    draft_url,
    thumbnail_url,
    hours_invested: Number(hours_invested) || 0,
    views: 0,
    likes: 0,
    saves: 0,
    shares: 0,
    comments: 0,
    notes,
    created_at: new Date().toISOString()
  };

  mutateDb((db) => {
    db.content_items.push(newItem);
  });

  res.status(201).json(newItem);
});

contentRouter.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  let updated: ContentItem | null = null;
  mutateDb((db) => {
    const idx = db.content_items.findIndex((i) => i.id === id);
    if (idx !== -1) {
      db.content_items[idx] = { ...db.content_items[idx], ...updates };
      updated = db.content_items[idx];
    }
  });

  if (!updated) {
    return res.status(404).json({ error: 'Content item not found' });
  }

  res.json(updated);
});

contentRouter.delete('/:id', (req, res) => {
  const { id } = req.params;

  mutateDb((db) => {
    db.content_items = db.content_items.filter((i) => i.id !== id);
  });

  res.json({ success: true });
});
