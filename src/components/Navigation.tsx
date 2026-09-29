import React from 'react';
import { Home, Wallet, Target, Sparkles, User, LayoutGrid, TrendingUp, Cloud, Check, RefreshCw } from 'lucide-react';
import { WelloLogo } from './Logo';

export type NavTab = 'home' | 'money' | 'stocks' | 'goals' | 'ask' | 'profile';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenFeaturesDrawer: () => void;
  userName?: string;
  syncStatus?: 'synced' | 'saving' | 'offline';
  onManualSync?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  onOpenFeaturesDrawer,
  userName,
  syncStatus = 'synced',
  onManualSync,
}) => {
  // 5 Core Feature Tabs for navigation (Profile is accessed from the top corner to prevent double option)
  const tabs: Array<{ id: NavTab; label: string; icon: React.FC<any> }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'money', label: 'Money', icon: Wallet },
    { id: 'stocks', label: 'Stocks & Invest', icon: TrendingUp },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'ask', label: 'Ask Wello', icon: Sparkles },
  ];

  return (
    <>
      {/* Desktop / Tablet / Laptop Top Header (Max width adjusted for laptops) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-2xs">
        <div className="max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <button
            onClick={() => onSelectTab('home')}
            className="focus:outline-none flex items-center cursor-pointer flex-shrink-0"
          >
            <WelloLogo size="md" />
          </button>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-indigo-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Corner: Cloud Sync, All Features Directory Button & Dedicated Profile Option */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Cloud Sync & Save Data Indicator */}
            <button
              onClick={onManualSync}
              type="button"
              className="hidden sm:inline-flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-200 text-slate-700 hover:text-emerald-700 text-xs font-semibold transition-all cursor-pointer group"
              title="Cloud Data Persistence: Click to save & sync latest wealth data now"
            >
              {syncStatus === 'saving' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                  <span className="hidden lg:inline text-[11px] text-indigo-600 font-bold">Saving...</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden lg:inline text-[11px] text-slate-600 group-hover:text-emerald-700">Saved</span>
                  <Check className="w-3 h-3 text-emerald-600" />
                </>
              )}
            </button>

            {/* All Features Button */}
            <button
              onClick={onOpenFeaturesDrawer}
              type="button"
              className="inline-flex items-center gap-1.5 sm:gap-2 py-1.5 px-2.5 sm:px-3 rounded-xl bg-slate-100/90 hover:bg-indigo-50 border border-slate-200/90 hover:border-indigo-200 text-slate-800 hover:text-indigo-700 text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer group"
              title="Explore Wello Features (Cmd+K)"
            >
              <LayoutGrid className="w-4 h-4 text-indigo-600 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">All Features</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono text-slate-500 bg-white rounded border border-slate-200">
                ⌘K
              </kbd>
            </button>

            {/* Profile Option in the upper side corner */}
            <button
              onClick={() => onSelectTab('profile')}
              className={`flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-full sm:rounded-xl border transition-all cursor-pointer ${
                currentTab === 'profile'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-2xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-700'
              }`}
              title="My Profile, Account & Vault Settings"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                {userName ? userName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {userName ? userName.split(' ')[0] : 'Profile'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium leading-none">
                  Account & Vault
                </span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Corner Feature Button (Always visible on bottom right for instant access) */}
      <button
        onClick={onOpenFeaturesDrawer}
        type="button"
        className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2 py-2.5 px-4 rounded-full bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="Open Features (Cmd+K)"
      >
        <LayoutGrid className="w-4 h-4" />
        <span>All Features</span>
      </button>

      {/* Mobile & Tablet Fixed Bottom Navigation Bar (5 Core Features Symbols, with Profile in upper corner) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'text-indigo-600 font-bold'
                    : 'text-slate-400 hover:text-slate-600 font-medium'
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-colors ${
                    isActive ? 'bg-indigo-50' : 'bg-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
