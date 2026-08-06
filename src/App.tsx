import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Search,
  User,
  LogOut,
  LayoutDashboard,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Sun,
  Moon,
} from 'lucide-react';
import { Product, User as UserType } from './types.js';
import { useTheme } from './context/ThemeContext.tsx';


// Import Modular Components
import ProductCard from './components/ProductCard.js';
import ProductDetails from './components/ProductDetails.js';
import AuthModal from './components/AuthModal.js';
import Dashboard from './components/Dashboard.js';
import AdminPanel from './components/AdminPanel.js';
import PaymentSimulator from './components/PaymentSimulator.js';
import LensForgeLogo from './components/LensForgeLogo.tsx';

export default function App() {
  // Theme hook
  const { theme, toggleTheme, isDark } = useTheme();

  // Authentication & Sessions
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  // App Navigation & Filter
  const [activeTab, setActiveTab] = useState<'Home' | 'Dashboard' | 'Admin'>('Home');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Templates' | '3D SaaS' | 'Dashboards'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Products & Active Selection
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Payment State (Simulator Overlay)
  const [paymentState, setPaymentState] = useState<{
    isOpen: boolean;
    product: Product | null;
    orderId: string;
    isSandbox: boolean;
  }>({
    isOpen: false,
    product: null,
    orderId: '',
    isSandbox: true,
  });

  // Success Notification banner
  const [successBanner, setSuccessBanner] = useState('');

  // 1. Initial State Sync
  useEffect(() => {
    const savedToken = localStorage.getItem('lensforge_token');
    const savedUser = localStorage.getItem('lensforge_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    // Load initial products
    fetchProducts();
  }, []);

  // 2. Load User Purchases once authenticated
  useEffect(() => {
    if (token) {
      fetchUserPurchases();
    } else {
      setPurchasedIds([]);
    }
  }, [token]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (e) {
      console.error('Error fetching products:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPurchases = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/purchases', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const ids = data.map((item: any) => item.product.id);
        setPurchasedIds(ids);
      }
    } catch (e) {
      console.error('Error fetching user purchases:', e);
    }
  };

  const handleAuthSuccess = (authUser: UserType, authToken: string) => {
    setUser(authUser);
    setToken(authToken);
    setSuccessBanner(`Welcome back, ${authUser.email}!`);
    setTimeout(() => setSuccessBanner(''), 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem('lensforge_token');
    localStorage.removeItem('lensforge_user');
    setUser(null);
    setToken(null);
    setActiveTab('Home');
    setSuccessBanner('Logged out successfully.');
    setTimeout(() => setSuccessBanner(''), 3000);
  };

  // 3. Billing & Checkout Handler
  const handlePurchaseRequest = async (product: Product) => {
    // Force Auth first
    if (!token || !user) {
      openAuthModal('login');
      return;
    }

    try {
      const orderRes = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        alert(orderData.error || 'Failed to create order. Please try again.');
        return;
      }

      // Check if order returned sandbox mode
      if (orderData.isSandbox) {
        // Close details panel and open simulator
        setSelectedProduct(null);
        setPaymentState({
          isOpen: true,
          product,
          orderId: orderData.id,
          isSandbox: true,
        });
      } else {
        // Real Payment Gateway Checkout Setup
        const options = {
          key: orderData.key,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'LensForge Marketplace',
          description: product.name,
          order_id: orderData.id,
          prefill: {
            email: user.email,
          },
          theme: {
            color: '#2563EB',
          },
          handler: async (response: any) => {
            // Verify payment on backend
            try {
              const verifyRes = await fetch('/api/checkout/verify-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  productId: product.id,
                  isSandbox: false,
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.verified) {
                // Success
                setSelectedProduct(null);
                fetchUserPurchases();
                setSuccessBanner(`Payment Verified! "${product.name}" unlocked.`);
                setTimeout(() => setSuccessBanner(''), 5000);
                setActiveTab('Dashboard');
              } else {
                alert('Signature verification failed. Please contact support.');
              }
            } catch (err) {
              console.error('Payment verification failed:', err);
              alert('Error verifying payment.');
            }
          },
          modal: {
            ondismiss: function () {
              console.log('Checkout modal closed by user');
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      console.error('Error during checkout initiation:', err);
      alert('Unable to initiate checkout process. Check your network.');
    }
  };

  const handleSandboxPaymentSuccess = async (mockPaymentId: string) => {
    if (!token || !paymentState.product) return;
    try {
      const verifyRes = await fetch('/api/checkout/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          razorpay_order_id: paymentState.orderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: 'sandbox_valid_signature',
          productId: paymentState.product.id,
          isSandbox: true,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.verified) {
        fetchUserPurchases();
        setSuccessBanner(`Sandbox Payment Authorized! "${paymentState.product.name}" unlocked.`);
        setTimeout(() => setSuccessBanner(''), 5000);
        setActiveTab('Dashboard');
      }
    } catch (err) {
      console.error('Error during sandbox verification:', err);
    } finally {
      setPaymentState({ isOpen: false, product: null, orderId: '', isSandbox: true });
    }
  };

  // Filter Catalog
  const filteredProducts = products.filter((p) => {
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-200 selection:bg-indigo-600/10 ${isDark ? 'bg-slate-950 text-slate-100 selection:text-indigo-400' : 'bg-[#f8fafc] text-[#0f172a] selection:text-indigo-600'}`}>
      {/* 1. Global Alert Banner */}
      <AnimatePresence>
        {successBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 text-xs font-semibold px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border transition-all ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-slate-950/40' : 'bg-white border-[#e2e8f0] text-[#0f172a]'}`}
          >
            <CheckCircle className="text-emerald-600 w-4 h-4 shrink-0" />
            <span>{successBanner}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Top Navigation Bar */}
      <header className={`sticky top-0 z-30 backdrop-blur-md border-b px-6 py-4 transition-colors duration-200 ${isDark ? 'bg-slate-950/85 border-slate-800' : 'bg-[#f8fafc]/85 border-[#e2e8f0]'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div
            onClick={() => {
              setActiveTab('Home');
              setCategoryFilter('All');
            }}
            className="cursor-pointer group"
          >
            <LensForgeLogo size={34} showText={true} showSubtitle={true} isDark={isDark} />
          </div>

          {/* Center Navigation Menus */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => {
                setActiveTab('Home');
                setCategoryFilter('Templates');
              }}
              className={`text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                activeTab === 'Home' && categoryFilter === 'Templates' ? 'text-indigo-600' : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-[#0f172a]')
              }`}
            >
              Templates
            </button>
            <button
              onClick={() => {
                setActiveTab('Home');
                setCategoryFilter('3D SaaS');
              }}
              className={`text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                activeTab === 'Home' && categoryFilter === '3D SaaS' ? 'text-indigo-600' : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-[#0f172a]')
              }`}
            >
              3D SaaS
            </button>
            <button
              onClick={() => {
                setActiveTab('Home');
                setCategoryFilter('Dashboards');
              }}
              className={`text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                activeTab === 'Home' && categoryFilter === 'Dashboards' ? 'text-indigo-600' : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-[#0f172a]')
              }`}
            >
              Dashboards
            </button>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {token && user ? (
              <>
                {/* Admin Control Switch */}
                {user.is_admin && (
                  <button
                    onClick={() => setActiveTab(activeTab === 'Admin' ? 'Home' : 'Admin')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      activeTab === 'Admin'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 hover:bg-indigo-500/20'
                    }`}
                  >
                    <LayoutDashboard size={13} />
                    Admin
                  </button>
                )}

                {/* Standard Purchases Library */}
                <button
                  onClick={() => setActiveTab(activeTab === 'Dashboard' ? 'Home' : 'Dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    activeTab === 'Dashboard'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : (isDark ? 'bg-slate-900 text-slate-100 border-slate-800 hover:bg-slate-800/60' : 'bg-white text-[#0f172a] border-[#e2e8f0] hover:bg-slate-50')
                  }`}
                >
                  <ShoppingBag size={13} />
                  My Library
                </button>

                {/* Profile detail */}
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-[10px] text-slate-400 font-mono">Signed In As</span>
                  <span className={`text-xs font-bold max-w-[140px] truncate ${isDark ? 'text-slate-200' : 'text-[#0f172a]'}`} title={user.email}>
                    {user.email}
                  </span>
                </div>

                {/* Log Out */}
                <button
                  onClick={handleLogout}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${isDark ? 'bg-slate-900 border-slate-800 hover:bg-red-950/20 text-slate-400 hover:text-red-400 hover:border-red-900/40' : 'bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 border-[#e2e8f0] hover:border-red-200'}`}
                  title="Logout Account"
                >
                  <LogOut size={14} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className={`px-3.5 py-2 border border-transparent rounded-lg text-xs font-bold transition-all cursor-pointer ${isDark ? 'text-slate-300 hover:text-white hover:bg-slate-900' : 'text-slate-600 hover:text-[#0f172a] hover:bg-slate-50'}`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-amber-400 hover:text-amber-300 hover:bg-slate-800/60'
                  : 'bg-white border-[#e2e8f0] text-slate-500 hover:text-[#0f172a] hover:bg-slate-50'
              }`}
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>
      </header>

      {/* 3. Main Views Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* USER DASHBOARD VIEW */}
          {activeTab === 'Dashboard' && token && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <Dashboard
                token={token}
                user={user}
                onLogout={handleLogout}
                onUpdateUser={handleAuthSuccess}
              />
            </motion.div>
          )}

          {/* ADMIN DASHBOARD VIEW */}
          {activeTab === 'Admin' && token && user?.is_admin && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <AdminPanel token={token} />
            </motion.div>
          )}

          {/* HOMEPAGE VIEW */}
          {activeTab === 'Home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-16"
            >
               {/* Hero Banner Section */}
              <section className="text-center max-w-3xl mx-auto py-10 relative">
                {/* Visual Ambient Blur */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-36 bg-indigo-600/10 blur-[80px] pointer-events-none rounded-full" />

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <span className={`text-[10px] tracking-[0.25em] uppercase font-bold px-3.5 py-1.5 rounded-full inline-block mb-4 border ${isDark ? 'text-indigo-400 bg-indigo-950/40 border-indigo-900/30' : 'text-indigo-600 bg-indigo-50 border border-indigo-100'}`}>
                    Authorized SaaS Marketplace
                  </span>
                  <h1 className={`text-4xl sm:text-5xl font-black leading-[1.1] tracking-tight transition-colors duration-200 ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
                    Premium Digital Products <br />
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      For Builders
                    </span>
                  </h1>
                  <p className={`text-sm mt-4 max-w-xl mx-auto leading-relaxed transition-colors duration-200 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Templates, 3D SaaS elements, and dashboard UI kits — pre-configured, tested, and ready to launch.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-wrap items-center justify-center gap-3 mt-8"
                >
                  <button
                    onClick={() => {
                      const element = document.getElementById('catalog-grid');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`px-6 py-3 text-xs font-bold rounded-lg transition-all flex items-center gap-2 group cursor-pointer ${isDark ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950/30' : 'bg-[#0f172a] hover:bg-slate-800 text-white shadow-lg shadow-slate-950/10'}`}
                  >
                    Browse Products
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </button>
                  <button
                    onClick={() => {
                      const element = document.getElementById('bento-categories');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`px-6 py-3 text-xs font-bold rounded-lg transition-all border cursor-pointer ${isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800' : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-[#e2e8f0]'}`}
                  >
                    Explore Categories
                  </button>
                </motion.div>
              </section>

              {/* Category Bento Cards Section */}
              <section id="bento-categories" className="space-y-4 scroll-mt-24">
                <div className="text-center max-w-md mx-auto">
                  <h2 className={`text-xs uppercase font-extrabold tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Curated Categories</h2>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Select a category card below to filter the global catalog</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1 */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    onClick={() => {
                      setCategoryFilter('Templates');
                      const element = document.getElementById('catalog-grid');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`border rounded-xl p-6 cursor-pointer text-left transition-all ${
                      categoryFilter === 'Templates'
                        ? (isDark ? 'bg-indigo-950/20 border-indigo-500/50 shadow-lg shadow-indigo-950/40' : 'bg-indigo-50/40 border-indigo-500/40 shadow-lg shadow-indigo-500/5')
                        : (isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-[#e2e8f0] hover:border-slate-300')
                    }`}
                  >
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${isDark ? 'text-indigo-400 bg-indigo-950/40 border-indigo-900/30' : 'text-indigo-600 bg-indigo-50 border-indigo-100'}`}>
                      Codebases
                    </span>
                    <h3 className={`text-base font-bold mt-4 ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>Templates</h3>
                    <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      High-converting Next.js, HTML, and Tailwind marketing assets configured with elegant reveal effects.
                    </p>
                    <span className={`text-[11px] font-semibold flex items-center gap-1 mt-4 hover:underline ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                      View Templates <ArrowRight size={12} />
                    </span>
                  </motion.div>

                  {/* Card 2 */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    onClick={() => {
                      setCategoryFilter('3D SaaS');
                      const element = document.getElementById('catalog-grid');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`border rounded-xl p-6 cursor-pointer text-left transition-all ${
                      categoryFilter === '3D SaaS'
                        ? (isDark ? 'bg-purple-950/20 border-purple-500/50 shadow-lg shadow-purple-950/40' : 'bg-purple-50/40 border-purple-500/40 shadow-lg shadow-purple-500/5')
                        : (isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-[#e2e8f0] hover:border-slate-300')
                    }`}
                  >
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${isDark ? 'text-purple-400 bg-purple-950/40 border-purple-900/30' : 'text-purple-600 bg-purple-50 border-purple-100'}`}>
                      3D Graphics
                    </span>
                    <h3 className={`text-base font-bold mt-4 ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>3D SaaS Assets</h3>
                    <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Stunning customizable 3D glassmorphic elements and graphic packs optimized for websites and pitch decks.
                    </p>
                    <span className={`text-[11px] font-semibold flex items-center gap-1 mt-4 hover:underline ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                      View 3D SaaS <ArrowRight size={12} />
                    </span>
                  </motion.div>

                  {/* Card 3 */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    onClick={() => {
                      setCategoryFilter('Dashboards');
                      const element = document.getElementById('catalog-grid');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`border rounded-xl p-6 cursor-pointer text-left transition-all ${
                      categoryFilter === 'Dashboards'
                        ? (isDark ? 'bg-emerald-950/20 border-emerald-500/50 shadow-lg shadow-emerald-950/40' : 'bg-emerald-50/40 border-emerald-500/40 shadow-lg shadow-emerald-500/5')
                        : (isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-[#e2e8f0] hover:border-slate-300')
                    }`}
                  >
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${isDark ? 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30' : 'text-emerald-600 bg-emerald-50 border-emerald-100'}`}>
                      Admin UI
                    </span>
                    <h3 className={`text-base font-bold mt-4 ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>Dashboard Kits</h3>
                    <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Sleek multi-component control panels housing robust data visualizations, tables, and system trackers.
                    </p>
                    <span className={`text-[11px] font-semibold flex items-center gap-1 mt-4 hover:underline ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      View Dashboards <ArrowRight size={12} />
                    </span>
                  </motion.div>
                </div>
              </section>

              {/* Product Grid Section */}
              <section id="catalog-grid" className="space-y-6 scroll-mt-24">
                {/* Search, Filter Tools Row */}
                <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5 transition-colors duration-200 ${isDark ? 'border-slate-800' : 'border-[#e2e8f0]'}`}>
                  {/* Category Buttons Row */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(['All', 'Templates', '3D SaaS', 'Dashboards'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          categoryFilter === cat
                            ? (isDark ? 'bg-indigo-950/40 text-indigo-400 border-indigo-800' : 'bg-indigo-50 text-indigo-600 border-indigo-200')
                            : (isDark ? 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-900 border-transparent' : 'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100 border-transparent')
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full sm:w-64">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Search size={14} />
                    </span>
                    <input
                      type="text"
                      placeholder="Search premium assets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-9 pr-4 py-2 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-all ${
                        isDark ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-[#e2e8f0] text-[#0f172a] placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Catalog Cards Grid */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-400">Loading catalog assets...</span>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className={`text-center py-20 rounded-xl border transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#e2e8f0]'}`}>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No premium digital assets match your criteria.</p>
                    <button
                      onClick={() => {
                        setCategoryFilter('All');
                        setSearchQuery('');
                      }}
                      className={`text-xs font-bold hover:underline mt-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}
                    >
                      Clear filters & view all
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onClick={() => setSelectedProduct(product)}
                      />
                    ))}
                  </div>
                )}
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 4. Footer info */}
      <footer className={`border-t py-6 px-6 text-center text-[11px] text-slate-400 font-mono transition-colors duration-200 ${isDark ? 'border-slate-800' : 'border-[#e2e8f0]'}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <span>&copy; {new Date().getFullYear()} LensForge Marketplace. All rights reserved.</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>PCI-DSS Secured Nodes</span>
            <span>•</span>
            <span>Authorized Digital Delivery</span>
          </div>
        </div>
      </footer>

      {/* 5. Modals & Overlays */}
      <AnimatePresence>
        {/* Auth Modal overlay */}
        {authModalOpen && (
          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            onAuthSuccess={handleAuthSuccess}
            initialMode={authModalMode}
          />
        )}

        {/* Product Details overlay */}
        {selectedProduct && (
          <ProductDetails
            product={selectedProduct}
            isOpen={!!selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onBuy={handlePurchaseRequest}
            isPurchased={purchasedIds.includes(selectedProduct.id)}
            downloadUrl={`/api/downloads/${selectedProduct.id}?token=${encodeURIComponent(token || '')}`}
          />
        )}

        {/* Payment Simulator overlay */}
        {paymentState.isOpen && paymentState.product && (
          <PaymentSimulator
            isOpen={paymentState.isOpen}
            onClose={() => setPaymentState({ isOpen: false, product: null, orderId: '', isSandbox: true })}
            product={paymentState.product}
            orderId={paymentState.orderId}
            onSuccess={handleSandboxPaymentSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
