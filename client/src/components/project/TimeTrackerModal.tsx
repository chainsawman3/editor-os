import React, { useState } from 'react';
import { api } from '../../api';
import { X, Clock, Plus } from 'lucide-react';

interface TimeTrackerModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TimeTrackerModal: React.FC<TimeTrackerModalProps> = ({
  projectId,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [stage, setStage] = useState('Editing');
  const [hours, setHours] = useState<number>(1.5);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stage || hours <= 0) return;

    setLoading(true);
    try {
      await api.addTimeLog(projectId, {
        stage,
        hours: Number(hours),
        date,
        notes
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stages = [
    'Research',
    'Editing',
    'Sound Design',
    'Color Grading',
    'Motion Graphics',
    'Export',
    'Client Revisions',
    'Admin'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-zinc-950 border border-zinc-700 w-full max-w-md rounded-lg shadow-2xl overflow-hidden font-sans">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-300" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-200">
              LOG TIME BY CRAFT STAGE
            </span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs">
          <div>
            <label className="font-mono text-zinc-400 block mb-1">Production Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full text-xs"
            >
              {stages.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-zinc-400 block mb-1">Hours Invested</label>
              <input
                type="number"
                step="0.25"
                min="0.25"
                value={hours}
                onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
                className="w-full text-xs"
              />
            </div>

            <div>
              <label className="font-mono text-zinc-400 block mb-1">Session Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-mono text-zinc-400 block mb-1">Session Notes (Optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Foley layering for transition at 00:04..."
              className="w-full text-xs resize-none"
            />
          </div>

          <div className="pt-2 border-t border-zinc-900 flex justify-end gap-2 font-mono">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || hours <= 0}
              className="px-4 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded font-bold"
            >
              Save Time Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
