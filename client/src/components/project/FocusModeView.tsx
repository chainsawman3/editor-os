import React, { useState } from 'react';
import { Project, Task } from '../../types';
import { NextActionBadge } from '../common/NextActionBadge';
import { X, CheckCircle2, Circle, Clock, Flame } from 'lucide-react';

interface FocusModeViewProps {
  project: Project;
  tasks: Task[];
  onToggleTask: (task: Task) => Promise<void>;
  onSaveNextAction: (action: string) => Promise<void>;
  onExit: () => void;
}

export const FocusModeView: React.FC<FocusModeViewProps> = ({
  project,
  tasks,
  onToggleTask,
  onSaveNextAction,
  onExit
}) => {
  const remainingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="fixed inset-0 z-50 bg-black text-zinc-100 flex flex-col items-center justify-between p-8 sm:p-16 animate-in fade-in duration-200 overflow-y-auto">
      {/* Top Bar: Distraction-free Exit */}
      <div className="w-full max-w-3xl flex items-center justify-between border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-zinc-100 animate-pulse" />
          <span>FOCUS MODE ACTIVE</span>
        </div>
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-800 transition-all"
        >
          <X className="w-3.5 h-3.5" />
          <span>Exit Focus (Esc)</span>
        </button>
      </div>

      {/* Main Single Project Scope */}
      <div className="w-full max-w-2xl my-auto py-8 space-y-8 text-center sm:text-left">
        {/* Project Header */}
        <div className="space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">
            {project.type} PROJECT
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-mono text-zinc-100 tracking-tight">
            {project.name}
          </h1>
          {project.deadline && (
            <p className="font-mono text-xs text-zinc-400">
              Deadline: <span className="text-zinc-200 font-semibold">{project.deadline}</span>
            </p>
          )}
        </div>

        {/* Immediate Next Action (Hero Callout) */}
        <div className="p-6 bg-zinc-950 border border-zinc-700 rounded-lg space-y-2 shadow-2xl">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
            ONE IMMEDIATE NEXT ACTION:
          </span>
          <div className="text-lg sm:text-xl font-mono font-medium text-zinc-100">
            <NextActionBadge
              actionText={project.next_action}
              editable={true}
              onSave={onSaveNextAction}
              className="text-base sm:text-lg bg-transparent border-0 p-0"
            />
          </div>
        </div>

        {/* Remaining Execution Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between font-mono text-xs text-zinc-400 border-b border-zinc-900 pb-2">
            <span>REMAINING ACTION ITEMS ({remainingTasks.length})</span>
            <span>{completedTasks.length} Done</span>
          </div>

          <div className="space-y-2">
            {remainingTasks.length === 0 ? (
              <p className="font-mono text-xs text-zinc-400 italic py-4 text-center">
                All scheduled tasks completed! Ready for final export review.
              </p>
            ) : (
              remainingTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onToggleTask(t)}
                  className="flex items-center gap-3 p-3 bg-zinc-950 hover:bg-zinc-900/80 border border-zinc-850 rounded cursor-pointer transition-colors group"
                >
                  <Circle className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200 shrink-0" />
                  <span className="font-sans text-sm text-zinc-200 group-hover:text-zinc-100">
                    {t.title}
                  </span>
                  {t.stage && (
                    <span className="ml-auto font-mono text-[10px] px-1.5 py-0.5 bg-zinc-900 text-zinc-400 rounded">
                      {t.stage}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer Minimal Tip */}
      <div className="w-full max-w-3xl pt-4 border-t border-zinc-900 text-center font-mono text-[11px] text-zinc-400">
        Focus exclusively on the next immediate action. Do not multi-task.
      </div>
    </div>
  );
};
