'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Order, Product } from '@/types';
import { getOrders, getProducts } from '@/lib/storageService';
import { CheckCircle2, Download, Copy, Check, Lock, Sparkles, FileText, ArrowRight } from 'lucide-react';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [productsMap, setProductsMap] = useState<Record<string, Product>>({});
  const [copiedKey, setCopiedKey] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderData = async () => {
      const [allOrders, allProducts] = await Promise.all([
        getOrders(),
        getProducts(true)
      ]);

      const found = allOrders.find(o => o.id === orderId);
      if (found) {
        setOrder(found);
      }

      const map: Record<string, Product> = {};
      allProducts.forEach(p => {
        map[p.id] = p;
      });
      setProductsMap(map);

      setLoading(false);
    };
    fetchOrderData();
  }, [orderId]);

  const handleCopyKey = () => {
    if (order?.licenseKey) {
      navigator.clipboard.writeText(order.licenseKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto my-16 text-center text-cyan-400 font-mono text-xs">
        Loading Order Confirmation...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-16 bg-[#0e121e] border border-white/10 rounded-2xl p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Order Not Found</h2>
        <p className="text-slate-400 text-xs">We could not locate this order ID.</p>
        <Link href="/" className="inline-block px-5 py-2 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs">
          Return to Storefront
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      
      {/* SUCCESS CONFIRMATION HEADER */}
      <div className="bg-[#0e121e] border border-emerald-500/30 rounded-2xl p-8 text-center shadow-2xl space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400">
            PURCHASE COMPLETED
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-1">Thank You For Your Order!</h1>
          <p className="text-slate-400 text-xs mt-1">
            Order ID: <strong className="font-mono text-slate-200">{order.id}</strong> | Sent to <strong className="text-cyan-400">{order.email}</strong>
          </p>
        </div>

        {/* LICENSE KEY BOX */}
        <div className="bg-slate-950 border border-cyan-500/30 rounded-xl p-4 max-w-md mx-auto text-center space-y-1.5">
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">YOUR DEVELOPER LICENSE KEY</p>
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono font-extrabold text-cyan-400 text-base tracking-wider">
              {order.licenseKey}
            </span>
            <button
              onClick={handleCopyKey}
              className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/10 text-slate-300 text-xs flex items-center gap-1 border border-white/10"
              title="Copy License Key"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* DOWNLOADABLE ASSETS LIST */}
      <div className="bg-[#0e121e] border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Download className="w-4 h-4 text-cyan-400" /> Download Purchased Files
        </h3>

        <div className="divide-y divide-white/[0.08]">
          {order.items.map((item) => {
            const product = productsMap[item.productId];
            return (
              <div key={item.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{product?.title || 'Digital Asset'}</h4>
                  <span className="text-[11px] font-mono text-cyan-400 uppercase">
                    {product?.category?.replace('-', ' ') || 'Digital Download'}
                  </span>
                </div>

                {product?.category === 'prompts' && product.promptContent ? (
                  <div className="w-full sm:w-auto">
                    <button
                      onClick={() => {
                        const blob = new Blob([product.promptContent || ''], { type: 'text/markdown' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${product.title.toLowerCase().replace(/\s+/g, '-')}-prompt.md`;
                        a.click();
                      }}
                      className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" /> Download Prompt Markdown (.md)
                    </button>
                  </div>
                ) : (
                  <div className="w-full sm:w-auto">
                    <a
                      href={product?.fileUrl || '/downloads/lensforge-asset-bundle.zip'}
                      download
                      className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-cyan-400/20"
                    >
                      <Download className="w-4 h-4" /> Download ZIP Package (.zip)
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ACCOUNT HISTORY LINK */}
      <div className="text-center pt-4">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:underline"
        >
          View All Purchases in Customer Account <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
