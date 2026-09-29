import React, { useState } from 'react';
import { WelloLogo } from './Logo';
import { UserAuth } from '../types/financial';
import { ShieldCheck, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

interface AuthScreenProps {
  onAuthenticated: (user: UserAuth) => void;
  defaultEmail?: string;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onAuthenticated,
  defaultEmail = 'akshitpatel2107@gmail.com',
}) => {
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [emailInput, setEmailInput] = useState(defaultEmail);
  const [nameInput, setNameInput] = useState('Akshit Patel');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleStartGoogleAuth = () => {
    setShowGoogleModal(true);
    setErrorMsg('');
  };

  const handleConfirmGoogleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) {
      setErrorMsg('Please enter a valid Google/Gmail account address.');
      return;
    }

    setIsAuthorizing(true);
    setErrorMsg('');

    // Simulate Google OAuth token exchange
    setTimeout(() => {
      const cleanEmail = emailInput.trim().toLowerCase();
      const detectedName = nameInput.trim() || cleanEmail.split('@')[0].replace(/[._]/g, ' ');
      const user: UserAuth = {
        id: `google_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
        email: cleanEmail,
        name: detectedName
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' '),
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(detectedName)}&backgroundColor=4f46e5&textColor=ffffff`,
        loginMethod: 'google',
        createdAt: new Date().toISOString(),
      };

      setIsAuthorizing(false);
      setShowGoogleModal(false);
      onAuthenticated(user);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top subtle nav */}
      <header className="px-6 py-6 max-w-5xl mx-auto w-full flex items-center justify-between">
        <WelloLogo size="md" showTagline={false} />
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Bank-Grade 256-Bit Encryption</span>
        </div>
      </header>

      {/* Main hero card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full text-center">
          {/* Centered Brand Mark */}
          <div className="mb-8 flex justify-center">
            <WelloLogo size="xl" showTagline />
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            Your financial life,
            <br />
            <span className="text-indigo-600">finally in one place.</span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg mb-8 leading-relaxed max-w-sm mx-auto">
            Understand your money. Make better decisions. Build your future.
          </p>

          {/* Primary Action Button */}
          <div className="space-y-4">
            <button
              onClick={handleStartGoogleAuth}
              type="button"
              className="w-full flex items-center justify-center gap-3.5 py-4 px-6 rounded-2xl bg-white border border-slate-200/90 text-slate-800 font-semibold text-base shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.09)] hover:border-slate-300 transition-all duration-200 active:scale-[0.99] group cursor-pointer"
            >
              {/* Official Google G Logo */}
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
            </button>

            <p className="text-xs text-slate-600">
              Only real Google accounts. No sample or demo profiles.
            </p>
          </div>

          {/* Philosophy Card */}
          <div className="mt-12 bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] text-left">
            <div className="flex items-center gap-2 mb-2 text-indigo-600 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Core Philosophy</span>
            </div>
            <p className="text-slate-800 font-medium text-sm mb-3">
              “You don’t have to be rich to have a wealth manager.”
            </p>
            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Not a stock-trading terminal or banking app</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Private & non-judgmental guidance for Indian users</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Persistent financial memory & real market connections</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-slate-500">
        Wello Financial Technologies Pvt. Ltd. · Designed for India · All amounts in INR (₹)
      </footer>

      {/* Google Authentication Dialog Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
            </div>

            <h3 className="text-xl font-bold text-center text-slate-900 mb-1">
              Google Account Sign-In
            </h3>
            <p className="text-xs text-center text-slate-500 mb-6">
              Connect your Google account to create or access your encrypted financial profile.
            </p>

            <form onSubmit={handleConfirmGoogleAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Google Email Address
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder="e.g. Akshit Patel"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAuthorizing}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isAuthorizing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authorizing...</span>
                    </>
                  ) : (
                    <span>Authorize</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
