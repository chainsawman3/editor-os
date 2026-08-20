import { Router } from 'express';
import { getDb, mutateDb, Report } from '../db';

export const reportsRouter = Router();

reportsRouter.get('/', (req, res) => {
  const db = getDb();
  const sorted = [...db.reports].sort((a, b) => b.created_at.localeCompare(a.created_at));
  res.json(sorted);
});

reportsRouter.get('/auto-aggregate', (req, res) => {
  const db = getDb();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const lastWeekStr = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const completedTasks = db.tasks.filter((t) => t.completed && t.completed_at && t.completed_at >= lastWeekStr);
  const activeProjects = db.projects.filter((p) => p.status === 'In Progress');
  const contentPosted = db.content_items.filter((c) => c.status === 'Posted');
  const activeBlockers = db.blockers.filter((b) => b.active);
  const recentWins = db.wins.filter((w) => w.date >= lastWeekStr);
  const recentRevenue = db.clients.reduce((acc, curr) => acc + (curr.revenue || 0), 0);

  res.json({
    period_start: lastWeekStr,
    period_end: todayStr,
    aggregated: {
      completedTasksCount: completedTasks.length,
      activeProjectsCount: activeProjects.length,
      contentPostedCount: contentPosted.length,
      activeBlockersCount: activeBlockers.length,
      winsCount: recentWins.length,
      totalRevenue: recentRevenue
    }
  });
});

reportsRouter.get('/milestones/benchmark', (req, res) => {
  const db = getDb();

  const day1Baseline = {
    portfolioProjects: 0,
    clients: 0,
    revenue: 0,
    instagramPosts: 0,
    skillsMastered: 0,
    winsLogged: 0
  };

  const currentMilestone = {
    portfolioProjects: db.projects.filter((p) => p.status === 'Completed' || p.status === 'In Progress').length,
    clients: db.clients.filter((c) => c.status === 'Client' || c.status === 'Completed').length,
    revenue: db.clients.reduce((acc, curr) => acc + (curr.revenue || 0), 0),
    instagramPosts: db.content_items.filter((c) => c.status === 'Posted').length,
    skillsMastered: db.knowledge_entries.length,
    winsLogged: db.wins.length
  };

  res.json({
    day1_baseline: day1Baseline,
    current_milestone: currentMilestone
  });
});

reportsRouter.post('/', (req, res) => {
  const {
    type = 'weekly',
    period_start = new Date().toISOString().split('T')[0],
    period_end = new Date().toISOString().split('T')[0],
    milestone_day,
    metrics_json = {},
    what_worked = '',
    what_failed = '',
    problems_encountered = '',
    what_learned = '',
    next_priorities = '',
    biggest_win = '',
    biggest_problem = ''
  } = req.body;

  const newReport: Report = {
    id: `rep_${Date.now()}`,
    type,
    period_start,
    period_end,
    milestone_day,
    metrics_json,
    what_worked,
    what_failed,
    problems_encountered,
    what_learned,
    next_priorities,
    biggest_win,
    biggest_problem,
    created_at: new Date().toISOString()
  };

  mutateDb((db) => {
    db.reports.unshift(newReport);
  });

  res.status(201).json(newReport);
});

reportsRouter.delete('/:id', (req, res) => {
  const { id } = req.params;

  mutateDb((db) => {
    db.reports = db.reports.filter((r) => r.id !== id);
  });

  res.json({ success: true });
});
