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
  BadgeAlert
} from 'lucide-react';

interface LoanItem {
  id: string;
  name: string;
  amount: number;
  paid: boolean;
}

interface WeeklyLogItem {
  id: string;
  date: string;
  weekName: string;
  plannedAmount: number;
  actualSpent: number;
  difference: number;
  remainingBalanceAfter: number;
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

export const EconomyPage: React.FC = () => {
  // 1. Persistent State
  const [salary, setSalary] = useState<number>(() => {
    const saved = localStorage.getItem('flow_os_salary');
    return saved ? parseFloat(saved) : 2200;
  });

  const [currentBalance, setCurrentBalance] = useState<number>(() => {
    const saved = localStorage.getItem('flow_os_current_balance');
    return saved ? parseFloat(saved) : 600;
  });

  const [weekendBudget, setWeekendBudget] = useState<number>(() => {
    const saved = localStorage.getItem('flow_os_weekend_budget');
    return saved ? parseFloat(saved) : 40;
  });

  const [loans, setLoans] = useState<LoanItem[]>(() => {
    try {
      const saved = localStorage.getItem('flow_os_loans');
      return saved ? JSON.parse(saved) : DEFAULT_LOANS;
    } catch {
      return DEFAULT_LOANS;
    }
  });

  const [weeklyLogs, setWeeklyLogs] = useState<WeeklyLogItem[]>(() => {
    try {
      const saved = localStorage.getItem('flow_os_weekly_logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sunday Check-in form state
  const [inputActualSpent, setInputActualSpent] = useState<string>('');
  const [inputNote, setInputNote] = useState<string>('');
  const [logSuccessMsg, setLogSuccessMsg] = useState<string | null>(null);

  // Fixed costs
  const rent = 500;
  const utilities = 60;
  const cigaretteDaily = 7;

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
    localStorage.setItem('flow_os_salary', String(salary));
  }, [salary]);

  useEffect(() => {
    localStorage.setItem('flow_os_current_balance', String(currentBalance));
  }, [currentBalance]);

  useEffect(() => {
    localStorage.setItem('flow_os_weekend_budget', String(weekendBudget));
  }, [weekendBudget]);

  useEffect(() => {
    localStorage.setItem('flow_os_loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem('flow_os_weekly_logs', JSON.stringify(weeklyLogs));
  }, [weeklyLogs]);

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
  // Dependent on REAL currentBalance (e.g. 600 ₾) & daysUntilNext5th (e.g. 17 days)
  // ==========================================
  const remainingWeekends = Math.max(1, Math.ceil(daysUntilNext5th / 7));
  const remainingCigarettesCost = cigaretteDaily * daysUntilNext5th; // 17 x 7 = 119 ₾
  const remainingWeekendCost = weekendBudget * remainingWeekends; // 2 x 40 = 80 ₾
  const liveFoodBudget = Math.max(0, currentBalance - remainingCigarettesCost - remainingWeekendCost); // 401 ₾
  const liveDailyFoodNum = parseFloat((liveFoodBudget / daysUntilNext5th).toFixed(2)); // ~23.59 ₾

  // Calculate current week's dates (Monday to Sunday)
  const getWeekDates = () => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sun, 1 is Mon...
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

      // Planned spending for this specific day
      const foodPart = liveDailyFoodNum;
      const cigPart = cigaretteDaily;
      const funPart = isWeekend ? weekendBudget / 2 : 0;
      const dayTotal = parseFloat((foodPart + cigPart + funPart).toFixed(2));

      days.push({
        name: dayNames[i],
        dateStr: d.toLocaleDateString('ka-GE', { month: 'short', day: 'numeric' }),
        rawDate: d,
        dayNumber: i + 1, // 1 to 7
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

  // How much should be spent in THIS CURRENT WEEK from today until Sunday
  const daysLeftInThisWeek = weekSchedule.filter((d) => !d.isPast);
  const thisWeekRemainingSpendTarget = daysLeftInThisWeek
    .reduce((acc, d) => acc + d.dayTotal, 0)
    .toFixed(0);

  // Full 7-day week target
  const fullWeekSpendTarget = weekSchedule
    .reduce((acc, d) => acc + d.dayTotal, 0)
    .toFixed(0);

  // Sunday Check-in Handler
  const handleSundayCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const spent = parseFloat(inputActualSpent);
    if (isNaN(spent) || spent <= 0) {
      alert('გთხოვთ შეიყვანოთ დახარჯული თანხა');
      return;
    }

    const planned = parseFloat(thisWeekRemainingSpendTarget);
    const diff = planned - spent; // Positive means saved, negative means overspent
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

    // Recompute feedback
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

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto font-sans">
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
                  Budget & Expense Control
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-700/60 text-[11px] font-semibold text-amber-300">
                  ხელფასი 5 რიცხვში
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  დინამიური გადათვლა
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                გიგის ფინანსური მართვის სისტემა: მიმდინარე ბალანსზე ({currentBalance} ₾) მორგებული დღიური ლიმიტი, კვირის საღამოს ფაქტობრივი ხარჯის აღრიცხვა და შემდეგი კვირის ავტომატური კორექტირება.
              </p>
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
                  value={currentBalance}
                  onChange={(e) => setCurrentBalance(parseFloat(e.target.value) || 0)}
                  className="w-24 bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-0.5 text-lg font-bold font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
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

        {/* 4 PROMINENT METRICS (Reflecting exact 600 GEL status) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Today's Spend Limit */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-950/30 to-zinc-900 border border-amber-500/50 space-y-1 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-amber-300 font-bold uppercase tracking-wider">
                👉 დღეს დასახარჯი (დღეს)
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-amber-400">
              ~{todayItem.dayTotal.toFixed(2)} ₾
            </div>
            <span className="text-[10px] text-zinc-400 block">
              საკვები {todayItem.foodPart} ₾ + სიგარეტი {todayItem.cigPart} ₾ {todayItem.funPart > 0 ? `+ გართობა ${todayItem.funPart} ₾` : ''}
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
            <span className="text-[10px] text-zinc-500 block">
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
            <span className="text-[10px] text-zinc-500 block">
              600 ₾-ის 17 დღეზე გაყოფით
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
            <span className="text-[10px] text-zinc-500 block">
              სესხები (513 ₾) + ქირა (500 ₾)
            </span>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC 7-DAY WEEKLY SCHEDULE (TODAY HIGHLIGHTED & SPEND LIMITS) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
              მიმდინარე კვირის განრიგი (ორშაბათი – კვირა)
            </h2>
          </div>
          <span className="text-xs text-zinc-400">
            დღეს არის <strong className="text-amber-400 font-bold">{todayItem.name} ({todayItem.dateStr})</strong> · ლიმიტი: <strong className="text-emerald-400 font-mono font-bold">~{todayItem.dayTotal.toFixed(2)} ₾</strong>
          </span>
        </div>

        {/* 7 Columns on Desktop: Every day has its own clean card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-3">
          {weekSchedule.map((day) => {
            return (
              <div
                key={day.name}
                className={`relative rounded-2xl p-3.5 sm:p-4 border transition-all flex flex-col justify-between select-none ${
                  day.isToday
                    ? 'bg-gradient-to-b from-amber-950/40 via-zinc-900 to-zinc-950 border-amber-500 ring-2 ring-amber-500/50 shadow-xl shadow-amber-950/50'
                    : day.isPast
                    ? 'bg-zinc-950/40 border-zinc-850/60 opacity-60'
                    : day.isWeekend
                    ? 'bg-zinc-950 border-cyan-800/40 hover:border-cyan-600/70 hover:bg-zinc-900'
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div>
                  {/* Card Header: Day pill + Today Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        day.isToday
                          ? 'bg-amber-500 text-black shadow-sm'
                          : day.isWeekend
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {day.name}
                    </span>

                    {day.isToday && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/50 text-amber-300 animate-pulse">
                        დღეს ⭐
                      </span>
                    )}

                    {day.isPast && (
                      <span className="text-[10px] font-medium text-zinc-500">
                        გასული
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-mono text-zinc-500 block mb-2">
                    {day.dateStr}
                  </span>

                  {/* Spend Target for this day */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-400 block font-medium">
                      {day.isPast ? 'დაგეგმილი იყო:' : day.isToday ? '👉 დღეს დასახარჯი:' : 'დასახარჯი:'}
                    </span>
                    <div
                      className={`text-xl font-black font-mono tracking-tight ${
                        day.isToday ? 'text-amber-400 text-2xl' : day.isPast ? 'text-zinc-500' : 'text-white'
                      }`}
                    >
                      {day.dayTotal.toFixed(0)} <span className="text-xs font-normal text-zinc-400 font-mono">₾</span>
                    </div>
                  </div>
                </div>

                {/* Day Cost Breakdown Sub-tags */}
                <div className="mt-3 pt-2.5 border-t border-zinc-850/80 space-y-1 text-[10px] text-zinc-400">
                  <div className="flex justify-between">
                    <span>საკვები:</span>
                    <span className="font-mono text-zinc-300">{day.foodPart.toFixed(0)} ₾</span>
                  </div>
                  <div className="flex justify-between">
                    <span>სიგარეტი:</span>
                    <span className="font-mono text-zinc-300">{day.cigPart} ₾</span>
                  </div>
                  {day.funPart > 0 && (
                    <div className="flex justify-between text-cyan-400 font-bold">
                      <span>გართობა:</span>
                      <span className="font-mono">{day.funPart} ₾</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. SUNDAY EVENING EXPENSE CHECK-IN & RE-CALCULATION WIDGET */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950/20 border border-amber-600/40 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                კვირის საღამოს შეჯამება & გადათვლა
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                რამდენი დახარჯე ამ კვირაში?
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">კვირის გეგმიური ლიმიტი:</span>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
              ~{thisWeekRemainingSpendTarget} ₾ (დარჩენილ დღეებზე)
            </span>
          </div>
        </div>

        {logSuccessMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-300 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in leading-relaxed">
            <Sparkles className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            <span>{logSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleSundayCheckIn} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-4 space-y-1">
            <label className="text-[11px] font-semibold text-zinc-300 block">
              ამ კვირაში რეალურად დახარჯული (₾):
            </label>
            <div className="relative">
              <input
                type="number"
                step="1"
                placeholder={`მაგ. ${thisWeekRemainingSpendTarget}`}
                value={inputActualSpent}
                onChange={(e) => setInputActualSpent(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2.5 text-sm font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
              <span className="absolute right-3 top-2.5 text-xs text-zinc-500 font-bold">₾</span>
            </div>
          </div>

          <div className="sm:col-span-5 space-y-1">
            <label className="text-[11px] font-semibold text-zinc-300 block">
              შენიშვნა / კომენტარი (სურვილისამებრ):
            </label>
            <input
              type="text"
              placeholder="მაგ. პროდუქტები მარკეტში, სიგარეტი, შაბათს კაფე"
              value={inputNote}
              onChange={(e) => setInputNote(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-950/40"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>დაფიქსირება & გადათვლა</span>
            </button>
          </div>
        </form>

        <div className="text-xs text-zinc-400 bg-zinc-950/60 p-3 rounded-xl border border-zinc-850 flex items-start gap-2.5 leading-relaxed">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>ჭკვიანი ადაპტაცია:</strong> როცა კვირის ბოლოს ჩაწერთ რეალურ ხარჯს, სისტემა მას გამოაკლებს მიმდინარე ბალანსს და <strong>შემდეგ კვირას თავიდან შეადგენს</strong>. თუ მეტი დაგეხარჯათ — დარჩენილი დღეების დღიური საკვების ლიმიტი ავტომატურად შემცირდება, რომ 5 რიცხვამდე ფული გარანტირებულად გეყოთ. თუ დაზოგეთ — შემდეგი კვირის დღიური ბიუჯეტი ავტომატურად გაიზრდება!
          </span>
        </div>

        {/* Weekly Logs History Table if any */}
        {weeklyLogs.length > 0 && (
          <div className="pt-3 border-t border-zinc-850/80 space-y-2">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
              კვირების ხარჯების ისტორია:
            </span>
            <div className="space-y-1.5">
              {weeklyLogs.map((log) => {
                const isSaved = log.difference >= 0;
                return (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-zinc-400 font-bold shrink-0">{log.date}</span>
                      <span className="text-zinc-200 truncate">{log.note || 'კვირის დანახარჯი'}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="font-mono font-bold text-white block">{log.actualSpent} ₾</span>
                        <span className={`text-[10px] font-mono font-semibold ${isSaved ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isSaved ? `+${log.difference.toFixed(0)} ₾ (დაზოგილი)` : `${log.difference.toFixed(0)} ₾ (გადახარჯვა)`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeWeeklyLog(log.id)}
                        className="p-1 text-zinc-600 hover:text-rose-400 transition-colors"
                        title="ჩანაწერის წაშლა"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. 5-TH OF THE MONTH SALARY INPUT & REAL-TIME ALLOCATION CALCULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left 2 Columns: Salary Input + Full Monthly Allocation */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-850 rounded-2xl p-4 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <span>ყოველთვიური ხელფასის კალკულატორი (5 რიცხვი)</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                შეიყვანეთ 5-ში აღებული ხელფასი — სისტემა მომენტალურად გადაანაწილებს სესხებს, საკვებსა და გართობას.
              </p>
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
            <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-200">1. სავალდებულო ფიქსირებული ხარჯები</span>
                  <span className="text-[10px] text-rose-400 font-mono px-1.5 py-0.2 rounded bg-rose-950/60 border border-rose-800/40">
                    -{pFixed}%
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  ქირა (500 ₾) + კომუნალურები (60 ₾) + სესხები 7 ცალი ({totalLoans} ₾)
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold font-mono text-rose-400">-{totalFixedCosts} ₾</div>
                <div className="text-[10px] text-zinc-500">რჩება: {remainingAfterFixed} ₾</div>
              </div>
            </div>

            {/* 2. Cigarettes */}
            <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-200">2. სიგარეტის ყოველთვიური ფონდი</span>
                  <span className="text-[10px] text-amber-400 font-mono px-1.5 py-0.2 rounded bg-amber-950/60 border border-amber-800/40">
                    -{pCigarettes}%
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  ფიქსირებული: 7 ₾ ყოველდღე × 30 დღე
                </div>
              </div>
              <div className="text-right">
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
          {/* Loans Breakdown Card */}
          <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  სესხები & ვალდებულებები
                </h3>
              </div>
              <span className="text-xs font-bold font-mono text-rose-400">
                სულ: {totalLoans} ₾
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              ხელფასის აღებისას მონიშნეთ გადახდილი სესხები:
            </p>

            <div className="space-y-1.5">
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
                  <span>სესხები (7 ცალი)</span>
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
                  <span>სიგარეტი (7 ₾/დღე)</span>
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
    </div>
  );
};
