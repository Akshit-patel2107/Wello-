import React, { useState, useMemo, useEffect } from 'react';
import {
  Compass,
  X,
  Sparkles,
  Coins,
  Map,
  Target,
  Sliders,
  TrendingUp,
  CreditCard,
  PiggyBank,
  Receipt,
  Users,
  Shield,
  HelpCircle,
  PieChart,
  CheckCircle2,
  Search,
  LayoutGrid,
} from 'lucide-react';
import { NavTab } from './Navigation';

export interface FeatureItem {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  category: 'Dashboard' | 'Money & Spend' | 'Investments & Market' | 'Goals' | 'Advisory' | 'Privacy & Family';
  description: string;
  icon: React.FC<any>;
  badge?: string;
  gradient: string;
  action: {
    tab: NavTab;
    subTab?: string;
    modal?: 'cash' | 'progressive' | 'safeToSpendCalc';
  };
}

interface FeaturesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFeature: (action: FeatureItem['action']) => void;
}

// Complete Catalog of 24 Wello Features
export const ALL_FEATURES: FeatureItem[] = [
  // 1. Safe to spend
  {
    id: 'safe_to_spend',
    name: 'Safe-to-Spend Calculator',
    shortName: 'Safe-to-Spend',
    tagline: 'Discretionary margin after EMIs & SIPs',
    category: 'Dashboard',
    badge: 'Core Metric',
    gradient: 'from-indigo-600 to-blue-500',
    description: 'Calculate unallocated discretionary margin after essential living expenses, EMIs, and planned SIPs.',
    icon: Coins,
    action: { tab: 'home', modal: 'safeToSpendCalc' },
  },
  // 2. Health score
  {
    id: 'health_score',
    name: 'Financial Health Score (0–100)',
    shortName: 'Health Score',
    tagline: '4 Resilience pillars assessment',
    category: 'Dashboard',
    badge: '0–100 Score',
    gradient: 'from-emerald-600 to-teal-500',
    description: 'Transparent evaluation of spending balance, emergency resilience, debt load, and goal momentum.',
    icon: PieChart,
    action: { tab: 'home' },
  },
  // 3. Fast Cash Log
  {
    id: 'add_cash_expense',
    name: 'Log Cash Expense',
    shortName: 'Log Cash',
    tagline: '5-second quick street expense entry',
    category: 'Money & Spend',
    badge: 'Quick Tool',
    gradient: 'from-amber-500 to-orange-500',
    description: 'Record street cash, auto-rickshaw, chai, or vegetable expenses in under 5 seconds.',
    icon: Receipt,
    action: { tab: 'home', modal: 'cash' },
  },
  // 4. Financial Blueprint
  {
    id: 'financial_blueprint',
    name: 'Financial Blueprint',
    shortName: 'Life Blueprint',
    tagline: 'Complete net worth & asset/liability map',
    category: 'Money & Spend',
    badge: 'Life Map',
    gradient: 'from-sky-500 to-indigo-600',
    description: 'Visual map of your complete financial life: income, liquid buffer, debt, protection, and net worth.',
    icon: Map,
    action: { tab: 'money', subTab: 'blueprint' },
  },
  // 5. Expense Analytics
  {
    id: 'expense_breakdown',
    name: 'Household Expense Analytics',
    shortName: 'Expense Trends',
    tagline: 'Categorized breakdown & lifestyle trends',
    category: 'Money & Spend',
    badge: 'Spends',
    gradient: 'from-rose-500 to-pink-600',
    description: 'Categorized breakdown (Food, Transport, Bills, Shopping, Health) with lifestyle insights.',
    icon: PieChart,
    action: { tab: 'money', subTab: 'expenses' },
  },
  // 6. Income streams
  {
    id: 'income_sources',
    name: 'Income & Inflow Streams',
    shortName: 'Income Streams',
    tagline: 'Salary, freelance & dividend inflows',
    category: 'Money & Spend',
    badge: 'Cash Inflow',
    gradient: 'from-teal-600 to-emerald-500',
    description: 'Track primary salary alongside freelance, rental, business, or dividend revenue.',
    icon: Coins,
    action: { tab: 'money', subTab: 'income' },
  },
  // 7. Savings Buffer
  {
    id: 'savings_buffer',
    name: 'Emergency Savings Buffer',
    shortName: 'Savings Buffer',
    tagline: 'Exact months of living expenses covered',
    category: 'Money & Spend',
    badge: 'Runway',
    gradient: 'from-emerald-600 to-green-600',
    description: 'Non-judgmental calculation of exact months of essential living expenses covered.',
    icon: PiggyBank,
    action: { tab: 'money', subTab: 'savings' },
  },
  // 8. 50-30-20 Rule
  {
    id: 'salary_spending_advisor',
    name: '50-30-20 Salary Blueprint',
    shortName: '50-30-20 Plan',
    tagline: 'Needs, wants & wealth building split',
    category: 'Money & Spend',
    badge: 'Blueprint',
    gradient: 'from-violet-600 to-indigo-600',
    description: 'Personalized recommendations on how to spend your salary: needs, wants, and automated wealth building.',
    icon: Sliders,
    action: { tab: 'money', subTab: 'salary_spend' },
  },
  // 9. Loan Borrowing Power
  {
    id: 'loan_eligibility_calc',
    name: 'Salary Loan Borrowing Power',
    shortName: 'Borrowing Power',
    tagline: 'Home, car & personal loan limits',
    category: 'Money & Spend',
    badge: 'RBI Underwriting',
    gradient: 'from-blue-600 to-cyan-600',
    description: 'Calculate maximum home, personal, and car loan amounts eligible according to your monthly salary.',
    icon: CreditCard,
    action: { tab: 'money', subTab: 'loans' },
  },
  // 10. Can I Afford This?
  {
    id: 'purchase_affordability_ai',
    name: 'Can I Afford This? (AI Planner)',
    shortName: 'Can I Afford This?',
    tagline: 'AI purchase advice & EMI calculation',
    category: 'Money & Spend',
    badge: 'AI Planner',
    gradient: 'from-fuchsia-600 to-purple-600',
    description: 'Enter any item and interest rate to see required monthly salary, EMI, and get AI wealth advice.',
    icon: Sparkles,
    action: { tab: 'money', subTab: 'loans' },
  },
  // 11. Smart Credit Cards
  {
    id: 'smart_credit_hub',
    name: 'Smart Credit & Card Rules',
    shortName: 'Smart Credit',
    tagline: 'Billing cycles, perks & grace periods',
    category: 'Money & Spend',
    badge: 'Credit Intel',
    gradient: 'from-blue-500 to-indigo-600',
    description: 'Credit utilization rules, grace period hacks, and best cards tailored to your salary and usage.',
    icon: Shield,
    action: { tab: 'money', subTab: 'credit' },
  },
  // 12. Ask Wello AI
  {
    id: 'ask_wello_ai',
    name: 'Ask Wello — AI Wealth Manager',
    shortName: 'Ask Wello AI',
    tagline: 'Private, grounded Indian financial advisor',
    category: 'Advisory',
    badge: 'Gemini AI',
    gradient: 'from-indigo-600 to-violet-600',
    description: 'Ask “Can I afford a ₹50,000 phone?”, “What is an SIP?”, or “Can I buy a car next year?”.',
    icon: Sparkles,
    action: { tab: 'ask' },
  },
  // 13. Live Markets & Gold
  {
    id: 'live_market_indices',
    name: 'Live Markets & 24K Gold',
    shortName: 'Live Markets',
    tagline: 'Nifty 50, Sensex & Physical Gold',
    category: 'Investments & Market',
    badge: 'Live NSE/BSE',
    gradient: 'from-emerald-500 to-teal-600',
    description: 'Real-time performance of Nifty 50, BSE Sensex, Bank Nifty, Nifty IT, and Physical Gold (24K).',
    icon: TrendingUp,
    action: { tab: 'stocks' },
  },
  // 14. Stock Search
  {
    id: 'stock_search',
    name: 'Indian Stock & ETF Explorer',
    shortName: 'Stock Explorer',
    tagline: '80+ Indian stocks with 5-yr financials',
    category: 'Investments & Market',
    badge: 'Audited Data',
    gradient: 'from-cyan-600 to-blue-600',
    description: 'Search any listed stock (Reliance, TCS, HDFC, Infy) with 5-year financials, quarterly PAT, and EBITDA.',
    icon: Search,
    action: { tab: 'stocks' },
  },
  // 15. Goals & Milestones
  {
    id: 'goals_milestones',
    name: 'Financial Goals & Milestones',
    shortName: 'Goals & Targets',
    tagline: 'Home down payment, car & retirement',
    category: 'Goals',
    badge: 'Milestones',
    gradient: 'from-rose-500 to-red-600',
    description: 'Set emergency fund, vehicle, home down payment, education, travel, or wedding goals.',
    icon: Target,
    action: { tab: 'goals' },
  },
  // 16. Portfolio Tracker
  {
    id: 'portfolio_tracker',
    name: 'Investment & SIP Portfolio',
    shortName: 'Portfolio Tracker',
    tagline: 'Mutual funds, index ETFs & equity',
    category: 'Investments & Market',
    badge: 'Wealth Assets',
    gradient: 'from-blue-600 to-violet-600',
    description: 'Monitor mutual funds, stocks, gold, and index ETFs without trading terminal anxiety.',
    icon: TrendingUp,
    action: { tab: 'stocks' },
  },
  // 17. Priority Engine
  {
    id: 'what_matters_now',
    name: '“What Matters Now?” Engine',
    shortName: 'What Matters Now',
    tagline: 'Top 1–3 prioritized financial actions',
    category: 'Dashboard',
    badge: 'Priorities',
    gradient: 'from-amber-500 to-orange-600',
    description: 'Top 1–3 prioritized financial actions instead of overwhelming, noisy notification feeds.',
    icon: CheckCircle2,
    action: { tab: 'home' },
  },
  // 18. Debt Optimizer
  {
    id: 'loan_optimization',
    name: 'Loans, Debt & EMI Optimizer',
    shortName: 'Debt Optimizer',
    tagline: 'Accelerated payoff & interest saving',
    category: 'Money & Spend',
    badge: 'Debt Free',
    gradient: 'from-orange-500 to-red-500',
    description: 'Track outstanding balances, interest rates, and loan EMI percentage of monthly income.',
    icon: CreditCard,
    action: { tab: 'money', subTab: 'loans' },
  },
  // 19. Goal Simulator
  {
    id: 'goal_simulator',
    name: '“What If I Save More?” Simulator',
    shortName: 'Goal Simulator',
    tagline: 'Accelerate target completion date',
    category: 'Goals',
    badge: 'Interactive',
    gradient: 'from-violet-500 to-purple-600',
    description: 'Simulate saving ₹5,000 extra per month and see your target completion date accelerate.',
    icon: Sliders,
    action: { tab: 'goals' },
  },
  // 20. Market Jargon Buster
  {
    id: 'financial_dictionary',
    name: 'Market Jargon Buster',
    shortName: 'Market Education',
    tagline: 'Plain-English P/E, SIP & ETF explanations',
    category: 'Investments & Market',
    badge: 'Education',
    gradient: 'from-amber-600 to-yellow-600',
    description: 'Plain-English explanations of P/E ratios, rupee-cost averaging, and index investing.',
    icon: HelpCircle,
    action: { tab: 'stocks' },
  },
  // 21. Family Finance
  {
    id: 'family_finance',
    name: 'Family Finance & Shared Budgets',
    shortName: 'Family Finance',
    tagline: 'Spouse & household shared budgeting',
    category: 'Privacy & Family',
    badge: 'Household',
    gradient: 'from-teal-600 to-cyan-600',
    description: 'Add spouse or family members with customizable privacy and shared goal access.',
    icon: Users,
    action: { tab: 'profile' },
  },
  // 22. Progressive Setup
  {
    id: 'progressive_personalization',
    name: 'Progressive Personalization Setup',
    shortName: 'Vault Setup',
    tagline: 'Risk profile, term & health insurance',
    category: 'Privacy & Family',
    badge: 'Custom Vault',
    gradient: 'from-purple-600 to-indigo-600',
    description: 'Refine your age, risk preference, health/term insurance, and emergency target.',
    icon: Sparkles,
    action: { tab: 'home', modal: 'progressive' },
  },
  // 23. Privacy Controls
  {
    id: 'privacy_controls',
    name: '“Your Data” Privacy & Export',
    shortName: 'Privacy & Export',
    tagline: 'Full data backup & permanent wipe',
    category: 'Privacy & Family',
    badge: 'Data Vault',
    gradient: 'from-slate-600 to-slate-800',
    description: 'Full transparency into what Wello knows, export JSON backup, or wipe account permanently.',
    icon: Shield,
    action: { tab: 'profile' },
  },
];

