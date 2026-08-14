'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { getProducts } from '@/lib/storageService';
import ProductCard from '@/components/ProductCard';
import ProductSkeleton from '@/components/ProductSkeleton';
import EmptyState from '@/components/EmptyState';
import { ArrowRight, Sparkles, Layers, Box, Code, LayoutDashboard, FileText, Zap, ShieldCheck, Package } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    };
    loadData();
  }, []);

  const categoriesList = [
    { id: 'prompts', title: 'Master AI Prompts', count: 'System Prompts', icon: FileText, desc: 'Curated LLM master prompts for software & cloud architecture' },
    { id: 'templates', title: 'Website Templates', count: 'Production Apps', icon: Code, desc: 'Next.js & React production starter websites & themes' },
    { id: 'dashboards', title: 'Dashboard UI Kits', count: 'Analytics Suites', icon: LayoutDashboard, desc: 'Typography-led admin terminals and financial suites' },
    { id: '3d-heroes', title: '3D Hero Assets', count: 'WebGL Scenes', icon: Box, desc: 'Three.js particle shaders and 3D glass polyhedrons' },
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* QUIET TYPOGRAPHY-LED HERO SECTION */}
      <section className="relative pt-16 pb-12 overflow-hidden border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> DIGITAL PRODUCTS STUDIO
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08]">
              Architectural <span className="text-cyan-400">Digital Assets</span> & Master Prompts
            </h1>

            <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl">
              LensForge provides founders and developers with production-ready Website Templates, SaaS Source Code, Analytics Dashboards, WebGL 3D Heroes, and Architecture Prompts.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link 
                href="/products" 
                className="px-6 py-3 rounded-full bg-cyan-400 text-slate-950 font-bold text-sm hover:bg-cyan-300 transition-all flex items-center gap-2 shadow-lg shadow-cyan-400/20"
              >
                Browse All Assets <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/pricing" 
                className="px-6 py-3 rounded-full bg-white/[0.05] hover:bg-white/10 border border-cyan-500/30 text-cyan-300 font-semibold text-sm transition-all flex items-center gap-1.5"
              >
                <Zap className="w-4 h-4 text-cyan-400" /> Annual All-Access Pass
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/[0.08] text-slate-400 text-xs font-mono">
              <div>
                <span className="block text-xl font-bold text-white font-sans">100%</span> Verified Code
              </div>
              <div>
                <span className="block text-xl font-bold text-cyan-400 font-sans">1-Click</span> Prompt Copy
              </div>
              <div>
                <span className="block text-xl font-bold text-white font-sans">Source ZIP</span> Included
              </div>
            </div>
          </div>

          {/* HERO FEATURED PREVIEW CARD */}
          <div className="lg:col-span-5">
            {loading ? (
              <ProductSkeleton />
            ) : products[0] ? (
              <div className="relative">
                <div className="absolute -top-3 -right-3 px-3 py-1 bg-cyan-400 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider rounded-full shadow-lg z-10 font-mono">
                  FEATURED ASSET
                </div>
                <ProductCard product={products[0]} />
              </div>
            ) : null}
          </div>

        </div>
      </section>

      {/* CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Explore Categories</h2>
            <p className="text-slate-400 text-xs mt-0.5">Filter by the exact type of digital asset you need</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoriesList.map((cat) => {
            const IconComp = cat.icon;
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="bg-[#0e121e] border border-white/10 hover:border-cyan-400/40 rounded-2xl p-5 group transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] group-hover:bg-cyan-500/20 text-slate-300 group-hover:text-cyan-400 border border-white/10 flex items-center justify-center mb-4 transition-colors">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-100 text-sm group-hover:text-cyan-400 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-1 leading-relaxed line-clamp-2">
                    {cat.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] text-[10px] font-mono text-cyan-400 flex items-center justify-between">
                  <span>{cat.count}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
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

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
          </div>
        ) : products.length === 0 ? (
          <EmptyState 
            icon={Sparkles}
            title="New Digital Assets Launching Soon"
            description="Our latest collection of architectural master prompts, Next.js starters, and 3D scenes are currently being refreshed. Subscribe to the All-Access Pass to unlock the entire catalog on drop."
            actionText="Explore All-Access Membership"
            actionHref="/pricing"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* DEVELOPER GUARANTEE BANNER */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-gradient-to-r from-slate-900 via-[#0e121e] to-slate-900 border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold mb-2">
              <ShieldCheck className="w-4 h-4" /> GUARANTEED QUALITY & RE-DOWNLOADS
            </div>
            <h3 className="text-xl font-bold text-white">Instant Access & Lifetime Updates</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-xl">
              When you purchase any template, prompt, or source zip on LensForge, you get immediate access to download your files with lifetime re-download rights in your Customer Account.
            </p>
          </div>

          <Link
            href="/auth/signup"
            className="px-6 py-3 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-colors whitespace-nowrap shadow-lg shadow-cyan-400/20"
          >
            Create Developer Account
          </Link>
        </div>
      </section>

    </div>
  );
}
