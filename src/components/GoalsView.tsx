import React, { useState } from 'react';
import { FinancialGoal, FinancialProfile, GoalType } from '../types/financial';
import { formatINR } from '../utils/financialCalculations';
import {
  Target,
  Plus,
  Sparkles,
  Sliders,
  CheckCircle2,
  Calendar,
  ArrowRight,
  TrendingUp,
  X,
} from 'lucide-react';

interface GoalsViewProps {
  profile: FinancialProfile;
  onUpdateGoals: (goals: FinancialGoal[]) => void;
}

const GOAL_PRESETS: Array<{ type: GoalType; title: string; defaultTarget: number }> = [
  { type: 'emergency_fund', title: 'Emergency Safety Fund', defaultTarget: 300000 },
  { type: 'car', title: 'New Car Down Payment', defaultTarget: 400000 },
  { type: 'house', title: 'Dream Home Down Payment', defaultTarget: 2500000 },
  { type: 'travel', title: 'Vacation / Travel Trip', defaultTarget: 150000 },
  { type: 'marriage', title: 'Wedding & Celebration', defaultTarget: 800000 },
  { type: 'education', title: 'Higher Education Fund', defaultTarget: 1200000 },
  { type: 'startup', title: 'Startup Runway & Seed Capital', defaultTarget: 600000 },
  { type: 'retirement', title: 'Early Retirement Freedom', defaultTarget: 10000000 },
  { type: 'custom', title: 'Personal Milestone Goal', defaultTarget: 200000 },
];