// The Primary 16 Features arranged in 4x4 Core
export const CORE_16_FEATURES: FeatureItem[] = ALL_FEATURES.slice(0, 16);

// 8 Curated Trending & High-Impact Features for the clean landing view
export const TRENDING_FEATURES_CONFIG: { id: string; trendingBadge: string }[] = [
  { id: 'safe_to_spend', trendingBadge: '🔥 #1 Most Used' },
  { id: 'live_market_indices', trendingBadge: '⚡ Live Rates' },
  { id: 'stock_search', trendingBadge: '📊 Financials' },
  { id: 'ask_wello_ai', trendingBadge: '🤖 Gemini AI' },
  { id: 'purchase_affordability_ai', trendingBadge: '💡 Can I Afford?' },
  { id: 'add_cash_expense', trendingBadge: '⚡ 5-Sec Entry' },
  { id: 'salary_spending_advisor', trendingBadge: '🎯 50-30-20' },
  { id: 'health_score', trendingBadge: '🛡️ 0–100 Score' },
];

export const TRENDING_FEATURES: FeatureItem[] = TRENDING_FEATURES_CONFIG.map(cfg => {
  const item = ALL_FEATURES.find(f => f.id === cfg.id) || ALL_FEATURES[0];
  return {
    ...item,
    badge: cfg.trendingBadge,
  };
});

