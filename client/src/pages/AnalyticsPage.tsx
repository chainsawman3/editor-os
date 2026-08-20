import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  BarChart,
  Bar,
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
  TrendingUp,
  UserCheck,
  UserX,
  Clock,
  DollarSign,
  CheckCircle2,
  Briefcase,
  Zap,
  Layers
} from 'lucide-react';
import { AnalyticsSkeleton } from '../components/common/SkeletonLoader';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const { crmFunnel, velocity, stats } = data;

  const funnelChartData = [
    { name: 'Contacted', value: crmFunnel?.contacted || 0, color: '#3b82f6' },
    { name: 'Ignored', value: crmFunnel?.ignored || 0, color: '#64748b' },
    { name: 'Agreed', value: crmFunnel?.agreed || 0, color: '#06b6d4' },
    { name: 'Active Client', value: crmFunnel?.activeClients || 0, color: '#10b981' }
  ];

  const projectStatusData = [
    { name: 'Planned', count: velocity?.plannedProjects || 0 },
    { name: 'In Progress', count: velocity?.inProgressProjects || 0 },
    { name: 'Completed / Ready', count: velocity?.completedProjects || 0 }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. HEADER */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-700/80 text-zinc-100">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
          </span>
          <div>
            <h1 className="text-xl font-bold font-mono text-zinc-100 tracking-tight">CRAFT & OUTREACH ANALYTICS</h1>
            <p className="text-xs text-zinc-400 font-mono">
              Client Conversion Funnel, Task Completion Velocity, and Project Throughput
            </p>
          </div>
        </div>
        <div className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
          <DollarSign className="w-4 h-4" /> Total Revenue: ${crmFunnel?.totalRevenue || 0}
        </div>
      </div>

      {/* 2. TOP METRICS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase block">Outreach Conversion</span>
          <div className="text-2xl font-bold text-cyan-400">{crmFunnel?.conversionRate || 0}%</div>
          <span className="text-[10px] text-zinc-400 block">Lead to Agreement</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase block">Active Retainers</span>
          <div className="text-2xl font-bold text-emerald-400">{crmFunnel?.activeClients || 0}</div>
          <span className="text-[10px] text-zinc-400 block">Paying Clients</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase block">Tasks Completed</span>
          <div className="text-2xl font-bold text-zinc-100">
            {velocity?.completedTasks || 0} / {velocity?.totalTasks || 0}
          </div>
          <span className="text-[10px] text-zinc-400 block">{velocity?.taskVelocityRate || 0}% completion rate</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase block">Projects Delivered</span>
          <div className="text-2xl font-bold text-purple-400">{velocity?.completedProjects || 0}</div>
          <span className="text-[10px] text-zinc-400 block">Ready / Posted</span>
        </div>
      </div>

      {/* 3. CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client CRM Funnel Chart */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-cyan-400" /> Client Outreach Funnel Breakdown
            </h2>
            <span className="text-xs font-mono text-zinc-400">{crmFunnel?.totalOutreach || 0} Total Leads</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={funnelChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {funnelChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }}
                    itemStyle={{ color: '#e4e4e7' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 bg-blue-950/30 border border-blue-800/60 rounded-lg flex items-center justify-between">
                <span className="flex items-center gap-2 text-blue-300">
                  <Clock className="w-3.5 h-3.5" /> Contacted (In Progress)
                </span>
                <span className="font-bold text-blue-100">{crmFunnel?.contacted || 0}</span>
              </div>

              <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between">
                <span className="flex items-center gap-2 text-zinc-400">
                  <UserX className="w-3.5 h-3.5" /> Ignored / Ghosted
                </span>
                <span className="font-bold text-zinc-300">{crmFunnel?.ignored || 0}</span>
              </div>

              <div className="p-2.5 bg-cyan-950/30 border border-cyan-800/60 rounded-lg flex items-center justify-between">
                <span className="flex items-center gap-2 text-cyan-300">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Agreed / Discussion
                </span>
                <span className="font-bold text-cyan-100">{crmFunnel?.agreed || 0}</span>
              </div>

              <div className="p-2.5 bg-emerald-950/30 border border-emerald-800/60 rounded-lg flex items-center justify-between">
                <span className="flex items-center gap-2 text-emerald-300">
                  <UserCheck className="w-3.5 h-3.5" /> Active Paying Clients
                </span>
                <span className="font-bold text-emerald-100">{crmFunnel?.activeClients || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Task Velocity Weekly Chart */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" /> Weekly Execution Velocity (Tasks Done)
            </h2>
            <span className="text-xs font-mono text-zinc-400">7-Day Pace</span>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocity?.weeklyProgress || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#52525b" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#52525b" fontSize={11} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Bar dataKey="tasksDone" fill="#10b981" radius={[4, 4, 0, 0]} name="Tasks Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pt-2 border-t border-zinc-900">
            <span>Average Speed: 2.8 tasks/day</span>
            <span className="text-emerald-400 font-bold">Pacing: Optimal</span>
          </div>
        </div>
      </div>
    </div>
  );
};
