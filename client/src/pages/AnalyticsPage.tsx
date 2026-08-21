import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  BarChart3,
  Video,
  Megaphone,
  Briefcase,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Clock,
  UserCheck,
  UserX,
  RefreshCw,
  Layers,
  ArrowUpRight,
  Target,
  Sparkles,
  Zap,
  Radio
} from 'lucide-react';
import { AnalyticsSkeleton } from '../components/common/SkeletonLoader';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | 'weekly'>('all');

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.getAnalytics();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (!data) return null;

  const { overview, videoEditing, marketing, crm, weeklyProgress } = data;

  const responseDiagramData = crm?.responseDiagram || [
    { name: 'Positive (Agreed / Active)', count: 0, color: '#10b981', percentage: 0 },
    { name: 'Negative (Rejected / Ghosted)', count: 0, color: '#f43f5e', percentage: 0 },
    { name: 'Pending (Awaiting Reply)', count: 0, color: '#3b82f6', percentage: 0 }
  ];

  const videoStageData = videoEditing?.stageBreakdown || [];
  const marketingPlatformData = marketing?.platformBreakdown || [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. TOP HEADER */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-800/60 text-cyan-400 shadow-inner">
            <BarChart3 className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Executive Analytics & Insights</h1>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-950/70 border border-emerald-800/70 text-emerald-300 font-bold uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              Real-time synchronization across Production Projects, Tasks Velocity, and Outreach Conversion
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-sm">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Pipeline Revenue: <strong className="text-white">${overview?.totalRevenue?.toLocaleString() || 0}</strong></span>
          </div>
          <button
            onClick={loadAnalytics}
            title="Refresh live data"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-750 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. 4 BIG EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks Velocity */}
        <div className="bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-750 hover:border-emerald-500/50 rounded-2xl p-5 space-y-3 shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Tasks Velocity</span>
            <span className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-zinc-100 font-mono">
              {overview?.completedTasks || 0} <span className="text-sm font-normal text-zinc-400">/ {overview?.totalTasks || 0}</span>
            </div>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {overview?.taskCompletionRate || 0}%
            </span>
          </div>
          <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${overview?.taskCompletionRate || 0}%` }}
            />
          </div>
          <div className="text-[11px] text-zinc-400 flex justify-between">
            <span>Pending: <strong className="text-zinc-300 font-mono">{overview?.pendingTasks || 0}</strong></span>
            <span>Completed: <strong className="text-emerald-400 font-mono">{overview?.completedTasks || 0}</strong></span>
          </div>
        </div>

        {/* Total Projects Delivered */}
        <div className="bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-750 hover:border-blue-500/50 rounded-2xl p-5 space-y-3 shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Projects Throughput</span>
            <span className="p-1.5 rounded-lg bg-blue-950/60 border border-blue-800 text-blue-400">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-zinc-100 font-mono">
              {overview?.completedProjects || 0} <span className="text-sm font-normal text-zinc-400">/ {overview?.totalProjects || 0}</span>
            </div>
            <span className="text-xs font-bold text-blue-400 font-mono">
              {overview?.projectCompletionRate || 0}%
            </span>
          </div>
          <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${overview?.projectCompletionRate || 0}%` }}
            />
          </div>
          <div className="text-[11px] text-zinc-400 flex justify-between">
            <span>In-Progress: <strong className="text-cyan-300 font-mono">{overview?.inProgressProjects || 0}</strong></span>
            <span>Ready/Done: <strong className="text-blue-400 font-mono">{overview?.completedProjects || 0}</strong></span>
          </div>
        </div>

        {/* Client Outreach Conversion */}
        <div className="bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-750 hover:border-purple-500/50 rounded-2xl p-5 space-y-3 shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Outreach Conversion</span>
            <span className="p-1.5 rounded-lg bg-purple-950/60 border border-purple-800 text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-purple-300 font-mono">
              {overview?.conversionRate || 0}%
            </div>
            <span className="text-xs font-medium text-zinc-400">
              ({overview?.positiveClients || 0} Deals Won)
            </span>
          </div>
          <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="bg-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${overview?.conversionRate || 0}%` }}
            />
          </div>
          <div className="text-[11px] text-zinc-400 flex justify-between">
            <span>Total Leads: <strong className="text-zinc-300 font-mono">{overview?.totalClients || 0}</strong></span>
            <span>Positive: <strong className="text-emerald-400 font-mono">{overview?.positiveClients || 0}</strong></span>
          </div>
        </div>

        {/* Total Client Pipeline */}
        <div className="bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-750 hover:border-cyan-500/50 rounded-2xl p-5 space-y-3 shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Active Pipeline</span>
            <span className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800 text-cyan-400">
              <Briefcase className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-cyan-300 font-mono">
              {overview?.pendingClients || 0}
            </div>
            <span className="text-xs font-medium text-zinc-400">Awaiting Response</span>
          </div>
          <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${overview?.totalClients > 0 ? Math.round((overview.pendingClients / overview.totalClients) * 100) : 0}%` }}
            />
          </div>
          <div className="text-[11px] text-zinc-400 flex justify-between">
            <span>Negative/Ghosted: <strong className="text-rose-400 font-mono">{overview?.negativeClients || 0}</strong></span>
            <span>Active Won: <strong className="text-emerald-400 font-mono">{overview?.positiveClients || 0}</strong></span>
          </div>
        </div>
      </div>

      {/* 3. DEDICATED SECTION 1: VIDEO EDITING VS MARKETING BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VIDEO EDITING CRAFT PERFORMANCE */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-blue-950/80 border border-blue-800 text-blue-400">
                <Video className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Video Editing Craft Analytics</h2>
                <p className="text-[11px] text-zinc-400">Projects throughput across editing pipeline stages</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-blue-400">
                {videoEditing?.completedTasks || 0} / {videoEditing?.totalTasks || 0} Tasks
              </span>
              <span className="text-[10px] text-zinc-400 block">{videoEditing?.completionRate || 0}% rate</span>
            </div>
          </div>

          {/* Video Projects By Stage Chart */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Production Pipeline Stages</span>
              <span className="font-mono text-zinc-300">{videoEditing?.totalProjects || 0} Total Projects</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={videoStageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="stage" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '10px', fontSize: '11px' }}
                    itemStyle={{ color: '#60a5fa' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Projects" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-900 text-center text-xs">
            {videoStageData.map((s: any) => (
              <div key={s.stage} className="p-2.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl">
                <span className="text-[10px] text-zinc-400 uppercase block truncate">{s.stage}</span>
                <span className="text-sm font-bold font-mono text-zinc-100 mt-0.5 block">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MARKETING & CONTENT DISTRIBUTION */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                <Megaphone className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Marketing & Social Analytics</h2>
                <p className="text-[11px] text-zinc-400">Content distribution across platforms & reach</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-emerald-400">
                {marketing?.completedTasks || 0} / {marketing?.totalTasks || 0} Tasks
              </span>
              <span className="text-[10px] text-zinc-400 block">{marketing?.completionRate || 0}% rate</span>
            </div>
          </div>

          {/* Marketing Platforms Breakdown Chart */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Platform Distribution</span>
              <span className="font-mono text-zinc-300">{marketing?.totalProjects || 0} Planned / Live Posts</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marketingPlatformData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="platform" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '10px', fontSize: '11px' }}
                    itemStyle={{ color: '#34d399' }}
                  />
                  <Bar dataKey="projects" fill="#10b981" radius={[6, 6, 0, 0]} name="Projects / Edits" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-900 text-center text-xs">
            {marketingPlatformData.map((p: any) => (
              <div key={p.platform} className="p-2.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl">
                <span className="text-[10px] text-zinc-400 uppercase block truncate">{p.platform}</span>
                <span className="text-sm font-bold font-mono text-emerald-400 mt-0.5 block">{p.projects}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. DEDICATED SECTION 2: CLIENT CRM & OUTREACH DIAGRAMS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DIAGRAM A: Client Response Breakdown (Positive vs Negative vs Pending) */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-purple-950/80 border border-purple-800 text-purple-400">
                <Briefcase className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Client Response Distribution</h2>
                <p className="text-[11px] text-zinc-400">Positive Deals Won, Negative / Ghosted, and Pending Outreach</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-zinc-300">
              {crm?.totalClients || 0} Total Leads
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={responseDiagramData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {responseDiagramData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '10px', fontSize: '11px' }}
                    itemStyle={{ color: '#e4e4e7' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Positive Responses */}
              <div className="p-3 bg-emerald-950/25 border border-emerald-800/60 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-300 font-medium">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-emerald-200">Positive Responses</div>
                    <div className="text-[10px] text-emerald-400/80 font-normal">Agreed / Active Client</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-300 font-mono text-sm">{crm?.positiveClients || 0}</div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    {crm?.totalClients > 0 ? Math.round((crm.positiveClients / crm.totalClients) * 100) : 0}%
                  </div>
                </div>
              </div>

              {/* Pending Responses */}
              <div className="p-3 bg-blue-950/25 border border-blue-800/60 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-300 font-medium">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="font-semibold text-blue-200">Pending / Awaiting Reply</div>
                    <div className="text-[10px] text-blue-400/80 font-normal">Contacted / In Discussion</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-300 font-mono text-sm">{crm?.pendingClients || 0}</div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    {crm?.totalClients > 0 ? Math.round((crm.pendingClients / crm.totalClients) * 100) : 0}%
                  </div>
                </div>
              </div>

              {/* Negative / Ghosted */}
              <div className="p-3 bg-rose-950/25 border border-rose-800/60 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-300 font-medium">
                  <UserX className="w-4 h-4 text-rose-400" />
                  <div>
                    <div className="font-semibold text-rose-200">Negative / No Answer</div>
                    <div className="text-[10px] text-rose-400/80 font-normal">Ghosted / Rejected</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-rose-300 font-mono text-sm">{crm?.negativeClients || 0}</div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    {crm?.totalClients > 0 ? Math.round((crm.negativeClients / crm.totalClients) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DIAGRAM B: Outreach Volume & Execution Velocity Over Time */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-amber-950/80 border border-amber-800 text-amber-400">
                <Zap className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Outreach & Velocity Timeline</h2>
                <p className="text-[11px] text-zinc-400">Activity pace of outreach messages sent vs tasks completed</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2.5 py-1 rounded-lg">
              Optimal Pace
            </span>
          </div>

          {/* Weekly Timeline Graph */}
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyProgress || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTasksDone" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOutreach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '10px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="tasksDone" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorTasksDone)" name="Tasks Completed" />
                <Area type="monotone" dataKey="outreachSent" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorOutreach)" name="Outreach Sent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-900">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Tasks Executed
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Outreach Messages Sent
              </span>
            </div>
            <span className="text-zinc-300 font-mono font-bold">Velocity: {overview?.completedTasks || 0} pts</span>
          </div>
        </div>
      </div>
    </div>
  );
};
