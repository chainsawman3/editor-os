import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Coins,
  CreditCard,
  Home,
  Zap,
  ShoppingBag,
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  Circle,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Percent,
  RefreshCw,
  Plus,
  Trash2,
  Save,
  Check,
  History,
  Info,
  CalendarDays,
  Flame,
  BadgeAlert,
  Edit3,
  X,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

export interface LoanItem {
  id: string;
  name: string;
  amount: number;
  paid: boolean;
}

export interface WeeklyLogItem {
  id: string;
  date: string;
  weekName: string;
  plannedAmount: number;
  actualSpent: number;
  difference: number;
  remainingBalanceAfter: number;
  note?: string;
}

export interface DailyExpenseRecord {
  date: string; // 'YYYY-MM-DD'
  dayName: string; // 'ოთხშაბათი'
  plannedAmount: number;
  actualSpent: number;
  foodPart: number;
  cigPart: number;
  funPart: number;
  deducted: boolean;
  deductedAt: string;
  isAuto: boolean;
  note?: string;
}

const DEFAULT_LOANS: LoanItem[] = [
  { id: 'loan_1', name: 'სესხი #1 (ძირითადი)', amount: 293, paid: true },
  { id: 'loan_2', name: 'სესხი #2', amount: 60, paid: true },
  { id: 'loan_3', name: 'სესხი #3', amount: 54, paid: true },
  { id: 'loan_4', name: 'სესხი #4', amount: 33, paid: true },
  { id: 'loan_5', name: 'სესხი #5', amount: 32, paid: true },
  { id: 'loan_6', name: 'სესხი #6', amount: 25, paid: true },
  { id: 'loan_7', name: 'სესხი #7', amount: 16, paid: true }
];

// Helper: Format date key as YYYY-MM-DD in local timezone
const formatDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Helper: Parse YYYY-MM-DD to midday Date to avoid DST shifts
const parseDateKey = (key: string): Date => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
};

