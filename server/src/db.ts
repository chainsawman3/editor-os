import fs from 'fs';
import path from 'path';

const dataDir = process.env.VERCEL ? '/tmp' : path.resolve(process.cwd(), 'server/data');
try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
} catch (e) {
  // Ignored in serverless env
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

import { MongoClient } from 'mongodb';
import pg from 'pg';
const { Pool } = pg;

let memoryDb: DatabaseSchema;

const mongoUri = process.env.MONGODB_URI;
let mongoClient: MongoClient | null = null;

const postgresUri = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL;
let pgPool: pg.Pool | null = null;

async function getPgPool() {
  if (!postgresUri) return null;
  try {
    if (!pgPool) {
      pgPool = new Pool({
        connectionString: postgresUri,
        ssl: { rejectUnauthorized: false }
      });
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS editor_os_state (
          id VARCHAR(50) PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
    }
    return pgPool;
  } catch (err) {
    console.error('⚠️ PostgreSQL connection error, falling back to local file/memory:', err);
    return null;
  }
}

async function getMongoCollection() {
  if (!mongoUri) return null;
  try {
    if (!mongoClient) {
      mongoClient = new MongoClient(mongoUri);
      await mongoClient.connect();
    }
    const db = mongoClient.db('editor_os_db');
    return db.collection('app_state');
  } catch (err) {
    console.error('⚠️ MongoDB connection error, falling back to local file/memory:', err);
    return null;
  }
}

export async function syncFromCloud(): Promise<DatabaseSchema | null> {
  // 1. PostgreSQL (Supabase / Neon / Vercel Postgres)
  if (postgresUri) {
    const pool = await getPgPool();
    if (pool) {
      try {
        const res = await pool.query('SELECT data FROM editor_os_state WHERE id = $1', ['active_db']);
        if (res.rows.length > 0 && res.rows[0].data) {
          memoryDb = res.rows[0].data as DatabaseSchema;
          return memoryDb;
        } else if (memoryDb && memoryDb.settings && memoryDb.settings.length > 0) {
          await pool.query(
            'INSERT INTO editor_os_state (id, data, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = NOW()',
            ['active_db', JSON.stringify(memoryDb)]
          );
        }
      } catch (e) {
        console.error('Error syncing from PostgreSQL:', e);
      }
    }
  }

  // 2. MongoDB Atlas
  if (mongoUri) {
    const collection = await getMongoCollection();
    if (collection) {
      try {
        const doc = await collection.findOne({ _id: 'active_db' as any });
        if (doc && doc.data) {
          memoryDb = doc.data as DatabaseSchema;
          return memoryDb;
        } else if (memoryDb && memoryDb.settings && memoryDb.settings.length > 0) {
          await collection.updateOne(
            { _id: 'active_db' as any },
            { $set: { data: memoryDb, updated_at: new Date().toISOString() } },
            { upsert: true }
          );
        }
      } catch (e) {
        console.error('Error syncing from MongoDB:', e);
      }
    }
  }

  return null;
}

export async function syncToCloud(data: DatabaseSchema) {
  if (postgresUri) {
    const pool = await getPgPool();
    if (pool) {
      try {
        await pool.query(
          'INSERT INTO editor_os_state (id, data, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = NOW()',
          ['active_db', JSON.stringify(data)]
        );
      } catch (e) {
        console.error('Error syncing to PostgreSQL:', e);
      }
    }
  }

  if (mongoUri) {
    const collection = await getMongoCollection();
    if (collection) {
      try {
        await collection.updateOne(
          { _id: 'active_db' as any },
          { $set: { data, updated_at: new Date().toISOString() } },
          { upsert: true }
        );
      } catch (e) {
        console.error('Error syncing to MongoDB:', e);
      }
    }
  }
}

export function loadDatabase(): DatabaseSchema {
  if (fs.existsSync(dbFilePath)) {
    try {
      const content = fs.readFileSync(dbFilePath, 'utf-8');
      memoryDb = JSON.parse(content);
    } catch (e) {
      console.error('Error reading database file, initializing fallback:', e);
    }
  } else {
    saveDatabase(defaultDatabase);
  }

  if (postgresUri || mongoUri) {
    syncFromCloud().catch(() => {});
  }

  return memoryDb;
}

export function saveDatabase(data: DatabaseSchema) {
  memoryDb = data;
  try {
    const tempPath = `${dbFilePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, dbFilePath);
  } catch (err) {
    // In serverless/read-only environment, memoryDb persists during execution
  }

  if (postgresUri || mongoUri) {
    syncToCloud(data).catch(() => {});
  }
}

export function getDb(): DatabaseSchema {
  return memoryDb;
}

export function mutateDb(mutator: (db: DatabaseSchema) => void): DatabaseSchema {
  mutator(memoryDb);
  saveDatabase(memoryDb);
  return memoryDb;
}
