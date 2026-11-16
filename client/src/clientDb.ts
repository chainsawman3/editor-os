import {
  DashboardSummaryResponse,
  Project,
  Category,
  Goal,
  Task,
  Blocker,
  TimeLog,
  BeforeAfterEntry,
  ContentItem,
  Client,
  DevelopmentLog,
  KnowledgeEntry,
  ReferenceItem,
  QuickIdea,
  Win,
  Report,
  Settings,
  NoteItem
} from './types';

export interface LocalDatabaseSchema {
  settings: Settings[];
  categories: Category[];
  goals: Goal[];
  projects: Project[];
  tasks: Task[];
  blockers: Blocker[];
  time_logs: TimeLog[];
  before_after_entries: BeforeAfterEntry[];
  content_items: ContentItem[];
  clients: Client[];
  development_logs: DevelopmentLog[];
  knowledge_entries: KnowledgeEntry[];
  reference_items: ReferenceItem[];
  quick_ideas: QuickIdea[];
  wins: Win[];
  reports: Report[];
  comments: any[];
  notes: NoteItem[];
}

const STORAGE_KEY = 'editor_os_local_db_v3';

const today = new Date();
const todayStr = today.toISOString().split('T')[0];
const in3DaysStr = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
const in5DaysStr = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];
const in7DaysStr = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
const in14DaysStr = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

