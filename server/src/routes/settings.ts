import { Router } from 'express';
import { getDb, mutateDb, saveDatabase, DatabaseSchema } from '../db';
import { seedDb } from '../seed';

export const settingsRouter = Router();

settingsRouter.get('/', (req, res) => {
  const db = getDb();
  const settings = db.settings[0] || {
    id: 1,
    cycle_start_date: new Date().toISOString().split('T')[0],
    cycle_duration_days: 90,
    streak_days: 0,
    user_name: 'Alex (Video Editor)',
    created_at: new Date().toISOString()
  };
  res.json(settings);
});

settingsRouter.put('/', (req, res) => {
  const updates = req.body;

  mutateDb((db) => {
    if (db.settings.length === 0) {
      db.settings.push({
        id: 1,
        cycle_start_date: updates.cycle_start_date || new Date().toISOString().split('T')[0],
        cycle_duration_days: updates.cycle_duration_days || 90,
        streak_days: typeof updates.streak_days === 'number' ? updates.streak_days : 0,
        user_name: updates.user_name || 'Alex (Video Editor)',
        created_at: new Date().toISOString()
      });
    } else {
      db.settings[0] = {
        ...db.settings[0],
        ...updates
      };
    }
  });

  const db = getDb();
  res.json(db.settings[0]);
});

settingsRouter.post('/reset-cycle-streak', (req, res) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const newStreak = typeof req.body.streak_days === 'number' ? req.body.streak_days : 0;

  mutateDb((db) => {
    if (db.settings.length === 0) {
      db.settings.push({
        id: 1,
        cycle_start_date: todayStr,
        cycle_duration_days: 90,
        streak_days: newStreak,
        user_name: 'Alex (Video Editor)',
        created_at: new Date().toISOString()
      });
    } else {
      db.settings[0].cycle_start_date = todayStr;
      db.settings[0].streak_days = newStreak;
    }
  });

  const db = getDb();
  res.json({
    success: true,
    message: 'Cycle reset to Day 1 / 90 and streak reset!',
    settings: db.settings[0]
  });
});

settingsRouter.get('/export', (req, res) => {
  const db = getDb();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="editor_os_backup.json"');
  res.send(JSON.stringify(db, null, 2));
});

settingsRouter.post('/import', (req, res) => {
  const importedData = req.body as DatabaseSchema;

  if (!importedData || !Array.isArray(importedData.projects) || !Array.isArray(importedData.categories)) {
    return res.status(400).json({ error: 'Invalid database backup structure' });
  }

  saveDatabase(importedData);
  res.json({ success: true, message: 'Database successfully imported' });
});

settingsRouter.post('/reset', (req, res) => {
  mutateDb((db) => {
    db.settings = [];
    db.categories = [];
    db.goals = [];
    db.projects = [];
    db.tasks = [];
    db.blockers = [];
    db.time_logs = [];
    db.before_after_entries = [];
    db.content_items = [];
    db.clients = [];
    db.development_logs = [];
    db.knowledge_entries = [];
    db.reference_items = [];
    db.quick_ideas = [];
    db.wins = [];
    db.reports = [];
    db.comments = [];
  });

  seedDb();
  res.json({ success: true, message: 'Database reset to default Editor OS v2.0 template' });
});
