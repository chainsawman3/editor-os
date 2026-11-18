import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Waves,
  Calendar,
  CheckCircle2,
  Circle,
  Flame,
  Clock,
  Sparkles,
  RefreshCw,
  Bell,
  ArrowRight,
  ShieldCheck,
  Check,
  Zap
} from 'lucide-react';
import { api } from '../api';

interface WorkoutDay {
  id: string;
  dayName: string;
  dayShort: string;
  type: 'gym' | 'pool' | 'rest';
  title: string;
  subtitle: string;
  duration: string;
  exercises?: string[];
  focus: string;
  isSaturdayPool?: boolean;
}

const DEFAULT_SCHEDULE: WorkoutDay[] = [
  {
    id: 'mon',
    dayName: 'ორშაბათი',
    dayShort: 'ორშ',
    type: 'gym',
    title: 'დარბაზი: Push (მკერდი, მხრები, ტრიცეფსი)',
    subtitle: 'ძალოვანი ვარჯიში A',
    duration: '60 წუთი',
    focus: 'ზედა ტანის ბიძგითი კუნთები, ჰანტელების პრესი, ბრუსები',
    exercises: ['შტანგის/ჰანტელის ჟიმი', 'ჰანტელების განზე აწევა მხრებისთვის', 'ფრანგული ჟიმი / ტრიცეფსის ბლოკი', 'პრესის ვარჯიშები']
  },
  {
    id: 'tue',
    dayName: 'სამშაბათი',
    dayShort: 'სამ',
    type: 'rest',
    title: 'დასვენება & აქტიური აღდგენა',
    subtitle: 'Recovery Day',
    duration: 'მსუბუქი ფეხით სიარული',
    focus: 'კუნთების რელაქსაცია, წყლის ბალანსი და ძილი',
    exercises: ['10,000 ნაბიჯი', 'მსუბუქი გაჭიმვები']
  },
  {
    id: 'wed',
    dayName: 'ოთხშაბათი',
    dayShort: 'ოთხ',
    type: 'gym',
    title: 'დარბაზი: Pull (ზურგი, ბიცეფსი)',
    subtitle: 'ძალოვანი ვარჯიში B',
    duration: '60 წუთი',
    focus: 'ზურგის სიგანე და სისქე, ტურნიკი, ბიცეფსის იზოლაცია',
    exercises: ['ტურნიკი / ვერტიკალური ბლოკი', 'ჰანტელის წევა დახრილში', 'ბიცეფსის აწევა შტანგით/ჰანტელებით', 'ჰიპერექსტენზია']
  },
  {
    id: 'thu',
    dayName: 'ხუთშაბათი',
    dayShort: 'ხუთ',
    type: 'rest',
    title: 'დასვენება & მობილურობა',
    subtitle: 'Recovery Day',
    duration: 'სრული განტვირთვა',
    focus: 'სახსრების განტვირთვა და ენერგიის შევსება',
    exercises: ['მობილურობის სავარჯიშოები']
  },
  {
    id: 'fri',
    dayName: 'პარასკევი',
    dayShort: 'პარ',
    type: 'gym',
    title: 'დარბაზი: Legs & Core (ფეხები და პრესი)',
    subtitle: 'ძალოვანი ვარჯიში C',
    duration: '60 წუთი',
    focus: 'ქვედა ტანი, კვადრიცეფსი, ბარძაყი, პრესი',
    exercises: ['ჩაჯდომები (Squats) / ლეგ პრესი', 'ფეხის გაშლა/მოხრა ტრენაჟორზე', 'წვივები', 'ფიცარი (Plank) და პრესი']
  },
  {
    id: 'sat',
    dayName: 'შაბათი',
    dayShort: 'შაბ',
    type: 'pool',
    isSaturdayPool: true,
    title: '🏊‍♂️ აუზის დღე (Swimming & Recovery)',
    subtitle: 'კარდიო & ჰიდროთერაპია',
    duration: '60–75 წუთი',
    focus: 'მთელი სხეულის კარდიო, ხერხემლის განტვირთვა, საუნა',
    exercises: [
      '45 წუთი თავისუფალი სტილით/ბრასით ცურვა',
      'ინტერვალური აჩქარებები (4x50მ)',
      '15 წუთი მშვიდი ცურვა და გაწელვები წყალში',
      'საუნა / კონტრასტული შხაპი'
    ]
  },
  {
    id: 'sun',
    dayName: 'კვირა',
    dayShort: 'კვი',
    type: 'rest',
    title: 'სრული დასვენება',
    subtitle: 'Full Rest & Prep',
    duration: 'მთელი დღე',
    focus: 'მომავალი სამუშაო და სავარჯიშო კვირისთვის მომზადება',
    exercises: ['სრული დასვენება']
  }
];

