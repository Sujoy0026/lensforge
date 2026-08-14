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
  Box, 
  Code, 
  LayoutDashboard, 
  FileText, 
  Zap, 
  ShieldCheck, 
  Package,
  Copy,
  Check,
  Terminal,
  Download,
  FolderArchive
} from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'prompt' | 'template' | 'dashboard' | '3d'>('prompt');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    };
    loadData();
  }, []);

  const samplePrompts = {
    prompt: {
      tag: 'MASTER LLM ARCHITECT',
      title: 'Full-Stack Next.js 15 App Router System Prompt',
      lang: 'markdown',
      code: `# ROLE: Elite Full-Stack Software Architect
You write strict TypeScript, modular Next.js 15 App Router architecture,
and ultra-clean Tailwind CSS. You prioritize maximum UI performance,
instant zero-layout-shift hydration, and type-safe server actions.

## ARCHITECTURE GUIDELINES
1. Zero unnecessary external dependencies.
2. Production-grade Supabase RLS security policies.
3. Clean separation of Client and Server Components.`,
    },
    template: {
      tag: 'PRODUCTION APP STARTER',
      title: 'SaaS Multi-Tenant Boilerplate',
      lang: 'typescript',
      code: `// app/api/organizations/[id]/billing/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // Instant verified billing checkout dispatch
  return NextResponse.json({ success: true, tier: 'enterprise_annual' });
}`,
    },
    dashboard: {
      tag: 'ANALYTICS UI SUITE',
      title: 'Real-time Financial Telemetry Kit',
      lang: 'typescript',
      code: `// components/charts/RevenueMetrics.tsx
export const RevenueTelemetry = ({ mrr, arr, churnRate }: MetricsProps) => (
  <div className="grid grid-cols-3 gap-4 font-mono">
    <MetricCard label="ARR VELOCITY" value={formatCurrency(arr)} delta="+28.4%" />
    <MetricCard label="ACTIVE MRR" value={formatCurrency(mrr)} delta="+14.2%" />
    <MetricCard label="CHURN RATE" value={churnRate} status="optimal" />
  </div>
);`,
    },
    '3d': {
      tag: 'WEBGL HERO SHADER',
      title: 'Three.js Glass Polyhedron Simulation',
      lang: 'glsl',
      code: `// shaders/iridescentGlass.frag
uniform float uTime;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float fresnel = pow(1.0 - dot(viewDir, vNormal), 3.0);
  vec3 neonGlow = mix(vec3(0.02, 0.85, 0.95), vec3(0.45, 0.2, 0.98), fresnel);
  gl_FragColor = vec4(neonGlow, 0.92);
}`,
    }
  };

  const handleCopySample = () => {
    navigator.clipboard.writeText(samplePrompts[activeTab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categoriesList = [
    { id: 'prompts', title: 'Master AI Prompts', count: 'Curated Prompts', icon: FileText, desc: 'Architectural LLM prompts engineered for Next.js, Cloud & Systems' },
    { id: 'templates', title: 'Website Templates', count: 'Full Codebases', icon: Code, desc: 'Production-ready Next.js & React starters with clean TypeScript' },
    { id: 'dashboards', title: 'Dashboard UI Kits', count: 'Admin Suites', icon: LayoutDashboard, desc: 'Typography-led dark mode analytics and SaaS control hubs' },
    { id: '3d-heroes', title: '3D Hero Assets', count: 'WebGL Scenes', icon: Box, desc: 'Interactive Three.js particle scenes and customizable 3D canvases' },
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* VIBRANT & EXCITING HERO SHOWCASE */}
      <section className="relative pt-12 pb-16 overflow-hidden border-b border-white/[0.08]">
        
        {/* BACKGROUND GLOW ACCENTS */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          
          {/* LEFT COLUMN: PUNCHY HEADLINE & CALL TO ACTIONS */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* LIVE PULSE BADGE */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/15 via-indigo-500/15 to-transparent border border-cyan-500/30 text-cyan-300 font-mono text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-bold tracking-wider">PRODUCTION DIGITAL ASSET REPOSITORY</span>
            </div>

            {/* MAIN HEADLINE */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.06]">
              Build in minutes with <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">Architect-Grade</span> Digital Assets.
            </h1>

            {/* DESCRIPTION */}
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
              LensForge is an independent studio delivering battle-tested <strong>Master AI Prompts</strong>, full-stack <strong>Next.js Website Starters</strong>, <strong>Analytics Dashboards</strong>, and <strong>WebGL 3D Scenes</strong> — clean code with zero fluff.
            </p>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link 
                href="/products" 
                className="px-7 py-3.5 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 font-extrabold text-sm hover:from-cyan-300 hover:to-teal-300 transition-all flex items-center gap-2 shadow-xl shadow-cyan-400/25 group"
              >
                Browse All Assets 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link 
                href="/pricing" 
                className="px-6 py-3.5 rounded-full bg-white/[0.05] hover:bg-white/10 border border-cyan-500/40 text-cyan-300 font-bold text-sm transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-cyan-400" /> All-Access Pass ($199/yr)
              </Link>
            </div>

            {/* VALUE PROPOSITION MATRIX */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/[0.08]">
              <div className="space-y-0.5">
                <div className="text-white font-extrabold text-lg sm:text-xl font-mono flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-cyan-400" /> 1-Click
                </div>
                <div className="text-slate-400 text-[11px]">Instant Prompt Copy</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-white font-extrabold text-lg sm:text-xl font-mono flex items-center gap-1.5">
                  <FolderArchive className="w-4 h-4 text-amber-400" /> Source ZIP
                </div>
                <div className="text-slate-400 text-[11px]">Included with Assets</div>
              </div>

              <div className="space-y-0.5">
                <div className="text-white font-extrabold text-lg sm:text-xl font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100%
                </div>
                <div className="text-slate-400 text-[11px]">Commercial Rights</div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: INTERACTIVE ASSET SHOWCASE TERMINAL */}
          <div className="lg:col-span-6">
            <div className="bg-[#0b0e18] border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-cyan-500/10 space-y-4 relative overflow-hidden backdrop-blur-xl">
              
              {/* TOP BAR WITH TAB SWITCHERS */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>STUDIO LIVE ASSET PREVIEW</span>
                </div>

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10 text-[11px] font-mono">
                  <button
                    onClick={() => setActiveTab('prompt')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${activeTab === 'prompt' ? 'bg-purple-500/20 text-purple-300 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Prompt
                  </button>
                  <button
                    onClick={() => setActiveTab('template')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${activeTab === 'template' ? 'bg-indigo-500/20 text-indigo-300 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Next.js
                  </button>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    UI Kit
                  </button>
                  <button
                    onClick={() => setActiveTab('3d')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${activeTab === '3d' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    3D Scene
                  </button>
                </div>
              </div>

              {/* ASSET TITLE & TAG */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-white/[0.06] text-cyan-400 border border-white/10">
                    {samplePrompts[activeTab].tag}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                    {samplePrompts[activeTab].title}
                  </h3>
                </div>

                <button
                  onClick={handleCopySample}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-400/20 flex-shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Code
                    </>
                  )}
                </button>
              </div>

              {/* CODE / PROMPT PREVIEW CONTAINER */}
              <div className="relative bg-slate-950/90 border border-white/10 rounded-2xl p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-56">
                <pre className="text-[11px] leading-relaxed text-cyan-200">
                  {samplePrompts[activeTab].code}
                </pre>
              </div>

              {/* FOOTER BADGES */}
              <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> Verified TypeScript & Next.js 15
                </div>
                <Link href="/products" className="text-cyan-400 hover:underline flex items-center gap-1">
                  Explore Full Catalog <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Explore Categories</h2>
            <p className="text-slate-400 text-xs mt-0.5">Filter by the exact type of digital asset you need</p>
          </div>
          <Link href="/products" className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold">
            All Products <ArrowRight className="w-3.5 h-3.5" />
          </Link>
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
        <div className="bg-gradient-to-r from-slate-900 via-[#0e121e] to-slate-900 border border-white/10 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
              <ShieldCheck className="w-4 h-4" /> 100% PRODUCTION GUARANTEE
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Ready to ship your next project faster?
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
              Unlock unlimited immediate downloads across every website template, dashboard UI, WebGL shader, and Master AI prompt with the Annual Pass.
            </p>
          </div>
          <Link 
            href="/pricing" 
            className="px-7 py-3.5 rounded-full bg-cyan-400 text-slate-950 font-extrabold text-sm hover:bg-cyan-300 transition-all flex items-center gap-2 shadow-xl shadow-cyan-400/25 flex-shrink-0"
          >
            <Zap className="w-4 h-4" /> Get All-Access Pass ($199/yr)
          </Link>
        </div>
      </section>

    </div>
  );
}
