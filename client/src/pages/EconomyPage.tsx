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
  Info
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

  // Full Month (5th to 5th) Calculations
  const totalLoans = loans.reduce((acc, l) => acc + l.amount, 0); // 513 ₾
  const totalFixedCosts = rent + utilities + totalLoans; // 1,073 ₾
  const remainingAfterFixed = Math.max(0, salary - totalFixedCosts); // 1,127 ₾

  const monthlyCigarettes = cigaretteDaily * 30; // 210 ₾
  const remainingAfterCigarettes = Math.max(0, remainingAfterFixed - monthlyCigarettes); // 917 ₾

  const monthlyWeekendFun = weekendBudget * 4; // 160 ₾
  const monthlyFoodBudget = Math.max(0, remainingAfterCigarettes - monthlyWeekendFun); // 757 ₾

  const dailyFoodBudget = (monthlyFoodBudget / 30).toFixed(2); // ~25.23 ₾
  const weeklyFoodBudget = (parseFloat(dailyFoodBudget) * 7).toFixed(0); // ~176 ₾
  const standardWeeklyTarget = (parseFloat(dailyFoodBudget) * 7 + cigaretteDaily * 7 + weekendBudget).toFixed(0); // ~265 ₾

  // Live Recalculation for remaining days until 5th based on currentBalance
  const remainingWeekends = Math.max(1, Math.ceil(daysUntilNext5th / 7));
  const remainingCigarettesCost = cigaretteDaily * daysUntilNext5th;
  const remainingWeekendCost = weekendBudget * remainingWeekends;
  const liveFoodBudget = Math.max(0, currentBalance - remainingCigarettesCost - remainingWeekendCost);
  const liveDailyFood = (liveFoodBudget / daysUntilNext5th).toFixed(2);
  const liveWeeklyFood = (parseFloat(liveDailyFood) * 7).toFixed(0);

  // Sunday Check-in Handler
  const handleSundayCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const spent = parseFloat(inputActualSpent);
    if (isNaN(spent) || spent <= 0) {
      alert('გთხოვთ შეიყვანოთ დახარჯული თანხა');
      return;
    }

    const planned = parseFloat(standardWeeklyTarget);
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

    if (diff >= 0) {
      setLogSuccessMsg(`🎉 შესანიშნავია! დაზოგილია ${diff.toFixed(0)} ₾. ბიუჯეტი წარმატებით გადაითვალა!`);
    } else {
      setLogSuccessMsg(`⚠️ დაფიქსირდა ${Math.abs(diff).toFixed(0)} ₾ გადახარჯვა. დარჩენილი დღეების ლიმიტი დაკორექტირდა.`);
    }

    setTimeout(() => setLogSuccessMsg(null), 6000);
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
                  ეკონომიკის კონტროლი & ბიუჯეტი
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-700/60 text-[11px] font-semibold text-amber-300">
                  ხელფასი 5 რიცხვში
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  კვირის საღამოს გადათვლა
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                გიგის პერსონალური ფინანსური მართვა: სესხები (513 ₾), ქირა, კომუნალურები, სიგარეტი (7 ₾/დღე), კვირის საღამოს ფაქტობრივი ხარჯების აღრიცხვა და ბიუჯეტის დინამიური გადათვლა.
              </p>
            </div>
          </div>

          {/* Current Remaining Capsule */}
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

        {/* 4 Quick Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-850 space-y-1">
            <span className="text-[11px] text-zinc-500 font-medium block">სესხები (7 ცალი)</span>
            <div className="text-base sm:text-lg font-bold font-mono text-rose-400">
              {totalLoans} ₾
            </div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-850 space-y-1">
            <span className="text-[11px] text-zinc-500 font-medium block">ქირა + კომუნალური</span>
            <div className="text-base sm:text-lg font-bold font-mono text-purple-400">
              {rent + utilities} ₾
            </div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-850 space-y-1">
            <span className="text-[11px] text-zinc-500 font-medium block">სიგარეტი (7 ₾/დღე)</span>
            <div className="text-base sm:text-lg font-bold font-mono text-amber-400">
              {monthlyCigarettes} ₾ <span className="text-[10px] text-zinc-500 font-normal">/თვე</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-1">
            <span className="text-[11px] text-emerald-400 font-medium block">დღიური საკვების ლიმიტი</span>
            <div className="text-base sm:text-lg font-bold font-mono text-emerald-300">
              ~{liveDailyFood} ₾ <span className="text-[10px] text-emerald-400 font-normal">/დღე</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUNDAY EVENING EXPENSE CHECK-IN & RE-CALCULATION WIDGET */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950/20 border border-amber-600/40 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                კვირის საღამოს აღრიცხვა & გადათვლა
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                რამდენი დახარჯე ამ კვირაში?
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">კვირის გეგმიური ლიმიტი:</span>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
              ~{standardWeeklyTarget} ₾
            </span>
          </div>
        </div>

        {logSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{logSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleSundayCheckIn} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-4 space-y-1">
            <label className="text-[11px] font-semibold text-zinc-300 block">
              კვირაში ფაქტობრივად დახარჯული (₾):
            </label>
            <div className="relative">
              <input
                type="number"
                step="1"
                placeholder="მაგ. 240"
                value={inputActualSpent}
                onChange={(e) => setInputActualSpent(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-sm font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
              <span className="absolute right-3 top-2.5 text-xs text-zinc-500 font-bold">₾</span>
            </div>
          </div>

          <div className="sm:col-span-5 space-y-1">
            <label className="text-[11px] font-semibold text-zinc-300 block">
              შენიშვნა (სურვილისამებრ):
            </label>
            <input
              type="text"
              placeholder="მაგ. მარკეტი 180₾, სიგარეტი 49₾, შაბათს გასვლა"
              value={inputNote}
              onChange={(e) => setInputNote(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-950/40"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>აღრიცხვა & გადათვლა</span>
            </button>
          </div>
        </form>

        <p className="text-[11px] text-zinc-400 leading-relaxed">
          💡 <strong>როგორ მუშაობს:</strong> როცა კვირის საღამოს ჩაწერთ რეალურ ხარჯს, სისტემა მას გამოაკლებს მიმდინარე ბალანსს და დარჩენილ {daysUntilNext5th} დღეზე <strong>ხელახლა გადაიანგარიშებს</strong> დღიურ საკვებ ბიუჯეტს. თუ დაზოგავთ — დღიური ლიმიტი გაიზრდება, თუ გადახარჯავთ — დარჩენილი დღეები ავტომატურად შემცირდება, რომ 5 რიცხვამდე უპრობლემოდ მიხვიდეთ.
        </p>

        {/* Weekly Logs History Table if any */}
        {weeklyLogs.length > 0 && (
          <div className="pt-3 border-t border-zinc-850/80 space-y-2">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
              წინა კვირების ისტორია:
            </span>
            <div className="space-y-1.5">
              {weeklyLogs.map((log) => {
                const isSaved = log.difference >= 0;
                return (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
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

      {/* 3. 5-TH OF THE MONTH SALARY INPUT & REAL-TIME ALLOCATION CALCULATOR */}
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
              ეტაპობრივი დაქვითვა და განაწილება:
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

          {/* 1-Week Typical Schedule (ორშაბათი - კვირა) */}
          <div className="space-y-3 pt-2 border-t border-zinc-850">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              <span>1 ტიპური კვირის ზუსტი გაწერა (ორშაბათი – კვირა)</span>
              <span className="text-[11px] text-zinc-500 lowercase font-normal">კვირის საკვები: ~{weeklyFoodBudget} ₾</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
              {[
                { day: 'ორშაბათი', food: dailyFoodBudget, cig: 7, fun: 0 },
                { day: 'სამშაბათი', food: dailyFoodBudget, cig: 7, fun: 0 },
                { day: 'ოთხშაბათი', food: dailyFoodBudget, cig: 7, fun: 0 },
                { day: 'ხუთშაბათი', food: dailyFoodBudget, cig: 7, fun: 0 },
                { day: 'პარასკევი', food: dailyFoodBudget, cig: 7, fun: 0 },
                { day: 'შაბათი', food: dailyFoodBudget, cig: 7, fun: weekendBudget / 2 },
                { day: 'კვირა', food: dailyFoodBudget, cig: 7, fun: weekendBudget / 2 }
              ].map((d, i) => {
                const totalDay = (parseFloat(d.food) + d.cig + d.fun).toFixed(0);
                const isWeekend = i >= 5;
                return (
                  <div
                    key={d.day}
                    className={`p-2.5 rounded-xl border text-center space-y-1 ${
                      isWeekend
                        ? 'bg-cyan-950/20 border-cyan-800/40 text-cyan-300'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <span className="text-[10px] font-bold block truncate">{d.day}</span>
                    <div className="text-sm font-bold font-mono text-white">{totalDay} ₾</div>
                    <div className="text-[9px] text-zinc-500 space-y-0.5">
                      <div>საკვები: {parseFloat(d.food).toFixed(0)}₾</div>
                      <div>სიგარეტი: {d.cig}₾</div>
                      {d.fun > 0 && <div className="text-cyan-400 font-bold">გართობა: {d.fun}₾</div>}
                    </div>
                  </div>
                );
              })}
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
