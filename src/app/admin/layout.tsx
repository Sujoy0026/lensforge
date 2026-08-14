'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { isAdminSessionUnlocked, lockAdminSession } from '@/lib/adminSecurity';
import AdminSecurityGate from '@/components/AdminSecurityGate';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  PlusCircle, 
  ShieldAlert, 
  ArrowLeft,
  Lock,
  Loader2,
  KeyRound,
  Settings,
  LogOut
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [checkingPasscode, setCheckingPasscode] = useState(true);

  useEffect(() => {
    // Check if admin session has already been unlocked with secret passcode
    const unlocked = isAdminSessionUnlocked();
    setIsUnlocked(unlocked);
    setCheckingPasscode(false);
  }, []);

  const handleLockVault = () => {
    lockAdminSession();
    setIsUnlocked(false);
    router.push('/admin');
  };

  if (checkingPasscode || loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-rose-400 font-mono text-xs gap-3">
        <Loader2 className="w-4 h-4 animate-spin" /> Verifying Admin Security Gate...
      </div>
    );
  }

  // If secret passcode has not been entered, show the Secret Passcode Security Gate
  if (!isUnlocked) {
    return (
      <AdminSecurityGate onUnlockSuccess={() => setIsUnlocked(true)} />
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col md:flex-row">
      
      {/* ADMIN SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#0a0e1a] border-r border-white/10 p-6 flex flex-col justify-between">
        <div>
          {/* HEADER WITH LOCK BUTTON */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold">
              <ShieldAlert className="w-4 h-4" /> MASTER VAULT
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLockVault}
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs transition-colors"
                title="Lock Admin Session"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>

              <Link href="/" className="text-slate-400 hover:text-white text-xs flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Store
              </Link>
            </div>
          </div>

          <nav className="space-y-1.5">
            <Link 
              href="/admin" 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors ${pathname === '/admin' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> Overview & Stats
            </Link>
            
            <Link 
              href="/admin/products" 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors ${pathname === '/admin/products' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'}`}
            >
              <Package className="w-4 h-4" /> Products Catalog
            </Link>

            <Link 
              href="/admin/products/new" 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors ${pathname === '/admin/products/new' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'}`}
            >
              <PlusCircle className="w-4 h-4" /> Upload New Asset
            </Link>

            <Link 
              href="/admin/orders" 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors ${pathname === '/admin/orders' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'}`}
            >
              <ShoppingBag className="w-4 h-4" /> Orders & Licenses
            </Link>

            <Link 
              href="/admin/settings" 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors ${pathname === '/admin/settings' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'}`}
            >
              <KeyRound className="w-4 h-4" /> Security & Passcode
            </Link>
          </nav>
        </div>

        {/* SIDEBAR FOOTER */}
        <div className="pt-6 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Vault Unlocked</span>
            <button onClick={handleLockVault} className="text-rose-400 hover:underline">Lock</button>
          </div>
          <div className="text-[11px] text-slate-500 font-mono truncate">
            {user ? user.email : 'Master Admin'}
          </div>
        </div>
      </aside>

      {/* MAIN ADMIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 max-w-6xl">
        {children}
      </main>

    </div>
  );
}
