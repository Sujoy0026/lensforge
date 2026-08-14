import React from 'react';
import Link from 'next/link';
import { Layers, ShieldCheck, Zap, Sparkles, Code, FileText, LayoutDashboard, Box, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#05070c] border-t border-white/10 text-slate-400 text-xs py-14 mt-16">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* TOP ROW: ABOUT US SECTION & COLUMNS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* ABOUT US SECTION (5 COLUMNS) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20">
                <Layers className="w-4 h-4 text-slate-950" />
              </div>
              <span className="font-extrabold text-white tracking-tight text-base">
                LENS<span className="text-cyan-400">FORGE</span>
              </span>
            </div>

            <div className="space-y-3 pr-4">
              <h4 className="font-mono text-[11px] text-slate-200 uppercase font-bold tracking-wider">
                About LensForge Studio
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                LensForge is an independent digital assets studio and architecture prompt repository designed for software founders, frontend engineers, and indie builders. We develop production-grade website starters, analytics dashboards, WebGL 3D hero scenes, and battle-tested architectural master prompts — meticulously engineered with clean code, modern typography, and zero fluff.
              </p>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Every digital package is crafted to accelerate development cycles from weeks to minutes with full commercial usage rights.
              </p>
            </div>
          </div>

          {/* CATALOG NAVIGATION (3 COLUMNS) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-mono text-[11px] text-slate-200 uppercase font-semibold tracking-wider">
              Digital Catalog
            </h4>
            <ul className="space-y-2.5 text-slate-400">
              <li>
                <Link href="/products?category=prompts" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-purple-400" /> Master AI Prompts
                </Link>
              </li>
              <li>
                <Link href="/products?category=templates" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                  <Code className="w-3.5 h-3.5 text-indigo-400" /> Website Templates
                </Link>
              </li>
              <li>
                <Link href="/products?category=dashboards" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                  <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" /> Dashboard UI Kits
                </Link>
              </li>
              <li>
                <Link href="/products?category=3d-heroes" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                  <Box className="w-3.5 h-3.5 text-cyan-400" /> 3D Hero Animations
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-cyan-400 transition-colors flex items-center gap-2 text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Browse All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* MEMBERSHIP & ACCESS (4 COLUMNS) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="font-mono text-[11px] text-slate-200 uppercase font-semibold tracking-wider">
              Membership & Access
            </h4>
            <ul className="space-y-2.5 text-slate-400">
              <li>
                <Link href="/pricing" className="hover:text-cyan-300 text-cyan-400 font-semibold transition-colors flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" /> Annual All-Access Pass ($199/yr)
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-cyan-400 transition-colors">
                  My Purchases & Download Library
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-cyan-400 transition-colors">
                  Shopping Cart & Checkout
                </Link>
              </li>
              <li>
                <Link href="/auth/signin" className="hover:text-cyan-400 transition-colors">
                  Customer Sign In / Register
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-rose-400 text-slate-400 transition-colors flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-rose-400" /> Admin Portal (Owner Login)
                </Link>
              </li>
            </ul>

            <div className="pt-2 border-t border-white/[0.08] flex items-center gap-2 text-emerald-400 font-mono text-[11px]">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>100% Guaranteed Digital File Access</span>
            </div>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT & LEGAL BAR */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © 2026 LensForge Digital Studio. All rights reserved.
          </div>
          <div className="flex items-center gap-5">
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Commercial License</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Privacy Policy</span>
            <Link href="/admin" className="hover:text-rose-400 text-slate-500 transition-colors flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-500" /> Owner Login
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
