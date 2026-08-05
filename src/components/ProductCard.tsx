import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { Product } from '../types.js';
import { useTheme } from '../context/ThemeContext.tsx';

interface ProductCardProps {
  key?: any;
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const { isDark } = useTheme();
  // Check if image path is from our uploads
  const isDefaultSeed = product.id.startsWith('p-');

  // Modern soft abstract gradients for seed visual products
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
    <motion.div
      onClick={onClick}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`border rounded-xl overflow-hidden cursor-pointer group flex flex-col justify-between transition-all duration-200 ${
        isDark ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/30 shadow-lg shadow-slate-950/20' : 'bg-white border-[#e2e8f0] hover:border-indigo-500/30 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]'
      }`}
    >
      {/* Product Image Preview */}
      <div className={`relative aspect-video overflow-hidden border-b flex items-center justify-center transition-colors duration-200 ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-[#e2e8f0]'}`}>
        {isDefaultSeed ? (
          /* High-End Soft Tech Gradient Placeholder that loads instantly and fits perfectly */
          <div className={`w-full h-full bg-gradient-to-tr ${selectedGradient} flex flex-col items-center justify-center p-6 text-center relative`}>
            {/* Pattern Dots Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.06),transparent_70%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:14px_14px]" />
            
            <div className="relative z-10 flex flex-col items-center">
              <span className={`text-[9px] tracking-[0.2em] uppercase font-bold px-2.5 py-1 rounded-full mb-3 shadow-sm border ${isDark ? 'text-indigo-400 bg-indigo-950/40 border-indigo-900/30' : 'text-indigo-600 bg-indigo-50 border border-indigo-100'}`}>
                {product.category}
              </span>
              <h4 className={`text-base font-extrabold group-hover:text-indigo-600 transition-colors line-clamp-2 max-w-[200px] ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
                {product.name}
              </h4>
            </div>
          </div>
        ) : (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
            referrerPolicy="no-referrer"
          />
        )}
        
        {/* Hover Arrow Indicator */}
        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-[#0f172a]/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-200">
          <ArrowUpRight size={14} />
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
              {product.category}
            </span>
          </div>
          <h3 className={`text-sm font-bold group-hover:text-indigo-400 transition-colors line-clamp-1 ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
            {product.name}
          </h3>
          <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {product.description}
          </p>
        </div>

        {/* Pricing Column */}
        <div className={`flex items-center justify-between border-t pt-4 mt-4 transition-colors duration-200 ${isDark ? 'border-slate-800' : 'border-[#e2e8f0]'}`}>
          <div className="font-mono">
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Single License</span>
            <span className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>${product.price.toLocaleString('en-US')}</span>
          </div>
          <span className={`text-xs font-semibold flex items-center gap-1 transition-all ${isDark ? 'text-indigo-400 group-hover:text-indigo-300' : 'text-indigo-600 group-hover:text-indigo-500'}`}>
            Inspect <ArrowUpRight size={12} />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
