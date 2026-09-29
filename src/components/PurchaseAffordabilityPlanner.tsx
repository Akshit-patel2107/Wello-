import React, { useState } from 'react';
import { FinancialProfile } from '../types/financial';
import { formatINR } from '../utils/financialCalculations';
import {
  Sparkles,
  ShoppingBag,
  Calculator,
  Percent,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react';

interface PurchaseAffordabilityPlannerProps {
  profile: FinancialProfile;
}

export const PurchaseAffordabilityPlanner: React.FC<PurchaseAffordabilityPlannerProps> = ({
  profile,
}) => {
  const userSalary = profile.monthlyIncome || 75000;
  const userExpenses = profile.monthlyExpenses || 40000;
  const existingEmis = profile.loans.reduce((sum, l) => sum + l.emi, 0);
  const userEmergencyFund = profile.emergencyFund || profile.currentSavings * 0.5;

  // Preset items
  const presets = [
    { name: 'iPhone 16 Pro (256GB)', cost: 134900, down: 25000, tenure: 12, rate: 0, tag: '0% No-Cost EMI' },
    { name: 'Royal Enfield Hunter 350', cost: 185000, down: 40000, tenure: 24, rate: 10.5, tag: 'Auto Loan' },
    { name: 'MacBook Pro M3', cost: 169900, down: 30000, tenure: 12, rate: 0, tag: '0% No-Cost EMI' },
    { name: '2BHK Flat Down Payment', cost: 1500000, down: 500000, tenure: 36, rate: 9.0, tag: 'Down Payment' },
    { name: 'Europe Holiday Trip', cost: 250000, down: 50000, tenure: 12, rate: 12.0, tag: 'Travel Outlay' },
    { name: '55" OLED 4K Cinema TV', cost: 95000, down: 15000, tenure: 9, rate: 0, tag: 'Consumer Durable' },
  ];

  const [itemName, setItemName] = useState<string>('iPhone 16 Pro (256GB)');
  const [totalCost, setTotalCost] = useState<number>(134900);
  const [downPayment, setDownPayment] = useState<number>(25000);
  const [tenureMonths, setTenureMonths] = useState<number>(12);
  const [interestRate, setInterestRate] = useState<number>(0);

  // AI response state
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Quick Preset Selection
  const applyPreset = (preset: typeof presets[0]) => {
    setItemName(preset.name);
    setTotalCost(preset.cost);
    setDownPayment(preset.down);
    setTenureMonths(preset.tenure);
    setInterestRate(preset.rate);
    setAiAnalysis(null);
  };

  // Financial Calculations
  const principal = Math.max(0, totalCost - downPayment);
  let monthlyEmi = 0;
  let totalInterest = 0;

  if (interestRate === 0 || principal === 0) {
    monthlyEmi = Math.round(principal / Math.max(1, tenureMonths));
    totalInterest = 0;
  } else {
    const monthlyRate = interestRate / 12 / 100;
    const factor = Math.pow(1 + monthlyRate, tenureMonths);
    monthlyEmi = Math.round((principal * monthlyRate * factor) / (factor - 1));
    totalInterest = Math.max(0, Math.round(monthlyEmi * tenureMonths - principal));
  }

  // Required Salary Benchmarks
  // Conservative: EMI should not exceed 10% of gross monthly salary
  // Moderate: EMI should not exceed 15% of gross monthly salary
  const requiredSalaryConservative = Math.round(monthlyEmi / 0.10);
  const requiredSalaryModerate = Math.round(monthlyEmi / 0.15);

  // Cash purchase saving timeline
  const monthlySurplus = Math.max(0, userSalary - userExpenses - existingEmis);
  const suggestedCashMonths = monthlySurplus > 0 ? Math.ceil(totalCost / monthlySurplus) : Math.ceil(totalCost / 15000);

  // Affordability Readiness vs User's actual salary
  const emiShareOfUserSalary = userSalary > 0 ? (monthlyEmi / userSalary) * 100 : 0;
  const affordabilityStatus =
    emiShareOfUserSalary > 20 || (existingEmis + monthlyEmi) / (userSalary || 1) > 0.50
      ? 'High Risk / Unadvised'
      : emiShareOfUserSalary > 12
      ? 'Manageable Stretch'
      : 'Comfortable & Safe';

  // Trigger Gemini AI evaluation
  const handleAskAi = async () => {
    setIsLoadingAi(true);
    setAiAnalysis(null);
    try {
      const res = await fetch('/api/wello/affordability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName,
          totalCost,
          downPayment,
          interestRate,
          tenureMonths,
          userSalary,
          userExpenses,
          existingEmis,
          userEmergencyFund,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.aiVerdict) {
        setAiAnalysis(data.data.aiVerdict);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-purple-200 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>AI Purchase Feasibility & Target Salary Planner</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Can I Afford This? How Much Do I Need to Earn?
            </h2>
            <p className="text-xs text-purple-200/80 mt-1 max-w-xl">
              Thinking of buying something special? Enter the price and interest to instantly calculate the monthly EMI, required salary according to interest rates, and get Wello AI's verdict.
            </p>
          </div>

          <div className="bg-white/10 rounded-2xl p-3 border border-white/15 self-start sm:self-auto min-w-[190px]">
            <span className="text-[10px] text-purple-200 block uppercase font-medium">Your Current Salary</span>
            <span className="text-base sm:text-lg font-extrabold text-white tabular-nums block mt-0.5">
              {formatINR(userSalary)} <span className="text-xs font-normal text-purple-200">/ mo</span>
            </span>
          </div>
        </div>

        {/* Quick Presets Carousel */}
        <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
          <span className="text-xs text-purple-200 font-medium">Quick Presets:</span>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {presets.map(p => (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  itemName === p.name
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <span>{p.name}</span>
                <span className="text-[10px] opacity-75">({formatINR(p.cost)})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Planner Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Inputs Column (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-indigo-600" />
            <span>Purchase & Loan Parameters</span>
          </h3>

          {/* Item Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">What are you buying?</label>
            <input
              type="text"
              value={itemName}
              onChange={e => setItemName(e.target.value)}
              placeholder="e.g. iPhone 16 Pro, Royal Enfield, Vacation"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Total Cost & Down Payment Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Total Price (₹)</label>
              <input
                type="number"
                value={totalCost}
                onChange={e => setTotalCost(Math.max(1000, Number(e.target.value)))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 tabular-nums"
              />
              <span className="text-[10px] text-slate-400 block">{formatINR(totalCost)}</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Down Payment (₹)</label>
              <input
                type="number"
                value={downPayment}
                onChange={e => setDownPayment(Math.max(0, Number(e.target.value)))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 tabular-nums"
              />
              <span className="text-[10px] text-slate-400 block">{formatINR(downPayment)}</span>
            </div>
          </div>

          {/* Tenure Slider */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">EMI Tenure</span>
              <span className="font-extrabold text-indigo-600 tabular-nums">{tenureMonths} Months</span>
            </div>
            <input
              type="range"
              min={3}
              max={60}
              step={3}
              value={tenureMonths}
              onChange={e => setTenureMonths(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>3 Months</span>
              <span>12 Mos (1 Yr)</span>
              <span>36 Mos (3 Yrs)</span>
              <span>60 Mos (5 Yrs)</span>
            </div>
          </div>

          {/* Interest Rate Selector & Input */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Interest Rate (% p.a.)</span>
              <span className="font-extrabold text-indigo-600 tabular-nums">
                {interestRate === 0 ? '0% (No-Cost EMI)' : `${interestRate.toFixed(1)}% p.a.`}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={24}
              step={0.5}
              value={interestRate}
              onChange={e => setInterestRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex items-center gap-1.5 pt-1">
              {[
                { label: '0% No-Cost', rate: 0 },
                { label: '9% Auto/Secured', rate: 9.0 },
                { label: '12% Personal', rate: 12.0 },
                { label: '16% Credit Card', rate: 16.0 },
              ].map(opt => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setInterestRate(opt.rate)}
                  className={`text-[10px] font-semibold py-1 px-2 rounded-lg border transition-all ${
                    interestRate === opt.rate
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ask Wello AI Button */}
          <button
            type="button"
            onClick={handleAskAi}
            disabled={isLoadingAi}
            className="w-full mt-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70"
          >
            {isLoadingAi ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Consulting Wello AI Wealth Engine...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-purple-200" />
                <span>Get Wello AI Wealth Verdict for This Purchase</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output Column (7 cols): Exact Required Salary & Feasibility Results */}
        <div className="lg:col-span-7 space-y-4">
          {/* Target Salary Card (Hero Output) */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Required Monthly Salary to Afford Safely
                </span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    affordabilityStatus === 'Comfortable & Safe'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : affordabilityStatus === 'Manageable Stretch'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {affordabilityStatus}
                </span>
              </div>

              <div>
                <div className="text-3xl sm:text-4xl font-black tracking-tight tabular-nums text-white">
                  {formatINR(requiredSalaryConservative)}
                  <span className="text-base sm:text-lg font-normal text-indigo-300"> / month</span>
                </div>
                <div className="text-xs text-indigo-200/80 mt-1">
                  At this salary, the ₹{monthlyEmi.toLocaleString('en-IN')}/mo EMI represents a safe 10% allocation.
                </div>
              </div>

              {/* 3 Perfect Metric Boxes */}
              <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-white/10 text-center sm:text-left">
                <div className="bg-white/5 rounded-2xl p-3 border border-white/10 min-w-0">
                  <div className="text-[10px] text-indigo-200 truncate">Monthly EMI</div>
                  <div className="text-sm sm:text-base font-extrabold text-white mt-0.5 tabular-nums truncate">
                    {formatINR(monthlyEmi)}/mo
                  </div>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 border border-white/10 min-w-0">
                  <div className="text-[10px] text-indigo-200 truncate">Total Interest Paid</div>
                  <div className="text-sm sm:text-base font-extrabold text-amber-300 mt-0.5 tabular-nums truncate">
                    {formatINR(totalInterest)}
                  </div>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 border border-white/10 min-w-0">
                  <div className="text-[10px] text-indigo-200 truncate">Your Salary Fit</div>
                  <div className="text-sm sm:text-base font-extrabold text-emerald-300 mt-0.5 tabular-nums truncate">
                    {emiShareOfUserSalary.toFixed(1)}% of Pay
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cash Alternative Box */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Debt-Free Cash Purchase Alternative:
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Save ₹{Math.round(totalCost / suggestedCashMonths).toLocaleString('en-IN')}/mo for {suggestedCashMonths} months in a liquid fund and save {formatINR(totalInterest)} in interest.
                </span>
              </div>
            </div>
            <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 flex-shrink-0">
              {suggestedCashMonths} Months
            </span>
          </div>

          {/* AI Response Card (Streamed or Loaded) */}
          {aiAnalysis && (
            <div className="bg-gradient-to-br from-indigo-50/90 to-purple-50/70 rounded-3xl p-5 sm:p-6 border border-indigo-100 shadow-xs animate-in fade-in duration-300 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950">
                  Wello AI Purchase Verdict
                </h4>
              </div>
              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line space-y-2">
                {aiAnalysis}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
