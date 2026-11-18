import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Waves,
  Calendar,
  CheckCircle2,
  Circle,
  Briefcase,
  Bell,
  RefreshCw,
  Check,
  Sparkles,
  Send,
  Zap,
  Flame,
  ArrowRight,
  ShieldCheck,
  Clock,
  Heart,
  Edit3,
  X as XIcon,
  RotateCcw
} from 'lucide-react';
import { api } from '../api';

interface WorkoutDay {
  id: string;
  dayName: string;
  dayShort: string;
  dayIndex: number; // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
  type: 'gym' | 'pool' | 'rest';
  title: string;
  subtitle: string;
  duration: string;
  exercises?: string[];
  focus: string;
  isSaturdayPool?: boolean;
  workNote?: string;
  targetMuscles?: string;
}

const DEFAULT_SCHEDULE: WorkoutDay[] = [
  {
    id: 'mon',
    dayName: 'ორშაბათი',
    dayShort: 'ორშ',
    dayIndex: 1,
    type: 'rest',
    title: 'სამუშაო დღე & დასვენება',
    subtitle: 'Recovery & Work Prep',
    duration: 'მთელი დღე',
    focus: 'სამუშაო კვირის სტარტი. ენერგიის დაზოგვა და მობილურობა',
    workNote: 'სამსახური (სრული განაკვეთი)',
    targetMuscles: 'სრული სხეულის რელაქსაცია',
    exercises: [
      'საღამოს მსუბუქი გასეირნება (30-40 წუთი)',
      'წყლის ოპტიმალური ბალანსი (2.5 - 3 ლიტრი)',
      'ხერხემლისა და კისრის მობილურობის გაჭიმვები',
      'მინიმუმ 8 საათი ხარისხიანი ძილი'
    ]
  },
  {
    id: 'tue',
    dayName: 'სამშაბათი',
    dayShort: 'სამ',
    dayIndex: 2,
    type: 'gym',
    title: 'დარბაზი #1: Push (მკერდი, მხრები, ტრიცეფსი)',
    subtitle: 'ძალოვანი ვარჯიში A',
    duration: '60 წუთი (20:00)',
    focus: 'ზედა ტანის ბიძგითი კუნთები, ჰანტელების პრესი, ბრუსები',
    workNote: 'სამსახურის შემდეგ (20:00 შეტყობინება)',
    targetMuscles: 'გულმკერდი · წინა/შუა დელტები · ტრიცეფსი · პრესი',
    exercises: [
      'შტანგის / ჰანტელების ჟიმი ჰორიზონტალურ სკამზე (4 სეტი x 8-10 გამეორება)',
      'დახრილ სკამზე ჰანტელების ჟიმი ზედა მკერდისთვის (3 სეტი x 10-12 გამეორება)',
      'ჰანტელების განზე აწევა მხრებისთვის / გვერდითი დელტა (4 სეტი x 12-15 გამეორება)',
      'ტრიცეფსი ბლოკზე თოკით ან ფრანგული ჟიმი (3 სეტი x 12 გამეორება)',
      'ფიცარი (Plank) და მუცლის პრესის აწევები (3 სეტი x 45-60 წამი)'
    ]
  },
  {
    id: 'wed',
    dayName: 'ოთხშაბათი',
    dayShort: 'ოთხ',
    dayIndex: 3,
    type: 'rest',
    title: 'სამუშაო დღე & აღდგენა',
    subtitle: 'Rest & Nutrient Synthesis',
    duration: 'მთელი დღე',
    focus: 'კუნთების აღდგენა Push ვარჯიშის შემდეგ',
    workNote: 'სამსახური (სრული განაკვეთი)',
    targetMuscles: 'კუნთოვანი ქსოვილის რეგენერაცია',
    exercises: [
      'კარგი ძილი და კუნთოვანი ქსოვილის აღდგენა',
      'ცილოვანი ბალანსის შენარჩუნება',
      'მხრებისა და მკერდის მსუბუქი გაჭიმვა',
      'კომპიუტერთან ჯდომის შემდეგ ზურგის გამართვა'
    ]
  },
  {
    id: 'thu',
    dayName: 'ხუთშაბათი',
    dayShort: 'ხუთ',
    dayIndex: 4,
    type: 'gym',
    title: 'დარბაზი #2: Pull (ზურგი, ბიცეფსი)',
    subtitle: 'ძალოვანი ვარჯიში B',
    duration: '60 წუთი (20:00)',
    focus: 'ზურგის სიგანე და სისქე, ტურნიკი, ბიცეფსის იზოლაცია',
    workNote: 'სამსახურის შემდეგ (20:00 შეტყობინება)',
    targetMuscles: 'ფართო ზურგი · ტრაპეცია · უკანა დელტა · ბიცეფსი',
    exercises: [
      'ტურნიკზე აზიდვები / ვერტიკალური ბლოკის ჩამოწევა (4 სეტი x 8-10 გამეორება)',
      'ჰანტელის წევა დახრილში ცალი ხელით (4 სეტი x 10 გამეორება თითო მხარე)',
      'ჰორიზონტალური ბლოკის წევა მუცელთან (3 სეტი x 12 გამეორება)',
      'ბიცეფსის აწევა შტანგით / ჰანტელებით (4 სეტი x 10-12 გამეორება)',
      'ჰიპერექსტენზია ზურგის ქვედა ნაწილისა და წელისთვის (3 სეტი x 15 გამეორება)'
    ]
  },
  {
    id: 'fri',
    dayName: 'პარასკევი',
    dayShort: 'პარ',
    dayIndex: 5,
    type: 'rest',
    title: 'სამსახური 17:00-მდე & განტვირთვა',
    subtitle: 'Early Finish & Weekend Transition',
    duration: 'საღამო თავისუფალი',
    focus: 'სამსახური სრულდება 5 საათზე. სრული განტვირთვა შაბათის აუზის წინ',
    workNote: 'სამსახური 17:00-მდე (შაბათ-კვირა დასვენება)',
    targetMuscles: 'ნერვული სისტემის განტვირთვა',
    exercises: [
      'სამუშაო კვირის პოზიტიურად დახურვა 17:00-ზე',
      'მშვიდი საღამო და მენტალური რელაქსაცია',
      'აუზის ინვენტარისა და ჩანთის მომზადება',
      'ადრე დაძინება შაბათის სრული ენერგიისთვის'
    ]
  },
  {
    id: 'sat',
    dayName: 'შაბათი',
    dayShort: 'შაბ',
    dayIndex: 6,
    type: 'pool',
    isSaturdayPool: true,
    title: '🏊‍♂️ აუზის დღე (Swimming & Hydrotherapy)',
    subtitle: 'ჰიდროთერაპია & სრული აღდგენა',
    duration: '60–75 წუთი (20:00)',
    focus: 'სრული კარდიო დატვირთვა, ხერხემლისა და სახსრების განტვირთვა, საუნა',
    workNote: 'დასვენების დღე (აუზი & სპა)',
    targetMuscles: 'გულ-სისხლძარღვთა სისტემა · ხერხემალი · სახსრები',
    exercises: [
      '1. გახურება (10 წთ): მშვიდი ბრასი და წყლის ტემპერატურასთან შეგუება',
      '2. კარდიო ცურვა (35 წთ): თავისუფალი სტილი (Freestyle), 4x50მ კონტროლირებადი აჩქარებები',
      '3. განტვირთვა (15 წთ): მშვიდი ზურგზე ცურვა, ხერხემლის სრული გაჭიმვა წყალში',
      '4. საუნა & სპა (15 წთ): ტოქსინების გამოდევნა, ჰიდრომასაჟი და კონტრასტული შხაპი'
    ]
  },
  {
    id: 'sun',
    dayName: 'კვირა',
    dayShort: 'კვი',
    dayIndex: 0,
    type: 'gym',
    title: 'დარბაზი #3: Legs & Core (ფეხები, პრესი)',
    subtitle: 'ძალოვანი ვარჯიში C',
    duration: '60 წუთი (20:00)',
    focus: 'ქვედა ტანი, კვადრიცეფსი, ბარძაყი, წვივები, პრესი',
    workNote: 'დასვენების დღე (20:00 შეტყობინება)',
    targetMuscles: 'კვადრიცეფსი · ბარძაყის ბიცეფსი · დუნდულები · წვივები · პრესი',
    exercises: [
      'ჩაჯდომები შტანგით / ლეგ პრესი (4 სეტი x 10 გამეორება)',
      'ფეხის გაშლა ტრენაჟორზე კვადრიცეფსისთვის (3 სეტი x 12 გამეორება)',
      'ფეხის მოხრა ტრენაჟორზე ბარძაყის უკანა ნაწილისთვის (3 სეტი x 12 გამეორება)',
      'წვივების აწევა დგომში (4 სეტი x 15 გამეორება)',
      'მუცლის პრესი ტურნიკზე ფეხების აწევით + როლერი (3 სეტი x 15 გამეორება)'
    ]
  }
];

