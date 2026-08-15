'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (isSupabaseConfigured() && supabase) {
          // Check for error in query params
          const error = searchParams.get('error');
          const errorDescription = searchParams.get('error_description');
          
          if (error) {
            setStatus('error');
            setErrorMsg(errorDescription || error);
            return;
          }

          // Fetch active session established by OAuth redirect
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            setStatus('error');
            setErrorMsg(sessionError.message);
            return;
          }

          if (session?.user) {
            setStatus('success');
            setTimeout(() => {
              router.push('/account');
            }, 1000);
            return;
          }
        }

        // Default redirect
        setStatus('success');
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } catch (err: any) {
        console.error('[LensForge Auth Callback] Error:', err);
        setStatus('error');
        setErrorMsg(err?.message || 'Authentication failed. Please try signing in again.');
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-[#0e121e] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <h2 className="text-lg font-bold text-white">Completing Google Authentication</h2>
            <p className="text-slate-400 text-xs">Verifying credentials and synchronizing your account...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Signed In Successfully</h2>
            <p className="text-slate-400 text-xs">Redirecting to your account dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Authentication Failed</h2>
            <p className="text-rose-300 text-xs">{errorMsg}</p>
            <button
              onClick={() => router.push('/auth/signin')}
              className="mt-4 px-6 py-2 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-colors"
            >
              Return to Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center text-cyan-400 font-mono text-xs">
        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
        Processing Authentication...
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
