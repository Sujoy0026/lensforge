'use client';

import React, { useState } from 'react';
import { updateAdminPasscode, lockAdminSession, getStoredAdminPasscode } from '@/lib/adminSecurity';
import { 
  KeyRound, 
  ShieldCheck, 
  Lock, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Save, 
  Eye, 
  EyeOff, 
  Loader2,
  Trash2
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleUpdatePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (newPass !== confirmNewPass) {
      setErrorMessage('New Secret Passcodes do not match.');
      return;
    }

    if (newPass.length < 6) {
      setErrorMessage('New Secret Passcode must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = updateAdminPasscode(currentPass, newPass);
      setLoading(false);

      if (result.success) {
        setSuccessMessage('✓ Admin Secret Passcode successfully updated! Keep your new pass safe.');
        setCurrentPass('');
        setNewPass('');
        setConfirmNewPass('');
      } else {
        setErrorMessage(result.error || 'Failed to update passcode.');
      }
    }, 300);
  };

  const handleLockNow = () => {
    lockAdminSession();
    window.location.reload();
  };

  return (
    <div className="space-y-8 max-w-3xl">
      
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Admin Security & Settings</h1>
        <p className="text-slate-400 text-xs mt-1">Configure your master secret passcode, access control, and session parameters</p>
      </div>

      {/* CHANGE SECRET PASSCODE CARD */}
      <div className="bg-[#0e121e] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base">Change Master Secret Passcode</h2>
            <p className="text-slate-400 text-xs mt-0.5">Only holders of this secret key can unlock and manage the LensForge Admin Panel</p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePasscode} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">Current Secret Passcode</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="Enter current passcode..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 pl-10 pr-10 text-sm text-slate-100 font-mono outline-none focus:border-cyan-400"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">New Secret Passcode</label>
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Min 6 characters..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">Confirm New Passcode</label>
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={confirmNewPass}
                onChange={(e) => setConfirmNewPass(e.target.value)}
                placeholder="Retype new passcode..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-400/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Update Secret Passcode
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* SESSION MANAGEMENT & LOCK OUT */}
      <div className="bg-[#0e121e] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-rose-400" /> Active Admin Session
        </h3>
        <p className="text-slate-400 text-xs leading-relaxed">
          Your current session is actively authenticated with Master Security Token. You can lock the admin panel immediately to require the Secret Passcode on next visit.
        </p>

        <div className="pt-2">
          <button
            onClick={handleLockNow}
            className="px-5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Lock className="w-3.5 h-3.5" /> Lock Admin Session Now
          </button>
        </div>
      </div>

    </div>
  );
}
