import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Mail, Lock, Sparkles, ArrowRight, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { User } from '../types.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User, token: string) => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Email verification helper states
  const [verificationPending, setVerificationPending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [simulatedLink, setSimulatedLink] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [mailError, setMailError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResendMessage('');
    setMailError(null);

    const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const responseText = await response.text();
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Server returned an invalid response (status ${response.status}). Please try again or check server logs.`);
      }

      if (!response.ok) {
        // Capture unverified error response to redirect to verification prompt
        if (response.status === 403 && data.is_unverified) {
          setPendingEmail(data.email);
          setSimulatedLink(data.verification_link_simulated);
          setMailError(data.mail_error || null);
          setVerificationPending(true);
          setLoading(false);
          return;
        }
        throw new Error(data.error || 'Something went wrong');
      }

      // Check if registration requires verification (no token returned in registration)
      if (isSignUp && !data.token) {
        setPendingEmail(email);
        setSimulatedLink(data.verification_link_simulated);
        setMailError(data.mail_error || null);
        setVerificationPending(true);
        setLoading(false);
        return;
      }

      // Save to LocalStorage (when verified / instant-admin login)
      localStorage.setItem('lensforge_token', data.token);
      localStorage.setItem('lensforge_user', JSON.stringify(data.user));

      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!pendingEmail) return;
    setResendLoading(true);
    setResendMessage('');
    setError('');
    setMailError(null);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: pendingEmail }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend email');
      }

      setResendMessage(data.mail_error ? 'A fresh verification link has been generated but SMTP delivery failed.' : 'A fresh verification link has been sent to your inbox!');
      setMailError(data.mail_error || null);
      if (data.verification_link_simulated) {
        setSimulatedLink(data.verification_link_simulated);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToAuth = () => {
    setVerificationPending(false);
    setError('');
    setResendMessage('');
    setMailError(null);
  };

  const executeSimulation = () => {
    if (simulatedLink) {
      window.location.href = simulatedLink;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-2xl overflow-hidden"
      >
        {/* Glow Element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <h3 className="text-xl font-bold text-[#0f172a] flex items-center gap-2">
              <Sparkles className="text-indigo-600 w-5 h-5" />
              {verificationPending ? 'Email Verification' : isSignUp ? 'Create an Account' : 'Welcome to LensForge'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {verificationPending
                ? 'Confirm your email address to access your marketplace account'
                : isSignUp
                ? 'Sign up to purchase and download secure digital assets'
                : 'Sign in to access your digital downloads catalog'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-[#0f172a] transition-colors p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium">
            {error}
          </div>
        )}

        {resendMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg font-medium">
            {resendMessage}
          </div>
        )}

        {verificationPending ? (
          /* ==========================================
             VERIFICATION PENDING VIEW
             ========================================== */
          <div className="space-y-6 relative z-10 py-2">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full">
                <Mail size={36} className="animate-bounce" />
              </div>
              <h4 className="font-semibold text-slate-800 text-sm">Please check your inbox</h4>
              <p className="text-xs text-slate-500 max-w-sm">
                We've sent a verification link to <strong className="text-slate-700">{pendingEmail}</strong>.
                Click the confirmation link inside the email to activate your account.
              </p>
            </div>

            {mailError && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg space-y-1">
                <div className="font-semibold flex items-center gap-1">
                  <span>⚠️ SMTP Delivery Limitation</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {mailError.includes('550') 
                    ? `The SMTP provider returned a sandbox restriction: you can only send verification emails to your registered Resend account email (${pendingEmail.toLowerCase() === 'sujoy.yt0077@gmail.com' ? pendingEmail : 'sujoy.yt0077@gmail.com'}).`
                    : `SMTP email sending failed: ${mailError}`}
                </p>
                <p className="text-[11px] font-medium pt-1">
                  Please use the Sandbox Email Simulation button below to instantly verify your account and bypass this restriction!
                </p>
              </div>
            )}

            {/* Sandbox Simulation Tool */}
            {simulatedLink && (
              <div className="p-4 bg-slate-50 border border-dashed border-indigo-200 rounded-lg text-center space-y-3">
                <div className="text-[10px] uppercase font-bold tracking-wider text-indigo-600">Sandbox Email Simulation</div>
                <p className="text-[11px] text-slate-500">
                  {mailError ? 'Since real SMTP delivery is restricted in this sandbox, use this click to instantly activate your account!' : 'You can verify this account immediately with a simulated click!'}
                </p>
                <button
                  onClick={executeSimulation}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-md shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle size={14} />
                  Simulate Email Link Click
                </button>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                onClick={handleResendEmail}
                disabled={resendLoading}
                className="w-full border border-slate-200 hover:bg-slate-50 disabled:bg-slate-50 text-slate-600 font-medium py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw size={14} className={resendLoading ? 'animate-spin' : ''} />
                {resendLoading ? 'Sending...' : 'Resend Verification Email'}
              </button>

              <button
                onClick={handleBackToAuth}
                className="w-full text-xs text-slate-500 hover:text-indigo-600 font-medium flex items-center justify-center gap-1 py-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                Back to Sign In / Sign Up
              </button>
            </div>
          </div>
        ) : (
          /* ==========================================
             SIGN IN / SIGN UP VIEW
             ========================================== */
          <>
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e2e8f0] rounded-lg text-[#0f172a] text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e2e8f0] rounded-lg text-[#0f172a] text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-medium py-3 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-all mt-6 shadow-lg shadow-indigo-600/10 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    {isSignUp ? 'Sign Up' : 'Sign In'}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
