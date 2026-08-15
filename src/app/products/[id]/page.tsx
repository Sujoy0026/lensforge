'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/types';
import { getProductById, getProducts } from '@/lib/storageService';
import { useAuth } from '@/lib/AuthContext';
import ProductCard from '@/components/ProductCard';
import UnlockModal from '@/components/UnlockModal';
import { 
  Check, 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  Download, 
  Lock, 
  Sparkles, 
  Copy,
  Zap,
  FolderArchive,
  Loader2,
  ArrowRight
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { hasAccessToProduct, isSubscribed } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [unlockType, setUnlockType] = useState<'prompt' | 'zip' | 'general'>('general');

  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true);
      const data = await getProductById(id);
      setProduct(data);

      if (data) {
        const allProds = await getProducts();
        const related = allProds
          .filter(p => p.id !== data.id && (p.category === data.category || p.tags.some(t => data.tags.includes(t))))
          .slice(0, 3);
        setRelatedProducts(related);
      }
      setLoading(false);
    };
    loadDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center text-cyan-400 font-mono text-xs flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading Asset Details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-16 bg-[#0e121e] border border-white/10 rounded-2xl p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Product Not Found</h2>
        <p className="text-slate-400 text-xs">The requested digital asset does not exist or has been removed.</p>
        <Link href="/products" className="inline-block px-5 py-2 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const hasAccess = hasAccessToProduct(product.id);
  const hasZip = Boolean(product.fileUrl && product.fileUrl.trim().length > 0);
  const hasPrompt = Boolean(product.promptContent && product.promptContent.trim().length > 0) || product.category === 'prompts';

  const handleCopyPrompt = () => {
    if (!hasAccess) {
      setUnlockType('prompt');
      setUnlockModalOpen(true);
      return;
    }

    const textToCopy = product.promptContent || `// LensForge Master Prompt: ${product.title}\n// Full instructions and architectural parameters.`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = () => {
    if (!hasAccess) {
      setUnlockType('zip');
      setUnlockModalOpen(true);
      return;
    }

    const link = document.createElement('a');
    link.href = product.fileUrl || '/downloads/lensforge-asset.zip';
    link.download = `${product.title.toLowerCase().replace(/\s+/g, '-')}-source.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        
        {/* BACK LINK */}
        <div>
          <Link href="/products" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-mono">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
          </Link>
        </div>

        {/* MAIN PRODUCT DETAIL GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN: PREVIEW & PROMPT / ZIP DOWNLOAD */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* THUMBNAIL CONTAINER */}
            <div className="bg-[#0e121e] border border-white/10 rounded-2xl overflow-hidden aspect-[16/10] relative bg-slate-950 shadow-2xl">
              {product.thumbnailUrl ? (
                <img src={product.thumbnailUrl} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600 font-mono text-xs">
                  NO PREVIEW IMAGE
                </div>
              )}
              
              {/* UNLOCKED BADGE */}
              {hasAccess && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 backdrop-blur-md">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Member Access Active
                  </span>
                </div>
              )}
            </div>

            {/* MASTER PROMPT VIEW / COPY SECTION */}
            {hasPrompt && (
              <div className="bg-[#0e121e] border border-purple-500/30 rounded-2xl p-6 space-y-4 shadow-xl shadow-purple-500/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold text-white text-sm">Master Prompt & Architecture Instructions</h3>
                  </div>
                  <button
                    onClick={handleCopyPrompt}
                    className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 border transition-all ${
                      copied 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : hasAccess
                          ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border-purple-500/30 shadow-md shadow-purple-500/10'
                          : 'bg-white/[0.05] hover:bg-purple-500/15 text-slate-300 border-white/10'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copied!
                      </>
                    ) : hasAccess ? (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Prompt
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" /> Unlock Prompt
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-950 border border-white/10 rounded-xl p-4 font-mono text-xs text-purple-200 overflow-x-auto leading-relaxed max-h-64">
                  {hasAccess ? (
                    <pre className="whitespace-pre-wrap">{product.promptContent || 'Master prompt instructions ready to execute.'}</pre>
                  ) : (
                    <div className="space-y-3">
                      <pre className="whitespace-pre-wrap text-slate-400 blur-[2px] select-none">
                        {product.promptContent ? product.promptContent.slice(0, 200) : 'System Architecture Master Prompt Instructions...'}
                      </pre>
                      <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20 text-slate-200">
                        <Lock className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                        <span className="text-[11px]">Full Master Prompt is locked. Subscribe to the All-Access Pass to view & copy.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DYNAMIC ZIP DOWNLOAD SECTION IF PRODUCT HAS ZIP */}
            {hasZip && (
              <div className="bg-[#0e121e] border border-amber-500/30 rounded-2xl p-6 space-y-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                    <FolderArchive className="w-4 h-4 text-amber-400" /> Complete Source Code Package (.zip)
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Includes all components, configs, and assets ready for local development.
                  </p>
                </div>

                <button
                  onClick={handleDownloadZip}
                  className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 border transition-all whitespace-nowrap ${
                    hasAccess
                      ? 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400 shadow-lg shadow-amber-500/20'
                      : 'bg-white/[0.05] hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                >
                  {hasAccess ? (
                    <>
                      <Download className="w-4 h-4" /> Download Source ZIP
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" /> Unlock ZIP Download
                    </>
                  )}
                </button>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: ALL-ACCESS SUBSCRIPTION CALLOUT */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-[#0e121e] border border-white/10 rounded-2xl p-7 space-y-6">
              
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono text-xs font-bold mb-3">
                  <Zap className="w-3.5 h-3.5" /> INCLUDED IN ALL-ACCESS PASS
                </div>

                <h1 className="text-2xl font-extrabold text-white tracking-tight leading-snug mb-3">
                  {product.title}
                </h1>

                {/* TAGS */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {product.tags.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-slate-300 text-[11px] font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="pt-4 border-t border-white/10 space-y-2">
                <h3 className="text-xs font-mono text-slate-300 uppercase tracking-wider">Product Overview</h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* ALL-ACCESS MEMBERSHIP ACTION */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                {hasAccess ? (
                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                    <Check className="w-6 h-6 text-emerald-400 mx-auto" />
                    <p className="font-bold text-white text-sm">All-Access Active</p>
                    <p className="text-slate-400 text-xs">You have unlimited instant downloads and prompt copying for this asset.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        setUnlockType('general');
                        setUnlockModalOpen(true);
                      }}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-cyan-400/25"
                    >
                      <Zap className="w-4 h-4" /> Unlock with All-Access Pass <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 to-indigo-950/40 border border-cyan-500/20 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-200 font-bold">
                        <span>All-Access Membership</span>
                        <span className="text-cyan-400 font-mono">$199/yr or $29/mo</span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        One simple subscription unlocks this asset + all templates, prompts, and 3D scenes with zero per-product fees.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* TRUST HIGHLIGHTS */}
              <div className="pt-4 border-t border-white/10 space-y-2.5 text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Instant Source Code ZIP & Prompt Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>TypeScript & Next.js 15 App Router</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Commercial Project Usage Permitted</span>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* RELATED ASSETS */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6 pt-10 border-t border-white/10">
            <h2 className="text-xl font-bold text-white tracking-tight">Related Digital Assets</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* UNLOCK MODAL */}
      <UnlockModal
        product={product}
        isOpen={unlockModalOpen}
        onClose={() => setUnlockModalOpen(false)}
        unlockType={unlockType}
      />
    </>
  );
}
