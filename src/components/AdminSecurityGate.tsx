'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { verifyAdminPasscode } from '@/lib/adminSecurity';
import { 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Loader2, 
  Terminal,
  ArrowLeft
} from 'lucide-react';

interface AdminSecurityGateProps {
  onUnlockSuccess: () => void;
}

export default function AdminSecurityGate({ onUnlockSuccess }: AdminSecurityGateProps) {
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    setTimeout(() => {
      const result = verifyAdminPasscode(passcode);
      setLoading(false);

      if (result.success) {
        onUnlockSuccess();
      } else {
        setFailedAttempts(prev => prev + 1);
        setErrorMessage(result.error || 'Invalid passcode.');
      }
    }, 400);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0b0e18] border border-rose-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden space-y-6">
        
        {/* TOP AMBIENT GLOW */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* HEADER */}
        <div className="text-center space-y-3 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
            <KeyRound className="w-7 h-7" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono text-[10px] font-bold uppercase tracking-widest mb-1.5">
              <ShieldCheck className="w-3 h-3" /> RESTRICTED OWNER GATE
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              LensForge Master Control
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Enter your Master Secret Passcode to authenticate owner session.
            </p>
          </div>
        </div>

        {/* ERROR NOTIFICATION */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed font-sans">{errorMessage}</div>
          </div>
        )}

        {/* PASSCODE FORM */}
        <form onSubmit={handleUnlock} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Admin Secret Passcode</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {failedAttempts > 0 ? `${failedAttempts} failed attempt(s)` : 'Encrypted Access'}
              </span>
            </label>

            <div className="relative">
              <input
                type={showPasscode ? 'text' : 'password'}
                required
                autoFocus
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter secret pass..."
                disabled={loading}
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-3 pl-11 pr-11 text-sm text-rose-200 placeholder-slate-600 font-mono outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-3.5 pointer-events-none" />
              
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                title={showPasscode ? 'Hide Passcode' : 'Show Passcode'}
              >
                {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || passcode.trim().length === 0}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Authenticating Passcode...
              </>
            ) : (
              <>
                Unlock Admin Vault <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* BACK TO STORE */}
        <div className="text-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Public Storefront
          </Link>
        </div>

      </div>
    </div>
  );
}
