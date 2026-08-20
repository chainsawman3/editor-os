import { Router } from 'express';
import { getDb, mutateDb, Category } from '../db';

export const categoriesRouter = Router();

categoriesRouter.get('/', (req, res) => {
  const db = getDb();

  const categoriesWithDetails = db.categories.map((cat) => {
    const subcategories = db.categories.filter((c) => c.parent_id === cat.id);
    const allCatIds = [cat.id, ...subcategories.map((s) => s.id)];

    const linkedProjects = db.projects.filter((p) => p.category_id && allCatIds.includes(p.category_id));
    const projectIds = linkedProjects.map((p) => p.id);

    const tasks = db.tasks.filter(
      (t) => (t.category_id && allCatIds.includes(t.category_id)) || (t.project_id && projectIds.includes(t.project_id))
    );

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed).length;
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      ...cat,
      subcategories,
      totalTasks,
      completedTasks,
      progressPercent,
      linkedProjectsCount: linkedProjects.length
    };
  });

  res.json(categoriesWithDetails);
});

categoriesRouter.get('/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const category = db.categories.find((c) => c.id === id);

  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }

  const subcategories = db.categories.filter((c) => c.parent_id === id);
  const allCatIds = [id, ...subcategories.map((s) => s.id)];

  const tasks = db.tasks.filter((t) => t.category_id && allCatIds.includes(t.category_id)).sort((a, b) => a.order_index - b.order_index);
  const linkedProjects = db.projects.filter((p) => p.category_id && allCatIds.includes(p.category_id));
  const devLogs = db.development_logs.filter((dl) => dl.category_id && allCatIds.includes(dl.category_id)).sort((a, b) => b.date.localeCompare(a.date));

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  res.json({
    category: {
      ...category,
      totalTasks,
      completedTasks,
      progressPercent
    },
    subcategories,
    tasks,
    linkedProjects,
    devLogs
  });
});

categoriesRouter.post('/', (req, res) => {
  const { name, icon = 'Folder', status = 'In Progress', parent_id = null, next_action = '' } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const newCat: Category = {
    id: `cat_${Date.now()}`,
    name,
    icon,
    status,
    parent_id,
    order_index: 99,
    next_action,
    created_at: new Date().toISOString()
  };

  mutateDb((db) => {
    db.categories.push(newCat);
  });

  res.status(201).json(newCat);
});

categoriesRouter.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  let updated: Category | null = null;
  mutateDb((db) => {
    const idx = db.categories.findIndex((c) => c.id === id);
    if (idx !== -1) {
      db.categories[idx] = { ...db.categories[idx], ...updates };
      updated = db.categories[idx];
    }
  });

  if (!updated) {
    return res.status(404).json({ error: 'Category not found' });
  }

  res.json(updated);
});

categoriesRouter.delete('/:id', (req, res) => {
  const { id } = req.params;

  mutateDb((db) => {
    db.categories = db.categories.filter((c) => c.id !== id && c.parent_id !== id);
    db.tasks = db.tasks.filter((t) => t.category_id !== id);
  });

  res.json({ success: true });
});
