import React, { useState, useEffect } from 'react';
import { FinancialProfile, UserAuth } from '../types/financial';
import {
  calculateHealthScore,
  calculateSafeToSpend,
  formatINR,
} from '../utils/financialCalculations';
import {
  ChevronRight,
  HelpCircle,
  Sparkles,
  Plus,
  ArrowUpRight,
  Shield,
  Coins,
  Receipt,
  PiggyBank,
  CreditCard,
  X,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface HomeScreenProps {
  user: UserAuth;
  profile: FinancialProfile;
  onNavigateTab: (tab: string, subTab?: string) => void;
  onOpenProgressiveModal: () => void;
  onQuickAddCash: () => void;
  onDismissCashReminder: () => void;
  showCashReminder: boolean;
  triggerSafeToSpendModal?: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  profile,
  onNavigateTab,
  onOpenProgressiveModal,
  onQuickAddCash,
  onDismissCashReminder,
  showCashReminder,
  triggerSafeToSpendModal,
}) => {
  const [showCalculationModal, setShowCalculationModal] = useState(false);

  useEffect(() => {
    if (triggerSafeToSpendModal && triggerSafeToSpendModal > 0) {
      setShowCalculationModal(true);
    }
  }, [triggerSafeToSpendModal]);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const safeToSpendData = calculateSafeToSpend(profile);
  const healthData = calculateHealthScore(profile);
  const firstName = user.name.split(' ')[0] || 'Friend';

  const totalLoanEmi = profile.loans.reduce((sum, l) => sum + l.emi, 0);

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 sm:px-6 pt-4">
      {/* 1. Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Here is your financial clarity snapshot for this month.
          </p>
        </div>

        {/* Quick Cash Entry Button */}
        <button
          type="button"
          onClick={onQuickAddCash}
          className="self-start sm:self-auto inline-flex items-center gap-2 py-2 px-3.5 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all active:scale-[0.99]"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-600" />
          <span>Add Cash Expense</span>
        </button>
      </div>

      {/* Optional Dismissible Evening Cash Reminder */}
      {showCashReminder && (
        <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-amber-900 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold block">Did you spend any cash today?</span>
              <span className="text-amber-800">
                Log quick chai, auto-rickshaw, or vegetable cash expenses in 5 seconds.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onQuickAddCash}
              className="py-1.5 px-3 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors text-xs"
            >
              Log Cash
            </button>
            <button
              onClick={onDismissCashReminder}
              className="p-1 text-amber-500 hover:text-amber-700"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Financial Health Snapshot Card */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_10px_24px_-8px_rgba(0,0,0,0.02)] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Financial Health Snapshot
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {healthData.totalScore}
              </span>
              <span className="text-lg font-bold text-slate-400">/ 100</span>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ml-1">
                Healthy Foundation
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('money', 'blueprint')}
            className="self-start sm:self-auto text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
          >
            <span>View Financial Blueprint</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Health commentary */}
        <p className="text-sm text-slate-600 leading-relaxed mb-5 max-w-2xl">
          “{healthData.summary}”
        </p>

        {/* 4 Pillars Mini Indicator Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100">
          <div>
            <div className="text-[11px] text-slate-400">Spending Balance</div>
            <div className="text-xs font-bold text-slate-800 mt-0.5">
              {healthData.factors.spendingBalance.score} / 25
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">
              {healthData.factors.spendingBalance.status}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Safety Buffer</div>
            <div className="text-xs font-bold text-slate-800 mt-0.5">
              {healthData.factors.emergencyReadiness.score} / 25
            </div>
            <div className="text-[11px] text-indigo-600 font-medium">
              {healthData.factors.emergencyReadiness.status}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Debt Pressure</div>
            <div className="text-xs font-bold text-slate-800 mt-0.5">
              {healthData.factors.debtLoad.score} / 25
            </div>
            <div className="text-[11px] text-slate-700 font-medium">
              {healthData.factors.debtLoad.status}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Goals Momentum</div>
            <div className="text-xs font-bold text-slate-800 mt-0.5">
              {healthData.factors.savingsMomentum.score} / 25
            </div>
            <div className="text-[11px] text-slate-700 font-medium">
              {healthData.factors.savingsMomentum.status}
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Core Hero: SAFE TO SPEND */}
      <section className="bg-gradient-to-br from-indigo-50/90 via-white to-sky-50/50 rounded-3xl p-6 sm:p-8 border border-indigo-100/80 shadow-[0_4px_20px_-4px_rgba(79,70,229,0.06)] relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xs font-bold tracking-wider uppercase text-indigo-900">
              SAFE TO SPEND THIS MONTH
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowCalculationModal(true)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 hover:underline"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How is this calculated?</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-3">
          <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            {formatINR(safeToSpendData.safeToSpend)}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            remaining unallocated cash flow
          </span>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
          You can comfortably spend approximately{' '}
          <strong className="text-slate-900 font-bold">
            {formatINR(safeToSpendData.safeToSpend)}
          </strong>{' '}
          this month while staying on track with your essential commitments, loan EMIs, and wealth goals.
        </p>
      </section>

      {/* 4. FINANCIAL SNAPSHOT (Clean Card Overview) */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-slate-900">Monthly Snapshot</h2>
          <span className="text-xs text-slate-600">Tap cards to explore</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Income */}
          <button
            type="button"
            onClick={() => onNavigateTab('money', 'income')}
            className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] text-left hover:border-indigo-200 transition-all group min-w-0 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600 font-medium truncate">Income</span>
              <Receipt className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform flex-shrink-0" />
            </div>
            <div className="text-base sm:text-lg font-extrabold text-slate-900 tabular-nums truncate block" title={formatINR(profile.monthlyIncome)}>
              {formatINR(profile.monthlyIncome)}
            </div>
            <span className="text-[11px] text-slate-500 block mt-1 truncate">
              {profile.incomeSources.length} source{profile.incomeSources.length !== 1 ? 's' : ''}
            </span>
          </button>

          {/* Expenses */}
          <button
            type="button"
            onClick={() => onNavigateTab('money', 'expenses')}
            className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] text-left hover:border-indigo-200 transition-all group min-w-0 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600 font-medium truncate">Expenses</span>
              <Coins className="w-4 h-4 text-slate-500 group-hover:scale-110 transition-transform flex-shrink-0" />
            </div>
            <div className="text-base sm:text-lg font-extrabold text-slate-900 tabular-nums truncate block" title={formatINR(profile.monthlyExpenses)}>
              {formatINR(profile.monthlyExpenses)}
            </div>
            <span className="text-[11px] text-slate-500 block mt-1 truncate">
              Estimated / Month
            </span>
          </button>

          {/* Savings */}
          <button
            type="button"
            onClick={() => onNavigateTab('money', 'savings')}
            className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] text-left hover:border-indigo-200 transition-all group min-w-0 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600 font-medium truncate">Savings</span>
              <PiggyBank className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform flex-shrink-0" />
            </div>
            <div className="text-base sm:text-lg font-extrabold text-slate-900 tabular-nums truncate block" title={formatINR(profile.currentSavings)}>
              {formatINR(profile.currentSavings)}
            </div>
            <span className="text-[11px] text-indigo-700 font-medium block mt-1 truncate">
              {(profile.currentSavings / (profile.monthlyExpenses || 1)).toFixed(1)} mo buffer
            </span>
          </button>

          {/* Loans */}
          <button
            type="button"
            onClick={() => onNavigateTab('money', 'loans')}
            className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] text-left hover:border-indigo-200 transition-all group min-w-0 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600 font-medium truncate">Loans EMI</span>
              <CreditCard className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform flex-shrink-0" />
            </div>
            <div className="text-base sm:text-lg font-extrabold text-slate-900 tabular-nums truncate block" title={formatINR(totalLoanEmi)}>
              {formatINR(totalLoanEmi)}
            </div>
            <span className="text-[11px] text-slate-500 block mt-1 truncate">
              {profile.loans.length === 0
                ? 'No active loans'
                : `${profile.loans.length} active loan${profile.loans.length > 1 ? 's' : ''}`}
            </span>
          </button>
        </div>
      </section>

      {/* 4B. Quick Wealth Intelligence Hub: Salary Spending, Borrowing Power, Smart Credit & Stocks */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Salary Spending */}
        <button
          type="button"
          onClick={() => onNavigateTab('money', 'salary_spend')}
          className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/40 border border-indigo-100/90 text-left hover:border-indigo-300 transition-all flex flex-col justify-between group shadow-2xs cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-indigo-700 font-bold mb-1.5">
              <span>Salary Blueprint</span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
              How to Spend Salary
            </h3>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              50/30/20 breakdown for your {formatINR(profile.monthlyIncome)} salary: needs, wants & wealth.
            </p>
          </div>
          <span className="text-[11px] font-bold text-indigo-600 mt-3 flex items-center gap-1">
            <span>View Spending Plan</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </button>

        {/* Card 2: Loan Borrowing Power */}
        <button
          type="button"
          onClick={() => onNavigateTab('money', 'loans')}
          className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/40 border border-emerald-100/90 text-left hover:border-emerald-300 transition-all flex flex-col justify-between group shadow-2xs cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-emerald-800 font-bold mb-1.5">
              <span>Borrowing Capacity</span>
              <CreditCard className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
              How Much Loan Can You Take?
            </h3>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              Max eligible home, personal & car loan limits calculated according to your monthly salary.
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 mt-3 flex items-center gap-1">
            <span>Calculate Eligibility</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </button>

        {/* Card 3: Smart Credit & Cards */}
        <button
          type="button"
          onClick={() => onNavigateTab('money', 'credit')}
          className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/40 border border-amber-100/90 text-left hover:border-amber-300 transition-all flex flex-col justify-between group shadow-2xs cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-amber-900 font-bold mb-1.5">
              <span>Smart Credit Intel</span>
              <Shield className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-amber-800 transition-colors">
              Best Credit Cards for You
            </h3>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              Tailored credit cards for your salary tier & 4 golden rules to spend smartly without interest.
            </p>
          </div>
          <span className="text-[11px] font-bold text-amber-800 mt-3 flex items-center gap-1">
            <span>Explore Cards & Rules</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </button>

        {/* Card 4: Stocks & Indian Markets */}
        <button
          type="button"
          onClick={() => onNavigateTab('stocks')}
          className="p-4 rounded-2xl bg-gradient-to-br from-sky-50/80 to-indigo-50/40 border border-sky-100/90 text-left hover:border-sky-300 transition-all flex flex-col justify-between group shadow-2xs cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between text-xs text-sky-900 font-bold mb-1.5">
              <span>Live Markets</span>
              <TrendingUp className="w-3.5 h-3.5 text-sky-600 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-sky-700 transition-colors">
              Stocks & Investments
            </h3>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              Live Nifty 50, BSE Sensex, stock fundamentals, competitor benchmarking & portfolio tracker.
            </p>
          </div>
          <span className="text-[11px] font-bold text-sky-800 mt-3 flex items-center gap-1">
            <span>Open Stocks Hub</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </button>
      </section>

      {/* 5. "WHAT MATTERS NOW?" (Top 1–3 Prioritized Actions) */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">What matters now?</h2>
            <p className="text-xs text-slate-500">
              Prioritized by financial impact, not noisy notification feeds.
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-600">
            {healthData.prioritizedActions.length} Action{healthData.prioritizedActions.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="space-y-3">
          {healthData.prioritizedActions.map((action, idx) => (
            <div
              key={action.id}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    {idx + 1}. {action.title}
                  </span>
                  {action.urgency === 'high' && (
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      Safety Priority
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                  {action.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (action.tabTarget === 'goals') onNavigateTab('goals');
                  else if (action.tabTarget === 'money_loans') onNavigateTab('money', 'loans');
                  else if (action.tabTarget === 'money_investments') onNavigateTab('money', 'investments');
                  else onNavigateTab('money');
                }}
                className="self-start sm:self-auto flex-shrink-0 py-2 px-4 rounded-xl bg-white border border-slate-200 text-slate-800 hover:text-indigo-600 hover:border-indigo-300 text-xs font-semibold shadow-2xs transition-all flex items-center gap-1"
              >
                <span>{action.buttonText}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Contextual Progressive Personalization Card */}
      {!profile.progressiveDetails?.insuranceHealthCover && (
        <section className="bg-indigo-50/40 border border-indigo-100 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Make Wello more personal</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Want more accurate recommendations?
            </h3>
            <p className="text-xs text-slate-600">
              Add your age, monthly SIPs, or insurance details so Wello can tailor your safety buffers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenProgressiveModal}
              className="py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-colors shadow-2xs"
            >
              Add Details
            </button>
          </div>
        </section>
      )}

      {/* 7. Ask Wello Teaser Quick Prompt */}
      <section className="p-5 rounded-3xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-indigo-600 mb-0.5">
            Ask Wello · Your AI Wealth Manager
          </div>
          <div className="text-sm font-semibold text-slate-800">
            Have a financial decision on your mind today?
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            e.g. “Can I afford a ₹50,000 phone?” or “How much should I save every month?”
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('ask')}
          className="self-start sm:self-auto py-2.5 px-4 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors flex items-center gap-1.5"
        >
          <span>Open Ask Wello</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </section>

      {/* Calculation Modal: "How is Safe-to-Spend calculated?" */}
      {showCalculationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowCalculationModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              How Safe-to-Spend is Calculated
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              A transparent formula that keeps your essential needs and goals fully funded first.
            </p>

            <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between font-semibold">
                <span>Monthly Inflow (Income)</span>
                <span className="text-slate-900">
                  +{formatINR(safeToSpendData.monthlyIncome)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>− Essential Living Expenses</span>
                <span className="text-rose-600">
                  −{formatINR(safeToSpendData.essentialExpenses)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>− Total Monthly Loan EMIs</span>
                <span className="text-rose-600">
                  −{formatINR(safeToSpendData.loanEmis)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>− Planned Savings & SIP Goals</span>
                <span className="text-indigo-600">
                  −{formatINR(safeToSpendData.plannedSavings)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>− Safety Cash Buffer</span>
                <span className="text-slate-500">
                  −{formatINR(safeToSpendData.bufferMargin)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-sm text-slate-900">
                <span>= Safe to Spend</span>
                <span className="text-indigo-600">
                  {formatINR(safeToSpendData.safeToSpend)}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-4 leading-relaxed">
              This guarantees you can treat yourself or handle everyday discretionary spending without touching your rent, EMI payments, emergency cushion, or investments.
            </p>

            <button
              type="button"
              onClick={() => setShowCalculationModal(false)}
              className="w-full mt-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
