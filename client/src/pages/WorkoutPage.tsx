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
  RotateCcw,
  Moon,
  Trophy,
  History,
  Plus,
  Trash2
} from 'lucide-react';
import { api } from '../api';

export interface WorkoutDay {
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

export interface WorkoutSessionLog {
  id: string;
  date: string; // YYYY-MM-DD
  dayName: string; // სამშაბათი, ხუთშაბათი, etc.
  title: string; // დარბაზი #1: Push, აუზის დღე, etc.
  type: 'gym' | 'pool';
  durationMin: number; // 60, 75
  timestamp: number;
  note?: string;
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
    focus: 'სამუშაო კვირის სტარტი · მობილურობა',
    workNote: 'სამსახური (სრული)',
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
    title: 'დარბაზი: Push (მკერდი, მხრები)',
    subtitle: 'ძალოვანი ვარჯიში A',
    duration: '20:00 (60წთ)',
    focus: 'ზედა ტანის ბიძგითი კუნთები, ჰანტელები',
    workNote: 'სამსახურის შემდეგ',
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
    workNote: 'სამსახური (სრული)',
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
    title: 'დარბაზი: Pull (ზურგი, ბიცეფსი)',
    subtitle: 'ძალოვანი ვარჯიში B',
    duration: '20:00 (60წთ)',
    focus: 'ზურგის სიგანე და სისქე, ტურნიკი',
    workNote: 'სამსახურის შემდეგ',
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
    subtitle: 'Early Finish & Transition',
    duration: 'საღამო თავისუფალი',
    focus: 'სამსახური 5 საათზე სრულდება · რელაქსაცია',
    workNote: '17:00-მდე',
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
    title: '🏊‍♂️ აუზის დღე (Swimming)',
    subtitle: 'ჰიდროთერაპია & საუნა',
    duration: '20:00 (60-75წთ)',
    focus: 'სრული კარდიო დატვირთვა · საუნა & სპა',
    workNote: 'დასვენება (შაბათ-კვირა)',
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
    title: 'დარბაზი: Legs & Core (ფეხები)',
    subtitle: 'ძალოვანი ვარჯიში C',
    duration: '20:00 (60წთ)',
    focus: 'ქვედა ტანი, კვადრიცეფსი, პრესი',
    workNote: 'დასვენება (შაბათ-კვირა)',
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
  const startDateStorageKey = activeUser === 'gigi' ? 'flow_os_workout_start_date' : `flow_os_workout_start_date_${activeUser}`;
  const sessionLogsStorageKey = activeUser === 'gigi' ? 'flow_os_workout_session_logs' : `flow_os_workout_session_logs_${activeUser}`;

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

  // Start Date of Gym Journey (starts from today as requested)
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState<string>(() => {
    const saved = localStorage.getItem(startDateStorageKey);
    // If empty or was old default Oct 1, start fresh from today
    if (!saved || saved === '2026-10-01') {
      const today = getTodayStr();
      localStorage.setItem(startDateStorageKey, today);
      return today;
    }
    return saved;
  });

