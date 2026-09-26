'use client';

import React, { useState } from 'react';
import Sidebar, { UserRole } from '@/components/layout/Sidebar';
import {
  Plus,
  Trash2,
  Printer,
  Receipt,
  Truck,
  Send,
  MessageSquare,
  CheckCircle2,
  X,
  Phone
} from 'lucide-react';

interface LineItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface Quotation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  items: LineItem[];
  totalAmount: number;
  createdAt: string;
  linkedInvoiceId?: string;
  linkedDeliverySlipId?: string;
}

const sampleCatalog = [
  { id: '1', name: 'Enterprise Server Rack 42U', price: 1200.00 },
  { id: '2', name: 'Gigabit Switch 48-Port Managed', price: 650.00 },
  { id: '3', name: 'Fiber Optic Patch Cable 10m', price: 25.00 },
  { id: '4', name: 'Uninterruptible Power Supply 3kVA', price: 850.00 },
];

export default function QuotationsPage() {
  const [role, setRole] = useState<UserRole>('sales');

  // Quotation state list
  const [quotations, setQuotations] = useState<Quotation[]>([
    {
      id: 'QUO-2026-001',
      customerName: 'Acme Corporation',
      customerPhone: '+1234567890',
      customerEmail: 'procurement@acme.com',
      status: 'draft',
      items: [
        { id: 'item-1', productId: '1', productName: 'Enterprise Server Rack 42U', quantity: 1, unitPrice: 1200.00 },
        { id: 'item-2', productId: '2', productName: 'Gigabit Switch 48-Port Managed', quantity: 2, unitPrice: 650.00 },
      ],
      totalAmount: 2500.00,
      createdAt: '2026-01-01',
    },
  ]);

  const [activeQuotation, setActiveQuotation] = useState<Quotation | null>(quotations[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dispatchChannel, setDispatchChannel] = useState<'whatsapp' | 'sms' | null>(null);

  // New Quotation Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  const handleAddLineItem = () => {
    const defaultProduct = sampleCatalog[0];
    setLineItems((prev) => [
      ...prev,
      {
        id: `line-${Date.now()}-${Math.random()}`,
        productId: defaultProduct.id,
        productName: defaultProduct.name,
        quantity: 1,
        unitPrice: defaultProduct.price,
      },
    ]);
  };

  const updateLineItem = (id: string, field: keyof LineItem, val: string | number) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (field === 'productId') {
            const strVal = String(val);
            const prod = sampleCatalog.find((p) => p.id === strVal);
            return {
              ...item,
              productId: strVal,
              productName: prod ? prod.name : item.productName,
              unitPrice: prod ? prod.price : item.unitPrice,
            };
          }
          return { ...item, [field]: val };
        }
        return item;
      })
    );
  };

  const removeLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((i) => i.id !== id));
  };

  const createQuotation = () => {
    if (!customerName) return;
    const total = lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const newQuo: Quotation = {
      id: `QUO-2026-0${quotations.length + 1}`,
      customerName,
      customerPhone,
      customerEmail,
      status: 'draft',
      items: lineItems,
      totalAmount: total,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setQuotations([newQuo, ...quotations]);
    setActiveQuotation(newQuo);
    setIsModalOpen(false);
    // Reset Form
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setLineItems([]);
  };

  // Workflow Pipeline Actions: Generate Invoice
  const generateInvoice = (quoId: string) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === quoId) {
          const invId = `INV-${q.id.replace('QUO-', '')}`;
          return {
            ...q,
            status: 'approved',
            linkedInvoiceId: invId,
          };
        }
        return q;
      })
    );
    if (activeQuotation && activeQuotation.id === quoId) {
      setActiveQuotation((prev) =>
        prev ? { ...prev, status: 'approved', linkedInvoiceId: `INV-${quoId.replace('QUO-', '')}` } : null
      );
    }
  };

  // Workflow Pipeline Actions: Generate Delivery Slip
  const generateDeliverySlip = (quoId: string) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === quoId) {
          const delId = `DEL-${q.id.replace('QUO-', '')}`;
          return {
            ...q,
            linkedDeliverySlipId: delId,
          };
        }
        return q;
      })
    );
    if (activeQuotation && activeQuotation.id === quoId) {
      setActiveQuotation((prev) =>
        prev ? { ...prev, linkedDeliverySlipId: `DEL-${quoId.replace('QUO-', '')}` } : null
      );
    }
  };

  // Dispatch Notification Handler
  const handleDispatch = async (channel: 'whatsapp' | 'sms') => {
    setDispatchChannel(channel);
    try {
      const response = await fetch('/api/send-document-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerPhone: activeQuotation?.customerPhone || '+1234567890',
          documentType: 'quote',
          documentId: activeQuotation?.id,
          channel,
        }),
      });
      if (response.ok) {
        setTimeout(() => {
          setDispatchChannel(null);
        }, 3000);
      }
    } catch {
      setTimeout(() => {
        setDispatchChannel(null);
      }, 3000);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar currentRole={role} onRoleChange={setRole} />

      <main className="flex-1 flex flex-col lg:flex-row h-screen overflow-hidden">
        {/* Left Column: Quotations Master List */}
        <div className="w-full lg:w-80 bg-white border-r border-slate-200 flex flex-col justify-between">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h1 className="font-bold text-lg text-slate-900">Quotations</h1>
              <p className="text-xs text-slate-500">Sales Quotes & Pipeline</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {quotations.map((q) => {
              const isSelected = activeQuotation?.id === q.id;
              return (
                <div
                  key={q.id}
                  onClick={() => setActiveQuotation(q)}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected ? 'bg-blue-50/70 border-l-4 border-[#2563EB]' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#2563EB]">{q.id}</span>
                    <span className="text-[10px] text-slate-400">{q.createdAt}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 line-clamp-1">{q.customerName}</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-extrabold text-slate-900">${q.totalAmount.toFixed(2)}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        q.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {q.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Quotation Document Builder & Preview */}
        <div className="flex-1 p-8 overflow-y-auto flex flex-col justify-between">
          {activeQuotation ? (
            <div className="max-w-3xl mx-auto w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              {/* Document Actions Bar */}
              <div className="flex flex-wrap items-center justify-between pb-6 border-b border-slate-200 gap-4">
                <div>
                  <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
                    Commercial Quotation
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 mt-0.5">{activeQuotation.id}</h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleDispatch('whatsapp')}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => handleDispatch('sms')}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>SMS</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Document Header Metadata */}
              <div className="grid grid-cols-2 gap-6 my-6 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <p className="font-semibold text-slate-400 uppercase tracking-wider mb-1">Customer Information</p>
                  <p className="font-bold text-slate-900 text-sm">{activeQuotation.customerName}</p>
                  <p className="flex items-center gap-1 mt-1 text-slate-600">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {activeQuotation.customerPhone}
                  </p>
                  <p className="text-slate-500">{activeQuotation.customerEmail}</p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-slate-400 uppercase tracking-wider mb-1">Document Details</p>
                  <p><span className="font-semibold text-slate-700">Date:</span> {activeQuotation.createdAt}</p>
                  <p><span className="font-semibold text-slate-700">Status:</span> <span className="uppercase font-bold text-[#2563EB]">{activeQuotation.status}</span></p>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="my-6">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3">Product Description</th>
                      <th className="pb-3 text-center">Qty</th>
                      <th className="pb-3 text-right">Unit Price</th>
                      <th className="pb-3 text-right">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeQuotation.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3 font-medium text-slate-800">{item.productName}</td>
                        <td className="py-3 text-center font-bold text-slate-700">{item.quantity}</td>
                        <td className="py-3 text-right text-slate-600">${item.unitPrice.toFixed(2)}</td>
                        <td className="py-3 text-right font-bold text-slate-900">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary & Conversion Pipeline Buttons */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Generate Invoice Action */}
                  {!activeQuotation.linkedInvoiceId ? (
                    <button
                      onClick={() => generateInvoice(activeQuotation.id)}
                      className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>Generate Invoice</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Invoice Linked: {activeQuotation.linkedInvoiceId}</span>
                    </span>
                  )}

                  {/* Generate Delivery Slip Action */}
                  {!activeQuotation.linkedDeliverySlipId ? (
                    <button
                      onClick={() => generateDeliverySlip(activeQuotation.id)}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Generate Delivery Slip</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Delivery Slip Linked: {activeQuotation.linkedDeliverySlipId}</span>
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 font-semibold block">Grand Total</span>
                  <span className="text-2xl font-black text-slate-900">
                    ${activeQuotation.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <p>Select a quotation from the sidebar or click + to create one.</p>
            </div>
          )}
        </div>
      </main>

      {/* New Quotation Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 mb-1">Create Commercial Quotation</h2>
            <p className="text-xs text-slate-500 mb-6">Build a sales quotation and select line items</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Logistics Ltd"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1234567890"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="sales@apex.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              {/* Line items section */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Document Line Items</h3>
                  <button
                    onClick={handleAddLineItem}
                    className="text-xs text-[#2563EB] font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {lineItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                      <select
                        value={item.productId}
                        onChange={(e) => updateLineItem(item.id, 'productId', e.target.value)}
                        className="flex-1 p-2 text-xs bg-white border border-slate-200 rounded-lg"
                      >
                        {sampleCatalog.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name} (${cat.price.toFixed(2)})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-16 p-2 text-xs bg-white border border-slate-200 rounded-lg text-center"
                      />

                      <span className="text-xs font-bold text-slate-800 w-20 text-right">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </span>

                      <button
                        onClick={() => removeLineItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={createQuotation}
                className="w-full py-3 rounded-xl bg-[#2563EB] text-white font-bold text-sm shadow-md hover:bg-blue-700 transition-all mt-4"
              >
                Save & Preview Quotation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Success Alert Overlay */}
      {dispatchChannel && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 text-xs z-50">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold">Dispatch Notification Sent!</p>
            <p className="text-slate-400">Sent document link via <span className="uppercase text-emerald-400">{dispatchChannel}</span> to {activeQuotation?.customerPhone || '+1234567890'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
