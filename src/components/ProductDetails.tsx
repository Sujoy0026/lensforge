import React from 'react';
import { motion } from 'motion/react';
import { X, ShieldCheck, Download, CreditCard, Sparkles } from 'lucide-react';
import { Product } from '../types.js';
import { useTheme } from '../context/ThemeContext.tsx';

interface ProductDetailsProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onBuy: (product: Product) => void;
  isPurchased: boolean;
  downloadUrl: string;
}

export default function ProductDetails({
  product,
  isOpen,
  onClose,
  onBuy,
  isPurchased,
  downloadUrl,
}: ProductDetailsProps) {
  const { isDark } = useTheme();
  if (!isOpen) return null;

  const isDefaultSeed = product.id.startsWith('p-');

  const gradientStylesLight: { [key: string]: string } = {
    'p-quantum-dashboard': 'from-indigo-100 via-white to-indigo-50/50 border-indigo-200',
    'p-aura-3d-saas': 'from-blue-100 via-white to-purple-50/50 border-purple-200',
    'p-helix-assets': 'from-amber-100 via-white to-amber-50/50 border-amber-200',
    'p-stark-admin': 'from-cyan-100 via-white to-teal-50/50 border-teal-200',
    'p-vortex-landing': 'from-rose-100 via-white to-rose-50/50 border-rose-200',
  };

  const gradientStylesDark: { [key: string]: string } = {
    'p-quantum-dashboard': 'from-indigo-950/45 via-slate-900 to-indigo-950/20 border-indigo-900/40',
    'p-aura-3d-saas': 'from-blue-950/45 via-slate-900 to-purple-950/20 border-purple-900/40',
    'p-helix-assets': 'from-amber-950/45 via-slate-900 to-amber-950/20 border-amber-900/40',
    'p-stark-admin': 'from-cyan-950/45 via-slate-900 to-teal-950/20 border-teal-900/40',
    'p-vortex-landing': 'from-rose-950/45 via-slate-900 to-rose-950/20 border-rose-900/40',
  };

  const gradientStyles = isDark ? gradientStylesDark : gradientStylesLight;
  const selectedGradient = gradientStyles[product.id] || (isDark ? 'from-slate-900 via-slate-950 to-slate-900' : 'from-indigo-50 via-white to-slate-50');

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-end bg-slate-950/50 backdrop-blur-md">
      {/* Background click close */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`relative w-full max-w-xl h-full border-l p-6 overflow-y-auto flex flex-col justify-between shadow-2xl z-10 transition-colors duration-200 ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-[#e2e8f0] text-[#0f172a]'
        }`}
      >
        <div>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <span className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border ${isDark ? 'text-indigo-400 bg-indigo-950/40 border-indigo-900/30' : 'text-indigo-600 bg-indigo-50 border border-indigo-100'}`}>
              {product.category}
            </span>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-[#0f172a] hover:bg-slate-100'}`}
            >
              <X size={18} />
            </button>
          </div>

          {/* Asset Hero Image */}
          <div className={`relative aspect-video rounded-xl overflow-hidden border mb-6 flex items-center justify-center transition-colors duration-200 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-[#e2e8f0]'}`}>
            {isDefaultSeed ? (
              <div className={`w-full h-full bg-gradient-to-tr ${selectedGradient} flex flex-col items-center justify-center p-8 text-center`}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.06),transparent_75%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:16px_16px]" />
                <h3 className={`text-xl font-black relative z-10 ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
                  {product.name}
                </h3>
                <span className={`text-xs mt-2 font-semibold tracking-wider relative z-10 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  LENSFORGE AUTHENTIC ASSET
                </span>
              </div>
            ) : (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Specifications */}
          <div className="space-y-4">
            <h1 className={`text-xl font-bold leading-tight ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>{product.name}</h1>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{product.description}</p>
            
            {/* Features list */}
            <div className={`border-t pt-4 mt-4 space-y-2 ${isDark ? 'border-slate-800' : 'border-[#e2e8f0]'}`}>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">License Deliverables</span>
              <ul className={`grid grid-cols-2 gap-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                <li className="flex items-center gap-1.5">
                  <Sparkles size={12} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} /> Lifetime Updates
                </li>
                <li className="flex items-center gap-1.5">
                  <Sparkles size={12} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} /> Commercial Usage
                </li>
                <li className="flex items-center gap-1.5">
                  <Sparkles size={12} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} /> 100% Secure Files
                </li>
                <li className="flex items-center gap-1.5">
                  <Sparkles size={12} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} /> Fully Customizable
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Billing Area */}
        <div className={`border-t pt-6 mt-8 ${isDark ? 'border-slate-800' : 'border-[#e2e8f0]'}`}>
          <div className="flex justify-between items-center mb-5">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-semibold">Standard Licensing</span>
              <span className={`text-2xl font-black font-mono ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>${product.price.toLocaleString('en-US')}</span>
            </div>
            <div className="flex flex-col items-end text-xs text-slate-400">
              <span className="text-slate-400">VAT / GST</span>
              <span className="text-emerald-600 font-semibold font-mono">No extra fees</span>
            </div>
          </div>

          {isPurchased ? (
            /* Secure Download Option */
            <div className="space-y-3">
              <div className={`p-3 rounded-lg flex items-start gap-2.5 border ${isDark ? 'bg-emerald-950/20 border-emerald-900/40' : 'bg-emerald-50 border-emerald-200'}`}>
                <ShieldCheck className="text-emerald-600 w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <h4 className={`text-xs font-bold ${isDark ? 'text-emerald-400' : 'text-[#0f172a]'}`}>License Unlocked</h4>
                  <p className={`text-[11px] mt-0.5 ${isDark ? 'text-emerald-300/70' : 'text-slate-500'}`}>
                    Your payment signature was securely verified. You can now download the ZIP package directly.
                  </p>
                </div>
              </div>
              <a
                href={downloadUrl}
                download
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-indigo-600/10 cursor-pointer"
              >
                <Download size={14} />
                Download Package (ZIP)
              </a>
            </div>
          ) : (
            /* Billing CTA Buttons */
            <div className="space-y-3">
              <button
                onClick={() => onBuy(product)}
                className={`w-full font-bold py-3.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${isDark ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/30' : 'bg-[#0f172a] hover:bg-slate-800 text-white shadow-slate-950/10'}`}
              >
                <CreditCard size={14} />
                Buy Now
              </button>
              
              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={11} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} /> Secure checkout
                </span>
                <span>•</span>
                <span>Instant Delivery</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
