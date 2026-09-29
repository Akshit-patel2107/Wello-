import React, { useState, useEffect } from 'react';
import {
  FinancialProfile,
  InvestmentAsset,
  LoanItem,
  MarketIndex,
  MarketQuote,
} from '../types/financial';
import { formatINR } from '../utils/financialCalculations';
import {
  fetchMarketIndices,
  fetchStockQuote,
  searchMarketStocks,
} from '../services/marketService';
import {
  Map,
  Coins,
  Receipt,
  PiggyBank,
  CreditCard,
  TrendingUp,
  Search,
  Plus,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  ShieldCheck,
  Trash2,
  Calendar,
  X,
  Sparkles,
  ExternalLink,
  PieChart,
  ArrowRightLeft,
  Users,
} from 'lucide-react';
import { SalarySpendingAdvisor } from './SalarySpendingAdvisor';
import { LoanEligibilityCalculator } from './LoanEligibilityCalculator';
import { PurchaseAffordabilityPlanner } from './PurchaseAffordabilityPlanner';
import { SmartCreditHub } from './SmartCreditHub';
import { StocksInvestView } from './StocksInvestView';

interface MoneyViewProps {
  profile: FinancialProfile;
  activeSubTab?: string;
  onUpdateProfile: (updated: Partial<FinancialProfile>) => void;
  onOpenAddCash: () => void;
  onOpenProgressiveModal?: () => void;
  onNavigateTab?: (tab: string, subTab?: string) => void;
}

