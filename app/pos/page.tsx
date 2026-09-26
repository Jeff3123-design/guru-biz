'use client';

import React, { useState } from 'react';
import Sidebar, { UserRole } from '@/components/layout/Sidebar';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  X,
  Receipt
} from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  selling_price: number;
  stock_quantity: number;
}

interface CartItem extends Product {
  quantity: number;
}

const initialProducts: Product[] = [
  { id: '1', sku: 'SKU-1001', name: 'Mechanical Keyboard RGB', category: 'Peripherals', selling_price: 89.99, stock_quantity: 24 },
  { id: '2', sku: 'SKU-1002', name: 'Wireless Ergonomic Mouse', category: 'Peripherals', selling_price: 45.00, stock_quantity: 3 },
  { id: '3', sku: 'SKU-1003', name: 'UltraWide Monitor 34"', category: 'Displays', selling_price: 499.99, stock_quantity: 12 },
  { id: '4', sku: 'SKU-1004', name: 'Noise-Canceling Headset', category: 'Audio', selling_price: 129.50, stock_quantity: 18 },
  { id: '5', sku: 'SKU-1005', name: 'USB-C Docking Station', category: 'Accessories', selling_price: 120.00, stock_quantity: 1 },
  { id: '6', sku: 'SKU-1006', name: 'HD Webcam 1080p', category: 'Video', selling_price: 65.00, stock_quantity: 15 },
];

export default function POSPage() {
  const [role, setRole] = useState<UserRole>('sales');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile' | 'split'>('cash');
  const [cashAmount, setCashAmount] = useState<string>('');
  const [cardAmount, setCardAmount] = useState<string>('');
  const [mobileAmount, setMobileAmount] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState<string>('');

  const categories = ['All', ...Array.from(new Set(initialProducts.map((p) => p.category)))];

  const filteredProducts = initialProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.selling_price * item.quantity, 0);
  const tax = subtotal * 0.08; // 8% Tax
  const grandTotal = subtotal + tax;

  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setCashAmount(grandTotal.toFixed(2));
    setCardAmount('0.00');
    setMobileAmount('0.00');
    setIsCheckoutOpen(true);
  };

  const processPayment = () => {
    const genReceipt = `POS-${Math.floor(100000 + Math.random() * 900000)}`;
    setReceiptNumber(genReceipt);
    setIsCompleted(true);
  };

  const resetCart = () => {
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCompleted(false);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar currentRole={role} onRoleChange={setRole} />

      <main className="flex-1 flex flex-col lg:flex-row h-screen overflow-hidden">
        {/* Left Column: Product Selection Grid */}
        <div className="flex-1 p-6 flex flex-col overflow-y-auto">
          {/* Header & Search */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Point of Sale (POS)</h1>
            <p className="text-xs text-slate-500 mt-1">Fast checkout checkout terminal for retail operations</p>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products by SKU or Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-[#2563EB] text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-[#2563EB] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded uppercase">
                      {product.sku}
                    </span>
                    <span className={`text-[11px] font-semibold ${product.stock_quantity <= 5 ? 'text-rose-600' : 'text-slate-400'}`}>
                      {product.stock_quantity} in stock
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 group-hover:text-[#2563EB] line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{product.category}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-base font-extrabold text-slate-900">
                    ${product.selling_price.toFixed(2)}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white flex items-center justify-center transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Order Cart */}
        <div className="w-full lg:w-96 bg-white border-l border-slate-200 flex flex-col justify-between shadow-xl">
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#2563EB]" />
                <h2 className="font-bold text-lg text-slate-900">Current Order</h2>
              </div>
              <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full text-slate-600 font-semibold">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
              </span>
            </div>

            {/* Cart Item List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">Cart is empty</p>
                  <p className="text-xs text-slate-400">Click products to add to current order</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                  >
                    <div className="flex-1 pr-2">
                      <p className="text-sm font-semibold text-slate-800 line-clamp-1">{item.name}</p>
                      <p className="text-xs font-bold text-[#2563EB]">
                        ${item.selling_price.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-white border border-slate-200 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:bg-slate-100 rounded-l-lg text-slate-600"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:bg-slate-100 rounded-r-lg text-slate-600"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cart Summary & Checkout Trigger */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span className="font-semibold text-slate-800">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total</span>
                <span className="text-[#2563EB]">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleOpenCheckout}
              disabled={cart.length === 0}
              className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <CreditCard className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Split Payment Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {!isCompleted ? (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Split Payment Checkout</h2>
                <p className="text-xs text-slate-500 mb-6">Total due: <span className="font-bold text-[#2563EB] text-sm">${grandTotal.toFixed(2)}</span></p>

                {/* Method selector */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {[
                      { key: 'cash' as const, label: 'Cash', icon: Banknote },
                      { key: 'card' as const, label: 'Card', icon: CreditCard },
                      { key: 'mobile' as const, label: 'Mobile', icon: Smartphone },
                      { key: 'split' as const, label: 'Split', icon: Receipt },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.key}
                          onClick={() => setPaymentMethod(m.key)}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                          paymentMethod === m.key
                            ? 'border-[#2563EB] bg-blue-50/50 text-[#2563EB] font-bold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs">{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Split / Amount Details */}
                <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {paymentMethod === 'split' ? (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Cash Portion ($)</label>
                        <input
                          type="number"
                          value={cashAmount}
                          onChange={(e) => setCashAmount(e.target.value)}
                          className="w-full p-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Card Portion ($)</label>
                        <input
                          type="number"
                          value={cardAmount}
                          onChange={(e) => setCardAmount(e.target.value)}
                          className="w-full p-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile Money Portion ($)</label>
                        <input
                          type="number"
                          value={mobileAmount}
                          onChange={(e) => setMobileAmount(e.target.value)}
                          className="w-full p-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-slate-700 flex justify-between items-center">
                      <span>Payment Method:</span>
                      <span className="font-bold capitalize text-[#2563EB]">{paymentMethod}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={processPayment}
                  className="w-full py-3 rounded-xl bg-[#2563EB] text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all"
                >
                  Confirm & Generate Receipt
                </button>
              </div>
            ) : (
              /* Success Receipt Confirmation */
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Payment Successful!</h3>
                <p className="text-xs text-slate-500 mt-1">Receipt Ref: <span className="font-mono font-bold text-slate-800">{receiptNumber}</span></p>

                <div className="my-6 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-left text-xs space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-800 pb-2 border-b border-slate-200">
                    <span>Receipt summary</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-slate-600">
                      <span>{item.quantity}x {item.name}</span>
                      <span>${(item.selling_price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-slate-900 text-sm">
                    <span>Total Paid</span>
                    <span className="text-[#2563EB]">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={resetCart}
                  className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all"
                >
                  New Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
