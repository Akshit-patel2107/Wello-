import React from 'react';
import { Home, Wallet, Target, Sparkles, User, LayoutGrid, TrendingUp } from 'lucide-react';
import { WelloLogo } from './Logo';

export type NavTab = 'home' | 'money' | 'stocks' | 'goals' | 'ask' | 'profile';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenFeaturesDrawer: () => void;
  userName?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  onOpenFeaturesDrawer,
  userName,
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
      {/* Desktop / Tablet Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => onSelectTab('home')}
            className="focus:outline-none flex items-center cursor-pointer"
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

          {/* Right Corner: All Features Directory Button & Dedicated Profile Option */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={onOpenFeaturesDrawer}
              type="button"
              className="inline-flex items-center gap-1.5 sm:gap-2 py-1.5 px-2.5 sm:px-3 rounded-xl bg-slate-100/90 hover:bg-indigo-50 border border-slate-200/90 hover:border-indigo-200 text-slate-800 hover:text-indigo-700 text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer group"
              title="Explore 4×4 Wello Feature Matrix (Cmd+K)"
            >
              <LayoutGrid className="w-4 h-4 text-indigo-600 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">All Features</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono text-slate-500 bg-white rounded border border-slate-200">
                4×4
              </kbd>
            </button>

            {/* Profile Option in the upper side corner (no duplicate in bottom nav) */}
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
        title="Open 4×4 Wello Features Matrix (Cmd+K)"
      >
        <LayoutGrid className="w-4 h-4" />
        <span>All Features</span>
        <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-mono font-bold">
          4×4
        </span>
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
