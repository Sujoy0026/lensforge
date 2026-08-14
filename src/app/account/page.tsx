'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { Order, Product } from '@/types';
import { getOrders, getProducts } from '@/lib/storageService';
import { 
  User, 
  ShoppingBag, 
  Download, 
  Key, 
  Calendar, 
  ShieldCheck, 
  FileText, 
  Loader2, 
  Zap, 
  Copy, 
  Check, 
  FolderArchive,
  ArrowRight
} from 'lucide-react';

export default function CustomerAccountPage() {
  const { user, isSubscribed, subscriptionTier, cancelSubscription, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productsMap, setProductsMap] = useState<Record<string, Product>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerHistory = async () => {
      const [orderList, prods] = await Promise.all([
        getOrders(),
        getProducts(true)
      ]);

      const customerOrders = user 
        ? orderList.filter(o => o.email.toLowerCase() === user.email.toLowerCase() || o.userId === user.id)
        : orderList;

      setOrders(customerOrders);
      setAllProducts(prods);

      const map: Record<string, Product> = {};
      prods.forEach(p => { map[p.id] = p; });
      setProductsMap(map);

      setLoading(false);
    };

    if (!authLoading) {
      fetchCustomerHistory();
    }
  }, [user, authLoading]);

  const handleCopyPrompt = (prompt: string, id: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-md mx-auto my-16 text-center text-cyan-400 font-mono text-xs flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading Account History...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 bg-[#0e121e] border border-white/10 rounded-2xl p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Sign In Required</h2>
        <p className="text-slate-400 text-xs">Please sign in to view your order history, active subscriptions, and downloads.</p>
        <Link href="/auth/signin" className="inline-block px-5 py-2.5 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs">
          Sign In to Account
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      
      {/* ACCOUNT & MEMBERSHIP STATUS CARD */}
      <div className="bg-[#0e121e] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-slate-950 flex items-center justify-center font-bold text-xl shadow-xl shadow-cyan-500/20">
            {user.email[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">{user.email}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {isSubscribed ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono uppercase font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" /> {subscriptionTier} All-Access Active
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-slate-400 text-[11px] font-mono uppercase font-bold">
                  Free Account Tier
                </span>
              )}
              <span className="text-xs text-slate-400">Member since {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isSubscribed && (
            <Link
              href="/pricing"
              className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-400/20"
            >
              <Zap className="w-3.5 h-3.5" /> Upgrade to All-Access
            </Link>
          )}

          {user.role === 'admin' && (
            <Link 
              href="/admin" 
              className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-semibold"
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      </div>

      {/* ALL-ACCESS MEMBERSHIP QUICK CATALOG UNLOCKED AREA */}
      {isSubscribed && (
        <div className="bg-gradient-to-br from-cyan-950/30 via-[#0e121e] to-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" /> All-Access Unlocked Library ({allProducts.length} Assets)
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Your active subscription grants you immediate download & copy access to all products on LensForge.
              </p>
            </div>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {allProducts.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No products published yet in catalog.
              </div>
            ) : (
              allProducts.map((p) => (
                <div key={p.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <Link href={`/products/${p.id}`} className="font-bold text-slate-100 hover:text-cyan-400">
                      {p.title}
                    </Link>
                    <div className="text-[10px] font-mono text-cyan-400 capitalize mt-0.5">
                      {p.category.replace('-', ' ')} {p.fileUrl ? '• 📦 ZIP Included' : ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {p.promptContent && (
                      <button
                        onClick={() => handleCopyPrompt(p.promptContent || '', p.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 border transition-all ${
                          copiedId === p.id 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border-purple-500/30'
                        }`}
                      >
                        {copiedId === p.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId === p.id ? 'Copied' : 'Copy Prompt'}
                      </button>
                    )}

                    {p.fileUrl && (
                      <a
                        href={p.fileUrl}
                        download
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-semibold flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Download ZIP
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ONE-TIME ORDERS HISTORY SECTION */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-cyan-400" /> Individual Purchases & Orders ({orders.length})
        </h2>

        {orders.length === 0 ? (
          <div className="bg-[#0e121e] border border-white/10 rounded-2xl p-12 text-center text-slate-400 text-xs space-y-3">
            <p>No individual product purchases found.</p>
            <Link href="/products" className="inline-block px-4 py-2 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs">
              Explore Products Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-[#0e121e] border border-white/10 rounded-2xl p-6 space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10 text-xs">
                  <div>
                    <span className="font-mono text-cyan-400 font-bold">Order #{order.id}</span>
                    <span className="text-slate-400 ml-3">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-400">License: <strong className="text-emerald-400">{order.licenseKey}</strong></span>
                    <span className="text-white font-extrabold">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* ITEMS RE-DOWNLOAD LIST */}
                <div className="space-y-3">
                  {order.items.map((item) => {
                    const product = productsMap[item.productId];
                    return (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="font-bold text-slate-100">{product?.title || `Product ID: ${item.productId}`}</div>
                          <div className="text-[10px] font-mono text-slate-400 capitalize">{product?.category?.replace('-', ' ') || 'Digital Asset'}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          {product?.promptContent && (
                            <button
                              onClick={() => handleCopyPrompt(product.promptContent || '', item.id)}
                              className="px-3.5 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5"
                            >
                              {copiedId === item.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedId === item.id ? 'Copied Prompt' : 'Copy Prompt'}
                            </button>
                          )}

                          {product?.fileUrl && (
                            <a
                              href={product.fileUrl}
                              download
                              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/10"
                            >
                              <Download className="w-3.5 h-3.5" /> Download ZIP
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
