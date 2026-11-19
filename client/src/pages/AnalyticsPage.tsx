import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Task } from '../types';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Dumbbell,
  Waves,
  Wallet,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Target,
  Sparkles,
  Calendar,
  AlertCircle,
  Percent,
  Flame,
  ArrowRight
} from 'lucide-react';
import { AnalyticsSkeleton } from '../components/common/SkeletonLoader';

interface AnalyticsPageProps {
  onNavigate?: (tab: string, options?: any) => void;
}

interface WorkoutSessionLog {
  id: string;
  date: string;
  dayName: string;
  title: string;
  type: 'gym' | 'pool';
  durationMin: number;
  timestamp: number;
  note?: string;
}

interface DailyExpenseRecord {
  date: string;
  dayName: string;
  plannedAmount: number;
  actualSpent: number;
  foodPart: number;
  cigPart: number;
  funPart: number;
  deducted: boolean;
  deductedAt: string;
  isAuto: boolean;
  note?: string;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessionLogs, setSessionLogs] = useState<WorkoutSessionLog[]>([]);
  const [completedDays, setCompletedDays] = useState<Record<string, boolean>>({});
  const [startDate, setStartDate] = useState<string>('');
  const [dailyExpenses, setDailyExpenses] = useState<DailyExpenseRecord[]>([]);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [salary, setSalary] = useState<number>(2200);

  const activeUser = typeof window !== 'undefined' ? (localStorage.getItem('flow_os_active_user') || 'gigi') : 'gigi';
  const getKey = (base: string) => (activeUser === 'gigi' ? base : `${base}_${activeUser}`);

  const loadAllAnalyticsData = async () => {
    try {
      setLoading(true);

      // 1. Fetch real tasks
      const fetchedTasks = await api.getTasks();
      setTasks(fetchedTasks || []);

      // 2. Load workouts from localStorage
      const workoutStorageKey = getKey('flow_os_completed_workouts');
      const sessionLogsStorageKey = getKey('flow_os_workout_session_logs');
      const startDateStorageKey = getKey('flow_os_workout_start_date');

      try {
        const savedLogs = localStorage.getItem(sessionLogsStorageKey);
        setSessionLogs(savedLogs ? JSON.parse(savedLogs) : []);
      } catch {
        setSessionLogs([]);
      }

      try {
        const savedCompleted = localStorage.getItem(workoutStorageKey);
        setCompletedDays(savedCompleted ? JSON.parse(savedCompleted) : {});
      } catch {
        setCompletedDays({});
      }

      const savedStartDate = localStorage.getItem(startDateStorageKey) || new Date().toISOString().split('T')[0];
      setStartDate(savedStartDate);

      // 3. Load budget & daily expenses from localStorage
      const savedBalance = localStorage.getItem(getKey('flow_os_current_balance'));
      setCurrentBalance(savedBalance ? parseFloat(savedBalance) : 600);

      const savedSalary = localStorage.getItem(getKey('flow_os_salary'));
      setSalary(savedSalary ? parseFloat(savedSalary) : (activeUser === 'ani' ? 1800 : 2200));

      try {
        const savedExpenses = localStorage.getItem(getKey('flow_os_daily_expenses'));
        setDailyExpenses(savedExpenses ? JSON.parse(savedExpenses) : []);
      } catch {
        setDailyExpenses([]);
      }
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAnalyticsData();
  }, [activeUser]);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  // ================= TASK CALCULATIONS =================
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.due_date === todayStr);
  const todayCompletedTasks = todayTasks.filter((t) => t.completed).length;

  const highPriorityTasks = tasks.filter((t) => t.priority === 'High');
  const highPriorityCompleted = highPriorityTasks.filter((t) => t.completed).length;

  const mediumPriorityTasks = tasks.filter((t) => t.priority === 'Medium');
  const mediumPriorityCompleted = mediumPriorityTasks.filter((t) => t.completed).length;

  const normalPriorityTasks = tasks.filter((t) => !t.priority || t.priority === 'Low');
  const normalPriorityCompleted = normalPriorityTasks.filter((t) => t.completed).length;

  // ================= WORKOUT CALCULATIONS =================
  const totalWorkoutSessions = sessionLogs.length;
  const gymSessions = sessionLogs.filter((s) => s.type === 'gym').length;
  const poolSessions = sessionLogs.filter((s) => s.type === 'pool').length;
  const totalWorkoutMinutes = sessionLogs.reduce((acc, s) => acc + (s.durationMin || 60), 0);
  const totalWorkoutHours = Math.round((totalWorkoutMinutes / 60) * 10) / 10;

  // Weekly Adherence (out of standard 4 target days: Tue, Thu, Sat pool, Sun gym)
  const completedThisWeekCount = Object.values(completedDays).filter(Boolean).length;
  const weeklyTargetSessions = 4;
  const workoutAdherenceRate = Math.min(100, Math.round((completedThisWeekCount / weeklyTargetSessions) * 100));

  // Journey duration in days
  const journeyDays = (() => {
    try {
      const start = new Date(startDate);
      const now = new Date();
      start.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      const diffTime = now.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return 1;
    }
  })();

  // ================= BUDGET VARIANCE CALCULATIONS =================
  const deductedExpenses = dailyExpenses.filter((e) => e.deducted);
  const totalPlannedSpend = deductedExpenses.reduce((acc, e) => acc + (e.plannedAmount || 0), 0);
  const totalActualSpend = deductedExpenses.reduce((acc, e) => acc + (e.actualSpent || 0), 0);
  const netVariance = totalPlannedSpend - totalActualSpend; // positive = saved, negative = overspent

  const totalSaved = deductedExpenses.reduce((acc, e) => {
    const diff = (e.plannedAmount || 0) - (e.actualSpent || 0);
    return diff > 0 ? acc + diff : acc;
  }, 0);

  const totalOverspent = deductedExpenses.reduce((acc, e) => {
    const diff = (e.actualSpent || 0) - (e.plannedAmount || 0);
    return diff > 0 ? acc + diff : acc;
  }, 0);

  return (
    <div className="p-3 sm:p-6 space-y-5 max-w-7xl mx-auto font-sans">
      {/* 1. TOP HEADER */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">ანალიტიკა</h1>
          </div>
        </div>

        <button
          onClick={loadAllAnalyticsData}
          title="მონაცემების განახლება"
          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">განახლება</span>
        </button>
      </div>

      {/* 2. THE 3 CORE PILLARS (TOP KPI CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: ტასკების შესრულება */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                ტასკების შესრულება
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-md">
              {taskCompletionRate}%
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div className="text-2xl font-black font-mono text-white">
              {completedTasks} <span className="text-sm font-normal text-zinc-500">/ {totalTasks}</span>
            </div>
            <span className="text-[11px] text-zinc-400 font-medium">
              დარჩენილია: <strong className="text-amber-400">{pendingTasks}</strong>
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="w-full h-2 rounded-full bg-zinc-850 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${taskCompletionRate}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>დღეს: {todayCompletedTasks}/{todayTasks.length}</span>
              <span>მაღალი პრიორიტეტი: {highPriorityCompleted}/{highPriorityTasks.length}</span>
            </div>
          </div>
        </div>

        {/* Pillar 2: ვარჯიშების შესრულება */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Dumbbell className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                ვარჯიშების შესრულება
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2 py-0.5 rounded-md">
              {workoutAdherenceRate}% კვირა
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div className="text-2xl font-black font-mono text-white">
              {totalWorkoutSessions} <span className="text-sm font-normal text-zinc-500">სესია</span>
            </div>
            <span className="text-[11px] text-zinc-400 font-medium">
              სულ: <strong className="text-cyan-300">~{totalWorkoutHours} სთ</strong>
            </span>
          </div>

          {/* Adherence Progress Bar */}
          <div className="space-y-1">
            <div className="w-full h-2 rounded-full bg-zinc-850 overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${workoutAdherenceRate}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>დარბაზი: {gymSessions}</span>
              <span>აუზი: {poolSessions}</span>
              <span>პროგრესი: {journeyDays} დღე</span>
            </div>
          </div>
        </div>

        {/* Pillar 3: ბიუჯეტის გადახრები */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Wallet className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                ბიუჯეტის გადახრები
              </span>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                netVariance >= 0
                  ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/80'
                  : 'text-rose-400 bg-rose-950/60 border border-rose-800/80'
              }`}
            >
              {netVariance >= 0 ? `+${netVariance.toFixed(1)} ₾ დაზოგილი` : `${netVariance.toFixed(1)} ₾ გადახარჯვა`}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div className="text-2xl font-black font-mono text-white">
              {currentBalance.toFixed(0)} <span className="text-sm font-normal text-zinc-500">₾ ბალანსი</span>
            </div>
            <span className="text-[11px] text-zinc-400 font-medium font-mono">
              ხარჯი: <strong className="text-zinc-200">{totalActualSpend.toFixed(1)} ₾</strong>
            </span>
          </div>

          {/* Variance Bar */}
          <div className="space-y-1">
            <div className="w-full h-2 rounded-full bg-zinc-850 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  netVariance >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                style={{
                  width: `${Math.min(100, Math.max(10, Math.round((currentBalance / salary) * 100)))}%`
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span className="text-emerald-400">დაზოგვა: +{totalSaved.toFixed(1)} ₾</span>
              <span className="text-rose-400">გადახარჯვა: -{totalOverspent.toFixed(1)} ₾</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DETAILED SECTIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* SECTION 1: ტასკების შესრულების დეტალები */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                ტასკების პრიორიტეტები
              </h2>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('tasks')}
                className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>ტასკები</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {/* High Priority */}
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> მაღალი პრიორიტეტი (High)
                </span>
                <span className="font-mono font-bold text-white">
                  {highPriorityCompleted} / {highPriorityTasks.length}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{
                    width: `${highPriorityTasks.length > 0 ? (highPriorityCompleted / highPriorityTasks.length) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            {/* Medium Priority */}
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> საშუალო (Medium)
                </span>
                <span className="font-mono font-bold text-white">
                  {mediumPriorityCompleted} / {mediumPriorityTasks.length}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${mediumPriorityTasks.length > 0 ? (mediumPriorityCompleted / mediumPriorityTasks.length) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            {/* Normal / Low Priority */}
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-zinc-400" /> ჩვეულებრივი / დაბალი
                </span>
                <span className="font-mono font-bold text-white">
                  {normalPriorityCompleted} / {normalPriorityTasks.length}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-zinc-400 rounded-full"
                  style={{
                    width: `${normalPriorityTasks.length > 0 ? (normalPriorityCompleted / normalPriorityTasks.length) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-850 flex justify-between text-xs text-zinc-400">
            <span>სულ შესრულებული:</span>
            <strong className="text-emerald-400 font-mono">{taskCompletionRate}% ({completedTasks} ტასკი)</strong>
          </div>
        </div>

        {/* SECTION 2: ვარჯიშების შესრულების დეტალები */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                ვარჯიშების დისციპლინა
              </h2>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('workout')}
                className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>ვარჯიში</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {/* Gym Sessions */}
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">🏋️‍♂️ დარბაზის სესიები</div>
                  <div className="text-[10px] text-zinc-400">Push / Pull / Legs & Core</div>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-base font-bold text-emerald-400">{gymSessions}</span>
                <span className="text-[10px] text-zinc-500 block">სესია</span>
              </div>
            </div>

            {/* Pool Sessions */}
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Waves className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">🏊‍♂️ აუზის სესიები</div>
                  <div className="text-[10px] text-zinc-400">შაბათის ჰიდროთერაპია & კარდიო</div>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-base font-bold text-cyan-400">{poolSessions}</span>
                <span className="text-[10px] text-zinc-500 block">სესია</span>
              </div>
            </div>

            {/* Weekly Consistency */}
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">კვირის გრაფიკის შესრულება:</span>
                <span className="font-mono font-bold text-cyan-400">{completedThisWeekCount} / 4 სესია</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full"
                  style={{ width: `${workoutAdherenceRate}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-850 flex justify-between text-xs text-zinc-400">
            <span>ვარჯიშის სტაჟი:</span>
            <strong className="text-cyan-400 font-mono">{journeyDays} დღე (~{totalWorkoutHours} საათი)</strong>
          </div>
        </div>

        {/* SECTION 3: ბიუჯეტის გადახრების ჟურნალი */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                დღიური ხარჯის გადახრები
              </h2>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('economy')}
                className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>ეკონომია</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {deductedExpenses.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500">
              ჯერ არ არის დაფიქსირებული დღიური ხარჯები.
            </div>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {deductedExpenses.map((exp) => {
                const diff = (exp.plannedAmount || 0) - (exp.actualSpent || 0);
                const isSaved = diff >= 0;
                return (
                  <div
                    key={exp.date}
                    className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>{exp.dayName}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">({exp.date})</span>
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        გეგმა: {exp.plannedAmount} ₾ · დახარჯული: {exp.actualSpent} ₾
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-mono font-bold text-xs ${
                          isSaved ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isSaved ? `+${diff.toFixed(1)} ₾` : `${diff.toFixed(1)} ₾`}
                      </span>
                      <span className="text-[9px] text-zinc-500 block">
                        {isSaved ? 'დაზოგილი' : 'გადახარჯვა'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2 border-t border-zinc-850 flex justify-between text-xs text-zinc-400">
            <span>ბალანსის სტატუსი:</span>
            <strong
              className={`font-mono ${
                netVariance >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {netVariance >= 0 ? `+${netVariance.toFixed(1)} ₾ (ეკონომია)` : `${netVariance.toFixed(1)} ₾ (გადახარჯვა)`}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
