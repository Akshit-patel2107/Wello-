import React, { useState, useEffect } from 'react';
import { FinancialProfile, UserAuth, CashExpense, ProgressiveDetails } from './types/financial';
import {
  clearStoredAuth,
  createEmptyProfile,
  deleteUserAccountData,
  getStoredAuth,
  loadUserProfile,
  saveStoredAuth,
  saveUserProfile,
} from './services/storageService';
import { AuthScreen } from './components/AuthScreen';
import { OnboardingFlow } from './components/OnboardingFlow';
import { HomeScreen } from './components/HomeScreen';
import { MoneyView } from './components/MoneyView';
import { StocksInvestView } from './components/StocksInvestView';
import { GoalsView } from './components/GoalsView';
import { AskWelloView } from './components/AskWelloView';
import { ProfileView } from './components/ProfileView';
import { Navigation, NavTab } from './components/Navigation';
import { ProgressiveModal } from './components/ProgressiveModal';
import { CashExpenseModal } from './components/CashExpenseModal';
import { FeaturesDrawer, FeatureItem } from './components/FeaturesDrawer';

export default function App() {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Navigation
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [moneySubTab, setMoneySubTab] = useState<string>('blueprint');

  // Modals & Feature Triggers
  const [showFeaturesDrawer, setShowFeaturesDrawer] = useState(false);
  const [showProgressiveModal, setShowProgressiveModal] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [showEveningCashReminder, setShowEveningCashReminder] = useState(true);
  const [triggerSafeToSpendModal, setTriggerSafeToSpendModal] = useState(0);

  // Keyboard shortcut (Cmd+K or Ctrl+K) to open features directory
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowFeaturesDrawer(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check persistent auth on mount
  useEffect(() => {
    async function initAuth() {
      const stored = getStoredAuth();
      if (stored) {
        setUser(stored);
        const userProfile = await loadUserProfile(stored.email);
        if (userProfile && userProfile.monthlyIncome > 0) {
          setProfile(userProfile);
          setNeedsOnboarding(false);
        } else {
          setNeedsOnboarding(true);
        }
      }
      setIsLoadingAuth(false);
    }
    initAuth();
  }, []);

  // Handle Google Auth success
  const handleAuthenticated = async (authenticatedUser: UserAuth) => {
    setUser(authenticatedUser);
    saveStoredAuth(authenticatedUser);
    setIsLoadingAuth(true);

    const existingProfile = await loadUserProfile(authenticatedUser.email);
    if (existingProfile && existingProfile.monthlyIncome > 0) {
      setProfile(existingProfile);
      setNeedsOnboarding(false);
    } else {
      setNeedsOnboarding(true);
    }
    setIsLoadingAuth(false);
  };

  // Handle onboarding completion
  const handleOnboardingComplete = async (initialProfileData: Partial<FinancialProfile>) => {
    if (!user) return;
    const base = createEmptyProfile();
    const completeProfile: FinancialProfile = {
      ...base,
      ...initialProfileData,
      lastUpdated: new Date().toISOString(),
    };
    setProfile(completeProfile);
    setNeedsOnboarding(false);
    await saveUserProfile(user.email, completeProfile);
  };

  // Update profile handler (persists both locally and to server)
  const handleUpdateProfile = async (updates: Partial<FinancialProfile>) => {
    if (!profile || !user) return;
    const updated: FinancialProfile = {
      ...profile,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    setProfile(updated);
    await saveUserProfile(user.email, updated);
  };

  // Add Cash Expense
  const handleAddCashExpense = (expense: CashExpense) => {
    if (!profile || !user) return;
    const updatedCash = [...profile.cashExpenses, expense];
    // Slightly adjust expenses
    const updatedExpenses = profile.monthlyExpenses + expense.amount;
    const categoryKey = expense.category as keyof typeof profile.expenseCategories;
    const updatedCategories = {
      ...profile.expenseCategories,
      [categoryKey]: (profile.expenseCategories[categoryKey] || 0) + expense.amount,
    };

    handleUpdateProfile({
      cashExpenses: updatedCash,
      monthlyExpenses: updatedExpenses,
      expenseCategories: updatedCategories,
    });
  };

  // Progressive details save
  const handleSaveProgressive = (details: ProgressiveDetails) => {
    if (!profile) return;
    handleUpdateProfile({
      progressiveDetails: {
        ...profile.progressiveDetails,
        ...details,
      },
    });
  };

  // Sign out
  const handleSignOut = () => {
    clearStoredAuth();
    setUser(null);
    setProfile(null);
    setCurrentTab('home');
  };

  // Delete account data
  const handleDeleteAccount = async () => {
    if (!user) return;
    await deleteUserAccountData(user.email);
    setUser(null);
    setProfile(null);
    setCurrentTab('home');
  };

  // Tab navigation helper
  const handleNavigate = (tab: string, subTab?: string) => {
    if (tab === 'stocks' || subTab === 'investments') {
      setCurrentTab('stocks');
      return;
    }
    setCurrentTab(tab as NavTab);
    if (subTab) {
      setMoneySubTab(subTab);
    }
  };

  // Feature selection handler from Features Directory
  const handleSelectFeature = (action: FeatureItem['action']) => {
    if (action.tab) {
      setCurrentTab(action.tab);
    }
    if (action.subTab) {
      setMoneySubTab(action.subTab);
    }
    if (action.modal === 'cash') {
      setShowCashModal(true);
    } else if (action.modal === 'progressive') {
      setShowProgressiveModal(true);
    } else if (action.modal === 'safeToSpendCalc') {
      setCurrentTab('home');
      setTriggerSafeToSpendModal(prev => prev + 1);
    }
  };

  // Loading state
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#FBFBFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">
            Loading your Wello vault...
          </span>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated -> Show clean Auth Screen
  if (!user) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  // 2. Authenticated but first time -> 1-2 minute Onboarding Flow
  if (needsOnboarding || !profile) {
    return (
      <OnboardingFlow
        userName={user.name}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // 3. Main Wello App
  return (
    <div className="min-h-screen bg-[#FBFBFC] text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenFeaturesDrawer={() => setShowFeaturesDrawer(true)}
        userName={user.name}
      />

      <main className="transition-opacity duration-200">
        {currentTab === 'home' && (
          <HomeScreen
            user={user}
            profile={profile}
            onNavigateTab={handleNavigate}
            onOpenProgressiveModal={() => setShowProgressiveModal(true)}
            onQuickAddCash={() => setShowCashModal(true)}
            onDismissCashReminder={() => setShowEveningCashReminder(false)}
            showCashReminder={showEveningCashReminder}
            triggerSafeToSpendModal={triggerSafeToSpendModal}
          />
        )}

        {currentTab === 'money' && (
          <MoneyView
            profile={profile}
            activeSubTab={moneySubTab}
            onUpdateProfile={handleUpdateProfile}
            onOpenAddCash={() => setShowCashModal(true)}
            onOpenProgressiveModal={() => setShowProgressiveModal(true)}
            onNavigateTab={handleNavigate}
          />
        )}

        {currentTab === 'stocks' && (
          <StocksInvestView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onNavigateTab={handleNavigate}
          />
        )}

        {currentTab === 'goals' && (
          <GoalsView
            profile={profile}
            onUpdateGoals={goals => handleUpdateProfile({ goals })}
          />
        )}

        {currentTab === 'ask' && (
          <AskWelloView
            profile={profile}
            userName={user.name}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            user={user}
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onSignOut={handleSignOut}
            onDeleteAccount={handleDeleteAccount}
          />
        )}
      </main>

      {/* Complete Wello Features Directory & Quick Launcher */}
      <FeaturesDrawer
        isOpen={showFeaturesDrawer}
        onClose={() => setShowFeaturesDrawer(false)}
        onSelectFeature={handleSelectFeature}
      />

      {/* Progressive Details Modal */}
      <ProgressiveModal
        isOpen={showProgressiveModal}
        onClose={() => setShowProgressiveModal(false)}
        profile={profile}
        onSaveProgressive={handleSaveProgressive}
      />

      {/* Quick Cash Expense Modal */}
      <CashExpenseModal
        isOpen={showCashModal}
        onClose={() => setShowCashModal(false)}
        onAddCashExpense={handleAddCashExpense}
      />
    </div>
  );
}
