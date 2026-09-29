import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export const WelloLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Brand Icon: Harmonic geometric emblem representing balance, wealth, and calm ascent */}
      <div
        className={`${iconSizes[size]} rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-[2px] shadow-sm shadow-indigo-100 flex items-center justify-center`}
      >
        <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center p-1.5">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-full h-full text-indigo-600"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 16c2-4 4-8 8-8s6 4 8 8" />
            <circle cx="12" cy="7" r="2.5" fill="currentColor" className="text-sky-500" />
            <path d="M6 19h12" strokeWidth="2" strokeDasharray="2 2" className="text-indigo-300" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col">
        <span className={`font-bold tracking-tight text-slate-900 ${textSizes[size]}`}>
          Wello
        </span>
        {showTagline && (
          <span className="text-[11px] font-medium text-slate-400 tracking-wide">
            Your Wealth Manager, Before You're Wealthy
          </span>
        )}
      </div>
    </div>
  );
};
