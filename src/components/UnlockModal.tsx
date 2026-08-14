'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { useAuth } from '@/lib/AuthContext';
import { useCart } from '@/lib/CartContext';
import { 
  X, 
  Lock, 
  Sparkles, 
  Zap, 
  Check, 
  ShieldCheck, 
  FileText, 
  FolderArchive,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface UnlockModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  unlockType?: 'prompt' | 'zip' | 'general';
}

export default function UnlockModal({ product, isOpen, onClose, unlockType = 'general' }: UnlockModalProps) {
  const router = useRouter();
  const { user, subscribeToPlan } = useAuth();
  const { addToCart } = useCart();
  const [subscribing, setSubscribing] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handleBuySingle = () => {
    addToCart(product);
    onClose();
    router.push('/checkout');
  };

  const handleSubscribe = async (tier: 'annual' | 'monthly') => {
    setSubscribing(tier);
    await subscribeToPlan(tier);
    setSubscribing(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0e121e] border border-cyan-500/30 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 space-y-6">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/[0.05] hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/10">
            <Lock className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
            {unlockType === 'prompt' ? 'MASTER PROMPT LOCKED' : unlockType === 'zip' ? 'SOURCE ZIP PACKAGE LOCKED' : 'ASSET ACCESS RESTRICTED'}
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Unlock &ldquo;{product.title}&rdquo;
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
            Choose to buy this individual asset or unlock unlimited instant access to all templates, master prompts, and source code with the All-Access Pass.
          </p>
        </div>

        {/* OPTIONS GRID */}
        <div className="space-y-3">
          
          {/* OPTION 1: ANNUAL ALL-ACCESS PASS (RECOMMENDED) */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-[#10172a] to-slate-900 border-2 border-cyan-400/60 shadow-lg shadow-cyan-500/10 space-y-3">
            <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-mono font-extrabold text-[10px] uppercase tracking-wider">
              BEST VALUE • UNLIMITED
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-cyan-400" /> Annual All-Access Pass
                </h3>
                <p className="text-slate-400 text-[11px]">Instant access to ALL prompts, templates & ZIPs for 1 year</p>
              </div>
              <div className="text-right">
                <div className="font-mono font-extrabold text-cyan-400 text-lg">$199</div>
                <div className="text-[10px] text-slate-400 font-mono">/ year</div>
              </div>
            </div>

            <ul className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-300 pt-2 border-t border-white/10">
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> Unlimited ZIP Downloads</li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> Copy All Master Prompts</li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> Commercial License</li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" /> Lifetime Updates</li>
            </ul>

            <button
              onClick={() => handleSubscribe('annual')}
              disabled={subscribing !== null}
              className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-400/20 transition-all"
            >
              {subscribing === 'annual' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Activating All-Access...
                </>
              ) : (
                <>
                  Subscribe Annual Pass ($199/yr) <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* OPTION 2: ONE-TIME PRODUCT PURCHASE */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-200 text-xs">Buy Single Asset Once</h4>
              <p className="text-slate-400 text-[11px]">Lifetime access to this product only</p>
            </div>

            <button
              onClick={handleBuySingle}
              className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/15 text-slate-100 font-bold text-xs font-mono flex items-center gap-2 border border-white/10 transition-colors"
            >
              Buy for ${product.price.toFixed(2)}
            </button>
          </div>

        </div>

        {/* GUARANTEE */}
        <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Instant Digital Access Delivered Immediately
        </div>

      </div>
    </div>
  );
}
