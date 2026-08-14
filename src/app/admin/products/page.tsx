'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { getProducts, saveProduct, deleteProduct } from '@/lib/storageService';
import { Plus, Search, Edit3, Trash2, Eye, EyeOff, Loader2, RefreshCw } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const fetchCatalog = async () => {
    setLoading(true);
    const data = await getProducts(true);
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === 'published' ? 'draft' : 'published';
    await saveProduct({ ...product, status: newStatus });
    fetchCatalog();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to permanently delete this product?')) {
      await deleteProduct(id);
      fetchCatalog();
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQuery || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesStat = selectedStatus === 'all' || p.status === selectedStatus;

    return matchesSearch && matchesCat && matchesStat;
  });

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Products Catalog ({filteredProducts.length})</h1>
          <p className="text-slate-400 text-xs mt-1">Manage digital product uploads, draft vs live status, pricing, and downloads</p>
        </div>

        <Link
          href="/admin/products/new"
          className="px-4 py-2 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-colors flex items-center gap-1.5 shadow-lg shadow-cyan-400/20"
        >
          <Plus className="w-4 h-4" /> Upload New Asset
        </Link>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-[#0e121e] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center gap-4">
        
        {/* SEARCH */}
        <div className="relative flex-1 min-w-[200px]">
          <input 
            type="text"
            placeholder="Search by title or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2 pl-9 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        {/* CATEGORY SELECT */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-900 border border-white/10 text-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-cyan-400"
        >
          <option value="all">All Categories</option>
          <option value="prompts">Master AI Prompts</option>
          <option value="templates">Website Templates</option>
          <option value="dashboards">Dashboard UI Kits</option>
          <option value="3d-heroes">3D Hero Animations</option>
        </select>

        {/* STATUS SELECT */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-slate-900 border border-white/10 text-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-cyan-400"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published Only</option>
          <option value="draft">Drafts Only</option>
        </select>

        <button 
          onClick={fetchCatalog}
          className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white"
          title="Refresh List"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

      </div>

      {/* TABLE */}
      {loading ? (
        <div className="py-16 text-center text-cyan-400 font-mono text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading Product Catalog...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-[#0e121e] border border-white/10 rounded-2xl p-12 text-center text-slate-400 text-xs">
          No products found matching your filters.
        </div>
      ) : (
        <div className="bg-[#0e121e] border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-white/[0.02] text-slate-400 border-b border-white/10 font-mono text-[11px]">
                  <th className="p-4">PRODUCT ASSET</th>
                  <th className="p-4">CATEGORY</th>
                  <th className="p-4">PRICE</th>
                  <th className="p-4">SALES</th>
                  <th className="p-4">STATUS</th>
                  <th className="p-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                    
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-900 overflow-hidden border border-white/10 flex-shrink-0">
                          {product.thumbnailUrl ? (
                            <img src={product.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-mono text-[9px] text-slate-600">NO IMG</div>
                          )}
                        </div>
                        <div>
                          <Link href={`/admin/products/${product.id}/edit`} className="font-bold text-slate-100 hover:text-cyan-400 text-sm">
                            {product.title}
                          </Link>
                          <div className="text-slate-400 text-[11px] font-mono mt-0.5">ID: {product.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-slate-300 capitalize">
                      {product.category.replace('-', ' ')}
                    </td>

                    <td className="p-4 font-mono font-bold text-cyan-400">
                      ${product.price.toFixed(2)}
                    </td>

                    <td className="p-4 font-mono text-slate-300">
                      {product.salesCount} sold
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(product)}
                        className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase font-bold flex items-center gap-1.5 border transition-all ${
                          product.status === 'published'
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                            : 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25'
                        }`}
                        title="Click to toggle Draft / Published status"
                      >
                        {product.status === 'published' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {product.status}
                      </button>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 transition-colors"
                          title="Edit Product"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-white/10 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
