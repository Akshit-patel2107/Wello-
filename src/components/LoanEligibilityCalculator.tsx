import React, { useState } from 'react';
import { FinancialProfile } from '../types/financial';
import { formatINR } from '../utils/financialCalculations';
import {
  CreditCard,
  Home,
  Briefcase,
  Car,
  GraduationCap,
  ShieldAlert,
  ShieldCheck,
  Percent,
  Sliders,
  HelpCircle,
  CheckCircle2,
  Users,
  AlertCircle,
} from 'lucide-react';

interface LoanEligibilityCalculatorProps {
  profile: FinancialProfile;
  onOpenProgressiveModal?: () => void;
}

export const LoanEligibilityCalculator: React.FC<LoanEligibilityCalculatorProps> = ({
  profile,
  onOpenProgressiveModal,
}) => {
  // Base salary and family/spouse income
  const baseSalary = profile.monthlyIncome || 75000;
  const spouseIncome = profile.progressiveDetails?.spouseIncome || 0;
  const familyIncome = profile.progressiveDetails?.familyIncome || 0;
  const hasHouseholdIncome = Boolean(
    (profile.progressiveDetails?.hasSpouseIncome && spouseIncome > 0) ||
    (profile.progressiveDetails?.hasFamilyIncome && familyIncome > 0)
  );

  const [includeCoApplicant, setIncludeCoApplicant] = useState<boolean>(hasHouseholdIncome);
  const [selectedLoanType, setSelectedLoanType] = useState<'home' | 'personal' | 'car' | 'education'>('home');
  const [foirLimit, setFoirLimit] = useState<number>(50); // 50% max FOIR standard

  // Existing EMIs from profile
  const totalExistingEmi = profile.loans.reduce((sum, l) => sum + l.emi, 0);
  const [existingEmis, setExistingEmis] = useState<number>(totalExistingEmi);

  // Active monthly income
  const activeIncome = baseSalary + (includeCoApplicant ? (spouseIncome + familyIncome) : 0);

  // Loan parameters defaults by type
  const loanConfigs = {
    home: {
      title: 'Home Loan',
      icon: Home,
      defaultTenureYears: 20,
      maxTenureYears: 30,
      defaultRate: 8.50,
      minRate: 8.0,
      maxRate: 11.0,
      description: 'Long-term collateralized financing for residential property acquisition or construction.',
      typicalMultiplier: '55x – 65x monthly salary',
    },
    personal: {
      title: 'Personal Loan',
      icon: Briefcase,
      defaultTenureYears: 4,
      maxTenureYears: 5,
      defaultRate: 11.50,
      minRate: 10.0,
      maxRate: 18.0,
      description: 'Unsecured financing for immediate emergencies, medical outlays, or family events.',
      typicalMultiplier: '10x – 24x monthly salary',
    },
    car: {
      title: 'Car / Vehicle Loan',
      icon: Car,
      defaultTenureYears: 5,
      maxTenureYears: 7,
      defaultRate: 9.00,
      minRate: 8.5,
      maxRate: 12.0,
      description: 'Secured hypothecation loan against a new or certified pre-owned passenger vehicle.',
      typicalMultiplier: '3x – 4x annual salary',
    },
    education: {
      title: 'Education Loan',
      icon: GraduationCap,
      defaultTenureYears: 7,
      maxTenureYears: 10,
      defaultRate: 9.50,
      minRate: 8.5,
      maxRate: 13.0,
      description: 'Financing for undergraduate or master\'s programs in India or top global universities.',
      typicalMultiplier: 'Up to ₹50 Lakhs unsecured / ₹1.5 Cr secured',
    },
  };

  const currentConfig = loanConfigs[selectedLoanType];

  const [tenureYears, setTenureYears] = useState<number>(currentConfig.defaultTenureYears);
  const [interestRate, setInterestRate] = useState<number>(currentConfig.defaultRate);

  // Update when type switches
  const handleTypeSelect = (type: 'home' | 'personal' | 'car' | 'education') => {
    setSelectedLoanType(type);
    setTenureYears(loanConfigs[type].defaultTenureYears);
    setInterestRate(loanConfigs[type].defaultRate);
  };

  // 1. Calculate Maximum Permissible EMI under Bank FOIR
  const maxTotalEmiAllowed = Math.round(activeIncome * (foirLimit / 100));
  const netAvailableEmi = Math.max(0, maxTotalEmiAllowed - existingEmis);

  // 2. Reverse EMI to Principal calculation
  // EMI = P * r * (1+r)^n / ((1+r)^n - 1)
  // => P = EMI * ((1+r)^n - 1) / (r * (1+r)^n)
  const monthlyRate = interestRate / 12 / 100;
  const totalMonths = tenureYears * 12;
  const factor = Math.pow(1 + monthlyRate, totalMonths);
  const maxLoanAmount = netAvailableEmi > 0
    ? Math.round(netAvailableEmi * (factor - 1) / (monthlyRate * factor))
    : 0;

  // Debt Stress Level
  const currentEmiRatio = activeIncome > 0 ? (existingEmis / activeIncome) * 100 : 0;
  const stressLevel = currentEmiRatio > 50 ? 'High' : currentEmiRatio > 35 ? 'Moderate' : 'Healthy';

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>RBI & Indian Banking Underwriting Standards</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              How Much Loan Can You Take According to Salary?
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Banks assess borrowing power using your Net In-Hand Salary and Fixed Obligation to Income Ratio (FOIR). Existing EMIs are deducted to determine your safe borrowing capacity.
            </p>
          </div>

          {/* Co-applicant toggle */}
          {hasHouseholdIncome ? (
            <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-3.5 text-xs text-indigo-950 flex flex-col gap-1.5 self-start sm:self-auto min-w-[220px]">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Co-Applicant Mode</span>
                </span>
                <input
                  type="checkbox"
                  checked={includeCoApplicant}
                  onChange={e => setIncludeCoApplicant(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-indigo-800">
                {includeCoApplicant
                  ? `Includes spouse/family income (+${formatINR(spouseIncome + familyIncome)}/mo)`
                  : 'Individual salary only'}
              </p>
            </div>
          ) : onOpenProgressiveModal ? (
            <button
              type="button"
              onClick={onOpenProgressiveModal}
              className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Add Spouse Income to Boost Eligibility</span>
            </button>
          ) : null}
        </div>

        {/* Loan Type Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {(['home', 'personal', 'car', 'education'] as const).map(type => {
            const config = loanConfigs[type];
            const Icon = config.icon;
            const isSelected = selectedLoanType === type;
            return (
              <button
                key={type}
                onClick={() => handleTypeSelect(type)}
                className={`p-3 rounded-2xl text-left border transition-all flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-indigo-600'}`} />
                  {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                </div>
                <span className="text-xs font-bold">{config.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Calculation Output Box (High Emphasis) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Main Results Box */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Maximum Eligible {currentConfig.title} Amount
              </span>
              <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Safe Borrowing Limit
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black tracking-tight tabular-nums text-white">
                {formatINR(maxLoanAmount)}
              </span>
              <span className="text-xs text-indigo-200">
                at {interestRate}% for {tenureYears} years
              </span>
            </div>

            <p className="text-xs text-indigo-200/80 mt-2 leading-relaxed">
              Based on your net in-hand inflow of <strong className="text-white font-bold">{formatINR(activeIncome)}/mo</strong> and {foirLimit}% maximum bank FOIR ceiling.
            </p>
          </div>

          {/* Key Metrics Breakdown Row */}
          <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-white/10 text-center sm:text-left">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 min-w-0">
              <div className="text-[10px] text-indigo-200 truncate">Max Safe EMI</div>
              <div className="text-sm sm:text-base font-extrabold text-white mt-0.5 tabular-nums truncate">
                {formatINR(netAvailableEmi)}/mo
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 min-w-0">
              <div className="text-[10px] text-indigo-200 truncate">Existing EMIs</div>
              <div className="text-sm sm:text-base font-extrabold text-white mt-0.5 tabular-nums truncate">
                {formatINR(existingEmis)}/mo
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 min-w-0">
              <div className="text-[10px] text-indigo-200 truncate">Bank Multiplier</div>
              <div className="text-sm sm:text-base font-extrabold text-white mt-0.5 tabular-nums truncate">
                {activeIncome > 0 ? (maxLoanAmount / activeIncome).toFixed(0) : '0'}x Salary
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Debt Pressure Gauge */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Debt-to-Income Health
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {currentEmiRatio.toFixed(0)}%
              </span>
              <span className="text-xs font-semibold text-slate-500">current EMI load</span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden mt-3 flex">
              <div
                style={{ width: `${Math.min(100, currentEmiRatio)}%` }}
                className={`h-full transition-all ${
                  currentEmiRatio > 50 ? 'bg-rose-500' : currentEmiRatio > 35 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1.5 border border-slate-100">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              {stressLevel === 'Healthy' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600" />
              )}
              <span>Status: {stressLevel} Debt Margin</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {stressLevel === 'Healthy'
                ? 'Your existing loan EMIs consume less than 35% of your income. Banks view you as a prime low-risk borrower.'
                : stressLevel === 'Moderate'
                ? 'Existing EMIs are between 35% and 50%. You can qualify for additional loans, but discretionary savings will tighten.'
                : 'Your EMIs already exceed 50% of your earnings. Banks may reject new uncollateralized loans until existing loans are paid down.'}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Sliders */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-600" />
          <span>Fine-Tune Parameters for {currentConfig.title}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Slider 1: Loan Tenure */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Tenure (Years)</span>
              <span className="font-extrabold text-indigo-600 tabular-nums">
                {tenureYears} Years ({tenureYears * 12} mos)
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={currentConfig.maxTenureYears}
              step={1}
              value={tenureYears}
              onChange={e => setTenureYears(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1 Year</span>
              <span>{currentConfig.maxTenureYears} Years</span>
            </div>
          </div>

          {/* Slider 2: Interest Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Annual Interest Rate</span>
              <span className="font-extrabold text-indigo-600 tabular-nums">
                {interestRate.toFixed(2)}% p.a.
              </span>
            </div>
            <input
              type="range"
              min={currentConfig.minRate}
              max={currentConfig.maxRate}
              step={0.1}
              value={interestRate}
              onChange={e => setInterestRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{currentConfig.minRate}%</span>
              <span>{currentConfig.maxRate}%</span>
            </div>
          </div>

          {/* Slider 3: Max Bank FOIR */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Bank Max FOIR Limit</span>
              <span className="font-extrabold text-indigo-600 tabular-nums">
                {foirLimit}% of Income
              </span>
            </div>
            <input
              type="range"
              min={40}
              max={60}
              step={5}
              value={foirLimit}
              onChange={e => setFoirLimit(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>40% (Conservative)</span>
              <span>60% (High Inflow)</span>
            </div>
          </div>
        </div>

        {/* Existing EMIs Manual Adjustment */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-600">
            <span className="font-semibold">Existing Monthly Outflows / EMIs:</span>{' '}
            <span className="text-[11px] text-slate-500">(Auto-filled from your loans)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">₹</span>
            <input
              type="number"
              value={existingEmis}
              onChange={e => setExistingEmis(Math.max(0, Number(e.target.value)))}
              className="w-32 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
            />
            <span className="text-xs text-slate-500">/ mo</span>
          </div>
        </div>
      </div>

      {/* Bank Eligibility & Approval Checklist */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          Indian Bank Loan Approval Checklist & Criteria
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white rounded-xl border border-slate-200/60">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>CIBIL Score 750+</span>
            </div>
            <p className="text-[11px] text-slate-500">
              A score above 750 gets instant loan approvals and lowest benchmark interest rates (repo rate + 1.5%).
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200/60">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>2+ Yrs Experience</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Minimum 6 months with current employer and 2 years continuous employment stability.
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200/60">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Salary Slips & ITR</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Last 3 months salary slips, 6 months bank statement showing salary credit, and Form 16 / ITR.
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200/60">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Age 21 – 60 Yrs</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Borrower must reach loan maturity before retirement age (typically 60 for salaried, 65 for self-employed).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
