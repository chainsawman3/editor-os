import express from 'express';
import cors from 'cors';
import { seedDb } from '../server/src/seed.js';

import { summaryRouter } from '../server/src/routes/summary.js';
import { projectsRouter } from '../server/src/routes/projects.js';
import { categoriesRouter } from '../server/src/routes/categories.js';
import { goalsRouter } from '../server/src/routes/goals.js';
import { tasksRouter } from '../server/src/routes/tasks.js';
import { contentRouter } from '../server/src/routes/content.js';
import { clientsRouter } from '../server/src/routes/clients.js';
import { logsRouter } from '../server/src/routes/logs.js';
import { knowledgeRouter } from '../server/src/routes/knowledge.js';
import { referencesRouter } from '../server/src/routes/references.js';
import { inboxRouter } from '../server/src/routes/inbox.js';
import { winsRouter } from '../server/src/routes/wins.js';
import { reportsRouter } from '../server/src/routes/reports.js';
import { analyticsRouter } from '../server/src/routes/analytics.js';
import { settingsRouter } from '../server/src/routes/settings.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Seed on startup
seedDb();

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

export default app;
