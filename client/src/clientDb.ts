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
  Settings
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
}

const STORAGE_KEY = 'editor_os_local_db';

const initialDefaultDatabase: LocalDatabaseSchema = {
  settings: [
    {
      id: 1,
      cycle_start_date: new Date().toISOString().split('T')[0],
      cycle_duration_days: 90,
      streak_days: 0,
      user_name: 'Alex (Video Editor)',
      created_at: new Date().toISOString()
    }
  ],
  categories: [
    {
      id: 'cat_video_editing',
      name: 'Video Editing',
      icon: 'Clapperboard',
      status: 'In Progress',
      parent_id: null,
      order_index: 1,
      next_action: 'Refine commercial editing portfolio with 4K assets',
      created_at: new Date().toISOString()
    },
    {
      id: 'cat_marketing',
      name: 'Marketing',
      icon: 'Megaphone',
      status: 'In Progress',
      parent_id: null,
      order_index: 2,
      next_action: 'Prepare the first Before/After Reel for Instagram',
      created_at: new Date().toISOString()
    },
    {
      id: 'cat_freelance',
      name: 'Freelance / Clients',
      icon: 'Briefcase',
      status: 'In Progress',
      parent_id: null,
      order_index: 3,
      next_action: 'Reach out to 3 local sports brands with video audit',
      created_at: new Date().toISOString()
    },
    {
      id: 'cat_skills',
      name: 'Skills / Learning',
      icon: 'GraduationCap',
      status: 'In Progress',
      parent_id: null,
      order_index: 4,
      next_action: 'Master 3D Camera Tracking in After Effects',
      created_at: new Date().toISOString()
    },
    {
      id: 'sub_portfolio',
      name: 'Portfolio',
      icon: 'Folder',
      status: 'In Progress',
      parent_id: 'cat_video_editing',
      order_index: 1,
      next_action: 'Finalize Sports Drink Commercial sound mix',
      created_at: new Date().toISOString()
    },
    {
      id: 'sub_premiere',
      name: 'Premiere Pro',
      icon: 'Video',
      status: 'In Progress',
      parent_id: 'cat_video_editing',
      order_index: 2,
      next_action: 'Create automated rough cut shortcut macro',
      created_at: new Date().toISOString()
    },
    {
      id: 'sub_ae',
      name: 'After Effects',
      icon: 'Layers',
      status: 'In Progress',
      parent_id: 'cat_video_editing',
      order_index: 3,
      next_action: 'Practice kinetic typography transitions',
      created_at: new Date().toISOString()
    },
    {
      id: 'sub_mograph',
      name: 'Motion Graphics',
      icon: 'Sparkles',
      status: 'In Progress',
      parent_id: 'cat_video_editing',
      order_index: 4,
      next_action: 'Build custom lower thirds pack',
      created_at: new Date().toISOString()
    },
    {
      id: 'sub_color',
      name: 'Color Grading',
      icon: 'Palette',
      status: 'In Progress',
      parent_id: 'cat_video_editing',
      order_index: 5,
      next_action: 'Study DaVinci Resolve color space transforms',
      created_at: new Date().toISOString()
    },
    {
      id: 'sub_sound',
      name: 'Sound Design',
      icon: 'Volume2',
      status: 'In Progress',
      parent_id: 'cat_video_editing',
      order_index: 6,
      next_action: 'Organize SFX library by whoosh, risers, and hits',
      created_at: new Date().toISOString()
    },
    {
      id: 'sub_ai_video',
      name: 'AI Video',
      icon: 'Cpu',
      status: 'Planning',
      parent_id: 'cat_video_editing',
      order_index: 7,
      next_action: 'Test Runway Gen-3 camera controls',
      created_at: new Date().toISOString()
    },
    {
      id: 'sub_insta',
      name: 'Instagram',
      icon: 'Instagram',
      status: 'In Progress',
      parent_id: 'cat_marketing',
      order_index: 1,
      next_action: 'Prepare first Before/After Reel',
      created_at: new Date().toISOString()
    },
    {
      id: 'sub_tiktok',
      name: 'TikTok',
      icon: 'Music2',
      status: 'In Progress',
      parent_id: 'cat_marketing',
      order_index: 2,
      next_action: 'Publish 3 short viral editing breakdowns',
      created_at: new Date().toISOString()
    },
    {
      id: 'sub_behance',
      name: 'Behance',
      icon: 'Globe',
      status: 'Planning',
      parent_id: 'cat_marketing',
      order_index: 3,
      next_action: 'Create case study layout for Nike style spec ad',
      created_at: new Date().toISOString()
    },
    {
      id: 'sub_fiverr',
      name: 'Fiverr',
      icon: 'DollarSign',
      status: 'In Progress',
      parent_id: 'cat_marketing',
      order_index: 4,
      next_action: 'Optimize Gig #1 tags and video preview',
      created_at: new Date().toISOString()
    }
  ],
  goals: [
    {
      id: 'goal_1',
      title: 'Earn $3,000/mo from Freelance Video Editing',
      category_id: 'cat_freelance',
      target_date: '2026-11-20',
      status: 'In Progress',
      next_action: 'Send proposals to 5 YouTube creators with retention breakdown',
      created_at: new Date().toISOString()
    },
    {
      id: 'goal_2',
      title: 'Build High-Retention Short-Form Portfolio',
      category_id: 'cat_video_editing',
      target_date: '2026-10-15',
      status: 'In Progress',
      next_action: 'Record voiceover and mix sound effects for fitness ad spec',
      created_at: new Date().toISOString()
    }
  ],
  projects: [
    {
      id: 'proj_1',
      name: 'Talking Head Video, Podcast',
      type: 'Portfolio',
      category_id: 'sub_portfolio',
      status: 'Planning',
      priority: 'High',
      health_status: 'On Track',
      start_date: new Date().toISOString().split('T')[0],
      deadline: '2026-08-25',
      description: 'Dynamic fast-paced talking head edit with zooms, SFX, and b-roll inserts.',
      expected_difficulty: 'Medium',
      actual_difficulty: null,
      next_action: 'Find footage, write script, find references',
      final_output_url: '',
      lessons_learned: '',
      created_at: new Date().toISOString()
    }
  ],
  tasks: [
    {
      id: 't_1',
      title: 'Find Footage & Selects',
      project_id: 'proj_1',
      stage: 'Editing',
      completed: false,
      order_index: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 't_2',
      title: 'Write Script & Bullet Outline',
      project_id: 'proj_1',
      stage: 'Editing',
      completed: false,
      order_index: 2,
      created_at: new Date().toISOString()
    },
    {
      id: 't_3',
      title: 'Find Reference Examples & Sound Assets',
      project_id: 'proj_1',
      stage: 'Editing',
      completed: false,
      order_index: 3,
      created_at: new Date().toISOString()
    }
  ],
  blockers: [],
  time_logs: [],
  before_after_entries: [],
  content_items: [
    {
      id: 'cont_1',
      title: 'How I Cut 2 Hours Off My Edit Time (Short)',
      platforms: ['Instagram', 'TikTok'],
      status: 'Planning',
      content_type: 'Short Form',
      main_idea: 'Editing workflow speed tips',
      hook: 'Cut 2 hours off your Premiere timeline in 3 clicks.',
      hours_invested: 1.5,
      scheduled_date: '2026-08-23',
      views: 0,
      likes: 0,
      saves: 0,
      created_at: new Date().toISOString()
    }
  ],
  clients: [
    {
      id: 'cli_1',
      name: 'Peak Energy Labs',
      contact_method: 'Instagram DM',
      status: 'Discussion',
      contact_date: '2026-08-15',
      follow_up_date: '2026-08-22',
      potential_project: '3x Product Launch Reels ($1,200)',
      revenue: 1200,
      notes: 'Client loved the sound design sample. Sending contract draft on Friday.',
      created_at: new Date().toISOString()
    }
  ],
  development_logs: [
    {
      id: 'log_1',
      date: new Date().toISOString().split('T')[0],
      project_id: 'proj_1',
      title: 'Initialized Editor OS System',
      comment: 'Sprint Cycle started. Ready for focused execution.',
      is_strategy_change: false,
      created_at: new Date().toISOString()
    }
  ],
  knowledge_entries: [],
  reference_items: [],
  quick_ideas: [],
  wins: [],
  reports: [],
  comments: []
};

