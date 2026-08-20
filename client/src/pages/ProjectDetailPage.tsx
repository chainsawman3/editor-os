import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Project, Task, ProjectReference, ProjectPriority, ProjectStatus } from '../types';
import { exportScriptToWord } from '../utils/exportDocx';
import {
  ChevronLeft,
  FileText,
  Download,
  Link,
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
  AlertCircle
} from 'lucide-react';

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
    setIsSavingScript(false);
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
    await api.updateTask(task.id, { completed: !task.completed });
    loadProjectData();
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await api.createTask({
      project_id: projectId,
      title: newTaskTitle.trim(),
      stage: newTaskStage,
      due_date: newTaskDue || project?.deadline || null
    });

    setNewTaskTitle('');
    setNewTaskDue('');
    loadProjectData();
  };

  const handleDeleteTask = async (id: string) => {
    await api.deleteTask(id);
    loadProjectData();
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
    return <div className="p-8 text-center font-mono text-xs text-zinc-500">LOADING PROJECT WORKSPACE...</div>;
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-zinc-400 font-mono text-xs mb-3">Project not found.</p>
        <button onClick={onBack} className="px-3 py-1.5 bg-zinc-800 text-zinc-200 rounded text-xs font-mono">
          Back to Projects
        </button>
      </div>
    );
  }

  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

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

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. PROJECT TOP HEADER & METADATA BAR */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-xs font-mono text-zinc-400 hover:text-zinc-100 flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Goals & Projects
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-400">STATUS:</span>
            <select
              value={project.status}
              onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
              className="bg-zinc-900 border border-zinc-700 text-zinc-100 font-mono text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-zinc-400"
            >
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Ready">Ready</option>
              <option value="Posted">Posted</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 text-[10px] font-mono rounded border ${getPriorityColor(project.priority)}`}>
                PRIORITY: {project.priority}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-zinc-900 border border-zinc-800 text-zinc-300 uppercase">
                {project.section.replace('_', ' ')}
              </span>
              {project.client_name && (
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 flex items-center gap-1">
                  <User className="w-3 h-3" /> {project.client_name}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold font-sans text-zinc-100 tracking-tight">{project.name}</h1>
            {project.description && <p className="text-xs text-zinc-400 max-w-3xl leading-relaxed">{project.description}</p>}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-zinc-900/60 border border-zinc-800 p-3 rounded-lg font-mono text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <div>
                <span className="text-[10px] text-zinc-400 uppercase block">Deadline</span>
                <span className="font-bold text-zinc-200">{project.deadline || 'Not Set'}</span>
              </div>
            </div>
            <div className="h-6 w-[1px] bg-zinc-800 hidden sm:block" />
            <div>
              <span className="text-[10px] text-zinc-400 uppercase block">Progress</span>
              <span className="font-bold text-emerald-400">
                {completedTasksCount} / {tasks.length} Tasks ({progressPercent}%)
              </span>
            </div>
          </div>
        </div>

        {/* 4 WORKSPACE TABS */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-900 overflow-x-auto">
          <button
            onClick={() => setActiveTab('script')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono flex items-center gap-2 transition-all ${
              activeTab === 'script'
                ? 'bg-zinc-100 text-zinc-950 font-bold shadow'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> 📝 Script Editor & Word Export
          </button>

          <button
            onClick={() => setActiveTab('references')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono flex items-center gap-2 transition-all ${
              activeTab === 'references'
                ? 'bg-zinc-100 text-zinc-950 font-bold shadow'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> 🖼️ References & Assets ({project.references?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('ideas')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono flex items-center gap-2 transition-all ${
              activeTab === 'ideas'
                ? 'bg-zinc-100 text-zinc-950 font-bold shadow'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> 💡 Creative Ideas ({project.creative_ideas?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono flex items-center gap-2 transition-all ${
              activeTab === 'tasks'
                ? 'bg-zinc-100 text-zinc-950 font-bold shadow'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> ✅ Action Steps Checklist ({tasks.length})
          </button>
        </div>
      </div>

      {/* 2. TAB 1: SCRIPT EDITOR & WORD (.DOCX) EXPORT */}
      {activeTab === 'script' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-base font-bold font-mono text-zinc-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" /> SCRIPT & PRODUCTION BREAKDOWN
              </h2>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Write hooks, visual notes, voiceover scripts, audio cues, and export directly as a Word document.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveScript}
                disabled={isSavingScript}
                className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-mono transition-colors"
              >
                {isSavingScript ? 'Saving...' : '💾 Save Script'}
              </button>
              <button
                onClick={handleExportWord}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow"
              >
                <Download className="w-3.5 h-3.5" /> Export to Word (.docx)
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <textarea
              rows={16}
              value={scriptContent}
              onChange={(e) => setScriptContent(e.target.value)}
              onBlur={handleSaveScript}
              placeholder="[HOOK - 0:00 - 0:03]&#10;(Visual: Aggressive crash zoom onto speaker)&#10;(Audio: Sub bass drop + camera shutter hit)&#10;VOICEOVER: Stop wasting 2 hours in the gym...&#10;&#10;[SCENE 1 - PROBLEM]&#10;..."
              className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-blue-500 rounded-xl p-4 text-xs font-mono text-zinc-100 leading-relaxed focus:outline-none shadow-inner"
            />
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
              <span>Auto-saved locally • Word formatting ready</span>
              <span>{scriptContent.split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB 2: REFERENCES & ASSETS */}
      {activeTab === 'references' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" /> Reference Material & Asset Links ({project.references?.length || 0})
            </h2>
            <button
              onClick={() => setShowRefModal(true)}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-xs rounded-lg flex items-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" /> Add Reference
            </button>
          </div>

          {(!project.references || project.references.length === 0) ? (
            <div className="p-8 text-center bg-zinc-950 border border-zinc-800 rounded-xl">
              <p className="text-xs font-mono text-zinc-400 mb-3">No reference videos, images, or assets added yet.</p>
              <button
                onClick={() => setShowRefModal(true)}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded text-xs font-mono"
              >
                + Add Video / Image Reference
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.references.map((r) => (
                <div
                  key={r.id}
                  className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 space-y-2.5 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 text-[9px] font-mono uppercase rounded bg-zinc-900 border border-zinc-800 text-cyan-400 font-bold flex items-center gap-1">
                        {r.type === 'video' ? <Video className="w-3 h-3" /> : r.type === 'image' ? <Image className="w-3 h-3" /> : <Link className="w-3 h-3" />}
                        {r.type}
                      </span>
                      <button
                        onClick={() => handleDeleteReference(r.id)}
                        className="p-1 text-zinc-400 hover:text-rose-400 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-zinc-100">{r.title}</h3>
                    {r.notes && <p className="text-xs text-zinc-400 leading-relaxed">{r.notes}</p>}
                  </div>

                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg text-cyan-400 hover:text-cyan-300 font-mono text-[11px] flex items-center justify-between transition-colors"
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

      {/* 4. TAB 3: CREATIVE IDEAS & NOTES */}
      {activeTab === 'ideas' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="border-b border-zinc-800 pb-3">
            <h2 className="text-base font-bold font-mono text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> CREATIVE IDEAS & BRAINSTORMING
            </h2>
            <p className="text-xs text-zinc-400 font-sans mt-0.5">
              Quick thoughts on transitions, sound design moments, color grade palettes, and hooks.
            </p>
          </div>

          <form onSubmit={handleAddIdea} className="flex gap-2">
            <input
              type="text"
              value={newIdeaText}
              onChange={(e) => setNewIdeaText(e.target.value)}
              placeholder="e.g. Add 3D text track on the entrance doorway..."
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-xs rounded-lg shadow"
            >
              + Add Idea
            </button>
          </form>

          <div className="space-y-2 pt-2">
            {(!project.creative_ideas || project.creative_ideas.length === 0) ? (
              <p className="text-xs font-mono text-zinc-400 text-center py-4">No ideas recorded for this project yet.</p>
            ) : (
              project.creative_ideas.map((idea, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg flex items-center justify-between group hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-xs text-zinc-200">{idea}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteIdea(idx)}
                    className="text-zinc-400 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. TAB 4: ACTION STEPS & TASKS CHECKLIST */}
      {activeTab === 'tasks' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h2 className="text-base font-bold font-mono text-zinc-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> ACTION STEPS & CHECKLIST
              </h2>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Every task is synced with the Content Studio Top 5 widget and deadlines calendar.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {completedTasksCount} / {tasks.length} Done ({progressPercent}%)
            </span>
          </div>

          {/* Quick Add Task */}
          <form onSubmit={handleAddTask} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <input
              type="text"
              required
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="e.g. Cut rough sequence & remove pauses..."
              className="sm:col-span-6 bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400"
            />
            <select
              value={newTaskStage}
              onChange={(e) => setNewTaskStage(e.target.value)}
              className="sm:col-span-3 bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-400"
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
              className="sm:col-span-2 bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-400"
            />
            <button
              type="submit"
              className="sm:col-span-1 bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-xs rounded-lg shadow flex items-center justify-center"
            >
              + Add
            </button>
          </form>

          {/* Task List */}
          <div className="space-y-2 pt-2">
            {tasks.length === 0 ? (
              <p className="text-xs font-mono text-zinc-400 text-center py-4">No tasks added to this project yet.</p>
            ) : (
              tasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleToggleTask(t)}
                  className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer group transition-all ${
                    t.completed
                      ? 'bg-zinc-900/30 border-zinc-900 text-zinc-400'
                      : 'bg-zinc-900/90 border-zinc-800 text-zinc-100 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className={`p-0.5 rounded transition-colors ${
                        t.completed ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-200'
                      }`}
                    >
                      {t.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    </button>
                    <span className={`text-xs font-sans ${t.completed ? 'line-through text-zinc-400' : 'text-zinc-100 font-medium'}`}>
                      {t.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {t.stage && (
                      <span className="px-2 py-0.5 text-[9px] font-mono uppercase rounded bg-zinc-950 border border-zinc-800 text-zinc-400">
                        {t.stage}
                      </span>
                    )}
                    {t.due_date && (
                      <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-purple-400" /> {t.due_date}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(t.id);
                      }}
                      className="p-1 text-zinc-400 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
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

      {/* MODAL: ADD REFERENCE */}
      {showRefModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-mono font-bold text-sm text-zinc-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" /> Add Video / Asset Reference
              </h3>
              <button onClick={() => setShowRefModal(false)} className="text-zinc-400 hover:text-white text-xs font-mono">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddReference} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={refTitle}
                  onChange={(e) => setRefTitle(e.target.value)}
                  placeholder="e.g. Nike Kinetic Cut Reference"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">URL / Link</label>
                  <input
                    type="url"
                    required
                    value={refUrl}
                    onChange={(e) => setRefUrl(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">Type</label>
                  <select
                    value={refType}
                    onChange={(e) => setRefType(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400"
                  >
                    <option value="video">Video Link</option>
                    <option value="image">Image Moodboard</option>
                    <option value="link">Other Asset Link</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Notes / Why Saved</label>
                <textarea
                  rows={2}
                  value={refNotes}
                  onChange={(e) => setRefNotes(e.target.value)}
                  placeholder="What specific technique to copy or study?"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setShowRefModal(false)}
                  className="px-3 py-2 text-xs font-mono text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-mono font-bold text-xs rounded-lg shadow"
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
