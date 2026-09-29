import React, { useState, useRef, useEffect } from 'react';
import { FinancialProfile } from '../types/financial';
import { askWelloAI, ChatMessage } from '../services/aiService';
import { formatINR } from '../utils/financialCalculations';
import { Send, Sparkles, User, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';
import { WelloLogo } from './Logo';

interface AskWelloViewProps {
  profile: FinancialProfile;
  userName: string;
}

const SUGGESTED_PROMPTS = [
  'Can I afford a ₹50,000 phone?',
  'How much should I save every month?',
  'Can I buy a car next year?',
  'How much emergency savings should I have?',
  'What is an SIP and how should I start?',
  'Explain P/E ratio and stock valuation simply.',
];

export const AskWelloView: React.FC<AskWelloViewProps> = ({ profile, userName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `Hello ${userName.split(' ')[0] || ''}. I'm Wello, your personal wealth manager.\n\nI have access to your monthly financial snapshot (Income: ${formatINR(profile.monthlyIncome)}, Expenses: ${formatINR(profile.monthlyExpenses)}, Current Savings: ${formatINR(profile.currentSavings)}).\n\nAsk me any decision or question on your mind—like whether you can afford an upcoming purchase, how much emergency buffer you need, or what an SIP is. Every recommendation will clearly explain the "Why".`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q || isLoading) return;

    setErrorMsg('');
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const answer = await askWelloAI(q, profile, messages);
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Wello was unable to connect right now. Please try asking again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-28 flex flex-col h-[calc(100vh-5rem)]">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex items-center justify-between gap-4 mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <span>Ask Wello</span>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                AI Wealth Advisor
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Personalized guidance grounded in your real numbers · Explains "Why"
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Connected to Profile</span>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs font-medium'
                  : 'bg-white text-slate-800 border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] rounded-tl-xs whitespace-pre-line'
              }`}
            >
              {msg.content}
              <div
                className={`text-[10px] mt-2 text-right ${
                  msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                {userName.charAt(0)}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-xs p-4 shadow-2xs flex items-center gap-2 text-xs text-slate-500">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Wello is calculating your cash flow & safety impact...</span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested quick questions */}
      {messages.length < 5 && (
        <div className="flex-shrink-0 mb-3">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Suggested questions:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(prompt)}
                className="text-xs py-1.5 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all font-medium"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="flex-shrink-0 bg-white rounded-2xl p-2 border border-slate-200 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask Wello anything (e.g. Can I afford a ₹50,000 phone?)..."
          className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
