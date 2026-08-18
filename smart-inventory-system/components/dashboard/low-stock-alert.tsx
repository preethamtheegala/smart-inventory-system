'use client'

import { Product } from '@/lib/types'
import { AlertTriangle, ArrowRight, PackageX } from 'lucide-react'

interface LowStockAlertProps {
  products: Product[]
  onViewInventory: () => void
  onEditProduct?: (product: Product) => void
  isOwner?: boolean
}

export function LowStockAlert({
  products,
  onViewInventory,
  onEditProduct,
  isOwner = false
}: LowStockAlertProps) {
  if (!products || products.length === 0) return null

  return (
    <div className="rounded-2xl bg-amber-950/20 border border-amber-500/30 p-6 shadow-lg shadow-amber-950/20">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-amber-200">
              Low Stock Warnings ({products.length} {products.length === 1 ? 'item' : 'items'})
            </h3>
            <p className="text-xs text-amber-400/80 mt-0.5">
              These items are below the safety threshold (&lt; 10 units) and need restocking.
            </p>
          </div>
        </div>

        <button
          onClick={onViewInventory}
          className="text-xs font-semibold text-amber-300 hover:text-amber-100 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all cursor-pointer"
        >
          <span>View All Inventory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {products.slice(0, 6).map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all"
          >
            <div className="overflow-hidden pr-2">
              <div className="text-sm font-semibold text-slate-200 truncate">
                {product.name}
              </div>
              <div className="text-[11px] text-slate-400 capitalize">
                {product.category || 'General'} • ₹{Number(product.price).toFixed(2)}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-xs font-bold px-2 py-1 rounded-md border ${
                  product.quantity === 0
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                {product.quantity === 0 ? 'Out of Stock' : `${product.quantity} left`}
              </span>

              {isOwner && onEditProduct && (
                <button
                  onClick={() => onEditProduct(product)}
                  className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 transition-colors cursor-pointer"
                >
                  Restock
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
