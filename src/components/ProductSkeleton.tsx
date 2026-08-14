import React from 'react';

export default function ProductSkeleton() {
  return (
    <div className="bg-[#0e121e] border border-white/10 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-slate-800/60" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-slate-800/80 rounded w-3/4" />
        <div className="h-3 bg-slate-800/50 rounded w-full" />
        <div className="h-3 bg-slate-800/50 rounded w-5/6" />
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
          <div className="h-5 bg-slate-800/80 rounded w-16" />
          <div className="h-8 bg-slate-800/80 rounded w-20" />
        </div>
      </div>
    </div>
  );
}
