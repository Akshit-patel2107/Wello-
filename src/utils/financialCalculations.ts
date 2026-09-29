import { FinancialProfile, HealthScoreAnalysis, SafeToSpendBreakdown } from '../types/financial';

/**
 * Format currency in Indian numbering system: ₹1,50,000 or ₹12.5 Lakhs
 */
export function formatINR(amount: number, compact = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';

  if (compact) {
    const abs = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    if (abs >= 10000000) {
      return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
    }
    if (abs >= 100000) {
      return `${sign}₹${(abs / 100000).toFixed(1)} L`;
    }
    if (abs >= 1000) {
      return `${sign}₹${(abs / 1000).toFixed(1)}k`;
    }
  }

  const rounded = Math.round(amount);
  const isNegative = rounded < 0;
  const absStr = Math.abs(rounded).toString();

  let lastThree = absStr.substring(absStr.length - 3);
  const otherNumbers = absStr.substring(0, absStr.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  return `${isNegative ? '-' : ''}₹${formatted}`;
}

/**
 * Safe To Spend Calculator:
 * Income - Essential Expenses - Total Loan EMIs - Monthly SIPs/Investments - Goal Contributions
 */
export function calculateSafeToSpend(profile: FinancialProfile): SafeToSpendBreakdown {
  const monthlyIncome = profile.monthlyIncome || 0;
  const essentialExpenses = profile.monthlyExpenses || 0;
  
  const totalLoanEmis = profile.loans.reduce((acc, curr) => acc + (curr.emi || 0), 0);
  
  const goalContributions = profile.goals.reduce(
    (acc, curr) => acc + (curr.monthlyContribution || 0),
    0
  );

  const sipContributions = profile.progressiveDetails?.monthlySipTotal || 0;
  const plannedSavings = goalContributions + sipContributions;

  // A modest buffer (5% of income or ₹2,000, whichever is lower) to protect against unbilled incidental expenses
  const bufferMargin = Math.min(monthlyIncome * 0.05, 2000);

  const safe = monthlyIncome - essentialExpenses - totalLoanEmis - plannedSavings - bufferMargin;
  const safeToSpend = Math.max(0, Math.round(safe));

  return {
    safeToSpend,
    monthlyIncome,
    essentialExpenses,
    loanEmis: totalLoanEmis,
    plannedSavings,
    goalContributions,
    bufferMargin: Math.round(bufferMargin),
  };
}

/**
 * Transparent Financial Health Score (0 to 100)
 * Evaluates:
 * 1. Spending balance (0-25)
 * 2. Emergency readiness (0-25)
 * 3. Debt load (0-25)
 * 4. Savings & Goal momentum (0-25)
 */
export function calculateHealthScore(profile: FinancialProfile): HealthScoreAnalysis {
  const income = profile.monthlyIncome || 1; // avoid division by zero
  const expenses = profile.monthlyExpenses || 0;
  const emergencyFund = profile.emergencyFund || profile.currentSavings * 0.5;
  const totalEmis = profile.loans.reduce((sum, l) => sum + (l.emi || 0), 0);
  const totalSavings = profile.currentSavings || 0;

  // Factor 1: Spending Balance (Expense to Income Ratio)
  // Ideal: expenses <= 50-60% of income
  const expenseRatio = expenses / income;
  let spendingScore = 25;
  let spendingNote = 'Your spending is comfortably balanced relative to your income.';
  let spendingStatus = 'Healthy';

  if (expenseRatio > 0.85) {
    spendingScore = 10;
    spendingNote = `Monthly expenses account for ${(expenseRatio * 100).toFixed(0)}% of your income.`;
    spendingStatus = 'High Outflow';
  } else if (expenseRatio > 0.70) {
    spendingScore = 17;
    spendingNote = `Your expenses are ${(expenseRatio * 100).toFixed(0)}% of income. Creating a small buffer will give you more breathing room.`;
    spendingStatus = 'Moderate';
  }

  // Factor 2: Emergency Readiness (Months of expenses covered)
  // Target: 3 to 6 months
  const monthlyBurn = expenses > 0 ? expenses : income * 0.5;
  const monthsCovered = monthlyBurn > 0 ? emergencyFund / monthlyBurn : 0;
  let emergencyScore = 25;
  let emergencyNote = `You have ${monthsCovered.toFixed(1)} months of safety buffer reserved.`;
  let emergencyStatus = 'Strong Buffer';

  if (monthsCovered < 1.0) {
    emergencyScore = 6;
    emergencyNote = `Currently covered for ${monthsCovered.toFixed(1)} months. Building toward 3 months will give you a dependable safety net.`;
    emergencyStatus = 'Needs Focus';
  } else if (monthsCovered < 3.0) {
    emergencyScore = 16;
    emergencyNote = `Currently covered for ${monthsCovered.toFixed(1)} months. You are well on your way to the recommended 3-6 month milestone.`;
    emergencyStatus = 'Growing';
  }

  // Factor 3: Debt Load (Debt-to-Income / EMI ratio)
  // Target: EMI <= 30-35% of income
  const emiRatio = totalEmis / income;
  let debtScore = 25;
  let debtNote = profile.loans.length === 0 ? 'You currently carry zero loan EMIs.' : `Your monthly EMIs represent ${(emiRatio * 100).toFixed(0)}% of income.`;
  let debtStatus = 'Low / None';

  if (emiRatio > 0.50) {
    debtScore = 8;
    debtNote = `EMIs consume ${(emiRatio * 100).toFixed(0)}% of income. Keeping new debt on pause will protect your cash flow.`;
    debtStatus = 'Heavy EMI';
  } else if (emiRatio > 0.35) {
    debtScore = 15;
    debtNote = `EMIs take ${(emiRatio * 100).toFixed(0)}% of income. Manageable, but prioritizing high-interest obligations will free up funds.`;
    debtStatus = 'Moderate';
  }

  // Factor 4: Savings & Goals Momentum
  const goalCount = profile.goals.length;
  const investmentCount = profile.investments.length;
  let momentumScore = 12;
  let momentumNote = 'Set up your first clear financial goal to accelerate your journey.';
  let momentumStatus = 'Starting';

  if (goalCount > 0 && investmentCount > 0) {
    momentumScore = 25;
    momentumNote = `${goalCount} active goals and active asset tracking give your wealth a clear purpose.`;
    momentumStatus = 'Active Planning';
  } else if (goalCount > 0 || totalSavings > income * 2) {
    momentumScore = 20;
    momentumNote = 'Consistent savings habits detected. You are steadily building momentum.';
    momentumStatus = 'Good Pace';
  }

  const totalScore = Math.min(100, Math.max(15, spendingScore + emergencyScore + debtScore + momentumScore));

  // Dynamic summary sentence
  let summary = 'Your financial foundation is calm and organized. Staying consistent with planned savings will compound your progress.';
  if (totalScore < 50) {
    summary = 'Your numbers show opportunities to build initial safety buffers and reduce monthly pressure without drastic lifestyle cuts.';
  } else if (totalScore < 75) {
    summary = 'Your spending is under control, but strengthening your emergency fund and goals will boost your financial security.';
  } else {
    summary = 'Excellent financial balance across cash flow, safety cushions, and manageable obligations.';
  }

  // Top 1-3 Prioritized Actions ("What Matters Now?")
  const prioritizedActions: HealthScoreAnalysis['prioritizedActions'] = [];

  if (monthsCovered < 3.0) {
    prioritizedActions.push({
      id: 'emergency_fund_action',
      title: 'Build your emergency fund',
      description: `You're currently covered for approximately ${monthsCovered.toFixed(1)} months of essential expenses. A 3-month safety buffer creates peace of mind.`,
      buttonText: 'See Plan',
      tabTarget: 'goals',
      urgency: monthsCovered < 1.0 ? 'high' : 'medium',
    });
  }

  if (emiRatio > 0.35) {
    prioritizedActions.push({
      id: 'debt_review_action',
      title: 'Review loan obligations',
      description: `Your ₹${totalEmis.toLocaleString('en-IN')} EMI represents ${(emiRatio * 100).toFixed(0)}% of monthly income. Explore accelerating repayment on the highest interest debt.`,
      buttonText: 'Explore Loans',
      tabTarget: 'money_loans',
      urgency: 'medium',
    });
  }

  if (profile.goals.length === 0) {
    prioritizedActions.push({
      id: 'create_first_goal',
      title: 'Name your first financial goal',
      description: 'Money with a clear purpose is easier to keep and grow. Whether travel, buying a vehicle, or peace of mind.',
      buttonText: 'Set a Goal',
      tabTarget: 'goals',
      urgency: 'low',
    });
  } else if (prioritizedActions.length < 2) {
    prioritizedActions.push({
      id: 'track_investments',
      title: 'Connect or record your investments',
      description: 'Track mutual funds, SIPs, and stocks against real Indian market indices.',
      buttonText: 'View Markets',
      tabTarget: 'money_investments',
      urgency: 'low',
    });
  }

  return {
    totalScore,
    summary,
    factors: {
      spendingBalance: { score: spendingScore, max: 25, status: spendingStatus, note: spendingNote },
      emergencyReadiness: { score: emergencyScore, max: 25, status: emergencyStatus, note: emergencyNote },
      debtLoad: { score: debtScore, max: 25, status: debtStatus, note: debtNote },
      savingsMomentum: { score: momentumScore, max: 25, status: momentumStatus, note: momentumNote },
    },
    prioritizedActions: prioritizedActions.slice(0, 3),
  };
}
