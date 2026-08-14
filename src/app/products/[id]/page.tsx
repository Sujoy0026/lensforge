'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/types';
import { getProductById, getProducts } from '@/lib/storageService';
import { useAuth } from '@/lib/AuthContext';
import { useCart } from '@/lib/CartContext';
import ProductCard from '@/components/ProductCard';
import UnlockModal from '@/components/UnlockModal';
import { 
  ShoppingBag, 
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
  Loader2 
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { hasAccessToProduct, isSubscribed } = useAuth();
  const { addToCart, isInCart } = useCart();
  
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
  const isAdded = isInCart(product.id);
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

  const handleBuyNow = () => {
    if (!isAdded) {
      addToCart(product);
    }
    router.push('/checkout');
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        
        {/* BACK LINK */}
        <div>
          <Link href="/products" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
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
                <div className="w-full h-full flex items-center justify-center font-mono text-xs text-slate-600">
                  NO PREVIEW IMAGE
                </div>
              )}

              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-slate-950/80 border border-white/20 text-cyan-400 backdrop-blur-md">
                  {product.category.replace('-', ' ')}
                </span>
                {hasZip && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md flex items-center gap-1">
                    <FolderArchive className="w-3.5 h-3.5" /> Source ZIP Included
                  </span>
                )}
              </div>

              {hasAccess && (
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Full Access Unlocked
                  </span>
                </div>
              )}
            </div>

            {/* MASTER PROMPT TEXT CONTAINER */}
            {hasPrompt && (
              <div className="bg-[#0e121e] border border-purple-500/30 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400">
                    <FileText className="w-4 h-4" /> MASTER PROMPT CONTENT
                  </div>
                  
                  <button
                    onClick={handleCopyPrompt}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition-all ${
                      copied
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : hasAccess
                          ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-500/40'
                          : 'bg-white/[0.05] hover:bg-white/10 text-slate-300 border-white/10'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied Full Prompt!
                      </>
                    ) : hasAccess ? (
                      <>
                        <Copy className="w-3.5 h-3.5 text-purple-400" /> Copy Full Master Prompt
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-slate-400" /> Unlock to Copy Full Prompt
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
                        <span className="text-[11px]">Full Master Prompt is locked. Buy this asset or subscribe to All-Access to view & copy.</span>
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

          {/* RIGHT COLUMN: PRICING & BUY / SUBSCRIBE ACTIONS */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-[#0e121e] border border-white/10 rounded-2xl p-7 space-y-6">
              
              <div>
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

                <div className="text-3xl font-extrabold text-cyan-400 font-mono">
                  ${product.price.toFixed(2)}
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="pt-4 border-t border-white/10 space-y-2">
                <h3 className="text-xs font-mono text-slate-300 uppercase tracking-wider">Product Overview</h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* BUY & ALL-ACCESS CALLOUT */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                {hasAccess ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                    <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                    <p className="font-bold text-white text-xs">You have full access to this asset!</p>
                    <p className="text-slate-400 text-[11px]">Copy the prompt or download the source ZIP anytime.</p>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleBuyNow}
                      className="w-full py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-400/20"
                    >
                      Buy Single Asset for ${product.price.toFixed(2)}
                    </button>

                    <button
                      onClick={() => addToCart(product)}
                      className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-colors ${
                        isAdded 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                          : 'bg-white/[0.05] hover:bg-white/10 text-slate-200 border-white/10'
                      }`}
                    >
                      {isAdded ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                      {isAdded ? 'Added to Cart' : 'Add to Cart'}
                    </button>

                    {/* ALL-ACCESS MEMBERSHIP BANNER */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/50 to-indigo-950/50 border border-cyan-500/30 space-y-2 mt-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-cyan-400" /> Annual All-Access Pass
                        </span>
                        <span className="font-mono text-cyan-400 font-bold">$199/yr</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Unlock this asset and ALL other templates, prompts, and ZIPs across the entire platform.
                      </p>
                      <Link
                        href="/pricing"
                        className="block w-full py-2 rounded-lg bg-white/[0.08] hover:bg-white/15 text-center text-xs font-semibold text-cyan-300 border border-white/10 transition-colors"
                      >
                        Explore All-Access Membership
                      </Link>
                    </div>
                  </>
                )}
              </div>

              {/* GUARANTEE */}
              <div className="pt-4 border-t border-white/10 text-center text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-cyan-400 font-mono font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Guaranteed Digital Access & Lifetime Updates
                </div>
                <p>Commercial license included for client and commercial projects.</p>
              </div>

            </div>

          </div>

        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="pt-8 border-t border-white/10 space-y-6">
            <h2 className="text-xl font-bold text-white tracking-tight">Related Digital Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
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
