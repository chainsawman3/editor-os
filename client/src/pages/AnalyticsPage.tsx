import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Clock, TrendingUp } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
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
    return <div className="p-8 text-center font-mono text-xs text-zinc-500">COMPUTING ANALYTICS...</div>;
  }

  if (!data) return null;

  const { stageHoursData, contentRoiData, difficultyDistribution, stats } = data;

  const difficultyData = Object.entries(difficultyDistribution || {}).map(([diff, count]) => ({
    name: diff,
    count: Number(count) || 0
  }));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4">
        <h2 className="text-xl font-bold font-mono text-zinc-100 uppercase">PERFORMANCE & CRAFT ANALYTICS</h2>
        <p className="text-xs text-zinc-400 font-sans">
          Section 17: Objective metrics analyzing time distribution, content ROI leverage, and difficulty estimation.
        </p>
      </div>

      {/* Top High-Level Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg">
          <span className="text-[10px] text-zinc-400 uppercase block">Total Hours Logged</span>
          <div className="text-2xl font-bold text-zinc-100 mt-1">{stats.totalHoursLogged?.toFixed(1) || 0} hrs</div>
          <span className="text-[10px] text-zinc-400 mt-1 block">Across all stages</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg">
          <span className="text-[10px] text-zinc-400 uppercase block">Total Revenue</span>
          <div className="text-2xl font-bold text-zinc-100 mt-1">${stats.totalRevenue?.toLocaleString() || 0}</div>
          <span className="text-[10px] text-zinc-400 mt-1 block">From freelance</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg">
          <span className="text-[10px] text-zinc-400 uppercase block">Projects Completed</span>
          <div className="text-2xl font-bold text-zinc-100 mt-1">
            {stats.completedProjects} <span className="text-xs text-zinc-400 font-normal">/ {stats.totalProjects}</span>
          </div>
          <span className="text-[10px] text-zinc-400 mt-1 block">Total tracked</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg">
          <span className="text-[10px] text-zinc-400 uppercase block">Wins Logged</span>
          <div className="text-2xl font-bold text-zinc-100 mt-1">{stats.totalWins || 0}</div>
          <span className="text-[10px] text-zinc-400 mt-1 block">Career milestones</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Hours Distribution */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-300" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100">
                TIME INVESTED BY CRAFT STAGE (HOURS)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Real stage breakdown</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="stage"
                  stroke="#71717a"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', fontSize: '11px', color: '#fff' }}
                  cursor={{ fill: '#27272a' }}
                />
                <Bar dataKey="hours" fill="#f4f4f5" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Effort vs Result ROI */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-zinc-300" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100">
                CONTENT ROI LEVERAGE (VIEWS PER HOUR)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Section 9.3 Analytics</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contentRoiData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="title"
                  stroke="#71717a"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  tickFormatter={(val) => (val.length > 12 ? `${val.substring(0, 10)}...` : val)}
                />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', fontSize: '11px', color: '#fff' }}
                  cursor={{ fill: '#27272a' }}
                />
                <Bar dataKey="roi" fill="#a1a1aa" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Project Difficulty Calibration Distribution */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100">
            PROJECT DIFFICULTY CALIBRATION DISTRIBUTION
          </h3>
          <span className="text-[10px] font-mono text-zinc-400">Estimations vs Execution</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs text-center">
          {difficultyData.map((d) => (
            <div key={d.name} className="p-3 bg-zinc-900/60 border border-zinc-800 rounded space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase">{d.name} Difficulty</span>
              <div className="text-xl font-bold text-zinc-100">{d.count} Projects</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
