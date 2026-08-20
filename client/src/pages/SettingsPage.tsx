import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Download, Upload, RotateCcw, Check, Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [cycleStartDate, setCycleStartDate] = useState('');
  const [cycleDurationDays, setCycleDurationDays] = useState(90);
  const [streakDays, setStreakDays] = useState<number>(0);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

  useEffect(() => {
    loadSettings();
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
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(null), 3000);
      loadSettings();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDayAndStreak = async () => {
    if (window.confirm('Reset cycle to DAY 1 and reset active Streak to 0?')) {
      setLoading(true);
      try {
        await api.resetCycleAndStreak(0);
        setMessage('Reset completed: Now at DAY 1 / 90 with 0 Streak days!');
        setTimeout(() => setMessage(null), 3000);
        loadSettings();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExportJson = () => {
    window.open('http://localhost:3001/api/settings/export', '_blank');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        await api.importDatabase(json);
        setMessage('Database restored from JSON backup!');
        setTimeout(() => setMessage(null), 3000);
        loadSettings();
      } catch (err) {
        alert('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToTemplate = async () => {
    if (window.confirm('Are you sure you want to reset the database to the default Editor OS v2.0 template?')) {
      try {
        await api.resetDatabase();
        setMessage('Database reset and reseeded with default v2.0 architecture!');
        setTimeout(() => setMessage(null), 3000);
        loadSettings();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4">
        <h2 className="text-xl font-bold font-mono text-zinc-100 uppercase">SYSTEM SETTINGS & DATA STORAGE</h2>
        <p className="text-xs text-zinc-400 font-sans">
          Configure the 90-day sprint cycle, backup full database to JSON, and manage system persistence.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-zinc-900 border border-zinc-700 text-zinc-100 rounded text-xs font-mono flex items-center gap-2">
          <Check className="w-4 h-4 text-zinc-300" />
          <span>{message}</span>
        </div>
      )}

      {/* 90-Day Sprint Cycle Settings */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 space-y-4">
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
                className="w-full text-xs"
              />
            </div>

            <div>
              <label className="font-mono text-zinc-400 block mb-1">Cycle Duration (Days)</label>
              <input
                type="number"
                value={cycleDurationDays}
                onChange={(e) => setCycleDurationDays(parseInt(e.target.value) || 90)}
                className="w-full text-xs"
              />
            </div>

            <div>
              <label className="font-mono text-zinc-400 block mb-1">Active Streak (Days)</label>
              <input
                type="number"
                value={streakDays}
                onChange={(e) => setStreakDays(parseInt(e.target.value) || 0)}
                className="w-full text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-mono text-zinc-400 block mb-1">Editor Name / Profile</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded font-mono font-bold flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Sprint Configuration</span>
            </button>

            <button
              type="button"
              onClick={handleResetDayAndStreak}
              disabled={loading}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded font-mono font-bold flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Day 1 & Reset Streak (0)</span>
            </button>
          </div>
        </form>
      </div>

      {/* Persistent Backup & Data Portability */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 space-y-4 text-xs">
        <h3 className="text-sm font-mono font-bold uppercase text-zinc-200">
          Data Portability & Database Backups
        </h3>
        <p className="text-zinc-400">
          Your entire system state (Projects, Checklists, Content, CRM, Knowledge Base, Wins, and Reports) can be exported and imported as a single portable JSON file.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportJson}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded font-mono font-bold flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Database (JSON)</span>
          </button>

          <label className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded font-mono font-bold flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Restore Backup (JSON)</span>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>
        </div>
      </div>

      {/* Template Reset */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-5 space-y-3 text-xs">
        <h3 className="text-sm font-mono font-bold uppercase text-zinc-400">
          Template Reset
        </h3>
        <p className="text-zinc-400">
          Reset all databases to the default fresh Editor OS v2.0 structure.
        </p>

        <button
          onClick={handleResetToTemplate}
          className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded font-mono flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Default Template</span>
        </button>
      </div>
    </div>
  );
};
