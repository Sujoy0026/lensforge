'use client';

import React, { useEffect, useState } from 'react';
import { Order } from '@/types';
import { getOrders } from '@/lib/storageService';
import { ShoppingBag, Loader2, Key, Mail, Calendar, DollarSign } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const data = await getOrders();
      setOrders(data);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Customer Orders Log ({orders.length})</h1>
        <p className="text-slate-400 text-xs mt-1">Audit log of all completed purchases, buyer email addresses, and generated developer license keys</p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-cyan-400 font-mono text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading Order Log...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-[#0e121e] border border-white/10 rounded-2xl p-12 text-center text-slate-400 text-xs">
          No customer orders recorded yet. Completed purchases will be logged here automatically.
        </div>
      ) : (
        <div className="bg-[#0e121e] border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-white/[0.02] text-slate-400 border-b border-white/10 font-mono text-[11px]">
                  <th className="p-4">ORDER ID</th>
                  <th className="p-4">BUYER EMAIL</th>
                  <th className="p-4">PURCHASED ASSETS</th>
                  <th className="p-4">ISSUED LICENSE KEY</th>
                  <th className="p-4">DATE</th>
                  <th className="p-4 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    
                    <td className="p-4 font-mono font-bold text-cyan-400">
                      {order.id}
                    </td>

                    <td className="p-4 font-semibold text-slate-200">
                      {order.email}
                    </td>

                    <td className="p-4">
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-slate-300 font-medium">
                            {item.product?.title || `Product ID: ${item.productId}`}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="p-4 font-mono text-emerald-400 text-[11px] font-bold">
                      {order.licenseKey}
                    </td>

                    <td className="p-4 font-mono text-slate-400 text-[11px]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-4 text-right font-extrabold text-white font-mono text-sm">
                      ${order.totalAmount.toFixed(2)}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
