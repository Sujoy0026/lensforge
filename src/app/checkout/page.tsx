'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { createOrder } from '@/lib/storageService';
import { Lock, CreditCard, ShieldCheck, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getCartTotal, clearCart } = useCart();
  const { user, addPurchasedProduct } = useAuth();

  const [email, setEmail] = useState(user?.email || '');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const total = getCartTotal();

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address for file delivery.');
      return;
    }

    if (cart.length === 0) {
      setErrorMessage('Your shopping cart is empty.');
      return;
    }

    setLoading(true);

    try {
      const orderItems = cart.map(item => ({
        product: item.product,
        unitPrice: item.product.price
      }));

      const newOrder = await createOrder(
        email,
        total,
        orderItems,
        user?.id || null
      );

      // Grant instant access to purchased product IDs
      cart.forEach(item => {
        addPurchasedProduct(item.product.id);
      });

      clearCart();
      setLoading(false);
      router.push(`/checkout/success/${newOrder.id}`);
    } catch (err: any) {
      setLoading(false);
      setErrorMessage('Order creation failed. Please try again.');
    }
  };

  if (cart.length === 0 && !loading) {
    return (
      <div className="max-w-md mx-auto my-16 bg-[#0e121e] border border-white/10 rounded-2xl p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Cart is Empty</h2>
        <p className="text-slate-400 text-xs">Add items to your cart before proceeding to checkout.</p>
        <Link href="/products" className="inline-block px-5 py-2 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
          <Lock className="w-4 h-4" /> SECURE CHECKOUT (STUB FLOW)
        </div>
        <div className="text-slate-400 text-xs font-mono">
          Guest Checkout Enabled
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* CHECKOUT FORM */}
        <div className="lg:col-span-7 space-y-6">
          
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleCheckoutSubmit} className="space-y-6">
            
            {/* STEP 1: EMAIL */}
            <div className="bg-[#0e121e] border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 text-[11px] font-mono flex items-center justify-center font-bold">1</span>
                Digital Asset Delivery Email
              </h3>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">Email Address *</label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@company.com"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-400"
                />
                <p className="text-[11px] text-slate-400 mt-1">Order receipt and downloadable files link will be sent here.</p>
              </div>
            </div>

            {/* STEP 2: PAYMENT STUB */}
            <div className="bg-[#0e121e] border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 text-[11px] font-mono flex items-center justify-center font-bold">2</span>
                  Payment Method (Mock Provider Stub)
                </h3>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">Stripe Ready</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">Card Number</label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono outline-none focus:border-cyan-400"
                    />
                    <CreditCard className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">Expiry Date</label>
                    <input 
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">CVC Security</label>
                    <input 
                      type="text"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-cyan-400/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing Payment & Issuing License...
                </>
              ) : (
                <>
                  Pay ${total.toFixed(2)} & Download Assets <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

          </form>

        </div>

        {/* ORDER REVIEW SUMMARY */}
        <div className="lg:col-span-5">
          <div className="bg-[#0e121e] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-sm">Order Items ({cart.length})</h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between text-xs pb-3 border-b border-white/[0.06]">
                  <div>
                    <div className="font-semibold text-slate-200">{item.product.title}</div>
                    <div className="text-[10px] font-mono text-slate-400 capitalize">{item.product.category.replace('-', ' ')}</div>
                  </div>
                  <div className="font-mono font-bold text-cyan-400">
                    ${item.product.price.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between text-base font-extrabold text-white font-mono border-t border-white/10">
              <span>Total Amount</span>
              <span className="text-cyan-400">${total.toFixed(2)}</span>
            </div>

            <div className="pt-4 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Instant Digital Access Delivered Post Checkout
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
