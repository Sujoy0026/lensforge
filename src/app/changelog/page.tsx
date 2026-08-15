'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Code, Zap, ShieldCheck, Box, FileText, CheckCircle2 } from 'lucide-react';

export default function ChangelogPage() {
  const releases = [
    {
      version: 'v2.4.0',
      date: 'August 14, 2026',
      badge: 'Latest Release',
      title: 'Next.js 15.2 Architecture & Supabase RLS Fixes',
      items: [
        'Enhanced catalog resilience with 8-second query timeout and instant offline failover.',
        'Refreshed all master prompts with strict React 19 and Next.js 15 App Router server action patterns.',
        'Added 14-Day Money-Back Guarantee & Transparent Commercial License documentation.',
        'International payments and multi-currency checkout badging.'
      ]
    },
    {
      version: 'v2.3.0',
      date: 'August 10, 2026',
      title: 'WebGL 3D Hero Shaders & Three.js Canvas Kits',
      items: [
        'Released HyperSphere WebGL Three.js kinetic glass hero shader with customizable uniforms.',
        'Published Vanguard High-Frequency Financial & Analytics Dashboard suite.',
        'Integrated 1-click clipboard prompt copy directly on product cards.'
      ]
    },
    {
      version: 'v2.0.0',
      date: 'August 1, 2026',
      title: 'LensForge Studio Launch & Annual All-Access Pass',
      items: [
        'Launched the Annual All-Access Pass ($199/yr) offering unlimited downloads across the entire catalog.',
        'Introduced 4 core studio categories: Master Prompts, Website Starters, UI Kits, and 3D Heroes.',
        'Owner Vault Security Gate with secret passcode authentication.'
      ]
    }
  ];

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
          <Sparkles className="w-3.5 h-3.5" /> STUDIO RELEASES & UPDATES
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          LensForge Changelog & What&apos;s New
        </h1>

        <p className="text-slate-400 text-xs sm:text-sm">
          Track continuous improvements, newly dropped master prompts, Next.js starters, and framework updates.
        </p>
      </div>

      {/* RELEASES LIST */}
      <div className="space-y-8">
        {releases.map((rel, idx) => (
          <div 
            key={idx} 
            className="bg-[#0e121e] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4 hover:border-white/20 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-cyan-400">{rel.version}</span>
                {rel.badge && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                    {rel.badge}
                  </span>
                )}
                <h3 className="font-bold text-white text-base">{rel.title}</h3>
              </div>
              <span className="text-xs font-mono text-slate-500">{rel.date}</span>
            </div>

            <ul className="space-y-2 text-xs text-slate-300">
              {rel.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* FOOTER CTA */}
      <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-400 font-mono">
          All-Access subscribers receive instant access to every new drop automatically.
        </p>
        <Link 
          href="/pricing"
          className="px-6 py-3 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-colors"
        >
          Get All-Access Membership
        </Link>
      </div>

    </div>
  );
}
