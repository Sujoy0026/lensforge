'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { getProducts } from '@/lib/storageService';
import ProductCard from '@/components/ProductCard';
import ProductSkeleton from '@/components/ProductSkeleton';
import EmptyState from '@/components/EmptyState';
import { 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Zap, 
  ShieldCheck, 
  FolderArchive, 
  Mail, 
  RefreshCw, 
  AlertCircle,
  Check
} from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email drop waitlist state
  const [emailInput, setEmailInput] = useState('');
  const [emailSuccess, setEmailSuccess] = useState(false);

  const fetchHomeProducts = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err: any) {
      console.error('[LensForge Home] Failed to load products:', err);
      setErrorMessage('Unable to load latest products. Click retry to refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeProducts();
  }, []);

  const handleEmailSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput && emailInput.includes('@')) {
      setEmailSuccess(true);
      setEmailInput('');
      setTimeout(() => setEmailSuccess(false), 4000);
    }
  };

  return (
    <div className="space-y-16 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 overflow-hidden border-b border-white/[0.08]">
        
        {/* BACKGROUND GLOW ACCENTS */}
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">
          
          {/* LIVE BADGE */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/15 via-indigo-500/15 to-transparent border border-cyan-500/30 text-cyan-300 font-mono text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-bold tracking-wider">PRODUCTION DIGITAL ASSET REPOSITORY</span>
          </div>

          {/* MAIN HEADLINE */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.08]">
            Build in minutes with <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              Architect-Grade
            </span> Digital Assets.
          </h1>

          {/* DESCRIPTION */}
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            LensForge delivers battle-tested <strong>Master AI Prompts</strong>, full-stack <strong>Next.js Website Starters</strong>, <strong>Analytics Dashboards</strong>, and <strong>WebGL 3D Scenes</strong> — clean code with zero fluff.
          </p>

          {/* ACTION BUTTONS & EMAIL CAPTURE */}
          <div className="space-y-6 pt-2 flex flex-col items-center">
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link 
                href="/products" 
                className="px-8 py-4 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 font-extrabold text-sm hover:from-cyan-300 hover:to-teal-300 transition-all flex items-center gap-2 shadow-xl shadow-cyan-400/25 group"
              >
                Browse All Assets 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link 
                href="/pricing" 
                className="px-7 py-4 rounded-full bg-white/[0.05] hover:bg-white/10 border border-cyan-500/40 text-cyan-300 font-bold text-sm transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-cyan-400" /> All-Access Pass ($199/yr)
              </Link>
            </div>

            {/* ABOVE-THE-FOLD EMAIL LEAD CAPTURE */}
            <form onSubmit={handleEmailSubscribe} className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full max-w-md mx-auto">
              <div className="relative flex-1">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter email for weekly new drops..."
                  className="w-full bg-slate-950/80 border border-white/15 rounded-full px-4 py-2.5 pl-10 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-400 transition-colors"
                />
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-white/[0.08] hover:bg-white/15 border border-white/15 text-slate-200 font-mono text-xs font-semibold whitespace-nowrap transition-colors"
              >
                Join Drops
              </button>
            </form>
            {emailSuccess && (
              <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Subscribed! You will receive new release alerts.
              </p>
            )}
          </div>

          {/* VALUE PROPOSITION MATRIX */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/[0.08] max-w-2xl mx-auto">
            <div className="space-y-0.5">
              <div className="text-white font-extrabold text-lg sm:text-xl font-mono flex items-center justify-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" /> 1-Click
              </div>
              <div className="text-slate-400 text-xs">Instant Prompt Copy</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-white font-extrabold text-lg sm:text-xl font-mono flex items-center justify-center gap-1.5">
                <FolderArchive className="w-4 h-4 text-amber-400" /> Source ZIP
              </div>
              <div className="text-slate-400 text-xs">Included with Assets</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-white font-extrabold text-lg sm:text-xl font-mono flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified
              </div>
              <div className="text-slate-400 text-xs">TypeScript & Next.js 15</div>
            </div>
          </div>

        </div>
      </section>

      {/* FEATURED & RECENT PRODUCTS */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Recent Digital Products</h2>
            <p className="text-slate-400 text-xs mt-1">Production-ready source code, 3D scenes, prompts & UI templates</p>
          </div>
          <Link href="/products" className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold">
            View All ({products.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ERROR STATE */}
        {errorMessage && (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-3 max-w-lg mx-auto my-8">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-white font-bold text-sm">Failed to Load Recent Assets</h3>
            <p className="text-slate-400 text-xs">{errorMessage}</p>
            <button
              onClick={fetchHomeProducts}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Fetch
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
          </div>
        ) : !errorMessage && products.length === 0 ? (
          <EmptyState 
            icon={Sparkles}
            title="New Digital Assets Launching Soon"
            description="Our latest collection of architectural master prompts, Next.js starters, and 3D scenes are currently being refreshed. Subscribe to the All-Access Pass to unlock the entire catalog on drop."
            actionText="Explore All-Access Membership"
            actionHref="/pricing"
          />
        ) : !errorMessage && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* DEVELOPER GUARANTEE BANNER */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-gradient-to-r from-slate-900 via-[#0e121e] to-slate-900 border border-white/10 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
              <ShieldCheck className="w-4 h-4" /> 100% PRODUCTION VERIFIED
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Ready to ship your next project faster?
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
              Unlock unlimited immediate downloads across every website template, dashboard UI, WebGL shader, and Master AI prompt with full commercial rights.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              href="/pricing" 
              className="px-7 py-3.5 rounded-full bg-cyan-400 text-slate-950 font-extrabold text-sm hover:bg-cyan-300 transition-all flex items-center justify-center gap-2 shadow-xl shadow-cyan-400/25 flex-shrink-0"
            >
              <Zap className="w-4 h-4" /> Get All-Access Pass ($199/yr)
            </Link>
            <Link 
              href="/products" 
              className="px-6 py-3.5 rounded-full bg-white/[0.05] hover:bg-white/10 border border-white/15 text-slate-300 text-sm font-semibold flex items-center justify-center transition-colors"
            >
              Browse All Assets
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
