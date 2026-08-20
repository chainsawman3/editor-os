import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { ContentItem } from '../types';
import {
  FolderKanban,
  Plus,
  TrendingUp,
  Clock,
  Eye,
  Bookmark,
  Trash2,
  Edit2
} from 'lucide-react';

export const ContentStudioPage: React.FC = () => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [analytics, setAnalytics] = useState<any>({ totalContent: 0, postedCount: 0, totalHours: 0 });
  const [activeTab, setActiveTab] = useState<'kanban' | 'roi'>('kanban');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'Idea' | 'Planning' | 'In Progress' | 'Ready' | 'Posted'>('Idea');
  const [contentType, setContentType] = useState('Reel / Short');
  const [mainIdea, setMainIdea] = useState('');
  const [hook, setHook] = useState('');
  const [structure, setStructure] = useState('');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [hoursInvested, setHoursInvested] = useState<number>(1);
  const [views, setViews] = useState<number>(0);
  const [saves, setSaves] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const loadContent = async () => {
    try {
      const res = await api.getContent();
      setItems(res.items);
      setAnalytics(res.analytics);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle('');
    setStatus('Idea');
    setContentType('Reel / Short');
    setMainIdea('');
    setHook('');
    setStructure('');
    setCaption('');
    setHashtags('');
    setScheduledDate('');
    setHoursInvested(1);
    setViews(0);
    setSaves(0);
    setShowModal(true);
  };

  const openEditModal = (item: ContentItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setStatus(item.status);
    setContentType(item.content_type);
    setMainIdea(item.main_idea || '');
    setHook(item.hook || '');
    setStructure(item.structure || '');
    setCaption(item.caption || '');
    setHashtags(item.hashtags || '');
    setScheduledDate(item.scheduled_date || '');
    setHoursInvested(item.hours_invested || 1);
    setViews(item.views || 0);
    setSaves(item.saves || 0);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      if (editingItem) {
        await api.updateContent(editingItem.id, {
          title,
          status,
          content_type: contentType,
          main_idea: mainIdea,
          hook,
          structure,
          caption,
          hashtags,
          scheduled_date: scheduledDate || null,
          hours_invested: Number(hoursInvested) || 0,
          views: Number(views) || 0,
          saves: Number(saves) || 0
        });
      } else {
        await api.createContent({
          title,
          status,
          content_type: contentType,
          main_idea: mainIdea,
          hook,
          structure,
          caption,
          hashtags,
          scheduled_date: scheduledDate || null,
          hours_invested: Number(hoursInvested) || 0
        });
      }
      setShowModal(false);
      loadContent();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStatus = async (item: ContentItem, newStatus: any) => {
    await api.updateContent(item.id, { status: newStatus });
    loadContent();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this content item?')) {
      await api.deleteContent(id);
      loadContent();
    }
  };

  const columns: Array<'Idea' | 'Planning' | 'In Progress' | 'Ready' | 'Posted'> = [
    'Idea',
    'Planning',
    'In Progress',
    'Ready',
    'Posted'
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-zinc-100 uppercase">CONTENT STUDIO & KANBAN</h2>
          <p className="text-xs text-zinc-400 font-sans">
            Section 9: Content production pipeline from raw idea to post with Effort vs. Result return on time analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-zinc-950 p-1 border border-zinc-800 rounded font-mono text-xs">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'kanban' ? 'bg-zinc-100 text-zinc-950 font-bold' : 'text-zinc-400'
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setActiveTab('roi')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'roi' ? 'bg-zinc-100 text-zinc-950 font-bold' : 'text-zinc-400'
              }`}
            >
              Effort vs Result ROI
            </button>
          </div>

          <button
            onClick={openCreateModal}
            className="px-3.5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>NEW CONTENT</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-lg">
          <span className="text-[10px] text-zinc-400 uppercase block">Total Content Items</span>
          <div className="text-xl font-bold text-zinc-100 mt-1">{analytics.totalContent || 0}</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-lg">
          <span className="text-[10px] text-zinc-400 uppercase block">Posted / Published</span>
          <div className="text-xl font-bold text-zinc-100 mt-1">{analytics.postedCount || 0}</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-lg">
          <span className="text-[10px] text-zinc-400 uppercase block">Total Hours Invested</span>
          <div className="text-xl font-bold text-zinc-100 mt-1">{analytics.totalHours || 0} hrs</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-lg">
          <span className="text-[10px] text-zinc-400 uppercase block">Avg Views Per Hour</span>
          <div className="text-xl font-bold text-zinc-100 mt-1">{analytics.avgViewsPerHour || 0}</div>
        </div>
      </div>

      {/* TAB 1: KANBAN BOARD */}
      {activeTab === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {columns.map((col) => {
            const colItems = items.filter((i) => i.status === col);
            return (
              <div key={col} className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-3 space-y-3 flex flex-col min-h-[500px]">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2 font-mono text-xs">
                  <span className="font-bold uppercase text-zinc-300">{col}</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded">
                    {colItems.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {colItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => openEditModal(item)}
                      className="p-3 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 rounded-md cursor-pointer transition-all space-y-2 text-xs group"
                    >
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className="px-1.5 py-0.2 bg-zinc-950 border border-zinc-800 text-zinc-400 rounded uppercase">
                          {item.content_type}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-zinc-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-mono font-bold text-zinc-100 text-xs leading-snug">
                        {item.title}
                      </h4>

                      {item.hook && (
                        <p className="text-[11px] text-zinc-400 line-clamp-2 italic">
                          "{item.hook}"
                        </p>
                      )}

                      {/* Quick stage advance selector */}
                      <div
                        className="pt-2 border-t border-zinc-900 flex items-center justify-between font-mono text-[10px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-zinc-500">{item.hours_invested || 0} hrs</span>
                        <select
                          value={item.status}
                          onChange={(e) => handleAdvanceStatus(item, e.target.value)}
                          className="text-[10px] py-0.5 px-1 bg-zinc-950 border-zinc-800 text-zinc-300 rounded"
                        >
                          {columns.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: EFFORT VS RESULT ROI (SECTION 9.3) */}
      {activeTab === 'roi' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden font-sans text-xs">
          <div className="p-4 border-b border-zinc-800">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-200">
              EFFORT VS. RESULT ANALYTICS (HOURS INVESTED VS. PERCEIVED RETURN)
            </h3>
            <p className="text-zinc-400 text-[11px] mt-0.5">
              Identify which video formats generate the highest leverage per hour spent creating.
            </p>
          </div>

          <table className="w-full text-left font-mono">
            <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 text-[10px]">
              <tr>
                <th className="p-3">CONTENT PIECE</th>
                <th className="p-3">STATUS</th>
                <th className="p-3">HOURS INVESTED</th>
                <th className="p-3">VIEWS</th>
                <th className="p-3">SAVES</th>
                <th className="p-3">VIEWS / HOUR (ROI)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-zinc-300">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-900/30">
                  <td className="p-3 font-bold text-zinc-100 max-w-xs truncate">{item.title}</td>
                  <td className="p-3">
                    <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] rounded uppercase">
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3">{item.hours_invested || 1} hrs</td>
                  <td className="p-3">{item.views?.toLocaleString() || 0}</td>
                  <td className="p-3">{item.saves?.toLocaleString() || 0}</td>
                  <td className="p-3 font-bold text-zinc-100">
                    {item.viewsPerHour ? `${item.viewsPerHour.toLocaleString()} views/hr` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-700 w-full max-w-lg rounded-lg shadow-2xl p-6 font-sans space-y-4 my-8">
            <h3 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">
              {editingItem ? 'EDIT CONTENT CARD' : 'NEW CONTENT PRODUCTION CARD'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-mono text-zinc-400 block mb-1">Content Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Before vs After: Flat Raw Log vs Master Commercial Grade"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Stage Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full text-xs">
                    {columns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Format Type</label>
                  <select value={contentType} onChange={(e) => setContentType(e.target.value)} className="w-full text-xs">
                    <option value="Reel / Short">Reel / Short</option>
                    <option value="Carousel / Post">Carousel / Post</option>
                    <option value="Long Form Video">Long Form Video</option>
                    <option value="Case Study">Case Study</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-mono text-zinc-400 block mb-1">0-3s Visual/Audio Hook</label>
                <input
                  type="text"
                  placeholder="e.g. You are not bad at video editing, your clips are just ungraded..."
                  value={hook}
                  onChange={(e) => setHook(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="font-mono text-zinc-400 block mb-1">Content Structure / Beat Map</label>
                <textarea
                  rows={2}
                  placeholder="0-2s: Flat clip with no sound&#10;2-5s: Massive bass drop transition..."
                  value={structure}
                  onChange={(e) => setStructure(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Hours Invested</label>
                  <input
                    type="number"
                    step="0.5"
                    value={hoursInvested}
                    onChange={(e) => setHoursInvested(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs"
                  />
                </div>

                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Total Views</label>
                  <input
                    type="number"
                    value={views}
                    onChange={(e) => setViews(parseInt(e.target.value) || 0)}
                    className="w-full text-xs"
                  />
                </div>

                <div>
                  <label className="font-mono text-zinc-400 block mb-1">Total Saves</label>
                  <input
                    type="number"
                    value={saves}
                    onChange={(e) => setSaves(parseInt(e.target.value) || 0)}
                    className="w-full text-xs"
                  />
                </div>
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
                  disabled={loading || !title.trim()}
                  className="px-4 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded font-bold"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
