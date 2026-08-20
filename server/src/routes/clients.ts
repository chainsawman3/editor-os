import { Router } from 'express';
import { getDb, mutateDb, Client } from '../db.js';

export const clientsRouter = Router();

clientsRouter.get('/', (req, res) => {
  const db = getDb();
  const todayStr = new Date().toISOString().split('T')[0];

  const enrichedClients = db.clients.map((c) => {
    const isFollowUpDue = c.follow_up_date && c.follow_up_date <= todayStr && c.status !== 'Completed';
    return {
      ...c,
      isFollowUpDue: !!isFollowUpDue
    };
  });

  const totalRevenue = db.clients
    .filter((c) => c.status === 'Client' || c.status === 'Completed')
    .reduce((acc, curr) => acc + (curr.revenue || 0), 0);

  const potentialRevenue = db.clients
    .filter((c) => c.status === 'Discussion' || c.status === 'Replied' || c.status === 'Lead')
    .reduce((acc, curr) => acc + (curr.revenue || 0), 0);

  res.json({
    clients: enrichedClients,
    stats: {
      totalRevenue,
      potentialRevenue,
      totalLeads: db.clients.length
    }
  });
});

clientsRouter.post('/', (req, res) => {
  const {
    name,
    contact_method = 'Email',
    status = 'Lead',
    contact_date = new Date().toISOString().split('T')[0],
    follow_up_date = null,
    potential_project = '',
    revenue = 0,
    notes = ''
  } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Client name is required' });
  }

  const newClient: Client = {
    id: `cli_${Date.now()}`,
    name,
    contact_method,
    status,
    contact_date,
    follow_up_date,
    potential_project,
    revenue: Number(revenue) || 0,
    notes,
    created_at: new Date().toISOString()
  };

  mutateDb((db) => {
    db.clients.push(newClient);
  });

  res.status(201).json(newClient);
});

clientsRouter.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  let updated: Client | null = null;
  mutateDb((db) => {
    const idx = db.clients.findIndex((c) => c.id === id);
    if (idx !== -1) {
      db.clients[idx] = { ...db.clients[idx], ...updates };
      updated = db.clients[idx];
    }
  });

  if (!updated) {
    return res.status(404).json({ error: 'Client not found' });
  }

  res.json(updated);
});

clientsRouter.delete('/:id', (req, res) => {
  const { id } = req.params;

  mutateDb((db) => {
    db.clients = db.clients.filter((c) => c.id !== id);
  });

  res.json({ success: true });
});
