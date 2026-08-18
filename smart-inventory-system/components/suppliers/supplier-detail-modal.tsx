'use client'

import { Supplier, Purchase, Product } from '@/lib/types'
import { X, Truck, Building2, Phone, Mail, FileText, Package, ShoppingBag, ArrowRight } from 'lucide-react'

interface SupplierDetailModalProps {
  isOpen: boolean
  onClose: () => void
  supplier: Supplier | null
  purchases: Purchase[]
  products: Product[]
  onNewPurchase?: (supplier: Supplier) => void
}

export function SupplierDetailModal({
  isOpen,
  onClose,
  supplier,
  purchases,
  products,
  onNewPurchase,
}: SupplierDetailModalProps) {
  if (!isOpen || !supplier) return null

  const supplierPurchases = purchases.filter((p) => p.supplier === supplier.id)
  const supplierProducts = products.filter((p) => p.supplier === supplier.id)
  const totalSpend = supplierPurchases.reduce((sum, p) => sum + Number(p.total_cost), 0)
  const totalUnitsPurchased = supplierPurchases.reduce((sum, p) => sum + p.quantity, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-[#0f1422] border border-slate-800 shadow-2xl p-6 relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">{supplier.name}</h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    supplier.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {supplier.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {supplier.company_name || 'Individual Supplier'} • GST: {supplier.tax_id || 'N/A'}
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Spend</span>
              <span className="text-base font-bold text-amber-400 mt-1 block">
                ₹{totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Purchase Orders</span>
              <span className="text-base font-bold text-slate-100 mt-1 block">{supplierPurchases.length} POs</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Units Inbound</span>
              <span className="text-base font-bold text-blue-400 mt-1 block">{totalUnitsPurchased} units</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Products Linked</span>
              <span className="text-base font-bold text-purple-400 mt-1 block">{supplierProducts.length} items</span>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs">
            <div className="font-semibold text-slate-300 mb-1">Vendor Contact & Logistics</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400">
              <div>Phone: <span className="text-slate-200">{supplier.phone || 'Not provided'}</span></div>
              <div>Email: <span className="text-slate-200">{supplier.email || 'Not provided'}</span></div>
              <div className="sm:col-span-2">Address: <span className="text-slate-200">{supplier.address || 'No address on file'}</span></div>
            </div>
          </div>

          {/* Inbound Purchase History */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Procurement Purchase History ({supplierPurchases.length})
              </h4>
            </div>

            {supplierPurchases.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs rounded-xl bg-slate-900/40 border border-slate-800/60">
                No purchase stock-in orders recorded from this vendor yet.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto rounded-xl bg-slate-900/50 border border-slate-800 divide-y divide-slate-800/80 text-xs">
                {supplierPurchases.map((po) => (
                  <div key={po.id} className="p-3 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-slate-400">PO #{po.id}</span>
                      <span className="text-slate-200 font-semibold ml-2">{po.product_name}</span>
                      <span className="text-slate-400 ml-2">({po.quantity} pcs @ ₹{Number(po.cost_price).toFixed(2)})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">{new Date(po.purchase_date || po.created_at).toLocaleDateString()}</span>
                      <span className="font-bold text-amber-400">₹{Number(po.total_cost).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-4 shrink-0">
          <div className="text-[11px] text-slate-500">
            Partner since {new Date(supplier.created_at || Date.now()).toLocaleDateString()}
          </div>

          <div className="flex items-center gap-2">
            {onNewPurchase && (
              <button
                onClick={() => {
                  onClose()
                  onNewPurchase(supplier)
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                + Create PO for Supplier
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
