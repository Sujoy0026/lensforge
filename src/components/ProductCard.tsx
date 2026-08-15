'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useAuth } from '@/lib/AuthContext';
import UnlockModal from '@/components/UnlockModal';
import { 
  Copy, 
  Check, 
  Download, 
  Lock, 
  Eye, 
  FolderArchive,
  Zap,
  Sparkles
} from 'lucide-react';

export default function ProductCard({ product }: { product: Product }) {
  const { hasAccessToProduct, isSubscribed } = useAuth();
  
  const [copied, setCopied] = useState(false);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [unlockType, setUnlockType] = useState<'prompt' | 'zip' | 'general'>('general');

  const hasAccess = hasAccessToProduct(product.id);
  const hasZip = Boolean(product.fileUrl && product.fileUrl.trim().length > 0);
  const hasPrompt = Boolean(product.promptContent && product.promptContent.trim().length > 0) || product.category === 'prompts';

  const handleCopyPrompt = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

  const handleZipClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!hasAccess) {
      setUnlockType('zip');
      setUnlockModalOpen(true);
      return;
    }

    // Trigger download
    const link = document.createElement('a');
    link.href = product.fileUrl || '/downloads/lensforge-asset.zip';
    link.download = `${product.title.toLowerCase().replace(/\s+/g, '-')}-source.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'prompts': return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case '3d-heroes': return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'dashboards': return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'templates':
      default: return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
    }
  };

  return (
    <>
      <div className="group bg-[#0e121e] border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-cyan-500/5 relative">
        
        {/* THUMBNAIL CONTAINER */}
        <Link href={`/products/${product.id}`} className="block relative aspect-[16/10] bg-slate-900 overflow-hidden">
          {product.thumbnailUrl ? (
            <img 
              src={product.thumbnailUrl} 
              alt={product.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center text-slate-600 font-mono text-xs">
              NO PREVIEW IMAGE
            </div>
          )}

          {/* TOP LEFT CATEGORY BADGE */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${getCategoryBadgeClass(product.category)}`}>
              {product.category.replace('-', ' ')}
            </span>
          </div>

          {/* TOP RIGHT: DYNAMIC ZIP BADGE IF PRODUCT HAS ZIP */}
          {hasZip && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 backdrop-blur-md">
                <FolderArchive className="w-3 h-3" /> ZIP Source
              </span>
            </div>
          )}

          {/* UNLOCKED BADGE (IF SUBSCRIBED) */}
          {hasAccess && (
            <div className="absolute bottom-3 left-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 backdrop-blur-md">
                <Check className="w-3 h-3 text-emerald-400" /> Member Access
              </span>
            </div>
          )}
        </Link>

        {/* BODY INFO */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <Link href={`/products/${product.id}`} className="block group-hover:text-cyan-400 transition-colors">
              <h3 className="font-bold text-slate-100 text-base leading-snug line-clamp-1 mb-1.5">
                {product.title}
              </h3>
            </Link>

            <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4">
              {product.description}
            </p>

            {/* QUICK ACTIONS ROW: COPY PROMPT & ZIP DOWNLOAD OPTION */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              
              {/* COPY PROMPT BUTTON */}
              {hasPrompt && (
                <button
                  onClick={handleCopyPrompt}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold font-mono flex items-center justify-center gap-1.5 border transition-all ${
                    copied
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : hasAccess
                        ? 'bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border-purple-500/30'
                        : 'bg-white/[0.04] hover:bg-purple-500/15 text-slate-300 hover:text-purple-300 border-white/10'
                  }`}
                  title={hasAccess ? 'Copy Master Prompt text to clipboard' : 'Subscribe to copy full Master Prompt'}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                    </>
                  ) : hasAccess ? (
                    <>
                      <Copy className="w-3.5 h-3.5 text-purple-400" /> Copy Prompt
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 text-slate-400" />
                      <Copy className="w-3.5 h-3.5" /> Copy Prompt
                    </>
                  )}
                </button>
              )}

              {/* DYNAMIC ZIP DOWNLOAD OPTION IF PRODUCT HAS ZIP */}
              {hasZip && (
                <button
                  onClick={handleZipClick}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold font-mono flex items-center justify-center gap-1.5 border transition-all ${
                    hasAccess
                      ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30'
                      : 'bg-white/[0.04] hover:bg-amber-500/15 text-slate-300 hover:text-amber-300 border-white/10'
                  }`}
                  title={hasAccess ? 'Download complete ZIP package' : 'Subscribe to download source ZIP'}
                >
                  {hasAccess ? (
                    <>
                      <Download className="w-3.5 h-3.5 text-amber-400" /> Download ZIP
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 text-slate-400" />
                      <Download className="w-3.5 h-3.5" /> ZIP
                    </>
                  )}
                </button>
              )}

            </div>
          </div>

          {/* BOTTOM ACCESS & SUBSCRIPTION CTA */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-xs font-bold">
              <Zap className="w-3.5 h-3.5 fill-cyan-400/20" />
              <span>All-Access Pass</span>
            </div>

            <div className="flex items-center gap-2">
              <Link 
                href={`/products/${product.id}`}
                className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 text-xs transition-colors"
                title="View Product Details"
              >
                <Eye className="w-4 h-4" />
              </Link>

              {hasAccess ? (
                <Link
                  href={`/products/${product.id}`}
                  className="px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
                >
                  <Check className="w-3.5 h-3.5" /> Unlocked
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setUnlockType('general');
                    setUnlockModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-md shadow-cyan-400/20 transition-all"
                >
                  <Zap className="w-3.5 h-3.5" /> Unlock
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* UNLOCK / SUBSCRIPTION MODAL */}
      <UnlockModal
        product={product}
        isOpen={unlockModalOpen}
        onClose={() => setUnlockModalOpen(false)}
        unlockType={unlockType}
      />
    </>
  );
}
