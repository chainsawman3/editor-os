import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { DashboardSummaryResponse } from '../types';
import { ProgressBar } from '../components/common/ProgressBar';
import { HealthBadge } from '../components/common/HealthBadge';
import { DifficultyBadge } from '../components/common/DifficultyBadge';
import {
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Circle,
  Plus,
  Flame,
  Layers,
  Sparkles,
  Target
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string, entityId?: string) => void;
  onOpenQuickCapture: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onOpenQuickCapture }) => {
  const [data, setData] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSummary = async () => {
    try {
      const res = await api.getSummary();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    try {
      await api.updateTask(taskId, { completed: !currentCompleted });
      loadSummary();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveBlocker = async (blocker: any) => {
    try {
      if (blocker.related_entity_type === 'project') {
        await api.resolveBlocker(blocker.related_entity_id, blocker.id);
      }
      loadSummary();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center font-mono text-xs text-zinc-500">
        LOADING DASHBOARD RADAR...
      </div>
    );
  }

  if (!data) return null;

  const { summary, categoryProgress, nextActions, activeBlockers, todayTasks, recentActivities } = data;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. TOP OVERVIEW / METRICS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-lg">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">90-Day Sprint</span>
          <div className="text-xl font-bold font-mono text-zinc-100 mt-1">
            Day {summary.cycleDay} <span className="text-xs text-zinc-400 font-normal">/ {summary.cycleTotalDays}</span>
          </div>
          <ProgressBar percent={(summary.cycleDay / summary.cycleTotalDays) * 100} showLabel={false} size="sm" className="mt-2" />
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-lg">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Overall Progress</span>
          <div className="text-xl font-bold font-mono text-zinc-100 mt-1">{summary.overallProgress}%</div>
          <ProgressBar percent={summary.overallProgress} showLabel={false} size="sm" className="mt-2" />
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-lg">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Active Streak</span>
          <div className="text-xl font-bold font-mono text-zinc-100 mt-1 flex items-center gap-1">
            <Flame className="w-4 h-4 text-zinc-300" />
            <span>{summary.streakDays} Days</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono mt-2 block">Consistent log</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-lg">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Active Projects</span>
          <div className="text-xl font-bold font-mono text-zinc-100 mt-1">{summary.activeProjectsCount}</div>
          <span className="text-[10px] text-zinc-400 font-mono mt-2 block">In production</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-lg">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Overdue Tasks</span>
          <div className="text-xl font-bold font-mono mt-1 text-zinc-100">
            {summary.overdueTasksCount}
          </div>
          <span className="text-[10px] text-zinc-400 font-mono mt-2 block">Requires action</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Next Deadline</span>
          <div className="truncate">
            <p className="text-xs font-mono font-bold text-zinc-200 truncate mt-1">
              {summary.nextUpcomingDeadline?.title || 'None set'}
            </p>
            <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
              {summary.nextUpcomingDeadline?.date || 'All clear'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE BLOCKERS (ROADBLOCK RADAR) */}
      {activeBlockers.length > 0 && (
        <div className="p-4 bg-zinc-950 border-2 border-zinc-200 rounded-lg space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-zinc-100 text-zinc-950 font-mono font-bold text-xs rounded">
                [!] BLOCKED
              </span>
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-100">
                ACTIVE ROADBLOCKS REQUIRING INTERVENTION ({activeBlockers.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Work paused until resolved</span>
          </div>

          <div className="space-y-2">
            {activeBlockers.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-700 rounded text-xs"
              >
                <div className="space-y-0.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase font-bold text-zinc-300">
                      [{b.entityTitle}]
                    </span>
                  </div>
                  <p className="text-zinc-100 font-medium">{b.description}</p>
                </div>

                <button
                  onClick={() => handleResolveBlocker(b)}
                  className="px-3 py-1 bg-zinc-100 hover:bg-white text-zinc-950 rounded font-mono text-xs font-bold transition-all shrink-0 ml-4"
                >
                  Resolve Blocker
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. NEXT ACTIONS AGGREGATOR */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-zinc-300" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100">
              NEXT ACTIONS RADAR (ONE IMMEDIATE STEP PER FOCUS)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">Always know exactly what to do next</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {nextActions.slice(0, 6).map((action) => (
            <div
              key={action.id}
              onClick={() => {
                if (action.entityType === 'project') onNavigate('project_detail', action.entityId);
                if (action.entityType === 'category') onNavigate(action.entityId);
                if (action.entityType === 'goal') onNavigate('goals');
              }}
              className="p-3 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 rounded cursor-pointer transition-all space-y-1 group text-xs"
            >
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="text-zinc-400 uppercase font-semibold">
                  [{action.entityType}]: {action.entityTitle}
                </span>
                <span className="text-zinc-400 group-hover:text-zinc-200">Open ↗</span>
              </div>
              <p className="font-mono text-zinc-200 font-medium group-hover:text-white flex items-center gap-1.5">
                <span className="text-zinc-400">→</span>
                <span>{action.text}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. MAIN 2-COLUMN SPLIT: CATEGORIES & TODAY'S ACTION LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 4 Growth Categories Overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
              CORE GROWTH CATEGORIES
            </h3>
            <button
              onClick={() => onNavigate('categories')}
              className="text-xs font-mono text-zinc-400 hover:text-zinc-200"
            >
              View Full Checklists →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categoryProgress.map((cat) => (
              <div
                key={cat.id}
                onClick={() => onNavigate(cat.id)}
                className="p-4 bg-zinc-950 hover:bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 rounded-lg cursor-pointer transition-all space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-zinc-300" />
                    <span className="font-mono font-bold text-sm text-zinc-100">{cat.name}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                    {cat.completedTasks}/{cat.totalTasks} Tasks
                  </span>
                </div>

                <ProgressBar percent={cat.progressPercent} size="sm" />

                {cat.nextAction && (
                  <div className="pt-2 border-t border-zinc-900 text-[11px] font-mono text-zinc-400 flex items-start gap-1.5">
                    <span className="text-zinc-400 shrink-0">NEXT:</span>
                    <span className="text-zinc-200 truncate">{cat.nextAction}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Today's Action Checklist */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
              TODAY'S ACTION ITEMS
            </h3>
            <span className="text-[10px] font-mono text-zinc-400">
              {todayTasks.filter((t) => t.completed).length}/{todayTasks.length} Done
            </span>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-2.5 max-h-[380px] overflow-y-auto">
            {todayTasks.length === 0 ? (
              <p className="text-xs font-mono text-zinc-500 italic text-center py-6">
                No tasks scheduled for today.
              </p>
            ) : (
              todayTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id, task.completed)}
                  className="flex items-start gap-2.5 p-2 hover:bg-zinc-900/60 rounded cursor-pointer transition-colors text-xs"
                >
                  <button className="mt-0.5 shrink-0 text-zinc-400 hover:text-white">
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
              ))
            )}
          </div>
        </div>
      </div>

      {/* 5. RECENT ACTIVITY FEED */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-300">
            RECENT DEVELOPMENT LOGS & STRATEGY PIVOTS
          </h3>
          <button
            onClick={() => onNavigate('devlog')}
            className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200"
          >
            Open Full Log →
          </button>
        </div>

        <div className="divide-y divide-zinc-900">
          {recentActivities.map((act) => (
            <div key={act.id} className="py-2.5 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="text-[10px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded shrink-0">
                  {act.type}
                </span>
                <span className="text-zinc-200 font-sans truncate">{act.text}</span>
              </div>
              <span className="text-zinc-400 text-[11px] shrink-0 ml-4">{act.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
