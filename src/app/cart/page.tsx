'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, Check, ArrowRight, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function CartPage() {
  const { isSubscribed } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-10">
      
      {/* HEADER */}
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold">
          <Zap className="w-3.5 h-3.5" /> 100% ALL-ACCESS MEMBERSHIP MODEL
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          One Pass. Every Asset. Zero Per-Item Fees.
        </h1>

        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
          LensForge operates exclusively on an All-Access Membership. Instead of purchasing assets individually, a single pass unlocks immediate downloads and master prompts across the entire catalog.
        </p>
      </div>

      {/* MEMBERSHIP BOX */}
      <div className="bg-[#0e121e] border-2 border-cyan-400/50 rounded-3xl p-8 sm:p-10 space-y-8 shadow-2xl shadow-cyan-500/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400" />
              Annual All-Access Pass
            </h3>
            <p className="text-slate-400 text-xs mt-1">Unlimited 365-day access to all website templates, UI kits, and prompts</p>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-3xl font-extrabold text-cyan-400 font-mono">$199</div>
            <div className="text-[11px] text-slate-400 font-mono">/ year (~$16.50/mo)</div>
          </div>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-200">
          <li className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span><strong>Unlimited ZIP Downloads</strong> on every product</span>
          </li>
          <li className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span><strong>1-Click Prompt Copying</strong> directly to clipboard</span>
          </li>
          <li className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span><strong>Full Commercial Usage</strong> for client & SaaS apps</span>
          </li>
          <li className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span><strong>All Future Drops</strong> included automatically</span>
          </li>
        </ul>

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/pricing"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-400/20 flex-1"
          >
            <Zap className="w-4 h-4" /> View All-Access Plans ($29/mo or $199/yr) <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/products"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center justify-center transition-colors"
          >
            Browse Catalog
          </Link>
        </div>
      </div>

    </div>
  );
}
