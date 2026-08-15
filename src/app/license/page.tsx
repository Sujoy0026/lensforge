'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Mail, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LicenseTermsPage() {
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
          <ShieldCheck className="w-3.5 h-3.5" /> COMMERCIAL LICENSE & DIGITAL TERMS
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Commercial License Rights & Digital Goods Policy
        </h1>

        <p className="text-slate-400 text-xs sm:text-sm font-mono">
          Effective Date: August 2026 • LensForge Digital Asset Studio (lensforge.online)
        </p>
      </div>

      {/* CORE POLICY SECTIONS */}
      <div className="space-y-10 text-slate-300 text-sm leading-relaxed">
        
        {/* SECTION 1: DIGITAL DELIVERY & SALES POLICY */}
        <section className="space-y-4 bg-[#0e121e] border border-white/10 rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-cyan-400" />
            1. Instant Digital Delivery (All Sales Final)
          </h2>
          <p>
            Because all products sold on LensForge (including Master Prompts, full-stack Next.js source code ZIPs, and UI kits) are digital goods delivered and unlocked immediately upon purchase, <strong>all single-purchase sales and membership subscription payments are final and non-refundable</strong>.
          </p>
          <p className="text-slate-400 text-xs">
            We provide verified TypeScript code, direct code snippets, and setup instructions. If you need technical assistance running or configuring any asset, our engineering support is available at <a href="mailto:support@lensforge.online" className="text-cyan-400 underline">support@lensforge.online</a>.
          </p>
        </section>

        {/* SECTION 2: COMMERCIAL USAGE & CLIENT LICENSING */}
        <section className="space-y-4 bg-[#0e121e] border border-white/10 rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            2. Commercial License Rights
          </h2>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>Unlimited Commercial Projects:</strong> Use in unlimited commercial websites, client deliverables, and SaaS products.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>End-Product Monetization:</strong> Charge clients or sell subscriptions to SaaS applications built using our templates and prompts.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">✕</span>
              <span><strong>No Raw Redistribution:</strong> You may not re-package, resell, or distribute the raw source code ZIP or prompts as a standalone template or competitor marketplace.</span>
            </li>
          </ul>
        </section>

        {/* SECTION 3: WHAT HAPPENS IF A SUBSCRIPTION LAPSES */}
        <section className="space-y-4 bg-[#0e121e] border border-white/10 rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-purple-400" />
            3. What Happens to Downloaded Files if Your Subscription Lapses?
          </h2>
          <p>
            <strong>You keep all downloaded assets forever.</strong> All source code ZIP files, templates, and master prompts downloaded during an active Annual or Monthly All-Access Pass remain licensed to you perpetually for your personal and commercial projects.
          </p>
          <p className="text-slate-400 text-xs">
            If your subscription ends, you simply lose access to download <em>new future releases</em> dropped after your expiration date until you renew.
          </p>
        </section>

        {/* SECTION 4: ONE-TIME LIFETIME PURCHASES */}
        <section className="space-y-4 bg-[#0e121e] border border-white/10 rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-white">
            4. One-Time "Lifetime Access" Purchases
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            When you purchase a single digital product without a subscription, you receive perpetual lifetime access to that asset, including all future patches, bugfixes, and framework updates published for that item version.
          </p>
        </section>

      </div>

      {/* FOOTER CTA */}
      <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link 
          href="/pricing"
          className="px-6 py-3 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-colors"
        >
          View All-Access Membership Plans
        </Link>
        <Link 
          href="/products" 
          className="text-xs text-slate-400 hover:text-white transition-colors"
        >
          Browse All Products →
        </Link>
      </div>

    </div>
  );
}
