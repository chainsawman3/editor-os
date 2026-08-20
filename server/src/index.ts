import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { seedDb } from './seed';

import { summaryRouter } from './routes/summary';
import { projectsRouter } from './routes/projects';
import { categoriesRouter } from './routes/categories';
import { goalsRouter } from './routes/goals';
import { tasksRouter } from './routes/tasks';
import { contentRouter } from './routes/content';
import { clientsRouter } from './routes/clients';
import { logsRouter } from './routes/logs';
import { knowledgeRouter } from './routes/knowledge';
import { referencesRouter } from './routes/references';
import { inboxRouter } from './routes/inbox';
import { winsRouter } from './routes/wins';
import { reportsRouter } from './routes/reports';
import { analyticsRouter } from './routes/analytics';
import { settingsRouter } from './routes/settings';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize & Seed Database
try {
  seedDb();
} catch (e) {
  console.error('Seed error:', e);
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
  res.json({ status: 'ok', version: '2.0.0', system: 'Editor OS' });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`⚡ Editor OS Backend Server listening on http://localhost:${PORT}`);
  });
}

export default app;
