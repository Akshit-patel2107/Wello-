import React, { useState } from 'react';
import { FinancialProfile } from '../types/financial';
import { formatINR } from '../utils/financialCalculations';
import {
  PieChart,
  ShieldCheck,
  TrendingUp,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

interface SalarySpendingAdvisorProps {
  profile: FinancialProfile;
  onNavigateToTab?: (tab: string, subTab?: string) => void;
  onOpenProgressiveModal?: () => void;
}

export const SalarySpendingAdvisor: React.FC<SalarySpendingAdvisorProps> = ({
  profile,
  onNavigateToTab,
  onOpenProgressiveModal,
}) => {
  const [framework, setFramework] = useState<'50-30-20' | '40-30-30' | '60-20-20'>('50-30-20');

  // Base income and optional spouse/family income
  const baseSalary = profile.monthlyIncome || 75000;
  const spouseIncome = profile.progressiveDetails?.spouseIncome || 0;
  const familyIncome = profile.progressiveDetails?.familyIncome || 0;
  const hasHouseholdIncome = Boolean(
    (profile.progressiveDetails?.hasSpouseIncome && spouseIncome > 0) ||
    (profile.progressiveDetails?.hasFamilyIncome && familyIncome > 0)
  );
  const totalHouseholdIncome = baseSalary + (profile.progressiveDetails?.includeFamilyInCalculations !== false ? (spouseIncome + familyIncome) : 0);

  const [useHouseholdSalary, setUseHouseholdSalary] = useState(hasHouseholdIncome);
  const activeSalary = useHouseholdSalary && hasHouseholdIncome ? totalHouseholdIncome : baseSalary;

  // Framework ratios
  const ratios = {
    '50-30-20': {
      needsPct: 50,
      wantsPct: 30,
      savingsPct: 20,
      label: 'Balanced 50/30/20 Rule',
      desc: 'The gold standard of personal finance: 50% essentials, 30% lifestyle, 20% future wealth.',
    },
    '40-30-30': {
      needsPct: 40,
      wantsPct: 30,
      savingsPct: 30,
      label: 'Wealth Builder 40/30/30',
      desc: 'Accelerated FIRE path for aggressive compounding and early financial independence.',
    },
    '60-20-20': {
      needsPct: 60,
      wantsPct: 20,
      savingsPct: 20,
      label: 'Family Care 60/20/20',
      desc: 'Designed for households with children, elderly parents, or high urban rental commitments.',
    },
  }[framework];

  // Recommended allocations
  const targetNeeds = Math.round(activeSalary * (ratios.needsPct / 100));
  const targetWants = Math.round(activeSalary * (ratios.wantsPct / 100));
  const targetSavings = Math.round(activeSalary * (ratios.savingsPct / 100));

  // Actual numbers from profile
  const totalLoanEmi = profile.loans.reduce((sum, l) => sum + l.emi, 0);
  const essentialBills = (profile.expenseCategories.Bills || 0) + (profile.expenseCategories.Transport || 0) + (profile.expenseCategories.Health || 0) + (profile.expenseCategories.Education || 0);
  const foodShare = (profile.expenseCategories.Food || 0) * 0.7; // ~70% of food is home groceries
  const actualNeeds = Math.round(essentialBills + foodShare + totalLoanEmi);

  const leisureFood = (profile.expenseCategories.Food || 0) * 0.3; // ~30% dining out
  const actualWants = Math.round((profile.expenseCategories.Shopping || 0) + (profile.expenseCategories.Entertainment || 0) + (profile.expenseCategories.Other || 0) + leisureFood);

  const actualMonthlyInvestments = profile.progressiveDetails?.monthlySipTotal || 10000;
  const actualSavings = Math.max(0, activeSalary - profile.monthlyExpenses - totalLoanEmi);

  // Percentages of actual salary
  const actualNeedsPct = activeSalary > 0 ? Math.round((actualNeeds / activeSalary) * 100) : 0;
  const actualWantsPct = activeSalary > 0 ? Math.round((actualWants / activeSalary) * 100) : 0;
  const actualSavingsPct = Math.max(0, 100 - actualNeedsPct - actualWantsPct);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Smart Salary Spending Advisor</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              How to Spend Your Noted Salary of {formatINR(activeSalary)}
            </h2>
            <p className="text-xs text-indigo-200/80 mt-1 max-w-xl">
              Wello converts your monthly salary into a structured, anxiety-free spending blueprint. Pay essentials first, enjoy lifestyle guilt-free, and automate wealth building.
            </p>
          </div>

          {/* Household income toggle */}
          {hasHouseholdIncome && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 flex flex-col gap-1.5 self-start sm:self-auto min-w-[200px]">
              <div className="text-[11px] text-indigo-200 font-medium">Household Inflow</div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-white tabular-nums">
                  {formatINR(totalHouseholdIncome)}/mo
                </span>
                <button
                  type="button"
                  onClick={() => setUseHouseholdSalary(!useHouseholdSalary)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                    useHouseholdSalary ? 'bg-indigo-500 text-white' : 'bg-white/20 text-indigo-200 hover:bg-white/30'
                  }`}
                >
                  {useHouseholdSalary ? 'Combined' : 'Individual'}
                </button>
              </div>
            </div>
          )}

          {!hasHouseholdIncome && onOpenProgressiveModal && (
            <button
              type="button"
              onClick={onOpenProgressiveModal}
              className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/20 transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              <span>+ Add Spouse/Family Income</span>
            </button>
          )}
        </div>

        {/* Framework Selector Pills */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-xs text-indigo-200/80 mr-1 font-medium">Select Framework:</span>
          {(['50-30-20', '40-30-30', '60-20-20'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFramework(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                framework === f
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'bg-white/10 text-white/80 hover:bg-white/15'
              }`}
            >
              {f === '50-30-20' ? '50-30-20 (Classic)' : f === '40-30-30' ? '40-30-30 (Wealth Focus)' : '60-20-20 (Family Care)'}
            </button>
          ))}
        </div>
      </div>

      {/* 3 Pillars Allocation Cards (Square / Perfect Box Proportion) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: Needs / Essentials */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pillar 1 · Needs ({ratios.needsPct}%)
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                50%
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                {formatINR(targetNeeds)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Recommended monthly cap
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
              <div className="font-semibold text-slate-800">What belongs here:</div>
              <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
                <li>House rent or Home Loan EMI</li>
                <li>Groceries, milk & household supplies</li>
                <li>Electricity, water, Wi-Fi & phone bills</li>
                <li>Health & term insurance premiums</li>
                <li>Child school fees & daily commute</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Your Current Needs:</span>
            <span className={`font-bold tabular-nums ${actualNeedsPct > ratios.needsPct ? 'text-amber-600' : 'text-emerald-600'}`}>
              {formatINR(actualNeeds)} ({actualNeedsPct}%)
            </span>
          </div>
        </div>

        {/* Pillar 2: Wants / Lifestyle */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pillar 2 · Wants ({ratios.wantsPct}%)
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                30%
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                {formatINR(targetWants)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Guilt-free Safe to Spend
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
              <div className="font-semibold text-slate-800">What belongs here:</div>
              <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
                <li>Dining out, Swiggy / Zomato deliveries</li>
                <li>Shopping, clothing, gadget upgrades</li>
                <li>Weekend movies & OTT subscriptions</li>
                <li>Gym memberships & hobbies</li>
                <li>Vacations & weekend getaways</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Your Current Wants:</span>
            <span className={`font-bold tabular-nums ${actualWantsPct > ratios.wantsPct ? 'text-amber-600' : 'text-emerald-600'}`}>
              {formatINR(actualWants)} ({actualWantsPct}%)
            </span>
          </div>
        </div>

        {/* Pillar 3: Wealth Building & Future */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pillar 3 · Wealth ({ratios.savingsPct}%)
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                20%
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                {formatINR(targetSavings)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Automated monthly wealth creation
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
              <div className="font-semibold text-slate-800">What belongs here:</div>
              <ul className="space-y-1 text-[11px] text-slate-600 list-disc list-inside">
                <li>Emergency safety fund buffer (Liquid / FD)</li>
                <li>Nifty 50 & Flexicap Mutual Fund SIPs</li>
                <li>PPF / EPF / Voluntary PF / NPS</li>
                <li>Sovereign Gold Bonds / Digital Gold</li>
                <li>Pre-paying expensive high-rate loans</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Your Savings & Surplus:</span>
            <span className={`font-bold tabular-nums ${actualSavingsPct >= ratios.savingsPct ? 'text-emerald-600' : 'text-amber-600'}`}>
              {formatINR(actualSavings)} ({actualSavingsPct}%)
            </span>
          </div>
        </div>
      </div>

      {/* Visual Allocation Bar Comparison */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
          <span>Allocation Comparison: Recommended Target vs. Your Actuals</span>
          <span className="text-xs font-normal text-slate-500">Based on {ratios.label}</span>
        </h3>

        {/* Target Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
            <span className="font-semibold">Recommended Blueprint:</span>
            <span className="tabular-nums font-bold text-slate-900">{formatINR(activeSalary)}</span>
          </div>
          <div className="h-6 w-full rounded-xl bg-slate-100 flex overflow-hidden p-0.5 gap-0.5">
            <div
              style={{ width: `${ratios.needsPct}%` }}
              className="bg-amber-400 rounded-l-lg flex items-center justify-center text-[10px] font-bold text-amber-950 px-1 truncate"
              title={`Needs: ${ratios.needsPct}% (${formatINR(targetNeeds)})`}
            >
              Needs {ratios.needsPct}% ({formatINR(targetNeeds)})
            </div>
            <div
              style={{ width: `${ratios.wantsPct}%` }}
              className="bg-indigo-400 flex items-center justify-center text-[10px] font-bold text-indigo-950 px-1 truncate"
              title={`Wants: ${ratios.wantsPct}% (${formatINR(targetWants)})`}
            >
              Wants {ratios.wantsPct}% ({formatINR(targetWants)})
            </div>
            <div
              style={{ width: `${ratios.savingsPct}%` }}
              className="bg-emerald-400 rounded-r-lg flex items-center justify-center text-[10px] font-bold text-emerald-950 px-1 truncate"
              title={`Wealth: ${ratios.savingsPct}% (${formatINR(targetSavings)})`}
            >
              Wealth {ratios.savingsPct}% ({formatINR(targetSavings)})
            </div>
          </div>
        </div>

        {/* Actual Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
            <span className="font-semibold">Your Actual Outflow:</span>
            <span className="tabular-nums font-bold text-slate-900">
              Needs {actualNeedsPct}% · Wants {actualWantsPct}% · Surplus {actualSavingsPct}%
            </span>
          </div>
          <div className="h-6 w-full rounded-xl bg-slate-100 flex overflow-hidden p-0.5 gap-0.5">
            <div
              style={{ width: `${Math.min(100, actualNeedsPct)}%` }}
              className="bg-amber-500 rounded-l-lg flex items-center justify-center text-[10px] font-bold text-white px-1 truncate"
            >
              Needs {actualNeedsPct}%
            </div>
            <div
              style={{ width: `${Math.min(100 - actualNeedsPct, actualWantsPct)}%` }}
              className="bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white px-1 truncate"
            >
              Wants {actualWantsPct}%
            </div>
            <div
              style={{ width: `${Math.max(0, 100 - actualNeedsPct - actualWantsPct)}%` }}
              className="bg-emerald-500 rounded-r-lg flex items-center justify-center text-[10px] font-bold text-white px-1 truncate"
            >
              Surplus {actualSavingsPct}%
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Rules & Suggestions */}
      <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Wello Salary Spending Rules & Action Steps
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white rounded-xl border border-slate-200/60 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>1. Pay Yourself First (Day 1 Automation)</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Set auto-debit SIPs for your {formatINR(targetSavings)} target on the 5th of every month right after salary credit. Do not save what is left after spending; spend what is left after saving.
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200/60 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>2. Separate Spending Account Hack</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Transfer your {formatINR(targetWants)} Safe-to-Spend allocation into a zero-fee secondary digital account (e.g. Jupiter, Fi, or separate UPI handle) on salary day. When that balance hits zero, pause discretionary spending until next month.
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200/60 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
              <span>3. Fixed Debt EMI Ceiling</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Never allow total debt EMIs to exceed 35% of your net income ({formatINR(activeSalary * 0.35)}). Keep existing EMIs well below this threshold to protect cash flow.
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200/60 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
              <span>4. 3-Month Emergency Shield</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Direct your 20% savings first toward accumulating at least 3 to 6 months of essential living expenses ({formatINR(targetNeeds * 3)}) in an auto-sweep bank account before taking high market risk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
