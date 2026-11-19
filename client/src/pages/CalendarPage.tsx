import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Goal, Project, Task, NoteItem, SectionType } from '../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Target,
  Video,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Filter,
  Layers,
  Sparkles,
  ExternalLink,
  Plus,
  Search,
  CalendarDays,
  ListOrdered,
  CalendarRange,
  Zap,
  Tag,
  Check,
  Megaphone,
  Briefcase,
  GraduationCap,
  StickyNote,
  Dumbbell,
  Waves,
  Trash2,
  Heart,
  X as XIcon
} from 'lucide-react';
import { CalendarSkeleton } from '../components/common/SkeletonLoader';

interface CalendarPageProps {
  onOpenProject: (projectId: string) => void;
  onOpenGoal?: (goalId: string) => void;
  onOpenNote?: (noteId: string) => void;
  activeUser?: string;
}

interface RoutineItem {
  dayIndex: number;
  type: 'gym' | 'pool' | 'rest';
  title: string;
  subtitle: string;
  focus: string;
  targetMuscles?: string;
  exercises?: string[];
}

const DEFAULT_ROUTINES: RoutineItem[] = [
  {
    dayIndex: 1, // Mon
    type: 'rest',
    title: 'სამუშაო დღე & დასვენება',
    subtitle: 'Recovery & Work Prep',
    focus: 'სამუშაო კვირის სტარტი. ენერგიის დაზოგვა და მობილურობა',
    exercises: [
      'საღამოს მსუბუქი გასეირნება (30-40 წუთი)',
      'წყლის ოპტიმალური ბალანსი (2.5 - 3 ლიტრი)',
      'ხერხემლისა და კისრის მობილურობის გაჭიმვები',
      'მინიმუმ 8 საათი ხარისხიანი ძილი'
    ]
  },
  {
    dayIndex: 2, // Tue
    type: 'gym',
    title: 'დარბაზი: Push (მკერდი, მხრები)',
    subtitle: 'ძალოვანი ვარჯიში A',
    focus: 'ზედა ტანის ბიძგითი კუნთები, ჰანტელები',
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
    dayIndex: 3, // Wed
    type: 'rest',
    title: 'სამუშაო დღე & აღდგენა',
    subtitle: 'Rest & Nutrient Synthesis',
    focus: 'კუნთების აღდგენა Push ვარჯიშის შემდეგ',
    exercises: [
      'კარგი ძილი და კუნთოვანი ქსოვილის აღდგენა',
      'ცილოვანი ბალანსის შენარჩუნება',
      'მხრებისა და მკერდის მსუბუქი გაჭიმვა',
      'კომპიუტერთან ჯდომის შემდეგ ზურგის გამართვა'
    ]
  },
  {
    dayIndex: 4, // Thu
    type: 'gym',
    title: 'დარბაზი: Pull (ზურგი, ბიცეფსი)',
    subtitle: 'ძალოვანი ვარჯიში B',
    focus: 'ზურგის სიგანე და სისქე, ტურნიკი',
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
    dayIndex: 5, // Fri
    type: 'rest',
    title: 'სამსახური 17:00-მდე & განტვირთვა',
    subtitle: 'Early Finish & Transition',
    focus: 'სამსახური 5 საათზე სრულდება · რელაქსაცია',
    exercises: [
      'სამუშაო კვირის პოზიტიურად დახურვა 17:00-ზე',
      'მშვიდი საღამო და მენტალური რელაქსაცია',
      'აუზის ინვენტარისა და ჩანთის მომზადება',
      'ადრე დაძინება შაბათის სრული ენერგიისთვის'
    ]
  },
  {
    dayIndex: 6, // Sat
    type: 'pool',
    title: '🏊‍♂️ აუზის დღე (Swimming)',
    subtitle: 'ჰიდროთერაპია & საუნა',
    focus: 'სრული კარდიო დატვირთვა · საუნა & სპა',
    exercises: [
      '1. გახურება (10 წთ): მშვიდი ბრასი და წყლის ტემპერატურასთან შეგუება',
      '2. კარდიო ცურვა (35 წთ): თავისუფალი სტილი (Freestyle), 4x50მ კონტროლირებადი აჩქარებები',
      '3. განტვირთვა (15 წთ): მშვიდი ზურგზე ცურვა, ხერხემლის სრული გაჭიმვა წყალში',
      '4. საუნა & სპა (15 წთ): ტოქსინების გამოდევნა, ჰიდრომასაჟი და კონტრასტული შხაპი'
    ]
  },
  {
    dayIndex: 0, // Sun
    type: 'gym',
    title: 'დარბაზი: Legs & Core (ფეხები)',
    subtitle: 'ძალოვანი ვარჯიში C',
    focus: 'ქვედა ტანი, კვადრიცეფსი, პრესი',
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

const geoDayNames: Record<number, string> = {
  0: 'კვირა',
  1: 'ორშაბათი',
  2: 'სამშაბათი',
  3: 'ოთხშაბათი',
  4: 'ხუთშაბათი',
  5: 'პარასკევი',
  6: 'შაბათი'
};

const geoMonthNames: Record<number, string> = {
  0: 'იანვარი',
  1: 'თებერვალი',
  2: 'მარტი',
  3: 'აპრილი',
  4: 'მაისი',
  5: 'ივნისი',
  6: 'ივლისი',
  7: 'აგვისტო',
  8: 'სექტემბერი',
  9: 'ოქტომბერი',
  10: 'ნოემბერი',
  11: 'დეკემბერი'
};

export const CalendarPage: React.FC<CalendarPageProps> = ({ onOpenProject, onOpenGoal, onOpenNote, activeUser = 'gigi' }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('month');

  // Modals for Day View
  const [showAddWorkoutModal, setShowAddWorkoutModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  
  // Workout form state
  const [workoutPreset, setWorkoutPreset] = useState<'push' | 'pull' | 'legs' | 'pool' | 'custom'>('push');
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [workoutTime, setWorkoutTime] = useState('20:00');
  const [workoutDescription, setWorkoutDescription] = useState('');

  // Task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [newTaskStage, setNewTaskStage] = useState('General');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  // Filters
  const [showGoals, setShowGoals] = useState(true);
  const [showProjects, setShowProjects] = useState(true);
  const [showTasks, setShowTasks] = useState(true);
  const [showNotes, setShowNotes] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [g, p, t, n] = await Promise.all([api.getGoals(), api.getProjects(), api.getTasks(), api.getNotes()]);
      setGoals(g || []);
      setProjects(p || []);
      setTasks(t || []);
      setNotes(n || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleToggleTask = async (task: Task, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updatedStatus = !task.completed;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: updatedStatus } : t)));
    await api.updateTask(task.id, { completed: updatedStatus });
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday

  // Days in previous month for leading days
  const prevMonthDays = new Date(year, month, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  const handlePrevDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const prev = new Date(y, m - 1, d - 1);
    const yStr = prev.getFullYear();
    const mStr = String(prev.getMonth() + 1).padStart(2, '0');
    const dStr = String(prev.getDate()).padStart(2, '0');
    setSelectedDate(`${yStr}-${mStr}-${dStr}`);
  };

  const handleNextDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const next = new Date(y, m - 1, d + 1);
    const yStr = next.getFullYear();
    const mStr = String(next.getMonth() + 1).padStart(2, '0');
    const dStr = String(next.getDate()).padStart(2, '0');
    setSelectedDate(`${yStr}-${mStr}-${dStr}`);
  };

  const getGeorgianDateTitle = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const dayOfWeek = dateObj.getDay();
      return `${geoDayNames[dayOfWeek]}, ${d} ${geoMonthNames[m - 1]}, ${y}`;
    } catch (e) {
      return dateStr;
    }
  };

  const getDayRoutine = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dayIdx = new Date(y, m - 1, d).getDay();
      const currentActiveUser = activeUser || (typeof window !== 'undefined' ? localStorage.getItem('flow_os_active_user') || 'gigi' : 'gigi');
      const key = currentActiveUser === 'ani' ? 'flow_os_workout_schedule_ani' : 'flow_os_workout_schedule';
      const saved = localStorage.getItem(key);
      const schedule: RoutineItem[] = saved ? JSON.parse(saved) : DEFAULT_ROUTINES;
      return schedule.find((s) => s.dayIndex === dayIdx) || null;
    } catch (e) {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dayIdx = new Date(y, m - 1, d).getDay();
      return DEFAULT_ROUTINES.find((s) => s.dayIndex === dayIdx) || null;
    }
  };

  const handleOpenWorkoutModal = (preset?: 'push' | 'pull' | 'legs' | 'pool' | 'custom') => {
    const selected = preset || 'push';
    setWorkoutPreset(selected);
    if (selected === 'push') {
      setWorkoutTitle('დარბაზი: Push (მკერდი, მხრები, ტრიცეფსი)');
      setWorkoutTime('20:00');
      setWorkoutDescription(
        '• შტანგის / ჰანტელების ჟიმი ჰორიზონტალურ სკამზე (4x8-10)\n• დახრილ სკამზე ჰანტელების ჟიმი (3x10-12)\n• ჰანტელების განზე აწევა მხრებისთვის (4x12-15)\n• ტრიცეფსი ბლოკზე თოკით (3x12)\n• მუცლის პრესი და პლანკა (3x45-60 წმ)'
      );
    } else if (selected === 'pull') {
      setWorkoutTitle('დარბაზი: Pull (ზურგი, ბიცეფსი)');
      setWorkoutTime('20:00');
      setWorkoutDescription(
        '• ტურნიკზე აზიდვები / ვერტიკალური ბლოკი (4x8-10)\n• ჰანტელის წევა დახრილში (4x10)\n• ჰორიზონტალური ბლოკის წევა (3x12)\n• ბიცეფსის აწევა შტანგით / ჰანტელებით (4x10-12)\n• ჰიპერექსტენზია წელისთვის (3x15)'
      );
    } else if (selected === 'legs') {
      setWorkoutTitle('დარბაზი: Legs & Core (ფეხები, პრესი)');
      setWorkoutTime('20:00');
      setWorkoutDescription(
        '• ჩაჯდომები შტანგით / Leg Press (4x10)\n• ფეხის გაშლა ტრენაჟორზე (3x12)\n• ფეხის მოხრა ტრენაჟორზე (3x12)\n• წვივები დგომში (4x15)\n• მუცლის პრესის აწევები ტურნიკზე (3x15)'
      );
    } else if (selected === 'pool') {
      setWorkoutTitle('🏊‍♂️ აუზის დღე: Swimming & Hydrotherapy');
      setWorkoutTime('18:00');
      setWorkoutDescription(
        '• 10 წთ გახურება და მშვიდი ბრასი\n• 35 წთ კარდიო ცურვა (4x50მ აჩქარებები)\n• 15 წთ ზურგზე ცურვა და ხერხემლის გაჭიმვა\n• 15 წთ საუნა, ჰიდრომასაჟი და კონტრასტული შხაპი'
      );
    } else {
      setWorkoutTitle('ვარჯიში: ');
      setWorkoutTime('20:00');
      setWorkoutDescription('');
    }
    setShowAddWorkoutModal(true);
  };

  const handleAddRoutineToDay = async (routine: RoutineItem) => {
    const isPool = routine.type === 'pool';
    const newTask: Partial<Task> = {
      title: routine.title,
      stage: isPool ? 'Pool' : 'Workout',
      due_date: selectedDate,
      due_time: '20:00',
      priority: 'High',
      description: routine.exercises?.join('\n') || '',
      completed: false,
      order_index: tasks.length
    };
    try {
      const created = await api.createTask(newTask);
      if (created) {
        setTasks((prev) => [...prev, created]);
      }
    } catch (e) {
      console.error('Failed to add workout task:', e);
    }
  };

  const handleSaveWorkout = async () => {
    if (!workoutTitle.trim()) return;
    const isPool =
      workoutPreset === 'pool' ||
      workoutTitle.toLowerCase().includes('pool') ||
      workoutTitle.toLowerCase().includes('აუზი');
    const newTask: Partial<Task> = {
      title: workoutTitle.trim(),
      stage: isPool ? 'Pool' : 'Workout',
      due_date: selectedDate,
      due_time: workoutTime || undefined,
      priority: 'High',
      description: workoutDescription.trim() || undefined,
      completed: false,
      order_index: tasks.length
    };
    try {
      const created = await api.createTask(newTask);
      if (created) {
        setTasks((prev) => [...prev, created]);
      }
      setShowAddWorkoutModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveTask = async () => {
    if (!newTaskTitle.trim()) return;
    const newTask: Partial<Task> = {
      title: newTaskTitle.trim(),
      due_date: selectedDate,
      due_time: newTaskTime.trim() || undefined,
      priority: newTaskPriority,
      stage: newTaskStage || 'General',
      description: newTaskDescription.trim() || undefined,
      completed: false,
      order_index: tasks.length
    };
    try {
      const created = await api.createTask(newTask);
      if (created) {
        setTasks((prev) => [...prev, created]);
      }
      setShowAddTaskModal(false);
      setNewTaskTitle('');
      setNewTaskTime('');
      setNewTaskDescription('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await api.deleteTask(taskId);
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to determine project badge style & icon based on category/section
  const getProjectBadge = (p: Project) => {
    const sec = p.section || 'video_editing';
    const sub = (p.sub_section || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    const name = p.name.toLowerCase();

    if (sec === 'video_editing') {
      return {
        icon: Layers,
        label: 'Core Project',
        style: 'bg-blue-950/90 border-blue-600/80 text-blue-300 hover:bg-blue-900 shadow-blue-950/40'
      };
    }
    if (sec === 'marketing') {
      if (sub === 'instagram' || name.includes('insta') || desc.includes('reel')) {
        return {
          icon: Megaphone,
          label: 'Instagram Reel',
          style: 'bg-pink-950/90 border-pink-600/80 text-pink-300 hover:bg-pink-900 shadow-pink-950/40'
        };
      }
      if (sub === 'tiktok' || name.includes('tiktok') || desc.includes('tiktok')) {
        return {
          icon: Megaphone,
          label: 'TikTok Content',
          style: 'bg-cyan-950/90 border-cyan-600/80 text-cyan-300 hover:bg-cyan-900 shadow-cyan-950/40'
        };
      }
      if (sub === 'youtube' || name.includes('youtube') || name.includes('yt')) {
        return {
          icon: Video,
          label: 'YouTube Video',
          style: 'bg-red-950/90 border-red-600/80 text-red-300 hover:bg-red-900 shadow-red-950/40'
        };
      }
      return {
        icon: Megaphone,
        label: 'Marketing & Social',
        style: 'bg-emerald-950/90 border-emerald-600/80 text-emerald-300 hover:bg-emerald-900 shadow-emerald-950/40'
      };
    }
    if (sec === 'freelance') {
      return {
        icon: Briefcase,
        label: 'Client Project',
        style: 'bg-purple-950/90 border-purple-600/80 text-purple-300 hover:bg-purple-900 shadow-purple-950/40'
      };
    }
    if (sec === 'skills') {
      return {
        icon: GraduationCap,
        label: 'Skills Mastery',
        style: 'bg-amber-950/90 border-amber-600/80 text-amber-300 hover:bg-amber-900 shadow-amber-950/40'
      };
    }
    return {
      icon: Layers,
      label: 'Project',
      style: 'bg-blue-950/90 border-blue-600/80 text-blue-300 hover:bg-blue-900 shadow-blue-950/40'
    };
  };

  // Helper for Workout / Pool task categorization
  const getTaskType = (t: Task) => {
    const titleLower = (t.title || '').toLowerCase();
    const stageLower = (t.stage || '').toLowerCase();
    const descLower = (t.description || '').toLowerCase();
    
    if (
      titleLower.includes('აუზი') ||
      titleLower.includes('pool') ||
      titleLower.includes('swimming') ||
      stageLower.includes('pool')
    ) {
      return 'pool';
    }
    if (
      t.stage === 'Workout' ||
      titleLower.includes('დარბაზი') ||
      titleLower.includes('ვარჯიში') ||
      titleLower.includes('push') ||
      titleLower.includes('pull') ||
      titleLower.includes('legs') ||
      descLower.includes('დარბაზი')
    ) {
      return 'workout';
    }
    return 'default';
  };

  // Helper for Task Badge color on Calendar (Changes color when completed and stays!)
  const getTaskCalendarBadge = (t: Task) => {
    const taskType = getTaskType(t);

    if (t.completed) {
      return {
        style: taskType === 'pool'
          ? 'bg-cyan-950/90 hover:bg-cyan-900 border-cyan-500/80 text-cyan-400 shadow-sm shadow-cyan-950/50'
          : 'bg-emerald-950/90 hover:bg-emerald-900 border-emerald-500/80 text-emerald-400 shadow-sm shadow-emerald-950/50',
        title: `✅ [Completed] ${t.title} (Click to reopen)`,
        iconColor: taskType === 'pool' ? 'text-cyan-400' : 'text-emerald-400',
        taskType
      };
    }

    if (taskType === 'pool') {
      return {
        style: 'bg-cyan-950/90 hover:bg-cyan-900 border-cyan-500/80 text-cyan-300 shadow-sm shadow-cyan-950/50 ring-1 ring-cyan-500/30',
        title: `🏊‍♂️ [აუზის დღე / Pool] ${t.title} ${t.due_time ? `@ ${t.due_time}` : ''} (Click to complete)`,
        iconColor: 'text-cyan-400',
        taskType: 'pool'
      };
    }

    if (taskType === 'workout') {
      return {
        style: 'bg-emerald-950/90 hover:bg-emerald-900 border-emerald-500/80 text-emerald-300 shadow-sm shadow-emerald-950/50 ring-1 ring-emerald-500/30',
        title: `🏋️‍♂️ [დარბაზი / Workout] ${t.title} ${t.due_time ? `@ ${t.due_time}` : ''} (Click to complete)`,
        iconColor: 'text-emerald-400',
        taskType: 'workout'
      };
    }

    if (t.priority === 'High') {
      return {
        style: 'bg-rose-950/90 hover:bg-rose-900 border-rose-500/80 text-rose-300 shadow-sm shadow-rose-950/50',
        title: `⚡ [High Priority Task] ${t.title} ${t.due_time ? `@ ${t.due_time}` : ''} (Click to complete)`,
        iconColor: 'text-rose-400',
        taskType: 'default'
      };
    }
    if (t.priority === 'Low') {
      return {
        style: 'bg-zinc-850 hover:bg-zinc-800 border-zinc-700/80 text-zinc-300 shadow-sm',
        title: `⚡ [Low Priority Task] ${t.title} (Click to complete)`,
        iconColor: 'text-zinc-400',
        taskType: 'default'
      };
    }
    return {
      style: 'bg-blue-950/90 hover:bg-blue-900 border-blue-500/80 text-blue-300 shadow-sm shadow-blue-950/50',
      title: `⚡ [Task] ${t.title} ${t.due_time ? `@ ${t.due_time}` : ''} (Click to complete)`,
      iconColor: 'text-blue-400',
      taskType: 'default'
    };
  };

  // Construct continuous calendar grid with previous and next month trailing days
  interface CalendarCell {
    dateStr: string;
    dayNum: number;
    isCurrentMonth: boolean;
  }

  const calendarCells: CalendarCell[] = [];

  // 1. Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const prevDate = new Date(year, month - 1, d);
    const yStr = prevDate.getFullYear();
    const mStr = String(prevDate.getMonth() + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    calendarCells.push({
      dateStr: `${yStr}-${mStr}-${dStr}`,
      dayNum: d,
      isCurrentMonth: false
    });
  }

  // 2. Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      dateStr: dStr,
      dayNum: d,
      isCurrentMonth: true
    });
  }

  // 3. Next month trailing days to complete 35 or 42 grid cells
  const remaining = (7 - (calendarCells.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const nextDate = new Date(year, month + 1, d);
    const yStr = nextDate.getFullYear();
    const mStr = String(nextDate.getMonth() + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    calendarCells.push({
      dateStr: `${yStr}-${mStr}-${dStr}`,
      dayNum: d,
      isCurrentMonth: false
    });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper filter by section & search
  const matchFilter = (item: { section?: string; name?: string; title?: string }) => {
    if (selectedSection !== 'all' && item.section && item.section !== selectedSection) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const text = `${item.title || item.name || ''}`.toLowerCase();
      return text.includes(q);
    }
    return true;
  };

  // Helper to extract note calendar date (custom date or created_at fallback)
  const getNoteDate = (n: NoteItem): string => {
    if (n.date && typeof n.date === 'string' && n.date.trim() !== '' && n.date !== 'null') {
      return n.date.trim().split('T')[0];
    }
    if (n.created_at && typeof n.created_at === 'string' && n.created_at !== 'null') {
      return n.created_at.split('T')[0];
    }
    return '';
  };

  // Selected date events
  const selectedGoals = showGoals ? goals.filter((g) => g.target_date === selectedDate && matchFilter(g)) : [];
  const selectedProjects = showProjects ? projects.filter((p) => p.deadline === selectedDate && matchFilter(p)) : [];
  const selectedTasks = showTasks ? tasks.filter((t) => t.due_date === selectedDate && matchFilter(t)) : [];
  const selectedNotes = showNotes ? notes.filter((n) => getNoteDate(n) === selectedDate && matchFilter(n)) : [];

  // All upcoming deadlines for Agenda view
  const allDeadlines: Array<{
    id: string;
    type: 'Goal' | 'Project' | 'Task' | 'Note';
    title: string;
    date: string;
    isOverdue: boolean;
    section?: string;
    priority?: string;
    raw: any;
  }> = [];

  if (showGoals) {
    goals.filter((g) => g.target_date && matchFilter(g)).forEach((g) => {
      allDeadlines.push({
        id: g.id,
        type: 'Goal',
        title: g.title,
        date: g.target_date!,
        isOverdue: g.target_date! < todayStr,
        section: g.section,
        priority: g.priority,
        raw: g
      });
    });
  }

  if (showProjects) {
    projects.filter((p) => p.deadline && matchFilter(p)).forEach((p) => {
      allDeadlines.push({
        id: p.id,
        type: 'Project',
        title: p.name,
        date: p.deadline!,
        isOverdue: p.deadline! < todayStr && p.status !== 'Ready' && p.status !== 'Posted' && p.status !== 'Completed',
        section: p.section,
        priority: p.priority,
        raw: p
      });
    });
  }

  if (showTasks) {
    tasks.filter((t) => t.due_date && matchFilter(t)).forEach((t) => {
      allDeadlines.push({
        id: t.id,
        type: 'Task',
        title: t.title,
        date: t.due_date!,
        isOverdue: !t.completed && t.due_date! < todayStr,
        raw: t
      });
    });
  }

  if (showNotes) {
    notes.filter((n) => getNoteDate(n) && matchFilter(n)).forEach((n) => {
      allDeadlines.push({
        id: n.id,
        type: 'Note',
        title: n.title,
        date: getNoteDate(n),
        isOverdue: false,
        raw: n
      });
    });
  }

  allDeadlines.sort((a, b) => a.date.localeCompare(b.date));

  // Formatted date string for selected day header
  const getFormattedSelectedDate = () => {
    try {
      const parts = selectedDate.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return selectedDate;
    }
  };

  // Week View: Get current week (Mon-Sun) around selected date
  const getWeekDays = () => {
    const curr = new Date(selectedDate);
    const day = curr.getDay(); // 0 is Sun
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(curr.setDate(diff));

    const week: string[] = [];
    for (let i = 0; i < 7; i++) {
      const next = new Date(monday);
      next.setDate(monday.getDate() + i);
      const y = next.getFullYear();
      const m = String(next.getMonth() + 1).padStart(2, '0');
      const d = String(next.getDate()).padStart(2, '0');
      week.push(`${y}-${m}-${d}`);
    }
    return week;
  };

  const weekDays = getWeekDays();

  // Nearest 3 upcoming items if selected date is empty
  const nearestUpcoming = allDeadlines.filter((item) => item.date >= todayStr).slice(0, 3);

  if (loading) {
    return <CalendarSkeleton />;
  }

  return (
    <div className="p-2.5 sm:p-6 space-y-3.5 sm:space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. TOP HEADER & MAIN CONTROLS */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-6 shadow-sm space-y-3.5 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <span className="p-2 sm:p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/80 text-purple-400 shadow-inner shrink-0">
              <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-zinc-100 tracking-tight">კალენდარი</h1>
            </div>
          </div>

          {/* Month Navigation & View Modes */}
          <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2.5 flex-wrap">
            <button
              onClick={handleToday}
              className="px-2.5 sm:px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-750 hover:border-zinc-600 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-1 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs">Today</span>
            </button>

            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 sm:p-1 shadow-inner">
              <button
                onClick={handlePrevMonth}
                className="p-1 sm:p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <span className="px-2 sm:px-3 text-xs font-bold text-zinc-100 min-w-[100px] sm:min-w-[140px] text-center font-sans tracking-wide">
                {monthNames[month]} {year}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 sm:p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 sm:p-1 shadow-inner">
              <button
                onClick={() => setViewMode('month')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs rounded-lg font-semibold transition-all flex items-center gap-1 ${
                  viewMode === 'month'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <CalendarDays className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Month</span>
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs rounded-lg font-semibold transition-all flex items-center gap-1 ${
                  viewMode === 'week'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <CalendarRange className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Week</span>
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs rounded-lg font-semibold transition-all flex items-center gap-1 ${
                  viewMode === 'day'
                    ? 'bg-blue-600 text-white shadow-sm font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-300" />
                <span>Day</span>
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs rounded-lg font-semibold transition-all flex items-center gap-1 ${
                  viewMode === 'agenda'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ListOrdered className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>List</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. FILTER & COLOR LEGEND TOOLBAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-zinc-850">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-zinc-500 font-semibold text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center gap-1 mr-0.5 shrink-0">
              <Filter className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-400" /> Filter:
            </span>

            {/* Toggle Goals */}
            <button
              onClick={() => setShowGoals(!showGoals)}
              className={`px-2 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all border shrink-0 ${
                showGoals
                  ? 'bg-purple-950/80 border-purple-700/80 text-purple-300 shadow-sm'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400" />
              <span>Goals ({goals.filter((g) => g.target_date).length})</span>
            </button>

            {/* Toggle Projects */}
            <button
              onClick={() => setShowProjects(!showProjects)}
              className={`px-2 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all border shrink-0 ${
                showProjects
                  ? 'bg-blue-950/80 border-blue-700/80 text-blue-300 shadow-sm'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Video className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400" />
              <span>Projects ({projects.filter((p) => p.deadline).length})</span>
            </button>

            {/* Toggle Tasks */}
            <button
              onClick={() => setShowTasks(!showTasks)}
              className={`px-2 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all border shrink-0 ${
                showTasks
                  ? 'bg-emerald-950/80 border-emerald-700/80 text-emerald-300 shadow-sm'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
              <span>Tasks ({tasks.filter((t) => t.due_date).length})</span>
            </button>

            {/* Toggle Notes */}
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`px-2 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all border shrink-0 ${
                showNotes
                  ? 'bg-amber-950/80 border-amber-600/80 text-amber-300 shadow-sm'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <StickyNote className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
              <span>Notes ({notes.filter((n) => Boolean(getNoteDate(n))).length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Category Filter */}
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl text-[11px] sm:text-xs outline-none focus:border-zinc-600 font-medium"
            >
              <option value="all">All Categories</option>
              <option value="video_editing">Core Projects</option>
              <option value="marketing">Marketing & Growth</option>
              <option value="skills">Skills & Learning</option>
              <option value="freelance">Clients & CRM</option>
            </select>

            {/* Quick Search */}
            <div className="relative min-w-[140px] flex-1 sm:max-w-xs">
              <Search className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-7 sm:pl-8 pr-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-xl text-[11px] sm:text-xs text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-zinc-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. MONTH GRID VIEW (FULL WIDTH DESKTOP CALENDAR) */}
      {viewMode === 'month' && (
        <div className="w-full">
          {/* Main Month Calendar Grid (Full Width) */}
          <div className="w-full bg-zinc-950 border border-zinc-850 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 space-y-2 sm:space-y-3 shadow-sm">
            {/* Weekday Header Columns */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs font-bold text-zinc-400 pb-1.5 sm:pb-2 border-b border-zinc-850">
              <span className="text-zinc-500"><span className="sm:hidden">S</span><span className="hidden sm:inline">Sun</span></span>
              <span><span className="sm:hidden">M</span><span className="hidden sm:inline">Mon</span></span>
              <span><span className="sm:hidden">T</span><span className="hidden sm:inline">Tue</span></span>
              <span><span className="sm:hidden">W</span><span className="hidden sm:inline">Wed</span></span>
              <span><span className="sm:hidden">T</span><span className="hidden sm:inline">Thu</span></span>
              <span><span className="sm:hidden">F</span><span className="hidden sm:inline">Fri</span></span>
              <span className="text-zinc-500"><span className="sm:hidden">S</span><span className="hidden sm:inline">Sat</span></span>
            </div>

            {/* Days Grid Cells */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {calendarCells.map((cell) => {
                const { dateStr, dayNum, isCurrentMonth } = cell;
                const dayGoals = showGoals ? goals.filter((g) => g.target_date === dateStr && matchFilter(g)) : [];
                const dayProjects = showProjects ? projects.filter((p) => p.deadline === dateStr && matchFilter(p)) : [];
                const dayTasks = showTasks ? tasks.filter((t) => t.due_date === dateStr && matchFilter(t)) : [];
                const dayNotes = showNotes ? notes.filter((n) => getNoteDate(n) === dateStr && matchFilter(n)) : [];
                const totalDayItems = dayGoals.length + dayProjects.length + dayTasks.length + dayNotes.length;

                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;

                return (
                  <div
                    key={dateStr}
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setViewMode('day');
                    }}
                    className={`min-h-[58px] sm:min-h-[105px] md:min-h-[120px] p-1 sm:p-2.5 rounded-lg sm:rounded-xl border cursor-pointer transition-all duration-150 flex flex-col justify-between group overflow-hidden ${
                      isSelected
                        ? 'bg-zinc-900 border-blue-500/80 ring-2 ring-blue-500/20 shadow-lg'
                        : isToday
                        ? 'bg-[#0f172a]/60 border-blue-500/60 shadow-sm'
                        : isCurrentMonth
                        ? 'bg-zinc-900/60 hover:bg-zinc-850/90 border-zinc-800/80 hover:border-emerald-500/50 hover:ring-1 hover:ring-emerald-500/20'
                        : 'bg-zinc-950/40 border-zinc-900/60 text-zinc-600 hover:bg-zinc-900/40'
                    }`}
                  >
                    {/* Day Number Header */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] sm:text-xs font-bold px-1 sm:px-2 py-0.2 sm:py-0.5 rounded sm:rounded-lg transition-colors font-mono ${
                          isToday
                            ? 'bg-blue-600 text-white font-bold shadow-sm'
                            : isSelected
                            ? 'bg-zinc-800 text-white'
                            : isCurrentMonth
                            ? 'text-zinc-300 group-hover:text-white'
                            : 'text-zinc-600'
                        }`}
                      >
                        {dayNum}
                      </span>

                      {totalDayItems > 0 && (
                        <span
                          className={`hidden sm:inline-block text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                            isCurrentMonth ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-900 text-zinc-600'
                          }`}
                        >
                          {totalDayItems}
                        </span>
                      )}
                    </div>

                    {/* MOBILE ONLY: Clean aggregate badge/indicator to prevent cluttered icons */}
                    <div className="sm:hidden flex items-center justify-center my-1">
                      {totalDayItems > 0 && (
                        <div className="flex items-center gap-1 bg-zinc-950/90 border border-zinc-800/90 px-1.5 py-0.5 rounded-md shadow-sm">
                          {dayTasks.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                          {dayProjects.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                          {dayGoals.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
                          {dayNotes.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                          <span className="text-[10px] font-mono font-bold text-zinc-300">
                            {totalDayItems}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* DESKTOP ONLY: EVENT ICONS (CLEAN COLOR-CODED BADGES) */}
                    <div className="hidden sm:flex flex-wrap items-center justify-start gap-1 sm:gap-1.5 my-0.5 sm:my-1.5 overflow-hidden">
                      {/* Goals */}
                      {dayGoals.map((g) => (
                        <div
                          key={g.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenGoal && onOpenGoal(g.id);
                          }}
                          className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-purple-950/90 hover:bg-purple-900 border border-purple-600/80 hover:border-zinc-200 text-purple-300 shadow-sm transition-colors cursor-pointer"
                          title={`🎯 [Primary Goal] ${g.title} (Click to open objective)`}
                        >
                          <Target className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                        </div>
                      ))}

                      {/* Projects (Color-coded by category/platform) */}
                      {dayProjects.map((p) => {
                        const badge = getProjectBadge(p);
                        const IconComponent = badge.icon;
                        return (
                          <div
                            key={p.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenProject(p.id);
                            }}
                            className={`p-1 sm:p-1.5 rounded-md sm:rounded-lg border shadow-sm transition-colors hover:border-zinc-200 cursor-pointer ${badge.style}`}
                            title={`🎬 [${badge.label}] ${p.name} ${p.client_name ? `(Client: ${p.client_name})` : ''}`}
                          >
                            <IconComponent className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                          </div>
                        );
                      })}

                      {/* Tasks (Color changes when marked completed and stays on calendar!) */}
                      {dayTasks.map((t) => {
                        const badge = getTaskCalendarBadge(t);
                        const TaskIcon = badge.taskType === 'pool' ? Waves : badge.taskType === 'workout' ? Dumbbell : CheckCircle2;
                        return (
                          <div
                            key={t.id}
                            onClick={(e) => handleToggleTask(t, e)}
                            className={`p-1 sm:p-1.5 rounded-md sm:rounded-lg border transition-all hover:scale-105 active:scale-95 cursor-pointer ${badge.style}`}
                            title={badge.title}
                          >
                            <TaskIcon className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 ${badge.iconColor}`} />
                          </div>
                        );
                      })}

                      {/* Notes (Scheduled Note with StickyNote icon) */}
                      {dayNotes.map((n) => (
                        <div
                          key={n.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenNote && onOpenNote(n.id);
                          }}
                          className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-amber-950/90 hover:bg-amber-900 border border-amber-500/80 hover:border-zinc-200 text-amber-300 shadow-sm shadow-amber-950/40 transition-colors cursor-pointer"
                          title={`📝 [Note] ${n.title} (Click to open note)`}
                        >
                          <StickyNote className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                        </div>
                      ))}
                    </div>

                    <div className="h-0.5" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. WEEK SPRINT VIEW (ICON-CODED) */}
      {viewMode === 'week' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <CalendarRange className="w-4 h-4 text-purple-400" /> 7-Day Sprint Timeline ({weekDays[0]} — {weekDays[6]})
            </h2>
            <span className="text-xs text-zinc-400 font-mono">Select any day to inspect</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDays.map((dStr) => {
              const dayDate = new Date(dStr);
              const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = dStr.split('-')[2];
              const isToday = dStr === todayStr;
              const isSelected = dStr === selectedDate;

              const dayGoals = showGoals ? goals.filter((g) => g.target_date === dStr && matchFilter(g)) : [];
              const dayProjects = showProjects ? projects.filter((p) => p.deadline === dStr && matchFilter(p)) : [];
              const dayTasks = showTasks ? tasks.filter((t) => t.due_date === dStr && matchFilter(t)) : [];
              const dayNotes = showNotes ? notes.filter((n) => getNoteDate(n) === dStr && matchFilter(n)) : [];

              return (
                <div
                  key={dStr}
                  onClick={() => {
                    setSelectedDate(dStr);
                    setViewMode('day');
                  }}
                  className={`min-h-[220px] p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-zinc-900 border-blue-500 ring-1 ring-blue-500/20'
                      : isToday
                      ? 'bg-[#0f172a]/70 border-blue-500/60'
                      : 'bg-zinc-900/60 hover:bg-zinc-850 border-zinc-800/80'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <span className="text-xs font-bold text-zinc-400 uppercase">{dayName}</span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-lg font-mono ${
                          isToday ? 'bg-blue-600 text-white' : 'text-zinc-200'
                        }`}
                      >
                        {dayNum}
                      </span>
                    </div>

                    {/* Events inside this Day (Icon Grid) */}
                    <div className="flex flex-wrap items-center gap-2">
                      {dayGoals.map((g) => (
                        <div
                          key={g.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenGoal && onOpenGoal(g.id);
                          }}
                          className="p-2 rounded-lg bg-purple-950/90 hover:bg-purple-900 border border-purple-600/80 hover:border-zinc-200 text-purple-300 shadow-sm transition-colors cursor-pointer"
                          title={`🎯 [Primary Goal] ${g.title} (Click to open objective)`}
                        >
                          <Target className="w-4 h-4" />
                        </div>
                      ))}

                      {dayProjects.map((p) => {
                        const badge = getProjectBadge(p);
                        const IconComponent = badge.icon;
                        return (
                          <div
                            key={p.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenProject(p.id);
                            }}
                            className={`p-2 rounded-lg border shadow-sm transition-colors hover:border-zinc-200 cursor-pointer ${badge.style}`}
                            title={`🎬 [${badge.label}] ${p.name} ${p.client_name ? `(Client: ${p.client_name})` : ''}`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                        );
                      })}

                      {dayTasks.map((t) => {
                        const badge = getTaskCalendarBadge(t);
                        const TaskIcon = badge.taskType === 'pool' ? Waves : badge.taskType === 'workout' ? Dumbbell : CheckCircle2;
                        return (
                          <div
                            key={t.id}
                            onClick={(e) => handleToggleTask(t, e)}
                            className={`p-2 rounded-lg border transition-all hover:scale-105 active:scale-95 cursor-pointer ${badge.style}`}
                            title={badge.title}
                          >
                            <TaskIcon className={`w-4 h-4 ${badge.iconColor}`} />
                          </div>
                        );
                      })}

                      {dayNotes.map((n) => (
                        <div
                          key={n.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenNote && onOpenNote(n.id);
                          }}
                          className="p-2 rounded-lg bg-amber-950/90 hover:bg-amber-900 border border-amber-500/80 hover:border-zinc-200 text-amber-300 shadow-sm shadow-amber-950/40 transition-colors cursor-pointer"
                          title={`📝 [Note] ${n.title}`}
                        >
                          <StickyNote className="w-4 h-4" />
                        </div>
                      ))}

                      {dayGoals.length === 0 && dayProjects.length === 0 && dayTasks.length === 0 && dayNotes.length === 0 && (
                        <div className="text-[11px] text-zinc-600 text-center py-6 w-full">No events</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. DEDICATED DAY DETAIL VIEW */}
      {viewMode === 'day' && (
        <div className="space-y-4">
          {/* Day Navigation & Action Header */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Back to Calendar & Day Steppers */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setViewMode('month')}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-750 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>კალენდარი</span>
                </button>

                <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5">
                  <button
                    onClick={handlePrevDay}
                    className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    title="წინა დღე"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {selectedDate !== todayStr && (
                    <button
                      onClick={handleToday}
                      className="px-2 py-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300"
                    >
                      დღეს
                    </button>
                  )}
                  <button
                    onClick={handleNextDay}
                    className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                    title="შემდეგი დღე"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {selectedDate === todayStr && (
                  <span className="px-2.5 py-1 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    <span>დღევანდელი დღე</span>
                  </span>
                )}
              </div>

              {/* Action Buttons: Add Workout & Add Task */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenWorkoutModal('push')}
                  className="flex-1 sm:flex-initial px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-950/40"
                >
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>+ ვარჯიშის დამატება</span>
                </button>
                <button
                  onClick={() => setShowAddTaskModal(true)}
                  className="flex-1 sm:flex-initial px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-950/40"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ ახალი ტასკი</span>
                </button>
              </div>
            </div>

            {/* Large Date Header & Stats */}
            <div className="pt-2 border-t border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  {getGeorgianDateTitle(selectedDate)}
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                  თარიღი: {selectedDate}
                </p>
              </div>

              {/* Task Completion Mini Stat */}
              {selectedTasks.length > 0 && (
                <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-xl">
                  <div className="text-right">
                    <div className="text-xs font-bold text-zinc-200">
                      {selectedTasks.filter((t) => t.completed).length} / {selectedTasks.length} შესრულებული
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono">
                      {Math.round((selectedTasks.filter((t) => t.completed).length / selectedTasks.length) * 100)}% პროგრესი
                    </div>
                  </div>
                  <div className="w-16 bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{
                        width: `${Math.round((selectedTasks.filter((t) => t.completed).length / selectedTasks.length) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Routine Recommendation Card (e.g. Push, Pull, Legs, Pool, Rest) */}
          {(() => {
            const routine = getDayRoutine(selectedDate);
            if (!routine) return null;

            const isAlreadyAdded = selectedTasks.some(
              (t) =>
                t.title.toLowerCase().includes(routine.title.toLowerCase()) ||
                (routine.type === 'pool' && t.stage === 'Pool') ||
                (routine.type === 'gym' && t.stage === 'Workout')
            );

            return (
              <div
                className={`p-4 rounded-2xl border transition-all ${
                  routine.type === 'gym'
                    ? 'bg-gradient-to-r from-emerald-950/40 via-zinc-950 to-zinc-950 border-emerald-500/40 shadow-sm'
                    : routine.type === 'pool'
                    ? 'bg-gradient-to-r from-cyan-950/40 via-zinc-950 to-zinc-950 border-cyan-500/40 shadow-sm'
                    : 'bg-zinc-950 border-zinc-850'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl border shrink-0 ${
                        routine.type === 'gym'
                          ? 'bg-emerald-950/80 border-emerald-700 text-emerald-400'
                          : routine.type === 'pool'
                          ? 'bg-cyan-950/80 border-cyan-700 text-cyan-400'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {routine.type === 'gym' ? (
                        <Dumbbell className="w-5 h-5" />
                      ) : routine.type === 'pool' ? (
                        <Waves className="w-5 h-5" />
                      ) : (
                        <Heart className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                          {routine.type === 'gym' ? 'დარბაზის რუტინა' : routine.type === 'pool' ? 'აუზის რუტინა' : 'დასვენების დღე'}
                        </span>
                        {routine.subtitle && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 font-medium">
                            {routine.subtitle}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                        {routine.title}
                      </h3>
                      {routine.focus && (
                        <p className="text-xs text-zinc-400 mt-0.5">{routine.focus}</p>
                      )}
                    </div>
                  </div>

                  {(routine.type === 'gym' || routine.type === 'pool') && (
                    <div className="shrink-0">
                      {isAlreadyAdded ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 text-xs font-bold">
                          <Check className="w-3.5 h-3.5" />
                          <span>ვარჯიში დამატებულია</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddRoutineToDay(routine)}
                          className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>ამ ვარჯიშის დამატება (1-Click)</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* MAIN DAY TASKS LIST */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>დღის ტასკები ({selectedTasks.length})</span>
              </h2>
              <button
                onClick={() => setShowAddTaskModal(true)}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ტასკის დამატება</span>
              </button>
            </div>

            {selectedTasks.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-zinc-300">ამ დღისთვის ტასკები ჯერ არ გაქვთ დამატებული</p>
                  <p className="text-xs text-zinc-500">დაამატეთ ვარჯიში ან სამუშაო ტასკი ქვემოთ მოცემული ღილაკებით</p>
                </div>
                <div className="flex items-center justify-center gap-2.5 pt-2">
                  <button
                    onClick={() => handleOpenWorkoutModal('push')}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Dumbbell className="w-3.5 h-3.5" />
                    <span>+ ვარჯიშის დამატება</span>
                  </button>
                  <button
                    onClick={() => setShowAddTaskModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ ტასკის დამატება</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {selectedTasks.map((t) => {
                  const badge = getTaskCalendarBadge(t);
                  const isWorkout = badge.taskType === 'workout';
                  const isPool = badge.taskType === 'pool';

                  return (
                    <div
                      key={t.id}
                      onClick={() => handleToggleTask(t)}
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer group flex flex-col gap-2.5 ${
                        t.completed
                          ? 'bg-emerald-950/20 border-emerald-800/50 opacity-80'
                          : isWorkout
                          ? 'bg-zinc-900/90 hover:bg-zinc-850/90 border-emerald-600/40 shadow-sm shadow-emerald-950/20'
                          : isPool
                          ? 'bg-zinc-900/90 hover:bg-zinc-850/90 border-cyan-600/40 shadow-sm shadow-cyan-950/20'
                          : 'bg-zinc-900/80 hover:bg-zinc-850 border-zinc-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          {/* Big Tap Checkbox */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleTask(t);
                            }}
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                              t.completed
                                ? 'bg-emerald-600 border-emerald-500 text-white'
                                : 'border-zinc-700 hover:border-emerald-500 text-transparent'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>

                          <div className="min-w-0 flex-1 space-y-1">
                            {/* Badges row */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {isWorkout && (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold flex items-center gap-1 font-mono">
                                  <Dumbbell className="w-3 h-3" />
                                  <span>დარბაზი / Workout</span>
                                </span>
                              )}
                              {isPool && (
                                <span className="px-2 py-0.5 rounded-md bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 text-[10px] font-bold flex items-center gap-1 font-mono">
                                  <Waves className="w-3 h-3" />
                                  <span>აუზი / Pool</span>
                                </span>
                              )}
                              {!isWorkout && !isPool && (
                                <span className="px-2 py-0.5 rounded-md bg-blue-950/90 border border-blue-500/40 text-blue-300 text-[10px] font-bold flex items-center gap-1 font-mono">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>{t.stage || 'ტასკი'}</span>
                                </span>
                              )}

                              {t.due_time && (
                                <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                                  <Clock className="w-3 h-3 text-zinc-500" />
                                  {t.due_time}
                                </span>
                              )}

                              {t.priority && (
                                <span
                                  className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                                    t.priority === 'High'
                                      ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                                      : t.priority === 'Medium'
                                      ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                                      : 'bg-zinc-800 text-zinc-400'
                                  }`}
                                >
                                  {t.priority} Priority
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <h4
                              className={`text-sm sm:text-base font-bold tracking-tight transition-colors ${
                                t.completed ? 'line-through text-zinc-500' : 'text-zinc-100 group-hover:text-white'
                              }`}
                            >
                              {t.title}
                            </h4>

                            {/* Description / Exercise list */}
                            {t.description && (
                              <div className="mt-2 p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs text-zinc-300 leading-relaxed whitespace-pre-line font-normal">
                                {t.description}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteTask(t.id, e)}
                          title="ტასკის წაშლა"
                          className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* DAY PROJECTS & GOALS (IF ANY) */}
          {(selectedProjects.length > 0 || selectedGoals.length > 0 || selectedNotes.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Projects Due Today */}
              {selectedProjects.length > 0 && (
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
                  <h3 className="text-xs font-bold uppercase text-blue-400 tracking-wider flex items-center gap-1.5">
                    <Video className="w-4 h-4" /> პროექტები დედლაინით ({selectedProjects.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedProjects.map((p) => {
                      const badge = getProjectBadge(p);
                      const IconComponent = badge.icon;
                      return (
                        <div
                          key={p.id}
                          onClick={() => onOpenProject(p.id)}
                          className="p-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-blue-500 rounded-xl cursor-pointer group transition-all flex items-center justify-between"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`p-1 rounded border ${badge.style}`}>
                                <IconComponent className="w-3 h-3" />
                              </span>
                              <span className="text-xs font-bold text-zinc-100 group-hover:text-white truncate">
                                {p.name}
                              </span>
                            </div>
                            {p.client_name && (
                              <div className="text-[10px] text-zinc-400 pl-6">კლიენტი: {p.client_name}</div>
                            )}
                          </div>
                          <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Goals Due Today */}
              {selectedGoals.length > 0 && (
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
                  <h3 className="text-xs font-bold uppercase text-purple-400 tracking-wider flex items-center gap-1.5">
                    <Target className="w-4 h-4" /> მიზნები ({selectedGoals.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedGoals.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => onOpenGoal && onOpenGoal(g.id)}
                        className="p-3 bg-purple-950/20 hover:bg-purple-950/40 border border-purple-800/60 hover:border-purple-500 rounded-xl cursor-pointer group transition-all flex items-center justify-between"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="text-xs font-bold text-purple-200 group-hover:text-white truncate">
                            🎯 {g.title}
                          </h4>
                          {g.description && (
                            <p className="text-[11px] text-zinc-400 truncate">{g.description}</p>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-purple-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes for Today */}
              {selectedNotes.length > 0 && (
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
                  <h3 className="text-xs font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                    <StickyNote className="w-4 h-4" /> ჩანაწერები / Notes ({selectedNotes.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedNotes.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => onOpenNote && onOpenNote(n.id)}
                        className="p-3 bg-amber-950/20 hover:bg-amber-950/40 border border-amber-600/40 hover:border-amber-400 rounded-xl cursor-pointer group transition-all flex items-center justify-between"
                      >
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-amber-200 group-hover:text-white truncate">
                            📝 {n.title}
                          </h4>
                        </div>
                        <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ADD WORKOUT MODAL */}
      {showAddWorkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-400">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">ვარჯიშის დამატება</h3>
                  <p className="text-[11px] text-zinc-400 font-mono">{selectedDate} ({getGeorgianDateTitle(selectedDate)})</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddWorkoutModal(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-850"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                აირჩიეთ ვარჯიშის ტიპი (შაბლონი):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenWorkoutModal('push')}
                  className={`p-2 rounded-xl border text-left text-xs transition-all ${
                    workoutPreset === 'push'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850'
                  }`}
                >
                  🏋️‍♂️ Push (მკერდი)
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenWorkoutModal('pull')}
                  className={`p-2 rounded-xl border text-left text-xs transition-all ${
                    workoutPreset === 'pull'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850'
                  }`}
                >
                  🏋️‍♂️ Pull (ზურგი)
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenWorkoutModal('legs')}
                  className={`p-2 rounded-xl border text-left text-xs transition-all ${
                    workoutPreset === 'legs'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850'
                  }`}
                >
                  🏋️‍♂️ Legs (ფეხები)
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenWorkoutModal('pool')}
                  className={`p-2 rounded-xl border text-left text-xs transition-all ${
                    workoutPreset === 'pool'
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850'
                  }`}
                >
                  🏊‍♂️ Pool (აუზი)
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenWorkoutModal('custom')}
                  className={`col-span-2 sm:col-span-2 p-2 rounded-xl border text-left text-xs transition-all ${
                    workoutPreset === 'custom'
                      ? 'bg-blue-950/80 border-blue-500 text-blue-300 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850'
                  }`}
                >
                  ⚡ საკუთარი ვარჯიში
                </button>
              </div>
            </div>

            {/* Editable Form Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                  ვარჯიშის სათაური:
                </label>
                <input
                  type="text"
                  value={workoutTitle}
                  onChange={(e) => setWorkoutTitle(e.target.value)}
                  placeholder="მაგ: დარბაზი: Push (მკერდი, მხრები)"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                  დრო (არასავალდებულო):
                </label>
                <input
                  type="text"
                  value={workoutTime}
                  onChange={(e) => setWorkoutTime(e.target.value)}
                  placeholder="20:00"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                  ვარჯიშების სია / დეტალები:
                </label>
                <textarea
                  rows={4}
                  value={workoutDescription}
                  onChange={(e) => setWorkoutDescription(e.target.value)}
                  placeholder="ჩამოწერეთ ვარჯიშები და სეტები..."
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500 resize-none font-mono leading-relaxed"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-850">
              <button
                type="button"
                onClick={() => setShowAddWorkoutModal(false)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 rounded-xl text-xs font-semibold"
              >
                გაუქმება
              </button>
              <button
                type="button"
                onClick={handleSaveWorkout}
                disabled={!workoutTitle.trim()}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-emerald-950/40"
              >
                ვარჯიშის დამატება
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD REGULAR TASK MODAL */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-950/80 border border-blue-700 text-blue-400">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">ახალი ტასკის დამატება</h3>
                  <p className="text-[11px] text-zinc-400 font-mono">{selectedDate} ({getGeorgianDateTitle(selectedDate)})</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-850"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                  ტასკის სათაური *
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="მაგ: ვიდეოს მონტაჟის დასრულება, პოსტის დადება..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                    პრიორიტეტი:
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e: any) => setNewTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="High">High Priority (მაღალი)</option>
                    <option value="Medium">Medium Priority (საშუალო)</option>
                    <option value="Low">Low Priority (დაბალი)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                    დრო (მაგ: 15:00):
                  </label>
                  <input
                    type="text"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    placeholder="15:00"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                  კატეგორია / ეტაპი:
                </label>
                <input
                  type="text"
                  value={newTaskStage}
                  onChange={(e) => setNewTaskStage(e.target.value)}
                  placeholder="General, Work, Personal, Editing..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                  დეტალები / კომენტარი:
                </label>
                <textarea
                  rows={3}
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="დამატებითი შენიშვნები ტასკის შესახებ..."
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-blue-500 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-850">
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 rounded-xl text-xs font-semibold"
              >
                გაუქმება
              </button>
              <button
                type="button"
                onClick={handleSaveTask}
                disabled={!newTaskTitle.trim()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-blue-950/40"
              >
                ტასკის დამატება
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. AGENDA LIST VIEW */}
      {viewMode === 'agenda' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" /> Chronological Deadlines Timeline ({allDeadlines.length})
            </h2>
          </div>

          {allDeadlines.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 text-xs font-medium">
              No deadlines found matching active filters.
            </div>
          ) : (
            <div className="divide-y divide-zinc-900">
              {allDeadlines.map((item) => {
                const isGoal = item.type === 'Goal';
                const isProject = item.type === 'Project';
                const isTask = item.type === 'Task';
                const isNote = item.type === 'Note';

                return (
                  <div
                    key={`${item.type}_${item.id}`}
                    onClick={() => {
                      if (isProject) onOpenProject(item.id);
                      else if (isGoal && onOpenGoal) onOpenGoal(item.id);
                      else if (isNote && onOpenNote) onOpenNote(item.id);
                    }}
                    className={`p-4 sm:p-5 flex items-center justify-between hover:bg-zinc-900/50 transition-colors ${
                      isProject || isGoal || isNote ? 'cursor-pointer group' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider font-mono ${
                          isGoal
                            ? 'bg-purple-950/80 border border-purple-800 text-purple-300'
                            : isProject
                            ? 'bg-blue-950/80 border border-blue-800 text-blue-300'
                            : isNote
                            ? 'bg-amber-950/80 border border-amber-500/80 text-amber-300'
                            : 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                        }`}
                      >
                        {item.type}
                      </span>
                      <div>
                        <div className={`text-xs sm:text-sm font-bold text-zinc-100 ${isProject || isGoal ? 'group-hover:text-purple-300' : isNote ? 'group-hover:text-amber-300' : ''} transition-colors`}>
                          {item.title}
                        </div>
                        {isProject && item.raw.client_name && (
                          <div className="text-[11px] text-zinc-400">Client: {item.raw.client_name}</div>
                        )}
                        {isNote && item.raw.folder && (
                          <div className="text-[11px] text-zinc-400">Folder: {item.raw.folder}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-mono font-bold ${item.isOverdue ? 'text-rose-400' : 'text-zinc-300'}`}>
                        {item.date} {item.isOverdue && '(Overdue)'}
                      </span>
                      {(isProject || isGoal || isNote) && (
                        <ArrowRight className={`w-4 h-4 text-zinc-500 ${isNote ? 'group-hover:text-amber-400' : 'group-hover:text-purple-400'} group-hover:translate-x-0.5 transition-transform`} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ADD WORKOUT MODAL */}
      {showAddWorkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-400">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">ვარჯიშის დამატება</h3>
                  <p className="text-[11px] text-zinc-400 font-mono">{selectedDate} ({getGeorgianDateTitle(selectedDate)})</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddWorkoutModal(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-850"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                აირჩიეთ ვარჯიშის ტიპი (შაბლონი):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenWorkoutModal('push')}
                  className={`p-2 rounded-xl border text-left text-xs transition-all ${
                    workoutPreset === 'push'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850'
                  }`}
                >
                  🏋️‍♂️ Push (მკერდი)
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenWorkoutModal('pull')}
                  className={`p-2 rounded-xl border text-left text-xs transition-all ${
                    workoutPreset === 'pull'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850'
                  }`}
                >
                  🏋️‍♂️ Pull (ზურგი)
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenWorkoutModal('legs')}
                  className={`p-2 rounded-xl border text-left text-xs transition-all ${
                    workoutPreset === 'legs'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850'
                  }`}
                >
                  🏋️‍♂️ Legs (ფეხები)
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenWorkoutModal('pool')}
                  className={`p-2 rounded-xl border text-left text-xs transition-all ${
                    workoutPreset === 'pool'
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850'
                  }`}
                >
                  🏊‍♂️ Pool (აუზი)
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenWorkoutModal('custom')}
                  className={`col-span-2 sm:col-span-2 p-2 rounded-xl border text-left text-xs transition-all ${
                    workoutPreset === 'custom'
                      ? 'bg-blue-950/80 border-blue-500 text-blue-300 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850'
                  }`}
                >
                  ⚡ საკუთარი ვარჯიში
                </button>
              </div>
            </div>

            {/* Editable Form Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                  ვარჯიშის სათაური:
                </label>
                <input
                  type="text"
                  value={workoutTitle}
                  onChange={(e) => setWorkoutTitle(e.target.value)}
                  placeholder="მაგ: დარბაზი: Push (მკერდი, მხრები)"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                  დრო (არასავალდებულო):
                </label>
                <input
                  type="text"
                  value={workoutTime}
                  onChange={(e) => setWorkoutTime(e.target.value)}
                  placeholder="20:00"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                  ვარჯიშების სია / დეტალები:
                </label>
                <textarea
                  rows={4}
                  value={workoutDescription}
                  onChange={(e) => setWorkoutDescription(e.target.value)}
                  placeholder="ჩამოწერეთ ვარჯიშები და სეტები..."
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500 resize-none font-mono leading-relaxed"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-850">
              <button
                type="button"
                onClick={() => setShowAddWorkoutModal(false)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 rounded-xl text-xs font-semibold"
              >
                გაუქმება
              </button>
              <button
                type="button"
                onClick={handleSaveWorkout}
                disabled={!workoutTitle.trim()}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-emerald-950/40"
              >
                ვარჯიშის დამატება
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD REGULAR TASK MODAL */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-950/80 border border-blue-700 text-blue-400">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">ახალი ტასკის დამატება</h3>
                  <p className="text-[11px] text-zinc-400 font-mono">{selectedDate} ({getGeorgianDateTitle(selectedDate)})</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-850"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                  ტასკის სათაური *
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="მაგ: ვიდეოს მონტაჟის დასრულება, პოსტის დადება..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                    პრიორიტეტი:
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e: any) => setNewTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="High">High Priority (მაღალი)</option>
                    <option value="Medium">Medium Priority (საშუალო)</option>
                    <option value="Low">Low Priority (დაბალი)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                    დრო (მაგ: 15:00):
                  </label>
                  <input
                    type="text"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    placeholder="15:00"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                  კატეგორია / ეტაპი:
                </label>
                <input
                  type="text"
                  value={newTaskStage}
                  onChange={(e) => setNewTaskStage(e.target.value)}
                  placeholder="General, Work, Personal, Editing..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                  დეტალები / კომენტარი:
                </label>
                <textarea
                  rows={3}
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="დამატებითი შენიშვნები ტასკის შესახებ..."
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-blue-500 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-850">
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 rounded-xl text-xs font-semibold"
              >
                გაუქმება
              </button>
              <button
                type="button"
                onClick={handleSaveTask}
                disabled={!newTaskTitle.trim()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-blue-950/40"
              >
                ტასკის დამატება
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