interface WorkoutPageProps {
  onNavigate?: (tab: string) => void;
}

export const WorkoutPage: React.FC<WorkoutPageProps> = ({ onNavigate }) => {
  // Persistence for weekly completed days
  const [completedDays, setCompletedDays] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('flow_os_completed_workouts');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Save to local storage
  const toggleDayCompletion = (dayId: string) => {
    setCompletedDays((prev) => {
      const next = { ...prev, [dayId]: !prev[dayId] };
      localStorage.setItem('flow_os_completed_workouts', JSON.stringify(next));
      return next;
    });
  };

  // Reset current week's completion
  const resetWeek = () => {
    if (window.confirm('გსურთ მიმდინარე კვირის ვარჯიშების სტატუსის განულება?')) {
      setCompletedDays({});
      localStorage.removeItem('flow_os_completed_workouts');
    }
  };

  // Calculate active workout targets (Mon, Wed, Fri + Sat Pool = 4 sessions total)
  const activeWorkoutDays = DEFAULT_SCHEDULE.filter((d) => d.type !== 'rest');
  const completedCount = activeWorkoutDays.filter((d) => !!completedDays[d.id]).length;
  const progressPercent = Math.round((completedCount / activeWorkoutDays.length) * 100);

  // Sync workout days into real tasks with 20:00 reminders
  const handleSyncToTasks = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);

    try {
      // Find upcoming dates for Mon, Wed, Fri, Sat
      const now = new Date();
      const currentDayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon...

      const dayOffsetMap: Record<string, number> = {
        mon: 1,
        wed: 3,
        fri: 5,
        sat: 6
      };

      for (const day of activeWorkoutDays) {
        const targetDay = dayOffsetMap[day.id];
        if (targetDay !== undefined) {
          let diff = targetDay - currentDayOfWeek;
          if (diff < 0) diff += 7; // Next occurrence

          const targetDate = new Date(now);
          targetDate.setDate(now.getDate() + diff);
          const dateStr = targetDate.toISOString().split('T')[0];

          await api.createTask({
            title: day.isSaturdayPool ? '🏊‍♂️ აუზის დღე (Swimming Pool Session)' : `🏋️‍♂️ ${day.title}`,
            due_date: dateStr,
            due_time: '20:00',
            priority: 'High',
            description: `${day.subtitle} — ${day.focus}`,
            reminder_type: 'same_day',
            reminder_time: '20:00',
            stage: 'Workout'
          });
        }
      }

      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 4000);
    } catch (e) {
      console.error('Failed to sync workout tasks:', e);
      alert('ვარჯიშების ტასკებში დამატებისას დაფიქსირდა შეცდომა');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-emerald-950/40 border border-emerald-900/40 p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              <Dumbbell className="w-4 h-4" />
              <span>Personal Fitness & Activity Schedule</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-[10px] text-emerald-300">
                3 დარბაზი + 1 აუზი
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              ვარჯიშის განრიგი და აქტივობა
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 max-w-xl">
              კვირაში 3 დღე ძალოვანი ვარჯიში დარბაზში, ხოლო ყოველ <span className="text-cyan-400 font-semibold">შაბათს აუზის დღე</span>. შეტყობინებები ტელეგრამზე 20:00 საათზე.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 shrink-0">
            <div className="space-y-1">
              <div className="text-[11px] text-zinc-400 font-medium">კვირის პროგრესი</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {completedCount} <span className="text-zinc-600 text-sm font-normal">/ {activeWorkoutDays.length}</span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-full bg-zinc-900 border-2 border-emerald-500/40 flex items-center justify-center font-bold text-xs text-white">
              {progressPercent}%
            </div>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncToTasks}
              disabled={isSyncing}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm ${
                syncSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>მიმდინარეობს სინქრონიზაცია...</span>
                </>
              ) : syncSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>ტასკებში დამატებულია! (20:00 შეხსენება)</span>
                </>
              ) : (
                <>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>ამ კვირის გრაფიკის დამატება Tasks-ში 📅</span>
                </>
              )}
            </button>

            <button
              onClick={resetWeek}
              className="px-3 py-2 bg-zinc-900/60 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-xl text-xs transition-colors"
            >
              განულება
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Bell className="w-3.5 h-3.5 text-blue-400" />
            <span>Telegram შეხსენების დრო: <strong className="text-zinc-200 font-mono">20:00</strong></span>
          </div>
        </div>
      </div>

      {/* 2. Spotlight: Saturday Pool Day (შაბათის აუზის დღე) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-cyan-950/30 to-blue-950/40 border border-cyan-800/40 p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-sm">
              <Waves className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 text-[10px] font-bold uppercase tracking-wider border border-cyan-700/50">
                  ყოველ შაბათს
                </span>
                <span className="text-xs text-zinc-400 font-medium">სავალდებულო აღდგენა</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                შაბათი: აუზის დღე & ჰიდროთერაპია
              </h2>
              <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
                კვირის განმავლობაში დაგროვილი დაღლილობისა და ხერხემლის განტვირთვისთვის. 45–60 წთ ცურვა სახსრების სრული განტვირთვით + საუნა და ჰიდრომასაჟი.
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleDayCompletion('sat')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
              completedDays['sat']
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
            }`}
          >
            {completedDays['sat'] ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>შესრულებულია 🏊‍♂️</span>
              </>
            ) : (
              <>
                <Circle className="w-4 h-4 text-zinc-400" />
                <span>მონიშნე შესრულებულად</span>
              </>
            )}
          </button>
        </div>

        {/* Pool Day Routine Breakdown */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-cyan-900/40">
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-cyan-900/30 text-xs space-y-1">
            <span className="text-cyan-400 font-bold block text-[11px]">1. გახურება (10 წთ)</span>
            <span className="text-zinc-400">მსუბუქი ბრასი და წყალში შეგუება</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-cyan-900/30 text-xs space-y-1">
            <span className="text-cyan-400 font-bold block text-[11px]">2. კარდიო ცურვა (35 წთ)</span>
            <span className="text-zinc-400">თავისუფალი სტილი (Freestyle), 4x50მ აჩქარებები</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-cyan-900/30 text-xs space-y-1">
            <span className="text-cyan-400 font-bold block text-[11px]">3. განტვირთვა (15 წთ)</span>
            <span className="text-zinc-400">მშვიდი ცურვა, გაჭიმვები ხერხემლისთვის</span>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-cyan-900/30 text-xs space-y-1">
            <span className="text-cyan-400 font-bold block text-[11px]">4. საუნა & შხაპი (15 წთ)</span>
            <span className="text-zinc-400">ტოქსინების გამოდევნა და კუნთების მოდუნება</span>
          </div>
        </div>
      </div>

      {/* 3. 7-Day Weekly Grid View */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>კვირის სრული გრაფიკი</span>
          </h2>
          <span className="text-xs text-zinc-500">დააჭირეთ ბარათს სტატუსის შესაცვლელად</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {DEFAULT_SCHEDULE.map((day) => {
            const isCompleted = !!completedDays[day.id];
            const isRest = day.type === 'rest';
            const isPool = day.type === 'pool';

            return (
              <div
                key={day.id}
                onClick={() => !isRest && toggleDayCompletion(day.id)}
                className={`relative rounded-2xl p-4.5 border transition-all cursor-pointer group ${
                  isCompleted
                    ? 'bg-emerald-950/20 border-emerald-600/50 shadow-md shadow-emerald-950/20'
                    : isPool
                    ? 'bg-zinc-900/80 border-cyan-800/40 hover:border-cyan-600/60'
                    : isRest
                    ? 'bg-zinc-900/30 border-zinc-800/50 opacity-60 cursor-default'
                    : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850/80'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${
                        isPool
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : isRest
                          ? 'bg-zinc-800 text-zinc-400'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {day.dayName}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-medium">{day.duration}</span>
                  </div>

                  {!isRest && (
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        isCompleted ? 'text-emerald-400' : 'text-zinc-600 group-hover:text-zinc-400'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="space-y-1.5">
                  <h3
                    className={`font-bold text-sm tracking-tight ${
                      isCompleted ? 'line-through text-zinc-400' : 'text-white'
                    }`}
                  >
                    {day.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {day.focus}
                  </p>
                </div>

                {/* Exercises list if available */}
                {day.exercises && day.exercises.length > 0 && !isRest && (
                  <div className="mt-3.5 pt-3 border-t border-zinc-800/60 space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider block">
                      სავარჯიშოები:
                    </span>
                    <ul className="text-[11px] text-zinc-300 space-y-0.5">
                      {day.exercises.slice(0, 3).map((ex, i) => (
                        <li key={i} className="flex items-center gap-1.5 truncate">
                          <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                          <span className="truncate">{ex}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
