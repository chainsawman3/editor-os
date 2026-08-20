import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbFilePath = path.join(dataDir, 'editor_os.json');

export interface Settings {
  id: number;
  cycle_start_date: string;
  cycle_duration_days: number;
  streak_days?: number;
  user_name: string;
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
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  target_date?: string | null;
  status: string;
  category_id?: string | null;
  next_action?: string | null;
  notes?: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  type: 'Portfolio' | 'Client' | 'Personal' | 'Learning' | 'Content';
  category_id?: string | null;
  status: 'Planning' | 'In Progress' | 'Paused' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  health_status: 'On Track' | 'At Risk' | 'Blocked' | 'Overdue';
  start_date?: string | null;
  deadline?: string | null;
  description?: string;
  expected_difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme';
  actual_difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Extreme' | null;
  next_action?: string | null;
  final_output_url?: string;
  lessons_learned?: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  project_id?: string | null;
  category_id?: string | null;
  stage?: string | null;
  due_date?: string | null;
  completed: boolean;
  completed_at?: string | null;
  order_index: number;
  created_at: string;
}

export interface Blocker {
  id: string;
  related_entity_type: 'project' | 'category' | 'goal' | 'task';
  related_entity_id: string;
  description: string;
  active: boolean;
  created_at: string;
  resolved_at?: string | null;
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
  structure?: string;
  required_footage?: string;
  caption?: string;
  hashtags?: string;
  scheduled_date?: string | null;
  project_id?: string | null;
  draft_url?: string;
  thumbnail_url?: string;
  hours_invested?: number;
  views?: number;
  likes?: number;
  saves?: number;
  shares?: number;
  comments?: number;
  notes?: string;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  contact_method?: string;
  status: 'Lead' | 'Contacted' | 'Replied' | 'Discussion' | 'Client' | 'Completed';
  contact_date?: string;
  follow_up_date?: string | null;
  potential_project?: string;
  revenue?: number;
  notes?: string;
  created_at: string;
}

export interface DevelopmentLog {
  id: string;
  date: string;
  category_id?: string | null;
  project_id?: string | null;
  title: string;
  comment: string;
  attachment_url?: string;
  is_strategy_change: boolean;
  old_strategy?: string;
  new_strategy?: string;
  change_reason?: string;
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

export interface QuickIdea {
  id: string;
  text: string;
  captured_at: string;
  target_category?: string | null;
  triaged: boolean;
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
  problems_encountered?: string;
  what_learned?: string;
  next_priorities?: string;
  biggest_win?: string;
  biggest_problem?: string;
  created_at: string;
}

export interface Comment {
  id: string;
  related_entity_type: 'project' | 'category' | 'goal' | 'content';
  related_entity_id: string;
  text: string;
  author: string;
  created_at: string;
}

export interface DatabaseSchema {
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
  comments: Comment[];
}

const defaultDatabase: DatabaseSchema = {
  settings: [],
  categories: [],
  goals: [],
  projects: [],
  tasks: [],
  blockers: [],
  time_logs: [],
  before_after_entries: [],
  content_items: [],
  clients: [],
  development_logs: [],
  knowledge_entries: [],
  reference_items: [],
  quick_ideas: [],
  wins: [],
  reports: [],
  comments: []
};

let memoryDb: DatabaseSchema = { ...defaultDatabase };

export function loadDatabase(): DatabaseSchema {
  if (fs.existsSync(dbFilePath)) {
    try {
      const content = fs.readFileSync(dbFilePath, 'utf-8');
      memoryDb = JSON.parse(content);
      return memoryDb;
    } catch (e) {
      console.error('Error reading database file, initializing fallback:', e);
    }
  }
  saveDatabase(defaultDatabase);
  return memoryDb;
}

export function saveDatabase(data: DatabaseSchema) {
  memoryDb = data;
  const tempPath = `${dbFilePath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, dbFilePath);
}

export function getDb(): DatabaseSchema {
  return memoryDb;
}

export function mutateDb(mutator: (db: DatabaseSchema) => void): DatabaseSchema {
  mutator(memoryDb);
  saveDatabase(memoryDb);
  return memoryDb;
}
