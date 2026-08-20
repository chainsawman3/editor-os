import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Category, Task, Project } from '../types';
import { ProgressBar } from '../components/common/ProgressBar';
import { NextActionBadge } from '../components/common/NextActionBadge';
import {
  Layers,
  Folder,
  Plus,
  CheckCircle2,
  Circle,
  Video,
  ArrowRight,
  Sparkles,
  Clapperboard,
  Megaphone,
  Briefcase,
  GraduationCap,
  Trash2
} from 'lucide-react';

interface CategoriesPageProps {
  selectedCategoryId?: string;
  onNavigateToProject: (projectId: string) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  selectedCategoryId,
  onNavigateToProject
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string>(
    selectedCategoryId || 'cat_video_editing'
  );
  const [parentDetails, setParentDetails] = useState<{
    category: Category;
    subcategories: Category[];
    tasks: Task[];
    linkedProjects: Project[];
    devLogs: any[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedSubCatId, setSelectedSubCatId] = useState<string>('');

  const loadCategories = async () => {
    try {
      const res = await api.getCategories();
      setCategories(res);
    } catch (err) {
      console.error(err);
    }
  };

  const loadParentDetails = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.getCategory(id);
      setParentDetails(res);
      if (res.subcategories.length > 0) {
        setSelectedSubCatId(res.subcategories[0].id);
      } else {
        setSelectedSubCatId(id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      setSelectedParentId(selectedCategoryId);
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    if (selectedParentId) {
      loadParentDetails(selectedParentId);
    }
  }, [selectedParentId]);

  const handleToggleTask = async (task: Task) => {
    await api.updateTask(task.id, { completed: !task.completed });
    loadParentDetails(selectedParentId);
    loadCategories();
  };

  const handleDeleteTask = async (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await api.deleteTask(taskId);
    loadParentDetails(selectedParentId);
    loadCategories();
  };

  const handleClearAllTasks = async () => {
    const currentTasks =
      parentDetails?.tasks.filter(
        (t) => !selectedSubCatId || t.category_id === selectedSubCatId
      ) || [];
    if (currentTasks.length === 0) return;

    if (window.confirm(`Remove all ${currentTasks.length} tasks in this checklist?`)) {
      for (const t of currentTasks) {
        await api.deleteTask(t.id);
      }
      loadParentDetails(selectedParentId);
      loadCategories();
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await api.createTask({
      title: newTaskTitle.trim(),
      category_id: selectedSubCatId || selectedParentId
    });

    setNewTaskTitle('');
    loadParentDetails(selectedParentId);
    loadCategories();
  };

  const handleSaveNextAction = async (newAction: string) => {
    await api.updateCategory(selectedParentId, { next_action: newAction });
    loadParentDetails(selectedParentId);
    loadCategories();
  };

  const parentCats = categories.filter((c) => !c.parent_id);

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'cat_video_editing':
        return <Clapperboard className="w-4 h-4 text-zinc-200" />;
      case 'cat_marketing':
        return <Megaphone className="w-4 h-4 text-zinc-200" />;
      case 'cat_freelance':
        return <Briefcase className="w-4 h-4 text-zinc-200" />;
      case 'cat_skills':
        return <GraduationCap className="w-4 h-4 text-zinc-200" />;
      default:
        return <Folder className="w-4 h-4 text-zinc-200" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4">
        <h2 className="text-xl font-bold font-mono text-zinc-100 uppercase">
          GROWTH CATEGORIES & SKILL ROADMAPS
        </h2>
        <p className="text-xs text-zinc-400 font-sans">
          Section 6: Hierarchical skill trees, platform checklists (Instagram, TikTok, Behance, Fiverr) and subcategory modules.
        </p>
      </div>

      {/* 4 Primary Category Selection Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
        {parentCats.map((cat) => {
          const isSelected = selectedParentId === cat.id;
          return (
            <div
              key={cat.id}
              onClick={() => setSelectedParentId(cat.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all space-y-2 ${
                isSelected
                  ? 'bg-zinc-900 border-zinc-400 shadow-md'
                  : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(cat.id)}
                  <span className="font-bold text-zinc-100">{cat.name}</span>
                </div>
                <span className="text-[10px] text-zinc-400">
                  {cat.completedTasks}/{cat.totalTasks} Done
                </span>
              </div>
              <ProgressBar percent={cat.progressPercent || 0} size="sm" />
            </div>
          );
        })}
      </div>

      {/* Selected Category Deep Dive Workspace */}
      {parentDetails && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Subcategories & Checklists */}
          <div className="lg:col-span-2 space-y-5">
            {/* Header with Next Action */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold font-mono text-zinc-100 flex items-center gap-2">
                  {getCategoryIcon(parentDetails.category.id)}
                  <span>{parentDetails.category.name} Module</span>
                </h3>
                <span className="text-xs font-mono text-zinc-400">
                  {parentDetails.category.completedTasks}/{parentDetails.category.totalTasks} Tasks
                  ({parentDetails.category.progressPercent}%)
                </span>
              </div>

              {/* Editable Next Action */}
              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded">
                <NextActionBadge
                  actionText={parentDetails.category.next_action}
                  editable={true}
                  onSave={handleSaveNextAction}
                />
              </div>

              {/* Subcategories Pills */}
              {parentDetails.subcategories.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-zinc-900">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                    SUBCATEGORIES & TRACKS:
                  </span>
                  <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                    {parentDetails.subcategories.map((sub) => {
                      const isSubActive = selectedSubCatId === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => setSelectedSubCatId(sub.id)}
                          className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                            isSubActive
                              ? 'bg-zinc-100 text-zinc-950 font-bold'
                              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                          }`}
                        >
                          <span>{sub.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Checklist Tasks for Selected Category/Subcategory */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <span className="font-mono font-bold uppercase tracking-wider text-zinc-200">
                  ACTION CHECKLIST & MILESTONES
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-400 text-[11px] font-mono">
                    {
                      parentDetails.tasks.filter(
                        (t) =>
                          t.completed &&
                          (!selectedSubCatId || t.category_id === selectedSubCatId)
                      ).length
                    }{' '}
                    / {parentDetails.tasks.filter((t) => !selectedSubCatId || t.category_id === selectedSubCatId).length} Done
                  </span>

                  {parentDetails.tasks.filter((t) => !selectedSubCatId || t.category_id === selectedSubCatId).length > 0 && (
                    <button
                      onClick={handleClearAllTasks}
                      className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 underline"
                      title="Remove all tasks in this checklist"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {/* Add Task */}
              <form onSubmit={handleAddTask} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Add action item to ${
                    parentDetails.subcategories.find((s) => s.id === selectedSubCatId)?.name ||
                    parentDetails.category.name
                  }...`}
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1 text-xs"
                />
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="px-3.5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded font-mono font-bold text-xs"
                >
                  + Add Item
                </button>
              </form>

              {/* Task Items */}
              <div className="divide-y divide-zinc-900">
                {parentDetails.tasks.filter((t) => !selectedSubCatId || t.category_id === selectedSubCatId).length === 0 ? (
                  <p className="py-6 text-center text-zinc-600 font-mono text-xs italic">
                    No tasks inside this checklist. Add a task above.
                  </p>
                ) : (
                  parentDetails.tasks
                    .filter((t) => !selectedSubCatId || t.category_id === selectedSubCatId)
                    .map((task) => (
                      <div
                        key={task.id}
                        className="py-3 flex items-center justify-between hover:bg-zinc-900/40 px-2 rounded group transition-colors"
                      >
                        <div
                          onClick={() => handleToggleTask(task)}
                          className="flex items-center gap-3 cursor-pointer flex-1"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleTask(task);
                            }}
                            className="text-zinc-500 hover:text-zinc-200"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-zinc-100" />
                            ) : (
                              <Circle className="w-4 h-4 text-zinc-600" />
                            )}
                          </button>
                          <span
                            className={`font-sans ${
                              task.completed ? 'line-through text-zinc-600' : 'text-zinc-200'
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteTask(task.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-zinc-200 transition-opacity ml-2"
                          title="Remove task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Right 1 Col: Linked Projects in Category */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
              LINKED PROJECTS ({parentDetails.linkedProjects.length})
            </h3>

            <div className="space-y-3">
              {parentDetails.linkedProjects.length === 0 ? (
                <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-lg text-center font-mono text-xs text-zinc-500">
                  No projects currently tagged under this category.
                </div>
              ) : (
                parentDetails.linkedProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onNavigateToProject(p.id)}
                    className="p-4 bg-zinc-950 hover:bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-lg cursor-pointer transition-all space-y-2 text-xs group"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="px-1.5 py-0.5 bg-zinc-900 text-zinc-300 rounded uppercase">
                        {p.type}
                      </span>
                      <span className="text-zinc-500 group-hover:text-zinc-300">Open ↗</span>
                    </div>

                    <h4 className="font-mono font-bold text-zinc-100 text-sm group-hover:underline">
                      {p.name}
                    </h4>

                    {p.next_action && (
                      <p className="text-[11px] font-mono text-zinc-400 truncate">
                        → {p.next_action}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
