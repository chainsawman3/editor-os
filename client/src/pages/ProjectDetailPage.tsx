import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { Project, Task, ProjectReference, ProjectPriority, ProjectStatus } from '../types';
import { exportScriptToWord } from '../utils/exportDocx';
import {
  ChevronLeft,
  FileText,
  Download,
  Link as LinkIcon,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  Sparkles,
  ExternalLink,
  Video,
  Image,
  Layers,
  Clock,
  User,
  Copy,
  Check,
  Zap,
  Volume2,
  Film,
  Megaphone,
  AlignLeft,
  Share2,
  Bookmark
} from 'lucide-react';
import { ProjectDetailSkeleton } from '../components/common/SkeletonLoader';

interface ProjectDetailPageProps {
  projectId: string;
  onBack: () => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ projectId, onBack }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'script' | 'references' | 'ideas' | 'tasks'>('script');

  // Script State
  const [scriptContent, setScriptContent] = useState('');
  const [isSavingScript, setIsSavingScript] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // New Reference Modal / Form
  const [showRefModal, setShowRefModal] = useState(false);
  const [refTitle, setRefTitle] = useState('');
  const [refUrl, setRefUrl] = useState('');
  const [refType, setRefType] = useState<'video' | 'image' | 'link'>('video');
  const [refNotes, setRefNotes] = useState('');

  // New Idea Form
  const [newIdeaText, setNewIdeaText] = useState('');

  // New Task Form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskStage, setNewTaskStage] = useState('Editing');
  const [newTaskDue, setNewTaskDue] = useState('');

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const res = await api.getProject(projectId);
      if (res && res.project) {
        setProject(res.project);
        setTasks(res.tasks || []);
        setScriptContent(res.project.script_content || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const handleSaveScript = async () => {
    if (!project) return;
    setIsSavingScript(true);
    await api.updateProject(projectId, { script_content: scriptContent });
    setTimeout(() => setIsSavingScript(false), 500);
  };

  const handleCopyScript = () => {
    if (!scriptContent) return;
    navigator.clipboard.writeText(scriptContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const insertSnippet = (snippet: string) => {
    if (!textareaRef.current) {
      setScriptContent((prev) => (prev ? `${prev}\n\n${snippet}` : snippet));
      return;
    }
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const newText = text.substring(0, start) + snippet + text.substring(end);
    setScriptContent(newText);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 0);
  };

  const handleExportWord = () => {
    if (!project) return;
    exportScriptToWord({
      name: project.name,
      client_name: project.client_name,
      deadline: project.deadline,
      priority: project.priority,
      description: project.description,
      script_content: scriptContent
    });
  };

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!project) return;
    const updated = await api.updateProject(projectId, { status: newStatus });
    setProject({ ...project, status: updated.status });
  };

  const handleToggleTask = async (task: Task) => {
    const nextCompleted = !task.completed;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: nextCompleted } : t)));
    await api.updateTask(task.id, { completed: nextCompleted });
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const title = newTaskTitle.trim();
    const stage = newTaskStage;
    const due = newTaskDue || project?.deadline || null;

    setNewTaskTitle('');
    setNewTaskDue('');

    const created = await api.createTask({
      project_id: projectId,
      title,
      stage,
      due_date: due
    });

    setTasks((prev) => [created, ...prev.filter((t) => t.id !== created.id)]);
  };

  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await api.deleteTask(id);
  };

  const handleAddReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !refTitle.trim() || !refUrl.trim()) return;

    const currentRefs = project.references || [];
    const newRef: ProjectReference = {
      id: `ref_${Date.now()}`,
      title: refTitle.trim(),
      url: refUrl.trim(),
      type: refType,
      notes: refNotes.trim()
    };

    const updatedRefs = [...currentRefs, newRef];
    await api.updateProject(projectId, { references: updatedRefs });

    setRefTitle('');
    setRefUrl('');
    setRefNotes('');
    setShowRefModal(false);
    loadProjectData();
  };

  const handleDeleteReference = async (refId: string) => {
    if (!project) return;
    const updatedRefs = (project.references || []).filter((r) => r.id !== refId);
    await api.updateProject(projectId, { references: updatedRefs });
    loadProjectData();
  };

  const handleAddIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !newIdeaText.trim()) return;

    const currentIdeas = project.creative_ideas || [];
    const updatedIdeas = [...currentIdeas, newIdeaText.trim()];
    await api.updateProject(projectId, { creative_ideas: updatedIdeas });

    setNewIdeaText('');
    loadProjectData();
  };

  const handleDeleteIdea = async (idx: number) => {
    if (!project) return;
    const updatedIdeas = (project.creative_ideas || []).filter((_, i) => i !== idx);
    await api.updateProject(projectId, { creative_ideas: updatedIdeas });
    loadProjectData();
  };

  if (loading) {
    return <ProjectDetailSkeleton />;
  }

  if (!project) {
    return (
      <div className="p-12 text-center max-w-xl mx-auto space-y-4">
        <p className="text-zinc-400 font-mono text-xs">Project deliverable not found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-750 rounded-xl text-xs font-semibold"
        >
          Back
        </button>
      </div>
    );
  }

  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  // Words & Estimated Video Duration calculation
  const wordCount = scriptContent.split(/\s+/).filter(Boolean).length;
  const estimatedSeconds = Math.round((wordCount / 140) * 60); // 140 words per minute average speaking rate
  const estMin = Math.floor(estimatedSeconds / 60);
  const estSec = estimatedSeconds % 60;
  const formattedDuration = `${estMin}:${String(estSec).padStart(2, '0')}`;

  const getPriorityColor = (p?: string) => {
    switch (p) {
      case 'Hard':
      case 'High':
        return 'text-rose-300 bg-rose-950/60 border-rose-800/80 shadow-rose-950/40';
      case 'Medium':
        return 'text-amber-300 bg-amber-950/60 border-amber-800/80 shadow-amber-950/40';
      case 'Low':
      default:
        return 'text-emerald-300 bg-emerald-950/60 border-emerald-800/80 shadow-emerald-950/40';
    }
  };

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'Ready':
      case 'Posted':
      case 'Completed':
        return { dot: 'bg-emerald-400', style: 'bg-emerald-950/80 border-emerald-700 text-emerald-300' };
      case 'In Progress':
        return { dot: 'bg-amber-400 animate-pulse', style: 'bg-amber-950/80 border-amber-700 text-amber-300' };
      case 'Paused':
        return { dot: 'bg-zinc-500', style: 'bg-zinc-900 border-zinc-800 text-zinc-400' };
      case 'Planning':
      default:
        return { dot: 'bg-blue-400', style: 'bg-blue-950/80 border-blue-700 text-blue-300' };
    }
  };

  const statusBadge = getStatusBadge(project.status);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. PROJECT TOP HERO & METADATA CARD */}
      <div className="bg-zinc-950/90 border border-zinc-800/90 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-md space-y-5">
        {/* Subtle Ambient Glow in background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/[0.04] rounded-full blur-3xl pointer-events-none" />

        {/* Navigation & Status Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <button
            onClick={onBack}
            className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 transition-all shadow-sm group w-fit"
            title="Go back to previous page"
          >
            <ChevronLeft className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            <span>Back</span>
          </button>

          {/* Interactive Status Selector with Live Indicator */}
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Status:</span>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${statusBadge.style} shadow-sm`}>
              <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
              <select
                value={project.status}
                onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
                className="bg-transparent text-xs font-bold font-sans outline-none cursor-pointer pr-1"
              >
                <option value="Planning" className="bg-zinc-950 text-blue-300">Planning</option>
                <option value="In Progress" className="bg-zinc-950 text-amber-300">In Progress</option>
                <option value="Ready" className="bg-zinc-950 text-emerald-300">Ready for Review</option>
                <option value="Posted" className="bg-zinc-950 text-purple-300">Posted / Published</option>
              </select>
            </div>
          </div>
        </div>

        {/* Project Title & Key Badges */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10 pt-1">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 text-[11px] font-mono font-bold rounded-lg border shadow-sm ${getPriorityColor(project.priority)}`}>
                PRIORITY: {project.priority}
              </span>
              <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 uppercase shadow-sm">
                {project.section.replace('_', ' ')}
              </span>
              {project.client_name && (
                <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold rounded-lg bg-cyan-950/90 border border-cyan-700/80 text-cyan-300 flex items-center gap-1.5 shadow-sm">
                  <User className="w-3.5 h-3.5 text-cyan-400" /> {project.client_name}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-sans text-zinc-100 tracking-tight">
              {project.name}
            </h1>

            {project.description && (
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                {project.description}
              </p>
            )}
          </div>

          {/* Telemetry Pill (Deadline & Progress) */}
          <div className="flex items-center gap-4 bg-zinc-900/80 border border-zinc-800/90 p-3.5 rounded-2xl shadow-inner shrink-0 font-sans">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-800/80 text-purple-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">Deadline</span>
                <span className="text-xs font-bold font-mono text-zinc-100">{project.deadline || 'No Deadline'}</span>
              </div>
            </div>

            <div className="h-8 w-px bg-zinc-800" />

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">Progress</span>
                <span className="text-xs font-bold font-mono text-emerald-400">
                  {completedTasksCount}/{tasks.length} Tasks ({progressPercent}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. REFINED WORKSPACE SEGMENTED TABS */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900/90 border border-zinc-800/90 rounded-2xl overflow-x-auto relative z-10">
          <button
            onClick={() => setActiveTab('script')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'script'
                ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/80 ring-1 ring-white/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
            }`}
          >
            <FileText className={`w-3.5 h-3.5 ${activeTab === 'script' ? 'text-blue-400' : 'text-zinc-500'}`} />
            <span>Script & Teleprompter</span>
          </button>

          <button
            onClick={() => setActiveTab('references')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'references'
                ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/80 ring-1 ring-white/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
            }`}
          >
            <Layers className={`w-3.5 h-3.5 ${activeTab === 'references' ? 'text-cyan-400' : 'text-zinc-500'}`} />
            <span>References & Assets ({project.references?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('ideas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'ideas'
                ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/80 ring-1 ring-white/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'ideas' ? 'text-amber-400' : 'text-zinc-500'}`} />
            <span>Creative Ideas ({project.creative_ideas?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'tasks'
                ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/80 ring-1 ring-white/10'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${activeTab === 'tasks' ? 'text-emerald-400' : 'text-zinc-500'}`} />
            <span>Action Checklist ({tasks.length})</span>
          </button>
        </div>
      </div>

      {/* 3. ACTIVE TAB WORKSPACE */}
      <div key={activeTab} className="page-transition">
        {/* TAB 1: SCRIPT EDITOR & PRODUCTION BREAKDOWN */}
        {activeTab === 'script' && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-4">
              <div>
                <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" /> Script & Production Breakdown
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                  Write hooks, visual notes, voiceover scripts, audio cues, and export directly as a Word document
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={handleCopyScript}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                  title="Copy full script to clipboard"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                  <span>{isCopied ? 'Copied!' : 'Copy Script'}</span>
                </button>

                <button
                  onClick={handleSaveScript}
                  disabled={isSavingScript}
                  className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-100 border border-zinc-750 hover:border-zinc-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isSavingScript ? 'Saving...' : 'Save Script'}</span>
                </button>

                <button
                  onClick={handleExportWord}
                  className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-950/50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export to Word (.docx)</span>
                </button>
              </div>
            </div>

            {/* QUICK TEMPLATE / SNIPPET BUTTONS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" /> Snippets:
              </span>
              <button
                type="button"
                onClick={() => insertSnippet('[HOOK - 0:00 - 0:03]\n(Visual: Aggressive crash zoom onto speaker)\n(Audio: Sub bass drop + camera shutter hit)\nVOICEOVER: "..."\n\n')}
                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1"
              >
                <Film className="w-3 h-3 text-blue-400" /> + Hook Intro
              </button>
              <button
                type="button"
                onClick={() => insertSnippet('[SCENE - B-ROLL & EXPLANATION]\n(Visual: Screen capture overlay with 3D text tracker)\n(Audio: Subtle ambient synth riser)\nVOICEOVER: "..."\n\n')}
                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1"
              >
                <Video className="w-3 h-3 text-cyan-400" /> + B-Roll Scene
              </button>
              <button
                type="button"
                onClick={() => insertSnippet('(Audio: Heavy impact whoosh + glitch hit)\n')}
                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1"
              >
                <Volume2 className="w-3 h-3 text-purple-400" /> + Sound Cue
              </button>
              <button
                type="button"
                onClick={() => insertSnippet('[CTA - OUTRO]\n(Visual: Clean lower third popup with handle)\nVOICEOVER: "Follow for more daily editing breakdown breakdowns."\n\n')}
                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1"
              >
                <Megaphone className="w-3 h-3 text-emerald-400" /> + Call-to-Action
              </button>
            </div>

            {/* Custom Monospace Script Editor Area */}
            <div className="space-y-2">
              <div className="relative rounded-2xl bg-zinc-900/80 border border-zinc-800/90 shadow-inner overflow-hidden focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <textarea
                  ref={textareaRef}
                  rows={17}
                  value={scriptContent}
                  onChange={(e) => setScriptContent(e.target.value)}
                  onBlur={handleSaveScript}
                  placeholder="[HOOK - 0:00 - 0:03]&#10;(Visual: Aggressive crash zoom onto speaker)&#10;(Audio: Sub bass drop + camera shutter hit)&#10;VOICEOVER: Stop wasting 2 hours in the gym...&#10;&#10;[SCENE 1 - PROBLEM]&#10;(Visual: B-roll montage of bad form)&#10;VOICEOVER: Here is the exact breakdown...&#10;&#10;[CTA - OUTRO]&#10;VOICEOVER: Full episode on Spotify link."
                  className="w-full bg-transparent p-5 text-xs sm:text-sm font-mono text-zinc-100 leading-relaxed outline-none resize-y placeholder:text-zinc-600"
                />
              </div>

              {/* Bottom Script Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-zinc-400 px-1 pt-1">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Auto-saved locally • Word ready</span>
                  </span>
                  <span>•</span>
                  <span>Estimated Speaking Time: <strong className="text-zinc-200">{formattedDuration} min</strong></span>
                </div>

                <div className="flex items-center gap-3">
                  <span><strong className="text-zinc-200">{wordCount}</strong> words</span>
                  <span>•</span>
                  <span><strong className="text-zinc-200">{scriptContent.length}</strong> characters</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REFERENCES & ASSETS */}
        {activeTab === 'references' && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
              <div>
                <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" /> Reference Material & Asset Links ({project.references?.length || 0})
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                  Style references, sound libraries, client assets, and inspiration footage
                </p>
              </div>

              <button
                onClick={() => setShowRefModal(true)}
                className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Reference</span>
              </button>
            </div>

            {!project.references || project.references.length === 0 ? (
              <div className="py-12 text-center space-y-3 bg-zinc-900/30 border border-zinc-850 rounded-xl">
                <Layers className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400 font-medium">No reference videos, images, or asset links added yet.</p>
                <button
                  onClick={() => setShowRefModal(true)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-750 rounded-xl text-xs font-semibold"
                >
                  + Add First Reference
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.references.map((r) => (
                  <div
                    key={r.id}
                    className="bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 space-y-3 transition-all flex flex-col justify-between shadow-sm"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 text-[10px] font-mono uppercase rounded-lg bg-zinc-900 border border-zinc-800 text-cyan-300 font-bold flex items-center gap-1.5">
                          {r.type === 'video' ? <Video className="w-3 h-3 text-blue-400" /> : r.type === 'image' ? <Image className="w-3 h-3 text-emerald-400" /> : <LinkIcon className="w-3 h-3 text-purple-400" />}
                          <span>{r.type}</span>
                        </span>
                        <button
                          onClick={() => handleDeleteReference(r.id)}
                          className="p-1 text-zinc-400 hover:text-rose-400 rounded transition-colors"
                          title="Delete reference"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h3 className="text-xs font-bold text-zinc-100">{r.title}</h3>
                      {r.notes && <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">{r.notes}</p>}
                    </div>

                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg text-cyan-300 hover:text-cyan-200 font-mono text-[11px] flex items-center justify-between transition-colors mt-2"
                    >
                      <span className="truncate max-w-[200px]">{r.url}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CREATIVE IDEAS & BRAINSTORMING */}
        {activeTab === 'ideas' && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
            <div className="border-b border-zinc-850 pb-4">
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Creative Ideas & Brainstorming
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                Quick thoughts on transitions, sound design moments, color grade palettes, and hooks
              </p>
            </div>

            <form onSubmit={handleAddIdea} className="flex gap-2">
              <input
                type="text"
                value={newIdeaText}
                onChange={(e) => setNewIdeaText(e.target.value)}
                placeholder="e.g. Add 3D text track on the entrance doorway..."
                className="flex-1 bg-zinc-900 border border-zinc-750 focus:border-amber-500 rounded-xl p-3 text-xs text-zinc-100 outline-none"
              />
              <button
                type="submit"
                className="px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Idea</span>
              </button>
            </form>

            <div className="space-y-2 pt-2">
              {!project.creative_ideas || project.creative_ideas.length === 0 ? (
                <div className="py-8 text-center text-zinc-400 text-xs font-medium">
                  No creative ideas recorded for this project yet.
                </div>
              ) : (
                project.creative_ideas.map((idea, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-zinc-900/70 border border-zinc-800 rounded-xl flex items-center justify-between group hover:border-amber-500/50 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      <span className="text-xs text-zinc-200 leading-relaxed font-medium">{idea}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteIdea(idx)}
                      className="text-zinc-400 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Delete idea"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ACTION STEPS & CHECKLIST */}
        {activeTab === 'tasks' && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-4">
              <div>
                <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Action Steps & Task Checklist
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                  Every task is synced across Content Studio Top 5 widget, Calendar, and Executive Analytics
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-3 py-1 rounded-xl w-fit">
                {completedTasksCount} / {tasks.length} Done ({progressPercent}%)
              </span>
            </div>

            {/* Quick Add Task Form */}
            <form onSubmit={handleAddTask} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <input
                type="text"
                required
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g. Cut rough sequence & remove pauses..."
                className="sm:col-span-6 bg-zinc-900 border border-zinc-750 focus:border-emerald-500 rounded-xl p-2.5 text-xs text-zinc-100 outline-none"
              />
              <select
                value={newTaskStage}
                onChange={(e) => setNewTaskStage(e.target.value)}
                className="sm:col-span-3 bg-zinc-900 border border-zinc-750 focus:border-emerald-500 rounded-xl p-2.5 text-xs text-zinc-200 outline-none font-medium"
              >
                <option value="Planning">Planning</option>
                <option value="Editing">Editing</option>
                <option value="Sound Design">Sound Design</option>
                <option value="Color Grading">Color Grading</option>
                <option value="Export">Export</option>
              </select>
              <input
                type="date"
                value={newTaskDue}
                onChange={(e) => setNewTaskDue(e.target.value)}
                className="sm:col-span-2 bg-zinc-900 border border-zinc-750 rounded-xl p-2 text-xs text-zinc-200 outline-none font-mono"
              />
              <button
                type="submit"
                className="sm:col-span-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center transition-colors"
              >
                + Add
              </button>
            </form>

            {/* Task List */}
            <div className="space-y-2 pt-2">
              {tasks.length === 0 ? (
                <div className="py-8 text-center text-zinc-400 text-xs font-medium">
                  No action steps added to this deliverable yet.
                </div>
              ) : (
                tasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleToggleTask(t)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer group transition-all shadow-sm ${
                      t.completed
                        ? 'bg-zinc-900/30 border-zinc-900 text-zinc-500'
                        : 'bg-zinc-900/80 hover:bg-zinc-850 border-zinc-800 text-zinc-100 hover:border-emerald-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className={`p-0.5 rounded transition-colors ${
                          t.completed ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-emerald-400'
                        }`}
                      >
                        {t.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                      </button>
                      <span className={`text-xs font-sans ${t.completed ? 'line-through text-zinc-500' : 'text-zinc-100 font-medium'}`}>
                        {t.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {t.stage && (
                        <span className="px-2 py-0.5 text-[10px] font-mono uppercase rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400">
                          {t.stage}
                        </span>
                      )}
                      {t.due_date && (
                        <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-purple-400" /> {t.due_date}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(t.id);
                        }}
                        className="p-1 text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. MODAL: ADD REFERENCE */}
      {showRefModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" /> Add Asset Reference
              </h3>
              <button
                onClick={() => setShowRefModal(false)}
                className="text-zinc-500 hover:text-zinc-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddReference} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400">Reference Title *</label>
                <input
                  type="text"
                  required
                  value={refTitle}
                  onChange={(e) => setRefTitle(e.target.value)}
                  placeholder="e.g. Nike Fast Pace Motion Graphics Inspo"
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400">URL Link *</label>
                <input
                  type="url"
                  required
                  value={refUrl}
                  onChange={(e) => setRefUrl(e.target.value)}
                  placeholder="https://youtube.com/... or Google Drive"
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400">Asset Type</label>
                <select
                  value={refType}
                  onChange={(e) => setRefType(e.target.value as any)}
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-200 outline-none"
                >
                  <option value="video">Video (YouTube / Vimeo / Drive)</option>
                  <option value="image">Image (Moodboard / Frame)</option>
                  <option value="link">General Web Link / Audio Library</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400">Creative Notes / Timestamps</label>
                <textarea
                  rows={2}
                  value={refNotes}
                  onChange={(e) => setRefNotes(e.target.value)}
                  placeholder="Note timestamp 0:14 for the match cut..."
                  className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-200 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => setShowRefModal(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Save Reference
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