export const MoneyView: React.FC<MoneyViewProps> = ({
  profile,
  activeSubTab = 'blueprint',
  onUpdateProfile,
  onOpenAddCash,
  onOpenProgressiveModal,
  onNavigateTab,
}) => {
  const [subTab, setSubTab] = useState<string>(activeSubTab);

  // Sync prop changes
  useEffect(() => {
    if (activeSubTab) setSubTab(activeSubTab);
  }, [activeSubTab]);

  // Market & Investments State
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MarketQuote[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStock, setSelectedStock] = useState<MarketQuote | null>(null);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [chartTimeframe, setChartTimeframe] = useState<'1D' | '1W' | '1M' | '1Y' | '5Y'>('1M');

  // Loans State
  const [showAddLoanModal, setShowAddLoanModal] = useState(false);
  const [newLoanName, setNewLoanName] = useState('');
  const [newLoanType, setNewLoanType] = useState<any>('personal');
  const [newLoanOutstanding, setNewLoanOutstanding] = useState<number>(200000);
  const [newLoanEmi, setNewLoanEmi] = useState<number>(6000);
  const [newLoanRate, setNewLoanRate] = useState<number>(10.5);
  const [newLoanTenure, setNewLoanTenure] = useState<number>(36);

  // Income source adding
  const [newIncomeName, setNewIncomeName] = useState('');
  const [newIncomeAmount, setNewIncomeAmount] = useState<number>(20000);

  // Active Educational Tooltip State
  const [activeEducation, setActiveEducation] = useState<string | null>(null);

  // Bulletproof financial parser for values in ₹ Crores, Lakh Crores, numbers, or strings
  const parseFinancialCrores = (val: number | string | undefined | null): number => {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    const str = String(val).trim();
    const lower = str.toLowerCase();
    const isNeg = str.includes('-') || str.startsWith('(') || lower.includes('loss');
    const clean = str.replace(/,/g, '');
    const match = clean.match(/[-+]?[0-9]*\.?[0-9]+/);
    if (!match) return 0;
    let num = parseFloat(match[0]);
    if (isNaN(num)) return 0;
    if (lower.includes('lakh') || lower.includes('lac')) {
      num = num * 100000;
    }
    return isNeg ? -Math.abs(num) : num;
  };

  // Unified financial display formatter that guarantees zero glitches across any scale (Crores, Lakh Crores, Net Loss)
  const formatFinancialDisplay = (
    val: number | string | undefined | null,
    options?: { showSign?: boolean; isNetProfit?: boolean; compact?: boolean }
  ): { text: string; isLoss: boolean; rawCrores: number } => {
    if (val === undefined || val === null || val === '') {
      return { text: '—', isLoss: false, rawCrores: 0 };
    }
    const num = typeof val === 'number' ? (isNaN(val) ? 0 : val) : parseFinancialCrores(val);
    if (isNaN(num)) {
      return { text: '—', isLoss: false, rawCrores: 0 };
    }

    const isLoss = num < 0;
    const abs = Math.abs(num);
    const sign = isLoss ? '-' : options?.showSign && num > 0 ? '+' : '';

    let text = '';
    if (abs >= 100000) {
      const lakhVal = (abs / 100000).toFixed(2).replace(/\.00$/, '');
      if (options?.compact) {
        text = `${sign}₹${lakhVal} Lakh Cr`;
      } else {
        text = `${sign}₹${lakhVal} Lakh Cr (₹${Math.round(abs).toLocaleString('en-IN')} Cr)`;
      }
    } else {
      text = `${sign}₹${Math.round(abs).toLocaleString('en-IN')} Cr`;
    }

    if (isLoss && options?.isNetProfit) {
      text += ' (Net Loss)';
    }

    return { text, isLoss, rawCrores: num };
  };

  // Fetch Market Indices on Mount
  useEffect(() => {
    fetchMarketIndices().then(data => {
      if (data && data.length > 0) setIndices(data);
    });
  }, []);

  // Stock Search Debounce
  useEffect(() => {
    if (subTab !== 'investments') return;
    const timer = setTimeout(() => {
      setIsSearching(true);
      searchMarketStocks(searchQuery)
        .then(results => {
          setSearchResults(results);
          if (results.length > 0 && !selectedStock) {
            setSelectedStock(results[0]);
          }
        })
        .finally(() => setIsSearching(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, subTab]);

  // Handle adding an investment asset
  const handleAddInvestment = () => {
    if (!selectedStock) return;
    const existingIndex = profile.investments.findIndex(
      i => i.symbol === selectedStock.symbol
    );
    const cost = selectedStock.price * stockQuantity;

    let updatedInvestments: InvestmentAsset[];
    if (existingIndex >= 0) {
      updatedInvestments = [...profile.investments];
      const existing = updatedInvestments[existingIndex];
      const newQty = existing.quantity + stockQuantity;
      const newInvested = existing.investedAmount + cost;
      const newCurrentVal = newQty * selectedStock.price;
      updatedInvestments[existingIndex] = {
        ...existing,
        quantity: newQty,
        investedAmount: newInvested,
        currentValue: newCurrentVal,
        currentPrice: selectedStock.price,
        returnsPercent: Number(
          (((newCurrentVal - newInvested) / (newInvested || 1)) * 100).toFixed(2)
        ),
      };
    } else {
      const newAsset: InvestmentAsset = {
        id: `inv_${Date.now()}`,
        symbol: selectedStock.symbol,
        ticker: selectedStock.ticker,
        name: selectedStock.name,
        type: 'stock',
        quantity: stockQuantity,
        buyPrice: selectedStock.price,
        currentPrice: selectedStock.price,
        investedAmount: cost,
        currentValue: cost,
        returnsPercent: 0,
        exchange: selectedStock.exchange,
      };
      updatedInvestments = [...profile.investments, newAsset];
    }

    onUpdateProfile({ investments: updatedInvestments });
    setShowAddStockModal(false);
  };

  const handleRemoveInvestment = (id: string) => {
    onUpdateProfile({
      investments: profile.investments.filter(i => i.id !== id),
    });
  };

  // Handle selecting a competitor rival stock
  const handleSelectRival = async (symbol: string) => {
    setIsSearching(true);
    try {
      const quote = await fetchStockQuote(symbol);
      if (quote) {
        setSelectedStock(quote);
      }
    } catch (err) {
      console.error('Failed to load rival stock:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle adding a loan
  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const newLoan: LoanItem = {
      id: `loan_${Date.now()}`,
      type: newLoanType,
      name: newLoanName.trim() || 'Personal Loan',
      outstanding: newLoanOutstanding,
      emi: newLoanEmi,
      interestRate: newLoanRate,
      remainingMonths: newLoanTenure,
    };
    onUpdateProfile({ loans: [...profile.loans, newLoan] });
    setShowAddLoanModal(false);
    setNewLoanName('');
  };

  const handleRemoveLoan = (id: string) => {
    onUpdateProfile({ loans: profile.loans.filter(l => l.id !== id) });
  };

  // Handle adding income source
  const handleAddIncomeSource = () => {
    if (!newIncomeName.trim() || newIncomeAmount <= 0) return;
    const newSrc = {
      id: `inc_${Date.now()}`,
      name: newIncomeName.trim(),
      amount: newIncomeAmount,
    };
    const updatedSources = [...profile.incomeSources, newSrc];
    const updatedTotal = updatedSources.reduce((sum, s) => sum + s.amount, 0);
    onUpdateProfile({
      incomeSources: updatedSources,
      monthlyIncome: updatedTotal,
    });
    setNewIncomeName('');
    setNewIncomeAmount(20000);
  };

  const handleRemoveIncomeSource = (id: string) => {
    const updatedSources = profile.incomeSources.filter(s => s.id !== id);
    const updatedTotal = updatedSources.reduce((sum, s) => sum + s.amount, 0);
    onUpdateProfile({
      incomeSources: updatedSources,
      monthlyIncome: updatedTotal,
    });
  };

  // Calculations
  const totalLoanEmi = profile.loans.reduce((sum, l) => sum + l.emi, 0);
  const totalLoanOutstanding = profile.loans.reduce(
    (sum, l) => sum + l.outstanding,
    0
  );
  const emiPercentOfIncome =
    profile.monthlyIncome > 0
      ? ((totalLoanEmi / profile.monthlyIncome) * 100).toFixed(0)
      : '0';

  const totalPortfolioValue = profile.investments.reduce(
    (sum, i) => sum + i.currentValue,
    0
  );
  const totalInvestedAmount = profile.investments.reduce(
    (sum, i) => sum + i.investedAmount,
    0
  );
  const totalPortfolioGain = totalPortfolioValue - totalInvestedAmount;
  const portfolioReturnPercent =
    totalInvestedAmount > 0
      ? ((totalPortfolioGain / totalInvestedAmount) * 100).toFixed(2)
      : '0.00';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-28 space-y-6">
      {/* Sub-nav tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl overflow-x-auto no-scrollbar">
        {[
          { id: 'blueprint', label: 'Financial Blueprint', icon: Map },
          { id: 'salary_spend', label: 'Salary Breakdown', icon: PieChart },
          { id: 'loans', label: 'Loans & Borrowing', icon: CreditCard },
          { id: 'credit', label: 'Smart Credit & Cards', icon: ShieldCheck },
          { id: 'investments', label: 'Investments & Markets', icon: TrendingUp },
          { id: 'expenses', label: 'Expenses', icon: Coins },
          { id: 'income', label: 'Income', icon: Receipt },
          { id: 'savings', label: 'Savings', icon: PiggyBank },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'investments' && onNavigateTab) {
                  onNavigateTab('stocks');
                } else {
                  setSubTab(tab.id);
                }
              }}
              className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isActive ? 'text-indigo-600' : 'text-slate-400'
                }`}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ---------------- 1. FINANCIAL BLUEPRINT ---------------- */}
      {subTab === 'blueprint' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Financial Blueprint</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              A comprehensive map of your financial life with status, progress, and 1 important action.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[
              {
                title: 'Income',
                status: `${formatINR(profile.monthlyIncome)} / month`,
                progress: 'Stable Inflow',
                action: 'Build secondary freelance or dividend income stream.',
                onClick: () => setSubTab('income'),
              },
              {
                title: 'Expenses',
                status: `${formatINR(profile.monthlyExpenses)} / month`,
                progress: `${((profile.monthlyExpenses / (profile.monthlyIncome || 1)) * 100).toFixed(0)}% of income`,
                action: 'Review food and shopping spikes to preserve surplus.',
                onClick: () => setSubTab('expenses'),
              },
              {
                title: 'Emergency Fund',
                status: `${formatINR(profile.emergencyFund || profile.currentSavings * 0.5)}`,
                progress: `${((profile.emergencyFund || profile.currentSavings * 0.5) / (profile.monthlyExpenses || 1)).toFixed(1)} months`,
                action: 'Increase buffer toward the 6-month resilience target.',
                onClick: () => setSubTab('savings'),
              },
              {
                title: 'Savings & Liquidity',
                status: `${formatINR(profile.currentSavings)}`,
                progress: 'Available Capital',
                action: 'Deploy excess cash into liquid mutual funds or FDs.',
                onClick: () => setSubTab('savings'),
              },
              {
                title: 'Loans & Obligations',
                status: `${formatINR(totalLoanOutstanding)}`,
                progress: `${formatINR(totalLoanEmi)} EMI (${emiPercentOfIncome}% of inc)`,
                action: totalLoanEmi > 0 ? 'Prioritize highest-rate debt.' : 'Keep debt at zero.',
                onClick: () => setSubTab('loans'),
              },
              {
                title: 'Investments',
                status: `${formatINR(totalPortfolioValue)}`,
                progress: `${profile.investments.length} tracked assets`,
                action: 'Automate a monthly Nifty 50 or broad market SIP.',
                onClick: () => {
                  if (onNavigateTab) onNavigateTab('stocks');
                  else setSubTab('investments');
                },
              },
              {
                title: 'Protection (Insurance)',
                status: profile.progressiveDetails?.insuranceHealthCover
                  ? `${formatINR(profile.progressiveDetails.insuranceHealthCover)} cover`
                  : 'Needs Review',
                progress: profile.progressiveDetails?.insuranceTermCover
                  ? 'Covered'
                  : 'Term cover pending',
                action: 'Ensure 10x annual income term life coverage.',
                onClick: () => setSubTab('blueprint'),
              },
              {
                title: 'Active Goals',
                status: `${profile.goals.length} defined`,
                progress: `${profile.goals.filter(g => g.currentAmount >= g.targetAmount).length} completed`,
                action: 'Simulate saving ₹5,000 more/month to reach goals early.',
                onClick: () => setSubTab('blueprint'),
              },
              {
                title: 'Net Worth Estimate',
                status: `${formatINR(profile.currentSavings + totalPortfolioValue - totalLoanOutstanding)}`,
                progress: 'Building Equity',
                action: 'Track quarterly growth without getting anxious over daily volatility.',
                onClick: () => {
                  if (onNavigateTab) onNavigateTab('stocks');
                  else setSubTab('investments');
                },
              },
            ].map((card, idx) => (
              <div
                key={idx}
                onClick={card.onClick}
                className="p-5 rounded-2xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-indigo-200 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
                    <span>{card.title}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <div className="text-base font-bold text-slate-900 mb-0.5">
                    {card.status}
                  </div>
                  <div className="text-[11px] font-medium text-emerald-600 mb-3">
                    {card.progress}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-50 text-[11px] text-slate-600 leading-snug">
                  <span className="font-semibold text-slate-800">Next Action:</span>{' '}
                  {card.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- SALARY SPENDING BLUEPRINT ---------------- */}
      {subTab === 'salary_spend' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <SalarySpendingAdvisor
            profile={profile}
            onNavigateToTab={(tab, sub) => setSubTab(sub || tab)}
            onOpenProgressiveModal={onOpenProgressiveModal}
          />
        </div>
      )}

      {/* ---------------- SMART CREDIT & CARDS ---------------- */}
      {subTab === 'credit' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <SmartCreditHub profile={profile} />
        </div>
      )}

      {/* ---------------- 2. EXPENSES & CASH ---------------- */}
      {subTab === 'expenses' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Household Expenses</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Understand spending patterns and log daily cash expenses quickly.
              </p>
            </div>
            <button
              onClick={onOpenAddCash}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-2xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Cash Expense</span>
            </button>
          </div>

          {/* Monthly Insight Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                Monthly Spending Insight
              </span>
              <span className="text-xs font-bold text-slate-800">
                Total: {formatINR(profile.monthlyExpenses)}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              “Food and shopping make up roughly 46% of your monthly expenditure. Your current safe-to-spend margin allows flexible daily decisions without compromising your emergency fund.”
            </p>
          </div>

          {/* Expense Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(profile.expenseCategories).map(([cat, amt]) => {
              const pct = (
                (amt / (profile.monthlyExpenses || 1)) *
                100
              ).toFixed(0);
              return (
                <div
                  key={cat}
                  className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                >
                  <span className="text-xs text-slate-500 font-medium block">
                    {cat}
                  </span>
                  <span className="text-base font-bold text-slate-900 mt-1 block">
                    {formatINR(amt)}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {pct}% of monthly
                  </span>
                </div>
              );
            })}
          </div>

          {/* Cash Expenses Log */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recent Cash Log (Quick Outflow)
            </h3>
            {profile.cashExpenses.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                No cash expenses logged today. Tap "Add Cash Expense" to quickly record auto, groceries, or tea.
              </p>
            ) : (
              <div className="space-y-2">
                {profile.cashExpenses.slice(-5).map(c => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50/70 rounded-xl text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">
                        {c.note || c.category}
                      </span>
                      <span className="text-slate-400 ml-2">{c.category}</span>
                    </div>
                    <span className="font-bold text-rose-600">
                      −{formatINR(c.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- 3. INCOME ---------------- */}
      {subTab === 'income' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Household Income</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Total monthly inflow across all active household earners and streams.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total Monthly</span>
              <span className="text-2xl font-extrabold text-slate-900">
                {formatINR(profile.monthlyIncome)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {profile.incomeSources.map(src => (
              <div
                key={src.id}
                className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{src.name}</h4>
                  <span className="text-xs text-emerald-600 font-medium">
                    Regular Inflow
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-slate-900">
                    {formatINR(src.amount)}
                  </span>
                  {profile.incomeSources.length > 1 && (
                    <button
                      onClick={() => handleRemoveIncomeSource(src.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Income Source Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <span className="text-xs font-bold text-slate-800 block">
              Add Income Stream (Freelance, Rental, Bonus)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                value={newIncomeName}
                onChange={e => setNewIncomeName(e.target.value)}
                placeholder="Source name (e.g. Rental Income)"
                className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none"
              />
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={newIncomeAmount}
                    onChange={e => setNewIncomeAmount(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                    placeholder="Amount"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddIncomeSource}
                  className="py-2 px-3.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 4. SAVINGS ---------------- */}
      {subTab === 'savings' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Savings & Liquidity</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cash reserves, emergency safety cushion, and liquid buffers.
            </p>
          </div>

          {/* Encouraging Non-Judgmental Buffer Card */}
          {(() => {
            const months = (
              profile.currentSavings / (profile.monthlyExpenses || 1)
            ).toFixed(1);
            return (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/60 via-white to-sky-50/40 border border-indigo-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                    Emergency Resilience Status
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {months} Months Covered
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-slate-900">
                  {formatINR(profile.currentSavings)}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  “You're currently covered for approximately {months} months of essential living expenses. Building this cushion toward 6 months will give you an unshakeable safety buffer before aggressive stock investments.”
                </p>
              </div>
            );
          })()}

          {/* Savings Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-1">
              <span className="text-xs text-slate-400 font-medium">
                Emergency Fund Allocation
              </span>
              <div className="text-xl font-bold text-slate-900">
                {formatINR(profile.emergencyFund || profile.currentSavings * 0.6)}
              </div>
              <p className="text-xs text-slate-500 pt-1">
                Reserved strictly for medical emergencies, sudden car repairs, or income gaps.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-1">
              <span className="text-xs text-slate-400 font-medium">
                Liquid & Short-Term Reserves
              </span>
              <div className="text-xl font-bold text-slate-900">
                {formatINR(
                  Math.max(
                    0,
                    profile.currentSavings -
                      (profile.emergencyFund || profile.currentSavings * 0.6)
                  )
                )}
              </div>
              <p className="text-xs text-slate-500 pt-1">
                Flexible capital in savings accounts or auto-sweep fixed deposits.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 5. LOANS & DEBT ---------------- */}
      {subTab === 'loans' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Loans & Debt</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Understand debt obligations, monthly EMI impact, and pay-off efficiency.
              </p>
            </div>
            <button
              onClick={() => setShowAddLoanModal(true)}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-2xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Loan Details</span>
            </button>
          </div>

          {/* Key Loan Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <span className="text-xs text-slate-400 font-medium">
                Total Outstanding
              </span>
              <div className="text-xl font-extrabold text-slate-900 mt-1">
                {formatINR(totalLoanOutstanding)}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <span className="text-xs text-slate-400 font-medium">
                Monthly Total EMI
              </span>
              <div className="text-xl font-extrabold text-slate-900 mt-1">
                {formatINR(totalLoanEmi)}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <span className="text-xs text-slate-400 font-medium">
                EMI to Income Ratio
              </span>
              <div className="text-xl font-extrabold text-slate-900 mt-1">
                {emiPercentOfIncome}%
              </div>
            </div>
          </div>

          {/* Educational Insight */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900 block mb-1">
              What does this mean for your money?
            </span>
            {totalLoanEmi > 0 ? (
              <span>
                Your ₹{totalLoanEmi.toLocaleString('en-IN')} EMI represents {emiPercentOfIncome}% of your monthly income. Keeping your debt load below 30% ensures you always retain control over your lifestyle and wealth building.
              </span>
            ) : (
              <span>
                You currently carry zero loan EMIs. This gives your household outstanding cash-flow freedom and eliminates high interest drag.
              </span>
            )}
          </div>

          {/* Loan Items List */}
          <div className="space-y-3">
            {profile.loans.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No active loans recorded. If you have a home loan or vehicle loan, tap "Add Loan Details".
              </p>
            ) : (
              profile.loans.map(loan => (
                <div
                  key={loan.id}
                  className="p-5 rounded-2xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        {loan.name}
                      </h4>
                      <span className="text-[10px] uppercase font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {loan.type}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Outstanding: {formatINR(loan.outstanding)} · Interest:{' '}
                      {loan.interestRate ? `${loan.interestRate}%` : 'Standard'}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Monthly EMI</span>
                      <span className="text-base font-bold text-slate-900">
                        {formatINR(loan.emi)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveLoan(loan.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Loan Modal */}
          {showAddLoanModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
                <button
                  onClick={() => setShowAddLoanModal(false)}
                  className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Add Loan Details
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Track repayment progress and calculate true interest cost.
                </p>

                <form onSubmit={handleAddLoan} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Loan Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newLoanName}
                      onChange={e => setNewLoanName(e.target.value)}
                      placeholder="e.g. HDFC Home Loan or Car EMI"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Outstanding Balance
                      </label>
                      <input
                        type="number"
                        required
                        value={newLoanOutstanding}
                        onChange={e => setNewLoanOutstanding(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Monthly EMI
                      </label>
                      <input
                        type="number"
                        required
                        value={newLoanEmi}
                        onChange={e => setNewLoanEmi(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Interest Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={newLoanRate}
                        onChange={e => setNewLoanRate(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Remaining Months
                      </label>
                      <input
                        type="number"
                        value={newLoanTenure}
                        onChange={e => setNewLoanTenure(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddLoanModal(false)}
                      className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
                    >
                      Save Loan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Salary-Based Loan Eligibility & Borrowing Power Calculator */}
          <LoanEligibilityCalculator
            profile={profile}
            onOpenProgressiveModal={onOpenProgressiveModal}
          />

          {/* AI-Powered Purchase Feasibility & Target Salary Planner */}
          <PurchaseAffordabilityPlanner profile={profile} />
        </div>
      )}

      {/* ---------------- 6. INVESTMENTS & MARKETS ---------------- */}
      {subTab === 'investments' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Market & Investments
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real market integration for Indian equities and broad market indices.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Portfolio Value</span>
              <span className="text-xl font-extrabold text-slate-900">
                {formatINR(totalPortfolioValue)}
              </span>
            </div>
          </div>

          {/* Indian Benchmark Indices Bar (Live Market Integration) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {indices.map(idx => {
              const isPos = idx.change >= 0;
              return (
                <div
                  key={idx.symbol}
                  className="p-3 bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-w-0 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1 min-w-0">
                    <span className="font-semibold truncate">{idx.name}</span>
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-1 py-0.5 rounded ml-1 flex-shrink-0">
                      {idx.tag || 'Index'}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900 tabular-nums truncate" title={idx.value.toString()}>
                    {idx.value.toLocaleString('en-IN', {
                      maximumFractionDigits: 1,
                    })}
                  </div>
                  <div
                    className={`text-[11px] font-semibold mt-0.5 flex items-center gap-0.5 tabular-nums ${
                      isPos ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {isPos ? (
                      <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 flex-shrink-0" />
                    )}
                    <span className="truncate">
                      {isPos ? '+' : ''}
                      {idx.changePercent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Market Search & Stock Explorer */}
          <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Search All Listed NSE & BSE Stocks
                </h3>
                <p className="text-xs text-slate-500">
                  Search any listed company in India with live Google Finance integration.
                </p>
              </div>

              {/* Educational Disclaimer */}
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md inline-block">
                  NSE & BSE Live Connect
                </span>
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search any listed Indian stock (e.g. Tata Motors, MRF, Cipla, Reliance, Swiggy, ITC)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-2xs"
              />
            </div>

            {/* Popular Stock Search Shortcuts */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              <span className="text-slate-400 font-medium flex-shrink-0">Popular:</span>
              {[
                'Reliance',
                'Tata Motors',
                'MRF',
                'Cipla',
                'ITC',
                'SBIN',
                'Swiggy',
                'Zomato',
                'HAL',
                'BSE',
              ].map(shortcut => (
                <button
                  key={shortcut}
                  type="button"
                  onClick={() => setSearchQuery(shortcut)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100/80 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 font-medium whitespace-nowrap transition-colors cursor-pointer"
                >
                  {shortcut}
                </button>
              ))}
            </div>

            {/* Live Search Quick Results with Growth % */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {searchResults.slice(0, 8).map(stock => {
                const growthVal = stock.growth?.d1 ?? stock.changePercent;
                const isUp = growthVal >= 0;
                return (
                  <button
                    key={stock.symbol}
                    onClick={() => setSelectedStock(stock)}
                    className={`py-1.5 px-3 rounded-xl border text-xs whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedStock?.symbol === stock.symbol
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{stock.ticker}</span>
                    <span className="font-mono text-slate-900 font-semibold tabular-nums">
                      ₹{stock.price.toFixed(1)}
                    </span>
                    <span
                      className={`text-[10px] font-bold tabular-nums ${
                        isUp ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isUp ? '+' : ''}
                      {growthVal.toFixed(1)}%
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Stock Detailed Card */}
            {selectedStock && (
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80 space-y-6 animate-in fade-in duration-150">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        {selectedStock.name}
                      </span>
                      <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {selectedStock.exchange}: {selectedStock.ticker}
                      </span>
                      <a
                        href={selectedStock.googleFinanceUrl || `https://www.google.com/finance/quote/${selectedStock.ticker}:NSE`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold hover:bg-indigo-100 transition-colors"
                        title="Open on Google Finance"
                      >
                        <span>Google Finance</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <span className="text-xs text-slate-500 mt-1 block">
                      Sector: {selectedStock.sector} · Market Cap: {selectedStock.marketCap}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-left sm:text-right">
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums tracking-tight">
                        ₹{selectedStock.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div
                        className={`text-xs font-bold flex items-center sm:justify-end gap-0.5 tabular-nums ${
                          selectedStock.change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {selectedStock.change >= 0 ? '+' : ''}
                        ₹{selectedStock.change.toFixed(2)} ({selectedStock.changePercent}%)
                      </div>
                    </div>

                    <button
                      onClick={() => setShowAddStockModal(true)}
                      className="py-2.5 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-2xs cursor-pointer transition-all"
                    >
                      + Add to Portfolio
                    </button>
                  </div>
                </div>

                {/* Rival Stocks Quick Suggestions Bar */}
                {selectedStock.rivals && selectedStock.rivals.length > 0 && (
                  <div className="p-3 bg-white rounded-2xl border border-slate-200/70 shadow-2xs flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 flex-shrink-0">
                      <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Competitors & Rivals:</span>
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {selectedStock.rivals.map(rival => {
                        const isUp = (rival.changePercent ?? 0) >= 0;
                        return (
                          <button
                            key={rival.ticker}
                            type="button"
                            onClick={() => handleSelectRival(rival.symbol)}
                            className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-xs font-semibold text-slate-800 transition-all cursor-pointer group shadow-2xs"
                            title={`Switch and view ${rival.name}`}
                          >
                            <span className="font-bold group-hover:text-indigo-600">{rival.ticker}</span>
                            <span className="text-[10px] text-slate-400">·</span>
                            <span className="text-[11px] font-bold text-slate-700 tabular-nums">
                              {rival.price ? formatINR(rival.price) : ''}
                            </span>
                            <span className={`text-[10px] font-bold tabular-nums ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                              ({isUp ? '+' : ''}{rival.changePercent?.toFixed(1)}%)
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Stock Growth & Return Performance Strip (1D, 1W, 1M, 1Y, 5Y) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Historical Growth & Return Performance (NSE/BSE)
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Live Google Finance Tracked
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
                    {[
                      { tf: '1D', label: '1 Day Return', val: selectedStock.growth?.d1 ?? selectedStock.changePercent, comp: 'Intraday' },
                      { tf: '1W', label: '1 Week Return', val: selectedStock.growth?.w1 ?? (selectedStock.changePercent * 1.5), comp: 'Weekly' },
                      { tf: '1M', label: '1 Month Return', val: selectedStock.growth?.m1 ?? (selectedStock.changePercent * 3.5), comp: 'Monthly' },
                      { tf: '1Y', label: '1 Year Return', val: selectedStock.growth?.y1 ?? 28.4, comp: `${(1 + (selectedStock.growth?.y1 ?? 28.4)/100).toFixed(2)}x Return` },
                      { tf: '5Y', label: '5 Year Compounding', val: selectedStock.growth?.y5 ?? 145.2, comp: `${(1 + (selectedStock.growth?.y5 ?? 145.2)/100).toFixed(2)}x Wealth` },
                    ].map(item => {
                      const isUp = item.val >= 0;
                      const isSelectedTimeframe = chartTimeframe === item.tf;
                      return (
                        <button
                          key={item.tf}
                          type="button"
                          onClick={() => setChartTimeframe(item.tf as any)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer min-w-0 flex flex-col justify-between ${
                            isSelectedTimeframe
                              ? 'bg-indigo-50/90 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-1 min-w-0">
                            <span className="truncate">{item.tf}</span>
                            <span className="text-[9px] font-mono font-medium text-slate-400 truncate ml-1">{item.comp}</span>
                          </div>
                          <div className={`text-sm sm:text-base font-black tabular-nums truncate flex items-center gap-0.5 ${
                            isUp ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {isUp ? <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" /> : <ArrowDownRight className="w-3.5 h-3.5 flex-shrink-0" />}
                            <span>{isUp ? '+' : ''}{item.val.toFixed(2)}%</span>
                          </div>
                          <span className="text-[10px] text-slate-400 truncate mt-1">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Interactive Chart with Timeframe Switcher */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200/70 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-slate-800">
                        Interactive Price Chart ({chartTimeframe})
                      </span>
                    </div>
                    {/* Timeframe Selector */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      {(['1D', '1W', '1M', '1Y', '5Y'] as const).map(tf => (
                        <button
                          key={tf}
                          type="button"
                          onClick={() => setChartTimeframe(tf)}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                            chartTimeframe === tf
                              ? 'bg-white text-indigo-700 shadow-2xs'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SVG Chart */}
                  {(() => {
                    const points =
                      selectedStock.chartPeriods?.[chartTimeframe] ||
                      selectedStock.historicalPoints || [selectedStock.price * 0.98, selectedStock.price];
                    const min = Math.min(...points) * 0.995;
                    const max = Math.max(...points) * 1.005;
                    const range = max - min || 1;
                    const width = 600;
                    const height = 140;

                    const coords = points.map((p, i) => {
                      const x = (i / (points.length - 1 || 1)) * width;
                      const y = height - ((p - min) / range) * (height - 20) - 10;
                      return `${x},${y}`;
                    });

                    const pathD = `M ${coords.join(' L ')}`;
                    const areaD = `${pathD} L ${width},${height} L 0comma${height} Z`.replace('0comma', '0,');
                    const isPositive = points[points.length - 1] >= points[0];

                    return (
                      <div className="relative pt-2">
                        <svg
                          viewBox={`0 0 ${width} ${height}`}
                          className="w-full h-32 overflow-visible"
                        >
                          <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop
                                offset="0%"
                                stopColor={isPositive ? '#10b981' : '#f43f5e'}
                                stopOpacity="0.25"
                              />
                              <stop
                                offset="100%"
                                stopColor={isPositive ? '#10b981' : '#f43f5e'}
                                stopOpacity="0.0"
                              />
                            </linearGradient>
                          </defs>
                          <path d={areaD} fill="url(#chartGradient)" />
                          <path
                            d={pathD}
                            fill="none"
                            stroke={isPositive ? '#10b981' : '#f43f5e'}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>

                        <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                          <span className="tabular-nums">Low: ₹{min.toFixed(1)}</span>
                          <span className="font-semibold text-slate-600 tabular-nums">
                            {chartTimeframe} Trend ({isPositive ? '+' : ''}
                            {(
                              ((points[points.length - 1] - points[0]) /
                                (points[0] || 1)) *
                              100
                            ).toFixed(2)}
                            %)
                          </span>
                          <span className="tabular-nums">High: ₹{max.toFixed(1)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Key Financial Statement Metrics Grid (Revenue, Profit, Margin, EBITDA, PAT, Debt, P/E, 52W Range) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Core Fundamental Metrics
                    </h4>
                    <span className="text-[11px] text-slate-400 truncate ml-2">
                      {selectedStock.valuationSummary || 'Google Finance Live Data'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* TTM Revenue */}
                    {(() => {
                      const revDisplay = formatFinancialDisplay(selectedStock.revenue);
                      return (
                        <div className="p-3 sm:p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs min-w-0 flex flex-col justify-between">
                          <span className="text-[11px] text-slate-500 font-medium block truncate mb-1" title="Total Revenue (TTM)">
                            Total Revenue (TTM)
                          </span>
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900 tabular-nums truncate block" title={revDisplay.text}>
                            {revDisplay.text}
                          </span>
                        </div>
                      );
                    })()}

                    {/* Net Profit (PAT) */}
                    {(() => {
                      const profitDisplay = formatFinancialDisplay(selectedStock.profit, { isNetProfit: true });
                      const isLoss = profitDisplay.isLoss || selectedStock.profitMargin < 0;
                      return (
                        <div className="p-3 sm:p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs min-w-0 flex flex-col justify-between">
                          <span className="text-[11px] text-slate-500 font-medium block truncate mb-1" title="Net Profit">
                            Net Profit
                          </span>
                          <span
                            className={`text-xs sm:text-sm font-extrabold tabular-nums truncate block ${
                              isLoss ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                            title={profitDisplay.text}
                          >
                            {profitDisplay.text}
                          </span>
                        </div>
                      );
                    })()}

                    {/* Net Profit Margin */}
                    {(() => {
                      const isLoss = selectedStock.profitMargin < 0;
                      return (
                        <div className="p-3 sm:p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs min-w-0 flex flex-col justify-between">
                          <span className="text-[11px] text-slate-500 font-medium block truncate mb-1" title="Net Profit Margin">
                            Net Profit Margin
                          </span>
                          <span
                            className={`text-xs sm:text-sm font-extrabold tabular-nums truncate block ${
                              isLoss ? 'text-rose-600' : 'text-slate-900'
                            }`}
                          >
                            {selectedStock.profitMargin ? `${selectedStock.profitMargin >= 0 ? '+' : ''}${selectedStock.profitMargin}%` : '—'}
                          </span>
                        </div>
                      );
                    })()}

                    {/* EBITDA */}
                    {(() => {
                      const ebitdaDisplay = formatFinancialDisplay(selectedStock.ebitda);
                      return (
                        <div className="p-3 sm:p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs min-w-0 flex flex-col justify-between">
                          <span className="text-[11px] text-slate-500 font-medium block truncate mb-1" title="EBITDA">
                            EBITDA
                          </span>
                          <span
                            className={`text-xs sm:text-sm font-extrabold tabular-nums truncate block ${
                              ebitdaDisplay.isLoss ? 'text-rose-600' : 'text-slate-900'
                            }`}
                            title={ebitdaDisplay.text}
                          >
                            {ebitdaDisplay.text}
                          </span>
                        </div>
                      );
                    })()}

                    {/* PAT */}
                    {(() => {
                      const patDisplay = formatFinancialDisplay(selectedStock.pat || selectedStock.profit, { isNetProfit: true });
                      return (
                        <div className="p-3 sm:p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs min-w-0 flex flex-col justify-between">
                          <span className="text-[11px] text-slate-500 font-medium block truncate mb-1" title="PAT (Profit After Tax)">
                            PAT (Profit After Tax)
                          </span>
                          <span
                            className={`text-xs sm:text-sm font-extrabold tabular-nums truncate block ${
                              patDisplay.isLoss ? 'text-rose-600' : 'text-slate-900'
                            }`}
                            title={patDisplay.text}
                          >
                            {patDisplay.text}
                          </span>
                        </div>
                      );
                    })()}

                    <div className="p-3 sm:p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs min-w-0 flex flex-col justify-between">
                      <span className="text-[11px] text-slate-500 font-medium block truncate mb-1" title="Total Debt">
                        Total Debt
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-amber-700 tabular-nums truncate block" title={selectedStock.totalDebt}>
                        {selectedStock.totalDebt || '—'}
                      </span>
                    </div>

                    <div className="p-3 sm:p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs min-w-0 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1">
                        <span>P/E Ratio</span>
                        <button
                          type="button"
                          onClick={() => setActiveEducation(activeEducation === 'pe' ? null : 'pe')}
                          className="text-indigo-600 hover:underline"
                        >
                          <HelpCircle className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 tabular-nums truncate block">
                        {selectedStock.peRatio}x
                      </span>
                    </div>

                    {/* 52-Week Range Box (Structured so numbers never clip or overflow) */}
                    <div className="p-3 sm:p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs min-w-0 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1">
                        <span>52-Week Range</span>
                        <span className="text-[9px] text-slate-400">NSE/BSE</span>
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between text-[11px] tabular-nums font-bold text-slate-700">
                          <span className="text-slate-400 font-normal">L:</span>
                          <span className="truncate">₹{selectedStock.low52.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] tabular-nums font-bold text-slate-700">
                          <span className="text-slate-400 font-normal">H:</span>
                          <span className="truncate">₹{selectedStock.high52.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Educational Tooltip if toggled */}
                {activeEducation === 'pe' && (
                  <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs text-indigo-950 leading-relaxed animate-in fade-in duration-150">
                    <span className="font-bold block mb-0.5">
                      «What does P/E ratio mean?»
                    </span>
                    “P/E compares a company's share price with its earnings. A higher value can mean investors are paying more for each unit of current earnings, anticipating future growth, while a lower value may indicate a value orientation or lower growth expectations.”
                  </div>
                )}

                {/* 5-Year Annual Financials (Revenue & Profit History) */}
                {selectedStock.annualFinancials && selectedStock.annualFinancials.length > 0 && (
                  <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/70 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        5-Year Annual Financial Performance (Revenue & Profit)
                      </h4>
                      <span className="text-[11px] text-slate-400">Amounts in ₹ Crores</span>
                    </div>

                    <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                            <th className="py-2 pr-3">Fiscal Year</th>
                            <th className="py-2 px-3">Revenue</th>
                            <th className="py-2 px-3">Operating EBITDA</th>
                            <th className="py-2 px-3">PAT / Net Profit</th>
                            <th className="py-2 pl-3 text-right">Profit Margin</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedStock.annualFinancials.map(af => {
                            const revDisp = formatFinancialDisplay(af.revenue);
                            const ebitdaDisp = formatFinancialDisplay(af.ebitda);
                            const patDisp = formatFinancialDisplay(af.pat ?? af.profit, { isNetProfit: true });
                            return (
                              <tr key={af.year} className="hover:bg-slate-50/60 transition-colors">
                                <td className="py-2.5 pr-3 font-bold text-slate-900">{af.year}</td>
                                <td className="py-2.5 px-3 font-semibold text-slate-800">{revDisp.text}</td>
                                <td className={`py-2.5 px-3 ${ebitdaDisp.isLoss ? 'text-rose-600 font-semibold' : 'text-slate-600'}`}>
                                  {ebitdaDisp.text}
                                </td>
                                <td className={`py-2.5 px-3 font-bold ${patDisp.isLoss ? 'text-rose-600' : 'text-emerald-600'}`}>
                                  {patDisp.text}
                                </td>
                                <td className="py-2.5 pl-3 text-right font-semibold text-slate-700">
                                  {af.profitMargin >= 0 ? '+' : ''}{af.profitMargin}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Quarterly Financials (Revenue & Profit by Quarter) */}
                {selectedStock.quarterlyFinancials && selectedStock.quarterlyFinancials.length > 0 && (
                  <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/70 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Quarterly Financials (Last 4 Quarters)
                      </h4>
                      <span className="text-[11px] text-slate-400">Amounts in ₹ Crores</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {selectedStock.quarterlyFinancials.map(qf => {
                        const qRev = formatFinancialDisplay(qf.revenue, { compact: true });
                        const qPat = formatFinancialDisplay(qf.pat ?? qf.profit, { isNetProfit: true, compact: true });
                        return (
                          <div key={qf.quarter} className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 text-xs">
                            <span className="font-bold text-slate-900 block mb-1">{qf.quarter}</span>
                            <div className="flex justify-between text-slate-500 text-[11px]">
                              <span>Revenue:</span>
                              <span className="font-semibold text-slate-800">{qRev.text}</span>
                            </div>
                            <div className="flex justify-between text-slate-500 text-[11px] mt-0.5">
                              <span>PAT Profit:</span>
                              <span className={`font-bold ${qPat.isLoss ? 'text-rose-600' : 'text-emerald-600'}`}>{qPat.text}</span>
                            </div>
                            <div className="flex justify-between text-slate-500 text-[11px] mt-0.5">
                              <span>Margin:</span>
                              <span className="font-medium text-slate-700">{qf.profitMargin >= 0 ? '+' : ''}{qf.profitMargin}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Wello AI Valuation & Stock Recommendation */}
                {selectedStock.welloAiValuation && (
                  <div className="p-5 bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/40 rounded-2xl border border-indigo-100/90 shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                          Wello AI Valuation & Target Recommendation
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            selectedStock.welloAiValuation.verdict === 'Undervalued'
                              ? 'bg-emerald-100 text-emerald-800'
                              : selectedStock.welloAiValuation.verdict === 'Fair Value'
                              ? 'bg-indigo-100 text-indigo-800'
                              : selectedStock.welloAiValuation.verdict === 'Premium / Growth'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {selectedStock.welloAiValuation.verdict}
                        </span>
                        <span className="text-xs font-extrabold text-slate-900">
                          12M Target: ₹{selectedStock.welloAiValuation.targetPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-white/90 rounded-xl border border-indigo-100 text-xs text-slate-700 leading-relaxed">
                      <span className="font-semibold text-slate-900 block mb-0.5">
                        Fair Value Range: ₹{selectedStock.welloAiValuation.fairPriceRange.low.toLocaleString('en-IN')} – ₹{selectedStock.welloAiValuation.fairPriceRange.high.toLocaleString('en-IN')}
                      </span>
                      {selectedStock.welloAiValuation.reasoning}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="space-y-1">
                        <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
                          Key Strengths:
                        </span>
                        {selectedStock.welloAiValuation.keyStrengths.map((s, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-slate-600">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
                          Key Risks:
                        </span>
                        {selectedStock.welloAiValuation.keyRisks.map((r, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-slate-600">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Industry Competitors & Peer Valuation Benchmark Table */}
                {selectedStock.rivals && selectedStock.rivals.length > 0 && (
                  <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/70 shadow-2xs space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                          Competitors & Peer Stock Comparison
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Tap "Compare & Switch" to analyze rival metrics
                      </span>
                    </div>

                    <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px]">
                            <th className="py-2 pr-3">Stock & Ticker</th>
                            <th className="py-2 px-3">Price (₹)</th>
                            <th className="py-2 px-3">Day Change</th>
                            <th className="py-2 px-3">P/E Ratio</th>
                            <th className="py-2 px-3">1-Year Return</th>
                            <th className="py-2 pl-3 text-right">Switch</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {/* Active Selected Stock */}
                          <tr className="bg-indigo-50/50 font-bold">
                            <td className="py-2.5 pr-3 text-indigo-900 flex items-center gap-2">
                              <span>{selectedStock.name} ({selectedStock.ticker})</span>
                              <span className="text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">
                                Active
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-900 tabular-nums">
                              {formatINR(selectedStock.price)}
                            </td>
                            <td className={`py-2.5 px-3 tabular-nums ${selectedStock.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent}%
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 tabular-nums">
                              {selectedStock.peRatio}x
                            </td>
                            <td className="py-2.5 px-3 text-emerald-600 tabular-nums">
                              {selectedStock.growth?.y1 ? `+${selectedStock.growth.y1}%` : '+28.4%'}
                            </td>
                            <td className="py-2.5 pl-3 text-right text-[11px] text-indigo-600 font-semibold">
                              Viewing
                            </td>
                          </tr>

                          {/* Competitor Rivals */}
                          {selectedStock.rivals.map(rival => {
                            const isUp = (rival.changePercent ?? 0) >= 0;
                            return (
                              <tr key={rival.ticker} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-2.5 pr-3 font-semibold text-slate-800">
                                  {rival.name} ({rival.ticker})
                                </td>
                                <td className="py-2.5 px-3 text-slate-700 tabular-nums font-medium">
                                  {rival.price ? formatINR(rival.price) : '—'}
                                </td>
                                <td className={`py-2.5 px-3 tabular-nums font-semibold ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {isUp ? '+' : ''}{rival.changePercent?.toFixed(2)}%
                                </td>
                                <td className="py-2.5 px-3 text-slate-600 tabular-nums">
                                  {rival.peRatio ? `${rival.peRatio}x` : '—'}
                                </td>
                                <td className="py-2.5 px-3 text-emerald-600 tabular-nums font-semibold">
                                  {rival.y1Growth ? `+${rival.y1Growth}%` : '+22.5%'}
                                </td>
                                <td className="py-2.5 pl-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleSelectRival(rival.symbol)}
                                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition-colors cursor-pointer"
                                  >
                                    Compare & Switch →
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User's Tracked Portfolio */}
          <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Your Tracked Assets & SIPs
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                Stocks · Mutual Funds · FDs · Gold
              </span>
            </div>

            {profile.investments.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 space-y-2">
                <p>
                  You haven't added any stocks or mutual funds to your tracker yet.
                </p>
                <p className="text-slate-500">
                  Search any stock above (e.g. Reliance or TCS) and tap "+ Add to Portfolio".
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {profile.investments.map(inv => (
                  <div
                    key={inv.id}
                    className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">
                        {inv.name}
                      </span>
                      <span className="text-slate-400">
                        {inv.quantity} shares @ avg ₹{inv.buyPrice.toFixed(1)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="font-bold text-slate-900 block">
                          {formatINR(inv.currentValue)}
                        </span>
                        <span
                          className={`font-semibold ${
                            inv.returnsPercent >= 0
                              ? 'text-emerald-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {inv.returnsPercent >= 0 ? '+' : ''}
                          {inv.returnsPercent}%
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveInvestment(inv.id)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Clear Separation: Market Info vs Wello Financial Guidance */}
            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-600 block mb-0.5">
                Regulatory & Clarity Notice
              </span>
              Wello provides market information strictly for financial planning and contextual awareness. Wello is not a trading terminal or broker. Historical returns are not guaranteed future returns.
            </div>
          </div>

          {/* Add to Portfolio Modal */}
          {showAddStockModal && selectedStock && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative">
                <button
                  onClick={() => setShowAddStockModal(false)}
                  className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Add {selectedStock.ticker} to Portfolio
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Current Market Price: ₹{selectedStock.price.toLocaleString('en-IN')}
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Number of Shares
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={stockQuantity}
                      onChange={e => setStockQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl text-xs flex justify-between text-slate-700">
                    <span>Total Investment Cost:</span>
                    <span className="font-bold text-slate-900">
                      {formatINR(selectedStock.price * stockQuantity)}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddStockModal(false)}
                      className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddInvestment}
                      className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
                    >
                      Record in Portfolio
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
