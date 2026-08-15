'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Code, 
  FileText, 
  LayoutDashboard, 
  Box, 
  Lock,
  Mail,
  Check
} from 'lucide-react';
import LensForgeLogo from './LensForgeLogo';

export default function Footer() {
  const [footerEmail, setFooterEmail] = useState('');
  const [footerSuccess, setFooterSuccess] = useState(false);

  const handleFooterSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (footerEmail && footerEmail.includes('@')) {
      setFooterSuccess(true);
      setFooterEmail('');
      setTimeout(() => setFooterSuccess(false), 4000);
    }
  };

  return (
    <footer className="bg-[#05070c] border-t border-white/10 text-slate-400 text-xs py-14 mt-16">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* TOP ROW: ABOUT US SECTION & COLUMNS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* ABOUT US SECTION (4 COLUMNS) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block">
              <LensForgeLogo size={32} />
            </Link>

            <div className="space-y-2.5 pr-2">
              <h4 className="font-mono text-[11px] text-slate-200 uppercase font-bold tracking-wider">
                Digital Products Studio
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                LensForge is an independent studio crafting battle-tested website starters, analytics dashboards, WebGL 3D scenes, and master LLM prompts — built with clean code and zero fluff.
              </p>
              <div className="pt-1 flex items-center gap-2 text-emerald-400 font-mono text-[11px]">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>100% Verified Production Code</span>
              </div>
            </div>
          </div>

          {/* CATALOG NAVIGATION (2 COLUMNS) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-mono text-[11px] text-slate-200 uppercase font-semibold tracking-wider">
              Catalog
            </h4>
            <ul className="space-y-2.5 text-slate-400">
              <li>
                <Link href="/products?category=prompts" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-400" /> Master Prompts
                </Link>
              </li>
              <li>
                <Link href="/products?category=templates" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-indigo-400" /> Web Starters
                </Link>
              </li>
              <li>
                <Link href="/products?category=dashboards" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" /> UI Kits
                </Link>
              </li>
              <li>
                <Link href="/products?category=3d-heroes" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-cyan-400" /> 3D Heroes
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-cyan-400 transition-colors text-slate-300 font-semibold">
                  All Products →
                </Link>
              </li>
            </ul>
          </div>

          {/* MEMBERSHIP & TRUST (3 COLUMNS) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-mono text-[11px] text-slate-200 uppercase font-semibold tracking-wider">
              Membership & Trust
            </h4>
            <ul className="space-y-2.5 text-slate-400">
              <li>
                <Link href="/pricing" className="hover:text-cyan-300 text-cyan-400 font-semibold transition-colors flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" /> All-Access Pass ($199/yr)
                </Link>
              </li>
              <li>
                <Link href="/license" className="hover:text-cyan-400 transition-colors">
                  Commercial License & Terms
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Studio Changelog
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-cyan-400 transition-colors">
                  My Purchases & Downloads
                </Link>
              </li>
            </ul>
          </div>

          {/* EMAIL WAITLIST & DROPS (3 COLUMNS) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-mono text-[11px] text-slate-200 uppercase font-semibold tracking-wider">
              Weekly Release Drops
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Get notified when new production templates and architectural prompts are released. Zero spam.
            </p>

            <form onSubmit={handleFooterSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  value={footerEmail}
                  onChange={(e) => setFooterEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-400 transition-colors font-mono"
                />
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold font-mono text-xs transition-colors"
              >
                Subscribe to Drops
              </button>
            </form>

            {footerSuccess && (
              <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Subscribed successfully!
              </p>
            )}
          </div>

        </div>

        {/* BOTTOM COPYRIGHT & LEGAL BAR */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © 2026 LensForge Digital Studio. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/license" className="hover:text-slate-400 transition-colors">
              Commercial License & Terms
            </Link>
            <Link href="/changelog" className="hover:text-slate-400 transition-colors">
              Changelog
            </Link>
            <Link href="/pricing" className="hover:text-slate-400 transition-colors">
              Pricing
            </Link>
            <Link href="/admin" className="hover:text-rose-400 text-slate-500 transition-colors flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-500" /> Owner Login
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
