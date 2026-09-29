import { FinancialProfile, UserAuth } from '../types/financial';

const AUTH_KEY = 'wello_auth_user';
const PROFILE_KEY_PREFIX = 'wello_financial_profile_';

export function getStoredAuth(): UserAuth | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function saveStoredAuth(user: UserAuth): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function createEmptyProfile(): FinancialProfile {
  return {
    monthlyIncome: 0,
    incomeSources: [],
    monthlyExpenses: 0,
    expenseCategories: {
      Food: 0,
      Transport: 0,
      Shopping: 0,
      Bills: 0,
      Entertainment: 0,
      Education: 0,
      Health: 0,
      Other: 0,
    },
    currentSavings: 0,
    emergencyFund: 0,
    loans: [],
    goals: [],
    investments: [],
    familyMembers: [],
    cashExpenses: [],
    progressiveDetails: {},
    dismissedPopups: [],
    lastUpdated: new Date().toISOString(),
  };
}

export async function loadUserProfile(userEmail: string): Promise<FinancialProfile | null> {
  const localKey = `${PROFILE_KEY_PREFIX}${userEmail.toLowerCase().trim()}`;
  const localData = localStorage.getItem(localKey);
  let localProfile: FinancialProfile | null = null;
  
  if (localData) {
    try {
      localProfile = JSON.parse(localData);
    } catch (e) {
      // ignore parse error
    }
  }

  // Also query server backend for cloud persistence
  try {
    const res = await fetch(`/api/user/profile?email=${encodeURIComponent(userEmail)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.profile) {
        // Update local with server's latest if newer
        localStorage.setItem(localKey, JSON.stringify(json.profile));
        return json.profile;
      }
    }
  } catch (err) {
    console.warn('Network sync offline or delayed, using cached local profile');
  }

  return localProfile;
}

export async function saveUserProfile(userEmail: string, profile: FinancialProfile): Promise<void> {
  const cleanEmail = userEmail.toLowerCase().trim();
  const localKey = `${PROFILE_KEY_PREFIX}${cleanEmail}`;
  const updatedProfile: FinancialProfile = {
    ...profile,
    lastUpdated: new Date().toISOString(),
  };

  // Immediate local save
  localStorage.setItem(localKey, JSON.stringify(updatedProfile));

  // Background server sync
  try {
    await fetch('/api/user/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, profile: updatedProfile }),
    });
  } catch (err) {
    console.error('Failed to sync profile to server:', err);
  }
}

export async function deleteUserAccountData(userEmail: string): Promise<void> {
  const cleanEmail = userEmail.toLowerCase().trim();
  const localKey = `${PROFILE_KEY_PREFIX}${cleanEmail}`;
  localStorage.removeItem(localKey);
  clearStoredAuth();

  try {
    await fetch(`/api/user/profile?email=${encodeURIComponent(cleanEmail)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.error('Failed to delete on server:', err);
  }
}