export const GoalsView: React.FC<GoalsViewProps> = ({ profile, onUpdateGoals }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeSimulatorGoal, setActiveSimulatorGoal] = useState<FinancialGoal | null>(
    profile.goals[0] || null
  );
  const [extraMonthlyContribution, setExtraMonthlyContribution] = useState<number>(5000);

  // New goal form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<GoalType>('emergency_fund');
  const [newTarget, setNewTarget] = useState<number>(300000);
  const [newCurrent, setNewCurrent] = useState<number>(50000);
  const [newMonthly, setNewMonthly] = useState<number>(10000);
  const [newDate, setNewDate] = useState('2027-12');

  const handleSelectPreset = (preset: typeof GOAL_PRESETS[0]) => {
    setNewType(preset.type);
    setNewTitle(preset.title);
    setNewTarget(preset.defaultTarget);
    setNewCurrent(Math.round(preset.defaultTarget * 0.15));
    setNewMonthly(Math.round(preset.defaultTarget / 24));
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const created: FinancialGoal = {
      id: `goal_${Date.now()}`,
      type: newType,
      title: newTitle.trim() || 'New Goal',
      targetAmount: newTarget,
      currentAmount: newCurrent,
      monthlyContribution: newMonthly,
      targetDate: newDate,
    };
    const updated = [...profile.goals, created];
    onUpdateGoals(updated);
    setShowAddModal(false);
    if (!activeSimulatorGoal) {
      setActiveSimulatorGoal(created);
    }
  };

  const handleDeleteGoal = (id: string) => {
    const updated = profile.goals.filter(g => g.id !== id);
    onUpdateGoals(updated);
    if (activeSimulatorGoal?.id === id) {
      setActiveSimulatorGoal(updated[0] || null);
    }
  };

  // Simulator calculation for active goal
  const calculateMonthsToGoal = (target: number, current: number, monthly: number) => {
    const remaining = Math.max(0, target - current);
    if (monthly <= 0) return 999;
    return Math.ceil(remaining / monthly);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-28 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Financial Goals
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Give every rupee a designated purpose. Clear milestones protect long-term peace of mind.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            handleSelectPreset(GOAL_PRESETS[0]);
            setShowAddModal(true);
          }}
          className="self-start sm:self-auto inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Simulator Card: "What if I save ₹5,000 more every month?" */}
      {profile.goals.length > 0 && activeSimulatorGoal && (
        <section className="bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/40 rounded-3xl p-6 sm:p-7 border border-indigo-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5" />
              <span>Goal Acceleration Simulator</span>
            </div>
            {profile.goals.length > 1 && (
              <select
                value={activeSimulatorGoal.id}
                onChange={e => {
                  const match = profile.goals.find(g => g.id === e.target.value);
                  if (match) setActiveSimulatorGoal(match);
                }}
                className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none"
              >
                {profile.goals.map(g => (
                  <option key={g.id} value={g.id}>
                    Simulate: {g.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
            “What if I save {formatINR(extraMonthlyContribution)} more every month toward {activeSimulatorGoal.title}?”
          </h2>

          {/* Calculations */}
          {(() => {
            const currentMonthly = activeSimulatorGoal.monthlyContribution || 1000;
            const boostedMonthly = currentMonthly + extraMonthlyContribution;
            const originalMonths = calculateMonthsToGoal(
              activeSimulatorGoal.targetAmount,
              activeSimulatorGoal.currentAmount,
              currentMonthly
            );
            const boostedMonths = calculateMonthsToGoal(
              activeSimulatorGoal.targetAmount,
              activeSimulatorGoal.currentAmount,
              boostedMonthly
            );
            const monthsSaved = Math.max(0, originalMonths - boostedMonths);

            return (
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1000"
                    max="25000"
                    step="1000"
                    value={extraMonthlyContribution}
                    onChange={e => setExtraMonthlyContribution(Number(e.target.value))}
                    className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-xs font-bold text-indigo-700 w-24 text-right">
                    +{formatINR(extraMonthlyContribution)}/mo
                  </span>
                </div>

                <div className="p-4 bg-white/80 backdrop-blur-xs rounded-2xl border border-indigo-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Original timeline:</span>
                    <span className="font-bold text-slate-800 text-sm">
                      ~{originalMonths} months ({formatINR(currentMonthly)}/mo)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Accelerated timeline:</span>
                    <span className="font-bold text-indigo-600 text-sm">
                      ~{boostedMonths} months ({formatINR(boostedMonthly)}/mo)
                    </span>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-emerald-600 font-bold block text-sm">
                      ✨ You reach your goal {monthsSaved} month{monthsSaved !== 1 ? 's' : ''} sooner!
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </section>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {profile.goals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 p-8">
            <Target className="w-12 h-12 text-indigo-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">
              No goals added yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Setting specific goals like a 3-month emergency fund or house down payment gives your money purpose.
            </p>
            <button
              onClick={() => {
                handleSelectPreset(GOAL_PRESETS[0]);
                setShowAddModal(true);
              }}
              className="py-2 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Add First Goal
            </button>
          </div>
        ) : (
          profile.goals.map(goal => {
            const progress = Math.min(
              100,
              Math.round((goal.currentAmount / (goal.targetAmount || 1)) * 100)
            );
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

            return (
              <div
                key={goal.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {goal.title}
                      </h3>
                      <span className="text-[10px] uppercase font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {goal.type.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Target Date: {goal.targetDate} · Monthly SIP/Contribution:{' '}
                      {formatINR(goal.monthlyContribution)}
                    </span>
                  </div>

                  <div className="text-left sm:text-right min-w-0">
                    <div className="text-base sm:text-lg font-extrabold text-slate-900 tabular-nums">
                      {formatINR(goal.currentAmount)}{' '}
                      <span className="text-xs font-medium text-slate-400">
                        / {formatINR(goal.targetAmount)}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 tabular-nums">
                      {progress}% complete
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Calming, non-judgmental milestone progress quote */}
                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <span>
                    {progress >= 100
                      ? '🎉 Goal achieved! Congratulations on building financial independence.'
                      : progress >= 50
                      ? '“You’re halfway there. Staying steady will get you over the line.”'
                      : `“${formatINR(remaining)} remaining. Every monthly contribution compounds your security.”`}
                  </span>

                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-slate-400 hover:text-rose-600 text-xs transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Create a Financial Goal
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select a popular template or customize your own milestone.
            </p>

            {/* Quick Templates */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {GOAL_PRESETS.slice(0, 6).map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2 rounded-xl border text-[11px] font-semibold text-left transition-colors ${
                    newType === preset.type
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {preset.title.split(' ')[0]}
                </button>
              ))}
            </div>

            <form onSubmit={handleAddGoal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. 6-Month Emergency Cushion"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      value={newTarget}
                      onChange={e => setNewTarget(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Already Saved
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      value={newCurrent}
                      onChange={e => setNewCurrent(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Contribution
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      value={newMonthly}
                      onChange={e => setNewMonthly(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Completion Date
                  </label>
                  <input
                    type="month"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