type TabType = 'trending' | '4x4' | 'money' | 'invest' | 'goals' | 'vault' | 'all';

export const FeaturesDrawer: React.FC<FeaturesDrawerProps> = ({
  isOpen,
  onClose,
  onSelectFeature,
}) => {
  // Always default to trending so user gets an uncrowded, spacious landing
  const [activeTab, setActiveTab] = useState<TabType>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [allPageIndex, setAllPageIndex] = useState<0 | 1>(0);

  // Reset to trending & clear search whenever dialog opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('trending');
      setSearchQuery('');
      setAllPageIndex(0);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter features
  const displayedFeatures = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return ALL_FEATURES.filter(
        item =>
          item.name.toLowerCase().includes(q) ||
          item.shortName.toLowerCase().includes(q) ||
          item.tagline.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.badge && item.badge.toLowerCase().includes(q))
      );
    }

    switch (activeTab) {
      case 'trending':
        return TRENDING_FEATURES;
      case '4x4':
        return CORE_16_FEATURES;
      case 'money':
        return ALL_FEATURES.filter(f => f.category === 'Money & Spend');
      case 'invest':
        return ALL_FEATURES.filter(f => f.category === 'Investments & Market');
      case 'goals':
        return ALL_FEATURES.filter(f => f.category === 'Goals' || f.category === 'Advisory' || f.category === 'Dashboard');
      case 'vault':
        return ALL_FEATURES.filter(f => f.category === 'Privacy & Family');
      case 'all':
        return allPageIndex === 0 ? ALL_FEATURES.slice(0, 12) : ALL_FEATURES.slice(12);
      default:
        return TRENDING_FEATURES;
    }
  }, [activeTab, searchQuery, allPageIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Responsive Modal Window - Perfectly fitted for Laptop and Desktop */}
      <div className="relative bg-white rounded-3xl max-w-4xl lg:max-w-5xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-b border-slate-100 bg-[#FBFBFC] flex items-center justify-between flex-shrink-0 gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
              {activeTab === 'trending' ? (
                <Sparkles className="w-4 h-4 text-amber-300" />
              ) : (
                <LayoutGrid className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  {activeTab === 'trending' ? 'Trending & Important Features' : 'Wello Feature Directory'}
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full">
                  {activeTab === 'trending' && '🔥 8 Top Tools'}
                  {activeTab === '4x4' && '⚡ 16 Core Tools'}
                  {activeTab === 'money' && '💰 Money & Spend'}
                  {activeTab === 'invest' && '📈 Markets'}
                  {activeTab === 'goals' && '🎯 Goals & AI'}
                  {activeTab === 'vault' && '🛡️ Vault'}
                  {activeTab === 'all' && '📱 24 Features'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-normal mt-0.5">
                {activeTab === 'trending'
                  ? 'Curated popular & essential wealth tools · Click any tile to launch'
                  : 'Fast launcher · Click any tile to open instantly'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Search Input */}
            <div className="relative hidden md:block">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Find feature..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100/90 hover:bg-slate-200/60 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 border border-slate-200/80 outline-none w-40 transition-all text-slate-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Responsive Sub-options Bar (Clean Segmented Tabs that Fit Laptop Screen Without Overflow) */}
        {!searchQuery && (
          <div className="px-4 sm:px-6 py-2 border-b border-slate-100 bg-white flex items-center justify-between gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
              {/* 1. Trending & Important */}
              <button
                type="button"
                onClick={() => setActiveTab('trending')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'trending'
                    ? 'bg-indigo-600 text-white shadow-2xs shadow-indigo-600/30'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Trending</span>
              </button>

              {/* 2. All Features (4x4) */}
              <button
                type="button"
                onClick={() => setActiveTab('4x4')}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === '4x4'
                    ? 'bg-indigo-600 text-white shadow-2xs shadow-indigo-600/30'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>4×4 Core</span>
              </button>

              {/* 3. Money & Spend */}
              <button
                type="button"
                onClick={() => setActiveTab('money')}
                className={`py-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'money'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                Money & Spend
              </button>

              {/* 4. Markets & Stocks */}
              <button
                type="button"
                onClick={() => setActiveTab('invest')}
                className={`py-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'invest'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                Markets & Stocks
              </button>

              {/* 5. Goals & Advisory */}
              <button
                type="button"
                onClick={() => setActiveTab('goals')}
                className={`py-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'goals'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                Goals & AI
              </button>

              {/* 6. Vault & Profile */}
              <button
                type="button"
                onClick={() => setActiveTab('vault')}
                className={`py-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'vault'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                Vault & Profile
              </button>

              {/* 7. Complete 24 Features */}
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`py-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                All 24
              </button>
            </div>

            {/* In "All 24 Features" mode: 2 clean pages toggle */}
            {activeTab === 'all' && (
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg flex-shrink-0">
                <button
                  onClick={() => setAllPageIndex(0)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    allPageIndex === 0
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  1–12
                </button>
                <button
                  onClick={() => setAllPageIndex(1)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    allPageIndex === 1
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  13–24
                </button>
              </div>
            )}
          </div>
        )}

        {/* Feature Cards Grid (Flexible height, comfortable scrolling on laptop if needed) */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 bg-slate-50/70">
          <div
            className={
              activeTab === 'trending'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5'
                : 'grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3'
            }
          >
            {displayedFeatures.map(item => {
              const Icon = item.icon;
              const isTrending = activeTab === 'trending';

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectFeature(item.action);
                    onClose();
                  }}
                  className={`group relative rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between text-left hover:-translate-y-0.5 active:scale-[0.98] shadow-2xs ${
                    isTrending
                      ? 'p-4 min-h-[104px] sm:min-h-[114px]'
                      : 'p-3 sm:p-3.5 min-h-[84px] sm:min-h-[92px]'
                  }`}
                  title={`${item.name} — ${item.description}`}
                >
                  {/* Top: Squircle Icon + Mini Badge */}
                  <div className="flex items-center justify-between gap-1.5 w-full">
                    <div
                      className={`rounded-xl bg-gradient-to-tr ${item.gradient} text-white flex items-center justify-center shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform ${
                        isTrending ? 'w-9 h-9 sm:w-10 sm:h-10' : 'w-7 h-7 sm:w-8 sm:h-8'
                      }`}
                    >
                      <Icon className={isTrending ? 'w-4.5 h-4.5 sm:w-5 sm:h-5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'} />
                    </div>

                    {item.badge && (
                      <span
                        className={`font-semibold rounded-md group-hover:bg-indigo-50 group-hover:text-indigo-700 transition-colors whitespace-nowrap ${
                          isTrending
                            ? 'text-[10px] text-indigo-700 bg-indigo-50/90 border border-indigo-100 px-2 py-0.5 font-bold'
                            : 'text-[9px] text-slate-500 bg-slate-100/90 px-1.5 py-0.5'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Title & Micro-Tagline with Proper Line Heights (No clipped alphabets) */}
                  <div className={isTrending ? 'mt-3 w-full' : 'mt-2 w-full'}>
                    <h4
                      className={`font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-1 break-words ${
                        isTrending ? 'text-xs sm:text-sm' : 'text-xs sm:text-[13px]'
                      }`}
                    >
                      {item.shortName}
                    </h4>
                    <p
                      className={`text-slate-500 font-medium leading-snug line-clamp-1 break-words mt-0.5 ${
                        isTrending ? 'text-[11px] sm:text-xs' : 'text-[10px] sm:text-[11px]'
                      }`}
                    >
                      {item.tagline}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* If search returned no results */}
          {displayedFeatures.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Compass className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600">
                No features found matching "{searchQuery}"
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>

        {/* Bottom Status & Key Hints Bar */}
        <div className="px-5 py-2.5 sm:px-6 bg-white border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-indigo-600">
              {displayedFeatures.length}{' '}
              {activeTab === 'trending'
                ? 'Trending Highlights'
                : activeTab === '4x4'
                ? 'Core Matrix Tools'
                : 'Features'}
            </span>
            <span className="hidden sm:inline text-slate-400">·</span>
            <span className="hidden sm:inline text-slate-400">
              Click any tile to open instantly
            </span>
          </div>

          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-medium text-slate-600 bg-slate-100 rounded border border-slate-200">
              Esc to close
            </kbd>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono font-medium text-slate-600 bg-slate-100 rounded border border-slate-200">
              ⌘K
            </kbd>
          </div>
        </div>

      </div>
    </div>
  );
};
