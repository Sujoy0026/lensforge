'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  ShoppingBag, 
  Search, 
  User, 
  LogOut, 
  Layers, 
  ChevronDown, 
  Zap,
  UserPlus
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useCart } from '@/lib/CartContext';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut, isSubscribed } = useAuth();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#090b10]/90 backdrop-blur-md border-b border-white/10 text-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        
        {/* LOGO & BRAND */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="font-bold tracking-tight text-lg leading-none text-white">
              LENS<span className="text-cyan-400">FORGE</span>
            </div>
            <div className="text-[10px] text-slate-400 tracking-widest font-mono uppercase mt-0.5">
              Digital Studio
            </div>
          </div>
        </Link>

        {/* NAVIGATION CATEGORY LINKS */}
        <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/10 text-sm font-medium text-slate-300">
          <Link 
            href="/products" 
            className={`px-4 py-1.5 rounded-full transition-colors ${pathname === '/products' ? 'bg-cyan-500/15 text-cyan-400 font-semibold' : 'hover:text-white'}`}
          >
            All Products
          </Link>
          <Link 
            href="/products?category=prompts" 
            className="px-3.5 py-1.5 rounded-full hover:text-white transition-colors"
          >
            Master Prompts
          </Link>
          <Link 
            href="/products?category=templates" 
            className="px-3.5 py-1.5 rounded-full hover:text-white transition-colors"
          >
            Templates
          </Link>
          <Link 
            href="/products?category=dashboards" 
            className="px-3.5 py-1.5 rounded-full hover:text-white transition-colors"
          >
            Dashboards
          </Link>
          <Link 
            href="/products?category=3d-heroes" 
            className="px-3.5 py-1.5 rounded-full hover:text-white transition-colors"
          >
            3D Heroes
          </Link>
          <Link 
            href="/pricing" 
            className={`px-3.5 py-1.5 rounded-full flex items-center gap-1 transition-colors ${pathname === '/pricing' ? 'bg-cyan-400 text-slate-950 font-bold' : 'text-cyan-400 hover:text-cyan-300 font-semibold'}`}
          >
            <Zap className="w-3 h-3" /> All-Access Pass
          </Link>
        </nav>

        {/* SEARCH & USER ACTIONS */}
        <div className="flex items-center gap-3">
          {/* SEARCH BAR */}
          <form onSubmit={handleSearch} className="relative hidden sm:block">
            <input 
              type="text"
              placeholder="Search prompts, 3D, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/[0.04] border border-white/10 rounded-full px-4 py-1.5 pl-9 text-xs text-slate-200 placeholder-slate-400 outline-none focus:border-cyan-400/60 w-44 focus:w-56 transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </form>

          {/* CART BUTTON */}
          <Link 
            href="/cart"
            className="p-2 rounded-full bg-white/[0.05] border border-white/10 hover:border-cyan-400/40 text-slate-200 relative transition-all"
            title="View Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-cyan-400 text-slate-950 font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* USER ACCOUNT DROPDOWN / SIGN IN & REGISTER */}
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 p-1.5 rounded-full bg-white/[0.05] border border-white/10 hover:border-white/20 text-slate-200 text-xs font-medium"
              >
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                  {user.email[0].toUpperCase()}
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0e121e] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-slate-400 text-[10px] font-mono">SIGNED IN AS</p>
                    <p className="font-semibold text-slate-200 truncate">{user.email}</p>
                    <p className="text-[10px] text-cyan-400 uppercase font-mono mt-0.5">
                      {isSubscribed ? '⚡ All-Access Active' : 'Customer Account'}
                    </p>
                  </div>

                  <Link 
                    href="/account" 
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/[0.06] text-slate-300 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-cyan-400" /> My Purchases & Downloads
                  </Link>

                  <Link 
                    href="/pricing" 
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-cyan-500/10 text-cyan-300 transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5 text-cyan-400" /> All-Access Membership
                  </Link>

                  <button 
                    onClick={async () => {
                      setShowUserMenu(false);
                      await signOut();
                      router.push('/auth/signin');
                    }}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/15 text-red-400 transition-colors mt-1 border-t border-white/10"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                href="/auth/signin"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>

              <Link 
                href="/auth/signup"
                className="px-4 py-1.5 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-400/20"
              >
                Register
              </Link>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
