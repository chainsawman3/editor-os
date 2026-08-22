import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../api';
import { Goal, Project, Client, SectionType, MarketingPlatform, ProjectPriority, ClientStatus, ProjectStatus } from '../types';
import { GoalsHubSkeleton } from '../components/common/SkeletonLoader';
import { EditGoalModal } from '../components/common/EditGoalModal';
import { EditProjectModal } from '../components/common/EditProjectModal';
import {
  Target,
  Plus,
  Video,
  Clapperboard,
  Calendar,
  Sparkles,
  Briefcase,
  GraduationCap,
  Megaphone,
  ArrowRight,
  UserCheck,
  UserX,
  Clock,
  ExternalLink,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Layers,
  ChevronRight
} from 'lucide-react';

interface GoalsHubPageProps {
  initialSection?: SectionType;
  initialStatus?: string;
  initialViewType?: 'all' | 'goals_only' | 'projects_only';
  initialPlatform?: string;
  initialClientStatus?: string;
  onOpenProject: (projectId: string) => void;
  onOpenGoal?: (goalId: string) => void;
}

export const GoalsHubPage: React.FC<GoalsHubPageProps> = ({
  initialSection = 'video_editing',
  initialStatus,
  initialViewType = 'all',
  initialPlatform,
  initialClientStatus,
  onOpenProject,
  onOpenGoal
}) => {
  const [activeSection, setActiveSection] = useState<SectionType>(initialSection);
  const [marketingPlatform, setMarketingPlatform] = useState<MarketingPlatform | 'all'>((initialPlatform as any) || 'all');
  
  // View Modes & Filters for Projects/Goals
  const [viewType, setViewType] = useState<'all' | 'goals_only' | 'projects_only'>(initialViewType);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus || 'all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Freelance / Clients Filter
  const [clientStatusFilter, setClientStatusFilter] = useState<string>(initialClientStatus || 'all');
  const [clientPriorityFilter, setClientPriorityFilter] = useState<string>('all');
  const [clientSearchQuery, setClientSearchQuery] = useState<string>('');

  const [goals, setGoals] = useState<Goal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Edit States
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Goal Form
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalDate, setGoalDate] = useState('');
  const [goalPriority, setGoalPriority] = useState<'Low' | 'Medium' | 'High'>('High');

  // Project Form
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projGoalId, setProjGoalId] = useState('');
  const [projPriority, setProjPriority] = useState<ProjectPriority>('Medium');
  const [projDeadline, setProjDeadline] = useState('');
  const [projClientName, setProjClientName] = useState('');
  const [projPlatform, setProjPlatform] = useState<MarketingPlatform | ''>('instagram');

  // Client Form
  const [clientName, setClientName] = useState('');
  const [clientStatus, setClientStatus] = useState<ClientStatus>('Contacted');
  const [clientPriority, setClientPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [clientDeadline, setClientDeadline] = useState('');
  const [clientLinkedProj, setClientLinkedProj] = useState('');
  const [clientRevenue, setClientRevenue] = useState<number>(0);
  const [clientNotes, setClientNotes] = useState('');

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [g, p, c] = await Promise.all([api.getGoals(), api.getProjects(), api.getClients()]);
      setGoals(g);
      setProjects(p);
      setClients(Array.isArray(c) ? c : (c as any)?.clients || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  useEffect(() => {
    if (initialStatus) {
      setStatusFilter(initialStatus);
    }
  }, [initialStatus]);

  useEffect(() => {
    if (initialViewType) {
      setViewType(initialViewType);
    }
  }, [initialViewType]);

  useEffect(() => {
    if (initialClientStatus) {
      setClientStatusFilter(initialClientStatus);
    }
  }, [initialClientStatus]);

  useEffect(() => {
    if (initialPlatform) {
      setMarketingPlatform(initialPlatform as any);
    }
  }, [initialPlatform]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    await api.createGoal({
      section: activeSection,
      sub_section: activeSection === 'marketing' && marketingPlatform !== 'all' ? marketingPlatform : null,
      title: goalTitle.trim(),
      description: goalDesc.trim(),
      target_date: goalDate || null,
      priority: goalPriority,
      status: 'In Progress'
    });

    setGoalTitle('');
    setGoalDesc('');
    setGoalDate('');
    setShowGoalModal(false);
    loadAllData();
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;

    const newProj = await api.createProject({
      section: activeSection,
      sub_section: activeSection === 'marketing' ? projPlatform || null : null,
      goal_id: projGoalId || null,
      name: projName.trim(),
      description: projDesc.trim(),
      priority: projPriority,
      deadline: projDeadline || null,
      client_name: projClientName.trim() || undefined,
      status: 'Planning'
    });

    setProjName('');
    setProjDesc('');
    setProjDeadline('');
    setProjClientName('');
    setShowProjectModal(false);
    onOpenProject(newProj.id);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    await api.createClient({
      name: clientName.trim(),
      status: clientStatus,
      priority: clientPriority,
      deadline: clientDeadline || undefined,
      linked_project_id: clientLinkedProj || undefined,
      revenue: clientRevenue || 0,
      notes: clientNotes.trim()
    });

    setClientName('');
    setClientNotes('');
    setClientRevenue(0);
    setClientDeadline('');
    setClientLinkedProj('');
    setShowClientModal(false);
    loadAllData();
  };

  const handleUpdateGoal = async (updated: Partial<Goal> & { id: string }) => {
    setGoals((prev) => prev.map((g) => (g.id === updated.id ? { ...g, ...updated } : g)));
    await api.updateGoal(updated.id, updated);
    loadAllData();
  };

  const handleUpdateProject = async (updated: Partial<Project> & { id: string }) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
    await api.updateProject(updated.id, updated);
    loadAllData();
  };

  const handleDeleteGoal = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this goal and its references?')) {
      setGoals((prev) => prev.filter((g) => g.id !== id));
      await api.deleteGoal(id);
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this project?')) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      await api.deleteProject(id);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (confirm('Delete this client record?')) {
      setClients((prev) => prev.filter((c) => c.id !== id));
      await api.deleteClient(id);
    }
  };

  const getPriorityColor = (p?: string) => {
    switch (p) {
      case 'Hard':
      case 'High':
        return 'text-rose-300 bg-rose-950/60 border-rose-800/80';
      case 'Medium':
        return 'text-amber-300 bg-amber-950/60 border-amber-800/80';
      case 'Low':
      default:
        return 'text-emerald-300 bg-emerald-950/60 border-emerald-800/80';
    }
  };

  const getClientStatusBadge = (st: ClientStatus) => {
    switch (st) {
      case 'Client':
      case 'Completed':
        return (
          <span className="px-3 py-1 text-[11px] font-semibold rounded-xl bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 flex items-center gap-1.5 whitespace-nowrap shadow-sm shadow-emerald-950/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <UserCheck className="w-3.5 h-3.5" />
            <span>Active Client</span>
          </span>
        );
      case 'Agreed':
        return (
          <span className="px-3 py-1 text-[11px] font-semibold rounded-xl bg-cyan-950/80 border border-cyan-700/80 text-cyan-300 flex items-center gap-1.5 whitespace-nowrap shadow-sm shadow-cyan-950/30">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Agreed / Discussion</span>
          </span>
        );
      case 'Contacted':
        return (
          <span className="px-3 py-1 text-[11px] font-semibold rounded-xl bg-blue-950/80 border border-blue-700/80 text-blue-300 flex items-center gap-1.5 whitespace-nowrap shadow-sm shadow-blue-950/30">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <Clock className="w-3.5 h-3.5" />
            <span>Contacted (Waiting)</span>
          </span>
        );
      case 'Ignored':
      default:
        return (
          <span className="px-3 py-1 text-[11px] font-semibold rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-zinc-600" />
            <UserX className="w-3.5 h-3.5" />
            <span>Ignored / Ghosted</span>
          </span>
        );
    }
  };

  // Filtered Goals & Projects logic
  const filteredGoals = goals.filter((g) => {
    if (g.section !== activeSection) return false;
    if (activeSection === 'marketing' && marketingPlatform !== 'all' && g.sub_section !== marketingPlatform) return false;
    if (priorityFilter !== 'all' && g.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return g.title.toLowerCase().includes(q) || (g.description && g.description.toLowerCase().includes(q));
    }
    return true;
  });

  const filteredProjects = projects.filter((p) => {
    if (p.section !== activeSection) return false;
    if (activeSection === 'marketing' && marketingPlatform !== 'all' && p.sub_section !== marketingPlatform) return false;
    
    // Status Filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'Done' || statusFilter === 'Ready / Done' || statusFilter === 'Ready') {
        if (p.status !== 'Ready' && p.status !== 'Posted' && p.status !== 'Completed') return false;
      } else if (statusFilter === 'In Progress') {
        if (p.status !== 'In Progress') return false;
      } else if (statusFilter === 'Planning') {
        if (p.status !== 'Planning') return false;
      } else if (statusFilter === 'Paused') {
        if (p.status !== 'Paused') return false;
      } else if (p.status !== statusFilter) {
        return false;
      }
    }

    // Priority Filter
    if (priorityFilter !== 'all' && p.priority !== priorityFilter) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.client_name && p.client_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Filtered Clients logic
  const filteredClients = clients.filter((c) => {
    if (clientStatusFilter === 'positive') {
      if (c.status !== 'Agreed' && c.status !== 'Client' && c.status !== 'Completed') return false;
    } else if (clientStatusFilter === 'pending') {
      if (c.status !== 'Contacted' && c.status !== 'Lead' && c.status !== 'Discussion' && c.status !== 'Replied') return false;
    } else if (clientStatusFilter === 'negative') {
      if (c.status !== 'Ignored') return false;
    } else if (clientStatusFilter !== 'all') {
      if (c.status !== clientStatusFilter) return false;
    }

    if (clientPriorityFilter !== 'all' && c.priority !== clientPriorityFilter) return false;

    if (clientSearchQuery.trim()) {
      const q = clientSearchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || (c.notes && c.notes.toLowerCase().includes(q));
    }
    return true;
  });

  const isFiltersActive = statusFilter !== 'all' || priorityFilter !== 'all' || searchQuery.trim() !== '' || viewType !== 'all';
  const isClientFiltersActive = clientStatusFilter !== 'all' || clientPriorityFilter !== 'all' || clientSearchQuery.trim() !== '';

  const resetFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setSearchQuery('');
    setViewType('all');
  };

  const resetClientFilters = () => {
    setClientStatusFilter('all');
    setClientPriorityFilter('all');
    setClientSearchQuery('');
  };

  if (loading) {
    return <GoalsHubSkeleton />;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. TOP HEADER & SUB-SECTION TABS */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-5">
          <div className="flex items-center gap-3.5">
            <span className="p-2.5 rounded-xl bg-purple-950/50 border border-purple-800/60 text-purple-400 shadow-inner">
              <Target className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Goals & Objectives Hub</h1>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">
                Define high-level objectives, link production projects, and manage client pipeline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {activeSection !== 'freelance' && (
              <>
                <button
                  onClick={() => setShowGoalModal(true)}
                  className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-750 hover:border-zinc-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 text-zinc-400" />
                  <span>+ New Goal</span>
                </button>
                <button
                  onClick={() => setShowProjectModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-900/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ New Project</span>
                </button>
              </>
            )}
            {activeSection === 'freelance' && (
              <button
                onClick={() => setShowClientModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-900/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Client / Lead</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 PRIMARY SUB-SECTION SWITCHER */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => {
              setActiveSection('video_editing');
              resetFilters();
            }}
            className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
              activeSection === 'video_editing'
                ? 'bg-zinc-900 border-blue-500/50 text-white shadow-md ring-1 ring-blue-500/20'
                : 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className={`p-2 rounded-lg border ${activeSection === 'video_editing' ? 'bg-blue-950/80 border-blue-800 text-blue-300' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
              <Clapperboard className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-100">Video Editing</div>
              <div className="text-[11px] text-zinc-400 font-normal">Portfolio & Client Edits</div>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveSection('marketing');
              resetFilters();
            }}
            className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
              activeSection === 'marketing'
                ? 'bg-zinc-900 border-emerald-500/50 text-white shadow-md ring-1 ring-emerald-500/20'
                : 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className={`p-2 rounded-lg border ${activeSection === 'marketing' ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-100">Marketing & Content</div>
              <div className="text-[11px] text-zinc-400 font-normal">Instagram, TikTok, YouTube</div>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveSection('freelance');
              resetClientFilters();
            }}
            className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
              activeSection === 'freelance'
                ? 'bg-zinc-900 border-purple-500/50 text-white shadow-md ring-1 ring-purple-500/20'
                : 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className={`p-2 rounded-lg border ${activeSection === 'freelance' ? 'bg-purple-950/80 border-purple-800 text-purple-300' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-100">Client CRM & Leads</div>
              <div className="text-[11px] text-zinc-400 font-normal">Outreach & Pipeline</div>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveSection('skills');
              resetFilters();
            }}
            className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
              activeSection === 'skills'
                ? 'bg-zinc-900 border-amber-500/50 text-white shadow-md ring-1 ring-amber-500/20'
                : 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className={`p-2 rounded-lg border ${activeSection === 'skills' ? 'bg-amber-950/80 border-amber-800 text-amber-300' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-100">Skills & VFX Mastery</div>
              <div className="text-[11px] text-zinc-400 font-normal">Techniques & Learning</div>
            </div>
          </button>
        </div>

        {/* MARKETING PLATFORMS SUB-PILLS */}
        {activeSection === 'marketing' && (
          <div className="flex items-center gap-2 pt-3 border-t border-zinc-850 overflow-x-auto">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mr-1">Platforms:</span>
            {(['all', 'instagram', 'tiktok', 'youtube', 'linkedin', 'fiverr'] as const).map((plat) => (
              <button
                key={plat}
                onClick={() => setMarketingPlatform(plat)}
                className={`px-3 py-1 text-xs rounded-lg uppercase font-semibold transition-all ${
                  marketingPlatform === plat
                    ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-300 shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {plat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. DYNAMIC FILTER & VIEW TOOLBAR (FOR NON-FREELANCE SECTIONS) */}
      {activeSection !== 'freelance' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* View Mode Switcher: All vs Only Goals vs Only Projects */}
            <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setViewType('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  viewType === 'all'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All Items ({filteredGoals.length + filteredProjects.length})
              </button>
              <button
                onClick={() => setViewType('goals_only')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  viewType === 'goals_only'
                    ? 'bg-purple-950/80 border border-purple-700 text-purple-300 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Target className="w-3.5 h-3.5 text-purple-400" />
                <span>Goals Only ({filteredGoals.length})</span>
              </button>
              <button
                onClick={() => setViewType('projects_only')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  viewType === 'projects_only'
                    ? 'bg-blue-950/80 border border-blue-700 text-blue-300 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-blue-400" />
                <span>Projects Only ({filteredProjects.length})</span>
              </button>
            </div>

            {/* Real-time Search Box */}
            <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects or goals..."
                className="w-full pl-9 pr-8 py-1.5 bg-zinc-900 border border-zinc-800 focus:border-zinc-600 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-500 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-zinc-500 hover:text-zinc-200 absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Phase & Priority Filter Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-850 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-zinc-500 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1 mr-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" /> Phase:
              </span>
              {(['all', 'Planning', 'In Progress', 'Ready', 'Paused'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {st === 'Ready' ? 'Ready / Done' : st === 'all' ? 'All Phases' : st}
                </button>
              ))}

              <div className="h-4 w-px bg-zinc-800 mx-1" />

              <span className="text-zinc-500 font-semibold text-[11px] uppercase tracking-wider mr-1">Priority:</span>
              {(['all', 'High', 'Medium', 'Low'] as const).map((pr) => (
                <button
                  key={pr}
                  onClick={() => setPriorityFilter(pr)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    priorityFilter === pr
                      ? 'bg-zinc-100 text-zinc-950 font-bold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {pr === 'all' ? 'All' : pr}
                </button>
              ))}
            </div>

            {isFiltersActive && (
              <button
                onClick={resetFilters}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
              >
                <X className="w-3.5 h-3.5" /> Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. SECTION CONTENT: VIDEO EDITING / MARKETING / SKILLS */}
      {activeSection !== 'freelance' && (
        <div className="space-y-6">
          {/* PRIMARY OBJECTIVES (IF NOT FILTERED OUT) */}
          {(viewType === 'all' || viewType === 'goals_only') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-400" /> Primary Objectives / Main Goals ({filteredGoals.length})
                </h2>
              </div>

              {filteredGoals.length === 0 ? (
                <div className="p-8 text-center bg-zinc-950 border border-zinc-800 rounded-xl">
                  <p className="text-xs text-zinc-400 mb-3">No goals match your current filter.</p>
                  <button
                    onClick={() => setShowGoalModal(true)}
                    className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-semibold"
                  >
                    + Add New Goal
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredGoals.map((g) => {
                    const linkedProjects = projects.filter((p) => p.goal_id === g.id);
                    return (
                      <div
                        key={g.id}
                        onClick={() => onOpenGoal && onOpenGoal(g.id)}
                        className="bg-[#13111c] hover:bg-[#181523] border border-purple-900/40 hover:border-purple-500/80 ring-1 ring-purple-500/[0.08] hover:ring-purple-500/30 rounded-xl p-5 sm:p-6 transition-all duration-200 space-y-4 shadow-md shadow-black/40 hover:shadow-lg hover:shadow-purple-950/30 cursor-pointer group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 text-[10px] font-mono rounded bg-purple-950/70 border border-purple-800/70 text-purple-300 uppercase font-bold tracking-wider">
                                🎯 MAIN OBJECTIVE
                              </span>
                              <span className={`px-2.5 py-1 text-[10px] font-mono rounded border ${getPriorityColor(g.priority)} font-bold`}>
                                {g.priority || 'High'}
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-zinc-100 group-hover:text-purple-200 transition-colors font-sans leading-snug">
                              {g.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingGoal(g);
                              }}
                              className="p-1 text-zinc-400 hover:text-purple-300 rounded transition-colors"
                              title="Edit Goal"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteGoal(g.id, e);
                              }}
                              className="p-1 text-zinc-400 hover:text-rose-400 rounded transition-colors"
                              title="Delete Goal"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {g.description && <p className="text-xs text-zinc-400 leading-relaxed font-normal">{g.description}</p>}

                        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pt-3 border-t border-purple-950/70">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-purple-400" />
                            {g.target_date ? `Deadline: ${g.target_date}` : 'No deadline'}
                          </span>
                          <span className="text-zinc-300 font-bold">{linkedProjects.length} Projects Linked</span>
                        </div>

                        {/* Nested Projects inside this Goal */}
                        {linkedProjects.length > 0 && (
                          <div className="space-y-2 pt-1">
                            <span className="text-[10px] font-mono uppercase text-zinc-400 block tracking-wider">Linked Projects:</span>
                            <div className="space-y-2">
                              {linkedProjects.map((lp) => (
                                <div
                                  key={lp.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenProject(lp.id);
                                  }}
                                  className="p-3 bg-[#1b1728]/80 hover:bg-[#231e34] border border-purple-900/35 hover:border-emerald-500/40 rounded-lg flex items-center justify-between cursor-pointer group/proj transition-all duration-150"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <Video className="w-3.5 h-3.5 text-purple-400 group-hover/proj:text-emerald-300 transition-colors" />
                                    <span className="text-xs font-semibold text-zinc-200 group-hover/proj:text-white">{lp.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 text-[9px] font-mono rounded border ${getPriorityColor(lp.priority)}`}>
                                      {lp.priority}
                                    </span>
                                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover/proj:text-emerald-300 transition-transform group-hover/proj:translate-x-0.5" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ALL PRODUCTION PROJECTS (IF NOT FILTERED OUT) */}
          {(viewType === 'all' || viewType === 'projects_only') && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Video className="w-4 h-4 text-cyan-400" /> Production Projects Workspace ({filteredProjects.length})
                </h2>
                <button
                  onClick={() => setShowProjectModal(true)}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Project
                </button>
              </div>

              {filteredProjects.length === 0 ? (
                <div className="p-8 text-center bg-zinc-950 border border-zinc-800 rounded-xl">
                  <p className="text-xs text-zinc-400 mb-2">No projects match the current filter selection.</p>
                  <button
                    onClick={() => setShowProjectModal(true)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
                  >
                    + Create Project
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProjects.map((p) => {
                    const goal = goals.find((g) => g.id === p.goal_id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => onOpenProject(p.id)}
                        className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-750 hover:border-emerald-500/60 ring-1 ring-white/[0.06] hover:ring-emerald-500/30 rounded-xl p-5 sm:p-6 cursor-pointer group transition-all duration-200 flex flex-col justify-between space-y-4 shadow-md shadow-black/40 hover:shadow-lg hover:shadow-emerald-950/40"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 text-[10px] font-mono rounded bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 font-bold uppercase tracking-wider">
                                {p.status}
                              </span>
                              <span className={`px-2.5 py-1 text-[10px] font-mono rounded border ${getPriorityColor(p.priority)} font-bold`}>
                                {p.priority}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingProject(p);
                                }}
                                className="p-1 text-zinc-400 hover:text-blue-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Edit Project"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteProject(p.id, e)}
                                className="p-1 text-zinc-400 hover:text-rose-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete Project"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <h3 className="text-base font-bold text-zinc-100 group-hover:text-white font-sans transition-colors leading-snug">
                            {p.name}
                          </h3>

                          {p.description && (
                            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-normal">{p.description}</p>
                          )}
                        </div>

                        <div className="space-y-2.5 pt-3.5 border-t border-zinc-800">
                          {goal && (
                            <div className="text-[11px] font-medium text-purple-300 truncate">
                              🎯 Goal: {goal.title}
                            </div>
                          )}
                          {p.client_name && (
                            <div className="text-[11px] text-zinc-400 truncate">
                              👤 Client: <span className="text-zinc-200 font-semibold">{p.client_name}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                              {p.deadline || 'No deadline'}
                            </span>
                            <span className="flex items-center gap-1 text-zinc-200 font-bold group-hover:text-blue-400 transition-colors">
                              Open Workspace <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. FREELANCE / CLIENTS CRM SUB-SECTION */}
      {activeSection === 'freelance' && (
        <div className="space-y-6">
          {/* CRM Filter Toolbar */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Response Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-zinc-500 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1 mr-1">
                  <Filter className="w-3.5 h-3.5 text-zinc-400" /> Response:
                </span>
                <button
                  onClick={() => setClientStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    clientStatusFilter === 'all'
                      ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  All Leads ({clients.length})
                </button>
                <button
                  onClick={() => setClientStatusFilter('positive')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    clientStatusFilter === 'positive'
                      ? 'bg-emerald-600 text-white font-bold shadow-sm'
                      : 'bg-zinc-900 text-emerald-400 hover:bg-emerald-950/50 border border-emerald-900/50'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Agreed & Won ({clients.filter(c => c.status === 'Agreed' || c.status === 'Client' || c.status === 'Completed').length})</span>
                </button>
                <button
                  onClick={() => setClientStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    clientStatusFilter === 'pending'
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : 'bg-zinc-900 text-blue-400 hover:bg-blue-950/50 border border-blue-900/50'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Contacted / Waiting ({clients.filter(c => c.status === 'Contacted' || c.status === 'Lead' || c.status === 'Discussion' || c.status === 'Replied').length})</span>
                </button>
                <button
                  onClick={() => setClientStatusFilter('negative')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    clientStatusFilter === 'negative'
                      ? 'bg-rose-600 text-white font-bold shadow-sm'
                      : 'bg-zinc-900 text-rose-400 hover:bg-rose-950/50 border border-rose-900/50'
                  }`}
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Ignored / Ghosted ({clients.filter(c => c.status === 'Ignored').length})</span>
                </button>
              </div>

              {/* Client Search */}
              <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={clientSearchQuery}
                  onChange={(e) => setClientSearchQuery(e.target.value)}
                  placeholder="Search client name or notes..."
                  className="w-full pl-9 pr-8 py-1.5 bg-zinc-900 border border-zinc-800 focus:border-zinc-600 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-500 outline-none"
                />
                {clientSearchQuery && (
                  <button
                    onClick={() => setClientSearchQuery('')}
                    className="p-1 text-zinc-500 hover:text-zinc-200 absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {isClientFiltersActive && (
              <div className="flex justify-end pt-2 border-t border-zinc-850">
                <button
                  onClick={resetClientFilters}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                >
                  <X className="w-3.5 h-3.5" /> Clear Client Filters
                </button>
              </div>
            )}
          </div>

          {/* CRM Funnel Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-zinc-950/90 border border-zinc-800/90 p-4 rounded-2xl space-y-1.5 shadow-sm relative overflow-hidden backdrop-blur-md">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">Total Leads</span>
              <span className="text-2xl font-bold font-mono text-zinc-100 block">{clients.length}</span>
              <span className="text-[11px] text-zinc-500 font-medium block">All pipeline channels</span>
            </div>
            <div className="bg-zinc-950/90 border border-blue-900/30 p-4 rounded-2xl space-y-1.5 shadow-sm relative overflow-hidden backdrop-blur-md">
              <span className="text-[10px] text-blue-400 uppercase font-bold tracking-wider block">Contacted / Waiting</span>
              <span className="text-2xl font-bold font-mono text-blue-400 block">
                {clients.filter((c) => c.status === 'Contacted' || c.status === 'Lead' || c.status === 'Discussion' || c.status === 'Replied').length}
              </span>
              <span className="text-[11px] text-zinc-500 font-medium block">Awaiting reply / pitch</span>
            </div>
            <div className="bg-zinc-950/90 border border-cyan-900/30 p-4 rounded-2xl space-y-1.5 shadow-sm relative overflow-hidden backdrop-blur-md">
              <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider block">Agreed / Won Deals</span>
              <span className="text-2xl font-bold font-mono text-cyan-400 block">
                {clients.filter((c) => c.status === 'Agreed').length}
              </span>
              <span className="text-[11px] text-zinc-500 font-medium block">In contract negotiation</span>
            </div>
            <div className="bg-zinc-950/90 border border-emerald-900/30 p-4 rounded-2xl space-y-1.5 shadow-sm relative overflow-hidden backdrop-blur-md">
              <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">Active Retainers</span>
              <span className="text-2xl font-bold font-mono text-emerald-400 block">
                {clients.filter((c) => c.status === 'Client' || c.status === 'Completed').length}
              </span>
              <span className="text-[11px] text-emerald-500/80 font-mono font-semibold block">
                ${clients.reduce((acc, c) => acc + (c.revenue || 0), 0).toLocaleString()} Total Value
              </span>
            </div>
          </div>

          {/* CLIENTS TABLE */}
          <div className="bg-zinc-950/90 border border-zinc-800/90 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
            <div className="p-4 sm:p-5 border-b border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 shadow-inner">
                  <Briefcase className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                    Client Outreach & Pipeline
                    <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg">
                      {filteredClients.length}
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                    Manage client discussions, agreed deals, contracts, and deliverable links
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowClientModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-950/50 flex items-center gap-1.5 transition-all w-fit"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Client</span>
              </button>
            </div>

            {filteredClients.length === 0 ? (
              <div className="p-12 text-center text-zinc-400 text-xs font-medium">
                No client records match the current filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-zinc-900/80 font-mono text-[11px] text-zinc-400 border-b border-zinc-800/80">
                    <tr>
                      <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Client & Lead</th>
                      <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Status</th>
                      <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Priority</th>
                      <th className="py-3.5 px-4 font-bold uppercase tracking-wider whitespace-nowrap">Deadline</th>
                      <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Linked Project</th>
                      <th className="py-3.5 px-4 font-bold uppercase tracking-wider">Deal Value</th>
                      <th className="py-3.5 px-4 text-right font-bold uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {filteredClients.map((c) => {
                      const linkedP = projects.find((p) => p.id === c.linked_project_id);

                      // Parse Name & Tag in Parentheses (e.g. David Miller (Apex Gym))
                      const match = c.name.match(/^(.*?)\s*\((.*?)\)$/);
                      const primaryName = match ? match[1].trim() : c.name;
                      const subTag = match ? match[2].trim() : null;

                      // Initials for Avatar
                      const initials = primaryName
                        .split(/\s+/)
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join('')
                        .toUpperCase() || 'CL';

                      return (
                        <tr key={c.id} className="hover:bg-zinc-900/60 transition-colors group">
                          {/* Client Name + Avatar */}
                          <td className="py-4 px-4 font-medium text-zinc-200">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600/80 to-purple-600/80 border border-indigo-500/40 flex items-center justify-center text-white font-bold font-mono text-xs shadow-sm shrink-0">
                                {initials}
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-zinc-100 text-xs sm:text-sm">{primaryName}</span>
                                  {subTag && (
                                    <span className="px-2 py-0.5 text-[10px] font-mono rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 font-semibold">
                                      {subTag}
                                    </span>
                                  )}
                                </div>
                                {c.notes && (
                                  <div className="text-[11px] text-zinc-400 line-clamp-1 max-w-sm font-normal">
                                    {c.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {getClientStatusBadge(c.status)}
                          </td>

                          {/* Priority Badge */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg border shadow-sm ${getPriorityColor(c.priority)}`}>
                              {c.priority || 'Medium'}
                            </span>
                          </td>

                          {/* Deadline / Follow-up (No awkward wrapping) */}
                          <td className="py-4 px-4 font-mono text-zinc-300 whitespace-nowrap">
                            {c.deadline ? (
                              <span className="flex items-center gap-1.5 font-medium">
                                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                                <span>{c.deadline}</span>
                              </span>
                            ) : (
                              <span className="text-zinc-600">—</span>
                            )}
                          </td>

                          {/* Linked Project */}
                          <td className="py-4 px-4">
                            {linkedP ? (
                              <button
                                onClick={() => onOpenProject(linkedP.id)}
                                className="px-3 py-1.5 rounded-xl bg-cyan-950/50 hover:bg-cyan-950/80 border border-cyan-800/60 hover:border-cyan-600 text-cyan-300 hover:text-cyan-200 font-sans text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm group/link max-w-[220px]"
                              >
                                <span className="truncate">{linkedP.name}</span>
                                <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover/link:opacity-100 group-hover/link:translate-x-0.5 transition-all" />
                              </button>
                            ) : (
                              <span className="text-zinc-600 font-mono text-xs">—</span>
                            )}
                          </td>

                          {/* Deal Value */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="font-mono text-emerald-400 font-bold text-sm bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-1 rounded-xl shadow-sm">
                              {c.revenue ? `$${c.revenue.toLocaleString()}` : '$0'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteClient(c.id)}
                              className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-all"
                              title="Delete client record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE GOAL MODAL */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" /> Create Primary Objective
              </h3>
              <button onClick={() => setShowGoalModal(false)} className="text-zinc-500 hover:text-zinc-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Goal Title *</label>
                <input
                  type="text"
                  required
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. Master 3D Camera Tracking & Land 2 Commercials"
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-750 rounded-xl text-zinc-100 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Description / North Star</label>
                <textarea
                  rows={3}
                  value={goalDesc}
                  onChange={(e) => setGoalDesc(e.target.value)}
                  placeholder="Why does this objective matter for your craft & income?"
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-750 rounded-xl text-zinc-100 outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-semibold block mb-1">Target Date</label>
                  <input
                    type="date"
                    value={goalDate}
                    onChange={(e) => setGoalDate(e.target.value)}
                    className="w-full p-2 bg-zinc-900 border border-zinc-750 rounded-xl text-zinc-100 outline-none"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-semibold block mb-1">Priority</label>
                  <select
                    value={goalPriority}
                    onChange={(e: any) => setGoalPriority(e.target.value)}
                    className="w-full p-2 bg-zinc-900 border border-zinc-750 rounded-xl text-zinc-100 outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-3.5 py-2 bg-zinc-900 text-zinc-400 hover:text-zinc-200 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-md"
                >
                  Save Objective
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Video className="w-4 h-4 text-blue-400" /> Create Production Project
              </h3>
              <button onClick={() => setShowProjectModal(false)} className="text-zinc-500 hover:text-zinc-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  placeholder="e.g. Nike Spec Commercial - Sound Design Reel"
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-750 rounded-xl text-zinc-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Description / Brief</label>
                <textarea
                  rows={2}
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  placeholder="Key concepts, pacing, music style..."
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-750 rounded-xl text-zinc-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Link to Primary Objective</label>
                <select
                  value={projGoalId}
                  onChange={(e) => setProjGoalId(e.target.value)}
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-750 rounded-xl text-zinc-100 outline-none"
                >
                  <option value="">-- No Linked Goal (Independent Project) --</option>
                  {goals.filter(g => g.section === activeSection).map((g) => (
                    <option key={g.id} value={g.id}>
                      🎯 {g.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-semibold block mb-1">Priority</label>
                  <select
                    value={projPriority}
                    onChange={(e: any) => setProjPriority(e.target.value)}
                    className="w-full p-2 bg-zinc-900 border border-zinc-750 rounded-xl text-zinc-100 outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 font-semibold block mb-1">Deadline</label>
                  <input
                    type="date"
                    value={projDeadline}
                    onChange={(e) => setProjDeadline(e.target.value)}
                    className="w-full p-2 bg-zinc-900 border border-zinc-750 rounded-xl text-zinc-100 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-3.5 py-2 bg-zinc-900 text-zinc-400 hover:text-zinc-200 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md"
                >
                  Create & Open Workspace ↗
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CLIENT MODAL */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" /> Add Client / Lead
              </h3>
              <button onClick={() => setShowClientModal(false)} className="text-zinc-500 hover:text-zinc-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Client / Lead Name *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Marcus Vance (Creative Director)"
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-750 rounded-xl text-zinc-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-semibold block mb-1">Outreach Status</label>
                  <select
                    value={clientStatus}
                    onChange={(e: any) => setClientStatus(e.target.value)}
                    className="w-full p-2 bg-zinc-900 border border-zinc-750 rounded-xl text-zinc-100 outline-none"
                  >
                    <option value="Contacted">Contacted (Waiting)</option>
                    <option value="Agreed">Agreed / Discussion</option>
                    <option value="Client">Active Client</option>
                    <option value="Ignored">Ignored / Ghosted</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 font-semibold block mb-1">Priority</label>
                  <select
                    value={clientPriority}
                    onChange={(e: any) => setClientPriority(e.target.value)}
                    className="w-full p-2 bg-zinc-900 border border-zinc-750 rounded-xl text-zinc-100 outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-semibold block mb-1">Deal Revenue ($)</label>
                  <input
                    type="number"
                    value={clientRevenue}
                    onChange={(e) => setClientRevenue(Number(e.target.value))}
                    placeholder="e.g. 1500"
                    className="w-full p-2 bg-zinc-900 border border-zinc-750 rounded-xl text-zinc-100 outline-none"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-semibold block mb-1">Target Deadline</label>
                  <input
                    type="date"
                    value={clientDeadline}
                    onChange={(e) => setClientDeadline(e.target.value)}
                    className="w-full p-2 bg-zinc-900 border border-zinc-750 rounded-xl text-zinc-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Notes / Outreach Context</label>
                <textarea
                  rows={2}
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  placeholder="Sent portfolio reel via LinkedIn DM..."
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-750 rounded-xl text-zinc-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowClientModal(false)}
                  className="px-3.5 py-2 bg-zinc-900 text-zinc-400 hover:text-zinc-200 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
      <EditGoalModal
        isOpen={!!editingGoal}
        goal={editingGoal}
        onClose={() => setEditingGoal(null)}
        onSave={handleUpdateGoal}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={!!editingProject}
        project={editingProject}
        goals={goals}
        onClose={() => setEditingProject(null)}
        onSave={handleUpdateProject}
      />
    </div>
  );
};
