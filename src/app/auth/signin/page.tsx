'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const res = await signIn(email, password);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to sign in. Please check your credentials.');
    } else {
      router.push(redirectUrl);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setGoogleLoading(true);

    const res = await signInWithGoogle();
    if (!res.success) {
      setGoogleLoading(false);
      setErrorMessage(res.error || 'Google authentication failed.');
    }
  };

  return (
    <div className="w-full max-w-md bg-[#0e121e] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
      
      {/* HEADER */}
      <div className="text-center space-y-1.5">
        <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/10">
          <Lock className="w-5 h-5" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Sign In to LensForge</h1>
        <p className="text-slate-400 text-xs">Access your All-Access Pass, master prompts & downloads</p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* GOOGLE SIGN IN BUTTON */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading}
        className="w-full py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 font-semibold text-xs flex items-center justify-center gap-3 transition-all hover:border-white/30 disabled:opacity-50"
      >
        {googleLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> Connecting to Google...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.7 0 3 .7 3.7 1.3l2.8-2.8C16.8 2 14.6 1.2 12 1.2 7.5 1.2 3.7 3.8 1.9 7.6l3.3 2.6C6.1 7.2 8.8 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
              <path fill="#FBBC05" d="M5.2 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.6C.7 10 0 12 0 12s.7 2 1.9 4.4l3.3-2.6z" />
              <path fill="#34A853" d="M12 23.8c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.9-2.2-6.8-5.2L1.9 16.4C3.7 20.2 7.5 22.8 12 22.8z" />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </button>

      {/* DIVIDER */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">or email sign in</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* EMAIL FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
          <div className="relative">
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@company.com"
              disabled={loading || googleLoading}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-400 disabled:opacity-50"
            />
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider">Password</label>
            <Link href="/auth/forgot-password" className="text-xs text-cyan-400 hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading || googleLoading}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-400 disabled:opacity-50"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Signing In...
            </>
          ) : (
            <>
              Sign In with Email <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* FOOTER LINK */}
      <div className="pt-2 text-center text-xs text-slate-400 border-t border-white/10">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="text-cyan-400 font-bold hover:underline">
          Create account
        </Link>
      </div>

    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-cyan-400 font-mono text-xs">Loading Sign In Form...</div>}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
