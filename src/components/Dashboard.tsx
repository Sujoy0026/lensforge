import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Download, ShoppingBag, Calendar, CheckCircle2, Copy, RefreshCw } from 'lucide-react';
import { Product } from '../types.js';
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
}

export default function Dashboard({ token }: DashboardProps) {
  const { isDark } = useTheme();
  const [purchases, setPurchases] = useState<PurchasedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/purchases', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPurchases(data);
      }
    } catch (err) {
      console.error('Error fetching purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [token]);

  const copyToClipboard = (text: string, labelId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(labelId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Overview Stats */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border rounded-xl p-6 transition-colors duration-200 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#e2e8f0]'
      }`}>
        <div>
          <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>
            <ShoppingBag className="text-indigo-600 w-5 h-5" />
            Your Digital Assets Library
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Access, manage, and securely download your premium template and SaaS kits anytime.
          </p>
        </div>
        <button
          onClick={fetchPurchases}
          className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-colors border cursor-pointer ${
            isDark ? 'bg-indigo-950/40 border-indigo-900/30 text-indigo-400 hover:bg-indigo-950/60' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-indigo-200'
          }`}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Sync Library
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : purchases.length === 0 ? (
        <div className={`text-center py-16 border border-dashed rounded-xl p-8 transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#e2e8f0]'}`}>
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto mb-4">
            <ShoppingBag size={24} />
          </div>
          <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>No Purchases Found Yet</h3>
          <p className={`text-sm mt-1.5 max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Browse our catalog, pick a premium template or UI kit, and unlock instant downloads instantly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {purchases.map((item) => {
            const isDefaultSeed = item.product.id.startsWith('p-');
            const gradientStylesLight: { [key: string]: string } = {
              'p-quantum-dashboard': 'from-indigo-100 via-white to-indigo-50/50 border-indigo-200',
              'p-aura-3d-saas': 'from-blue-100 via-white to-purple-50/50 border-purple-200',
              'p-helix-assets': 'from-amber-100 via-white to-amber-50/50 border-amber-200',
              'p-stark-admin': 'from-cyan-100 via-white to-teal-50/50 border-teal-200',
              'p-vortex-landing': 'from-rose-100 via-white to-rose-50/50 border-rose-200',
            };
            const gradientStylesDark: { [key: string]: string } = {
              'p-quantum-dashboard': 'from-indigo-950/45 via-slate-900 to-indigo-950/20 border-indigo-900/40',
              'p-aura-3d-saas': 'from-blue-950/45 via-slate-900 to-purple-950/20 border-purple-900/40',
              'p-helix-assets': 'from-amber-950/45 via-slate-900 to-amber-950/20 border-amber-900/40',
              'p-stark-admin': 'from-cyan-950/45 via-slate-900 to-teal-950/20 border-teal-900/40',
              'p-vortex-landing': 'from-rose-950/45 via-slate-900 to-rose-950/20 border-rose-900/40',
            };
            const gradientStyles = isDark ? gradientStylesDark : gradientStylesLight;
            const selectedGradient = gradientStyles[item.product.id] || (isDark ? 'from-slate-900 via-slate-950 to-slate-900' : 'from-indigo-50 via-white to-slate-50');

            return (
              <motion.div
                key={item.orderId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border rounded-xl overflow-hidden flex flex-col justify-between shadow-sm transition-colors duration-200 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#e2e8f0]'
                }`}
              >
                {/* Product Visual Card Preview */}
                <div className={`relative aspect-video overflow-hidden group border-b transition-colors duration-200 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-[#e2e8f0]'}`}>
                  {isDefaultSeed ? (
                    /* Premium Gradient visual fallback for files */
                    <div className={`w-full h-full bg-gradient-to-br ${selectedGradient} flex items-center justify-center p-6 text-center relative`}>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.06),transparent_60%)]" />
                      <div>
                        <span className={`text-[10px] tracking-widest uppercase font-bold px-2.5 py-1 rounded-full border ${isDark ? 'text-indigo-400 bg-indigo-950/40 border-indigo-900/30' : 'text-indigo-600 bg-indigo-50 border border-indigo-100'}`}>
                          {item.product.category}
                        </span>
                        <h4 className={`text-lg font-bold mt-3 ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>{item.product.name}</h4>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  
                  <div className="absolute top-3 right-3 bg-emerald-50 border border-emerald-200 text-emerald-600 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md shadow-sm">
                    <CheckCircle2 size={13} /> Active License
                  </div>
                </div>

                {/* Purchase Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className={`text-base font-bold line-clamp-1 ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>{item.product.name}</h3>
                    <p className={`text-xs mt-1.5 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.product.description}</p>
                    
                    {/* Metadata fields */}
                    <div className={`grid grid-cols-2 gap-3 mt-4 border-t pt-4 text-xs ${isDark ? 'border-slate-800' : 'border-[#e2e8f0]'}`}>
                      <div>
                        <span className="text-slate-400 block font-medium">Purchase Date</span>
                        <span className={`flex items-center gap-1 mt-0.5 font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          <Calendar size={12} className="text-slate-400" />
                          {new Date(item.purchaseDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Order Price</span>
                        <span className={`font-bold block mt-0.5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                          ${item.amount.toLocaleString('en-US')}
                        </span>
                      </div>
                    </div>

                    {/* Secure Transaction Info */}
                    <div className={`border rounded-lg p-3 mt-4 space-y-2 text-[11px] font-mono ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-[#e2e8f0]'}`}>
                      <div className="flex justify-between items-center text-slate-500">
                        <span>Order ID:</span>
                        <button
                          onClick={() => copyToClipboard(item.orderId, 'order-' + item.orderId)}
                          className={`flex items-center gap-1 text-right max-w-[180px] cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-[#0f172a]'}`}
                        >
                          <span className="truncate">{item.orderId}</span>
                          <Copy size={10} className="shrink-0" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center text-slate-500">
                        <span>Payment ID:</span>
                        <button
                          onClick={() => copyToClipboard(item.paymentId, 'pay-' + item.paymentId)}
                          className={`flex items-center gap-1 text-right max-w-[180px] cursor-pointer transition-colors ${isDark ? 'hover:text-white' : 'hover:text-[#0f172a]'}`}
                        >
                          <span className="truncate">{item.paymentId}</span>
                          <Copy size={10} className="shrink-0" />
                        </button>
                      </div>
                      {copiedId && (copiedId.includes(item.orderId) || copiedId.includes(item.paymentId)) && (
                        <p className="text-emerald-600 text-[10px] text-right font-semibold">Copied to clipboard!</p>
                      )}
                    </div>
                  </div>

                  {/* Direct Secure Download Link */}
                  <div className="mt-6 pt-2">
                    <a
                      href={`/api/downloads/${item.product.id}?token=${encodeURIComponent(token)}`}
                      download
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-indigo-600/10 cursor-pointer text-center"
                    >
                      <Download size={14} />
                      Download Secure Package (ZIP)
                    </a>
                    <p className="text-[10px] text-slate-400 text-center mt-2">
                      Authorized and secured download node. Keep your token private.
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
