'use client';

import React, { useState } from 'react';
import Sidebar, { UserRole } from '@/components/layout/Sidebar';
import {
  DollarSign,
  Clock,
  AlertTriangle,
  TrendingUp,
  Package,
  FileCheck,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function DashboardPage() {
  const [role, setRole] = useState<UserRole>('admin');

  // Simulated KPI Data based on Role Permissions
  const kpis = [
    {
      title: 'Daily Sales Total',
      value: '$14,850.00',
      change: '+12.4%',
      isPositive: true,
      icon: DollarSign,
      roles: ['admin', 'accountant', 'sales'],
      badge: 'Real-time POS & Orders',
    },
    {
      title: 'Pending Invoices',
      value: '$8,420.00',
      count: '6 Unpaid',
      change: '2 Overdue',
      isPositive: false,
      icon: Clock,
      roles: ['admin', 'accountant'],
      badge: 'Financial Accounting',
    },
    {
      title: 'Low Stock Indicators',
      value: '4 Products',
      count: 'Below Reorder Point',
      change: 'Action Required',
      isPositive: false,
      icon: AlertTriangle,
      roles: ['admin', 'accountant', 'sales'],
      badge: 'Inventory Control',
    },
    {
      title: 'Gross Margin (Admin Only)',
      value: '34.8%',
      change: '+2.1% vs prev month',
      isPositive: true,
      icon: TrendingUp,
      roles: ['admin'],
      badge: 'Sensitive Financials',
    },
  ];

  const visibleKpis = kpis.filter((kpi) => kpi.roles.includes(role));

  const sampleRecentOrders = [
    { id: 'INV-2026-001', customer: 'Acme Corp', amount: '$2,400.00', status: 'Unpaid', date: '2026-01-01' },
    { id: 'INV-2026-002', customer: 'Global Tech', amount: '$5,150.00', status: 'Paid', date: '2026-01-01' },
    { id: 'POS-2026-089', customer: 'Walk-in Cashier', amount: '$180.50', status: 'Completed', date: '2026-01-01' },
    { id: 'QUO-2026-014', customer: 'Apex Logistics', amount: '$3,800.00', status: 'Approved', date: '2026-01-01' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar currentRole={role} onRoleChange={setRole} />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ERP Dashboard Overview</h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back. Viewing tailored metrics for <span className="font-semibold text-[#2563EB] capitalize">{role}</span> role.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-semibold uppercase tracking-wider">
              {role} Mode
            </span>
          </div>
        </div>

        {/* Role Access Notice banner for sales */}
        {role === 'sales' && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-800 text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-semibold">Sales Role Access Restricted:</span> Product buying prices, general ledger accounting metrics, and gross profit margins are hidden in accordance with system RLS policy.
            </div>
          </div>
        )}

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {visibleKpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {kpi.badge}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <p className="text-sm font-medium text-slate-600">{kpi.title}</p>
                <h2 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{kpi.value}</h2>

                <div className="mt-4 flex items-center gap-1 text-xs">
                  {kpi.isPositive ? (
                    <span className="text-emerald-600 font-semibold flex items-center">
                      <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                      {kpi.change}
                    </span>
                  ) : (
                    <span className="text-rose-600 font-semibold flex items-center">
                      <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                      {kpi.change}
                    </span>
                  )}
                  {kpi.count && <span className="text-slate-400 ml-1">• {kpi.count}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Operational Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Operations */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Recent Document Activity</h3>
                <p className="text-xs text-slate-500">Live operational updates across POS, Quotations & Invoices</p>
              </div>
              <button className="text-xs font-semibold text-[#2563EB] hover:underline">View All</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">Reference</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sampleRecentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 font-semibold text-[#2563EB]">{order.id}</td>
                      <td className="py-3.5 text-slate-700 font-medium">{order.customer}</td>
                      <td className="py-3.5 text-slate-900 font-bold">{order.amount}</td>
                      <td className="py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'Paid' || order.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : order.status === 'Unpaid'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right text-slate-400 text-xs">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Watchlist */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-[#2563EB]" />
                <h3 className="text-lg font-bold text-slate-900">Low Stock Watchlist</h3>
              </div>
              <p className="text-xs text-slate-500 mb-6">Inventory reorder threshold warnings</p>

              <div className="space-y-4">
                {[
                  { sku: 'SKU-1002', name: 'Wireless Ergonomic Mouse', stock: 3, reorder: 10, price: '$45.00' },
                  { sku: 'SKU-1005', name: 'USB-C Docking Station', stock: 1, reorder: 5, price: '$120.00' },
                  { sku: 'SKU-1009', name: '4K Monitor 27-inch', stock: 2, reorder: 8, price: '$350.00' },
                ].map((item) => (
                  <div key={item.sku} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.sku} • {item.price}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {item.stock} left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Automated Restock Alert Active</span>
              <FileCheck className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
