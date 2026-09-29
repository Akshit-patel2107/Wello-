export interface UserAuth {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  loginMethod: 'google';
  createdAt: string;
}

export type LoanType =
  | 'no_loans'
  | 'home'
  | 'education'
  | 'personal'
  | 'vehicle'
  | 'credit_card'
  | 'other';

export interface LoanItem {
  id: string;
  type: LoanType;
  name: string;
  outstanding: number;
  emi: number;
  interestRate?: number;
  remainingMonths?: number;
}

export type GoalType =
  | 'emergency_fund'
  | 'education'
  | 'car'
  | 'house'
  | 'travel'
  | 'marriage'
  | 'startup'
  | 'retirement'
  | 'custom';

export interface FinancialGoal {
  id: string;
  type: GoalType;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM
  monthlyContribution: number;
  category?: string;
}

export interface InvestmentAsset {
  id: string;
  symbol: string;
  ticker: string;
  name: string;
  type: 'stock' | 'mutual_fund' | 'etf' | 'fd' | 'gold' | 'ppf' | 'nps' | 'other';
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  investedAmount: number;
  currentValue: number;
  returnsPercent: number;
  exchange?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: 'Spouse' | 'Parent' | 'Child' | 'Sibling' | 'Partner' | 'Other';
  income: number;
  expenses: number;
  accessScope: 'read_only' | 'shared_goals' | 'full';
}

export interface CashExpense {
  id: string;
  category: 'Food' | 'Transport' | 'Shopping' | 'Bills' | 'Entertainment' | 'Education' | 'Health' | 'Other';
  amount: number;
  note: string;
  timestamp: string;
}

export interface ProgressiveDetails {
  age?: number;
  riskPreference?: 'conservative' | 'balanced' | 'growth';
  insuranceHealthCover?: number;
  insuranceTermCover?: number;
  dependents?: number;
  retirementTargetAge?: number;
  monthlySipTotal?: number;
  emergencyFundMonthsTarget?: number;
  upcomingMajorExpense?: {
    description: string;
    amount: number;
    targetMonth: string;
  };
  hasSpouseIncome?: boolean;
  spouseIncome?: number;
  hasFamilyIncome?: boolean;
  familyIncome?: number;
  includeFamilyInCalculations?: boolean;
}

export interface FinancialProfile {
  monthlyIncome: number;
  incomeSources: Array<{ id: string; name: string; amount: number }>;
  monthlyExpenses: number;
  expenseCategories: {
    Food: number;
    Transport: number;
    Shopping: number;
    Bills: number;
    Entertainment: number;
    Education: number;
    Health: number;
    Other: number;
  };
  currentSavings: number;
  emergencyFund: number;
  loans: LoanItem[];
  goals: FinancialGoal[];
  investments: InvestmentAsset[];
  familyMembers: FamilyMember[];
  cashExpenses: CashExpense[];
  progressiveDetails: ProgressiveDetails;
  dismissedPopups: string[];
  lastUpdated: string;
}

export interface AnnualFinancial {
  year: string;
  revenue: number; // In ₹ Crores
  profit: number; // Net Profit In ₹ Crores
  pat: number; // Profit After Tax In ₹ Crores
  ebitda: number; // In ₹ Crores
  profitMargin: number; // %
}

export interface QuarterlyFinancial {
  quarter: string;
  revenue: number; // In ₹ Crores
  profit: number; // In ₹ Crores
  pat: number; // In ₹ Crores
  ebitda: number; // In ₹ Crores
  profitMargin: number; // %
}

export interface StockValuationAnalysis {
  verdict: 'Undervalued' | 'Fair Value' | 'Premium / Growth' | 'Watchlist / High Multiple';
  fairPriceRange: { low: number; high: number };
  targetPrice: number;
  reasoning: string;
  keyStrengths: string[];
  keyRisks: string[];
}

export interface MarketQuote {
  symbol: string;
  ticker: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  high52: number;
  low52: number;
  marketCap: string;
  peRatio: number;
  pbRatio?: number;
  sector: string;
  description: string;
  historicalPoints: number[];
  chartPeriods?: {
    '1D': number[];
    '1W': number[];
    '1M': number[];
    '1Y': number[];
    '5Y': number[];
  };
  // Detailed Fundamental Financials
  revenue: string;
  revenueNum?: number;
  profit: string;
  profitNum?: number;
  profitMargin: number;
  ebitda: string;
  ebitdaNum?: number;
  pat: string;
  patNum?: number;
  totalDebt: string;
  valuationSummary: string;
  _isPartialSearch?: boolean;
  growth?: {
    d1: number;
    w1: number;
    m1: number;
    y1: number;
    y5: number;
  };
  googleFinanceUrl?: string;
  rivals?: Array<{
    ticker: string;
    name: string;
    symbol: string;
    sector?: string;
    price?: number;
    changePercent?: number;
    peRatio?: number;
    y1Growth?: number;
  }>;
  annualFinancials: AnnualFinancial[];
  quarterlyFinancials: QuarterlyFinancial[];
  welloAiValuation: StockValuationAnalysis;
}

export interface CreditCardRecommendation {
  id: string;
  name: string;
  bank: string;
  category: 'Cashback' | 'Shopping' | 'Travel' | 'Dining' | 'Fuel' | 'UPI RuPay' | 'All-Rounder';
  minSalaryMonthly: number;
  annualFee: number;
  feeWaiverCondition: string;
  rewardRate: string;
  perks: string[];
  bestFor: string;
  rating: number;
  welcomeBonus?: string;
  fitReason: string;
  cardNetwork: 'Visa' | 'Mastercard' | 'RuPay' | 'American Express';
  isLifetimeFree?: boolean;
}

export interface PurchaseAffordabilityPlan {
  itemName: string;
  totalCost: number;
  downPayment: number;
  interestRate: number;
  tenureMonths: number;
  monthlyEmi: number;
  totalInterest: number;
  requiredMonthlySalary: number;
  suggestedCashMonths: number;
  affordabilityStatus: 'Comfortable' | 'Moderate / Safe Stretch' | 'High Risk / Unadvised';
  aiVerdict?: string;
}

export interface LoanEligibilityBreakdown {
  loanType: 'home' | 'personal' | 'car' | 'education';
  title: string;
  maxAmount: number;
  maxTenureYears: number;
  typicalInterestRate: number;
  maxPermittedEmi: number;
  currentEmiDeduction: number;
  netAvailableEmi: number;
  borrowingCapacityMultiplier: string;
  recommendation: string;
}

export interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
  tag: string;
}

export interface SafeToSpendBreakdown {
  safeToSpend: number;
  monthlyIncome: number;
  essentialExpenses: number;
  loanEmis: number;
  plannedSavings: number;
  goalContributions: number;
  bufferMargin: number;
}

export interface HealthScoreAnalysis {
  totalScore: number;
  summary: string;
  factors: {
    spendingBalance: { score: number; max: number; status: string; note: string };
    emergencyReadiness: { score: number; max: number; status: string; note: string };
    debtLoad: { score: number; max: number; status: string; note: string };
    savingsMomentum: { score: number; max: number; status: string; note: string };
  };
  prioritizedActions: Array<{
    id: string;
    title: string;
    description: string;
    buttonText: string;
    tabTarget: string;
    urgency: 'high' | 'medium' | 'low';
  }>;
}
