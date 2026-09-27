'use client';

import React, { useState } from 'react';
import Sidebar, { UserRole } from '@/components/layout/Sidebar';
import {
  Calculator,
  CheckCircle2,
  Clock,
  Building2,
  Smartphone,
  CreditCard,
  Banknote,
  Search,
  X,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';

interface Invoice {
  id: string;
  customer_name: string;
  subtotal: number;
  tax: number;
  total_amount: number;
  status: 'unpaid' | 'partially_paid' | 'paid' | 'overdue';
  created_at: string;
}

const formatKES = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
  }).format(amount).replace('KES', 'KSh');
};

export default function AccountingPage() {
  const [role, setRole] = useState<UserRole>('accountant');
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'INV-2026-001',
      customer_name: 'Acme Corporation Kenya',
      subtotal: 200000.00,
      tax: 32000.00,
      total_amount: 232000.00,
      status: 'unpaid',
      created_at: '2026-01-01',
    },
    {
      id: 'INV-2026-002',
      customer_name: 'Safaricom Tech Hub',
      subtotal: 450000.00,
      tax: 72000.00,
      total_amount: 522000.00,
      status: 'paid',
      created_at: '2026-01-01',
    },
    {
      id: 'INV-2026-003',
      customer_name: 'Equity Holdings Ltd',
      subtotal: 120000.00,
      tax: 19200.00,
      total_amount: 139200.00,
      status: 'partially_paid',
      created_at: '2026-01-01',
    },
    {
      id: 'INV-2026-004',
      customer_name: 'Nairobi Logistics Enterprise',
      subtotal: 85000.00,
      tax: 13600.00,
      total_amount: 98600.00,
      status: 'overdue',
      created_at: '2025-12-15',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'cash' | 'bank' | 'card'>('mpesa');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);

  const totalReceivables = invoices
    .filter((inv) => inv.status === 'unpaid' || inv.status === 'overdue' || inv.status === 'partially_paid')
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  const totalCollected = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  const handleOpenPaymentModal = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPaymentAmount(inv.total_amount.toString());
    setReferenceNumber(`MPESA-${Math.floor(100000 + Math.random() * 900000)}`);
    setIsSuccess(false);
  };

  const processPayment = () => {
    if (!selectedInvoice) return;
    const paidAmt = parseFloat(paymentAmount) || selectedInvoice.total_amount;

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === selectedInvoice.id) {
          const newStatus = paidAmt >= inv.total_amount ? 'paid' : 'partially_paid';
          return { ...inv, status: newStatus };
        }
        return inv;
      })
    );
    setIsSuccess(true);
    setTimeout(() => {
      setSelectedInvoice(null);
      setIsSuccess(false);
    }, 2000);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isAccessAllowed = role === 'admin' || role === 'accountant';

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar currentRole={role} onRoleChange={setRole} />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="w-6 h-6 text-[#2563EB]" />
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Accounting Ledger & Invoices</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Double-entry bookkeeping, KES receivables tracking, and M-Pesa debt clearing
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-semibold uppercase tracking-wider">
            Currency: KES (KSh)
          </span>
        </div>

        {!isAccessAllowed ? (
          <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-4 text-rose-800">
            <ShieldAlert className="w-8 h-8 text-rose-600 shrink-0" />
            <div>
              <h3 className="font-bold text-lg">Access Restricted</h3>
              <p className="text-sm text-rose-700 mt-1">
                The Accounting module is strictly restricted to Admin and Accountant roles in accordance with system security policies.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* KPI Cards in KES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Receivables</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">{formatKES(totalReceivables)}</h2>
                <div className="mt-3 flex items-center gap-1 text-xs text-amber-600 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{invoices.filter((i) => i.status !== 'paid').length} Pending Payments</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cleared Revenue</span>
                <h2 className="text-2xl font-black text-emerald-600 mt-1">{formatKES(totalCollected)}</h2>
                <div className="mt-3 flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Settled Invoices</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">M-Pesa / Bank Ratio</span>
                <h2 className="text-2xl font-black text-[#2563EB] mt-1">78.4% M-Pesa</h2>
                <div className="mt-3 flex items-center gap-1 text-xs text-slate-500">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mobile Money primary clearing channel</span>
                </div>
              </div>
            </div>

            {/* Invoices Table & Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Operational Sales Invoices</h3>
                  <p className="text-xs text-slate-500">Real-time ledger entries formatted in KES</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search Invoice or Customer..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="p-2 text-xs bg-white border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="all">All Statuses</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3">Invoice Ref</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3 text-right">Subtotal</th>
                      <th className="pb-3 text-right">Tax (16%)</th>
                      <th className="pb-3 text-right">Total Amount (KES)</th>
                      <th className="pb-3 text-center">Status</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 font-bold text-[#2563EB]">{inv.id}</td>
                        <td className="py-3.5 font-semibold text-slate-800">{inv.customer_name}</td>
                        <td className="py-3.5 text-right text-slate-600">{formatKES(inv.subtotal)}</td>
                        <td className="py-3.5 text-right text-slate-500">{formatKES(inv.tax)}</td>
                        <td className="py-3.5 text-right font-black text-slate-900">{formatKES(inv.total_amount)}</td>
                        <td className="py-3.5 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                              inv.status === 'paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : inv.status === 'unpaid'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : inv.status === 'overdue'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          {inv.status !== 'paid' && (
                            <button
                              onClick={() => handleOpenPaymentModal(inv)}
                              className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
                            >
                              Clear Debt
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Debt Clearing Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {!isSuccess ? (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Clear Invoice Debt</h2>
                <p className="text-xs text-slate-500 mb-4">
                  Invoice: <span className="font-bold text-[#2563EB]">{selectedInvoice.id}</span> • Customer: {selectedInvoice.customer_name}
                </p>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4">
                  <span className="text-xs text-slate-500 block">Total Due (KES)</span>
                  <span className="text-2xl font-black text-slate-900">{formatKES(selectedInvoice.total_amount)}</span>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { key: 'mpesa' as const, label: 'M-Pesa', icon: Smartphone },
                    { key: 'cash' as const, label: 'Cash', icon: Banknote },
                    { key: 'bank' as const, label: 'Bank', icon: Building2 },
                    { key: 'card' as const, label: 'Card', icon: CreditCard },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.key}
                        onClick={() => setPaymentMethod(m.key)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          paymentMethod === m.key
                            ? 'border-[#2563EB] bg-blue-50/60 text-[#2563EB] font-bold'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px]">{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-3 mb-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Reference (M-Pesa / Ref #)</label>
                    <input
                      type="text"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>
                </div>

                <button
                  onClick={processPayment}
                  className="w-full py-3 rounded-xl bg-[#2563EB] text-white font-bold text-sm shadow-md hover:bg-blue-700 transition-all"
                >
                  Record Payment & Clear Debt
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-slate-900">Payment Processed!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Posted balanced ledger entries and cleared debt for {selectedInvoice.id}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