export function getLocalDb(): LocalDatabaseSchema {
  if (typeof window === 'undefined') return initialDefaultDatabase;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.settings && parsed.categories) {
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

  const primaryCategories = db.categories.filter((c) => !c.parent_id);
  const categoryProgress = primaryCategories.map((cat) => {
    const subcats = db.categories.filter((c) => c.parent_id === cat.id);
    const subcatIds = [cat.id, ...subcats.map((s) => s.id)];
    const catTasks = allTasks.filter((t) => t.category_id && subcatIds.includes(t.category_id));
    const catDone = catTasks.filter((t) => t.completed).length;
    const progressPercent = catTasks.length > 0 ? Math.round((catDone / catTasks.length) * 100) : 0;
    const activeProjectsCount = db.projects.filter((p) => p.category_id && subcatIds.includes(p.category_id)).length;

    return {
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      status: cat.status,
      totalTasks: catTasks.length,
      completedTasks: catDone,
      progressPercent,
      activeProjectsCount,
      nextAction: cat.next_action || (subcats.length > 0 ? subcats[0].next_action : null)
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

  const activeBlockers = db.blockers.filter((b) => b.active).map((b) => {
    const proj = db.projects.find((p) => p.id === b.related_entity_id);
    return {
      ...b,
      entityTitle: proj ? proj.name : 'Unknown Project'
    };
  });

  const todayTasks = allTasks.filter((t) => !t.completed).slice(0, 5);

  const upcomingDeadlines: Array<{
    id: string;
    title: string;
    type: 'Project' | 'Task' | 'Content';
    date: string;
    isOverdue: boolean;
  }> = [];

  activeProjects.forEach((p) => {
    if (p.deadline) {
      upcomingDeadlines.push({
        id: p.id,
        title: p.name,
        type: 'Project',
        date: p.deadline,
        isOverdue: p.deadline < todayStr
      });
    }
  });

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
