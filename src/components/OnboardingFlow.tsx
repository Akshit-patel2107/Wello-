import React, { useState } from 'react';
import { FinancialProfile, LoanItem, LoanType } from '../types/financial';
import { formatINR } from '../utils/financialCalculations';
import { ArrowRight, ArrowLeft, Check, Plus, Trash2, Shield, Sparkles } from 'lucide-react';
import { WelloLogo } from './Logo';

interface OnboardingFlowProps {
  userName: string;
  onComplete: (initialProfile: Partial<FinancialProfile>) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  userName,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Income
  const [primaryIncome, setPrimaryIncome] = useState<number>(75000);
  const [incomeSources, setIncomeSources] = useState<Array<{ id: string; name: string; amount: number }>>([
    { id: '1', name: 'Primary Salary / Income', amount: 75000 },
  ]);
  const [showMultipleSources, setShowMultipleSources] = useState(false);

  // Step 2: Expenses
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(42000);

  // Step 3: Savings
  const [currentSavings, setCurrentSavings] = useState<number>(120000);

  // Step 4: Loans
  const [loanSelection, setLoanSelection] = useState<LoanType>('no_loans');
  const [loanOutstanding, setLoanOutstanding] = useState<number>(350000);
  const [loanEmi, setLoanEmi] = useState<number>(8500);

  const totalCalculatedIncome = showMultipleSources
    ? incomeSources.reduce((sum, s) => sum + (s.amount || 0), 0)
    : primaryIncome;

