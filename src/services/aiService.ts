import { FinancialProfile } from '../types/financial';
import { calculateHealthScore, calculateSafeToSpend } from '../utils/financialCalculations';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export async function askWelloAI(
  question: string,
  profile: FinancialProfile,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  const safeToSpendData = calculateSafeToSpend(profile);
  const healthData = calculateHealthScore(profile);

  const financialContext = {
    monthlyIncome: profile.monthlyIncome,
    monthlyExpenses: profile.monthlyExpenses,
    currentSavings: profile.currentSavings,
    emergencyFund: profile.emergencyFund,
    safeToSpend: safeToSpendData.safeToSpend,
    healthScore: healthData.totalScore,
    healthSummary: healthData.summary,
    totalLoansCount: profile.loans.length,
    totalLoanEmi: profile.loans.reduce((sum, l) => sum + l.emi, 0),
    activeLoans: profile.loans.map(l => ({ name: l.name, type: l.type, outstanding: l.outstanding, emi: l.emi })),
    goalsCount: profile.goals.length,
    activeGoals: profile.goals.map(g => ({ title: g.title, target: g.targetAmount, current: g.currentAmount, monthly: g.monthlyContribution })),
    investmentsCount: profile.investments.length,
    investmentsTotalValue: profile.investments.reduce((sum, i) => sum + i.currentValue, 0),
    progressiveDetails: profile.progressiveDetails,
  };

  const response = await fetch('/api/wello/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      financialContext,
      conversationHistory: conversationHistory.map(m => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to get advice from Wello');
  }

  const data = await response.json();
  return data.answer;
}
