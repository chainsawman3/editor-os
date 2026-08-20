import { Router } from 'express';
import { getDb } from '../db.js';

export const summaryRouter = Router();

summaryRouter.get('/', (req, res) => {
  const db = getDb();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const settings = db.settings[0] || {
    id: 1,
    cycle_start_date: todayStr,
    cycle_duration_days: 90,
    streak_days: 0,
    user_name: 'Video Editor',
    created_at: new Date().toISOString()
  };

  const startDate = new Date(settings.cycle_start_date);
  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);
  const currentDay = Math.min(diffDays, settings.cycle_duration_days);

  const activeProjects = db.projects.filter((p) => p.status === 'In Progress' || p.status === 'Planning');

  const allTasks = db.tasks;
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.completed).length;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const overdueTasks = allTasks.filter((t) => !t.completed && t.due_date && t.due_date < todayStr);

  const upcomingDeadlines: Array<{ id: string; title: string; type: 'Project' | 'Task' | 'Content'; date: string; isOverdue: boolean }> = [];

  db.projects.forEach((p) => {
    if (p.deadline && p.status !== 'Completed') {
      upcomingDeadlines.push({
        id: p.id,
        title: p.name,
        type: 'Project',
        date: p.deadline,
        isOverdue: p.deadline < todayStr
      });
    }
  });

  db.tasks.forEach((t) => {
    if (t.due_date && !t.completed) {
      upcomingDeadlines.push({
        id: t.id,
        title: t.title,
        type: 'Task',
        date: t.due_date,
        isOverdue: t.due_date < todayStr
      });
    }
  });

  db.content_items.forEach((c) => {
    if (c.scheduled_date && c.status !== 'Posted') {
      upcomingDeadlines.push({
        id: c.id,
        title: c.title,
        type: 'Content',
        date: c.scheduled_date,
        isOverdue: c.scheduled_date < todayStr
      });
    }
  });

  upcomingDeadlines.sort((a, b) => a.date.localeCompare(b.date));

  const nextActions: Array<{
    id: string;
    entityType: 'project' | 'category' | 'goal';
    entityId: string;
    entityTitle: string;
    text: string;
  }> = [];

  db.projects.forEach((p) => {
    if (p.status !== 'Completed' && p.next_action) {
      nextActions.push({
        id: `na_p_${p.id}`,
        entityType: 'project',
        entityId: p.id,
        entityTitle: p.name,
        text: p.next_action
      });
    }
  });

  db.categories.forEach((c) => {
    if (c.status !== 'Completed' && c.next_action) {
      nextActions.push({
        id: `na_c_${c.id}`,
        entityType: 'category',
        entityId: c.id,
        entityTitle: c.name,
        text: c.next_action
      });
    }
  });

  db.goals.forEach((g) => {
    if (g.status !== 'Completed' && g.next_action) {
      nextActions.push({
        id: `na_g_${g.id}`,
        entityType: 'goal',
        entityId: g.id,
        entityTitle: g.title,
        text: g.next_action
      });
    }
  });

  const activeBlockers = db.blockers
    .filter((b) => b.active)
    .map((b) => {
      let title = 'General Roadblock';
      if (b.related_entity_type === 'project') {
        const proj = db.projects.find((p) => p.id === b.related_entity_id);
        if (proj) title = proj.name;
      } else if (b.related_entity_type === 'category') {
        const cat = db.categories.find((c) => c.id === b.related_entity_id);
        if (cat) title = cat.name;
      } else if (b.related_entity_type === 'goal') {
        const goal = db.goals.find((g) => g.id === b.related_entity_id);
        if (goal) title = goal.title;
      } else if (b.related_entity_type === 'task') {
        const t = db.tasks.find((task) => task.id === b.related_entity_id);
        if (t) title = t.title;
      }
      return {
        ...b,
        entityTitle: title
      };
    });

  const parentCategories = db.categories.filter((c) => !c.parent_id);
  const categoryProgress = parentCategories.map((parent) => {
    const subCatIds = db.categories.filter((c) => c.parent_id === parent.id).map((c) => c.id);
    const allCatIds = [parent.id, ...subCatIds];

    const linkedProjects = db.projects.filter((p) => p.category_id && allCatIds.includes(p.category_id));
    const projectIds = linkedProjects.map((p) => p.id);

    const catTasks = db.tasks.filter((t) => (t.category_id && allCatIds.includes(t.category_id)) || (t.project_id && projectIds.includes(t.project_id)));

    const catTotal = catTasks.length;
    const catCompleted = catTasks.filter((t) => t.completed).length;
    const percent = catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0;

    return {
      id: parent.id,
      name: parent.name,
      icon: parent.icon,
      status: parent.status,
      totalTasks: catTotal,
      completedTasks: catCompleted,
      progressPercent: percent,
      activeProjectsCount: linkedProjects.filter((p) => p.status === 'In Progress').length,
      nextAction: parent.next_action
    };
  });

  const todayTasks = db.tasks.filter((t) => {
    if (t.completed && t.completed_at && t.completed_at.startsWith(todayStr)) return true;
    if (t.due_date === todayStr) return true;
    return false;
  });

  const recentActivities: Array<{ id: string; text: string; date: string; type: string }> = [];

  db.development_logs.slice(-5).forEach((log) => {
    recentActivities.push({
      id: log.id,
      text: log.title,
      date: log.date,
      type: log.is_strategy_change ? 'Strategy Pivot' : 'Dev Log'
    });
  });

  db.wins.slice(-3).forEach((win) => {
    recentActivities.push({
      id: win.id,
      text: `🏆 Win: ${win.title}`,
      date: win.date,
      type: 'Win'
    });
  });

  db.content_items
    .filter((c) => c.status === 'Posted')
    .slice(-3)
    .forEach((cnt) => {
      recentActivities.push({
        id: cnt.id,
        text: `Posted: ${cnt.title}`,
        date: cnt.scheduled_date || cnt.created_at.split('T')[0],
        type: 'Content'
      });
    });

  recentActivities.sort((a, b) => b.date.localeCompare(a.date));

  res.json({
    summary: {
      cycleDay: currentDay,
      cycleTotalDays: settings.cycle_duration_days,
      cycleStartDate: settings.cycle_start_date,
      overallProgress,
      streakDays: typeof settings.streak_days === 'number' ? settings.streak_days : 0,
      activeProjectsCount: activeProjects.length,
      overdueTasksCount: overdueTasks.length,
      nextUpcomingDeadline: upcomingDeadlines[0] || null
    },
    categoryProgress,
    nextActions,
    activeBlockers,
    todayTasks,
    upcomingDeadlines: upcomingDeadlines.slice(0, 5),
    recentActivities: recentActivities.slice(0, 6)
  });
});
