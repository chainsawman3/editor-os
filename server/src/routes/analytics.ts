import { Router } from 'express';
import { getDb } from '../db.js';

export const analyticsRouter = Router();

analyticsRouter.get('/', (req, res) => {
  const db = getDb();

  const stageHoursMap: Record<string, number> = {
    Research: 0,
    Editing: 0,
    'Sound Design': 0,
    'Color Grading': 0,
    'Motion Graphics': 0,
    Export: 0,
    Admin: 0
  };

  db.time_logs.forEach((tl) => {
    if (stageHoursMap[tl.stage] !== undefined) {
      stageHoursMap[tl.stage] += tl.hours;
    } else {
      stageHoursMap[tl.stage] = (stageHoursMap[tl.stage] || 0) + tl.hours;
    }
  });

  const stageHoursData = Object.entries(stageHoursMap).map(([stage, hours]) => ({
    stage,
    hours
  }));

  const contentRoiData = db.content_items.map((item) => {
    const hours = item.hours_invested || 1;
    const views = item.views || 0;
    const saves = item.saves || 0;
    return {
      title: item.title,
      type: item.content_type,
      hours,
      views,
      saves,
      roi: Math.round(views / hours)
    };
  });

  const difficultyDistribution = {
    Easy: db.projects.filter((p) => p.expected_difficulty === 'Easy').length,
    Medium: db.projects.filter((p) => p.expected_difficulty === 'Medium').length,
    Hard: db.projects.filter((p) => p.expected_difficulty === 'Hard').length,
    Extreme: db.projects.filter((p) => p.expected_difficulty === 'Extreme').length
  };

  const totalHoursLogged = db.time_logs.reduce((acc, curr) => acc + curr.hours, 0);
  const totalRevenue = db.clients.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  const completedProjects = db.projects.filter((p) => p.status === 'Completed').length;
  const totalWins = db.wins.length;

  res.json({
    stageHoursData,
    contentRoiData,
    difficultyDistribution,
    stats: {
      totalHoursLogged,
      totalRevenue,
      completedProjects,
      totalProjects: db.projects.length,
      totalWins
    }
  });
});
