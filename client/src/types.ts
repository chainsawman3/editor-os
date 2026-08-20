export interface Settings {
  id: number;
  cycle_start_date: string;
  cycle_duration_days: number;
  streak_days?: number;
  user_name: string;
  created_at: string;
}

export type SectionType = 'video_editing' | 'marketing' | 'freelance' | 'skills';
export type MarketingPlatform = 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'fiverr';
export type ProjectPriority = 'Low' | 'Medium' | 'Hard' | 'High' | 'Easy' | 'Extreme';
export type ProjectStatus = 'Planning' | 'In Progress' | 'Ready' | 'Posted' | 'Paused' | 'Completed';
export type ClientStatus = 'Contacted' | 'Ignored' | 'Agreed' | 'Client' | 'Completed' | 'Lead' | 'Replied' | 'Discussion';

export interface Goal {
  id: string;
  section: SectionType;
  sub_section?: MarketingPlatform | string | null;
  category_id?: string | null;
  categoryName?: string;
  title: string;
  description?: string;
  target_date?: string | null;
  priority?: 'Low' | 'Medium' | 'High';
  status: string;
  next_action?: string | null;
  notes?: string;
  created_at: string;
}

export interface ProjectReference {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'image' | 'link';
  notes?: string;
}

export interface Project {
  id: string;
  goal_id?: string | null;
  section: SectionType;
  sub_section?: MarketingPlatform | string | null;
  name: string;
  description?: string;
  priority: ProjectPriority;
  deadline?: string | null;
  client_name?: string;
  status: ProjectStatus;
  health_status?: 'On Track' | 'At Risk' | 'Blocked' | 'Overdue';
  start_date?: string | null;
  script_content?: string;
  references?: ProjectReference[];
  creative_ideas?: string[];
  next_action?: string | null;
  final_output_url?: string;
  lessons_learned?: string;
  created_at: string;
  category_id?: string | null;
  categoryName?: string;
  expected_difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Extreme';
  actual_difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Extreme' | null;
  type?: string;
  totalTasks?: number;
  completedTasks?: number;
  progressPercent?: number;
  totalHours?: number;
  isOverdue?: boolean;
}

export interface Task {
  id: string;
  title: string;
  project_id?: string | null;
  goal_id?: string | null;
  category_id?: string | null;
  stage?: string | null;
  due_date?: string | null;
  completed: boolean;
  completed_at?: string | null;
  order_index: number;
  created_at: string;
  projectName?: string;
  goalTitle?: string;
}

export interface Client {
  id: string;
  name: string;
  contact_method?: string;
  status: ClientStatus;
  priority?: 'Low' | 'Medium' | 'High';
  contact_date?: string;
  follow_up_date?: string | null;
  deadline?: string | null;
  linked_project_id?: string | null;
  linkedProjectName?: string;
  potential_project?: string;
  revenue?: number;
  notes?: string;
  created_at: string;
  isFollowUpDue?: boolean;
}

export interface QuickIdea {
  id: string;
  text: string;
  captured_at: string;
  target_section?: SectionType | string;
  target_category?: string | null;
  triaged: boolean;
  converted_to_type?: 'project' | 'goal' | 'task' | null;
  converted_entity_id?: string | null;
  created_at: string;
}

export interface DevelopmentLog {
  id: string;
  date: string;
  section?: SectionType;
  category_id?: string | null;
  categoryName?: string | null;
  project_id?: string | null;
  projectName?: string | null;
  title: string;
  comment: string;
  is_strategy_change: boolean;
  old_strategy?: string;
  new_strategy?: string;
  change_reason?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  status: string;
  parent_id: string | null;
  order_index: number;
  next_action?: string | null;
  created_at: string;
  totalTasks?: number;
  completedTasks?: number;
  progressPercent?: number;
  linkedProjectsCount?: number;
}

export interface Blocker {
  id: string;
  related_entity_type: 'project' | 'category' | 'goal' | 'task';
  related_entity_id: string;
  description: string;
  active: boolean;
  created_at: string;
  resolved_at?: string | null;
  entityTitle?: string;
}

export interface TimeLog {
  id: string;
  project_id: string;
  stage: string;
  hours: number;
  date: string;
  notes?: string;
  created_at: string;
}

export interface BeforeAfterEntry {
  id: string;
  project_id: string;
  before_title: string;
  before_url?: string;
  after_title: string;
  after_url?: string;
  improvements_notes?: string;
  created_at: string;
}

export interface ContentItem {
  id: string;
  title: string;
  platforms: string[];
  status: 'Idea' | 'Planning' | 'In Progress' | 'Ready' | 'Posted';
  content_type: string;
  main_idea?: string;
  hook?: string;
  scheduled_date?: string | null;
  project_id?: string | null;
  hours_invested?: number;
  views?: number;
  likes?: number;
  saves?: number;
  created_at: string;
}

export interface KnowledgeEntry {
  id: string;
  category: string;
  title: string;
  description: string;
  when_to_use?: string;
  notes?: string;
  linked_project_id?: string | null;
  linkedProjectName?: string | null;
  created_at: string;
}

export interface ReferenceItem {
  id: string;
  title: string;
  link: string;
  category: string;
  platform?: string;
  why_saved: string;
  what_to_learn: string;
  created_at: string;
}

export interface Win {
  id: string;
  title: string;
  date: string;
  description?: string;
  category?: string;
  created_at: string;
}

export interface Report {
  id: string;
  type: 'weekly' | 'monthly' | 'milestone_30' | 'milestone_60' | 'milestone_90';
  period_start?: string;
  period_end?: string;
  milestone_day?: number;
  metrics_json: Record<string, any>;
  what_worked?: string;
  what_failed?: string;
  what_learned?: string;
  next_priorities?: string;
  created_at: string;
}

export interface DashboardSummaryResponse {
  summary: {
    cycleDay: number;
    cycleTotalDays: number;
    cycleStartDate: string;
    overallProgress: number;
    streakDays: number;
    activeProjectsCount: number;
    overdueTasksCount: number;
    nextUpcomingDeadline: {
      id: string;
      title: string;
      type: 'Goal' | 'Project' | 'Task' | 'Content';
      date: string;
      isOverdue: boolean;
    } | null;
  };
  categoryProgress: Array<{
    id: string;
    name: string;
    icon: string;
    status: string;
    totalTasks: number;
    completedTasks: number;
    progressPercent: number;
    activeProjectsCount: number;
    nextAction?: string | null;
  }>;
  nextActions: Array<{
    id: string;
    entityType: 'project' | 'category' | 'goal';
    entityId: string;
    entityTitle: string;
    text: string;
  }>;
  activeBlockers: Array<Blocker & { entityTitle: string }>;
  todayTasks: Task[];
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    type: 'Goal' | 'Project' | 'Task';
    date: string;
    isOverdue: boolean;
  }>;
  recentActivities: Array<{
    id: string;
    text: string;
    date: string;
    type: string;
  }>;
}
