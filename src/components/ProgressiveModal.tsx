import React, { useState } from 'react';
import { FinancialProfile, ProgressiveDetails } from '../types/financial';
import { HelpCircle, Sparkles, X, ChevronRight, Check } from 'lucide-react';
import { formatINR } from '../utils/financialCalculations';

interface ProgressiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: FinancialProfile;
  onSaveProgressive: (updated: ProgressiveDetails) => void;
  topic?: 'health_score' | 'investments' | 'insurance' | 'goals';
}

export const ProgressiveModal: React.FC<ProgressiveModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProgressive,
  topic = 'health_score',
}) => {
  const [activeScreen, setActiveScreen] = useState<'prompt' | 'form'>('prompt');
  
  // Form fields
  const [age, setAge] = useState<number>(profile.progressiveDetails?.age || 29);
  const [riskPreference, setRiskPreference] = useState<'conservative' | 'balanced' | 'growth'>(
    profile.progressiveDetails?.riskPreference || 'balanced'
  );
  const [monthlySipTotal, setMonthlySipTotal] = useState<number>(
    profile.progressiveDetails?.monthlySipTotal || 10000
  );
  const [healthCover, setHealthCover] = useState<number>(
    profile.progressiveDetails?.insuranceHealthCover || 500000
  );
  const [termCover, setTermCover] = useState<number>(
    profile.progressiveDetails?.insuranceTermCover || 10000000
  );
  const [emergencyTargetMonths, setEmergencyTargetMonths] = useState<number>(
    profile.progressiveDetails?.emergencyFundMonthsTarget || 6
  );
  const [retirementAge, setRetirementAge] = useState<number>(
    profile.progressiveDetails?.retirementTargetAge || 60
  );

  // Spouse & Family Income Options (boosts borrowing power and household budget)
  const [hasSpouseIncome, setHasSpouseIncome] = useState<boolean>(
    profile.progressiveDetails?.hasSpouseIncome ?? (Boolean(profile.progressiveDetails?.spouseIncome && profile.progressiveDetails.spouseIncome > 0))
  );
  const [spouseIncome, setSpouseIncome] = useState<number>(
    profile.progressiveDetails?.spouseIncome || 45000
  );
  const [hasFamilyIncome, setHasFamilyIncome] = useState<boolean>(
    profile.progressiveDetails?.hasFamilyIncome ?? (Boolean(profile.progressiveDetails?.familyIncome && profile.progressiveDetails.familyIncome > 0))
  );
  const [familyIncome, setFamilyIncome] = useState<number>(
    profile.progressiveDetails?.familyIncome || 30000
  );
  const [includeFamilyInCalculations, setIncludeFamilyInCalculations] = useState<boolean>(
    profile.progressiveDetails?.includeFamilyInCalculations ?? true
  );

  // Active explainer tooltip
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveProgressive({
      age,
      riskPreference,
      monthlySipTotal,
      insuranceHealthCover: healthCover,
      insuranceTermCover: termCover,
      emergencyFundMonthsTarget: emergencyTargetMonths,
      retirementTargetAge: retirementAge,
      hasSpouseIncome,
      spouseIncome: hasSpouseIncome ? spouseIncome : 0,
      hasFamilyIncome,
      familyIncome: hasFamilyIncome ? familyIncome : 0,
      includeFamilyInCalculations,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {activeScreen === 'prompt' ? (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Want a more accurate financial health score?
            </h3>
            
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Share a few more details about your financial life. It will help Wello personalize your recommendations and calculate a precision safety buffer.
            </p>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 mb-6 text-xs text-slate-600 space-y-2">
              <div className="font-semibold text-slate-700">What we will refine:</div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>Spouse & Family Income (boosts loan eligibility & household budget)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>Risk preference & monthly SIP allocations</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>Health & Term insurance protection check</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>Target emergency safety buffer (3-6 months)</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Maybe Later
              </button>
              <button
                type="button"
                onClick={() => setActiveScreen('form')}
                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Add Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">
            <div>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                Progressive Personalization
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                Refine Your Wealth Parameters
              </h3>
              <p className="text-xs text-slate-500">
                You can answer only what you're comfortable with. All fields are optional.
              </p>
            </div>

            {/* Field 1: Age */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Your Current Age
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setActiveTooltip(activeTooltip === 'age' ? null : 'age')
                  }
                  className="text-xs text-indigo-600 flex items-center gap-1 hover:underline"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Why do we need this?</span>
                </button>
              </div>
              {activeTooltip === 'age' && (
                <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed">
                  «Your age determines your investment horizon, risk capacity, and time left before financial independence.»
                </div>
              )}
              <input
                type="number"
                value={age}
                onChange={e => setAge(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Field 2: Emergency Target */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Emergency Fund Target (Months of Expenses)
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setActiveTooltip(
                      activeTooltip === 'emergency' ? null : 'emergency'
                    )
                  }
                  className="text-xs text-indigo-600 flex items-center gap-1 hover:underline"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Why do we need this?</span>
                </button>
              </div>
              {activeTooltip === 'emergency' && (
                <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed">
                  «Knowing your emergency target helps Wello calculate how financially prepared you are against job transitions, medical needs, or surprises without touching long-term investments.»
                </div>
              )}
              <div className="flex gap-2">
                {[3, 6, 9, 12].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setEmergencyTargetMonths(m)}
                    className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
                      emergencyTargetMonths === m
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {m} Months
                  </button>
                ))}
              </div>
            </div>

            {/* Field 3: Monthly SIP */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Current Monthly SIPs / Mutual Funds
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setActiveTooltip(activeTooltip === 'sip' ? null : 'sip')
                  }
                  className="text-xs text-indigo-600 flex items-center gap-1 hover:underline"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Why do we need this?</span>
                </button>
              </div>
              {activeTooltip === 'sip' && (
                <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed">
                  «Tracking your ongoing SIPs ensures Wello calculates your true Safe-to-Spend without accidentally counting planned long-term investments as spending money.»
                </div>
              )}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  value={monthlySipTotal}
                  onChange={e => setMonthlySipTotal(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Field 4: Risk Profile */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Investment Risk Preference
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setActiveTooltip(activeTooltip === 'risk' ? null : 'risk')
                  }
                  className="text-xs text-indigo-600 flex items-center gap-1 hover:underline"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Why do we need this?</span>
                </button>
              </div>
              {activeTooltip === 'risk' && (
                <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed">
                  «Helps tailor asset allocation suggestions between fixed returns (FDs, PPF, Debt) and equities (Index funds, stocks).»
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'conservative', label: 'Conservative' },
                  { id: 'balanced', label: 'Balanced' },
                  { id: 'growth', label: 'Growth / Equity' },
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRiskPreference(r.id as any)}
                    className={`py-2 px-2 text-center rounded-xl border text-xs font-semibold transition-all ${
                      riskPreference === r.id
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 5: Insurance */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Insurance Safety Coverage
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setActiveTooltip(
                      activeTooltip === 'insurance' ? null : 'insurance'
                    )
                  }
                  className="text-xs text-indigo-600 flex items-center gap-1 hover:underline"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Why do we need this?</span>
                </button>
              </div>
              {activeTooltip === 'insurance' && (
                <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed">
                  «Protection prevents unforeseen health emergencies from wiping out years of hard-earned wealth.»
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">
                    Health Cover
                  </label>
                  <input
                    type="number"
                    value={healthCover}
                    onChange={e => setHealthCover(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
                    placeholder="500000"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {formatINR(healthCover)}
                  </span>
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">
                    Term Life Cover
                  </label>
                  <input
                    type="number"
                    value={termCover}
                    onChange={e => setTermCover(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
                    placeholder="10000000"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {formatINR(termCover)}
                  </span>
                </div>
              </div>
            </div>

            {/* Field: Spouse & Family Income Addition */}
            <div className="p-4 bg-gradient-to-br from-indigo-50/70 to-purple-50/40 rounded-2xl border border-indigo-100/90 space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Household / Co-Applicant Income</span>
                    <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      Increases Loan Eligibility
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Adding spouse or family income allows banks to assess higher combined borrowing power for home loans & assets.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTooltip(activeTooltip === 'family_income' ? null : 'family_income')}
                  className="text-xs text-indigo-600 flex items-center gap-1 hover:underline flex-shrink-0"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>

              {activeTooltip === 'family_income' && (
                <div className="p-2.5 bg-white/90 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed">
                  «Banks allow co-borrowers (like a working spouse or parents) to pool incomes. This can increase your maximum home loan eligibility from e.g. ₹50 Lakhs to over ₹90 Lakhs, while lowering interest margins.»
                </div>
              )}

              {/* Spouse Income Toggle & Input */}
              <div className="space-y-2 pt-1 border-t border-indigo-100/60">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasSpouseIncome}
                    onChange={e => setHasSpouseIncome(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    Add Working Spouse Monthly Income
                  </span>
                </label>

                {hasSpouseIncome && (
                  <div className="pl-6 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">₹</span>
                      <input
                        type="number"
                        value={spouseIncome}
                        onChange={e => setSpouseIncome(Math.max(0, Number(e.target.value)))}
                        placeholder="45000"
                        className="flex-1 px-3 py-1.5 rounded-xl border border-indigo-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-xs text-slate-500 font-medium">/ month</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Spouse contribution: {formatINR(spouseIncome)}/mo
                    </span>
                  </div>
                )}
              </div>

              {/* Other Family Income Toggle & Input */}
              <div className="space-y-2 pt-1 border-t border-indigo-100/60">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasFamilyIncome}
                    onChange={e => setHasFamilyIncome(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    Add Parents / Sibling / Family Business Income
                  </span>
                </label>

                {hasFamilyIncome && (
                  <div className="pl-6 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">₹</span>
                      <input
                        type="number"
                        value={familyIncome}
                        onChange={e => setFamilyIncome(Math.max(0, Number(e.target.value)))}
                        placeholder="30000"
                        className="flex-1 px-3 py-1.5 rounded-xl border border-indigo-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-xs text-slate-500 font-medium">/ month</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Family contribution: {formatINR(familyIncome)}/mo
                    </span>
                  </div>
                )}
              </div>

              {/* Combined Household Inflow Summary */}
              {(hasSpouseIncome || hasFamilyIncome) && (
                <div className="p-2.5 bg-white rounded-xl border border-indigo-100 text-xs flex items-center justify-between text-indigo-950 font-medium">
                  <span>Total Household Inflow:</span>
                  <span className="font-extrabold text-indigo-700 text-sm tabular-nums">
                    {formatINR(
                      profile.monthlyIncome +
                        (hasSpouseIncome ? spouseIncome : 0) +
                        (hasFamilyIncome ? familyIncome : 0)
                    )}{' '}
                    <span className="text-[10px] font-normal text-slate-500">/ mo</span>
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Skip For Now
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Details</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
