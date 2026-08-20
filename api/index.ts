import express from 'express';
import cors from 'cors';
import { seedDb } from '../server/src/seed';

import { summaryRouter } from '../server/src/routes/summary';
import { projectsRouter } from '../server/src/routes/projects';
import { categoriesRouter } from '../server/src/routes/categories';
import { goalsRouter } from '../server/src/routes/goals';
import { tasksRouter } from '../server/src/routes/tasks';
import { contentRouter } from '../server/src/routes/content';
import { clientsRouter } from '../server/src/routes/clients';
import { logsRouter } from '../server/src/routes/logs';
import { knowledgeRouter } from '../server/src/routes/knowledge';
import { referencesRouter } from '../server/src/routes/references';
import { inboxRouter } from '../server/src/routes/inbox';
import { winsRouter } from '../server/src/routes/wins';
import { reportsRouter } from '../server/src/routes/reports';
import { analyticsRouter } from '../server/src/routes/analytics';
import { settingsRouter } from '../server/src/routes/settings';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Seed on startup
try {
  seedDb();
} catch (err) {
  console.error('Seed error:', err);
}

// Register API Routes
app.use('/api/summary', summaryRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/content', contentRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/logs', logsRouter);
app.use('/api/knowledge', knowledgeRouter);
app.use('/api/references', referencesRouter);
app.use('/api/inbox', inboxRouter);
app.use('/api/wins', winsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/settings', settingsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0', system: 'Editor OS', env: 'vercel' });
});

export default function handler(req: any, res: any) {
  return app(req, res);
}
