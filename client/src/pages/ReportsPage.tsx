import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Report } from '../types';
import { Trash2 } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [reportType, setReportType] = useState<'weekly' | 'monthly' | 'milestone'>('weekly');
  const [milestoneDay, setMilestoneDay] = useState<number>(30);

  // Auto-aggregation state
  const [autoData, setAutoData] = useState<any>(null);
  const [milestoneBenchmark, setMilestoneBenchmark] = useState<any>(null);

  // Manual reflection form fields
  const [whatWorked, setWhatWorked] = useState('');
  const [whatFailed, setWhatFailed] = useState('');
  const [problemsEncountered, setProblemsEncountered] = useState('');
  const [whatLearned, setWhatLearned] = useState('');
  const [nextPriorities, setNextPriorities] = useState('');
  const [biggestWin, setBiggestWin] = useState('');
  const [biggestProblem, setBiggestProblem] = useState('');
  const [loading, setLoading] = useState(false);

  const loadReports = async () => {
    try {
      const res = await api.getReports();
      setReports(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const openNewReportModal = async (type: 'weekly' | 'monthly' | 'milestone') => {
    setReportType(type);
    setLoading(true);
    setShowModal(true);

    try {
      if (type === 'milestone') {
        const bench = await api.getMilestoneBenchmark();
        setMilestoneBenchmark(bench);
      } else {
        const auto = await api.getAutoAggregatedReport();
        setAutoData(auto);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.createReport({
        type: reportType === 'milestone' ? (`milestone_${milestoneDay}` as any) : reportType,
        period_start: autoData?.period_start || new Date().toISOString().split('T')[0],
        period_end: autoData?.period_end || new Date().toISOString().split('T')[0],
        milestone_day: reportType === 'milestone' ? milestoneDay : undefined,
        metrics_json: reportType === 'milestone' ? milestoneBenchmark : autoData?.aggregated || {},
        what_worked: whatWorked,
        what_failed: whatFailed,
        problems_encountered: problemsEncountered,
        what_learned: whatLearned,
        next_priorities: nextPriorities,
        biggest_win: biggestWin,
        biggest_problem: biggestProblem
      });

      setShowModal(false);
      setWhatWorked('');
      setWhatFailed('');
      setProblemsEncountered('');
      setWhatLearned('');
      setNextPriorities('');
      setBiggestWin('');
      setBiggestProblem('');
      loadReports();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await api.deleteReport(id);
    loadReports();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-zinc-100 uppercase">REPORTS & PERIODIC AUDITS</h2>
          <p className="text-xs text-zinc-400 font-sans">
            Section 16: Automated metrics combined with honest manual reflection (Weekly, Monthly, and Day 30/60/90 reviews).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openNewReportModal('weekly')}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded text-xs font-mono font-bold"
          >
            + Weekly Report
          </button>
          <button
            onClick={() => openNewReportModal('monthly')}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded text-xs font-mono font-bold"
          >
            + Monthly Report
          </button>
          <button
            onClick={() => openNewReportModal('milestone')}
            className="px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded text-xs font-mono font-bold shadow-sm"
          >
            + Milestone Review
          </button>
        </div>
      </div>

      {/* Reports Feed */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <p className="text-xs font-mono text-zinc-500 italic p-8 text-center border border-dashed border-zinc-800 rounded bg-zinc-950">
            No periodic reports created yet. Generate a report using the buttons above.
          </p>
        ) : (
          reports.map((rep) => (
            <div key={rep.id} className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <div className="flex items-center gap-2 font-mono">
                  <span className="px-2 py-0.5 bg-zinc-100 text-zinc-950 font-bold uppercase rounded text-[10px]">
                    {rep.type.replace('_', ' ')}
                  </span>
                  <span className="text-zinc-400 text-[11px]">
                    Period: {rep.period_start} → {rep.period_end}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono text-zinc-400 text-[10px]">
                  <span>{new Date(rep.created_at).toLocaleDateString()}</span>
                  <button onClick={() => handleDelete(rep.id)} className="hover:text-zinc-200">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Aggregated metrics snapshot */}
              {rep.metrics_json && typeof rep.metrics_json === 'object' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                  {Object.entries(rep.metrics_json)
                    .filter(([k]) => typeof rep.metrics_json[k] === 'number')
                    .map(([key, val]) => (
                      <div key={key} className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded">
                        <span className="text-[10px] text-zinc-400 uppercase block truncate">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-sm font-bold text-zinc-100">{String(val)}</span>
                      </div>
                    ))}
                </div>
              )}

              {/* Reflection Q&A */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 font-sans">
                {rep.what_worked && (
                  <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded space-y-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">What Worked:</span>
                    <p className="text-zinc-200 leading-relaxed">{rep.what_worked}</p>
                  </div>
                )}
                {rep.what_failed && (
                  <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded space-y-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">What Did Not Work:</span>
                    <p className="text-zinc-200 leading-relaxed">{rep.what_failed}</p>
                  </div>
                )}
                {rep.what_learned && (
                  <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded space-y-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">What I Learned:</span>
                    <p className="text-zinc-200 leading-relaxed">{rep.what_learned}</p>
                  </div>
                )}
                {rep.next_priorities && (
                  <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded space-y-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">Next Priorities:</span>
                    <p className="text-zinc-200 leading-relaxed">{rep.next_priorities}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE REPORT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-700 w-full max-w-2xl rounded-lg shadow-2xl p-6 font-sans space-y-5 my-8">
            <h3 className="text-sm font-mono font-bold text-zinc-100 uppercase tracking-wider">
              CREATE {reportType.toUpperCase()} REVIEW & AUDIT
            </h3>

            {/* Auto aggregated summary banner */}
            {autoData && (
              <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase font-bold">
                  Auto-Collected Period Statistics:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center font-mono">
                  <div className="bg-zinc-950 p-2 rounded">
                    <span className="text-[9px] text-zinc-500 block">Tasks Done</span>
                    <span className="font-bold text-zinc-100">{autoData.aggregated?.completedTasksCount}</span>
                  </div>
                  <div className="bg-zinc-950 p-2 rounded">
                    <span className="text-[9px] text-zinc-500 block">Active Proj</span>
                    <span className="font-bold text-zinc-100">{autoData.aggregated?.activeProjectsCount}</span>
                  </div>
                  <div className="bg-zinc-950 p-2 rounded">
                    <span className="text-[9px] text-zinc-500 block">Posted</span>
                    <span className="font-bold text-zinc-100">{autoData.aggregated?.contentPostedCount}</span>
                  </div>
                  <div className="bg-zinc-950 p-2 rounded">
                    <span className="text-[9px] text-zinc-500 block">Blockers</span>
                    <span className="font-bold text-zinc-100">{autoData.aggregated?.activeBlockersCount}</span>
                  </div>
                  <div className="bg-zinc-950 p-2 rounded">
                    <span className="text-[9px] text-zinc-500 block">Wins</span>
                    <span className="font-bold text-zinc-100">{autoData.aggregated?.winsCount}</span>
                  </div>
                  <div className="bg-zinc-950 p-2 rounded">
                    <span className="text-[9px] text-zinc-500 block">Revenue</span>
                    <span className="font-bold text-zinc-100">${autoData.aggregated?.totalRevenue}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Milestone Benchmark Table */}
            {reportType === 'milestone' && milestoneBenchmark && (
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded space-y-2">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold uppercase text-zinc-200">MILESTONE BENCHMARK AUDIT</span>
                  <select
                    value={milestoneDay}
                    onChange={(e) => setMilestoneDay(parseInt(e.target.value))}
                    className="text-xs bg-zinc-950"
                  >
                    <option value={30}>Day 30 Audit</option>
                    <option value={60}>Day 60 Audit</option>
                    <option value={90}>Day 90 Audit</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono text-left">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400 text-[10px]">
                        <th className="py-1">METRIC</th>
                        <th className="py-1">DAY 1 BASELINE</th>
                        <th className="py-1">CURRENT MILESTONE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                      <tr>
                        <td className="py-1">Portfolio Projects</td>
                        <td>{milestoneBenchmark.day1_baseline.portfolioProjects}</td>
                        <td className="font-bold text-zinc-100">{milestoneBenchmark.current_milestone.portfolioProjects}</td>
                      </tr>
                      <tr>
                        <td className="py-1">Signed Clients</td>
                        <td>{milestoneBenchmark.day1_baseline.clients}</td>
                        <td className="font-bold text-zinc-100">{milestoneBenchmark.current_milestone.clients}</td>
                      </tr>
                      <tr>
                        <td className="py-1">Revenue ($)</td>
                        <td>${milestoneBenchmark.day1_baseline.revenue}</td>
                        <td className="font-bold text-zinc-100">${milestoneBenchmark.current_milestone.revenue}</td>
                      </tr>
                      <tr>
                        <td className="py-1">Instagram Posts</td>
                        <td>{milestoneBenchmark.day1_baseline.instagramPosts}</td>
                        <td className="font-bold text-zinc-100">{milestoneBenchmark.current_milestone.instagramPosts}</td>
                      </tr>
                      <tr>
                        <td className="py-1">Wins Logged</td>
                        <td>{milestoneBenchmark.day1_baseline.winsLogged}</td>
                        <td className="font-bold text-zinc-100">{milestoneBenchmark.current_milestone.winsLogged}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Manual Reflection Questions */}
            <form onSubmit={handleCreateReport} className="space-y-3 text-xs">
              <div>
                <label className="font-mono text-zinc-400 block mb-1">What Worked Well? *</label>
                <textarea
                  rows={2}
                  value={whatWorked}
                  onChange={(e) => setWhatWorked(e.target.value)}
                  placeholder="Effective workflows, strong sound design sessions, good outreach responses..."
                  required
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="font-mono text-zinc-400 block mb-1">What Did NOT Work? / Time Sinks</label>
                <textarea
                  rows={2}
                  value={whatFailed}
                  onChange={(e) => setWhatFailed(e.target.value)}
                  placeholder="Distractions, unproductive asset hunting, delayed feedback..."
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="font-mono text-zinc-400 block mb-1">Craft Lessons Learned</label>
                <textarea
                  rows={2}
                  value={whatLearned}
                  onChange={(e) => setWhatLearned(e.target.value)}
                  placeholder="Technical insights into pacing, compression, DaVinci nodes..."
                  className="w-full text-xs"
                />
              </div>

              <div>
                <label className="font-mono text-zinc-400 block mb-1">Priorities for Next Phase *</label>
                <textarea
                  rows={2}
                  value={nextPriorities}
                  onChange={(e) => setNextPriorities(e.target.value)}
                  placeholder="The top 3 non-negotiable targets for next week/month..."
                  required
                  className="w-full text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-900 font-mono">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !whatWorked.trim() || !nextPriorities.trim()}
                  className="px-4 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded font-bold"
                >
                  Save Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
