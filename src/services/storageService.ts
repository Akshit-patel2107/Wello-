import { FinancialProfile, UserAuth } from '../types/financial';

const AUTH_KEY = 'wello_auth_user';
const PROFILE_KEY_PREFIX = 'wello_financial_profile_';
const LAST_SYNC_KEY = 'wello_last_cloud_sync';
const ACCOUNTS_DB_KEY = 'wello_registered_accounts';

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

export function getLastSyncTime(): string {
  return localStorage.getItem(LAST_SYNC_KEY) || 'Synced';
}

export function setLastSyncTime(): void {
  const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  localStorage.setItem(LAST_SYNC_KEY, `Synced at ${now}`);
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
        setLastSyncTime();
        return json.profile;
      }
    }
  } catch (err) {
    console.warn('Network sync offline or delayed, using cached local profile');
  }

  return localProfile;
}

export async function saveUserProfile(userEmail: string, profile: FinancialProfile): Promise<boolean> {
  const cleanEmail = userEmail.toLowerCase().trim();
  const localKey = `${PROFILE_KEY_PREFIX}${cleanEmail}`;
  const updatedProfile: FinancialProfile = {
    ...profile,
    lastUpdated: new Date().toISOString(),
  };

  // Immediate local save
  localStorage.setItem(localKey, JSON.stringify(updatedProfile));
  setLastSyncTime();

  // Background server sync
  try {
    const res = await fetch('/api/user/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, profile: updatedProfile }),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to sync profile to server:', err);
    return false;
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

// Export user wealth data to downloadable JSON file
export function exportUserData(userEmail: string, profile: FinancialProfile): void {
  const exportPayload = {
    app: 'Wello Personal Wealth OS',
    version: '2.0',
    exportDate: new Date().toISOString(),
    accountEmail: userEmail,
    profile,
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `wello-vault-backup-${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Import & restore user wealth data from JSON file content
export async function importUserData(userEmail: string, jsonString: string): Promise<FinancialProfile | null> {
  try {
    const parsed = JSON.parse(jsonString);
    const profileToRestore: FinancialProfile = parsed.profile || parsed;
    
    // Basic schema validation
    if (typeof profileToRestore.monthlyIncome === 'number' && typeof profileToRestore.expenseCategories === 'object') {
      await saveUserProfile(userEmail, profileToRestore);
      return profileToRestore;
    }
    return null;
  } catch (e) {
    console.error('Failed to parse import JSON:', e);
    return null;
  }
}
