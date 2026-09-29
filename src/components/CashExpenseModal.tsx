import React, { useState } from 'react';
import { CashExpense } from '../types/financial';
import { formatINR } from '../utils/financialCalculations';
import { X, Check } from 'lucide-react';

interface CashExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCashExpense: (expense: CashExpense) => void;
}

const CATEGORIES: Array<CashExpense['category']> = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Education',
  'Health',
  'Other',
];

export const CashExpenseModal: React.FC<CashExpenseModalProps> = ({
  isOpen,
  onClose,
  onAddCashExpense,
}) => {
  const [amount, setAmount] = useState<number>(150);
  const [category, setCategory] = useState<CashExpense['category']>('Food');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    const newExpense: CashExpense = {
      id: `cash_${Date.now()}`,
      category,
      amount,
      note: note.trim() || category,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onAddCashExpense(newExpense);
    onClose();
    setAmount(150);
    setNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Add Cash Expense
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Quick entry for cash spent on street food, cabs, groceries, or services.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Amount Spent
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                required
                autoFocus
                value={amount || ''}
                onChange={e => setAmount(Number(e.target.value))}
                placeholder="150"
                className="w-full pl-9 pr-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-2xl font-black text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
            {/* Quick amount chips */}
            <div className="flex gap-1.5 mt-2 overflow-x-auto pb-0.5 no-scrollbar">
              {[50, 100, 200, 500, 1000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt)}
                  className={`py-1 px-2.5 rounded-lg border text-[11px] font-semibold transition-all ${
                    amount === amt
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-1 text-center rounded-xl border text-[11px] font-medium transition-all ${
                    category === cat
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-700 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Short Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Chai with team, Auto to metro"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Record Cash</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
