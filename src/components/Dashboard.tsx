import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  ShoppingBag,
  History,
  Settings,
  LogOut,
  Download,
  Copy,
  Check,
  User as UserIcon,
  Mail,
  Lock,
  Menu,
  X,
  CreditCard,
  DollarSign,
  CheckCircle2,
  ExternalLink,
  Code2
} from 'lucide-react';
import { Product, User } from '../types.js';
import { useTheme } from '../context/ThemeContext.tsx';

interface PurchasedItem {
  orderId: string;
  purchaseDate: string;
  paymentId: string;
  amount: number;
  product: Product;
}

interface DashboardProps {
  token: string;
  user: User | null;
  onLogout: () => void;
  onUpdateUser: (user: User, token: string) => void;
}

type TabType = 'overview' | 'products' | 'purchases' | 'settings';

export default function Dashboard({ token, user, onLogout, onUpdateUser }: DashboardProps) {
  const { isDark } = useTheme();
  
  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data State
  const [purchases, setPurchases] = useState<PurchasedItem[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings Form State
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // UI States
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' }[]>([]);

  const addToast = (message: string, type: 'success' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch purchased products
      const purchasesRes = await fetch('/api/purchases', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      let purchaseData: PurchasedItem[] = [];
      if (purchasesRes.ok) {
        purchaseData = await purchasesRes.json();
        setPurchases(purchaseData);
      }

      // 2. Fetch all products to identify free products
      const productsRes = await fetch('/api/products');
      if (productsRes.ok) {
        const productData = await productsRes.json();
        setAllProducts(productData);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      addToast('Failed to load dashboard sync', 'info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  // Keep name input in sync with user prop updates
  useEffect(() => {
    if (user?.name) {
      setNameInput(user.name);
    }
  }, [user]);

  // Copy Prompt handler
  const handleCopyPrompt = (text: string, labelId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(labelId);
    addToast('Prompt copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Profile Settings submit handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput && passwordInput !== confirmPasswordInput) {
      addToast('Passwords do not match.', 'info');
      return;
    }

    setSavingSettings(true);
    try {
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: nameInput,
          password: passwordInput || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Propagate update back to main App context
        onUpdateUser(data.user, data.token);
        addToast('Settings updated successfully!', 'success');
        setPasswordInput('');
        setConfirmPasswordInput('');
      } else {
        const err = await response.json();
        addToast(err.error || 'Failed to update settings.', 'info');
      }
    } catch (err) {
      console.error(err);
      addToast('Connection error updating settings.', 'info');
    } finally {
      setSavingSettings(false);
    }
  };

  // Determine Library Products (Purchased + Free)
  const getLibraryProducts = () => {
    // Free products
    const freeProducts = allProducts.filter((p) => p.price === 0);
    
    // Merge list, filtering out duplicates
    const libraryMap = new Map<string, Product>();
    
    // Add free ones
    freeProducts.forEach((p) => {
      libraryMap.set(p.id, { ...p, type: p.type || 'ZIP' });
    });

    // Add purchased ones
    purchases.forEach((item) => {
      libraryMap.set(item.product.id, { ...item.product, type: item.product.type || 'ZIP' });
    });

    return Array.from(libraryMap.values());
  };

  const libraryProducts = getLibraryProducts();

  // Calculated Stats
  const totalPurchasesCount = purchases.length;
  const totalSpentAmount = purchases.reduce((sum, item) => sum + item.amount, 0);
  const productsOwnedCount = libraryProducts.length;

  // Dark Theme specifics
  const darkBg = 'bg-[#0B0B0C]';
  const darkCard = 'bg-[#111113] border-[#222226]';
  const lightBg = 'bg-slate-50';
  const lightCard = 'bg-white border-slate-200';

  const containerBg = isDark ? darkBg : lightBg;
  const cardStyle = isDark ? darkCard : lightCard;

  const sidebarItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'My Products', icon: ShoppingBag, badge: productsOwnedCount },
    { id: 'purchases', label: 'Purchases', icon: History, badge: totalPurchasesCount > 0 ? totalPurchasesCount : undefined },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className={`rounded-2xl border overflow-hidden min-h-[680px] flex flex-col md:flex-row transition-all duration-300 relative ${
      isDark ? 'border-[#222226] text-slate-200' : 'border-slate-200 text-slate-700'
    } ${containerBg}`}>
      
      {/* Dynamic Toast Notifications */}
      <div className="absolute top-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
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
                  : (isDark ? 'bg-indigo-950/90 text-indigo-400 border-indigo-900/40' : 'bg-indigo-50 text-indigo-800 border-indigo-200')
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${t.type === 'success' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* MOBILE HEADER BAR */}
      <div className={`md:hidden flex items-center justify-between px-5 py-4 border-b transition-colors duration-200 ${
        isDark ? 'border-[#222226] bg-[#111113]' : 'border-slate-200 bg-white'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-extrabold text-white text-xs">
            LF
          </div>
          <span className={`text-sm font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
            LensForge
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`p-2 rounded-lg border cursor-pointer ${
            isDark ? 'border-slate-800 text-slate-300 hover:bg-slate-900' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION (LEFT) */}
      <aside className={`w-full md:w-[220px] shrink-0 border-r transition-all duration-300 flex flex-col justify-between ${
        isDark ? 'border-[#222226] bg-[#111113]' : 'border-slate-200 bg-white'
      } ${mobileMenuOpen ? 'block' : 'hidden md:flex'}`}>
        <div>
          {/* Brand/User profile display */}
          <div className={`p-5 border-b hidden md:block ${isDark ? 'border-[#222226]' : 'border-slate-100'}`}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-indigo-500/10">
                {user?.name ? user.name[0].toUpperCase() : user?.email[0].toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h4 className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
                  {user?.name || 'Customer'}
                </h4>
                <p className="text-[10px] text-slate-400 truncate tracking-wide font-medium">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Nav List */}
          <nav className="p-3.5 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as TabType);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? (isDark ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/10')
                      : (isDark ? 'text-slate-400 hover:bg-[#1A1A1E] hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-[#0f172a]')
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
                    {item.label}
                  </span>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono leading-none ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : (isDark ? 'bg-[#1A1A1E] text-slate-300 border border-slate-800' : 'bg-slate-100 text-slate-600')
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer (Logout action) */}
        <div className={`p-4 border-t transition-colors ${isDark ? 'border-[#222226]' : 'border-slate-100'}`}>
          <button
            onClick={() => {
              onLogout();
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 text-red-500 hover:bg-red-500/5 cursor-pointer`}
          >
            <LogOut size={14} className="text-red-500" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN LAYOUT WRAPPER (TOP BAR + CONTENT) */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        
        {/* TOP BAR */}
        <header className={`hidden md:flex items-center justify-between px-8 py-5 border-b transition-colors duration-200 ${
          isDark ? 'border-[#222226] bg-[#111113]/30' : 'border-slate-100 bg-white/40'
        } backdrop-blur-sm`}>
          <div>
            <h1 className={`text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
              {activeTab === 'overview' && 'Customer Dashboard'}
              {activeTab === 'products' && 'My Asset Library'}
              {activeTab === 'purchases' && 'Order Transactions'}
              {activeTab === 'settings' && 'Account Settings'}
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5 tracking-wide uppercase font-bold">
              {activeTab === 'overview' && 'SaaS Asset Hub'}
              {activeTab === 'products' && 'Seeded & Paid Purchases'}
              {activeTab === 'purchases' && 'Verified Bills'}
              {activeTab === 'settings' && 'Identity & Credentials'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex flex-col text-right`}>
              <span className={`text-[11px] font-bold ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
                {user?.name || 'Authorized Account'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium font-mono">{user?.email}</span>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-indigo-400 border border-indigo-500/20 bg-indigo-500/10`}>
              {user?.email[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* MAIN SPACIOUS CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-24 gap-3">
              <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-xs text-slate-400 font-medium font-mono">Synchronizing profile ledger...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              
              {/* TAB 1: OVERVIEW / DASHBOARD */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Welcome Section */}
                  <div className={`p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between border ${cardStyle}`}>
                    {/* Glowing Accent Blur */}
                    <div className="absolute top-0 right-0 w-44 h-44 bg-purple-600/10 rounded-full blur-[45px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-[35px] pointer-events-none" />

                    <div className="relative z-10 max-w-xl">
                      <h2 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
                        Welcome back, {user?.name || 'Customer'} 👋
                      </h2>
                      <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Welcome to your LensForge client dashboard. Here you can inspect all your active licenses, retrieve high-performance templates and 3D SaaS assets, customize prompt models, and access instant zip updates.
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-dashed border-slate-500/10 flex flex-wrap gap-4 items-center">
                      <button
                        onClick={() => setActiveTab('products')}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/15 cursor-pointer flex items-center gap-1.5"
                      >
                        <ShoppingBag size={12} />
                        View Purchased Assets
                      </button>
                      <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          isDark ? 'border-slate-800 text-slate-300 hover:bg-slate-900' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Edit Profile Details
                      </button>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Stat 1: Products Owned */}
                    <div className={`p-5 rounded-2xl border flex items-center gap-4 transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.02)] ${cardStyle}`}>
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                        <ShoppingBag size={18} />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold tracking-wider uppercase">Products Owned</span>
                        <span className={`text-lg font-extrabold font-mono mt-0.5 block ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
                          {productsOwnedCount}
                        </span>
                      </div>
                    </div>

                    {/* Stat 2: Total Purchases */}
                    <div className={`p-5 rounded-2xl border flex items-center gap-4 transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.02)] ${cardStyle}`}>
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <CreditCard size={18} />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold tracking-wider uppercase">Total Orders</span>
                        <span className={`text-lg font-extrabold font-mono mt-0.5 block ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
                          {totalPurchasesCount}
                        </span>
                      </div>
                    </div>

                    {/* Stat 3: Total Spent */}
                    <div className={`p-5 rounded-2xl border flex items-center gap-4 transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.02)] ${cardStyle}`}>
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <DollarSign size={18} />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold tracking-wider uppercase">Total Spent</span>
                        <span className={`text-lg font-extrabold font-mono mt-0.5 block ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
                          ${totalSpentAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Overview Quick List of Recent Purchases */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-xs font-extrabold tracking-wider uppercase ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                        Recent Purchases
                      </h3>
                      {purchases.length > 0 && (
                        <button
                          onClick={() => setActiveTab('purchases')}
                          className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          View all
                        </button>
                      )}
                    </div>

                    {purchases.length === 0 ? (
                      <div className={`p-8 border border-dashed rounded-2xl text-center ${cardStyle}`}>
                        <p className="text-xs text-slate-400">You haven't made any premium transactions yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {purchases.slice(0, 2).map((item) => (
                          <div
                            key={item.orderId}
                            className={`p-4 rounded-xl border flex items-center gap-3 justify-between ${cardStyle}`}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-800">
                                <img
                                  src={item.product.image_url}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Handle missing asset
                                    (e.target as any).src = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&q=80`;
                                  }}
                                />
                              </div>
                              <div className="overflow-hidden">
                                <h4 className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
                                  {item.product.name}
                                </h4>
                                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{item.product.category}</span>
                              </div>
                            </div>
                            <span className="text-xs font-extrabold text-indigo-400 font-mono shrink-0">
                              ${item.amount}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 2: MY PRODUCTS */}
              {activeTab === 'products' && (
                <motion.div
                  key="products"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {libraryProducts.length === 0 ? (
                    <div className={`p-12 border border-dashed rounded-2xl text-center ${cardStyle}`}>
                      <ShoppingBag className="mx-auto text-slate-500 mb-3" size={32} />
                      <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>No products unlocked yet</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                        Explore the LensForge marketplace to purchase premium kits, prompts, and templates. Free items will automatically populate here.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {libraryProducts.map((product) => {
                        const isFree = product.price === 0;
                        const productType = product.type || 'ZIP';

                        return (
                          <div
                            key={product.id}
                            className={`rounded-2xl border overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 hover:border-indigo-500/30 ${cardStyle}`}
                          >
                            {/* Card Top: Visual banner */}
                            <div className={`relative aspect-video overflow-hidden border-b ${
                              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-100'
                            }`}>
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                onError={(e) => {
                                  (e.target as any).src = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80`;
                                }}
                              />
                              
                              {/* Overlay Badge for Type */}
                              <div className="absolute top-3 left-3 flex gap-1.5">
                                <span className={`text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border backdrop-blur-md ${
                                  productType === 'ZIP'
                                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                    : productType === 'Prompt'
                                    ? 'bg-violet-500/10 border-violet-500/20 text-violet-400'
                                    : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                }`}>
                                  {productType} Type
                                </span>
                                {isFree && (
                                  <span className="text-[9px] uppercase font-bold tracking-widest bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full backdrop-blur-md">
                                    Free Pass
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Card Details */}
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                              <div className="space-y-1">
                                <h3 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
                                  {product.name}
                                </h3>
                                <p className={`text-[11px] leading-relaxed line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {product.description}
                                </p>
                              </div>

                              {/* CONDITIONAL ACTION CORES */}
                              {(productType === 'Prompt' || productType === 'Hybrid') && product.prompt_text && (
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 tracking-wider">
                                    <span className="flex items-center gap-1">
                                      <Code2 size={10} />
                                      GENESIS AI PROMPT MODEL
                                    </span>
                                  </div>
                                  <div className="relative rounded-xl border border-slate-800 bg-[#09090b] p-3.5 pr-12 text-left">
                                    <button
                                      onClick={() => handleCopyPrompt(product.prompt_text || '', product.id)}
                                      className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                                        copiedId === product.id
                                          ? 'border-emerald-800 text-emerald-400 bg-emerald-950/20'
                                          : 'border-slate-800 text-slate-400 bg-slate-900/60 hover:bg-slate-800 hover:text-white'
                                      }`}
                                      title="Copy Prompt"
                                    >
                                      {copiedId === product.id ? <Check size={12} /> : <Copy size={12} />}
                                    </button>
                                    <pre className="font-mono text-[10px] text-slate-300 max-h-24 overflow-y-auto whitespace-pre-wrap break-all pr-4">
                                      {product.prompt_text}
                                    </pre>
                                  </div>
                                </div>
                              )}

                              {/* ZIP & Hybrid Download Logic */}
                              {(productType === 'ZIP' || productType === 'Hybrid') && (
                                <div className="pt-2">
                                  <a
                                    href={`/api/downloads/${product.id}?token=${encodeURIComponent(token)}`}
                                    download
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/10 cursor-pointer text-center"
                                  >
                                    <Download size={13} />
                                    Download Secure Package (ZIP)
                                  </a>
                                  <p className="text-[9px] text-slate-400 text-center mt-1.5">
                                    Authorized secure link • Node synced with private token
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 3: PURCHASES */}
              {activeTab === 'purchases' && (
                <motion.div
                  key="purchases"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {purchases.length === 0 ? (
                    <div className={`p-12 border border-dashed rounded-2xl text-center ${cardStyle}`}>
                      <History className="mx-auto text-slate-500 mb-3" size={32} />
                      <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>No purchase history</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                        Once you verify a payment checkout via Razorpay simulated portal, bills will generate here.
                      </p>
                    </div>
                  ) : (
                    <div className={`rounded-2xl border overflow-hidden ${cardStyle}`}>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                              isDark ? 'border-slate-800 bg-[#161619]' : 'border-slate-100 bg-slate-50'
                            }`}>
                              <th className="py-4 px-5">Product Name</th>
                              <th className="py-4 px-5">Purchase Date</th>
                              <th className="py-4 px-5">Price Paid</th>
                              <th className="py-4 px-5">Transaction IDs</th>
                              <th className="py-4 px-5 text-right">Licensing</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-500/5 text-xs">
                            {purchases.map((item) => (
                              <tr
                                key={item.orderId}
                                className={`transition-colors hover:bg-slate-500/5`}
                              >
                                <td className="py-4 px-5 font-bold">
                                  {item.product.name}
                                </td>
                                <td className="py-4 px-5 text-slate-400">
                                  {new Date(item.purchaseDate).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </td>
                                <td className="py-4 px-5 font-mono font-bold text-indigo-400">
                                  ${item.amount}
                                </td>
                                <td className="py-4 px-5 font-mono text-[10px] text-slate-400 space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="opacity-60 text-[9px] uppercase font-bold shrink-0">Order:</span>
                                    <span className="truncate max-w-[120px]">{item.orderId}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="opacity-60 text-[9px] uppercase font-bold shrink-0">Pay ID:</span>
                                    <span className="truncate max-w-[120px]">{item.paymentId}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-5 text-right">
                                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    Active Commercial
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 4: SETTINGS */}
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-xl mx-auto"
                >
                  <div className={`p-6 md:p-8 rounded-2xl border ${cardStyle}`}>
                    <form onSubmit={handleSaveSettings} className="space-y-5">
                      
                      {/* Name input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                          Profile Display Name
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-2.5 text-slate-500" size={14} />
                          <input
                            type="text"
                            required
                            placeholder="e.g. John Doe"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${
                              isDark
                                ? 'bg-[#1A1A1E] border-slate-800 text-white focus:border-indigo-500'
                                : 'bg-white border-slate-200 text-[#0f172a] focus:border-indigo-600'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Email input (Read-only) */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                            Registered Email (Read-Only)
                          </label>
                          <span className="inline-flex items-center gap-1 text-[9px] text-slate-400 font-bold font-mono">
                            <Lock size={8} /> Verified Auth
                          </span>
                        </div>
                        <div className="relative opacity-60">
                          <Mail className="absolute left-3 top-2.5 text-slate-500" size={14} />
                          <input
                            type="email"
                            readOnly
                            disabled
                            value={user?.email || ''}
                            className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border cursor-not-allowed ${
                              isDark
                                ? 'bg-[#141417] border-slate-800/60 text-slate-400'
                                : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Change Password Header separator */}
                      <div className="pt-2 border-t border-slate-500/5">
                        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">
                          Simulate Password Change
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase block">
                              New Password
                            </label>
                            <input
                              type="password"
                              placeholder="••••••••"
                              value={passwordInput}
                              onChange={(e) => setPasswordInput(e.target.value)}
                              className={`w-full px-4 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${
                                isDark
                                  ? 'bg-[#1A1A1E] border-slate-800 text-white focus:border-indigo-500'
                                  : 'bg-white border-slate-200 text-[#0f172a] focus:border-indigo-600'
                              }`}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase block">
                              Confirm Password
                            </label>
                            <input
                              type="password"
                              placeholder="••••••••"
                              value={confirmPasswordInput}
                              onChange={(e) => setConfirmPasswordInput(e.target.value)}
                              className={`w-full px-4 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${
                                isDark
                                  ? 'bg-[#1A1A1E] border-slate-800 text-white focus:border-indigo-500'
                                  : 'bg-white border-slate-200 text-[#0f172a] focus:border-indigo-600'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Submit */}
                      <div className="pt-4 flex justify-end">
                        <button
                          type="submit"
                          disabled={savingSettings}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/15 cursor-pointer disabled:opacity-50"
                        >
                          {savingSettings ? 'Saving Ledger...' : 'Save Settings Changes'}
                        </button>
                      </div>

                    </form>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
