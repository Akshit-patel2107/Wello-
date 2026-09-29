import React, { useState } from 'react';
import { FamilyMember, FinancialProfile, UserAuth } from '../types/financial';
import { formatINR } from '../utils/financialCalculations';
import {
  Shield,
  Lock,
  Download,
  Trash2,
  Users,
  Plus,
  LogOut,
  CheckCircle2,
  Key,
  Database,
  Eye,
  AlertTriangle,
  X,
} from 'lucide-react';
import { WelloLogo } from './Logo';

interface ProfileViewProps {
  user: UserAuth;
  profile: FinancialProfile;
  onUpdateProfile: (updated: Partial<FinancialProfile>) => void;
  onSignOut: () => void;
  onDeleteAccount: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  profile,
  onUpdateProfile,
  onSignOut,
  onDeleteAccount,
}) => {
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // New family member state
  const [famName, setFamName] = useState('');
  const [famRelation, setFamRelation] = useState<FamilyMember['relation']>('Spouse');
  const [famIncome, setFamIncome] = useState<number>(45000);
  const [famExpenses, setFamExpenses] = useState<number>(20000);
  const [famScope, setFamScope] = useState<FamilyMember['accessScope']>('shared_goals');

  const handleAddFamilyMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!famName.trim()) return;
    const newMember: FamilyMember = {
      id: `fam_${Date.now()}`,
      name: famName.trim(),
      relation: famRelation,
      income: famIncome,
      expenses: famExpenses,
      accessScope: famScope,
    };
    onUpdateProfile({ familyMembers: [...profile.familyMembers, newMember] });
    setShowAddFamilyModal(false);
    setFamName('');
  };

  const handleRemoveFamilyMember = (id: string) => {
    onUpdateProfile({
      familyMembers: profile.familyMembers.filter(m => m.id !== id),
    });
  };

  const handleExportData = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify({ user, profile }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `wello_financial_data_${user.email}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-28 space-y-6">
      {/* User Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-700">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">{user.name}</h1>
            <p className="text-xs text-slate-500">{user.email}</p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Google Account</span>
            </div>
          </div>
        </div>

        <button
          onClick={onSignOut}
          className="self-start sm:self-auto py-2 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* ---------------- FAMILY FINANCE ---------------- */}
      <section className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Family Finance</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Consolidate household income, shared child education goals, or spouse contributions with granular privacy.
            </p>
          </div>

          <button
            onClick={() => setShowAddFamilyModal(true)}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Family Member</span>
          </button>
        </div>

        {profile.familyMembers.length === 0 ? (
          <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-500 text-center">
            No family members linked yet. You can optionally add a spouse or family co-earner with custom permissions.
          </div>
        ) : (
          <div className="space-y-3">
            {profile.familyMembers.map(member => (
              <div
                key={member.id}
                className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {member.name}
                    </span>
                    <span className="text-[10px] font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-600">
                      {member.relation}
                    </span>
                  </div>
                  <div className="text-slate-500 mt-1">
                    Inflow: {formatINR(member.income)} · Outflow:{' '}
                    {formatINR(member.expenses)} · Scope: {member.accessScope.replace('_', ' ')}
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveFamilyMember(member.id)}
                  className="self-start sm:self-auto text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ---------------- YOUR DATA (PRIVACY & SECURITY) ---------------- */}
      <section className="p-6 rounded-3xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Your Data & Privacy</h2>
          </div>
          <p className="text-xs text-slate-500">
            Complete transparency into what Wello knows, why we use it, and full data sovereignty.
          </p>
        </div>

        {/* 1. What Wello knows */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            1. What Wello Knows About Your Money
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-800 block">
                Household Inflow & Outflow
              </span>
              <span className="text-slate-500 text-[11px]">
                Income ({formatINR(profile.monthlyIncome)}) and expenses ({formatINR(profile.monthlyExpenses)}).
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-800 block">
                Liquid Reserves & Emergency Buffer
              </span>
              <span className="text-slate-500 text-[11px]">
                Savings ({formatINR(profile.currentSavings)}) and emergency allocation.
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-800 block">
                Loans & Obligations
              </span>
              <span className="text-slate-500 text-[11px]">
                {profile.loans.length} active loan record{profile.loans.length !== 1 ? 's' : ''}.
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-800 block">
                Tracked Assets & Goals
              </span>
              <span className="text-slate-500 text-[11px]">
                {profile.goals.length} goals and {profile.investments.length} tracked investments.
              </span>
            </div>
          </div>
        </div>

        {/* 2. Why Wello uses it */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            2. Why Wello Uses This Information
          </h3>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-2 leading-relaxed">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>
                To calculate your real-time <strong>Safe-to-Spend</strong> balance so you never compromise monthly obligations.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>
                To answer questions in <strong>Ask Wello</strong> with accurate financial context.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>
                We never sell, broker, or market your financial numbers to third-party lenders or insurance aggregators.
              </span>
            </div>
          </div>
        </div>

        {/* 3. Export and Delete Controls */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleExportData}
            className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Export My Financial Data (.JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="py-2.5 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account & Data</span>
          </button>
        </div>
      </section>

      {/* Add Family Member Modal */}
      {showAddFamilyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setShowAddFamilyModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Add Family Member
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Include their income and expenses for consolidated household planning.
            </p>

            <form onSubmit={handleAddFamilyMember} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={famName}
                  onChange={e => setFamName(e.target.value)}
                  placeholder="e.g. Priya"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Relationship
                </label>
                <select
                  value={famRelation}
                  onChange={e => setFamRelation(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Partner">Partner</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Inflow
                  </label>
                  <input
                    type="number"
                    value={famIncome}
                    onChange={e => setFamIncome(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Outflow
                  </label>
                  <input
                    type="number"
                    value={famExpenses}
                    onChange={e => setFamExpenses(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddFamilyModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rose-100 relative">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Delete All Financial Data?
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              This will permanently wipe all your income, expenses, goals, and portfolio records from this device and the server. This action cannot be undone.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Keep My Data
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDeleteAccount();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