// Helper: Return all date keys from startStr (inclusive) to endStr (exclusive)
const getDatesBetween = (startStr: string, endStr: string): string[] => {
  const dates: string[] = [];
  const curr = parseDateKey(startStr);
  const end = parseDateKey(endStr);
  while (curr.getTime() < end.getTime()) {
    dates.push(formatDateKey(curr));
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};

export const EconomyPage: React.FC = () => {
  const activeUser = typeof window !== 'undefined' ? (localStorage.getItem('flow_os_active_user') || 'gigi') : 'gigi';
  const getKey = (base: string) => (activeUser === 'gigi' ? base : `${base}_${activeUser}`);

  // 1. Persistent State
  const [salary, setSalary] = useState<number>(() => {
    const saved = localStorage.getItem(getKey('flow_os_salary'));
    if (saved) return parseFloat(saved);
    return activeUser === 'ani' ? 1800 : 2200;
  });

  const [currentBalance, setCurrentBalance] = useState<number>(() => {
    const saved = localStorage.getItem(getKey('flow_os_current_balance'));
    if (saved) return parseFloat(saved);
    return activeUser === 'ani' ? 500 : 600;
  });

  const [weekendBudget, setWeekendBudget] = useState<number>(() => {
    const saved = localStorage.getItem(getKey('flow_os_weekend_budget'));
    if (saved) return parseFloat(saved);
    return activeUser === 'ani' ? 50 : 40;
  });

  const [loans, setLoans] = useState<LoanItem[]>(() => {
    try {
      const saved = localStorage.getItem(getKey('flow_os_loans'));
      if (saved) return JSON.parse(saved);
      return activeUser === 'ani' ? [] : DEFAULT_LOANS;
    } catch {
      return activeUser === 'ani' ? [] : DEFAULT_LOANS;
    }
  });

  const [isLoansOpen, setIsLoansOpen] = useState(false);

  const [weeklyLogs, setWeeklyLogs] = useState<WeeklyLogItem[]>(() => {
    try {
      const saved = localStorage.getItem(getKey('flow_os_weekly_logs'));
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Daily Expenses Record keyed by YYYY-MM-DD
  const [dailyRecords, setDailyRecords] = useState<Record<string, DailyExpenseRecord>>(() => {
    try {
      const saved = localStorage.getItem(getKey('flow_os_daily_expenses'));
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Automatic daily deduction enabled toggle (default true)
  const [autoDeductEnabled, setAutoDeductEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(getKey('flow_os_auto_deduct_enabled'));
    return saved !== null ? saved === 'true' : true;
  });

  const [autoDeductNotice, setAutoDeductNotice] = useState<string | null>(null);

  // Sunday Check-in form state
  const [inputActualSpent, setInputActualSpent] = useState<string>('');
  const [inputNote, setInputNote] = useState<string>('');
  const [logSuccessMsg, setLogSuccessMsg] = useState<string | null>(null);

  // Fixed costs (Configurable per user)
  const [rent, setRent] = useState<number>(() => {
    const saved = localStorage.getItem(getKey('flow_os_rent'));
    if (saved !== null) return parseFloat(saved);
    return activeUser === 'ani' ? 0 : 500;
  });

  const [utilities, setUtilities] = useState<number>(() => {
    const saved = localStorage.getItem(getKey('flow_os_utilities'));
    if (saved !== null) return parseFloat(saved);
    return activeUser === 'ani' ? 0 : 60;
  });

  const [cigaretteDaily, setCigaretteDaily] = useState<number>(() => {
    const saved = localStorage.getItem(getKey('flow_os_cigarette_daily'));
    if (saved !== null) return parseFloat(saved);
    return activeUser === 'ani' ? 0 : 7;
  });

  // Edit / Deduct Modal State
  const [modalDay, setModalDay] = useState<{
    dateKey: string;
    dayName: string;
    dateStr: string;
    plannedAmount: number;
    currentSpent: number;
    isDeducted: boolean;
    note?: string;
  } | null>(null);

  const [modalSpentInput, setModalSpentInput] = useState<string>('');
  const [modalNoteInput, setModalNoteInput] = useState<string>('');

  // Calculate days remaining until the next 5th of the month
  const calculateDaysUntil5th = () => {
    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = today.getMonth();
    const curDate = today.getDate();

    let targetDate = new Date(curYear, curMonth, 5);
    if (curDate >= 5) {
      targetDate = new Date(curYear, curMonth + 1, 5);
    }
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const daysUntilNext5th = calculateDaysUntil5th();

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(getKey('flow_os_salary'), String(salary));
  }, [salary, activeUser]);

  useEffect(() => {
    localStorage.setItem(getKey('flow_os_current_balance'), String(currentBalance));
  }, [currentBalance, activeUser]);

  useEffect(() => {
    localStorage.setItem(getKey('flow_os_weekend_budget'), String(weekendBudget));
  }, [weekendBudget, activeUser]);

  useEffect(() => {
    localStorage.setItem(getKey('flow_os_loans'), JSON.stringify(loans));
  }, [loans, activeUser]);

  useEffect(() => {
    localStorage.setItem(getKey('flow_os_weekly_logs'), JSON.stringify(weeklyLogs));
  }, [weeklyLogs, activeUser]);

  useEffect(() => {
    localStorage.setItem(getKey('flow_os_daily_expenses'), JSON.stringify(dailyRecords));
  }, [dailyRecords, activeUser]);

  useEffect(() => {
    localStorage.setItem(getKey('flow_os_auto_deduct_enabled'), String(autoDeductEnabled));
  }, [autoDeductEnabled, activeUser]);

  useEffect(() => {
    localStorage.setItem(getKey('flow_os_rent'), String(rent));
  }, [rent, activeUser]);

  useEffect(() => {
    localStorage.setItem(getKey('flow_os_utilities'), String(utilities));
  }, [utilities, activeUser]);

  useEffect(() => {
    localStorage.setItem(getKey('flow_os_cigarette_daily'), String(cigaretteDaily));
  }, [cigaretteDaily, activeUser]);

  const toggleLoan = (id: string) => {
    setLoans((prev) =>
      prev.map((l) => (l.id === id ? { ...l, paid: !l.paid } : l))
    );
  };

  // Full Month (5th to 5th) Reference Calculations
  const totalLoans = loans.reduce((acc, l) => acc + l.amount, 0); // 513 ₾
  const totalFixedCosts = rent + utilities + totalLoans; // 1,073 ₾
  const remainingAfterFixed = Math.max(0, salary - totalFixedCosts); // 1,127 ₾

  const monthlyCigarettes = cigaretteDaily * 30; // 210 ₾
  const remainingAfterCigarettes = Math.max(0, remainingAfterFixed - monthlyCigarettes); // 917 ₾

  const monthlyWeekendFun = weekendBudget * 4; // 160 ₾
  const monthlyFoodBudget = Math.max(0, remainingAfterCigarettes - monthlyWeekendFun); // 757 ₾

  const dailyFoodBudget = (monthlyFoodBudget / 30).toFixed(2); // ~25.23 ₾
  const weeklyFoodBudget = (parseFloat(dailyFoodBudget) * 7).toFixed(0); // ~176 ₾

  // ==========================================
  // DYNAMIC RE-CALCULATION FOR REMAINING DAYS
  // ==========================================
  const remainingWeekends = Math.max(1, Math.ceil(daysUntilNext5th / 7));
  const remainingCigarettesCost = cigaretteDaily * daysUntilNext5th;
  const remainingWeekendCost = weekendBudget * remainingWeekends;
  const liveFoodBudget = Math.max(0, currentBalance - remainingCigarettesCost - remainingWeekendCost);
  const liveDailyFoodNum = parseFloat((liveFoodBudget / daysUntilNext5th).toFixed(2));

  // ==========================================
  // AUTOMATIC DAILY ROLLOVER & EXPENSE DEDUCTION
  // ==========================================
  useEffect(() => {
    if (!autoDeductEnabled) return;

    const today = new Date();
    const todayKey = formatDateKey(today);
    const lastActiveKey = localStorage.getItem(getKey('flow_os_last_active_date'));

    let effectiveLastKey = lastActiveKey;

    // Bootstrap if user had balance saved (e.g. 600) but no last_active_date was recorded yet:
    if (!effectiveLastKey) {
      const savedBalance = localStorage.getItem(getKey('flow_os_current_balance'));
      if (savedBalance) {
        // Set yesterday so yesterday's expense is deducted immediately
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        effectiveLastKey = formatDateKey(yesterday);
      } else {
        localStorage.setItem(getKey('flow_os_last_active_date'), todayKey);
        return;
      }
    }

    if (effectiveLastKey < todayKey) {
      const datesToProcess = getDatesBetween(effectiveLastKey, todayKey);
      let totalAutoDeducted = 0;
      const updatedRecords = { ...dailyRecords };
      const dayNames = ['კვირა', 'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი'];

      let tempBalance = currentBalance;

      datesToProcess.forEach((dateStr) => {
        if (!updatedRecords[dateStr]?.deducted) {
          const d = parseDateKey(dateStr);
          const dayOfWeek = d.getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

          const foodPart = liveDailyFoodNum;
          const cigPart = cigaretteDaily;
          const funPart = isWeekend ? weekendBudget / 2 : 0;
          const plannedTotal = parseFloat((foodPart + cigPart + funPart).toFixed(2));

          tempBalance = Math.max(0, parseFloat((tempBalance - plannedTotal).toFixed(2)));
          totalAutoDeducted += plannedTotal;

          updatedRecords[dateStr] = {
            date: dateStr,
            dayName: dayNames[dayOfWeek],
            plannedAmount: plannedTotal,
            actualSpent: plannedTotal,
            foodPart,
            cigPart,
            funPart,
            deducted: true,
            deductedAt: new Date().toISOString(),
            isAuto: true
          };
        }
      });

      if (totalAutoDeducted > 0) {
        setCurrentBalance(tempBalance);
        setDailyRecords(updatedRecords);
        localStorage.setItem(getKey('flow_os_current_balance'), String(tempBalance));
        localStorage.setItem(getKey('flow_os_daily_expenses'), JSON.stringify(updatedRecords));

        if (datesToProcess.length === 1) {
          setAutoDeductNotice(
            `გუშინდელი დღის (${datesToProcess[0]}) დაგეგმილი ხარჯი (-${totalAutoDeducted.toFixed(2)} ₾) ავტომატურად ჩამოიჭრა ბიუჯეტიდან. ახალი ბალანსი: ${tempBalance.toFixed(2)} ₾. თუ განსხვავებული თანხა დახარჯეთ, შეგიძლიათ ბარათზე ჩაასწოროთ.`
          );
        } else {
          setAutoDeductNotice(
            `გასული ${datesToProcess.length} დღის დაგეგმილი ხარჯი (-${totalAutoDeducted.toFixed(2)} ₾) ავტომატურად ჩამოიჭრა. ახალი ბალანსი: ${tempBalance.toFixed(2)} ₾.`
          );
        }
      }

      localStorage.setItem(getKey('flow_os_last_active_date'), todayKey);
    }
  }, [activeUser, autoDeductEnabled]);

  // Modal Handlers
  const openModal = (
    dateKey: string,
    dayName: string,
    dateStr: string,
    plannedAmount: number
  ) => {
    const existing = dailyRecords[dateKey];
    setModalDay({
      dateKey,
      dayName,
      dateStr,
      plannedAmount,
      currentSpent: existing?.actualSpent ?? plannedAmount,
      isDeducted: !!existing?.deducted,
      note: existing?.note
    });
    setModalSpentInput(String(existing?.actualSpent ?? plannedAmount.toFixed(2)));
    setModalNoteInput(existing?.note || '');
  };

  const closeModal = () => {
    setModalDay(null);
    setModalSpentInput('');
    setModalNoteInput('');
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalDay) return;

    const newSpent = parseFloat(modalSpentInput);
    if (isNaN(newSpent) || newSpent < 0) {
      alert('გთხოვთ შეიყვანოთ სწორი თანხა');
      return;
    }

    const existing = dailyRecords[modalDay.dateKey];
    let newBalance = currentBalance;

    if (existing?.deducted) {
      const diff = existing.actualSpent - newSpent;
      newBalance = Math.max(0, parseFloat((currentBalance + diff).toFixed(2)));
    } else {
      newBalance = Math.max(0, parseFloat((currentBalance - newSpent).toFixed(2)));
    }

    const updated: DailyExpenseRecord = {
      date: modalDay.dateKey,
      dayName: modalDay.dayName,
      plannedAmount: modalDay.plannedAmount,
      actualSpent: newSpent,
      foodPart: parseFloat(Math.max(0, modalDay.plannedAmount - cigaretteDaily).toFixed(2)),
      cigPart: cigaretteDaily,
      funPart: 0,
      deducted: true,
      deductedAt: new Date().toISOString(),
      isAuto: false,
      note: modalNoteInput.trim() || undefined
    };

    const nextRecords = { ...dailyRecords, [modalDay.dateKey]: updated };
    setCurrentBalance(newBalance);
    setDailyRecords(nextRecords);
    localStorage.setItem(getKey('flow_os_current_balance'), String(newBalance));
    localStorage.setItem(getKey('flow_os_daily_expenses'), JSON.stringify(nextRecords));

    closeModal();
    setLogSuccessMsg(`✅ ${modalDay.dayName}-ს ხარჯი (${newSpent.toFixed(2)} ₾) წარმატებით დაფიქსირდა! დარჩენილი ბალანსი: ${newBalance.toFixed(2)} ₾.`);
    setTimeout(() => setLogSuccessMsg(null), 6000);
  };

  const handleRevertDeduction = () => {
    if (!modalDay) return;
    const existing = dailyRecords[modalDay.dateKey];
    if (!existing || !existing.deducted) return;

    const refundedBalance = parseFloat((currentBalance + existing.actualSpent).toFixed(2));
    const nextRecords = { ...dailyRecords };
    delete nextRecords[modalDay.dateKey];

    setCurrentBalance(refundedBalance);
    setDailyRecords(nextRecords);
    localStorage.setItem(getKey('flow_os_current_balance'), String(refundedBalance));
    localStorage.setItem(getKey('flow_os_daily_expenses'), JSON.stringify(nextRecords));

    closeModal();
    setLogSuccessMsg(`↩️ ${modalDay.dayName}-ს ჩამოჭრა გაუქმდა. ${existing.actualSpent.toFixed(2)} ₾ დაბრუნდა ბალანსზე. დარჩენილი ბალანსი: ${refundedBalance.toFixed(2)} ₾.`);
    setTimeout(() => setLogSuccessMsg(null), 6000);
  };

  // Calculate current week's dates (Monday to Sunday)
  const getWeekDates = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday);

    const days = [];
    const dayNames = ['ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი', 'კვირა'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isToday = d.toDateString() === now.toDateString();
      const isPast = !isToday && d.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const isWeekend = i >= 5;

      const foodPart = liveDailyFoodNum;
      const cigPart = cigaretteDaily;
      const funPart = isWeekend ? weekendBudget / 2 : 0;
      const dayTotal = parseFloat((foodPart + cigPart + funPart).toFixed(2));
      const dateKey = formatDateKey(d);

      days.push({
        name: dayNames[i],
        dateStr: d.toLocaleDateString('ka-GE', { month: 'short', day: 'numeric' }),
        dateKey,
        rawDate: d,
        dayNumber: i + 1,
        isToday,
        isPast,
        isWeekend,
        foodPart,
        cigPart,
        funPart,
        dayTotal
      });
    }
    return days;
  };

  const weekSchedule = getWeekDates();
  const todayItem = weekSchedule.find((d) => d.isToday) || weekSchedule[2];
  const todayRecord = dailyRecords[todayItem.dateKey];
  const isTodayDeducted = !!todayRecord?.deducted;

  // How much should be spent in THIS CURRENT WEEK from un-deducted days until Sunday
  const daysLeftInThisWeek = weekSchedule.filter((d) => {
    const isDed = !!dailyRecords[d.dateKey]?.deducted;
    return !isDed && !d.isPast;
  });
  const thisWeekRemainingSpendTarget = daysLeftInThisWeek
    .reduce((acc, d) => acc + d.dayTotal, 0)
    .toFixed(0);

  // Total daily expenses recorded so far this week
  const totalSpentThisWeek = weekSchedule.reduce((acc, d) => {
    const rec = dailyRecords[d.dateKey];
    return acc + (rec?.deducted ? rec.actualSpent : 0);
  }, 0);

  // Sunday Check-in Handler
  const handleSundayCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const spent = parseFloat(inputActualSpent);
    if (isNaN(spent) || spent <= 0) {
      alert('გთხოვთ შეიყვანოთ დახარჯული თანხა');
      return;
    }

    const planned = parseFloat(thisWeekRemainingSpendTarget);
    const diff = planned - spent;
    const newBalance = Math.max(0, currentBalance - spent);

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('ka-GE', { month: 'short', day: 'numeric' });

    const newLog: WeeklyLogItem = {
      id: 'log_' + Date.now(),
      date: dateFormatted,
      weekName: `კვირის შეჯამება (${dateFormatted})`,
      plannedAmount: planned,
      actualSpent: spent,
      difference: diff,
      remainingBalanceAfter: newBalance,
      note: inputNote.trim() || undefined
    };

    setWeeklyLogs([newLog, ...weeklyLogs]);
    setCurrentBalance(newBalance);
    setInputActualSpent('');
    setInputNote('');

    if (diff >= 0) {
      setLogSuccessMsg(`🎉 შესანიშნავია! დაზოგე ${diff.toFixed(0)} ₾. შემდეგი კვირის დღიური საკვების ლიმიტი გაიზარდა! დარჩენილი ბალანსი: ${newBalance} ₾.`);
    } else {
      setLogSuccessMsg(`⚠️ გადახარჯვა: -${Math.abs(diff).toFixed(0)} ₾. სისტემამ შემდეგი კვირის დღიური ლიმიტი დაკორექტირა, რომ 5 რიცხვამდე უპრობლემოდ მიხვიდე! დარჩენილი ბალანსი: ${newBalance} ₾.`);
    }

    setTimeout(() => setLogSuccessMsg(null), 8000);
  };

  const removeWeeklyLog = (logId: string) => {
    if (window.confirm('გსურთ ამ ჩანაწერის წაშლა?')) {
      setWeeklyLogs((prev) => prev.filter((l) => l.id !== logId));
    }
  };

  // Percentage shares of full salary
  const pFixed = Math.round((totalFixedCosts / salary) * 100) || 0;
  const pFood = Math.round((monthlyFoodBudget / salary) * 100) || 0;
  const pCigarettes = Math.round((monthlyCigarettes / salary) * 100) || 0;
  const pWeekend = Math.round((monthlyWeekendFun / salary) * 100) || 0;

  // Sorted list of daily records for history
  const sortedDailyRecords = Object.values(dailyRecords).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto font-sans">
      {/* AUTO DEDUCT NOTIFICATION BANNER */}
      {autoDeductNotice && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-zinc-900 to-amber-950/40 border border-amber-500/60 text-amber-200 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-lg shadow-amber-950/40 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-amber-300 flex items-center gap-2">
                <span>დღიური ავტომატური ჩამოჭრა შესრულდა</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  განახლებულია
                </span>
              </div>
              <p className="mt-1 leading-relaxed text-zinc-300 text-xs sm:text-sm">
                {autoDeductNotice}
              </p>
            </div>
          </div>
          <button
            onClick={() => setAutoDeductNotice(null)}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
            title="დახურვა"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. TOP HEADER & CURRENT STATUS */}
      <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-850 pb-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
              <Wallet className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  ბიუჯეტი
                </h1>
                <button
                  onClick={() => setAutoDeductEnabled(!autoDeductEnabled)}
                  title="ავტო-ჩამოჭრის ჩართვა/გათიშვა"
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                    autoDeductEnabled
                      ? 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/60'
                      : 'bg-zinc-900 border border-zinc-750 text-zinc-400 hover:text-white'
                  }`}
                >
                  <RefreshCw className={`w-3 h-3 ${autoDeductEnabled ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                  <span>ავტო-ჩამოჭრა: {autoDeductEnabled ? 'ჩართულია' : 'გათიშულია'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Current Remaining Balance Capsule (Directly Editable) */}
          <div className="flex items-center gap-3 bg-zinc-900/90 p-3 sm:p-3.5 rounded-xl border border-zinc-800 shrink-0">
            <div>
              <span className="text-[11px] text-zinc-400 font-medium block">
                დარჩენილი ბალანსი:
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <input
                  type="number"
                  step="0.01"
                  value={currentBalance}
                  onChange={(e) => setCurrentBalance(parseFloat(e.target.value) || 0)}
                  className="w-28 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-0.5 text-lg font-bold font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                  title="დააჭირეთ თანხის ჩასასწორებლად"
                />
                <span className="text-xs font-bold text-zinc-400 font-mono">₾</span>
              </div>
            </div>
            <div className="text-right pl-3 border-l border-zinc-800">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">5 რიცხვამდე დარჩა</span>
              <span className="text-sm font-bold font-mono text-amber-400">{daysUntilNext5th} დღე</span>
            </div>
          </div>
        </div>

        {/* 4 PROMINENT METRICS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Today's Spend Status */}
          <div className={`p-3.5 rounded-xl border space-y-1 shadow-sm transition-all ${
            isTodayDeducted
              ? 'bg-gradient-to-br from-emerald-950/30 to-zinc-900 border-emerald-500/50'
              : 'bg-gradient-to-br from-amber-950/30 to-zinc-900 border-amber-500/50'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${
                isTodayDeducted ? 'text-emerald-300' : 'text-amber-300'
              }`}>
                {isTodayDeducted ? 'დღეს ჩამოჭრილია ✅' : '👉 დღეს დასახარჯი'}
              </span>
              <span className={`w-2 h-2 rounded-full ${
                isTodayDeducted ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
              }`} />
            </div>
            <div className={`text-xl sm:text-2xl font-black font-mono ${
              isTodayDeducted ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {isTodayDeducted ? `-${todayRecord?.actualSpent.toFixed(2)} ₾` : `~${todayItem.dayTotal.toFixed(2)} ₾`}
            </div>
            <span className="text-[10px] text-zinc-400 block truncate">
              {isTodayDeducted
                ? 'ბიუჯეტიდან უკვე ჩამოკლებულია'
                : `საკვები ${todayItem.foodPart} ₾ + სიგარეტი ${todayItem.cigPart} ₾ ${todayItem.funPart > 0 ? `+ გართობა ${todayItem.funPart} ₾` : ''}`}
            </span>
          </div>

          {/* This Week Spend Target */}
          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-cyan-800/40 space-y-1">
            <span className="text-[11px] text-cyan-400 font-semibold uppercase tracking-wider block">
              ამ კვირაში დასახარჯი
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-cyan-300">
              ~{thisWeekRemainingSpendTarget} ₾
            </div>
            <span className="text-[10px] text-zinc-500 block truncate">
              კვირის საღამომდე (დარჩენილ {daysLeftInThisWeek.length} დღეზე)
            </span>
          </div>

          {/* Daily Clean Food Budget */}
          <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-850 space-y-1">
            <span className="text-[11px] text-zinc-400 font-medium block">
              დღიური საკვების ლიმიტი
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
              ~{liveDailyFoodNum.toFixed(2)} ₾
            </div>
            <span className="text-[10px] text-zinc-500 block truncate">
              {currentBalance.toFixed(0)} ₾-ის {daysUntilNext5th} დღეზე გაყოფით
            </span>
          </div>

          {/* Loans & Fixed Deductions */}
          <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-850 space-y-1">
            <span className="text-[11px] text-zinc-400 font-medium block">
              სესხები & ქირა (ამ თვეში)
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-purple-400">
              გადახდილია ✅
            </div>
            <span className="text-[10px] text-zinc-500 block truncate">
              სესხები ({totalLoans} ₾) + ქირა ({rent} ₾)
            </span>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC 7-DAY WEEKLY SCHEDULE WITH DAILY DEDUCTION CONTROLS */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
              კვირის განრიგი
            </h2>
          </div>
          <span className="text-xs text-zinc-400">
            დღეს არის <strong className="text-amber-400 font-bold">{todayItem.name} ({todayItem.dateStr})</strong> · ლიმიტი: <strong className="text-emerald-400 font-mono font-bold">~{todayItem.dayTotal.toFixed(2)} ₾</strong>
          </span>
        </div>

        {/* 7 Columns on Desktop: Every day has its own clean card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2.5">
          {weekSchedule.map((day) => {
            const rec = dailyRecords[day.dateKey];
            const isDeducted = !!rec?.deducted;
            const actualSpent = rec ? rec.actualSpent : day.dayTotal;
            const diff = rec ? rec.plannedAmount - rec.actualSpent : 0;

            return (
              <div
                key={day.dateKey}
                className={`group relative rounded-2xl p-3 border transition-all flex flex-col justify-between select-none min-h-[225px] ${
                  day.isToday
                    ? isDeducted
                      ? 'bg-gradient-to-b from-emerald-950/30 via-zinc-900/90 to-zinc-950 border-emerald-500/80 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/50'
                      : 'bg-gradient-to-b from-amber-950/30 via-zinc-900/90 to-zinc-950 border-amber-500 ring-2 ring-amber-500/50 shadow-lg shadow-amber-950/50'
                    : isDeducted
                    ? 'bg-emerald-950/15 border-emerald-800/40 opacity-90 hover:opacity-100 hover:border-emerald-600/60'
                    : day.isPast
                    ? 'bg-zinc-950/50 border-zinc-850/80 opacity-60 hover:opacity-90'
                    : day.isWeekend
                    ? 'bg-zinc-950/90 border-cyan-850/50 hover:border-cyan-600/70 hover:bg-cyan-950/10'
                    : 'bg-zinc-950/90 border-zinc-850 hover:border-zinc-700 hover:bg-zinc-900/50'
                }`}
              >
                {/* Top Section */}
                <div className="space-y-1.5">
                  {/* Card Header: Day Name + Status Icon + Edit button */}
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider font-mono shrink-0 ${
                        day.isToday
                          ? isDeducted
                            ? 'bg-emerald-500 text-black shadow-sm'
                            : 'bg-amber-500 text-black shadow-sm'
                          : day.isWeekend
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                          : 'bg-zinc-800/80 text-zinc-300 border border-zinc-750'
                      }`}
                    >
                      {day.name}
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                      {day.isToday && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          isDeducted
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        }`}>
                          დღეს
                        </span>
                      )}

                      {isDeducted && (
                        <span
                          className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0"
                          title="ხარჯი ჩამოჭრილია"
                        >
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}

                      {!day.isToday && !isDeducted && day.isPast && (
                        <span className="text-[10px] text-zinc-500 font-mono">
                          გასული
                        </span>
                      )}

                      {/* Header Edit Pencil for fast access */}
                      <button
                        type="button"
                        onClick={() => openModal(day.dateKey, day.name, day.dateStr, day.dayTotal)}
                        className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors opacity-70 group-hover:opacity-100"
                        title="ხარჯის რედაქტირება"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Date line */}
                  <div className="text-[10px] font-mono text-zinc-500">
                    {day.dateStr}
                  </div>

                  {/* Spend Target / Actual Deducted Display */}
                  <div className="space-y-0.5 pt-0.5">
                    <span className="text-[10px] block font-medium truncate">
                      {isDeducted ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 shrink-0" /> ჩამოჭრილია
                        </span>
                      ) : day.isToday ? (
                        <span className="text-amber-400 flex items-center gap-1 font-bold">
                          <Zap className="w-3 h-3 shrink-0 text-amber-400" /> დღეს დასახარჯი
                        </span>
                      ) : day.isPast ? (
                        <span className="text-zinc-500">დაგეგმილი იყო</span>
                      ) : (
                        <span className="text-zinc-400">დასახარჯი</span>
                      )}
                    </span>

                    <div
                      className={`text-xl font-black font-mono tracking-tight ${
                        isDeducted
                          ? 'text-emerald-400'
                          : day.isToday
                          ? 'text-amber-400'
                          : day.isPast
                          ? 'text-zinc-500'
                          : 'text-zinc-200'
                      }`}
                    >
                      {isDeducted ? `-${actualSpent.toFixed(2)}` : `~${day.dayTotal.toFixed(0)}`}{' '}
                      <span className="text-xs font-normal text-zinc-500 font-mono">₾</span>
                    </div>

                    {/* Difference / status line (Fixed 1-line height) */}
                    <div className="h-4 flex items-center">
                      {isDeducted ? (
                        Math.abs(diff) < 0.05 ? (
                          <span className="text-[10px] text-zinc-400 font-mono truncate">
                            გეგმით {rec?.isAuto ? '(ავტო)' : ''}
                          </span>
                        ) : diff > 0 ? (
                          <span className="text-[10px] text-emerald-400 font-bold font-mono truncate">
                            +{diff.toFixed(1)} ₾ დაზოგილი
                          </span>
                        ) : (
                          <span className="text-[10px] text-rose-400 font-bold font-mono truncate">
                            {diff.toFixed(1)} ₾ გადახარჯვა
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-mono truncate">
                          ლიმიტი: ~{day.dayTotal.toFixed(0)} ₾
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons: Uniform h-8 slot across ALL cards */}
                  <div className="pt-1">
                    {isDeducted ? (
                      <button
                        type="button"
                        onClick={() => openModal(day.dateKey, day.name, day.dateStr, day.dayTotal)}
                        className="w-full h-8 px-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-750 hover:border-zinc-600 rounded-xl text-[11px] font-semibold text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <Edit3 className="w-3 h-3 text-zinc-400" />
                        <span>ჩასწორება</span>
                      </button>
                    ) : day.isToday ? (
                      <button
                        type="button"
                        onClick={() => openModal(day.dateKey, day.name, day.dateStr, day.dayTotal)}
                        className="w-full h-8 px-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/40 transition-all active:scale-95"
                      >
                        <Zap className="w-3.5 h-3.5 shrink-0" />
                        <span>ჩამოჭრა</span>
                      </button>
                    ) : day.isPast ? (
                      <button
                        type="button"
                        onClick={() => openModal(day.dateKey, day.name, day.dateStr, day.dayTotal)}
                        className="w-full h-8 px-2 bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 font-medium rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Plus className="w-3 h-3 text-zinc-500" />
                        <span>ჩაწერა</span>
                      </button>
                    ) : (
                      <div className="w-full h-8 rounded-xl bg-zinc-950/60 border border-zinc-850/80 flex items-center justify-center text-[10px] text-zinc-500 font-mono">
                        დაგეგმილია
                      </div>
                    )}
                  </div>
                </div>

                {/* Day Cost Breakdown Sub-tags (Fixed 3-row slot so all cards align 100% horizontally) */}
                <div className="mt-2.5 pt-2 border-t border-zinc-850/80 space-y-0.5 text-[10px] text-zinc-400">
                  <div className="flex justify-between">
                    <span>საკვები:</span>
                    <span className="font-mono text-zinc-300">{day.foodPart.toFixed(0)} ₾</span>
                  </div>
                  <div className="flex justify-between">
                    <span>სიგარეტი:</span>
                    <span className="font-mono text-zinc-300">{day.cigPart} ₾</span>
                  </div>
                  <div className="flex justify-between">
                    <span>გართობა:</span>
                    {day.funPart > 0 ? (
                      <span className="font-mono text-cyan-400 font-bold">{day.funPart} ₾</span>
                    ) : (
                      <span className="font-mono text-zinc-600">—</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. DAILY EXPENSES HISTORY TABLE */}
      {sortedDailyRecords.length > 0 && (
        <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                დღიური ხარჯების ისტორია & ჩამოჭრები
              </h3>
            </div>
            <span className="text-[11px] text-zinc-400">
              სულ ჩამოჭრილი დღეები: <strong className="text-emerald-400 font-mono">{sortedDailyRecords.length}</strong>
            </span>
          </div>

          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {sortedDailyRecords.map((r) => {
              const diff = r.plannedAmount - r.actualSpent;
              return (
                <div
                  key={r.date}
                  className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono font-bold text-zinc-300 shrink-0">
                      {r.date}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[11px] font-semibold shrink-0">
                      {r.dayName}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      r.isAuto
                        ? 'bg-blue-950/60 text-blue-300 border border-blue-800/40'
                        : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                    }`}>
                      {r.isAuto ? 'ავტო-ჩამოჭრა' : 'ხელით ჩაწერილი'}
                    </span>
                    {r.note && (
                      <span className="text-zinc-400 text-[11px] truncate">
                        · {r.note}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-400 block">
                        -{r.actualSpent.toFixed(2)} ₾
                      </span>
                      <span className={`text-[10px] font-mono ${
                        Math.abs(diff) < 0.05
                          ? 'text-zinc-500'
                          : diff > 0
                          ? 'text-emerald-400 font-semibold'
                          : 'text-rose-400 font-semibold'
                      }`}>
                        {Math.abs(diff) < 0.05
                          ? 'გეგმით'
                          : diff > 0
                          ? `+${diff.toFixed(2)} ₾ (დაზოგილი)`
                          : `${diff.toFixed(2)} ₾ (გადახარჯვა)`}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openModal(r.date, r.dayName, r.date, r.plannedAmount)}
                      className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                      title="ჩასწორება"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. 5-TH OF THE MONTH SALARY INPUT & REAL-TIME ALLOCATION CALCULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left 2 Columns: Salary Input + Full Monthly Allocation */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-850 rounded-2xl p-4 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <span>ხელფასის კალკულატორი (5 რიცხვი)</span>
              </h2>
            </div>

            {/* Editable Salary Input */}
            <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-750">
              <span className="text-xs text-zinc-400 font-medium">ხელფასი:</span>
              <input
                type="number"
                step="50"
                value={salary}
                onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
                className="w-24 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-base font-bold font-mono text-white text-right focus:outline-none focus:border-amber-500"
              />
              <span className="text-xs font-bold text-amber-400 font-mono">₾</span>
            </div>
          </div>

          {/* Step-by-Step Waterfall Deduction Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              ხელფასიდან ეტაპობრივი დაქვითვა და გადანაწილება:
            </h3>

            {/* 1. Fixed obligations */}
            <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-200">1. სავალდებულო ფიქსირებული ხარჯები</span>
                  <span className="text-[10px] text-rose-400 font-mono px-1.5 py-0.2 rounded bg-rose-950/60 border border-rose-800/40">
                    -{pFixed}%
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 flex flex-wrap items-center gap-2">
                  <span>ქირა:</span>
                  <input
                    type="number"
                    value={rent}
                    onChange={(e) => setRent(parseFloat(e.target.value) || 0)}
                    className="w-16 bg-zinc-950 border border-zinc-700 rounded px-1.5 py-0.5 text-xs text-white font-mono text-center focus:border-rose-500"
                    title="ჩაწერეთ ქირის თანხა (ან 0 თუ არ გაქვთ)"
                  />
                  <span>₾ + კომუნალურები:</span>
                  <input
                    type="number"
                    value={utilities}
                    onChange={(e) => setUtilities(parseFloat(e.target.value) || 0)}
                    className="w-14 bg-zinc-950 border border-zinc-700 rounded px-1.5 py-0.5 text-xs text-white font-mono text-center focus:border-rose-500"
                    title="ჩაწერეთ კომუნალურები (ან 0)"
                  />
                  <span>₾ + სესხები ({totalLoans} ₾)</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold font-mono text-rose-400">-{totalFixedCosts} ₾</div>
                <div className="text-[10px] text-zinc-500">რჩება: {remainingAfterFixed} ₾</div>
              </div>
            </div>

            {/* 2. Cigarettes / Daily Habit */}
            <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-200">2. {cigaretteDaily > 0 ? 'სიგარეტის / ყოველდღიური' : 'ყოველდღიური პირადი'} ფონდი</span>
                  <span className="text-[10px] text-amber-400 font-mono px-1.5 py-0.2 rounded bg-amber-950/60 border border-amber-800/40">
                    -{pCigarettes}%
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                  <span>დღიური ხარჯი:</span>
                  <input
                    type="number"
                    value={cigaretteDaily}
                    onChange={(e) => setCigaretteDaily(parseFloat(e.target.value) || 0)}
                    className="w-14 bg-zinc-950 border border-zinc-700 rounded px-1.5 py-0.5 text-xs text-white font-mono text-center focus:border-amber-500"
                    title="თუ არ ეწევით, ჩაწერეთ 0"
                  />
                  <span>₾ ყოველდღე × 30 დღე {cigaretteDaily === 0 ? '(გათიშულია)' : ''}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold font-mono text-amber-400">-{monthlyCigarettes} ₾</div>
                <div className="text-[10px] text-zinc-500">რჩება: {remainingAfterCigarettes} ₾</div>
              </div>
            </div>

            {/* 3. Weekend Entertainment */}
            <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-200">3. შაბათ-კვირის გართობის ფონდი</span>
                  <span className="text-[10px] text-cyan-400 font-mono px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-800/40">
                    -{pWeekend}%
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                  <span>თითო შაბათ-კვირას:</span>
                  <input
                    type="number"
                    value={weekendBudget}
                    onChange={(e) => setWeekendBudget(parseFloat(e.target.value) || 0)}
                    className="w-14 bg-zinc-950 border border-zinc-700 rounded px-1.5 py-0.5 text-xs text-white font-mono text-center"
                  />
                  <span>₾ × 4 შაბათ-კვირა</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold font-mono text-cyan-400">-{monthlyWeekendFun} ₾</div>
                <div className="text-[10px] text-zinc-500">რჩება: {monthlyFoodBudget} ₾</div>
              </div>
            </div>

            {/* 4. Final: Clean Food Budget */}
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/50 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">4. სუფთა საკვებისა და საოჯახო ბიუჯეტი</span>
                  <span className="text-[10px] text-emerald-300 font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 font-bold">
                    {pFood}% ხელფასიდან
                  </span>
                </div>
                <div className="text-xs text-emerald-200/80">
                  მთლიანად გამოყოფილია სრულფასოვან საკვებზე მომდევნო 5 რიცხვამდე (30 დღე)
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black font-mono text-emerald-400">{monthlyFoodBudget} ₾</div>
                <div className="text-xs font-bold font-mono text-emerald-300">
                  👉 ~{dailyFoodBudget} ₾ / დღეში
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Loan Checklist & Category Breakdown */}
        <div className="space-y-4">
          {/* Loans Breakdown Card (Collapsible Dropdown) */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
            <button
              type="button"
              onClick={() => setIsLoansOpen(!isLoansOpen)}
              className="w-full flex items-center justify-between text-left group transition-colors select-none"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider group-hover:text-rose-300 transition-colors">
                  სესხები & ვალდებულებები
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono text-rose-400">
                  სულ: {totalLoans} ₾
                </span>
                <span className="text-[10px] text-zinc-500 font-medium">
                  ({loans.filter((l) => l.paid).length}/{loans.length})
                </span>
                <div className={`p-1 rounded-md text-zinc-400 group-hover:text-white group-hover:bg-zinc-800 transition-transform duration-200 ${isLoansOpen ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </button>

            {isLoansOpen && (
              <div className="space-y-1.5 pt-2 border-t border-zinc-850 animate-in fade-in duration-200">
                {loans.map((loan) => (
                  <div
                    key={loan.id}
                    onClick={() => toggleLoan(loan.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all select-none ${
                      loan.paid
                        ? 'bg-emerald-950/20 border-emerald-700/50 text-emerald-300'
                        : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        type="button"
                        className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors ${
                          loan.paid
                            ? 'bg-emerald-600 text-white'
                            : 'border border-zinc-700 text-transparent'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-medium truncate">{loan.name}</span>
                    </div>
                    <span className="text-xs font-bold font-mono">
                      {loan.amount} ₾
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Monthly Categories Summary Pie/Bars */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-zinc-850 pb-2.5 flex items-center gap-2">
              <Percent className="w-4 h-4 text-purple-400" />
              <span>თვის კატეგორიების გადანაწილება</span>
            </h3>

            <div className="space-y-3 text-xs">
              {/* Rent & Utilities */}
              <div className="space-y-1">
                <div className="flex justify-between text-zinc-300">
                  <span>ქირა & კომუნალურები</span>
                  <span className="font-mono font-bold">{rent + utilities} ₾ ({Math.round(((rent + utilities) / salary) * 100)}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-850 overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${Math.min(100, ((rent + utilities) / salary) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Loans */}
              <div className="space-y-1">
                <div className="flex justify-between text-zinc-300">
                  <span>სესხები ({loans.length} ცალი)</span>
                  <span className="font-mono font-bold text-rose-400">{totalLoans} ₾ ({Math.round((totalLoans / salary) * 100)}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-850 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${Math.min(100, (totalLoans / salary) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Food */}
              <div className="space-y-1">
                <div className="flex justify-between text-zinc-300">
                  <span>საკვები & საოჯახო</span>
                  <span className="font-mono font-bold text-emerald-400">{monthlyFoodBudget} ₾ ({pFood}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-850 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, pFood)}%` }}
                  />
                </div>
              </div>

              {/* Cigarettes */}
              <div className="space-y-1">
                <div className="flex justify-between text-zinc-300">
                  <span>{cigaretteDaily > 0 ? `სიგარეტი (${cigaretteDaily} ₾/დღე)` : 'პირადი ხარჯი'}</span>
                  <span className="font-mono font-bold text-amber-400">{monthlyCigarettes} ₾ ({pCigarettes}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-850 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${Math.min(100, pCigarettes)}%` }}
                  />
                </div>
              </div>

              {/* Weekend Fun */}
              <div className="space-y-1">
                <div className="flex justify-between text-zinc-300">
                  <span>შაბათ-კვირის გართობა</span>
                  <span className="font-mono font-bold text-cyan-400">{monthlyWeekendFun} ₾ ({pWeekend}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-850 overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full"
                    style={{ width: `${Math.min(100, pWeekend)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT / DEDUCT EXPENSE MODAL */}
      {modalDay && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {modalDay.dayName} ({modalDay.dateStr})
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    {modalDay.isDeducted ? 'ხარჯის ჩასწორება' : 'დღიური ხარჯის ჩამოჭრა'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-400">დაგეგმილი დღიური ლიმიტი:</span>
              <span className="font-mono font-bold text-amber-400">~{modalDay.plannedAmount.toFixed(2)} ₾</span>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">
                  რეალურად დახარჯული თანხა (₾):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={modalSpentInput}
                    onChange={(e) => setModalSpentInput(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                    placeholder="0.00"
                    autoFocus
                  />
                  <span className="absolute right-3.5 top-3 text-xs text-zinc-500 font-bold">₾</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setModalSpentInput(modalDay.plannedAmount.toFixed(2))}
                    className="text-[11px] px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 transition-colors"
                  >
                    გეგმის მიხედვით ({modalDay.plannedAmount.toFixed(2)} ₾)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalSpentInput('0')}
                    className="text-[11px] px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 transition-colors"
                  >
                    0 ₾ (არაფერი)
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">
                  შენიშვნა / კომენტარი (სურვილისამებრ):
                </label>
                <input
                  type="text"
                  value={modalNoteInput}
                  onChange={(e) => setModalNoteInput(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  placeholder="მაგ. სუპერმარკეტი, სიგარეტი, ყავა"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-zinc-850">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-950/40"
                >
                  <Check className="w-4 h-4" />
                  <span>{modalDay.isDeducted ? 'შენახვა & ბალანსის განახლება' : 'ბიუჯეტიდან ჩამოჭრა'}</span>
                </button>

                {modalDay.isDeducted && (
                  <button
                    type="button"
                    onClick={handleRevertDeduction}
                    className="py-2.5 px-3 rounded-xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-950/50 border border-rose-900/50 transition-all flex items-center justify-center gap-1"
                    title="თანხის დაბრუნება დარჩენილ ბალანსზე"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ჩამოჭრის გაუქმება</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={closeModal}
                  className="py-2.5 px-3 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800"
                >
                  დახურვა
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