export const initialDefaultDatabase: LocalDatabaseSchema = {
  settings: [
    {
      id: 1,
      cycle_start_date: todayStr,
      cycle_duration_days: 90,
      streak_days: 12,
      user_name: 'Alex (Video Editor)',
      created_at: new Date().toISOString()
    }
  ],
  categories: [],
  goals: [],
  projects: [],
  tasks: [],
  clients: [
    {
      id: 'cli_1',
      name: 'David Miller (Apex Gym)',
      contact_method: 'Instagram DM & Email',
      status: 'Client',
      priority: 'High',
      contact_date: '2026-08-10',
      deadline: in3DaysStr,
      linked_project_id: 'proj_talking_head_ad',
      potential_project: 'Talking Head Commercial ($800)',
      revenue: 800,
      notes: 'Loved the fast pacing sample. Ready to sign 3-month retainer if this performs.',
      created_at: new Date().toISOString()
    },
    {
      id: 'cli_2',
      name: 'Sophie Davis (YouTube Creator)',
      contact_method: 'Twitter / X DM',
      status: 'Agreed',
      priority: 'High',
      contact_date: '2026-08-16',
      deadline: in7DaysStr,
      linked_project_id: 'proj_yt_creator_pitch',
      potential_project: '4x Long-form Edits / Month ($1,200)',
      revenue: 1200,
      notes: 'Approved the proposal rate. Waiting for footage upload via Google Drive.',
      created_at: new Date().toISOString()
    },
    {
      id: 'cli_3',
      name: 'Mark K. (Tech Podcast)',
      contact_method: 'LinkedIn Outreach',
      status: 'Contacted',
      priority: 'Medium',
      contact_date: '2026-08-18',
      deadline: in5DaysStr,
      linked_project_id: 'proj_podcast_highlight',
      potential_project: 'Podcast Highlights Package ($600)',
      revenue: 600,
      notes: 'Sent personalized audit video showing where audience retention drops.',
      created_at: new Date().toISOString()
    },
    {
      id: 'cli_4',
      name: 'Elena Rostova (Fashion Brand)',
      contact_method: 'Email Cold Pitch',
      status: 'Ignored',
      priority: 'Low',
      contact_date: '2026-08-12',
      deadline: null,
      linked_project_id: null,
      potential_project: 'Product Lookbook Video ($500)',
      revenue: 0,
      notes: 'No reply after 2 follow-ups. Placed on pause.',
      created_at: new Date().toISOString()
    }
  ],
  quick_ideas: [
    {
      id: 'idea_1',
      text: 'Create a split screen Before/After Reel comparing Premiere default color vs Custom Film Emulation LUT',
      captured_at: new Date().toISOString(),
      target_section: 'marketing',
      triaged: false,
      created_at: new Date().toISOString()
    },
    {
      id: 'idea_2',
      text: 'Offer a "First 30 Seconds Free Retention Hook" offer to top 10 fitness influencers',
      captured_at: new Date().toISOString(),
      target_section: 'freelance',
      triaged: false,
      created_at: new Date().toISOString()
    }
  ],
  blockers: [],
  time_logs: [],
  before_after_entries: [],
  content_items: [],
  development_logs: [
    {
      id: 'log_1',
      date: todayStr,
      title: 'Editor OS Structure Upgraded to GOAL-Centric Architecture',
      comment: 'Unified GOAL hub (Video Editing, Marketing, Freelance, Skills), merged Content Studio with dynamic Top 5 tasks and color-coded calendar.',
      is_strategy_change: true,
      created_at: new Date().toISOString()
    }
  ],
  knowledge_entries: [],
  reference_items: [],
  wins: [],
  reports: [],
  comments: [],
  notes: [
    {
      id: 'note_daily_scratchpad',
      title: 'Daily Morning Flow & Priority Checklist',
      folder: 'Daily Scratchpad',
      content: `<h1>Daily Editing Protocol</h1><p>Start each editing block with 50 minutes of deep focus without checking social notifications.</p><div class="note-task-item"><input type="checkbox" checked /> <span>Review timeline cuts for talking head deliverable</span></div><div class="note-task-item"><input type="checkbox" checked /> <span>Sound design sweep (-6dB dialogue, -18dB audio track)</span></div><div class="note-task-item"><input type="checkbox" /> <span>Render 4K ProRes master export</span></div><div class="note-task-item"><input type="checkbox" /> <span>Send Vimeo review link to client</span></div><hr/><blockquote>"Focus on high leverage storytelling beats before micro-tweaking color curves."</blockquote>`,
      tags: ['Daily', 'Routine', 'Focus'],
      is_pinned: true,
      color: 'amber',
      date: todayStr,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'note_hook_brainstorm',
      title: 'Viral Hook Concepts & Visual Pacing Ideas',
      folder: 'Script Ideas',
      content: `<h2>High-Retention Short Form Hooks</h2><p>Here are 3 tested formulas to test for upcoming YouTube Shorts & TikTok reels:</p><div class="note-task-item"><input type="checkbox" /> <span><strong>Formula 1:</strong> "Stop editing your videos like this in 2026..."</span></div><div class="note-task-item"><input type="checkbox" /> <span><strong>Formula 2:</strong> "The 1 secret plugin top editors use to cut render times in half"</span></div><div class="note-task-item"><input type="checkbox" /> <span><strong>Formula 3:</strong> "Before vs After sound design transformation"</span></div><hr/><p><em>Tip: Keep visual scene cuts under 2.8 seconds in the first 10 seconds.</em></p>`,
      tags: ['Hooks', 'Content', 'Viral'],
      is_pinned: false,
      color: 'yellow',
      date: todayStr,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
};

export function getLocalDb(): LocalDatabaseSchema {
  if (typeof window === 'undefined') return initialDefaultDatabase;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.projects && parsed.goals) {
        if (!parsed.notes || !Array.isArray(parsed.notes)) {
          parsed.notes = initialDefaultDatabase.notes;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading localStorage DB:', e);
  }
  saveLocalDb(initialDefaultDatabase);
  return initialDefaultDatabase;
}

export function saveLocalDb(data: LocalDatabaseSchema) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

export function getLocalSummary(): DashboardSummaryResponse {
  const db = getLocalDb();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const settings = db.settings[0] || {
    id: 1,
    cycle_start_date: todayStr,
    cycle_duration_days: 90,
    streak_days: 0,
    user_name: 'Alex (Video Editor)',
    created_at: today.toISOString()
  };

  const startDate = new Date(settings.cycle_start_date);
  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);
  const currentDay = Math.min(diffDays, settings.cycle_duration_days);

  const activeProjects = db.projects.filter((p) => p.status === 'In Progress' || p.status === 'Planning');
  const allTasks = db.tasks;
  const overdueTasks = allTasks.filter((t) => !t.completed && t.due_date && t.due_date < todayStr);

  const primaryCategories = [
    { id: 'video_editing', name: 'Video Editing', icon: 'Clapperboard' },
    { id: 'marketing', name: 'Marketing', icon: 'Megaphone' },
    { id: 'freelance', name: 'Freelance / Clients', icon: 'Briefcase' },
    { id: 'skills', name: 'Skills / Learning', icon: 'GraduationCap' }
  ];

  const categoryProgress = primaryCategories.map((cat) => {
    const catProjects = db.projects.filter((p) => p.section === cat.id);
    const catProjectIds = catProjects.map((p) => p.id);
    const catTasks = allTasks.filter((t) => t.project_id && catProjectIds.includes(t.project_id));
    const catDone = catTasks.filter((t) => t.completed).length;
    const progressPercent = catTasks.length > 0 ? Math.round((catDone / catTasks.length) * 100) : 0;
    const mainGoal = db.goals.find((g) => g.section === cat.id);

    return {
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      status: 'In Progress',
      totalTasks: catTasks.length,
      completedTasks: catDone,
      progressPercent,
      activeProjectsCount: catProjects.length,
      nextAction: mainGoal?.next_action || (catProjects[0]?.next_action ?? null)
    };
  });

  const nextActions = [
    ...activeProjects.filter((p) => p.next_action).map((p) => ({
      id: `na_proj_${p.id}`,
      entityType: 'project' as const,
      entityId: p.id,
      entityTitle: p.name,
      text: p.next_action || ''
    })),
    ...db.goals.filter((g) => g.status === 'In Progress' && g.next_action).map((g) => ({
      id: `na_goal_${g.id}`,
      entityType: 'goal' as const,
      entityId: g.id,
      entityTitle: g.title,
      text: g.next_action || ''
    }))
  ];

  const activeBlockers: Array<Blocker & { entityTitle: string }> = [];

  // Top uncompleted tasks
  const todayTasks = allTasks
    .filter((t) => !t.completed)
    .sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    })
    .slice(0, 5)
    .map((t) => {
      const p = db.projects.find((proj) => proj.id === t.project_id);
      return {
        ...t,
        projectName: p?.name || 'General Task'
      };
    });

  const upcomingDeadlines: Array<{
    id: string;
    title: string;
    type: 'Goal' | 'Project' | 'Task';
    date: string;
    isOverdue: boolean;
  }> = [];

  db.goals.forEach((g) => {
    if (g.target_date) {
      upcomingDeadlines.push({
        id: g.id,
        title: `🎯 ${g.title}`,
        type: 'Goal',
        date: g.target_date,
        isOverdue: g.target_date < todayStr
      });
    }
  });

  activeProjects.forEach((p) => {
    if (p.deadline) {
      upcomingDeadlines.push({
        id: p.id,
        title: `🎬 ${p.name}`,
        type: 'Project',
        date: p.deadline,
        isOverdue: p.deadline < todayStr
      });
    }
  });

  allTasks.filter((t) => !t.completed && t.due_date).forEach((t) => {
    upcomingDeadlines.push({
      id: t.id,
      title: `✅ ${t.title}`,
      type: 'Task',
      date: t.due_date!,
      isOverdue: t.due_date! < todayStr
    });
  });

  upcomingDeadlines.sort((a, b) => a.date.localeCompare(b.date));

  const recentActivities = db.development_logs.slice(-5).reverse().map((l) => ({
    id: l.id,
    text: `${l.title}: ${l.comment}`,
    date: l.date || l.created_at,
    type: l.is_strategy_change ? 'strategy' : 'log'
  }));

  const overallProgress = Math.round((currentDay / settings.cycle_duration_days) * 100);

  return {
    summary: {
      cycleDay: currentDay,
      cycleTotalDays: settings.cycle_duration_days,
      cycleStartDate: settings.cycle_start_date,
      overallProgress,
      streakDays: settings.streak_days ?? 0,
      activeProjectsCount: activeProjects.length,
      overdueTasksCount: overdueTasks.length,
      nextUpcomingDeadline: upcomingDeadlines[0] || null
    },
    categoryProgress,
    nextActions,
    activeBlockers,
    todayTasks,
    upcomingDeadlines,
    recentActivities
  };
}
