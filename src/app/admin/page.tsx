'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product, Order } from '@/types';
import { getProducts, getOrders, saveProduct } from '@/lib/storageService';
import { 
  DollarSign, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  Eye, 
  ArrowUpRight, 
  Plus, 
  Zap, 
  KeyRound, 
  FolderArchive,
  FileText,
  Code,
  LayoutDashboard,
  Box,
  EyeOff
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [prodsData, ordersData] = await Promise.all([
      getProducts(true),
      getOrders()
    ]);
    setProducts(prodsData);
    setOrders(ordersData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === 'published' ? 'draft' : 'published';
    await saveProduct({ ...product, status: newStatus });
    fetchData();
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalSalesCount = orders.reduce((sum, o) => sum + o.items.length, 0);

  // Category counts
  const promptCount = products.filter(p => p.category === 'prompts').length;
  const templateCount = products.filter(p => p.category === 'templates').length;
  const dashboardCount = products.filter(p => p.category === 'dashboards').length;
  const heroesCount = products.filter(p => p.category === '3d-heroes').length;
  const zipAttachedCount = products.filter(p => p.fileUrl && p.fileUrl.trim().length > 0).length;

  const topProducts = [...products].sort((a, b) => b.salesCount - a.salesCount).slice(0, 5);

  return (
    <div className="space-y-8">
      
      {/* HEADER TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono text-[10px] font-bold uppercase tracking-wider mb-1">
            <KeyRound className="w-3 h-3" /> OWNER VAULT AUTHENTICATED
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Master Admin Control Panel</h1>
          <p className="text-slate-400 text-xs mt-0.5">Real-time marketplace revenue, catalog status, and order performance</p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link 
            href="/admin/settings"
            className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-rose-400" /> Security
          </Link>

          <Link 
            href="/admin/products/new"
            className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-colors flex items-center gap-1.5 shadow-lg shadow-cyan-400/20"
          >
            <Plus className="w-4 h-4" /> Upload New Asset
          </Link>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* REVENUE */}
        <div className="bg-[#0e121e] border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Sales Revenue</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            ${totalRevenue.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Live purchase revenue
          </div>
        </div>

        {/* PRODUCTS */}
        <div className="bg-[#0e121e] border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Total Catalog Products</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {products.length} <span className="text-xs font-sans text-slate-400">({products.filter(p => p.status === 'published').length} live)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Across 4 core studio categories
          </div>
        </div>

        {/* ORDERS */}
        <div className="bg-[#0e121e] border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Issued Licenses</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {orders.length} <span className="text-xs font-sans text-slate-400">({totalSalesCount} items)</span>
          </div>
          <div className="text-[11px] text-emerald-400">
            Customer order records
          </div>
        </div>

        {/* ZIP ATTACHED ASSETS */}
        <div className="bg-[#0e121e] border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Source ZIP Packages</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <FolderArchive className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            {zipAttachedCount} <span className="text-xs font-sans text-slate-400">assets</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Downloadable source code packages
          </div>
        </div>

      </div>

      {/* CATEGORY BREAKDOWN TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0e121e] border border-purple-500/20 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-white">{promptCount}</div>
            <div className="text-[11px] text-slate-400">Master Prompts</div>
          </div>
        </div>

        <div className="bg-[#0e121e] border border-indigo-500/20 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Code className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-white">{templateCount}</div>
            <div className="text-[11px] text-slate-400">Website Starters</div>
          </div>
        </div>

        <div className="bg-[#0e121e] border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-white">{dashboardCount}</div>
            <div className="text-[11px] text-slate-400">Dashboard UI</div>
          </div>
        </div>

        <div className="bg-[#0e121e] border border-cyan-500/20 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-white">{heroesCount}</div>
            <div className="text-[11px] text-slate-400">3D Hero Assets</div>
          </div>
        </div>
      </div>

      {/* RECENT / TOP PRODUCTS TABLE */}
      <div className="bg-[#0e121e] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h2 className="font-bold text-slate-100 text-base">Top Performing Digital Assets</h2>
          <Link href="/admin/products" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
            Manage Catalog ({products.length}) <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs space-y-3">
            <p>No products in catalog yet.</p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300"
            >
              <Plus className="w-3.5 h-3.5" /> Upload Your First Product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-white/10 font-mono text-[11px]">
                  <th className="pb-3">ASSET TITLE</th>
                  <th className="pb-3">CATEGORY</th>
                  <th className="pb-3">PRICE</th>
                  <th className="pb-3">INCLUDED</th>
                  <th className="pb-3">STATUS</th>
                  <th className="pb-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {topProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 font-semibold text-slate-200">
                      <Link href={`/admin/products/${product.id}/edit`} className="hover:text-cyan-400">
                        {product.title}
                      </Link>
                    </td>
                    <td className="py-3 font-mono text-slate-400 capitalize">
                      {product.category.replace('-', ' ')}
                    </td>
                    <td className="py-3 font-mono font-bold text-cyan-400">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="py-3 font-mono text-slate-300 text-[11px]">
                      {product.fileUrl ? '📦 ZIP' : ''} {product.promptContent ? '📝 Prompt' : ''}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleToggleStatus(product)}
                        className={`px-2 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold border transition-colors ${
                          product.status === 'published' 
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                            : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                        }`}
                      >
                        {product.status}
                      </button>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-xs text-cyan-400 hover:underline font-semibold"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