interface WorkoutPageProps {
  onNavigate?: (tab: string) => void;
}

export const WorkoutPage: React.FC<WorkoutPageProps> = ({ onNavigate }) => {
  // Active user scope
  const activeUser = typeof window !== 'undefined' ? (localStorage.getItem('flow_os_active_user') || 'gigi') : 'gigi';
  const workoutStorageKey = activeUser === 'gigi' ? 'flow_os_completed_workouts' : `flow_os_completed_workouts_${activeUser}`;
  const scheduleStorageKey = activeUser === 'gigi' ? 'flow_os_workout_schedule' : `flow_os_workout_schedule_${activeUser}`;

  // Persistent workout schedule per user
  const [schedule, setSchedule] = useState<WorkoutDay[]>(() => {
    try {
      const saved = localStorage.getItem(scheduleStorageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading workout schedule:', e);
    }
    return DEFAULT_SCHEDULE;
  });

  useEffect(() => {
    localStorage.setItem(scheduleStorageKey, JSON.stringify(schedule));
  }, [schedule, activeUser, scheduleStorageKey]);

  // Current day index (0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat)
  const currentDayOfWeek = new Date().getDay();

  // Find today's workout day or default to Tuesday
  const todayScheduleItem = schedule.find((d) => d.dayIndex === currentDayOfWeek) || schedule[1];

  // Selected day for detailed breakdown below
  const [selectedDayId, setSelectedDayId] = useState<string>(todayScheduleItem.id);

  // Persistence for weekly completed days
  const [completedDays, setCompletedDays] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(workoutStorageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [isSendingTelegram, setIsSendingTelegram] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<string | null>(null);

  // Edit Day Modal State
  const [editingDay, setEditingDay] = useState<WorkoutDay | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    subtitle: string;
    type: 'gym' | 'pool' | 'rest';
    duration: string;
    focus: string;
    workNote: string;
    targetMuscles: string;
    exercisesText: string;
  }>({
    title: '',
    subtitle: '',
    type: 'gym',
    duration: '',
    focus: '',
    workNote: '',
    targetMuscles: '',
    exercisesText: ''
  });

  const openEditModal = (day: WorkoutDay, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingDay(day);
    setEditForm({
      title: day.title,
      subtitle: day.subtitle,
      type: day.type,
      duration: day.duration,
      focus: day.focus,
      workNote: day.workNote || '',
      targetMuscles: day.targetMuscles || '',
      exercisesText: (day.exercises || []).join('\n')
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDay) return;
    const exercises = editForm.exercisesText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const updatedDay: WorkoutDay = {
      ...editingDay,
      title: editForm.title.trim() || editingDay.title,
      subtitle: editForm.subtitle.trim() || editingDay.subtitle,
      type: editForm.type,
      duration: editForm.duration.trim() || editingDay.duration,
      focus: editForm.focus.trim() || editingDay.focus,
      workNote: editForm.workNote.trim() || editingDay.workNote,
      targetMuscles: editForm.targetMuscles.trim() || editingDay.targetMuscles,
      exercises
    };

    setSchedule((prev) => prev.map((d) => (d.id === updatedDay.id ? updatedDay : d)));
    setEditingDay(null);
  };

  const resetScheduleToDefault = () => {
    if (window.confirm('გსურთ ვარჯიშის განრიგის საწყის სტანდარტზე დაბრუნება?')) {
      setSchedule(DEFAULT_SCHEDULE);
      localStorage.removeItem(scheduleStorageKey);
    }
  };

  // Save to local storage
  const toggleDayCompletion = (dayId: string) => {
    setCompletedDays((prev) => {
      const next = { ...prev, [dayId]: !prev[dayId] };
      localStorage.setItem(workoutStorageKey, JSON.stringify(next));
      return next;
    });
  };

  // Reset current week's completion
  const resetWeek = () => {
    if (window.confirm('გსურთ მიმდინარე კვირის ვარჯიშების სტატუსის განულება?')) {
      setCompletedDays({});
      localStorage.removeItem(workoutStorageKey);
    }
  };

  // Active workout targets (Tue, Thu, Sun gym + Sat pool = 4 sessions total)
  const activeWorkoutDays = schedule.filter((d) => d.type !== 'rest');
  const completedCount = activeWorkoutDays.filter((d) => !!completedDays[d.id]).length;
  const progressPercent = Math.round((completedCount / activeWorkoutDays.length) * 100);

  // Selected day data
  const selectedDay = schedule.find((d) => d.id === selectedDayId) || schedule[1];

  // Sync workout days into real tasks with 20:00 reminders
  const handleSyncToTasks = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);

    try {
      const now = new Date();
      const currentDay = now.getDay();

      for (const day of activeWorkoutDays) {
        let diff = day.dayIndex - currentDay;
        if (diff < 0) diff += 7; // Next occurrence

        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + diff);
        const dateStr = targetDate.toISOString().split('T')[0];

        await api.createTask({
          title: day.isSaturdayPool ? '🏊‍♂️ აუზის დღე (Swimming Pool Session)' : `🏋️‍♂️ ${day.title}`,
          due_date: dateStr,
          due_time: '20:00',
          priority: 'High',
          description: `${day.subtitle} — ${day.focus} (${day.workNote})`,
          reminder_type: 'same_day',
          reminder_time: '20:00',
          stage: 'Workout'
        });
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

  // Send live test reminder via Telegram Bot API directly
  const handleSendTelegramTest = async () => {
    setIsSendingTelegram(true);
    setTelegramStatus(null);

    const botToken = '9109098723:AAGy5e6NzYclKL7ZaMYML9yfRBziKzJNvps';
    const chatId = '8635727434';

    const text = `🔔 *FLOW OS შეხსენება / WORKOUT REMINDER*

📌 *დღის აქტივობა:* ${selectedDay.title}
⏰ *დრო:* 20:00 (ყოველდღიური შეხსენება)
🎯 *სტატუსი:* ${completedDays[selectedDay.id] ? '✅ შესრულებულია' : '⏳ მომლოდინე'}

📝 *ფოკუსი:*
${selectedDay.focus} (${selectedDay.workNote})

💪 *მზადება:* წყლის ბალანსი, სპორტული ეკიპირება და მაქსიმალური ფოკუსი!`;

    try {
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'Markdown'
        })
      });

      const data = await res.json();
      if (data.ok) {
        setTelegramStatus('გამოგზავნილია! შეამოწმე ტელეგრამი 📲');
      } else {
        setTelegramStatus('შეცდომა გაგზავნისას');
      }
    } catch (err) {
      setTelegramStatus('კავშირის შეცდომა');
    } finally {
      setIsSendingTelegram(false);
      setTimeout(() => setTelegramStatus(null), 5000);
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. TOP HEADER & METRICS BAR (Matching Flow OS standard card design) */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-850 pb-4 sm:pb-5">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
              <Dumbbell className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  ვარჯიში & აუზი (Workout & Recovery OS)
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-700/60 text-[11px] font-semibold text-emerald-300">
                  3 დარბაზი + 1 აუზი
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-700/60 text-[11px] font-semibold text-cyan-300 flex items-center gap-1">
                  <Waves className="w-3 h-3" />
                  შაბათის ჰიდროთერაპია
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                გიგის პერსონალური გრაფიკი: <strong>სამშაბათი, ხუთშაბათი, კვირა</strong> (დარბაზი) · ყოველ <strong className="text-cyan-400">შაბათს აუზის დღე</strong> · Telegram შეტყობინებები ყოველდღე <strong>20:00 (8:00 PM)</strong>.
              </p>
            </div>
          </div>

          {/* Quick Metrics Widget */}
          <div className="flex items-center gap-3 sm:gap-4 bg-zinc-900/80 p-3 sm:p-3.5 rounded-xl border border-zinc-800 shrink-0">
            <div className="space-y-1">
              <div className="text-[11px] text-zinc-400 font-medium">კვირის პროგრესი</div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 flex items-center gap-1.5">
                <span>{completedCount}</span>
                <span className="text-zinc-600 text-xs font-normal">/ {activeWorkoutDays.length} სესია</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-full bg-zinc-950 border-2 border-emerald-500/40 flex items-center justify-center font-bold text-xs font-mono text-white shrink-0 shadow-inner">
              {progressPercent}%
            </div>
          </div>
        </div>

        {/* Action Buttons & Integration Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSyncToTasks}
              disabled={isSyncing}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm ${
                syncSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
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
                  <span>ტასკებში დამატებულია (20:00 შეხსენება) ✅</span>
                </>
              ) : (
                <>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>ამ კვირის გრაფიკის დამატება Tasks-ში 📅</span>
                </>
              )}
            </button>

            <button
              onClick={handleSendTelegramTest}
              disabled={isSendingTelegram}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-2 transition-all"
            >
              {isSendingTelegram ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>იგზავნება...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>შეხსენების ტესტი Telegram-ზე 📲</span>
                </>
              )}
            </button>

            <button
              onClick={resetWeek}
              className="px-3 py-2 bg-zinc-900/60 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-xl text-xs transition-colors"
            >
              კვირის განულება
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            {telegramStatus ? (
              <span className="text-emerald-400 font-semibold animate-pulse">{telegramStatus}</span>
            ) : (
              <div className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-blue-400" />
                <span>Telegram შეტყობინება: <strong className="text-zinc-200 font-mono">20:00 (8:00 PM)</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. 7-DAY WEEKLY SCHEDULE (Full 7-Column Responsive Grid) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
              კვირის სრული გრაფიკი (ორშაბათი – კვირა)
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={resetScheduleToDefault}
              className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
              title="ვარჯიშის განრიგის საწყისზე დაბრუნება"
            >
              <RotateCcw className="w-3 h-3" />
              <span>საწყისი განრიგი</span>
            </button>
            <span className="text-xs text-zinc-500">
              დააჭირეთ ✏️ რედაქტირებისთვის
            </span>
          </div>
        </div>

        {/* 7 Columns on Desktop: Every day has its own clean column! */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-3">
          {schedule.map((day) => {
            const isCompleted = !!completedDays[day.id];
            const isRest = day.type === 'rest';
            const isPool = day.type === 'pool';
            const isSelected = selectedDayId === day.id;
            const isToday = currentDayOfWeek === day.dayIndex;

            return (
              <div
                key={day.id}
                onClick={() => setSelectedDayId(day.id)}
                className={`relative rounded-2xl p-3.5 sm:p-4 border transition-all cursor-pointer flex flex-col justify-between select-none ${
                  isSelected
                    ? isPool
                      ? 'bg-cyan-950/30 border-cyan-500 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-950/40'
                      : isRest
                      ? 'bg-zinc-900 border-zinc-600 ring-2 ring-zinc-500/30'
                      : 'bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/40'
                    : isCompleted
                    ? 'bg-emerald-950/20 border-emerald-600/40 opacity-80 hover:opacity-100'
                    : isPool
                    ? 'bg-zinc-950 border-cyan-800/40 hover:border-cyan-600/70 hover:bg-zinc-900'
                    : isRest
                    ? 'bg-zinc-950/60 border-zinc-850 hover:border-zinc-750 opacity-75 hover:opacity-100'
                    : 'bg-zinc-950 border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900'
                }`}
              >
                <div>
                  {/* Card Header: Day pill + Checkbox */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          isPool
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : isRest
                            ? 'bg-zinc-800 text-zinc-400'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {day.dayName}
                      </span>
                      {isToday && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 animate-pulse">
                          დღეს
                        </span>
                      )}
                    </div>

                    {!isRest ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDayCompletion(day.id);
                        }}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'border border-zinc-700 text-transparent hover:border-emerald-500'
                        }`}
                        title={isCompleted ? 'მონიშნე მომლოდინედ' : 'მონიშნე შესრულებულად'}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    ) : (
                      <span className="text-zinc-600 text-[11px]">💤</span>
                    )}
                  </div>

                  {/* Work Schedule Indicator */}
                  {day.workNote && (
                    <div className="mb-2 flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-900/90 px-1.5 py-0.5 rounded border border-zinc-855 truncate">
                      <Briefcase className="w-2.5 h-2.5 text-zinc-500 shrink-0" />
                      <span className="truncate">{day.workNote}</span>
                    </div>
                  )}

                  {/* Card Title & Duration */}
                  <div className="space-y-1">
                    <h3
                      className={`font-bold text-xs sm:text-sm tracking-tight line-clamp-2 ${
                        isCompleted ? 'line-through text-zinc-500' : 'text-zinc-100'
                      }`}
                    >
                      {day.title}
                    </h3>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {day.focus}
                    </p>
                  </div>
                </div>

                {/* Footer Time & Badge */}
                <div className="mt-3 pt-2.5 border-t border-zinc-850/80 flex items-center justify-between text-[10px]">
                  <span className="text-zinc-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    {day.duration}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => openEditModal(day, e)}
                      className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                      title="ამ დღის პროგრამის რედაქტირება"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    {isPool ? (
                      <span className="text-cyan-400 font-bold flex items-center gap-1">
                        <Waves className="w-3 h-3" />
                        აუზი
                      </span>
                    ) : !isRest ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Dumbbell className="w-3 h-3" />
                        დარბაზი
                      </span>
                    ) : (
                      <span className="text-zinc-500">დასვენება</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. LOWER SECTION: 2-COLUMN DETAIL DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left 2 Columns: Selected Day's Workout Routine & Exercises */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-850 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl border shrink-0 ${
                  selectedDay.type === 'pool'
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                    : selectedDay.type === 'rest'
                    ? 'bg-zinc-800/50 border-zinc-700 text-zinc-400'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}
              >
                {selectedDay.type === 'pool' ? (
                  <Waves className="w-6 h-6" />
                ) : selectedDay.type === 'rest' ? (
                  <Sparkles className="w-6 h-6" />
                ) : (
                  <Dumbbell className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-zinc-850 text-zinc-300">
                    {selectedDay.dayName}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    {selectedDay.duration}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
                  {selectedDay.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openEditModal(selectedDay)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-750 flex items-center gap-1.5 transition-colors"
                title="ამ დღის პროგრამის რედაქტირება"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>რედაქტირება</span>
              </button>

              {selectedDay.type !== 'rest' && (
                <button
                  type="button"
                  onClick={() => toggleDayCompletion(selectedDay.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                    completedDays[selectedDay.id]
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                      : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-750'
                  }`}
                >
                  {completedDays[selectedDay.id] ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>შესრულებულია ✅</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4 text-zinc-400" />
                      <span>მონიშნე შესრულებულად</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Target Focus & Muscles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                სამიზნე კუნთები / ეფექტი:
              </span>
              <span className="text-zinc-200 font-medium">
                {selectedDay.targetMuscles || selectedDay.focus}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                სამუშაო გრაფიკთან თავსებადობა:
              </span>
              <span className="text-zinc-200 font-medium">
                {selectedDay.workNote} · Telegram 20:00 შეტყობინება
              </span>
            </div>
          </div>

          {/* Exercise Program Breakdown */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <span>სრული სავარჯიშო გეგმა & ეტაპები</span>
            </h4>
            <div className="space-y-2">
              {selectedDay.exercises?.map((exercise, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-850 transition-colors flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="text-xs text-zinc-200 leading-relaxed font-medium">
                    {exercise}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Saturday Pool Spotlight & Telegram Bot Info */}
        <div className="space-y-4">
          {/* Spotlight: Saturday Pool Day Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-950 via-cyan-950/30 to-blue-950/40 border border-cyan-800/40 p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                  <Waves className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  შაბათის აუზის დღე
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700/60 text-cyan-300">
                სავალდებულო
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white tracking-tight">
                ჰიდროთერაპია & სრული აღდგენა
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                სამუშაო კვირის შემდეგ ხერხემლისა და სახსრების განტვირთვა. 45-60 წთ ცურვა (სისხლის მიმოქცევა) + საუნა & ჰიდრომასაჟი.
              </p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-cyan-900/40 text-xs">
              <div className="flex items-center justify-between text-zinc-300">
                <span>1. გახურება ბრასით</span>
                <span className="text-cyan-400 font-mono">10 წთ</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span>2. კარდიო Freestyle</span>
                <span className="text-cyan-400 font-mono">35 წთ</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span>3. ხერხემლის განტვირთვა</span>
                <span className="text-cyan-400 font-mono">15 წთ</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span>4. საუნა & კონტრასტული შხაპი</span>
                <span className="text-cyan-400 font-mono">15 წთ</span>
              </div>
            </div>

            <button
              onClick={() => toggleDayCompletion('sat')}
              className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all mt-2 ${
                completedDays['sat']
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                  : 'bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-200 border border-cyan-700/60'
              }`}
            >
              {completedDays['sat'] ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>აუზი შესრულებულია 🏊‍♂️</span>
                </>
              ) : (
                <>
                  <Waves className="w-4 h-4" />
                  <span>მონიშნე აუზი შესრულებულად</span>
                </>
              )}
            </button>
          </div>

          {/* Telegram Notification Bot Card */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Telegram Notifications</h4>
                  <span className="text-[10px] text-zinc-400">Bot: @Hejssj_bot</span>
                </div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="Active" />
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              შეტყობინება იგზავნება ყოველდღიურად <strong>20:00 (8:00 PM)</strong> პირდაპირ პირად ჩატში.
            </p>

            <button
              onClick={handleSendTelegramTest}
              disabled={isSendingTelegram}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-blue-400" />
              <span>გაგზავნე შეხსენება ახლა 📲</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. EDIT WORKOUT DAY MODAL */}
      {editingDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingDay.dayName} – ვარჯიშის რედაქტირება
                  </h3>
                  <span className="text-[11px] text-zinc-400">
                    ინდივიდუალური განრიგი ({activeUser === 'ani' ? 'ანი' : 'გიგი'})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingDay(null)}
                className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-300">
                  სათაური / ვარჯიშის დასახელება:
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="მაგ. დარბაზი #1: Push ან პილატესი & იოგა"
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-300">
                    ტიპი:
                  </label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value as any })}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="gym">🏋️‍♂️ დარბაზი / ფიტნესი</option>
                    <option value="pool">🏊‍♂️ აუზი & ჰიდროთერაპია</option>
                    <option value="rest">💤 დასვენება & აღდგენა</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-300">
                    დრო / ხანგრძლივობა:
                  </label>
                  <input
                    type="text"
                    value={editForm.duration}
                    onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                    placeholder="მაგ. 60 წუთი (20:00)"
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-300">
                  ქვესათაური / სტილი:
                </label>
                <input
                  type="text"
                  value={editForm.subtitle}
                  onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                  placeholder="მაგ. ძალოვანი ვარჯიში A / კარდიო & ტონუსი"
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-300">
                  ფოკუსი / მოკლე აღწერა:
                </label>
                <input
                  type="text"
                  value={editForm.focus}
                  onChange={(e) => setEditForm({ ...editForm, focus: e.target.value })}
                  placeholder="მაგ. ზედა ტანის ბიძგითი კუნთები, ჰანტელების პრესი"
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-300">
                    სამიზნე კუნთები:
                  </label>
                  <input
                    type="text"
                    value={editForm.targetMuscles}
                    onChange={(e) => setEditForm({ ...editForm, targetMuscles: e.target.value })}
                    placeholder="მაგ. მკერდი, მხრები, პრესი"
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-300">
                    სამუშაო შენიშვნა:
                  </label>
                  <input
                    type="text"
                    value={editForm.workNote}
                    onChange={(e) => setEditForm({ ...editForm, workNote: e.target.value })}
                    placeholder="მაგ. სამსახურის შემდეგ (20:00)"
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-zinc-300">
                    სავარჯიშოების სია (თითო ხაზზე თითო სავარჯიშო):
                  </label>
                  <span className="text-[10px] text-zinc-500">ხაზ-ხაზად</span>
                </div>
                <textarea
                  rows={5}
                  value={editForm.exercisesText}
                  onChange={(e) => setEditForm({ ...editForm, exercisesText: e.target.value })}
                  placeholder="ჩაჯდომები შტანგით (4 x 10)&#10;ჰანტელების ჟიმი (3 x 12)&#10;ფიცარი / Plank (3 x 45 წმ)"
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => setEditingDay(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-850 text-zinc-300"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/50 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>შენახვა</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
