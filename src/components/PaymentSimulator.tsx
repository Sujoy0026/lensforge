import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CreditCard, Smartphone, Building, Wallet, X, Check, ShieldCheck } from 'lucide-react';
import { Product } from '../types.js';
import { useTheme } from '../context/ThemeContext.tsx';
import LensForgeLogo from './LensForgeLogo.tsx';

interface PaymentSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  orderId: string;
  onSuccess: (paymentId: string) => void;
}

export default function PaymentSimulator({
  isOpen,
  onClose,
  product,
  orderId,
  onSuccess,
}: PaymentSimulatorProps) {
  const { isDark } = useTheme();
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet' | null>(null);
  const [upiId, setUpiId] = useState('user@upi');
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
      setTimeout(() => {
        const mockPaymentId = 'pay_sim_' + Math.random().toString(36).substr(2, 9);
        onSuccess(mockPaymentId);
        onClose();
        // Reset state
        setIsPaid(false);
        setMethod(null);
      }, 1500);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`relative w-full max-w-md border rounded-xl overflow-hidden shadow-2xl transition-colors duration-200 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#e2e8f0]'
        }`}
      >
        {/* Header */}
        <div className={`border-b p-4 flex items-center justify-between transition-colors duration-200 ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-[#e2e8f0]'
        }`}>
          <div className="flex items-center gap-2">
            <LensForgeLogo size={28} showText={false} isDark={isDark} />
            <div>
              <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>LensForge Marketplace</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400 font-medium' : 'text-slate-400'}`}>Order ID: {orderId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`transition-colors cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-[#0f172a]'}`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Secure Checkout Banner */}
        <div className={`border-b px-4 py-2 text-center transition-colors ${isDark ? 'bg-amber-950/20 border-amber-900/30' : 'bg-amber-50 border-amber-100'}`}>
          <span className={`text-[10px] uppercase tracking-wider font-bold flex items-center justify-center gap-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
            <ShieldCheck size={12} /> Secure Test-Sandbox Simulator
          </span>
        </div>

        {/* Main Content */}
        <div className="p-5">
          {!isPaid ? (
            <>
              {/* Product Info */}
              <div className={`mb-6 flex justify-between items-start p-3 rounded-lg border transition-colors ${
                isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-[#e2e8f0]'
              }`}>
                <div>
                  <h4 className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-[#0f172a]'}`}>{product.name}</h4>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{product.category}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs block font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Amount Due</span>
                  <span className={`text-base font-bold font-mono ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>${product.price.toLocaleString('en-US')}</span>
                </div>
              </div>

              {/* Payment Methods */}
              {!method ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400 font-bold mb-3 uppercase tracking-wider">Select Payment Method</p>
                  
                  <button
                    onClick={() => setMethod('upi')}
                    className={`w-full flex items-center justify-between p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isDark ? 'bg-slate-950 hover:bg-slate-800/40 border-slate-800' : 'bg-white hover:bg-slate-50 border-[#e2e8f0]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="text-indigo-600" size={18} />
                      <div>
                        <p className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-[#0f172a]'}`}>UPI / Instant Transfer</p>
                        <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Google Pay, PhonePe, Paytm, BHIM</p>
                      </div>
                    </div>
                    <span className={`text-xs font-mono font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Popular</span>
                  </button>

                  <button
                    onClick={() => setMethod('card')}
                    className={`w-full flex items-center justify-between p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isDark ? 'bg-slate-950 hover:bg-slate-800/40 border-slate-800' : 'bg-white hover:bg-slate-50 border-[#e2e8f0]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="text-purple-600" size={18} />
                      <div>
                        <p className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-[#0f172a]'}`}>Credit or Debit Card</p>
                        <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Visa, Mastercard, RuPay, Maestro</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setMethod('netbanking')}
                    className={`w-full flex items-center justify-between p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isDark ? 'bg-slate-950 hover:bg-slate-800/40 border-slate-800' : 'bg-white hover:bg-slate-50 border-[#e2e8f0]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Building className="text-emerald-600" size={18} />
                      <div>
                        <p className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-[#0f172a]'}`}>Net Banking</p>
                        <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>All major Indian banks supported</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setMethod('wallet')}
                    className={`w-full flex items-center justify-between p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isDark ? 'bg-slate-950 hover:bg-slate-800/40 border-slate-800' : 'bg-white hover:bg-slate-50 border-[#e2e8f0]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Wallet className="text-amber-600" size={18} />
                      <div>
                        <p className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-[#0f172a]'}`}>Digital Wallets</p>
                        <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Mobikwik, Freecharge, etc.</p>
                      </div>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Method Header */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-500 capitalize font-bold">{method} payment details</span>
                    <button
                      onClick={() => setMethod(null)}
                      className="text-xs text-indigo-600 hover:underline cursor-pointer font-bold"
                    >
                      Change Method
                    </button>
                  </div>

                  {/* Form fields based on method */}
                  {method === 'upi' && (
                    <div className="space-y-2">
                      <label className={`text-xs font-medium block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>UPI ID / Virtual Private Address</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg font-mono text-sm focus:outline-none focus:border-indigo-500 transition-colors ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-[#e2e8f0] text-[#0f172a]'
                        }`}
                      />
                      <p className="text-[10px] text-slate-400">A payment request will be sent to this UPI address.</p>
                    </div>
                  )}

                  {method === 'card' && (
                    <div className="space-y-3">
                      <div>
                        <label className={`text-xs font-medium block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg font-mono text-sm focus:outline-none focus:border-indigo-500 transition-colors ${
                            isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-[#e2e8f0] text-[#0f172a]'
                          }`}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={`text-xs font-medium block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Expiry (MM/YY)</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg font-mono text-sm focus:outline-none focus:border-indigo-500 transition-colors ${
                              isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-700' : 'bg-white border-[#e2e8f0] text-[#0f172a] placeholder-slate-400'
                            }`}
                            placeholder="12/28"
                          />
                        </div>
                        <div>
                          <label className={`text-xs font-medium block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>CVV</label>
                          <input
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg font-mono text-sm focus:outline-none focus:border-indigo-500 transition-colors ${
                              isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-700' : 'bg-white border-[#e2e8f0] text-[#0f172a] placeholder-slate-400'
                            }`}
                            placeholder="***"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {method === 'netbanking' && (
                    <div className="space-y-2">
                      <label className={`text-xs font-medium block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Select Popular Bank</label>
                      <select className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-colors ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-[#e2e8f0] text-[#0f172a]'
                      }`}>
                        <option>State Bank of India (SBI)</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                        <option>Kotak Mahindra Bank</option>
                      </select>
                    </div>
                  )}

                  {method === 'wallet' && (
                    <div className="space-y-2">
                      <label className={`text-xs font-medium block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Select Wallet Provider</label>
                      <select className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-colors ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-[#e2e8f0] text-[#0f172a]'
                      }`}>
                        <option>Mobikwik Wallet</option>
                        <option>PhonePe Wallet</option>
                        <option>Freecharge Wallet</option>
                        <option>JioMoney Wallet</option>
                      </select>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handlePay}
                    disabled={isProcessing}
                    className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/10 cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Securing transaction...
                      </>
                    ) : (
                      `Pay $${product.price.toLocaleString('en-US')}`
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border ${
                  isDark ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                }`}
              >
                <Check size={32} className="stroke-[3]" />
              </motion.div>
              <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#0f172a]'}`}>Payment Authorized</h4>
              <p className={`text-sm mt-2 max-w-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Your payment was processed successfully. Redirecting you back to LensForge...
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className={`border-t px-5 py-3 flex items-center justify-between text-[10px] font-mono transition-colors duration-200 ${
          isDark ? 'bg-slate-950 border-slate-800 text-slate-500' : 'bg-slate-50 border-[#e2e8f0] text-slate-400'
        }`}>
          <span>PCI-DSS COMPLIANT</span>
          <span>100% SECURE ENCRYPTION</span>
        </div>
      </motion.div>
    </div>
  );
}
