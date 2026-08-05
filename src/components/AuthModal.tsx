import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Save to LocalStorage
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

  const handleAdminQuickFill = () => {
    setEmail('admin@lensforge.com');
    setPassword('admin123');
    setIsSignUp(false);
  };

  const handleCustomerQuickFill = () => {
    setEmail('sujoy.yt0077@gmail.com');
    setPassword('customer123');
    setIsSignUp(false);
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
              {isSignUp ? 'Create an Account' : 'Welcome to LensForge'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isSignUp ? 'Sign up to purchase and download secure digital assets' : 'Sign in to access your digital downloads catalog'}
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

        {/* Demo Credentials Helper */}
        <div className="mt-6 border-t border-[#e2e8f0] pt-4 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-3">Quick-Fill Demo Roles</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAdminQuickFill}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-[#e2e8f0] rounded-lg text-xs font-medium text-slate-600 hover:text-[#0f172a] transition-colors cursor-pointer"
            >
              Fill Admin Account
            </button>
            <button
              onClick={handleCustomerQuickFill}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-[#e2e8f0] rounded-lg text-xs font-medium text-slate-600 hover:text-[#0f172a] transition-colors cursor-pointer"
            >
              Fill Demo Customer
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
