'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { 
  Zap, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  FolderArchive, 
  FileText, 
  ArrowRight,
  Loader2
} from 'lucide-react';

export default function PricingPage() {
  const router = useRouter();
  const { user, isSubscribed, subscriptionTier, subscribeToPlan, cancelSubscription } = useAuth();
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');

  const handleSubscribe = async (tier: 'annual' | 'monthly') => {
    setSubscribing(tier);
    await subscribeToPlan(tier);
    setSubscribing(null);
    router.push('/products');
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
      
      {/* HEADER HERO */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" /> LENSFORGE ALL-ACCESS PASS
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Unlock Every Digital Asset & Master Prompt
        </h1>

        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Get unlimited instant access to all production website templates, dashboard UI kits, Three.js 3D heroes, source code ZIP packages, and full architectural master prompts.
        </p>

        {/* BILLING TOGGLE */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold font-mono transition-all ${
              billingCycle === 'monthly'
                ? 'bg-cyan-400 text-slate-950 font-bold'
                : 'bg-white/[0.04] text-slate-300 hover:text-white border border-white/10'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold font-mono flex items-center gap-1.5 transition-all ${
              billingCycle === 'annual'
                ? 'bg-cyan-400 text-slate-950 font-bold'
                : 'bg-white/[0.04] text-slate-300 hover:text-white border border-white/10'
            }`}
          >
            Annual Pass <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/30">Save 40%</span>
          </button>
        </div>
      </div>

      {/* PLANS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        {/* MONTHLY PLAN */}
        <div className="bg-[#0e121e] border border-white/10 rounded-3xl p-8 space-y-6 flex flex-col justify-between hover:border-white/20 transition-all">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white">Monthly Pro Pass</h3>
              <p className="text-slate-400 text-xs mt-1">Flexible month-to-month access for developers and studios</p>
            </div>

            <div className="pt-2">
              <span className="text-4xl font-extrabold text-white font-mono">$29</span>
              <span className="text-slate-400 text-xs font-mono"> / month</span>
            </div>

            <ul className="space-y-3 text-xs text-slate-300 pt-4 border-t border-white/10">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Unlimited Source Code ZIP Downloads</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Instant 1-Click Copy on All Master Prompts</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Commercial & Client Project License</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Access to all future releases while active</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleSubscribe('monthly')}
            disabled={subscribing !== null || (isSubscribed && subscriptionTier === 'monthly')}
            className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
              isSubscribed && subscriptionTier === 'monthly'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-white/[0.08] hover:bg-white/15 text-white border-white/10'
            }`}
          >
            {subscribing === 'monthly' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Subscribing...
              </>
            ) : isSubscribed && subscriptionTier === 'monthly' ? (
              <>
                <Check className="w-4 h-4" /> Current Active Plan
              </>
            ) : (
              <>
                Subscribe Monthly ($29/mo) <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* ANNUAL ALL-ACCESS PASS (FEATURED) */}
        <div className="bg-gradient-to-br from-cyan-950/40 via-[#0e121e] to-slate-900 border-2 border-cyan-400/60 rounded-3xl p-8 space-y-6 flex flex-col justify-between shadow-2xl shadow-cyan-500/10 relative">
          <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-mono font-extrabold text-[10px] uppercase tracking-wider shadow-lg">
            MOST POPULAR • 40% OFF
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Annual All-Access Pass</h3>
                <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
              </div>
              <p className="text-slate-400 text-xs mt-1">Full 365-day pass with instant downloads & unlimited copying</p>
            </div>

            <div className="pt-2">
              <span className="text-4xl font-extrabold text-cyan-400 font-mono">$199</span>
              <span className="text-slate-400 text-xs font-mono"> / year</span>
              <span className="block text-[11px] text-emerald-400 font-mono mt-0.5">Equals ~$16.50/mo (Billed annually)</span>
            </div>

            <ul className="space-y-3 text-xs text-slate-200 pt-4 border-t border-white/10">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span><strong>Unlimited ZIP Downloads</strong> on every product</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span><strong>1-Click Prompt Copying</strong> directly from cards</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span><strong>Extended Commercial Rights</strong> for SaaS & client sites</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span><strong>Priority Discord Support & Updates</strong></span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleSubscribe('annual')}
            disabled={subscribing !== null || (isSubscribed && subscriptionTier === 'annual')}
            className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xl transition-all ${
              isSubscribed && subscriptionTier === 'annual'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-cyan-400/20'
            }`}
          >
            {subscribing === 'annual' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Activating All-Access...
              </>
            ) : isSubscribed && subscriptionTier === 'annual' ? (
              <>
                <Check className="w-4 h-4" /> Current Active Plan
              </>
            ) : (
              <>
                Activate Annual All-Access ($199/yr) <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <div className="max-w-3xl mx-auto space-y-6 pt-12 border-t border-white/10">
        <h2 className="text-xl font-bold text-white text-center">Membership Questions</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-[#0e121e] border border-white/10 rounded-2xl p-5 space-y-2">
            <h4 className="font-bold text-slate-100">Can I buy individual products without a subscription?</h4>
            <p className="text-slate-400 leading-relaxed">
              Yes! Every product can be purchased individually with a one-time payment for lifetime access to that specific item.
            </p>
          </div>

          <div className="bg-[#0e121e] border border-white/10 rounded-2xl p-5 space-y-2">
            <h4 className="font-bold text-slate-100">How does Copy Prompt & ZIP download work?</h4>
            <p className="text-slate-400 leading-relaxed">
              Active All-Access subscribers can instantly copy full master prompts to clipboard and download complete source ZIP files with 1 click directly on any product card.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
