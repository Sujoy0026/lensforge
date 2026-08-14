'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product, ProductCategory } from '@/types';
import { getProducts } from '@/lib/storageService';
import ProductCard from '@/components/ProductCard';
import ProductSkeleton from '@/components/ProductSkeleton';
import EmptyState from '@/components/EmptyState';
import { Search, SlidersHorizontal, Sparkles, X, ArrowUpDown } from 'lucide-react';

function ProductCatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<string>('popular'); // 'popular' | 'price-asc' | 'price-desc' | 'newest'

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    };
    fetchCatalog();
  }, []);

  const [onlyWithZip, setOnlyWithZip] = useState<boolean>(false);

  const categories = [
    { id: 'all', label: 'All Assets' },
    { id: 'prompts', label: 'Master Prompts' },
    { id: 'templates', label: 'Website Templates' },
    { id: 'dashboards', label: 'Dashboard UI' },
    { id: '3d-heroes', label: '3D Heroes' },
  ];

  // FILTER LOGIC
  let filtered = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesZip = !onlyWithZip || Boolean(p.fileUrl && p.fileUrl.trim().length > 0);

    return matchesCategory && matchesSearch && matchesZip;
  });

  // SORT LOGIC
  filtered.sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return b.salesCount - a.salesCount;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      
      {/* HEADER TITLE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Browse Digital Products</h1>
          <p className="text-slate-400 text-xs mt-1">Explore master prompts, complete website templates, dashboards, and 3D assets</p>
        </div>

        {/* SORT DROPDOWN */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-mono">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#0e121e] border border-white/10 text-slate-200 text-xs rounded-full px-3 py-1.5 outline-none focus:border-cyan-400"
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest Releases</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          
          {/* CATEGORY PILLS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected 
                      ? 'bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-400/20' 
                      : 'bg-white/[0.04] text-slate-300 hover:text-white border border-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}

            {/* TOGGLE FOR PRODUCTS WITH ZIP */}
            <button
              onClick={() => setOnlyWithZip(!onlyWithZip)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold whitespace-nowrap transition-all border ${
                onlyWithZip
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-white/[0.02] text-slate-400 hover:text-slate-200 border-white/10'
              }`}
            >
              📦 Source ZIP Only
            </button>
          </div>

          {/* SEARCH INPUT */}
          <div className="relative w-full sm:w-64">
            <input 
              type="text"
              placeholder="Search assets or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0e121e] border border-white/10 rounded-full px-4 py-2 pl-9 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* PRODUCTS GRID / SKELETON / EMPTY STATE */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProductSkeleton />
          <ProductSkeleton />
          <ProductSkeleton />
          <ProductSkeleton />
          <ProductSkeleton />
          <ProductSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState 
          icon={Search}
          title="No Matching Digital Assets"
          description={`We couldn't find any products matching your query "${searchQuery}". Try searching for different keywords or resetting filters.`}
          actionText="Reset All Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
}

export default function ProductCatalogPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-6 py-12 text-slate-400 font-mono text-xs">Loading Catalog...</div>}>
      <ProductCatalogContent />
    </Suspense>
  );
}
