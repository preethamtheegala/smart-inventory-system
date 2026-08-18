'use client'

import { Customer, Sale } from '@/lib/types'
import { X, Users, Phone, Mail, MapPin, ShoppingBag, Receipt, Calendar } from 'lucide-react'

interface CustomerDetailModalProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
  sales: Sale[]
  onViewReceipt?: (sale: Sale) => void
}

export function CustomerDetailModal({
  isOpen,
  onClose,
  customer,
  sales,
  onViewReceipt,
}: CustomerDetailModalProps) {
  if (!isOpen || !customer) return null

  const customerSales = sales.filter((s) => s.customer === customer.id)
  const totalSpent = customerSales.reduce((sum, s) => sum + Number(s.total), 0)
  const totalItemsPurchased = customerSales.reduce((sum, s) => sum + s.quantity, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-[#0f1422] border border-slate-800 shadow-2xl p-6 relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">{customer.name}</h2>
              <p className="text-xs text-slate-400">
                Customer ID: #{customer.id} • Registered {new Date(customer.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Spent</span>
              <span className="text-xl font-bold text-emerald-400 mt-1 block">
                ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Completed Orders</span>
              <span className="text-xl font-bold text-slate-100 mt-1 block">{customerSales.length} orders</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Items Purchased</span>
              <span className="text-xl font-bold text-purple-400 mt-1 block">{totalItemsPurchased} units</span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs space-y-2">
            <div className="font-semibold text-slate-300">Contact Information</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400">
              <div>Phone: <span className="text-slate-200">{customer.phone || '—'}</span></div>
              <div>Email: <span className="text-slate-200">{customer.email || '—'}</span></div>
              <div className="sm:col-span-2">Address: <span className="text-slate-200">{customer.address || 'No address specified'}</span></div>
            </div>
          </div>

          {/* Order History */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Customer Purchase Ledger ({customerSales.length})
            </h4>

            {customerSales.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs rounded-xl bg-slate-900/40 border border-slate-800/60">
                No orders linked to this customer yet.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto rounded-xl bg-slate-900/50 border border-slate-800 divide-y divide-slate-800/80 text-xs">
                {customerSales.map((s) => (
                  <div key={s.id} className="p-3 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-slate-400">#ORD-{s.id}</span>
                      <span className="text-slate-200 font-semibold ml-2">{s.product_name}</span>
                      <span className="text-slate-400 ml-2">({s.quantity} pcs @ ₹{Number(s.price).toFixed(2)})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-400">₹{Number(s.total).toFixed(2)}</span>
                      {onViewReceipt && (
                        <button
                          onClick={() => onViewReceipt(s)}
                          className="p-1 rounded text-slate-400 hover:text-blue-400 cursor-pointer"
                          title="View Receipt"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-4 border-t border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
