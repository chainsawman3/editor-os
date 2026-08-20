import express from 'express';
import cors from 'cors';
import { seedDb } from './seed.js';

import { summaryRouter } from './routes/summary.js';
import { projectsRouter } from './routes/projects.js';
import { categoriesRouter } from './routes/categories.js';
import { goalsRouter } from './routes/goals.js';
import { tasksRouter } from './routes/tasks.js';
import { contentRouter } from './routes/content.js';
import { clientsRouter } from './routes/clients.js';
import { logsRouter } from './routes/logs.js';
import { knowledgeRouter } from './routes/knowledge.js';
import { referencesRouter } from './routes/references.js';
import { inboxRouter } from './routes/inbox.js';
import { winsRouter } from './routes/wins.js';
import { reportsRouter } from './routes/reports.js';
import { analyticsRouter } from './routes/analytics.js';
import { settingsRouter } from './routes/settings.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize & Seed Database
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
  res.json({ status: 'ok', version: '2.0.0', system: 'Editor OS' });
});

app.listen(PORT, () => {
  console.log(`⚡ Editor OS Backend Server listening on http://localhost:${PORT}`);
});
