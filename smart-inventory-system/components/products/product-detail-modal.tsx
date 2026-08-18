'use client'

import { Product, Sale } from '@/lib/types'
import { X, Box, Tag, DollarSign, Package, Calendar, TrendingUp, SlidersHorizontal, Truck, Clock } from 'lucide-react'

interface ProductDetailModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  sales: Sale[]
  onEdit?: (product: Product) => void
  onAdjustStock?: (product: Product) => void
  isOwner?: boolean
}

export function ProductDetailModal({
  isOpen,
  onClose,
  product,
  sales,
  onEdit,
  onAdjustStock,
  isOwner = false,
}: ProductDetailModalProps) {
  if (!isOpen || !product) return null

  // Calculate statistics for this product
  const productSales = sales.filter((s) => s.product === product.id)
  const totalUnitsSold = productSales.reduce((sum, s) => sum + s.quantity, 0)
  const totalRevenue = productSales.reduce((sum, s) => sum + Number(s.total), 0)
  const stockValuation = Number(product.price) * product.quantity
  const threshold = Number(product.min_stock_threshold || 10)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-[#0f1422] border border-slate-800 shadow-2xl p-6 relative max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                {product.name}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                SKU: {product.sku || `#${product.id}`} • Category: {product.category || 'General'}
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
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Selling Price
              </span>
              <span className="text-base font-bold text-slate-100 mt-1 block">
                ₹{Number(product.price).toFixed(2)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Cost Price
              </span>
              <span className="text-base font-bold text-slate-300 mt-1 block">
                ₹{Number(product.cost_price || 0).toFixed(2)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Stock Level
              </span>
              <span
                className={`text-base font-bold mt-1 block ${
                  product.quantity === 0
                    ? 'text-rose-400'
                    : product.quantity < threshold
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {product.quantity} units
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Retail Value
              </span>
              <span className="text-base font-bold text-purple-400 mt-1 block">
                ₹{stockValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Supplier & Min Threshold details */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <span className="text-slate-400">Assigned Supplier: </span>
              <strong className="text-slate-200">{product.supplier_name || 'None'}</strong>
            </div>
            <div>
              <span className="text-slate-400">Min Alert Threshold: </span>
              <strong className="text-amber-400">{threshold} units</strong>
            </div>
          </div>

          {/* Product Batches if any */}
          {product.batches && product.batches.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Tracked Batches ({product.batches.length})
              </h4>
              <div className="space-y-1.5">
                {product.batches.map((b) => (
                  <div key={b.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-semibold text-slate-200">Batch {b.batch_number}</span>
                      <span className="text-slate-400 ml-2">Qty: {b.quantity} pcs</span>
                    </div>
                    <div>
                      {b.expiry_date ? (
                        <span className={`text-[11px] font-semibold ${b.is_expired ? 'text-rose-400' : b.is_expiring_soon ? 'text-amber-400' : 'text-slate-400'}`}>
                          Exp: {b.expiry_date}
                        </span>
                      ) : (
                        <span className="text-slate-500">No Expiry</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sales Activity */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Sales History ({productSales.length} orders)
            </h4>
            {productSales.length === 0 ? (
              <div className="py-5 text-center text-slate-500 text-xs rounded-xl bg-slate-900/40 border border-slate-800/60">
                No sales orders recorded yet for this item.
              </div>
            ) : (
              <div className="max-h-36 overflow-y-auto rounded-xl bg-slate-900/50 border border-slate-800 divide-y divide-slate-800/80 text-xs">
                {productSales.map((sale) => (
                  <div key={sale.id} className="p-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-slate-400">Order #{sale.id}</span>
                      <span className="text-slate-500 ml-2">
                        {new Date(sale.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-300">{sale.quantity} units</span>
                      <span className="font-semibold text-emerald-400">
                        ₹{Number(sale.total).toFixed(2)}
                      </span>
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
            Added on {new Date(product.created_at || Date.now()).toLocaleDateString()}
          </div>

          <div className="flex items-center gap-2">
            {isOwner && onAdjustStock && (
              <button
                onClick={() => {
                  onClose()
                  onAdjustStock(product)
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Adjust Stock
              </button>
            )}

            {isOwner && onEdit && (
              <button
                onClick={() => {
                  onClose()
                  onEdit(product)
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Edit Specs
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
