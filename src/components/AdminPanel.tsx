import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Plus,
  Trash2,
  ShoppingBag,
  TrendingUp,
  Layers,
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  Code2,
  Tag,
  DollarSign,
  Image as ImageIcon,
  Filter,
  Eye,
  Package,
  Sparkles,
  Layers3,
  Database,
  CloudLightning,
  Copy,
  Check
} from 'lucide-react';
import { Product, AdminStats, ProductCategory } from '../types.js';
import { useTheme } from '../context/ThemeContext.tsx';

interface AdminPanelProps {
  token: string;
  onProductsChange?: () => void;
}

export default function AdminPanel({ token, onProductsChange }: AdminPanelProps) {
  const { isDark } = useTheme();

  // Platform Metrics & Product states
  const [stats, setStats] = useState<AdminStats>({ totalProducts: 0, totalSales: 0, revenue: 0 });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabaseConfig, setSupabaseConfig] = useState<{
    active: boolean;
    url: string;
    hasKey: boolean;
    schemaSql: string;
  }>({
    active: false,
    url: '',
    hasKey: false,
    schemaSql: '',
  });

  const [showSchema, setShowSchema] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(supabaseConfig.schemaSql);
    setCopiedSql(true);
    addToast('Supabase database setup SQL copied to clipboard!', 'success');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Filters
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Templates');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [assetType, setAssetType] = useState<'ZIP' | 'Prompt' | 'Hybrid'>('ZIP');
  const [promptText, setPromptText] = useState('');

  // Upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);

  // Form Feedback
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // Toasts
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' }[]>([]);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Stats from API
      const statsResponse = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Products from API
      const productsResponse = await fetch('/api/products');
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData);
      }

      // Supabase Status from API
      const supabaseResponse = await fetch('/api/admin/supabase-status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (supabaseResponse.ok) {
        const supabaseData = await supabaseResponse.json();
        setSupabaseConfig(supabaseData);
      }
    } catch (e) {
      console.error('Error fetching admin details:', e);
      addToast('Failed to sync administrative stats ledger.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  // Handle local image file previews
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setZipFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!imageFile) {
      setFormError('A preview image is required.');
      return;
    }

    if (assetType !== 'Prompt' && !zipFile) {
      setFormError('ZIP package is required for ZIP and Hybrid asset types.');
      return;
    }

    setFormLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('type', assetType);
    formData.append('prompt_text', promptText);
    formData.append('preview_image', imageFile);
    if (zipFile) {
      formData.append('product_zip', zipFile);
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish asset');
      }

      addToast(`"${name}" published successfully!`, 'success');
      setFormSuccess('Asset registered, encrypted, and available to customers.');
      
      // Reset State fields
      setName('');
      setPrice('');
      setDescription('');
      setPromptText('');
      setAssetType('ZIP');
      setImageFile(null);
      setImagePreview(null);
      setZipFile(null);

      // Reset DOM Inputs
      const imgInput = document.getElementById('preview_image') as HTMLInputElement;
      const zipInput = document.getElementById('product_zip') as HTMLInputElement;
      if (imgInput) imgInput.value = '';
      if (zipInput) zipInput.value = '';

      // Reload
      fetchAdminData();
      onProductsChange?.();
    } catch (err: any) {
      setFormError(err.message || 'Error occurred while saving product');
      addToast(err.message || 'Publishing failed.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        addToast('Asset removed from database.', 'success');
        setProducts(products.filter((p) => p.id !== productId));
        fetchAdminData();
        onProductsChange?.();
        setDeleteConfirmId(null);
      } else {
        const errData = await response.json();
        addToast(errData.error || 'Failed to delete product', 'error');
      }
    } catch (e) {
      console.error('Error deleting product:', e);
      addToast('Network error during deletion.', 'error');
    }
  };

  // Filter & Search Logics
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategoryFilter === 'All' || p.category === selectedCategoryFilter;
    const pType = p.type || 'ZIP';
    const matchesType = selectedTypeFilter === 'All' || pType === selectedTypeFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesType && matchesSearch;
  });

  const categories: ProductCategory[] = ['Templates', '3D SaaS', 'Dashboards'];
  const types = ['ZIP', 'Prompt', 'Hybrid'];

  const darkCard = 'bg-[#111113] border-[#222226]';
  const lightCard = 'bg-white border-slate-200';
  const cardClass = isDark ? darkCard : lightCard;

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2 relative">
      
      {/* Toast System */}
      <div className="absolute top-0 right-0 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`p-3.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2.5 pointer-events-auto backdrop-blur-md ${
                t.type === 'success'
                  ? (isDark ? 'bg-emerald-950/90 text-emerald-400 border-emerald-900/40' : 'bg-emerald-50 text-emerald-800 border-emerald-200')
                  : (isDark ? 'bg-rose-950/90 text-rose-400 border-rose-900/40' : 'bg-rose-50 text-rose-800 border-rose-200')
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${t.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-extrabold flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <LayoutDashboard size={16} />
            </div>
            LensForge Platform Console
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Supervise the digital registry, inspect ledger flows, configure product categories, and provision prompt systems.
          </p>
        </div>
        <button
          onClick={fetchAdminData}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
            isDark ? 'border-slate-800 text-slate-300 hover:bg-slate-900' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Force Ledger Re-Sync
        </button>
      </div>

      {/* Admin Stats Bento Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1 */}
        <div className={`border rounded-2xl p-6 flex items-center gap-5 relative overflow-hidden shadow-sm hover:shadow-md transition-all ${cardClass}`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/20' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Verified Platform Revenue</span>
            <span className={`text-2xl font-extrabold font-mono mt-0.5 block ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
              ${stats.revenue.toLocaleString('en-US')}
            </span>
            <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">● Active Gateway Connected</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className={`border rounded-2xl p-6 flex items-center gap-5 relative overflow-hidden shadow-sm hover:shadow-md transition-all ${cardClass}`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-purple-950/40 text-purple-400 border border-purple-900/20' : 'bg-purple-50 text-purple-600 border border-purple-100'}`}>
            <ShoppingBag size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Customer Checkout Transactions</span>
            <span className={`text-2xl font-extrabold font-mono mt-0.5 block ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
              {stats.totalSales}
            </span>
            <span className="text-[9px] text-purple-400 font-bold block mt-0.5">● Razorpay webhook secure</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className={`border rounded-2xl p-6 flex items-center gap-5 relative overflow-hidden shadow-sm hover:shadow-md transition-all ${cardClass}`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
            <Layers size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Registered Database Catalog Items</span>
            <span className={`text-2xl font-extrabold font-mono mt-0.5 block ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
              {stats.totalProducts}
            </span>
            <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">● Sync integrity valid</span>
          </div>
        </div>
      </div>

      {/* Database Engine Sync status */}
      <div className={`border rounded-2xl p-5 ${cardClass} relative overflow-hidden shadow-sm`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              supabaseConfig.active
                ? (isDark ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-100')
                : (isDark ? 'bg-amber-950/40 text-amber-400 border border-amber-900/20' : 'bg-amber-50 text-amber-600 border border-amber-100')
            }`}>
              {supabaseConfig.active ? <CloudLightning size={22} className="animate-pulse" /> : <Database size={22} />}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
                  {supabaseConfig.active ? 'Supabase Production Cloud Storage Active' : 'Sandbox Storage Engine Enabled'}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase flex items-center gap-1.5 ${
                  supabaseConfig.active
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/15'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${supabaseConfig.active ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
                  {supabaseConfig.active ? 'Cloud Active' : 'Local Sandbox'}
                </span>
              </div>
              <p className={`text-xs mt-1 max-w-3xl ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {supabaseConfig.active
                  ? `Authenticated seamlessly with live PostgreSQL cluster. All assets, client profiles, and billing registries are writing and sync'd in real-time.`
                  : `Currently writing to local filesystem ledger (data/db.json) for rapid offline testing. To unlock server-less scaling and permanent persistence, connect your Supabase account.`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSchema(!showSchema)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer select-none shrink-0 ${
              isDark
                ? 'border-slate-800 text-slate-200 bg-slate-900/50 hover:bg-slate-900'
                : 'border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            {showSchema ? 'Hide Setup Console' : 'Supabase Setup Console'}
          </button>
        </div>

        {/* Collapsible Setup console */}
        <AnimatePresence>
          {showSchema && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800/80 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    1. Apply PostgreSQL Migration Script
                  </h4>
                  <p className={`text-xs mb-3.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Create your tables in Supabase by copying the exact database schema below and pasting it into the <strong className="font-semibold text-indigo-400">SQL Editor</strong> on your Supabase Dashboard.
                  </p>
                  
                  <div className="relative">
                    <pre className={`text-[11px] font-mono p-4 rounded-xl border overflow-x-auto max-h-[220px] select-all leading-relaxed ${
                      isDark ? 'bg-[#060608] border-[#222226] text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                      <code>{supabaseConfig.schemaSql}</code>
                    </pre>
                    <button
                      onClick={handleCopySql}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-200 hover:bg-slate-800 transition-all shadow-md cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                    >
                      {copiedSql ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      {copiedSql ? 'Copied' : 'Copy SQL'}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      2. Configure Environment Secrets
                    </h4>
                    <p className={`text-xs mb-4 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Once tables are provisioned, open the <strong className="font-semibold text-indigo-400">Settings/Secrets panel</strong> in your AI Studio UI and register the following variables to synchronize automatically:
                    </p>

                    <div className="space-y-2 text-xs font-mono">
                      <div className={`p-2.5 rounded-lg border flex items-center justify-between ${isDark ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Secret Name</span>
                          <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>SUPABASE_URL</span>
                        </div>
                        <span className="text-[10px] text-slate-400 uppercase bg-slate-500/10 px-2 py-0.5 rounded-full">Required</span>
                      </div>

                      <div className={`p-2.5 rounded-lg border flex items-center justify-between ${isDark ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Secret Name</span>
                          <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>SUPABASE_ANON_KEY</span>
                        </div>
                        <span className="text-[10px] text-slate-400 uppercase bg-slate-500/10 px-2 py-0.5 rounded-full">Required</span>
                      </div>
                    </div>
                  </div>

                  <div className={`mt-4 p-3.5 rounded-xl border flex items-start gap-3 ${
                    supabaseConfig.active
                      ? (isDark ? 'bg-emerald-950/10 border-emerald-900/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-800')
                      : (isDark ? 'bg-[#18181b] border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600')
                  }`}>
                    <Database size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-[11px] font-bold uppercase tracking-wider">Engine status check</h5>
                      <p className="text-xs mt-0.5 leading-normal">
                        {supabaseConfig.active
                          ? 'Integration online. All CRUD ledger transactions bypass local storage and bind instantly with your cloud PostgreSQL instance.'
                          : 'Currently operating in zero-setup Local Sandbox. Adding credentials will instantly auto-migrate schema and default products.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Core Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: PUBLISH CARD (LIVE BUILDER) */}
        <div className="lg:col-span-5 space-y-6">
          <div className={`border rounded-2xl p-6 shadow-sm relative ${cardClass}`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
                <Plus className="text-indigo-600 w-4 h-4" />
                Asset Registry Entry
              </h3>
              <span className="text-[9px] font-bold text-slate-400 font-mono tracking-widest bg-indigo-500/5 border border-indigo-500/10 px-2 py-0.5 rounded-full">
                ADMIN SECURE
              </span>
            </div>

            {formSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-semibold flex items-start gap-2">
                <CheckCircle size={14} className="shrink-0 mt-0.5 text-emerald-400" />
                <span>{formSuccess}</span>
              </div>
            )}

            {formError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-semibold flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Asset Name */}
              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Product Title
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Helix Glassmorphic Iconset"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${
                    isDark
                      ? 'bg-[#1A1A1E] border-slate-800 text-white placeholder-slate-600 focus:border-indigo-500'
                      : 'bg-white border-[#e2e8f0] text-[#0f172a] placeholder-slate-400 focus:border-indigo-600'
                  }`}
                />
              </div>

              {/* Category & Type selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Category Classification
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer ${
                      isDark ? 'bg-[#1A1A1E] border-slate-800 text-white' : 'bg-white border-[#e2e8f0] text-[#0f172a]'
                    }`}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Delivery Format Type
                  </label>
                  <select
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value as any)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer ${
                      isDark ? 'bg-[#1A1A1E] border-slate-800 text-white' : 'bg-white border-[#e2e8f0] text-[#0f172a]'
                    }`}
                  >
                    <option value="ZIP">ZIP Package</option>
                    <option value="Prompt">Prompt Code</option>
                    <option value="Hybrid">ZIP + Prompt Hybrid</option>
                  </select>
                </div>
              </div>

              {/* Price & ZIP Optionals */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Price (USD $)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs font-bold">$</span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 29"
                      className={`w-full pl-7 pr-3.5 py-2.5 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${
                        isDark ? 'bg-[#1A1A1E] border-slate-800 text-white' : 'bg-white border-[#e2e8f0] text-[#0f172a]'
                      }`}
                    />
                  </div>
                  <p className="text-[9px] text-slate-500 mt-1">Set to 0 for a free-tier user item.</p>
                </div>

                <div>
                  <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Zip Binary {assetType === 'Prompt' ? '(Optional)' : '(Required)'}
                  </label>
                  <div className={`relative border border-dashed rounded-xl p-2.5 text-center transition-colors cursor-pointer ${
                    isDark ? 'bg-[#1A1A1E] border-slate-800 hover:bg-slate-800/20' : 'bg-slate-50 border-[#e2e8f0] hover:bg-slate-100'
                  }`}>
                    <input
                      type="file"
                      id="product_zip"
                      required={assetType !== 'Prompt'}
                      accept=".zip"
                      onChange={handleZipChange}
                      className="absolute inset-0 opacity-0 w-full cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-1 text-slate-400">
                      <FileText size={14} />
                      <span className="text-[9px] truncate max-w-full font-medium text-slate-500">
                        {zipFile ? zipFile.name : 'Choose .zip'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prompt code block textarea (only if type prompt or hybrid) */}
              {(assetType === 'Prompt' || assetType === 'Hybrid') && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">
                    System Prompt / LLM Instructions Code
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder={`e.g. System_prompt = """\nAct as a professional 3D generator...\n"""`}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-[#09090b] border border-slate-800 text-emerald-400 placeholder-slate-700 resize-none transition-all"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Asset Core Description
                </label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide an overview of asset benefits, design formats, compatibility, etc."
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none transition-all ${
                    isDark
                      ? 'bg-[#1A1A1E] border-slate-800 text-white placeholder-slate-600 focus:border-indigo-500'
                      : 'bg-white border-[#e2e8f0] text-[#0f172a] placeholder-slate-400 focus:border-indigo-600'
                  }`}
                />
              </div>

              {/* Image Preview / Selection Box */}
              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Preview Canvas Banner Image
                </label>
                <div className={`relative border border-dashed rounded-xl p-3.5 text-center transition-colors cursor-pointer ${
                  isDark ? 'bg-[#1A1A1E] border-slate-800 hover:bg-slate-800/20' : 'bg-slate-50 border-[#e2e8f0] hover:bg-slate-100'
                }`}>
                  <input
                    type="file"
                    id="preview_image"
                    required
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 w-full cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-1.5 text-slate-400">
                    <Upload size={16} />
                    <span className="text-[10px] truncate max-w-full font-medium text-slate-500">
                      {imageFile ? imageFile.name : 'Upload high-resolution preview art'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all mt-6 cursor-pointer shadow-md shadow-indigo-600/10"
              >
                {formLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Encrypting & Syncing Asset...
                  </>
                ) : (
                  <>
                    <Plus size={14} />
                    Publish To LensForge Market
                  </>
                )}
              </button>
            </form>
          </div>

          {/* LIVE DYNAMIC PREVIEW CARD */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Admin Live Canvas Builder Preview
            </h4>
            <div className={`border rounded-2xl overflow-hidden p-4 relative ${cardClass}`}>
              <div className="aspect-video rounded-xl bg-slate-900/40 relative overflow-hidden flex items-center justify-center border border-slate-800/40">
                {imagePreview ? (
                  <img src={imagePreview} alt="Live Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-slate-500 space-y-1">
                    <ImageIcon className="mx-auto" size={24} />
                    <p className="text-[10px] font-medium font-mono">Art asset display empty</p>
                  </div>
                )}
                <span className="absolute top-3 left-3 bg-[#0B0B0C]/80 border border-slate-800/40 text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full text-indigo-400 backdrop-blur-sm">
                  {assetType} Delivery
                </span>
                <span className="absolute bottom-3 right-3 bg-indigo-600 text-white font-mono text-[10px] px-2.5 py-1 rounded-lg font-bold">
                  {price ? `$${price}` : '$Free'}
                </span>
              </div>
              <div className="mt-3.5 space-y-1">
                <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider block">
                  {category}
                </span>
                <h4 className={`text-xs font-extrabold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {name || 'Untethered Canvas Item'}
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-1 leading-relaxed">
                  {description || 'Interactive placeholder description text goes here.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DIGITAL CATALOG INDEX */}
        <div className="lg:col-span-7 space-y-6">
          <div className={`border rounded-2xl p-6 shadow-sm relative ${cardClass}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
                  Platform Catalog Registry
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                  Verify or delete active premium resources of the market index.
                </p>
              </div>

              {/* Mini counters */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-400 px-2.5 py-1 rounded-full border border-slate-800 bg-[#0B0B0C] font-mono">
                  Registry Total: {products.length}
                </span>
                <span className="text-[10px] font-bold text-slate-400 px-2.5 py-1 rounded-full border border-slate-800 bg-[#0B0B0C] font-mono">
                  Filtered: {filteredProducts.length}
                </span>
              </div>
            </div>

            {/* INTERACTIVE FILTERS ROW */}
            <div className="flex flex-col sm:flex-row gap-3 pb-5 border-b border-slate-500/5">
              {/* Search input */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search catalog by name, id, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${
                    isDark
                      ? 'bg-[#1A1A1E] border-slate-800 text-white placeholder-slate-500'
                      : 'bg-white border-slate-200 text-[#0f172a] placeholder-slate-400'
                  }`}
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2">
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className={`px-3 py-2 rounded-xl text-xs focus:outline-none cursor-pointer border ${
                    isDark ? 'bg-[#1A1A1E] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <option value="All">All Categories</option>
                  <option value="Templates">Templates</option>
                  <option value="3D SaaS">3D SaaS</option>
                  <option value="Dashboards">Dashboards</option>
                </select>

                {/* Type Filter */}
                <select
                  value={selectedTypeFilter}
                  onChange={(e) => setSelectedTypeFilter(e.target.value)}
                  className={`px-3 py-2 rounded-xl text-xs focus:outline-none cursor-pointer border ${
                    isDark ? 'bg-[#1A1A1E] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <option value="All">All Types</option>
                  <option value="ZIP">ZIP</option>
                  <option value="Prompt">Prompt</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            {/* List Body */}
            {loading ? (
              <div className="flex flex-col justify-center items-center py-24 gap-3">
                <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-xs text-slate-400 font-mono">Querying database index...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 text-slate-500 text-xs font-mono space-y-1">
                <p>No products match the selected filters.</p>
                <button
                  onClick={() => {
                    setSelectedCategoryFilter('All');
                    setSelectedTypeFilter('All');
                    setSearchQuery('');
                  }}
                  className="text-xs text-indigo-400 hover:underline cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b text-slate-400 font-bold uppercase tracking-wider text-[9px] ${
                      isDark ? 'border-slate-800' : 'border-[#e2e8f0]'
                    }`}>
                      <th className="pb-3 pl-1">Preview & details</th>
                      <th className="pb-3">Classification</th>
                      <th className="pb-3">Package Delivery Type</th>
                      <th className="pb-3">Unit Cost</th>
                      <th className="pb-3 text-right pr-1">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                    {filteredProducts.map((p) => {
                      const pType = p.type || 'ZIP';
                      return (
                        <tr
                          key={p.id}
                          className={`transition-colors duration-150 ${
                            isDark ? 'hover:bg-slate-950/40' : 'hover:bg-slate-50'
                          }`}
                        >
                          {/* Image preview & info */}
                          <td className="py-4 pl-1">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-800/40 bg-slate-900 flex items-center justify-center shrink-0">
                                <img
                                  src={p.image_url}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as any).src = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&q=80`;
                                  }}
                                />
                              </div>
                              <div className="overflow-hidden">
                                <span className={`font-bold block truncate max-w-[160px] ${
                                  isDark ? 'text-white' : 'text-[#0f172a]'
                                }`}>
                                  {p.name}
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{p.id}</span>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-4">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-slate-800 bg-[#0B0B0C] text-[9px] font-bold text-slate-300">
                              <Tag size={8} />
                              {p.category}
                            </span>
                          </td>

                          {/* Type */}
                          <td className="py-4">
                            <span className={`text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border ${
                              pType === 'ZIP'
                                ? 'bg-blue-500/5 border-blue-500/10 text-blue-400'
                                : pType === 'Prompt'
                                ? 'bg-violet-500/5 border-violet-500/10 text-violet-400'
                                : 'bg-purple-500/5 border-purple-500/10 text-purple-400'
                            }`}>
                              {pType}
                            </span>
                          </td>

                          {/* Price */}
                          <td className={`py-4 font-mono font-bold text-xs ${
                            isDark ? 'text-indigo-400' : 'text-indigo-600'
                          }`}>
                            {p.price === 0 ? 'FREE' : `$${p.price}`}
                          </td>

                          {/* Action Delete */}
                          <td className="py-4 text-right pr-1 whitespace-nowrap">
                            {deleteConfirmId === p.id ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleDelete(p.id)}
                                  className="px-2 py-1 rounded bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700 transition-colors cursor-pointer"
                                >
                                  Delete
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                    isDark
                                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(p.id)}
                                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                  isDark
                                    ? 'bg-rose-950/20 border-rose-900/30 text-rose-400 hover:bg-rose-950/50 hover:border-rose-800'
                                    : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'
                                }`}
                                title="Delete Product"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
