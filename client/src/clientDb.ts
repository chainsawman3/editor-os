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

const STORAGE_KEY = 'editor_os_local_db_v2';

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
  goals: [
    {
      id: 'goal_portfolio_update',
      section: 'video_editing',
      sub_section: null,
      title: 'PORTFOLIO UPDATE (2026)',
      description: 'Create 3 ultra-high retention spec commercials and 2 podcast talking-head cuts to land premium $1,500+ clients.',
      target_date: in14DaysStr,
      priority: 'High',
      status: 'In Progress',
      next_action: 'Finalize sound design & kinetic captions on Talking Head AD',
      notes: 'Focus on aggressive pacing, sound effects on cuts, and color accuracy.',
      created_at: new Date().toISOString()
    },
    {
      id: 'goal_insta_viral',
      section: 'marketing',
      sub_section: 'instagram',
      title: 'Instagram Before/After Growth Sprint',
      description: 'Publish 10 high-value video editing workflow transformations to gain 5,000 targeted followers.',
      target_date: in7DaysStr,
      priority: 'Medium',
      status: 'In Progress',
      next_action: 'Record screen-record workflow in DaVinci Resolve',
      created_at: new Date().toISOString()
    },
    {
      id: 'goal_youtube_pack',
      section: 'marketing',
      sub_section: 'youtube',
      title: 'YouTube Creator Outbound Package',
      description: 'Build targeted retention edits for top creators and reach out with personalized samples.',
      target_date: in14DaysStr,
      priority: 'High',
      status: 'In Progress',
      next_action: 'Prepare 3 sample hooks with visual sound redesign',
      created_at: new Date().toISOString()
    },
    {
      id: 'goal_freelance_4k',
      section: 'freelance',
      sub_section: null,
      title: 'Scale Outbound CRM to $4,000/mo',
      description: 'Contact 20 high-fit creators/brands weekly, convert at least 3 into recurring monthly retainers.',
      target_date: in14DaysStr,
      priority: 'High',
      status: 'In Progress',
      next_action: 'Follow up with Sophie Davis on sample reel proposal',
      created_at: new Date().toISOString()
    },
    {
      id: 'goal_skills_3d',
      section: 'skills',
      sub_section: null,
      title: 'Master 3D Camera Tracking & Unreal Engine Projections',
      description: 'Integrate 3D typography into live footage to offer high-end commercial VFX packages.',
      target_date: in14DaysStr,
      priority: 'Medium',
      status: 'In Progress',
      next_action: 'Complete After Effects 3D Camera solver tutorial #4',
      created_at: new Date().toISOString()
    }
  ],
  projects: [
    {
      id: 'proj_talking_head_ad',
      goal_id: 'goal_portfolio_update',
      section: 'video_editing',
      sub_section: null,
      name: 'Talking Head - AD',
      description: 'Fast-paced talking head commercial spec for Apex Fitness featuring zooms, graphic popups, and sound design hits.',
      priority: 'Hard',
      deadline: in3DaysStr,
      client_name: 'Apex Gym & Fitness (David Miller)',
      status: 'In Progress',
      health_status: 'On Track',
      start_date: todayStr,
      script_content: `[HOOK - 0:00 - 0:03]
(Visual: Aggressive crash zoom onto speaker holding shaker bottle)
(Audio: Sub bass drop + camera shutter hit)
VOICEOVER: "Stop wasting 2 hours in the gym doing workouts that give zero results."

[PROBLEM - 0:03 - 0:09]
(Visual: Fast jump cuts with red highlight text overlays: "Overworking", "Wrong Splits")
(Audio: Fast ticking clock + glitch transition)
VOICEOVER: "Most people fail not because of lack of effort, but because their split is completely broken."

[SOLUTION & DEMO - 0:09 - 0:20]
(Visual: Cinematic slow-motion workout footage with clean DaVinci color grade & glowing muscle HUD)
(Audio: Heavy synth wave riser into punchy drop)
VOICEOVER: "Here is the exact 4-day compound split designed by Olympic trainers to build lean muscle in half the time."

[CALL TO ACTION - 0:20 - 0:30]
(Visual: Floating 3D phone mockup showing the Apex app + download link button pulsing)
(Audio: Satisfying chime + whoosh sound)
VOICEOVER: "Download the complete routine free at the link below. Start today."`,
      references: [
        {
          id: 'ref_1',
          title: 'Nike Fast Paced Edit Reference',
          url: 'https://youtube.com/watch?v=sample1',
          type: 'video',
          notes: 'Notice the 0.4s cut rhythm and match cuts on beat.'
        },
        {
          id: 'ref_2',
          title: 'Cinematic Gym Lighting Moodboard',
          url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
          type: 'image',
          notes: 'High contrast teal and orange rim lighting.'
        }
      ],
      creative_ideas: [
        'Add camera shake on every heavy dumbbell hit',
        'Use floating kinetic typography synced to voice emphasis words',
        'Speed ramp the bench press rep from 50% to 200%'
      ],
      next_action: 'Fine-tune sound design layers (whooshes, risers, impacts)',
      final_output_url: '',
      lessons_learned: '',
      created_at: new Date().toISOString()
    },
    {
      id: 'proj_podcast_highlight',
      goal_id: 'goal_portfolio_update',
      section: 'video_editing',
      sub_section: null,
      name: 'Tech Podcast Micro-Reel',
      description: 'High energy clip with AI subtitles, b-roll overlays, and sound design for Spotify podcast.',
      priority: 'Medium',
      deadline: in5DaysStr,
      client_name: 'Mark K. (Tech Podcast)',
      status: 'Planning',
      health_status: 'On Track',
      script_content: `[HOOK]
"This one AI tool will replace 80% of junior video editing by 2027."

[BREAKDOWN]
Show Runway Gen-3 screen recording and comparison.

[CTA]
Full episode on Spotify link.`,
      references: [],
      creative_ideas: ['Use split screen comparison', 'Include audio wave visualizer'],
      created_at: new Date().toISOString()
    },
    {
      id: 'proj_insta_reel_1',
      goal_id: 'goal_insta_viral',
      section: 'marketing',
      sub_section: 'instagram',
      name: 'Before/After Sound Design Reel #1',
      description: 'Show raw audio vs 7 layers of sound design for high viral engagement.',
      priority: 'Medium',
      deadline: in7DaysStr,
      client_name: 'Self Brand',
      status: 'Planning',
      health_status: 'On Track',
      script_content: 'Turn up your volume: Raw Audio vs Final Sound Mix.',
      references: [],
      creative_ideas: ['Add waveform animation at the bottom'],
      created_at: new Date().toISOString()
    },
    {
      id: 'proj_yt_creator_pitch',
      goal_id: 'goal_youtube_pack',
      section: 'marketing',
      sub_section: 'youtube',
      name: 'Sophie Davis Retention Hook Spec',
      description: 'Re-edited 60 seconds of creator footage with retention graph optimization.',
      priority: 'Hard',
      deadline: in3DaysStr,
      client_name: 'Sophie Davis',
      status: 'In Progress',
      health_status: 'On Track',
      script_content: 'Custom pitch edit showcasing 3x pacing speed.',
      references: [],
      creative_ideas: [],
      created_at: new Date().toISOString()
    },
    {
      id: 'proj_skills_camera_tracker',
      goal_id: 'goal_skills_3d',
      section: 'skills',
      sub_section: null,
      name: '3D Cyberpunk City Text Track Practice',
      description: 'Practice complex moving camera solve and shadow cast rendering.',
      priority: 'Low',
      deadline: in14DaysStr,
      client_name: 'Internal Learning',
      status: 'Ready',
      health_status: 'On Track',
      script_content: '',
      references: [],
      creative_ideas: [],
      created_at: new Date().toISOString()
    }
  ],
  tasks: [
    {
      id: 'task_1',
      project_id: 'proj_talking_head_ad',
      title: 'Cut rough sequence & remove pauses',
      stage: 'Editing',
      due_date: todayStr,
      completed: true,
      order_index: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'task_2',
      project_id: 'proj_talking_head_ad',
      title: 'Add kinetic captions & zoom punch-ins',
      stage: 'Editing',
      due_date: todayStr,
      completed: false,
      order_index: 2,
      created_at: new Date().toISOString()
    },
    {
      id: 'task_3',
      project_id: 'proj_talking_head_ad',
      title: 'Layer sound design (risers, whooshes, sub hits)',
      stage: 'Sound Design',
      due_date: in3DaysStr,
      completed: false,
      order_index: 3,
      created_at: new Date().toISOString()
    },
    {
      id: 'task_4',
      project_id: 'proj_talking_head_ad',
      title: 'DaVinci Resolve color grade & export master 4K',
      stage: 'Export',
      due_date: in3DaysStr,
      completed: false,
      order_index: 4,
      created_at: new Date().toISOString()
    },
    {
      id: 'task_5',
      project_id: 'proj_yt_creator_pitch',
      title: 'Cut 30-sec retention hook sample for Sophie Davis',
      stage: 'Editing',
      due_date: todayStr,
      completed: false,
      order_index: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'task_6',
      project_id: 'proj_podcast_highlight',
      title: 'Select best 45-second soundbite from episode #12',
      stage: 'Editing',
      due_date: in5DaysStr,
      completed: false,
      order_index: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'task_7',
      project_id: 'proj_insta_reel_1',
      title: 'Record DaVinci Resolve screen timelapse',
      stage: 'Filming',
      due_date: in7DaysStr,
      completed: false,
      order_index: 1,
      created_at: new Date().toISOString()
    }
  ],
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
  comments: []
};

export function getLocalDb(): LocalDatabaseSchema {
  if (typeof window === 'undefined') return initialDefaultDatabase;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.projects && parsed.goals) {
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
