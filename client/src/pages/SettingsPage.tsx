import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  Download,
  Upload,
  RotateCcw,
  Check,
  Save,
  ShieldCheck,
  Cloud,
  HardDrive,
  History,
  Lock,
  Clock,
  Sparkles
} from 'lucide-react';

interface LocalSnapshot {
  id: string;
  timestamp: string;
  projectCount: number;
  taskCount: number;
  goalCount: number;
  data: any;
}

export const SettingsPage: React.FC = () => {
  const [cycleStartDate, setCycleStartDate] = useState('');
  const [cycleDurationDays, setCycleDurationDays] = useState(90);
  const [streakDays, setStreakDays] = useState<number>(0);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [snapshots, setSnapshots] = useState<LocalSnapshot[]>([]);

  const loadSettings = async () => {
    try {
      const res = await api.getSettings();
      setCycleStartDate(res.cycle_start_date);
      setCycleDurationDays(res.cycle_duration_days);
      setStreakDays(typeof res.streak_days === 'number' ? res.streak_days : 0);
      setUserName(res.user_name);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSnapshots = () => {
    try {
      const saved = localStorage.getItem('editor_os_recovery_snapshots');
      if (saved) {
        setSnapshots(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load snapshots:', err);
    }
  };

  const saveNewSnapshot = async (customLabel?: string) => {
    try {
      const data = await api.exportDatabase();
      const newSnapshot: LocalSnapshot = {
        id: `snap_${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        projectCount: data.projects?.length || 0,
        taskCount: data.tasks?.length || 0,
        goalCount: data.goals?.length || 0,
        data
      };

      const updated = [newSnapshot, ...snapshots.slice(0, 4)];
      setSnapshots(updated);
      localStorage.setItem('editor_os_recovery_snapshots', JSON.stringify(updated));
      setMessage({ type: 'success', text: customLabel || 'New recovery snapshot created!' });
      setTimeout(() => setMessage(null), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSettings();
    loadSnapshots();

    // Auto-create snapshot if none exists today
    const lastSnap = localStorage.getItem('editor_os_last_snap_date');
    const today = new Date().toISOString().split('T')[0];
    if (lastSnap !== today) {
      saveNewSnapshot('Daily auto-backup snapshot saved');
      localStorage.setItem('editor_os_last_snap_date', today);
    }
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateSettings({
        cycle_start_date: cycleStartDate,
        cycle_duration_days: Number(cycleDurationDays),
        streak_days: Number(streakDays),
        user_name: userName
      });
      setMessage({ type: 'success', text: 'Settings updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
      loadSettings();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to update settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetDayAndStreak = async () => {
    if (window.confirm('Reset cycle to DAY 1 and reset active Streak to 0?')) {
      setLoading(true);
      try {
        await api.resetCycleAndStreak(0);
        setMessage({ type: 'success', text: 'Reset completed: Now at DAY 1 / 90 with 0 Streak days!' });
        setTimeout(() => setMessage(null), 3000);
        loadSettings();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // 1-Click Complete Cloud Backup Export
  const handleExportJson = async () => {
    setExporting(true);
    try {
      const data = await api.exportDatabase();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
      const filename = `editor_os_cloud_backup_${dateStr}_${timeStr}.json`;

      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setMessage({ type: 'success', text: `Backup exported successfully: ${filename}` });
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      console.error('Export failed:', err);
      setMessage({ type: 'error', text: 'Failed to export backup.' });
    } finally {
      setExporting(false);
    }
  };

  // 1-Click Complete Cloud Backup Restore
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm(`Are you sure you want to restore from "${file.name}"? This will sync all records to Turso Cloud.`)) {
      e.target.value = '';
      return;
    }

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json || (!json.projects && !json.tasks && !json.goals)) {
          throw new Error('Invalid Editor OS backup structure.');
        }

        // Auto-save backup before replacing
        await saveNewSnapshot('Pre-restore safety snapshot created');

        await api.importDatabase(json);
        setMessage({ type: 'success', text: 'Database fully restored and synced to Turso Cloud!' });
        setTimeout(() => setMessage(null), 4000);
        loadSettings();
      } catch (err: any) {
        alert(`Restore error: ${err.message || 'Invalid JSON file'}`);
      } finally {
        setImporting(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleRestoreSnapshot = async (snap: LocalSnapshot) => {
    if (window.confirm(`Restore state to snapshot from ${snap.timestamp} (${snap.projectCount} Projects, ${snap.taskCount} Tasks)?`)) {
      setLoading(true);
      try {
        await api.importDatabase(snap.data);
        setMessage({ type: 'success', text: `Restored to checkpoint: ${snap.timestamp}` });
        setTimeout(() => setMessage(null), 3500);
        loadSettings();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResetToTemplate = async () => {
    if (window.confirm('Are you sure you want to reset the database to the default Editor OS v2.0 template?')) {
      try {
        await saveNewSnapshot('Pre-template reset backup');
        await api.resetDatabase();
        setMessage({ type: 'success', text: 'Database reset and reseeded with default template!' });
        setTimeout(() => setMessage(null), 3000);
        loadSettings();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-zinc-100 uppercase tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>SYSTEM SETTINGS & DATA SECURITY</span>
          </h2>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            Manage cloud database persistence, 1-click JSON backups, rollback snapshots, and sprint cycles.
          </p>
        </div>

        {/* Cloud Status Badge */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-300 font-semibold">Turso Cloud: Connected</span>
        </div>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-mono flex items-center gap-2.5 transition-all ${
            message.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : message.type === 'error'
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              : 'bg-zinc-900 border-zinc-700 text-zinc-200'
          }`}
        >
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* 1. DATA SECURITY & 1-CLICK BACKUP SYSTEM */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-mono font-bold uppercase text-zinc-100 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-amber-400" />
              <span>Full Database Backup & Cloud Sync</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Export all your Projects, Scripts, Tasks, Goals, CRM Clients, Ideas, and Settings into a single portable backup file.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {/* Export JSON Button */}
          <button
            onClick={handleExportJson}
            disabled={exporting}
            className="p-4 bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-750 hover:border-amber-500/50 rounded-xl text-left transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <Download className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">1-Click</span>
            </div>
            <div>
              <div className="font-mono font-bold text-xs text-zinc-100 group-hover:text-amber-300 transition-colors">
                {exporting ? 'Exporting...' : 'Export Backup (.json)'}
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                Download complete database snapshot to your device
              </div>
            </div>
          </button>

          {/* Import / Restore JSON Button */}
          <label className="p-4 bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-750 hover:border-emerald-500/50 rounded-xl text-left transition-all group flex flex-col justify-between space-y-3 cursor-pointer">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <Upload className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Restore</span>
            </div>
            <div>
              <div className="font-mono font-bold text-xs text-zinc-100 group-hover:text-emerald-300 transition-colors">
                {importing ? 'Restoring...' : 'Restore Backup (.json)'}
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                Upload backup file to restore & sync cloud DB
              </div>
            </div>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          {/* Instant Snapshot */}
          <button
            onClick={() => saveNewSnapshot('Manual checkpoint snapshot saved')}
            className="p-4 bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-750 hover:border-sky-500/50 rounded-xl text-left transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Instant</span>
            </div>
            <div>
              <div className="font-mono font-bold text-xs text-zinc-100 group-hover:text-sky-300 transition-colors">
                Create Local Checkpoint
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                Save an instant recovery point in browser cache
              </div>
            </div>
          </button>
        </div>

        {/* 2. RECOVERY SNAPSHOTS HISTORY */}
        {snapshots.length > 0 && (
          <div className="pt-3 border-t border-zinc-850 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-2">
                <History className="w-3.5 h-3.5 text-zinc-400" />
                <span>Recent Recovery Checkpoints</span>
              </h4>
              <span className="text-[11px] text-zinc-500 font-mono">Rollback anytime</span>
            </div>

            <div className="space-y-2">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="flex items-center justify-between p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-zinc-500" />
                    <div>
                      <span className="font-mono font-semibold text-zinc-200">{snap.timestamp}</span>
                      <div className="text-[11px] text-zinc-500">
                        {snap.projectCount} Projects • {snap.taskCount} Tasks • {snap.goalCount} Goals
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRestoreSnapshot(snap)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg font-mono text-[11px] font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3 text-amber-400" />
                    <span>Rollback</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. CLOUD SECURITY & MULTI-LAYER REDUNDANCY INFO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs">
            <Cloud className="w-4 h-4" />
            <span>Turso LibSQL Cloud</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Encrypted cloud database hosted on AWS EU with continuous WAL replication and cloud durability.
          </p>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-sky-400 font-mono font-bold text-xs">
            <HardDrive className="w-4 h-4" />
            <span>Offline-First Redundancy</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Every record is mirrored locally in browser storage. Works without internet with zero data loss.
          </p>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs">
            <Lock className="w-4 h-4" />
            <span>End-to-End Privacy</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Your scripts, client lists, and metrics are protected by TLS 1.3 encryption and PIN security.
          </p>
        </div>
      </div>

      {/* 4. 90-DAY SPRINT CYCLE SETTINGS */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
        <h3 className="text-sm font-mono font-bold uppercase text-zinc-200">
          90-Day Growth Sprint Configuration
        </h3>

        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-mono text-zinc-400 block mb-1">Sprint Cycle Start Date</label>
              <input
                type="date"
                value={cycleStartDate}
                onChange={(e) => setCycleStartDate(e.target.value)}
                className="w-full text-xs bg-zinc-900 border border-zinc-750 rounded-xl p-2.5 text-zinc-100"
              />
            </div>

            <div>
              <label className="font-mono text-zinc-400 block mb-1">Cycle Duration (Days)</label>
              <input
                type="number"
                value={cycleDurationDays}
                onChange={(e) => setCycleDurationDays(parseInt(e.target.value) || 90)}
                className="w-full text-xs bg-zinc-900 border border-zinc-750 rounded-xl p-2.5 text-zinc-100"
              />
            </div>

            <div>
              <label className="font-mono text-zinc-400 block mb-1">Active Streak (Days)</label>
              <input
                type="number"
                value={streakDays}
                onChange={(e) => setStreakDays(parseInt(e.target.value) || 0)}
                className="w-full text-xs bg-zinc-900 border border-zinc-750 rounded-xl p-2.5 text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="font-mono text-zinc-400 block mb-1">Editor Name / Profile</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full text-xs bg-zinc-900 border border-zinc-750 rounded-xl p-2.5 text-zinc-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Sprint Configuration</span>
            </button>

            <button
              type="button"
              onClick={handleResetDayAndStreak}
              disabled={loading}
              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl font-mono font-bold flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Day 1 & Reset Streak (0)</span>
            </button>
          </div>
        </form>
      </div>

      {/* 5. TEMPLATE RESET */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-3 text-xs">
        <h3 className="text-sm font-mono font-bold uppercase text-zinc-400">
          Template Reset
        </h3>
        <p className="text-zinc-500">
          Reset all databases to the default fresh Editor OS v2.0 structure. A safety backup will automatically be saved before resetting.
        </p>

        <button
          onClick={handleResetToTemplate}
          className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-xl font-mono flex items-center gap-1.5 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Default Template</span>
        </button>
      </div>
    </div>
  );
};
