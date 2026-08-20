import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Project, Task, Blocker, TimeLog, BeforeAfterEntry } from '../types';
import { ProgressBar } from '../components/common/ProgressBar';
import { HealthBadge } from '../components/common/HealthBadge';
import { DifficultyBadge } from '../components/common/DifficultyBadge';
import { NextActionBadge } from '../components/common/NextActionBadge';
import { BlockerTag } from '../components/common/BlockerTag';
import { FocusModeView } from '../components/project/FocusModeView';
import { TimeTrackerModal } from '../components/project/TimeTrackerModal';
import { BeforeAfterSection } from '../components/project/BeforeAfterSection';
import {
  ChevronLeft,
  Flame,
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  AlertOctagon,
  Trash2,
  Edit2
} from 'lucide-react';

interface ProjectDetailPageProps {
  projectId: string;
  onBack: () => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ projectId, onBack }) => {
  const [data, setData] = useState<{
    project: Project;
    tasks: Task[];
    blockers: Blocker[];
    timeLogs: TimeLog[];
    beforeAfter: BeforeAfterEntry[];
    comments: any[];
    devLogs: any[];
    knowledgeEntries: any[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tasks' | 'timelogs' | 'before_after' | 'notes'>('tasks');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskStage, setNewTaskStage] = useState('Editing');
  const [newBlockerDesc, setNewBlockerDesc] = useState('');
  const [showBlockerInput, setShowBlockerInput] = useState(false);

  const loadProject = async () => {
    try {
      const res = await api.getProject(projectId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const handleToggleTask = async (task: Task) => {
    await api.updateTask(task.id, { completed: !task.completed });
    loadProject();
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await api.createTask({
      title: newTaskTitle.trim(),
      project_id: projectId,
      stage: newTaskStage
    });

    setNewTaskTitle('');
    loadProject();
  };

  const handleDeleteTask = async (id: string) => {
    await api.deleteTask(id);
    loadProject();
  };

  const handleSaveNextAction = async (newAction: string) => {
    await api.updateProject(projectId, { next_action: newAction });
    loadProject();
  };

  const handleAddBlocker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockerDesc.trim()) return;

    await api.addBlocker(projectId, newBlockerDesc.trim());
    setNewBlockerDesc('');
    setShowBlockerInput(false);
    loadProject();
  };

  const handleResolveBlocker = async (blockerId: string) => {
    await api.resolveBlocker(projectId, blockerId);
    loadProject();
  };

  const handleActualDifficultyChange = async (diff: any) => {
    await api.updateProject(projectId, { actual_difficulty: diff });
    loadProject();
  };

  if (loading) {
    return <div className="p-8 text-center font-mono text-xs text-zinc-500">LOADING PROJECT WORKSPACE...</div>;
  }

  if (!data || !data.project) {
    return (
      <div className="p-8 text-center font-mono text-xs text-zinc-500">
        Project not found.
        <button onClick={onBack} className="block mx-auto mt-2 underline">
          Go Back
        </button>
      </div>
    );
  }

  const { project, tasks, blockers, timeLogs, beforeAfter } = data;
  const activeBlockersList = blockers.filter((b) => b.active);

  // Focus Mode Overlay
  if (isFocusMode) {
    return (
      <FocusModeView
        project={project}
        tasks={tasks}
        onToggleTask={handleToggleTask}
        onSaveNextAction={handleSaveNextAction}
        onExit={() => setIsFocusMode(false)}
      />
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 font-mono text-xs text-zinc-400 hover:text-zinc-100"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>BACK TO ALL PROJECTS</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFocusMode(true)}
            className="px-3.5 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>ENTER FOCUS MODE</span>
          </button>

          <button
            onClick={() => setIsTimeModalOpen(true)}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded font-mono text-xs flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Log Time</span>
          </button>
        </div>
      </div>

      {/* Project Overview Card */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded font-bold uppercase">
                {project.type}
              </span>
              <HealthBadge status={project.health_status} isOverdue={project.isOverdue} />
              {project.deadline && (
                <span className="text-zinc-400 text-[11px]">
                  Deadline: <span className="text-zinc-200 font-semibold">{project.deadline}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold font-mono text-zinc-100 tracking-tight">{project.name}</h1>
            {project.description && (
              <p className="text-zinc-300 text-xs leading-relaxed font-sans">{project.description}</p>
            )}
          </div>

          {/* Difficulty & Time Summary */}
          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 shrink-0 font-mono text-xs">
            <DifficultyBadge level={project.expected_difficulty} prefix="EXP" />
            <div className="flex items-center gap-1 text-[11px] text-zinc-400">
              <span>ACTUAL:</span>
              <select
                value={project.actual_difficulty || ''}
                onChange={(e) => handleActualDifficultyChange(e.target.value || null)}
                className="py-0.5 px-1.5 bg-zinc-900 text-zinc-200 text-xs border border-zinc-700 rounded"
              >
                <option value="">Pending Completion</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Extreme">Extreme</option>
              </select>
            </div>

            <div className="text-zinc-300 font-bold flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>{project.totalHours || 0} Hours Logged</span>
            </div>
          </div>
        </div>

        {/* Next Action Box */}
        <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <NextActionBadge
              actionText={project.next_action}
              editable={true}
              onSave={handleSaveNextAction}
            />
          </div>
          <span className="text-[10px] font-mono text-zinc-400">Aggregated to Dashboard</span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>PROJECT PROGRESS</span>
            <span>
              {project.completedTasks}/{project.totalTasks} Tasks Complete
            </span>
          </div>
          <ProgressBar percent={project.progressPercent || 0} size="md" />
        </div>
      </div>

      {/* Active Roadblock / Blocker Alert */}
      {activeBlockersList.length > 0 && (
        <div className="space-y-2">
          {activeBlockersList.map((b) => (
            <BlockerTag
              key={b.id}
              id={b.id}
              description={b.description}
              onResolve={handleResolveBlocker}
            />
          ))}
        </div>
      )}

      {/* Workspace Tabs */}
      <div className="border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-2.5 border-b-2 font-bold transition-all ${
              activeTab === 'tasks' ? 'border-zinc-100 text-zinc-100' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Tasks & Milestones ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('timelogs')}
            className={`py-2.5 border-b-2 font-bold transition-all ${
              activeTab === 'timelogs' ? 'border-zinc-100 text-zinc-100' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Stage Time Tracking ({timeLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('before_after')}
            className={`py-2.5 border-b-2 font-bold transition-all ${
              activeTab === 'before_after' ? 'border-zinc-100 text-zinc-100' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Before vs. After Archive ({beforeAfter.length})
          </button>
        </div>

        {activeTab === 'tasks' && (
          <button
            onClick={() => setShowBlockerInput((prev) => !prev)}
            className="text-[11px] font-mono px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded"
          >
            + Flag Blocker [!]
          </button>
        )}
      </div>

      {/* Roadblock input row */}
      {showBlockerInput && (
        <form onSubmit={handleAddBlocker} className="p-3 bg-zinc-950 border border-zinc-700 rounded-lg flex gap-2">
          <input
            type="text"
            placeholder="Describe the roadblock causing work to stall..."
            value={newBlockerDesc}
            onChange={(e) => setNewBlockerDesc(e.target.value)}
            className="flex-1 text-xs"
            autoFocus
          />
          <button type="submit" className="px-3 py-1.5 bg-zinc-100 text-zinc-950 font-mono text-xs font-bold rounded">
            Add Blocker
          </button>
        </form>
      )}

      {/* TAB 1: Tasks Checklist */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Add Task Input */}
          <form onSubmit={handleAddTask} className="flex gap-2">
            <input
              type="text"
              placeholder="Add next production task or sub-step..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 text-xs"
            />
            <select
              value={newTaskStage}
              onChange={(e) => setNewTaskStage(e.target.value)}
              className="text-xs bg-zinc-900"
            >
              <option value="Research">Research</option>
              <option value="Editing">Editing</option>
              <option value="Sound Design">Sound Design</option>
              <option value="Color Grading">Color Grading</option>
              <option value="Motion Graphics">Motion Graphics</option>
              <option value="Export">Export</option>
            </select>
            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded font-mono font-bold text-xs"
            >
              + Add
            </button>
          </form>

          {/* Tasks List */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg divide-y divide-zinc-900">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 flex items-center justify-between hover:bg-zinc-900/40 text-xs transition-colors group"
              >
                <div
                  onClick={() => handleToggleTask(task)}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <button className="text-zinc-500 group-hover:text-zinc-200">
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-zinc-100" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-600" />
                    )}
                  </button>
                  <span
                    className={`font-sans ${
                      task.completed ? 'line-through text-zinc-600' : 'text-zinc-100 font-medium'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono text-[10px]">
                  {task.stage && (
                    <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded">
                      {task.stage}
                    </span>
                  )}
                  {task.due_date && <span className="text-zinc-500">{task.due_date}</span>}
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-zinc-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Time Logs */}
      {activeTab === 'timelogs' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsTimeModalOpen(true)}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded font-mono text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Stage Session</span>
            </button>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 text-[10px]">
                <tr>
                  <th className="p-3">STAGE</th>
                  <th className="p-3">HOURS</th>
                  <th className="p-3">DATE</th>
                  <th className="p-3">NOTES</th>
                  <th className="p-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-300">
                {timeLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-zinc-500 italic">
                      No time logged for this project yet.
                    </td>
                  </tr>
                ) : (
                  timeLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-900/30">
                      <td className="p-3 font-bold text-zinc-100">{log.stage}</td>
                      <td className="p-3">{log.hours} hrs</td>
                      <td className="p-3 text-zinc-400">{log.date}</td>
                      <td className="p-3 font-sans text-zinc-300">{log.notes || '-'}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={async () => {
                            await api.deleteTimeLog(projectId, log.id);
                            loadProject();
                          }}
                          className="text-zinc-600 hover:text-zinc-300"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Before vs After Archive */}
      {activeTab === 'before_after' && (
        <BeforeAfterSection
          projectId={projectId}
          entries={beforeAfter}
          onRefresh={loadProject}
        />
      )}

      {/* Time Tracker Modal */}
      <TimeTrackerModal
        projectId={projectId}
        isOpen={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
        onSuccess={loadProject}
      />
    </div>
  );
};
