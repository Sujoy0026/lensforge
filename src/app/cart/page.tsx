'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/CartContext';
import EmptyState from '@/components/EmptyState';
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft, ShieldCheck, Tag, Check } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, clearCart, getCartTotal } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');

  const subtotal = getCartTotal();
  const discountAmount = (subtotal * discountPercent) / 100;
  const finalTotal = subtotal - discountAmount;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'LENS20') {
      setDiscountPercent(20);
      setPromoMessage('✓ 20% Promo Discount Code Applied!');
    } else {
      setPromoMessage('Invalid promo code. Use LENS20 for 20% off.');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <EmptyState 
          icon={ShoppingBag}
          title="Your Shopping Cart is Empty"
          description="Browse our digital marketplace to add Master Prompts, SaaS boilerplates, UI dashboards, or 3D hero assets."
          actionText="Explore Digital Products"
          actionHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Shopping Cart ({cart.length})</h1>
          <p className="text-slate-400 text-xs mt-1">Review your digital items before proceeding to instant checkout</p>
        </div>
        <button onClick={clearCart} className="text-xs text-rose-400 hover:underline">
          Clear Entire Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* CART ITEMS LIST */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => (
            <div 
              key={item.product.id}
              className="bg-[#0e121e] border border-white/10 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-12 rounded-xl bg-slate-900 overflow-hidden border border-white/10 flex-shrink-0">
                  {item.product.thumbnailUrl ? (
                    <img src={item.product.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono text-[9px] text-slate-600">NO IMG</div>
                  )}
                </div>
                <div>
                  <Link href={`/products/${item.product.id}`} className="font-bold text-slate-100 text-sm hover:text-cyan-400">
                    {item.product.title}
                  </Link>
                  <span className="block text-[11px] font-mono text-cyan-400 capitalize mt-0.5">
                    {item.product.category.replace('-', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right font-extrabold text-white font-mono text-base">
                  ${item.product.price.toFixed(2)}
                </div>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-2 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 transition-colors"
                  title="Remove Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="pt-4">
            <Link href="/products" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" /> Continue Browsing Catalog
            </Link>
          </div>
        </div>

        {/* SUMMARY CARD */}
        <div className="lg:col-span-4">
          <div className="bg-[#0e121e] border border-white/10 rounded-2xl p-6 space-y-6">
            <h3 className="font-bold text-white text-base">Order Summary</h3>

            {/* PROMO FORM */}
            <form onSubmit={handleApplyPromo} className="space-y-2">
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Promo Code (LENS20)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-400"
                />
                <button type="submit" className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/15 text-slate-200 text-xs font-semibold">
                  Apply
                </button>
              </div>
              {promoMessage && (
                <div className={`text-[11px] font-mono ${promoMessage.includes('✓') ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {promoMessage}
                </div>
              )}
            </form>

            {/* TOTALS */}
            <div className="space-y-2 pt-4 border-t border-white/10 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal ({cart.length} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Promo Discount ({discountPercent}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-white/10 font-mono">
                <span>Total</span>
                <span className="text-cyan-400">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-400/20"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        </div>

      </div>

    </div>
  );
}