  const handleNext = () => {
    if (step < 4) {
      setStep((step + 1) as any);
    } else {
      // Build initial profile
      const loans: LoanItem[] = [];
      if (loanSelection !== 'no_loans') {
        const typeNames: Record<LoanType, string> = {
          no_loans: 'None',
          home: 'Home Loan',
          education: 'Education Loan',
          personal: 'Personal Loan',
          vehicle: 'Vehicle Loan',
          credit_card: 'Credit Card Balance',
          other: 'Loan / Debt',
        };
        loans.push({
          id: 'loan_init',
          type: loanSelection,
          name: typeNames[loanSelection],
          outstanding: loanOutstanding,
          emi: loanEmi,
        });
      }

      const initialProfile: Partial<FinancialProfile> = {
        monthlyIncome: totalCalculatedIncome,
        incomeSources: showMultipleSources
          ? incomeSources
          : [{ id: 'primary', name: 'Household Income', amount: primaryIncome }],
        monthlyExpenses,
        expenseCategories: {
          Food: Math.round(monthlyExpenses * 0.32),
          Transport: Math.round(monthlyExpenses * 0.12),
          Shopping: Math.round(monthlyExpenses * 0.14),
          Bills: Math.round(monthlyExpenses * 0.22),
          Entertainment: Math.round(monthlyExpenses * 0.08),
          Education: Math.round(monthlyExpenses * 0.05),
          Health: Math.round(monthlyExpenses * 0.05),
          Other: Math.round(monthlyExpenses * 0.02),
        },
        currentSavings,
        emergencyFund: Math.round(currentSavings * 0.6), // initial reasonable assumption, expandable later
        loans,
        goals: [
          {
            id: 'init_emergency',
            type: 'emergency_fund',
            title: 'Emergency Safety Cushion',
            targetAmount: monthlyExpenses * 4,
            currentAmount: Math.round(currentSavings * 0.6),
            targetDate: '2027-03',
            monthlyContribution: Math.round(totalCalculatedIncome * 0.15),
          },
        ],
        investments: [],
        familyMembers: [],
        cashExpenses: [],
        progressiveDetails: {},
        dismissedPopups: [],
      };

      onComplete(initialProfile);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as any);
    }
  };

  const addIncomeSource = () => {
    setIncomeSources([
      ...incomeSources,
      { id: Date.now().toString(), name: 'Freelance / Rental / Other', amount: 15000 },
    ]);
  };

  const removeIncomeSource = (id: string) => {
    setIncomeSources(incomeSources.filter(s => s.id !== id));
  };

  const updateIncomeSource = (id: string, field: 'name' | 'amount', value: any) => {
    setIncomeSources(
      incomeSources.map(s => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] flex flex-col justify-between p-4 sm:p-6">
      {/* Header with step progress */}
      <header className="max-w-xl mx-auto w-full pt-4 pb-6 flex items-center justify-between">
        <WelloLogo size="sm" />
        
        {/* Step dots */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-7 bg-indigo-600'
                  : s < step
                  ? 'w-2 bg-emerald-500'
                  : 'w-2 bg-slate-200'
              }`}
            />
          ))}
          <span className="text-xs font-semibold text-slate-500 ml-2">
            Step {step} of 4
          </span>
        </div>
      </header>

      {/* Main card */}
      <main className="max-w-xl mx-auto w-full flex-1 flex flex-col justify-center">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          {/* STEP 1: INCOME */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 block mb-1">
                  1. Household Income
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  How much money comes into your household each month?
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Include salary, business income, or regular freelance earnings.
                </p>
              </div>

              {!showMultipleSources ? (
                <div className="space-y-4">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={primaryIncome || ''}
                      onChange={e => setPrimaryIncome(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-4 text-3xl font-extrabold text-slate-900 bg-slate-50/70 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                      placeholder="75000"
                    />
                  </div>

                  {/* Quick preset chips */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[35000, 50000, 75000, 100000, 150000, 250000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setPrimaryIncome(amt)}
                        className={`text-xs font-medium py-1.5 px-3 rounded-xl border transition-colors ${
                          primaryIncome === amt
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {formatINR(amt)}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowMultipleSources(true);
                      setIncomeSources([
                        { id: '1', name: 'Primary Salary', amount: primaryIncome },
                        { id: '2', name: 'Secondary / Freelance', amount: 15000 },
                      ]);
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 pt-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Have multiple income sources? Split them</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {incomeSources.map((src, idx) => (
                    <div
                      key={src.id}
                      className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80"
                    >
                      <input
                        type="text"
                        value={src.name}
                        onChange={e => updateIncomeSource(src.id, 'name', e.target.value)}
                        className="flex-1 bg-transparent text-sm font-medium text-slate-800 focus:outline-none"
                        placeholder="Income source name"
                      />
                      <div className="relative w-36">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          ₹
                        </span>
                        <input
                          type="number"
                          value={src.amount || ''}
                          onChange={e =>
                            updateIncomeSource(src.id, 'amount', Number(e.target.value))
                          }
                          className="w-full pl-6 pr-2 py-1.5 text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none"
                          placeholder="Amount"
                        />
                      </div>
                      {incomeSources.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIncomeSource(src.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={addIncomeSource}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add another source</span>
                    </button>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Total Monthly</span>
                      <span className="text-lg font-bold text-slate-900">
                        {formatINR(totalCalculatedIncome)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: EXPENSES */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 block mb-1">
                  2. Household Expenses
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Roughly how much do you spend each month?
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Enter your approximate total spending. You can categorize specific expenses later.
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={monthlyExpenses || ''}
                    onChange={e => setMonthlyExpenses(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-4 text-3xl font-extrabold text-slate-900 bg-slate-50/70 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    placeholder="42000"
                  />
                </div>

                {/* Quick preset chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[25000, 35000, 45000, 60000, 80000, 120000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setMonthlyExpenses(amt)}
                      className={`text-xs font-medium py-1.5 px-3 rounded-xl border transition-colors ${
                        monthlyExpenses === amt
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {formatINR(amt)}
                    </button>
                  ))}
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-600 flex items-center justify-between">
                  <span>Approximate monthly surplus:</span>
                  <span className="font-bold text-slate-900">
                    {formatINR(Math.max(0, totalCalculatedIncome - monthlyExpenses))} / month
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SAVINGS */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 block mb-1">
                  3. Current Savings
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  How much do you currently have saved?
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Include savings accounts, fixed deposits, or liquid funds. Approximate is fine.
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={currentSavings || ''}
                    onChange={e => setCurrentSavings(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-4 text-3xl font-extrabold text-slate-900 bg-slate-50/70 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    placeholder="120000"
                  />
                </div>

                {/* Quick preset chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[25000, 50000, 100000, 200000, 500000, 1000000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCurrentSavings(amt)}
                      className={`text-xs font-medium py-1.5 px-3 rounded-xl border transition-colors ${
                        currentSavings === amt
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {formatINR(amt)}
                    </button>
                  ))}
                </div>

                {monthlyExpenses > 0 && (
                  <p className="text-xs text-slate-500">
                    This represents roughly{' '}
                    <span className="font-semibold text-slate-800">
                      {(currentSavings / monthlyExpenses).toFixed(1)} months
                    </span>{' '}
                    of your current monthly living expenses.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: LOANS & DEBT */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 block mb-1">
                  4. Loans & Debt
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Do you currently have any loans or debt?
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  We only need high-level numbers now. You can add exact terms later.
                </p>
              </div>

              {/* Loan options */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'no_loans', label: 'No loans' },
                  { id: 'home', label: 'Home loan' },
                  { id: 'education', label: 'Education loan' },
                  { id: 'personal', label: 'Personal loan' },
                  { id: 'vehicle', label: 'Vehicle loan' },
                  { id: 'credit_card', label: 'Credit card debt' },
                  { id: 'other', label: 'Other' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setLoanSelection(opt.id as LoanType)}
                    className={`p-3 text-left rounded-2xl border text-sm transition-all ${
                      loanSelection === opt.id
                        ? 'bg-indigo-50/70 border-indigo-400 text-indigo-900 font-semibold shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{opt.label}</span>
                      {loanSelection === opt.id && (
                        <Check className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* If user has loans, collect minimum essentials only */}
              {loanSelection !== 'no_loans' && (
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3.5 animate-in fade-in duration-200">
                  <div className="text-xs font-semibold text-slate-700">
                    Minimum Loan Details:
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Total Outstanding Balance
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={loanOutstanding || ''}
                        onChange={e => setLoanOutstanding(Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none"
                        placeholder="350000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Approximate Monthly EMI
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={loanEmi || ''}
                        onChange={e => setLoanEmi(Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none"
                        placeholder="8500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-8 flex items-center justify-between border-t border-slate-100 mt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              className="py-3 px-6 rounded-2xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-100 flex items-center gap-2 group transition-all"
            >
              <span>{step === 4 ? 'Build My Wello Profile' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </main>

      {/* Safety assurance */}
      <footer className="max-w-xl mx-auto w-full py-4 text-center">
        <p className="text-xs text-slate-600 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-slate-400" />
          <span>Your data is strictly private and stored securely under your account.</span>
        </p>
      </footer>
    </div>
  );
};
