import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../api';
import { Goal, Project, Client, SectionType, MarketingPlatform, ProjectPriority, ClientStatus } from '../types';
import { GoalsHubSkeleton } from '../components/common/SkeletonLoader';
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
  FileText
} from 'lucide-react';

interface GoalsHubPageProps {
  initialSection?: SectionType;
  onOpenProject: (projectId: string) => void;
}

export const GoalsHubPage: React.FC<GoalsHubPageProps> = ({ initialSection = 'video_editing', onOpenProject }) => {
  const [activeSection, setActiveSection] = useState<SectionType>(initialSection);
  const [marketingPlatform, setMarketingPlatform] = useState<MarketingPlatform | 'all'>('all');
  
  const [goals, setGoals] = useState<Goal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);

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

    try {
      const newP = await api.createProject({
        name: projName.trim(),
        description: projDesc.trim(),
        section: activeSection,
        sub_section: activeSection === 'marketing' ? (marketingPlatform !== 'all' ? marketingPlatform : projPlatform || 'instagram') : null,
        goal_id: projGoalId || null,
        priority: projPriority,
        deadline: projDeadline || null,
        client_name: projClientName.trim() || undefined,
        status: 'Planning'
      });

      setProjName('');
      setProjDesc('');
      setProjClientName('');
      setProjDeadline('');
      setShowProjectModal(false);
      loadAllData();
      onOpenProject(newP.id);
    } catch (err) {
      console.error('Error creating project:', err);
      setShowProjectModal(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    await api.createClient({
      name: clientName.trim(),
      status: clientStatus,
      priority: clientPriority,
      deadline: clientDeadline || null,
      linked_project_id: clientLinkedProj || null,
      revenue: clientRevenue || 0,
      notes: clientNotes.trim()
    });

    setClientName('');
    setClientDeadline('');
    setClientNotes('');
    setClientRevenue(0);
    setShowClientModal(false);
    loadAllData();
  };

  const handleDeleteGoal = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this main goal?')) {
      await api.deleteGoal(id);
      loadAllData();
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this project?')) {
      await api.deleteProject(id);
      loadAllData();
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (confirm('Delete this client record?')) {
      await api.deleteClient(id);
      loadAllData();
    }
  };

  const getPriorityColor = (p?: string) => {
    switch (p) {
      case 'Hard':
      case 'High':
        return 'text-rose-400 bg-rose-950/40 border-rose-800/80';
      case 'Medium':
        return 'text-amber-400 bg-amber-950/40 border-amber-800/80';
      case 'Low':
      default:
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/80';
    }
  };

  const getClientStatusBadge = (st: ClientStatus) => {
    switch (st) {
      case 'Client':
      case 'Completed':
        return <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-950 border border-emerald-700 text-emerald-300 flex items-center gap-1"><UserCheck className="w-3 h-3" /> Client</span>;
      case 'Agreed':
        return <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-cyan-950 border border-cyan-700 text-cyan-300 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Agreed</span>;
      case 'Contacted':
        return <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-blue-950 border border-blue-700 text-blue-300 flex items-center gap-1"><Clock className="w-3 h-3" /> Contacted</span>;
      case 'Ignored':
        return <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-zinc-800 border border-zinc-700 text-zinc-400 flex items-center gap-1"><UserX className="w-3 h-3" /> Ignored</span>;
    }
  };

  // Filtered Goals & Projects
  const sectionGoals = goals.filter((g) => {
    if (g.section !== activeSection) return false;
    if (activeSection === 'marketing' && marketingPlatform !== 'all') {
      return g.sub_section === marketingPlatform;
    }
    return true;
  });

  const sectionProjects = projects.filter((p) => {
    if (p.section !== activeSection) return false;
    if (activeSection === 'marketing' && marketingPlatform !== 'all') {
      return p.sub_section === marketingPlatform;
    }
    return true;
  });

  if (loading) {
    return <GoalsHubSkeleton />;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. TOP HEADER & SUB-SECTION TABS */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-zinc-900 border border-zinc-700/80 text-zinc-100">
                <Target className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold font-mono text-zinc-100 tracking-tight">GOAL MANAGEMENT HUB</h1>
                <p className="text-xs text-zinc-400 font-mono">Define high-level objectives, link production projects, and manage client pipeline</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeSection !== 'freelance' && (
              <>
                <button
                  onClick={() => setShowGoalModal(true)}
                  className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> New Main Goal
                </button>
                <button
                  onClick={() => setShowProjectModal(true)}
                  className="px-3 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow"
                >
                  <Plus className="w-3.5 h-3.5" /> New Project
                </button>
              </>
            )}
            {activeSection === 'freelance' && (
              <button
                onClick={() => setShowClientModal(true)}
                className="px-3.5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow"
              >
                <Plus className="w-3.5 h-3.5" /> Add Client / Lead
              </button>
            )}
          </div>
        </div>

        {/* 4 PRIMARY SUB-SECTION SWITCHER */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          <button
            onClick={() => setActiveSection('video_editing')}
            className={`p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${
              activeSection === 'video_editing'
                ? 'bg-zinc-900 border-zinc-400 text-zinc-100 shadow-sm ring-1 ring-zinc-400/20'
                : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            <Clapperboard className="w-4 h-4 text-zinc-300" />
            <div>
              <div className="font-mono text-xs font-bold">1. Video Editing</div>
              <div className="text-[10px] text-zinc-400">Portfolio & Client Edits</div>
            </div>
          </button>

          <button
            onClick={() => setActiveSection('marketing')}
            className={`p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${
              activeSection === 'marketing'
                ? 'bg-zinc-900 border-zinc-400 text-zinc-100 shadow-sm ring-1 ring-zinc-400/20'
                : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            <Megaphone className="w-4 h-4 text-zinc-300" />
            <div>
              <div className="font-mono text-xs font-bold">2. Marketing</div>
              <div className="text-[10px] text-zinc-400">Instagram, TikTok, YouTube</div>
            </div>
          </button>

          <button
            onClick={() => setActiveSection('freelance')}
            className={`p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${
              activeSection === 'freelance'
                ? 'bg-zinc-900 border-zinc-400 text-zinc-100 shadow-sm ring-1 ring-zinc-400/20'
                : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            <Briefcase className="w-4 h-4 text-zinc-300" />
            <div>
              <div className="font-mono text-xs font-bold">3. Freelance / Clients</div>
              <div className="text-[10px] text-zinc-400">Outreach CRM & Pipeline</div>
            </div>
          </button>

          <button
            onClick={() => setActiveSection('skills')}
            className={`p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${
              activeSection === 'skills'
                ? 'bg-zinc-900 border-zinc-400 text-zinc-100 shadow-sm ring-1 ring-zinc-400/20'
                : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-zinc-300" />
            <div>
              <div className="font-mono text-xs font-bold">4. Skills / Learning</div>
              <div className="text-[10px] text-zinc-400">Techniques & VFX Mastery</div>
            </div>
          </button>
        </div>

        {/* MARKETING PLATFORMS SUB-PILLS */}
        {activeSection === 'marketing' && (
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-zinc-800/60 overflow-x-auto">
            <span className="text-[11px] font-mono text-zinc-400 mr-2">PLATFORMS:</span>
            {(['all', 'instagram', 'tiktok', 'youtube', 'linkedin', 'fiverr'] as const).map((plat) => (
              <button
                key={plat}
                onClick={() => setMarketingPlatform(plat)}
                className={`px-2.5 py-1 rounded text-xs font-mono uppercase transition-all ${
                  marketingPlatform === plat
                    ? 'bg-zinc-100 text-zinc-950 font-bold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {plat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. SECTION CONTENT: VIDEO EDITING / MARKETING / SKILLS / FREELANCE */}
      <div key={activeSection + (marketingPlatform || '')} className="page-transition space-y-6">
        {activeSection !== 'freelance' && (
          <div className="space-y-6">
          {/* MAIN GOALS LIST */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" /> Primary Objectives / Main Goals ({sectionGoals.length})
              </h2>
            </div>

            {sectionGoals.length === 0 ? (
              <div className="p-8 text-center bg-zinc-950 border border-zinc-800 rounded-xl">
                <p className="text-xs font-mono text-zinc-400 mb-3">No main goals defined for this section yet.</p>
                <button
                  onClick={() => setShowGoalModal(true)}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded text-xs font-mono"
                >
                  + Add First Goal
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sectionGoals.map((g) => {
                  const linkedProjects = projects.filter((p) => p.goal_id === g.id);
                  return (
                    <div
                      key={g.id}
                      className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700/80 rounded-xl p-5 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-purple-950/60 border border-purple-800/80 text-purple-300 uppercase font-bold">
                              🎯 MAIN GOAL
                            </span>
                            <span className={`px-2 py-0.5 text-[10px] font-mono rounded border ${getPriorityColor(g.priority)}`}>
                              {g.priority || 'High'}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-zinc-100 font-sans mt-1.5">{g.title}</h3>
                        </div>
                        <button
                          onClick={(e) => handleDeleteGoal(g.id, e)}
                          className="p-1 text-zinc-400 hover:text-rose-400 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {g.description && <p className="text-xs text-zinc-400 leading-relaxed">{g.description}</p>}

                      <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pt-2 border-t border-zinc-900">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-purple-400" />
                          {g.target_date ? `Deadline: ${g.target_date}` : 'No deadline'}
                        </span>
                        <span className="text-zinc-300 font-bold">{linkedProjects.length} Projects Linked</span>
                      </div>

                      {/* Nested Projects inside this Goal */}
                      {linkedProjects.length > 0 && (
                        <div className="space-y-1.5 pt-2">
                          <span className="text-[10px] font-mono uppercase text-zinc-400 block">Linked Projects:</span>
                          <div className="space-y-1.5">
                            {linkedProjects.map((lp) => (
                              <div
                                key={lp.id}
                                onClick={() => onOpenProject(lp.id)}
                                className="p-2.5 bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 rounded-lg flex items-center justify-between cursor-pointer group transition-all"
                              >
                                <div className="flex items-center gap-2">
                                  <Video className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-100" />
                                  <span className="text-xs font-medium text-zinc-200 group-hover:text-white">{lp.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-1.5 py-0.5 text-[9px] font-mono rounded border ${getPriorityColor(lp.priority)}`}>
                                    {lp.priority}
                                  </span>
                                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-100 transition-transform group-hover:translate-x-0.5" />
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

          {/* ALL PROJECTS IN THIS SECTION */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Video className="w-4 h-4 text-cyan-400" /> Production Projects Workspace ({sectionProjects.length})
              </h2>
              <button
                onClick={() => setShowProjectModal(true)}
                className="text-xs font-mono text-zinc-400 hover:text-zinc-100 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Project
              </button>
            </div>

            {sectionProjects.length === 0 ? (
              <div className="p-8 text-center bg-zinc-950 border border-zinc-800 rounded-xl">
                <p className="text-xs font-mono text-zinc-400 mb-2">No projects created in this section.</p>
                <button
                  onClick={() => setShowProjectModal(true)}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded text-xs font-mono"
                >
                  + Create First Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sectionProjects.map((p) => {
                  const goal = goals.find((g) => g.id === p.goal_id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => onOpenProject(p.id)}
                      className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-750 hover:border-zinc-600 ring-1 ring-white/[0.06] rounded-xl p-4.5 cursor-pointer group transition-all flex flex-col justify-between space-y-4 shadow-md shadow-black/40 hover:shadow-xl"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 font-bold uppercase">
                              {p.status}
                            </span>
                            <span className={`px-2 py-0.5 text-[9px] font-mono rounded border ${getPriorityColor(p.priority)}`}>
                              {p.priority}
                            </span>
                          </div>
                          <button
                            onClick={(e) => handleDeleteProject(p.id, e)}
                            className="p-1 text-zinc-400 hover:text-rose-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h3 className="text-base font-bold text-zinc-100 group-hover:text-white font-sans transition-colors">
                          {p.name}
                        </h3>

                        {p.description && (
                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{p.description}</p>
                        )}
                      </div>

                      <div className="space-y-2 pt-2 border-t border-zinc-800">
                        {goal && (
                          <div className="text-[11px] font-mono text-purple-300 font-semibold truncate">
                            🎯 Goal: {goal.title}
                          </div>
                        )}
                        {p.client_name && (
                          <div className="text-[11px] font-mono text-zinc-400 truncate">
                            👤 Client: <span className="text-zinc-200 font-semibold">{p.client_name}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-zinc-500" />
                            {p.deadline || 'No deadline'}
                          </span>
                          <span className="flex items-center gap-1 text-zinc-200 font-bold group-hover:text-blue-400 transition-colors">
                            Open Workspace <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. FREELANCE / CLIENTS CRM SUB-SECTION */}
      {activeSection === 'freelance' && (
        <div className="space-y-6">
          {/* CRM Funnel Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Total Leads</span>
              <span className="text-2xl font-bold font-mono text-zinc-100 mt-1 block">{clients.length}</span>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Contacted</span>
              <span className="text-2xl font-bold font-mono text-blue-400 mt-1 block">
                {clients.filter((c) => c.status === 'Contacted').length}
              </span>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Agreed / In Talk</span>
              <span className="text-2xl font-bold font-mono text-cyan-400 mt-1 block">
                {clients.filter((c) => c.status === 'Agreed').length}
              </span>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Active Clients</span>
              <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
                {clients.filter((c) => c.status === 'Client' || c.status === 'Completed').length}
              </span>
            </div>
          </div>

          {/* CLIENTS TABLE / CARDS */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" /> Client Outreach & Pipeline ({clients.length})
              </h2>
              <button
                onClick={() => setShowClientModal(true)}
                className="px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-xs rounded-md shadow flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Client
              </button>
            </div>

            {clients.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 font-mono text-xs">No client records yet. Click Add Client to start.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-zinc-900/60 font-mono text-[11px] text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Client Name & Surname</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Deadline</th>
                      <th className="py-3 px-4">Linked Project</th>
                      <th className="py-3 px-4">Revenue</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {clients.map((c) => {
                      const linkedP = projects.find((p) => p.id === c.linked_project_id);
                      return (
                        <tr key={c.id} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="py-3 px-4 font-medium text-zinc-200">
                            <div className="font-bold text-zinc-100">{c.name}</div>
                            {c.notes && <div className="text-[11px] text-zinc-400 line-clamp-1">{c.notes}</div>}
                          </td>
                          <td className="py-3 px-4">{getClientStatusBadge(c.status)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 text-[10px] font-mono rounded border ${getPriorityColor(c.priority)}`}>
                              {c.priority || 'Medium'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-zinc-300">{c.deadline || '—'}</td>
                          <td className="py-3 px-4">
                            {linkedP ? (
                              <button
                                onClick={() => onOpenProject(linkedP.id)}
                                className="text-cyan-400 hover:underline font-mono text-[11px] flex items-center gap-1"
                              >
                                {linkedP.name} <ExternalLink className="w-3 h-3" />
                              </button>
                            ) : (
                              <span className="text-zinc-400 font-mono">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                            {c.revenue ? `$${c.revenue}` : '$0'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteClient(c.id)}
                              className="p-1 text-zinc-400 hover:text-rose-400 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
      </div>

      {/* MODAL: CREATE MAIN GOAL */}
      {showGoalModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl modal-transition">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-400" /> Define New Main Goal
                </h3>
                <button onClick={() => setShowGoalModal(false)} className="text-zinc-400 hover:text-white text-xs">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateGoal} className="space-y-4 font-sans">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Goal Title (მაგ: PORTFOLIO UPDATE)</label>
                  <input
                    type="text"
                    required
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    placeholder="e.g. PORTFOLIO UPDATE (2026)"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Description & Outcome</label>
                  <textarea
                    rows={3}
                    value={goalDesc}
                    onChange={(e) => setGoalDesc(e.target.value)}
                    placeholder="What is the objective of this main goal?"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Target Deadline</label>
                    <input
                      type="date"
                      value={goalDate}
                      onChange={(e) => setGoalDate(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Priority</label>
                    <select
                      value={goalPriority}
                      onChange={(e) => setGoalPriority(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-900">
                  <button
                    type="button"
                    onClick={() => setShowGoalModal(false)}
                    className="px-3 py-2 text-xs text-zinc-400 hover:text-white font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs rounded-lg shadow"
                  >
                    Save Main Goal
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL: CREATE PROJECT */}
      {showProjectModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl modal-transition">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                  <Video className="w-4 h-4 text-cyan-400" /> Create Production Project
                </h3>
                <button onClick={() => setShowProjectModal(false)} className="text-zinc-400 hover:text-white text-xs">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4 font-sans">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Project Name (მაგ: Talking Head - AD)</label>
                  <input
                    type="text"
                    required
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    placeholder="e.g. Talking Head - AD"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Short Description</label>
                  <input
                    type="text"
                    value={projDesc}
                    onChange={(e) => setProjDesc(e.target.value)}
                    placeholder="e.g. Fast-paced commercial edit with sound hits"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Link to Main Goal (Optional)</label>
                    <select
                      value={projGoalId}
                      onChange={(e) => setProjGoalId(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400"
                    >
                      <option value="">-- Standalone Project --</option>
                      {sectionGoals.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Priority</label>
                    <select
                      value={projPriority}
                      onChange={(e) => setProjPriority(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard / High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Deadline</label>
                    <input
                      type="date"
                      value={projDeadline}
                      onChange={(e) => setProjDeadline(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Client / User Name (Optional)</label>
                    <input
                      type="text"
                      value={projClientName}
                      onChange={(e) => setProjClientName(e.target.value)}
                      placeholder="e.g. Apex Gym (David Miller)"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-900">
                  <button
                    type="button"
                    onClick={() => setShowProjectModal(false)}
                    className="px-3 py-2 text-xs text-zinc-400 hover:text-white font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs rounded-lg shadow"
                  >
                    Create & Open Workspace
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL: CREATE CLIENT */}
      {showClientModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl modal-transition">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" /> Add Client / Lead Record
                </h3>
                <button onClick={() => setShowClientModal(false)} className="text-zinc-400 hover:text-white text-xs">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateClient} className="space-y-4 font-sans">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">First & Last Name / Brand Name</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. David Miller (Apex Fitness)"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Outreach Status</label>
                    <select
                      value={clientStatus}
                      onChange={(e) => setClientStatus(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400"
                    >
                      <option value="Contacted">Contacted</option>
                      <option value="Ignored">Ignored / Ghosted</option>
                      <option value="Agreed">Agreed / In Discussion</option>
                      <option value="Client">Active Client</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Priority</label>
                    <select
                      value={clientPriority}
                      onChange={(e) => setClientPriority(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Deadline / Follow-Up</label>
                    <input
                      type="date"
                      value={clientDeadline}
                      onChange={(e) => setClientDeadline(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Project Revenue ($)</label>
                    <input
                      type="number"
                      value={clientRevenue || ''}
                      onChange={(e) => setClientRevenue(Number(e.target.value))}
                      placeholder="800"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Link to Existing Project</label>
                  <select
                    value={clientLinkedProj}
                    onChange={(e) => setClientLinkedProj(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400"
                  >
                    <option value="">-- No Linked Project --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.section})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Notes & Scope</label>
                  <textarea
                    rows={2}
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    placeholder="Key deliverables, contract details, etc."
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-900">
                  <button
                    type="button"
                    onClick={() => setShowClientModal(false)}
                    className="px-3 py-2 text-xs text-zinc-400 hover:text-white font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs rounded-lg shadow"
                  >
                    Save Client
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
