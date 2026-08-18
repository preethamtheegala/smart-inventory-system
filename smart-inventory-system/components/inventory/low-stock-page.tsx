'use client'

import { useState, useMemo } from 'react'
import { Product } from '@/lib/types'
import {
  AlertTriangle,
  XCircle,
  PackagePlus,
  SlidersHorizontal,
  Search,
  ArrowRight,
  ShieldAlert,
  Boxes,
  Eye
} from 'lucide-react'

interface LowStockPageProps {
  products: Product[]
  isOwner: boolean
  onOpenPurchaseModal?: () => void
  onOpenAdjustModal: (product: Product) => void
  onViewProduct: (product: Product) => void
}

export function LowStockPage({
  products,
  isOwner,
  onOpenPurchaseModal,
  onAdjustStock,
  onViewProduct,
}: {
  products: Product[]
  isOwner: boolean
  onOpenPurchaseModal?: () => void
  onAdjustStock: (product: Product) => void
  onViewProduct: (product: Product) => void
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'LOW'>('ALL')

  // Identify low stock items based on configurable per-product threshold
  const lowStockItems = useMemo(() => {
    return products.filter((p) => {
      const isUnderThreshold = Number(p.quantity) < Number(p.min_stock_threshold || 10)
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())

      if (!isUnderThreshold || !matchesSearch) return false

      const qty = Number(p.quantity)
      if (urgencyFilter === 'CRITICAL') return qty <= 0
      if (urgencyFilter === 'HIGH') return qty > 0 && qty <= 5
      if (urgencyFilter === 'LOW') return qty > 5 && qty < Number(p.min_stock_threshold || 10)
      return true
    })
  }, [products, searchTerm, urgencyFilter])

  const criticalCount = products.filter((p) => Number(p.quantity) <= 0).length
  const highCount = products.filter((p) => Number(p.quantity) > 0 && Number(p.quantity) <= 5).length
  const lowCount = products.filter((p) => Number(p.quantity) > 5 && Number(p.quantity) < Number(p.min_stock_threshold || 10)).length

  return (
    <div className="space-y-6">
      {/* Urgency KPI Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Critical */}
        <div
          onClick={() => setUrgencyFilter(urgencyFilter === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            urgencyFilter === 'CRITICAL'
              ? 'bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-950/30'
              : 'bg-[#0f1422]/90 border-slate-800 hover:border-rose-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
              Critical (0 Units)
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">
            {criticalCount} <span className="text-xs font-normal text-slate-400">items out of stock</span>
          </div>
        </div>

        {/* High Urgency */}
        <div
          onClick={() => setUrgencyFilter(urgencyFilter === 'HIGH' ? 'ALL' : 'HIGH')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            urgencyFilter === 'HIGH'
              ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-950/30'
              : 'bg-[#0f1422]/90 border-slate-800 hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              High Urgency (1–5 Units)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">
            {highCount} <span className="text-xs font-normal text-slate-400">items running very low</span>
          </div>
        </div>

        {/* Low Urgency */}
        <div
          onClick={() => setUrgencyFilter(urgencyFilter === 'LOW' ? 'ALL' : 'LOW')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            urgencyFilter === 'LOW'
              ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-950/30'
              : 'bg-[#0f1422]/90 border-slate-800 hover:border-blue-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Threshold Warning (6+ Units)
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">
            {lowCount} <span className="text-xs font-normal text-slate-400">items below custom limit</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search low-stock products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {isOwner && onOpenPurchaseModal && (
          <button
            onClick={onOpenPurchaseModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Create Purchase Order (Stock-In)</span>
          </button>
        )}
      </div>

      {/* Grid of Alert Cards */}
      {lowStockItems.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#0f1422]/90 border border-slate-800 text-center space-y-2">
          <Boxes className="w-10 h-10 text-emerald-500/60 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">
            Great news! No inventory items need urgent restocking.
          </h3>
          <p className="text-xs text-slate-400">
            All catalog items are currently stocked safely above their configured thresholds.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lowStockItems.map((product) => {
            const qty = Number(product.quantity)
            const threshold = Number(product.min_stock_threshold || 10)
            const isCritical = qty <= 0
            const isHigh = qty > 0 && qty <= 5

            return (
              <div
                key={product.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isCritical
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : isHigh
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{product.name}</h4>
                      <p className="text-[11px] text-slate-400">
                        Category: {product.category} • SKU: {product.sku || `#${product.id}`}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : isHigh
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      {isCritical ? 'Critical 0' : isHigh ? 'High Urgency' : 'Low Warning'}
                    </span>
                  </div>

                  {/* Stock Level Bar */}
                  <div className="my-3 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Current Stock:</span>
                      <span className="font-bold text-slate-200">
                        {qty} / {threshold} units limit
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isCritical ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-blue-500'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(5, (qty / threshold) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 pt-1">
                    Unit Price: <strong className="text-slate-200">₹{Number(product.price).toFixed(2)}</strong>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 mt-4">
                  <button
                    onClick={() => onViewProduct(product)}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Specs
                  </button>

                  <div className="flex items-center gap-2">
                    {isOwner && (
                      <button
                        onClick={() => onAdjustStock(product)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" /> Adjust
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
