'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { createOrder } from '@/lib/storageService';
import { 
  Lock, 
  CreditCard, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  CheckCircle2,
  Globe,
  Zap,
  Tag,
  FileText
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getCartTotal, clearCart } = useCart();
  const { user, addPurchasedProduct } = useAuth();

  const [email, setEmail] = useState(user?.email || '');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const total = getCartTotal();

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address for digital file delivery.');
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
      setErrorMessage('Order creation failed. Please check your details and try again.');
    }
  };

  if (cart.length === 0 && !loading) {
    return (
      <div className="max-w-md mx-auto my-16 bg-[#0e121e] border border-white/10 rounded-2xl p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Cart is Empty</h2>
        <p className="text-slate-400 text-xs">Add items to your cart before proceeding to checkout.</p>
        <Link href="/products" className="inline-block px-5 py-2.5 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      
      {/* CHECKOUT HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-white/10">
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
          <Lock className="w-4 h-4" /> 256-BIT ENCRYPTED CHECKOUT
        </div>
        <div className="text-slate-400 text-xs font-mono flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-emerald-400" /> International Cards & Currencies Accepted (USD)
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
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-400 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">Instant download links and commercial license key will be sent to this email.</p>
              </div>
            </div>

            {/* STEP 2: PAYMENT CARD / GATEWAY */}
            <div className="bg-[#0e121e] border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 text-[11px] font-mono flex items-center justify-center font-bold">2</span>
                  Payment Details
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Global Multi-Currency
                </span>
              </div>

              {/* ACCEPTED PAYMENT BADGES */}
              <div className="flex flex-wrap items-center gap-2 py-1">
                <span className="px-2 py-1 rounded bg-white/[0.05] border border-white/10 text-[10px] font-mono font-bold text-slate-300">VISA</span>
                <span className="px-2 py-1 rounded bg-white/[0.05] border border-white/10 text-[10px] font-mono font-bold text-slate-300">Mastercard</span>
                <span className="px-2 py-1 rounded bg-white/[0.05] border border-white/10 text-[10px] font-mono font-bold text-slate-300">Amex</span>
                <span className="px-2 py-1 rounded bg-white/[0.05] border border-white/10 text-[10px] font-mono font-bold text-slate-300">Apple Pay</span>
                <span className="px-2 py-1 rounded bg-white/[0.05] border border-white/10 text-[10px] font-mono font-bold text-slate-300">Google Pay</span>
                <span className="px-2 py-1 rounded bg-white/[0.05] border border-white/10 text-[10px] font-mono font-bold text-slate-300">UPI / NetBanking</span>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">Cardholder Name</label>
                  <input 
                    type="text"
                    required
                    value={nameOnCard}
                    onChange={(e) => setNameOnCard(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">Card Number</label>
                  <div className="relative">
                    <input 
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="•••• •••• •••• ••••"
                      maxLength={19}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm text-slate-100 font-mono outline-none focus:border-cyan-400"
                    />
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">Expiry Date</label>
                    <input 
                      type="text"
                      required
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">CVC / CVV</label>
                    <input 
                      type="password"
                      required
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      placeholder="•••"
                      maxLength={4}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CTA BUTTON */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-cyan-400/20 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing Payment & Issuing License...
                  </>
                ) : (
                  <>
                    Pay ${total.toFixed(2)} USD & Download Assets <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 font-mono px-2">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> Instant Digital Delivery (All Sales Final)
                </span>
                <Link href="/license" className="hover:text-cyan-400 underline">
                  Commercial License Terms
                </Link>
              </div>
            </div>

          </form>

        </div>

        {/* ORDER REVIEW SUMMARY */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0e121e] border border-white/10 rounded-2xl p-6 space-y-5">
            <h3 className="font-bold text-white text-sm">Order Summary ({cart.length} item{cart.length > 1 ? 's' : ''})</h3>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 divide-y divide-white/[0.06]">
              {cart.map((item) => (
                <div key={item.product.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div className="flex-1 truncate">
                    <p className="font-semibold text-slate-200 truncate">{item.product.title}</p>
                    <p className="text-[10px] font-mono text-slate-400 capitalize">{item.product.category.replace('-', ' ')}</p>
                  </div>
                  <span className="font-mono font-bold text-cyan-400">${item.product.price.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono text-slate-200">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Digital Delivery</span>
                <span className="font-mono text-emerald-400">Instant Access ($0)</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/[0.06]">
                <span>Total Amount</span>
                <span className="font-mono text-cyan-400">${total.toFixed(2)} USD</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5 text-[11px] text-slate-400">
              <p className="font-bold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Instant Digital Delivery
              </p>
              <p>Downloadable files and prompts are unlocked immediately in your account following payment.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
