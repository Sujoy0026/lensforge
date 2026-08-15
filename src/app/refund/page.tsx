'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Mail, FileText, CheckCircle2 } from 'lucide-react';

export default function DigitalGoodsPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
      
      {/* HEADER */}
      <div className="space-y-4 border-b border-white/10 pb-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Storefront
        </Link>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" /> DIGITAL GOODS & LICENSE POLICY
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Digital Goods Delivery & License Policy
        </h1>

        <p className="text-slate-400 text-xs sm:text-sm font-mono">
          LensForge Digital Asset Studio • lensforge.online
        </p>
      </div>

      {/* CORE POLICY */}
      <div className="space-y-8 text-slate-300 text-sm leading-relaxed">
        
        <section className="space-y-4 bg-[#0e121e] border border-white/10 rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-cyan-400" />
            Instant Digital Delivery (All Sales Final)
          </h2>
          <p>
            Because all products on LensForge (including master prompts, full Next.js source code ZIPs, and UI packages) are digital assets delivered and unlocked immediately upon transaction completion, <strong>all purchases and subscription charges are final and non-refundable</strong>.
          </p>
          <p className="text-slate-400 text-xs">
            We provide clean, production-verified TypeScript code. If you have any technical questions or need setup help, our engineers are available to support you at <a href="mailto:support@lensforge.online" className="text-cyan-400 underline">support@lensforge.online</a>.
          </p>
        </section>

        <section className="space-y-4 bg-[#0e121e] border border-white/10 rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Full Commercial Rights Included
          </h2>
          <p>
            Every product includes commercial usage rights for unlimited client deliverables and monetized SaaS end-products.
          </p>
          <div className="pt-2">
            <Link href="/license" className="text-cyan-400 hover:underline text-xs font-semibold">
              Read Full Commercial License Terms →
            </Link>
          </div>
        </section>

      </div>

    </div>
  );
}
