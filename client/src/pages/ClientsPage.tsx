import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Client } from '../types';
import {
  Briefcase,
  Plus,
  Trash2,
  Edit2
} from 'lucide-react';

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<any>({ totalRevenue: 0, potentialRevenue: 0, totalLeads: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [contactMethod, setContactMethod] = useState('Email');
  const [status, setStatus] = useState<any>('Lead');
  const [contactDate, setContactDate] = useState(new Date().toISOString().split('T')[0]);
  const [followUpDate, setFollowUpDate] = useState('');
  const [potentialProject, setPotentialProject] = useState('');
  const [revenue, setRevenue] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const loadClients = async () => {
    try {
      const res = await api.getClients();
      setClients(res.clients);
      setStats(res.stats);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const openCreateModal = () => {
    setEditingClient(null);
    setName('');
    setContactMethod('Email');
    setStatus('Lead');
    setContactDate(new Date().toISOString().split('T')[0]);
    setFollowUpDate('');
    setPotentialProject('');
    setRevenue(0);
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (c: Client) => {
    setEditingClient(c);
    setName(c.name);
    setContactMethod(c.contact_method || 'Email');
    setStatus(c.status);
    setContactDate(c.contact_date || new Date().toISOString().split('T')[0]);
    setFollowUpDate(c.follow_up_date || '');
    setPotentialProject(c.potential_project || '');
    setRevenue(c.revenue || 0);
    setNotes(c.notes || '');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      if (editingClient) {
        await api.updateClient(editingClient.id, {
          name,
          contact_method: contactMethod,
          status,
          contact_date: contactDate,
          follow_up_date: followUpDate || null,
          potential_project: potentialProject,
          revenue: Number(revenue) || 0,
          notes
        });
      } else {
        await api.createClient({
          name,
          contact_method: contactMethod,
          status,
          contact_date: contactDate,
          follow_up_date: followUpDate || null,
          potential_project: potentialProject,
          revenue: Number(revenue) || 0,
          notes
        });
      }
      setShowModal(false);
      loadClients();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStatus = async (c: Client, nextStatus: any) => {
    await api.updateClient(c.id, { status: nextStatus });
    loadClients();
  };

  const handleDelete = async (id: string) => {
    await api.deleteClient(id);
    loadClients();
  };

  const stages = ['Lead', 'Contacted', 'Replied', 'Discussion', 'Client', 'Completed'];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-zinc-100 uppercase">FREELANCE CLIENT & PIPELINE CRM</h2>
          <p className="text-xs text-zinc-400 font-sans">
            Track outreach, follow-ups, contract discussions, and revenue without bloated complexity.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-3.5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>NEW LEAD / CLIENT</span>
        </button>
      </div>

      {/* Revenue & Pipeline Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Closed Revenue</span>
          <div className="text-2xl font-bold text-zinc-100 mt-1">
            ${stats.totalRevenue?.toLocaleString() || 0}
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block">From signed clients</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Pipeline Potential</span>
          <div className="text-2xl font-bold text-zinc-300 mt-1">
            ${stats.potentialRevenue?.toLocaleString() || 0}
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block">In discussion / outreach</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Total Tracked Leads</span>
          <div className="text-2xl font-bold text-zinc-100 mt-1">{stats.totalLeads || 0}</div>
          <span className="text-[10px] text-zinc-400 mt-1 block">Across all channels</span>
        </div>
      </div>

      {/* Pipeline Stage Visual Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {stages.map((stg) => {
          const count = clients.filter((c) => c.status === stg).length;
          return (
            <div key={stg} className="bg-zinc-950 border border-zinc-800 p-3 rounded text-center space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">{stg}</span>
              <div className="text-base font-bold font-mono text-zinc-100">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Clients Table / List */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
            CLIENT CONTACT DIRECTORY ({clients.length})
          </h3>
        </div>

        <div className="divide-y divide-zinc-900">
          {clients.length === 0 ? (
            <p className="text-xs font-mono text-zinc-500 italic p-8 text-center">
              No clients or leads in pipeline. Add your first outreach contact above.
            </p>
          ) : (
            clients.map((c) => (
              <div
                key={c.id}
                className="p-4 hover:bg-zinc-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors text-xs"
              >
                {/* Client Info */}
                <div className="space-y-1 max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-100 text-sm">{c.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded">
                      {c.contact_method}
                    </span>
                    {c.isFollowUpDue && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-zinc-950 border border-zinc-400 text-zinc-100 font-bold rounded">
                        [!] FOLLOW UP DUE
                      </span>
                    )}
                  </div>
                  {c.potential_project && (
                    <p className="text-zinc-300 font-medium">{c.potential_project}</p>
                  )}
                  {c.notes && <p className="text-zinc-400 text-[11px] font-sans">{c.notes}</p>}
                </div>

                {/* Status and Actions */}
                <div className="flex flex-wrap items-center gap-3 font-mono">
                  <select
                    value={c.status}
                    onChange={(e) => handleAdvanceStatus(c, e.target.value)}
                    className="text-xs py-1 bg-zinc-900 text-zinc-200 border-zinc-800"
                  >
                    {stages.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <div className="text-zinc-200 font-bold w-20 text-right">
                    ${(c.revenue || 0).toLocaleString()}
                  </div>

                  <div className="text-zinc-400 text-[11px] w-24 text-right">
                    {c.follow_up_date ? `Follow: ${c.follow_up_date}` : 'No date'}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-1 text-zinc-500 hover:text-zinc-200"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1 text-zinc-500 hover:text-zinc-200"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CREATE / EDIT CLIENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-zinc-950 border border-zinc-700 w-full max-w-md rounded-lg shadow-2xl p-6 font-sans space-y-4">
            <h3 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">
              {editingClient ? 'EDIT CLIENT / LEAD RECORD' : 'NEW FREELANCE LEAD'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-mono text-zinc-400 block mb-1">Business / Creator Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Fitness Apparel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Contact Method</label>
                  <select
                    value={contactMethod}
                    onChange={(e) => setContactMethod(e.target.value)}
                    className="w-full text-xs"
                  >
                    <option value="Email">Email</option>
                    <option value="Instagram DM">Instagram DM</option>
                    <option value="Upwork">Upwork</option>
                    <option value="Fiverr">Fiverr</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>

                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Pipeline Stage</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full text-xs">
                    {stages.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Potential / Agreed Revenue ($)</label>
                  <input
                    type="number"
                    value={revenue}
                    onChange={(e) => setRevenue(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs"
                  />
                </div>

                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Follow-Up Date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-zinc-400 block mb-1">Potential Project Scope</label>
                <input
                  type="text"
                  placeholder="e.g. 3x Product Launch Reels ($1,200)"
                  value={potentialProject}
                  onChange={(e) => setPotentialProject(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="font-mono text-zinc-400 block mb-1">Notes & Interaction Log</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Sent personalized video audit. Follow up on proposal."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-900 font-mono">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="px-4 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded font-bold"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