  // Persistent Session Logs
  const [sessionLogs, setSessionLogs] = useState<WorkoutSessionLog[]>(() => {
    try {
      const saved = localStorage.getItem(sessionLogsStorageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(startDateStorageKey, startDate);
  }, [startDate, startDateStorageKey]);

  useEffect(() => {
    localStorage.setItem(sessionLogsStorageKey, JSON.stringify(sessionLogs));
  }, [sessionLogs, sessionLogsStorageKey]);

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

  // Add Manual Session Modal State
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [addSessionForm, setAddSessionForm] = useState<{
    date: string;
    type: 'gym' | 'pool';
    title: string;
    durationMin: number;
    note: string;
  }>({
    date: getTodayStr(),
    type: 'gym',
    title: 'დარბაზი: ძალოვანი ვარჯიში',
    durationMin: 60,
    note: ''
  });

  // Calculations: Journey Duration & Elapsed Time starting from today
  const startDateTime = new Date(startDate).getTime();
  const currentDateTime = new Date().getTime();
  const elapsedDays = Math.max(1, Math.floor((currentDateTime - startDateTime) / (1000 * 60 * 60 * 24)) + 1);
  const elapsedWeeks = Math.floor((elapsedDays - 1) / 7);

  const formatDisplayDate = (dStr: string) => {
    try {
      const parts = dStr.split('-');
      if (parts.length === 3) {
        const months = ['იან', 'თებ', 'მარ', 'აპრ', 'მაი', 'ივნ', 'ივლ', 'აგვ', 'სექ', 'ოქტ', 'ნოე', 'დეკ'];
        const mIdx = parseInt(parts[1], 10) - 1;
        return `${parseInt(parts[2], 10)} ${months[mIdx] || parts[1]} ${parts[0]}`;
      }
    } catch {}
    return dStr;
  };

  // Calculations: Sessions Breakdown (counted from actual sessions)
  const loggedGymCount = sessionLogs.filter((s) => s.type === 'gym').length;
  const loggedPoolCount = sessionLogs.filter((s) => s.type === 'pool').length;
  const totalSessionsCount = sessionLogs.length;

  // Training volume (hours) & Pace
  const totalLoggedMinutes = sessionLogs.reduce((acc, s) => acc + (s.durationMin || 60), 0);
  const totalTrainedHours = (totalLoggedMinutes / 60).toFixed(1);
  const avgSessionsPerWeek = elapsedWeeks > 0 ? (totalSessionsCount / elapsedWeeks).toFixed(1) : String(totalSessionsCount);

  // Helper to get this week's date for a workout day
  const getDayDateThisWeek = (dayIndex: number): string => {
    const now = new Date();
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday);

    const offset = dayIndex === 0 ? 6 : dayIndex - 1;
    const target = new Date(monday);
    target.setDate(monday.getDate() + offset);
    return target.toISOString().split('T')[0];
  };

  const formatWorkNote = (note?: string) => {
    if (!note) return null;
    if (note.includes('17:00')) return '17:00-მდე';
    if (note.includes('სამსახურის შემდეგ')) return 'სამსახურის შემდეგ';
    if (note.includes('დასვენების დღე')) return 'დასვენება';
    if (note.includes('სრული განაკვეთი') || note.includes('სამსახური')) return 'სამსახური';
    return note.replace(/\(.*?\)/g, '').trim();
  };

  const formatDuration = (d?: string) => {
    if (!d) return '';
    const timeMatch = d.match(/\((\d{1,2}:\d{2})\)/);
    const minMatch = d.match(/(\d+(?:[–-]\d+)?\s*წუთი)/);
    if (timeMatch && minMatch) {
      return `${timeMatch[1]} (${minMatch[1].replace(' წუთი', 'წთ')})`;
    }
    if (timeMatch) return timeMatch[1];
    if (d.includes('საღამო თავისუფალი')) return 'საღამო თავის.';
    return d;
  };

  const getDurationDetails = (d?: string) => {
    if (!d) return { time: '20:00', durationBadge: '60წთ' };
    const timeMatch = d.match(/\((\d{1,2}:\d{2})\)/);
    const minMatch = d.match(/(\d+(?:[–-]\d+)?\s*წუთი)/);

    const time = timeMatch ? timeMatch[1] : d.match(/\d{1,2}:\d{2}/) ? d.match(/\d{1,2}:\d{2}/)![0] : '20:00';
    const durationBadge = minMatch ? minMatch[1].replace(/\s*წუთი/, 'წთ') : '60წთ';

    return { time, durationBadge };
  };

  const formatCleanTitle = (title: string) => {
    if (!title) return '';
    return title
      .replace(/^დარბაზი\s*#\d+:\s*/i, 'დარბაზი: ')
      .replace(/\s*\(Swimming & Hydrotherapy\)/i, '')
      .replace(/🏊‍♂️\s*/g, '')
      .trim();
  };

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

  // Toggle Day Completion & Automatically Log / Unlog Session
  const toggleDayCompletion = (dayId: string) => {
    const targetDay = schedule.find((d) => d.id === dayId);
    const willBeCompleted = !completedDays[dayId];

    setCompletedDays((prev) => {
      const next = { ...prev, [dayId]: willBeCompleted };
      localStorage.setItem(workoutStorageKey, JSON.stringify(next));
      return next;
    });

    if (targetDay && targetDay.type !== 'rest') {
      const dayDate = getDayDateThisWeek(targetDay.dayIndex);
      if (willBeCompleted) {
        // Auto-create persistent session log
        setSessionLogs((prev) => {
          const exists = prev.some((s) => s.date === dayDate && s.dayName === targetDay.dayName);
          if (exists) return prev;
          const newLog: WorkoutSessionLog = {
            id: `auto_${targetDay.id}_${dayDate}_${Date.now()}`,
            date: dayDate,
            dayName: targetDay.dayName,
            title: targetDay.title,
            type: targetDay.type === 'pool' ? 'pool' : 'gym',
            durationMin: targetDay.type === 'pool' ? 70 : 60,
            timestamp: Date.now(),
            note: targetDay.subtitle
          };
          return [newLog, ...prev];
        });
      } else {
        // Unlog corresponding session
        setSessionLogs((prev) => prev.filter((s) => !(s.date === dayDate && s.dayName === targetDay.dayName)));
      }
    }
  };

  // Delete a logged session
  const handleDeleteSessionLog = (logId: string) => {
    if (window.confirm('გსურთ ამ სესიის ჩანაწერის წაშლა ჟურნალიდან?')) {
      setSessionLogs((prev) => prev.filter((s) => s.id !== logId));
    }
  };

  // Handle Save Manual Session
  const handleSaveManualSession = (e: React.FormEvent) => {
    e.preventDefault();
    const dayNames = ['კვირა', 'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი'];
    const parts = addSessionForm.date.split('-');
    let dayName = 'სესია';
    if (parts.length === 3) {
      const dt = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      dayName = dayNames[dt.getDay()] || 'სესია';
    }

    const newLog: WorkoutSessionLog = {
      id: `manual_${Date.now()}`,
      date: addSessionForm.date,
      dayName: dayName,
      title: addSessionForm.title.trim() || (addSessionForm.type === 'pool' ? '🏊‍♂️ აუზის სესია' : '🏋️‍♂️ დარბაზის სესია'),
      type: addSessionForm.type,
      durationMin: Number(addSessionForm.durationMin) || 60,
      timestamp: Date.now(),
      note: addSessionForm.note.trim() || undefined
    };

    setSessionLogs((prev) => [newLog, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
    setIsAddSessionOpen(false);
  };

  // Reset current week's completion
  const resetWeek = () => {
    if (window.confirm('გსურთ მიმდინარე კვირის ვარჯიშების სტატუსის განულება? (ჩატარებული სესიების ისტორია შენარჩუნდება)')) {
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

    const text = `🔔 *FLOW OS შეხსენება / WORKOUT REMINDER*\n\n📌 *დღის აქტივობა:* ${selectedDay.title}\n⏰ *დრო:* 20:00 (ყოველდღიური შეხსენება)\n🎯 *სტატუსი:* ${completedDays[selectedDay.id] ? '✅ შესრულებულია' : '⏳ მომლოდინე'}\n\n📝 *ფოკუსი:*\n${selectedDay.focus} (${selectedDay.workNote})\n\n💪 *მზადება:* წყლის ბალანსი, სპორტული ეკიპირება და მაქსიმალური ფოკუსი!`;

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
      {/* 1. CLEAN TOP HEADER: ICON + TITLE + BADGES (NO LONG DESCRIPTIVE TEXT OR SETTINGS BUTTON) */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-850 pb-3 sm:pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
              <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                ვარჯიში
              </h1>
            </div>
          </div>
        </div>

        {/* 2. FOUR CORE STATS CARDS: JOURNEY DURATION (STARTING TODAY), SESSIONS, WEEKLY GOAL, TRAINING HOURS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Journey Duration (სტაჟი – დაწყებული დღეიდან) */}
          <div className="bg-zinc-900/80 border border-zinc-850 rounded-xl p-3 sm:p-3.5 space-y-1 sm:space-y-1.5 hover:border-amber-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>სტაჟი</span>
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400 tracking-tight">
                {elapsedDays}
              </span>
              <span className="text-xs font-medium text-zinc-400">დღე</span>
              <span className="text-[11px] sm:text-xs font-mono text-zinc-500">
                ({elapsedWeeks === 0 ? '1-ლი კვ.' : `${elapsedWeeks} კვ.`})
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 truncate flex items-center gap-1 pt-0.5">
              <span className="text-zinc-500">სტარტი:</span>
              <span className="font-semibold text-zinc-300 font-mono">
                {startDate === getTodayStr() ? 'დღეს' : formatDisplayDate(startDate)}
              </span>
            </div>
          </div>

          {/* Card 2: Total Sessions Count (სულ ჩატარებული სესიები) */}
          <div className="bg-zinc-900/80 border border-zinc-850 rounded-xl p-3 sm:p-3.5 space-y-1 sm:space-y-1.5 hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                <span>სესიები</span>
              </span>
              <button
                onClick={() => setIsAddSessionOpen(true)}
                className="text-[10px] text-zinc-500 hover:text-emerald-300 transition-colors flex items-center gap-0.5"
                title="სესიის ხელით დამატება"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 tracking-tight">
                {totalSessionsCount}
              </span>
              <span className="text-xs font-medium text-zinc-400">სესია</span>
            </div>
            <div className="text-[10px] text-zinc-400 truncate flex items-center gap-1 pt-0.5">
              <span className="text-emerald-400 font-medium">🏋️ {loggedGymCount} <span className="hidden sm:inline">დარბაზი</span></span>
              <span className="text-zinc-600">·</span>
              <span className="text-cyan-400 font-medium">🏊 {loggedPoolCount} <span className="hidden sm:inline">აუზი</span></span>
            </div>
          </div>

          {/* Card 3: Current Week Progress (მიმდინარე კვირის გეგმა) */}
          <div className="bg-zinc-900/80 border border-zinc-850 rounded-xl p-3 sm:p-3.5 space-y-1 sm:space-y-1.5 hover:border-orange-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>ამ კვირაში</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-orange-400">
                {progressPercent}%
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold font-mono text-orange-400 tracking-tight">
                {completedCount}
              </span>
              <span className="text-xs font-medium text-zinc-400">/ {activeWorkoutDays.length} სესია</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, progressPercent)}%` }}
              />
            </div>
          </div>

          {/* Card 4: Accumulated Hours & Pace (საერთო დრო & ტემპი) */}
          <div className="bg-zinc-900/80 border border-zinc-850 rounded-xl p-3 sm:p-3.5 space-y-1 sm:space-y-1.5 hover:border-cyan-500/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>საერთო დრო</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {totalSessionsCount > 0 ? `~${avgSessionsPerWeek}/კვ.` : 'სტარტი'}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-400 tracking-tight">
                {totalTrainedHours}
              </span>
              <span className="text-xs font-medium text-zinc-400">სთ</span>
            </div>
            <div className="text-[10px] text-zinc-400 truncate pt-0.5">
              {totalSessionsCount === 0 ? (
                <span className="text-zinc-500">სტარტი 🚀</span>
              ) : (
                <><span className="hidden sm:inline">რიტმი: </span><strong className="text-zinc-200 font-mono">{avgSessionsPerWeek}</strong>/კვირაში</>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons & Integration Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleSyncToTasks}
              disabled={isSyncing}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                syncSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>სინქრონიზაცია...</span>
                </>
              ) : syncSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>დამატებულია</span>
                </>
              ) : (
                <>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>ტასკებში დამატება</span>
                </>
              )}
            </button>

            <button
              onClick={handleSendTelegramTest}
              disabled={isSendingTelegram}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center gap-1.5 transition-all"
            >
              {isSendingTelegram ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>იგზავნება...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram ტესტი</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsAddSessionOpen(true)}
              className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>სესიის დამატება</span>
            </button>

            <button
              onClick={resetWeek}
              className="px-3 py-2 bg-zinc-900/60 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-xl text-xs transition-colors flex items-center justify-center"
            >
              განულება
            </button>
          </div>

          {telegramStatus && (
            <div className="text-xs px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center gap-1.5 animate-in fade-in self-start sm:self-auto">
              <Bell className="w-3 h-3 text-blue-400 shrink-0" />
              <span>{telegramStatus}</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. WEEKLY SCHEDULE GRID (Monday to Sunday) */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-850 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              კვირის განრიგი
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetScheduleToDefault}
              className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-900"
              title="განრიგის საწყის სტანდარტზე დაბრუნება"
            >
              <RotateCcw className="w-3 h-3 text-zinc-500" />
              <span>საწყისი განრიგი</span>
            </button>
          </div>
        </div>

        {/* 7 Columns on Desktop / Swipeable Ribbon on Mobile */}
        <div className="flex sm:grid overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 scrollbar-none snap-x sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2.5">
          {schedule.map((day) => {
            const isCompleted = !!completedDays[day.id];
            const isRest = day.type === 'rest';
            const isPool = day.type === 'pool';
            const isSelected = selectedDayId === day.id;
            const isToday = currentDayOfWeek === day.dayIndex;
            const shortWorkNote = formatWorkNote(day.workNote);
            const cleanDuration = formatDuration(day.duration);
            const cleanTitle = formatCleanTitle(day.title);

            return (
              <div
                key={day.id}
                onClick={() => setSelectedDayId(day.id)}
                className={`group relative rounded-2xl p-3 border transition-all duration-200 cursor-pointer flex flex-col justify-between select-none min-h-[175px] sm:min-h-[185px] min-w-[150px] sm:min-w-0 flex-1 shrink-0 snap-start ${
                  isSelected
                    ? isPool
                      ? 'bg-cyan-950/40 border-cyan-500 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-950/50'
                      : isRest
                      ? 'bg-zinc-900/90 border-zinc-600 ring-2 ring-zinc-500/40 shadow-lg shadow-black/60'
                      : 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/50'
                    : isToday
                    ? 'bg-zinc-950 border-amber-500/60 ring-1 ring-amber-500/30 hover:border-amber-400'
                    : isCompleted
                    ? 'bg-emerald-950/15 border-emerald-800/40 opacity-85 hover:opacity-100 hover:border-emerald-600/60'
                    : isPool
                    ? 'bg-zinc-950/90 border-zinc-850 hover:border-cyan-500/60 hover:bg-cyan-950/20'
                    : isRest
                    ? 'bg-zinc-950/60 border-zinc-850/80 hover:border-zinc-700 hover:bg-zinc-900/40'
                    : 'bg-zinc-950/90 border-zinc-850 hover:border-emerald-500/60 hover:bg-emerald-950/20'
                }`}
              >
                {/* Top Section */}
                <div className="space-y-2">
                  {/* Card Header: Day Name + Status + Edit */}
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider font-mono shrink-0 ${
                          isPool
                            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                            : isRest
                            ? 'bg-zinc-800/80 text-zinc-400 border border-zinc-750'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {day.dayName}
                      </span>
                      {isToday && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 shrink-0 animate-pulse">
                          დღეს
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => openEditModal(day, e)}
                        className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors opacity-70 group-hover:opacity-100"
                        title="ამ დღის რედაქტირება"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>

                      {!isRest ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDayCompletion(day.id);
                          }}
                          className={`w-4.5 h-4.5 rounded-md flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'border border-zinc-700 hover:border-emerald-500 text-transparent'
                          }`}
                          title={isCompleted ? 'მონიშნე მომლოდინედ' : 'მონიშნე შესრულებულად (ჩაიწერება ჟურნალში)'}
                        >
                          <Check className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      ) : (
                        <span className="text-zinc-600 text-xs px-0.5">💤</span>
                      )}
                    </div>
                  </div>

                  {/* Work Schedule Badge */}
                  {shortWorkNote && (
                    <div
                      title={day.workNote}
                      className="inline-flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-900/90 px-1.5 py-0.5 rounded-md border border-zinc-800 max-w-full font-medium"
                    >
                      <Briefcase className="w-2.5 h-2.5 text-zinc-500 shrink-0" />
                      <span className="truncate">{shortWorkNote}</span>
                    </div>
                  )}

                  {/* Card Title & Focus */}
                  <div className="space-y-0.5 pt-0.5">
                    <h3
                      className={`font-bold text-xs sm:text-[13px] tracking-tight line-clamp-2 leading-snug transition-colors ${
                        isCompleted
                          ? 'line-through text-zinc-500'
                          : isSelected
                          ? 'text-white'
                          : 'text-zinc-100 group-hover:text-white'
                      }`}
                    >
                      {cleanTitle}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {day.focus}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Clean Time on Left, Duration / Category Pill on Right */}
                <div className="mt-3 pt-2 border-t border-zinc-850/80 flex items-center justify-between text-[10px]">
                  {isRest ? (
                    <>
                      <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
                        <Moon className="w-3 h-3 text-zinc-500 shrink-0" />
                        <span>დასვენება</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                        {day.duration?.includes('საღამო') ? 'საღამო' : 'მთელი დღე'}
                      </span>
                    </>
                  ) : (
                    <>
                      {(() => {
                        const { time, durationBadge } = getDurationDetails(day.duration);
                        return (
                          <>
                            <div className="flex items-center gap-1 text-zinc-300 font-mono">
                              <Clock className="w-3 h-3 text-zinc-500 shrink-0" />
                              <span>{time}</span>
                            </div>

                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 shrink-0 ${
                                isPool
                                  ? 'text-cyan-300 bg-cyan-950/80 border border-cyan-800/60'
                                  : 'text-emerald-300 bg-emerald-950/80 border border-emerald-800/60'
                              }`}
                              title={day.duration}
                            >
                              {isPool ? (
                                <>
                                  <Waves className="w-2.5 h-2.5" />
                                  <span>{durationBadge}</span>
                                </>
                              ) : (
                                <>
                                  <Dumbbell className="w-2.5 h-2.5" />
                                  <span>{durationBadge}</span>
                                </>
                              )}
                            </span>
                          </>
                        );
                      })()}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. DETAIL VIEW: SELECTED DAY PROGRAM & QUICK INFO */}
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

          {/* Target Muscles & Schedule Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-1">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                სამიზნე კუნთები / ფოკუსი:
              </span>
              <p className="text-zinc-200 font-medium">
                {selectedDay.targetMuscles || selectedDay.focus}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 space-y-1">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                სამუშაო გრაფიკი & რეჟიმი:
              </span>
              <p className="text-zinc-200 font-medium">
                {selectedDay.workNote} · {selectedDay.duration}
              </p>
            </div>
          </div>

          {/* Exercise List */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>დღის სავარჯიშო გეგმა & ინსტრუქცია:</span>
            </h4>

            <div className="space-y-2">
              {(selectedDay.exercises || []).map((exercise, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-900/40 border border-zinc-850/80 text-xs text-zinc-200 hover:border-zinc-750 transition-colors"
                >
                  <span className="w-5 h-5 rounded-lg bg-zinc-800 text-zinc-400 flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{exercise}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Hydrotherapy & Telegram Info */}
        <div className="space-y-4 sm:space-y-6">
          {/* Hydrotherapy Card */}
          <div className="bg-gradient-to-br from-cyan-950/40 to-zinc-950 border border-cyan-800/40 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5 text-cyan-400">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <Waves className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">
                შაბათის აუზის პროგრამა
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white tracking-tight">
                ჰიდროთერაპია & აღდგენა
              </h4>
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

            <button
              onClick={handleSendTelegramTest}
              disabled={isSendingTelegram}
              className="w-full py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-blue-400" />
              <span>შეტყობინების ტესტი</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. SESSION HISTORY & JOURNAL */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  ჩატარებული სესიების ჟურნალი
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono font-semibold text-zinc-300">
                  {sessionLogs.length} სესია
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddSessionOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>სესიის დამატება</span>
            </button>
          </div>
        </div>

        {sessionLogs.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30 space-y-2">
            <Trophy className="w-8 h-8 text-zinc-600 mx-auto" />
            <h4 className="text-sm font-semibold text-zinc-300">
              ჯერჯერობით სესიების ისტორია ცარიელია
            </h4>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              ათვლა დაიწყო დღეიდან. მონიშნეთ განრიგში დასრულებული დღე (✅) ან დააჭირეთ „სესიის დამატება“ ღილაკს.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sessionLogs.map((log) => {
              const isPool = log.type === 'pool';
              return (
                <div
                  key={log.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                    isPool
                      ? 'bg-cyan-950/20 border-cyan-800/40 hover:border-cyan-700/60'
                      : 'bg-zinc-900/60 border-zinc-800/80 hover:border-emerald-600/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isPool
                          ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
                          : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      }`}
                    >
                      {isPool ? <Waves className="w-4 h-4" /> : <Dumbbell className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-zinc-300">
                          {formatDisplayDate(log.date)}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          ({log.dayName})
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate">
                        {log.title}
                      </h4>
                      {log.note && (
                        <p className="text-[10px] text-zinc-400 truncate">
                          {log.note}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-lg border border-zinc-800">
                      {log.durationMin}წთ
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteSessionLog(log.id)}
                      className="p-1 rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="სესიის წაშლა"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. EDIT WORKOUT DAY MODAL */}
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
                  placeholder="ჩაჯდომები შტანგით (4 x 10)\nჰანტელების ჟიმი (3 x 12)\nფიცარი / Plank (3 x 45 წმ)"
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

      {/* 7. MANUAL ADD SESSION MODAL */}
      {isAddSessionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    სესიის ხელით დამატება
                  </h3>
                  <span className="text-[11px] text-zinc-400">
                    ჩაწერე წარსული ან დამატებითი ვარჯიში ჟურნალში
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddSessionOpen(false)}
                className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualSession} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-300">
                    თარიღი:
                  </label>
                  <input
                    type="date"
                    required
                    value={addSessionForm.date}
                    onChange={(e) => setAddSessionForm({ ...addSessionForm, date: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-300">
                    ტიპი:
                  </label>
                  <select
                    value={addSessionForm.type}
                    onChange={(e) => {
                      const t = e.target.value as 'gym' | 'pool';
                      setAddSessionForm({
                        ...addSessionForm,
                        type: t,
                        title: t === 'pool' ? '🏊‍♂️ აუზის სესია' : '🏋️‍♂️ დარბაზის სესია',
                        durationMin: t === 'pool' ? 70 : 60
                      });
                    }}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="gym">🏋️‍♂️ დარბაზი</option>
                    <option value="pool">🏊‍♂️ აუზი</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-300">
                  ვარჯიშის დასახელება:
                </label>
                <input
                  type="text"
                  required
                  value={addSessionForm.title}
                  onChange={(e) => setAddSessionForm({ ...addSessionForm, title: e.target.value })}
                  placeholder="მაგ. დარბაზი #1: Push ან ინდივიდუალური კარდიო"
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-300">
                    ხანგრძლივობა (წთ):
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={addSessionForm.durationMin}
                    onChange={(e) => setAddSessionForm({ ...addSessionForm, durationMin: parseInt(e.target.value, 10) || 60 })}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-300">
                    შენიშვნა / ფოკუსი:
                  </label>
                  <input
                    type="text"
                    value={addSessionForm.note}
                    onChange={(e) => setAddSessionForm({ ...addSessionForm, note: e.target.value })}
                    placeholder="მაგ. მკერდი და ტრიცეფსი"
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => setIsAddSessionOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-850 text-zinc-300"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/50 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>დამატება</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
