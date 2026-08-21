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
  Radio,
  ExternalLink,
  Filter
} from 'lucide-react';
import { AnalyticsSkeleton } from '../components/common/SkeletonLoader';

interface AnalyticsPageProps {
  onNavigate?: (tab: string, options?: any) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState<'all' | '90day'>('all');

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
    { name: 'Positive (Agreed / Active)', count: 0, color: '#10b981', percentage: 0, key: 'positive' },
    { name: 'Negative (Rejected / Ghosted)', count: 0, color: '#f43f5e', percentage: 0, key: 'negative' },
    { name: 'Pending (Awaiting Reply)', count: 0, color: '#3b82f6', percentage: 0, key: 'pending' }
  ];

  const videoStageData = videoEditing?.stageBreakdown || [];
  const marketingPlatformData = marketing?.platformBreakdown || [];

  const handleStageClick = (stageName: string) => {
    if (!onNavigate) return;
    let targetStatus = stageName;
    if (stageName === 'Ready / Done') targetStatus = 'Ready';
    onNavigate('goals', {
      section: 'video_editing',
      status: targetStatus,
      viewType: 'projects_only'
    });
  };

  const handlePlatformClick = (platformName: string) => {
    if (!onNavigate) return;
    onNavigate('goal_marketing', {
      platform: platformName.toLowerCase(),
      viewType: 'projects_only'
    });
  };

  const handleCrmCategoryClick = (categoryKey: 'positive' | 'pending' | 'negative') => {
    if (!onNavigate) return;
    onNavigate('goal_freelance', {
      clientStatus: categoryKey
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. TOP HEADER & TIMEFRAME SWITCHER */}
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
              Click any metric or chart bar to jump directly to filtered project workspaces
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe selector */}
          <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => setActiveTimeframe('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTimeframe === 'all' ? 'bg-zinc-800 text-white font-bold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setActiveTimeframe('90day')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTimeframe === '90day' ? 'bg-zinc-800 text-white font-bold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              90-Day Sprint
            </button>
          </div>

          <div className="text-xs font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-sm">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Pipeline: <strong className="text-white">${overview?.totalRevenue?.toLocaleString() || 0}</strong></span>
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

      {/* 2. 4 BIG EXECUTIVE KPI CARDS (INTERACTIVE & CLICKABLE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks Velocity */}
        <div
          onClick={() => onNavigate && onNavigate('content')}
          className="bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-750 hover:border-emerald-500/60 rounded-2xl p-5 space-y-3 shadow-md transition-all cursor-pointer group hover:shadow-lg hover:shadow-emerald-950/40"
          title="Click to view Content Studio tasks"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider group-hover:text-zinc-200">
              Tasks Velocity
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-400 group-hover:bg-emerald-900">
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
            <span className="text-emerald-400 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              View Tasks <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Total Projects Delivered */}
        <div
          onClick={() => onNavigate && onNavigate('goals', { viewType: 'projects_only' })}
          className="bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-750 hover:border-blue-500/60 rounded-2xl p-5 space-y-3 shadow-md transition-all cursor-pointer group hover:shadow-lg hover:shadow-blue-950/40"
          title="Click to view all production projects"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider group-hover:text-zinc-200">
              Projects Throughput
            </span>
            <span className="p-1.5 rounded-lg bg-blue-950/60 border border-blue-800 text-blue-400 group-hover:bg-blue-900">
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
            <span className="text-blue-400 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              View Projects <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Client Outreach Conversion */}
        <div
          onClick={() => handleCrmCategoryClick('positive')}
          className="bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-750 hover:border-purple-500/60 rounded-2xl p-5 space-y-3 shadow-md transition-all cursor-pointer group hover:shadow-lg hover:shadow-purple-950/40"
          title="Click to view agreed and active clients"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider group-hover:text-zinc-200">
              Outreach Conversion
            </span>
            <span className="p-1.5 rounded-lg bg-purple-950/60 border border-purple-800 text-purple-400 group-hover:bg-purple-900">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-purple-300 font-mono">
              {overview?.conversionRate || 0}%
            </div>
            <span className="text-xs font-medium text-zinc-400">
              ({overview?.positiveClients || 0} Won)
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
            <span className="text-purple-400 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Won Leads <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Total Client Pipeline */}
        <div
          onClick={() => handleCrmCategoryClick('pending')}
          className="bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-750 hover:border-cyan-500/60 rounded-2xl p-5 space-y-3 shadow-md transition-all cursor-pointer group hover:shadow-lg hover:shadow-cyan-950/40"
          title="Click to view pending outreach leads"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider group-hover:text-zinc-200">
              Active Pipeline
            </span>
            <span className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800 text-cyan-400 group-hover:bg-cyan-900">
              <Briefcase className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-cyan-300 font-mono">
              {overview?.pendingClients || 0}
            </div>
            <span className="text-xs font-medium text-zinc-400">Waiting for Reply</span>
          </div>
          <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${overview?.totalClients > 0 ? Math.round((overview.pendingClients / overview.totalClients) * 100) : 0}%` }}
            />
          </div>
          <div className="text-[11px] text-zinc-400 flex justify-between">
            <span>Pending Leads: <strong className="text-cyan-300 font-mono">{overview?.pendingClients || 0}</strong></span>
            <span className="text-cyan-400 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Pending <ExternalLink className="w-3 h-3" />
            </span>
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
                <p className="text-[11px] text-zinc-400">Click any stage bar below to open filtered projects</p>
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
                  <Bar
                    dataKey="count"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    name="Projects"
                    className="cursor-pointer"
                    onClick={(entry: any) => handleStageClick(entry.stage)}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interactive Stage Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-900 text-center text-xs">
            {videoStageData.map((s: any) => (
              <button
                key={s.stage}
                onClick={() => handleStageClick(s.stage)}
                className="p-2.5 bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800/80 hover:border-blue-500/50 rounded-xl transition-all group text-left flex flex-col justify-between"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200 uppercase truncate">{s.stage}</span>
                  <ExternalLink className="w-3 h-3 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                </div>
                <span className="text-sm font-bold font-mono text-zinc-100 group-hover:text-blue-300 mt-1 block">{s.count}</span>
              </button>
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
                <p className="text-[11px] text-zinc-400">Click platform to jump to marketing edits</p>
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
              <span className="font-mono text-zinc-300">{marketing?.totalProjects || 0} Total Posts/Edits</span>
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
                  <Bar
                    dataKey="projects"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    name="Projects"
                    className="cursor-pointer"
                    onClick={(entry: any) => handlePlatformClick(entry.platform)}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interactive Platform Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-zinc-900 text-center text-xs">
            {marketingPlatformData.map((p: any) => (
              <button
                key={p.platform}
                onClick={() => handlePlatformClick(p.platform)}
                className="p-2.5 bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800/80 hover:border-emerald-500/50 rounded-xl transition-all group text-left flex flex-col justify-between"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200 uppercase truncate">{p.platform}</span>
                  <ExternalLink className="w-3 h-3 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                </div>
                <span className="text-sm font-bold font-mono text-emerald-400 mt-1 block">{p.projects}</span>
              </button>
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
                <p className="text-[11px] text-zinc-400">Click any category to open filtered Client CRM</p>
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
                    className="cursor-pointer"
                    onClick={(entry: any) => handleCrmCategoryClick(entry.key || 'positive')}
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
              <button
                onClick={() => handleCrmCategoryClick('positive')}
                className="w-full p-3 bg-emerald-950/25 hover:bg-emerald-950/50 border border-emerald-800/60 hover:border-emerald-600 rounded-xl flex items-center justify-between transition-all group text-left"
              >
                <div className="flex items-center gap-2 text-emerald-300 font-medium">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-emerald-200 group-hover:text-emerald-100 flex items-center gap-1">
                      Positive (Deals Won) <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-[10px] text-emerald-400/80 font-normal">Agreed / Active Retainers</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-300 font-mono text-sm">{crm?.positiveClients || 0}</div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    {crm?.totalClients > 0 ? Math.round((crm.positiveClients / crm.totalClients) * 100) : 0}%
                  </div>
                </div>
              </button>

              {/* Pending Responses */}
              <button
                onClick={() => handleCrmCategoryClick('pending')}
                className="w-full p-3 bg-blue-950/25 hover:bg-blue-950/50 border border-blue-800/60 hover:border-blue-600 rounded-xl flex items-center justify-between transition-all group text-left"
              >
                <div className="flex items-center gap-2 text-blue-300 font-medium">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="font-semibold text-blue-200 group-hover:text-blue-100 flex items-center gap-1">
                      Pending (Waiting Reply) <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-[10px] text-blue-400/80 font-normal">Contacted / In Discussion</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-300 font-mono text-sm">{crm?.pendingClients || 0}</div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    {crm?.totalClients > 0 ? Math.round((crm.pendingClients / crm.totalClients) * 100) : 0}%
                  </div>
                </div>
              </button>

              {/* Negative / Ghosted */}
              <button
                onClick={() => handleCrmCategoryClick('negative')}
                className="w-full p-3 bg-rose-950/25 hover:bg-rose-950/50 border border-rose-800/60 hover:border-rose-600 rounded-xl flex items-center justify-between transition-all group text-left"
              >
                <div className="flex items-center gap-2 text-rose-300 font-medium">
                  <UserX className="w-4 h-4 text-rose-400" />
                  <div>
                    <div className="font-semibold text-rose-200 group-hover:text-rose-100 flex items-center gap-1">
                      Negative / No Reply <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-[10px] text-rose-400/80 font-normal">Ghosted / Rejected</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-rose-300 font-mono text-sm">{crm?.negativeClients || 0}</div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    {crm?.totalClients > 0 ? Math.round((crm.negativeClients / crm.totalClients) * 100) : 0}%
                  </div>
                </div>
              </button>
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
