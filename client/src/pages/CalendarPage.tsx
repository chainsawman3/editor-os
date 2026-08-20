import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Project, Task, ContentItem } from '../types';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle } from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    try {
      const [p, t, c] = await Promise.all([api.getProjects(), api.getTasks(), api.getContent()]);
      setProjects(p);
      setTasks(t);
      setContent(c.items);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const selectedTasks = tasks.filter((t) => t.due_date === selectedDate);
  const selectedProjects = projects.filter((p) => p.deadline === selectedDate);
  const selectedContent = content.filter((c) => c.scheduled_date === selectedDate);

  const days = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push(dStr);
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4">
        <h2 className="text-xl font-bold font-mono text-zinc-100 uppercase">DEADLINES & PRODUCTION CALENDAR</h2>
        <p className="text-xs text-zinc-400 font-sans">
          Centralized calendar view for project deadlines, content release schedules, and task due dates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Month Calendar Grid */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-mono text-zinc-100 uppercase">
              {monthNames[month]} {year}
            </h3>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono rounded"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] text-zinc-400 font-bold border-b border-zinc-900 pb-2">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {days.map((dStr, idx) => {
              if (!dStr) {
                return <div key={`empty_${idx}`} className="h-20 bg-zinc-950/20 rounded border border-transparent" />;
              }

              const dayNum = parseInt(dStr.split('-')[2]);
              const isSelected = selectedDate === dStr;
              const isToday = dStr === todayStr;

              const dayProjects = projects.filter((p) => p.deadline === dStr);
              const dayTasks = tasks.filter((t) => t.due_date === dStr);
              const dayContent = content.filter((c) => c.scheduled_date === dStr);
              const totalItems = dayProjects.length + dayTasks.length + dayContent.length;

              return (
                <div
                  key={dStr}
                  onClick={() => setSelectedDate(dStr)}
                  className={`h-20 p-1.5 rounded border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-zinc-900 border-zinc-400'
                      : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className={`font-bold ${isToday ? 'px-1 bg-zinc-100 text-zinc-950 rounded' : 'text-zinc-300'}`}>
                      {dayNum}
                    </span>
                    {totalItems > 0 && (
                      <span className="text-[9px] px-1 bg-zinc-900 text-zinc-400 rounded">
                        {totalItems}
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5 overflow-hidden">
                    {dayProjects.map((p) => (
                      <div
                        key={p.id}
                        className="text-[9px] font-mono px-1 py-0.2 bg-zinc-800 text-zinc-200 truncate rounded"
                      >
                        [P] {p.name}
                      </div>
                    ))}
                    {dayContent.map((c) => (
                      <div
                        key={c.id}
                        className="text-[9px] font-mono px-1 py-0.2 bg-zinc-900 text-zinc-400 truncate rounded"
                      >
                        [C] {c.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Selected Date Schedule & Action Detail */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 space-y-4">
          <div className="border-b border-zinc-800 pb-3">
            <span className="text-[10px] font-mono uppercase text-zinc-400 block">SELECTED SCHEDULE</span>
            <h3 className="text-base font-bold font-mono text-zinc-100">{selectedDate}</h3>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase block mb-2">
                Project Deadlines ({selectedProjects.length})
              </span>
              {selectedProjects.length === 0 ? (
                <p className="text-xs text-zinc-400 font-mono italic">No project deadlines on this day.</p>
              ) : (
                selectedProjects.map((p) => (
                  <div key={p.id} className="p-2.5 bg-zinc-900 border border-zinc-800 rounded mb-2 space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-zinc-100">{p.name}</span>
                      <span className="text-[10px] text-zinc-400">{p.health_status}</span>
                    </div>
                    {p.next_action && <p className="text-[11px] text-zinc-400">→ {p.next_action}</p>}
                  </div>
                ))
              )}
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase block mb-2">
                Scheduled Content Posts ({selectedContent.length})
              </span>
              {selectedContent.length === 0 ? (
                <p className="text-xs text-zinc-400 font-mono italic">No content scheduled.</p>
              ) : (
                selectedContent.map((c) => (
                  <div key={c.id} className="p-2.5 bg-zinc-900 border border-zinc-800 rounded mb-2 space-y-0.5">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">{c.content_type}</span>
                    <h5 className="text-xs font-mono font-bold text-zinc-200">{c.title}</h5>
                  </div>
                ))
              )}
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase block mb-2">
                Tasks & Milestones ({selectedTasks.length})
              </span>
              {selectedTasks.length === 0 ? (
                <p className="text-xs text-zinc-400 font-mono italic">No tasks due.</p>
              ) : (
                selectedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded mb-2 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {t.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-zinc-100" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-zinc-500" />
                      )}
                      <span className={t.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}>
                        {t.title}
                      </span>
                    </div>
                    {t.stage && (
                      <span className="text-[10px] font-mono px-1.5 bg-zinc-800 text-zinc-400 rounded">
                        {t.stage}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
