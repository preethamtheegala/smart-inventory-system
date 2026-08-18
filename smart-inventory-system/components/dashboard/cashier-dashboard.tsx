'use client'

import { useState } from 'react'
import { AnalyticsData, Product, Sale } from '@/lib/types'
import {
  ShoppingCart,
  DollarSign,
  Boxes,
  Search,
  Receipt,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Tag,
  AlertTriangle
} from 'lucide-react'

interface CashierDashboardProps {
  analytics: AnalyticsData
  products: Product[]
  sales: Sale[]
  onOpenSaleModal: (product?: Product) => void
  onViewReceipt: (sale: Sale) => void
  onNavigateSection: (section: string) => void
}

export function CashierDashboard({
  analytics,
  products,
  sales,
  onOpenSaleModal,
  onViewReceipt,
  onNavigateSection,
}: CashierDashboardProps) {
  const [quickSearch, setQuickSearch] = useState('')

  const todaySales = sales.filter((s) => {
    const saleDate = new Date(s.created_at).toDateString()
    const today = new Date().toDateString()
    return saleDate === today
  })

  const todayRevenue = todaySales.reduce((sum, s) => sum + Number(s.total), 0)
  const todayUnits = todaySales.reduce((sum, s) => sum + s.quantity, 0)

  const searchedProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(quickSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(quickSearch.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(quickSearch.toLowerCase())
  ).slice(0, 6)

  return (
    <div className="space-y-6">
      {/* Top Banner: Big POS Action & Today's Volume */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Quick POS Trigger Banner */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-[#0f1422] border border-emerald-500/30 flex flex-col justify-between shadow-xl">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" /> POS Register Active
            </div>
            <h2 className="text-xl font-bold text-slate-100">
              Ready to checkout customers & issue receipts
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Process customer retail orders with instant itemized tax calculations, discounts, and automated stock deductions.
            </p>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center gap-3">
            <button
              onClick={() => onOpenSaleModal()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Launch New POS Sale</span>
            </button>
            <button
              onClick={() => onNavigateSection('sales')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              View Sales Ledger
            </button>
          </div>
        </div>

        {/* Today's Cashier Metrics */}
        <div className="p-6 rounded-2xl bg-[#0f1422]/90 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Today&apos;s Shift Volume
            </span>
            <div className="text-2xl font-bold text-emerald-400 mt-2">
              ₹{todayRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Gross revenue collected today
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase">Orders</span>
              <span className="font-bold text-slate-200 text-sm">{todaySales.length}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase">Units Sold</span>
              <span className="font-bold text-blue-400 text-sm">{todayUnits} pcs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Catalog Search & Sell */}
      <div className="p-5 rounded-2xl bg-[#0f1422]/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-blue-400" />
              Quick Product Stock Lookup & Sell
            </h3>
            <p className="text-xs text-slate-400">Search products to check live availability or start a sale</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search product name, category, SKU..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {searchedProducts.map((p) => {
            const isOutOfStock = p.quantity <= 0
            const isLowStock = p.quantity > 0 && p.quantity < p.min_stock_threshold

            return (
              <div
                key={p.id}
                className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between gap-3"
              >
                <div className="overflow-hidden">
                  <div className="font-semibold text-xs text-slate-200 truncate">{p.name}</div>
                  <div className="text-[11px] text-slate-400">
                    ₹{Number(p.price).toFixed(2)} • <span className={isOutOfStock ? 'text-rose-400 font-bold' : isLowStock ? 'text-amber-400 font-semibold' : 'text-emerald-400'}>
                      {p.quantity} in stock
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenSaleModal(p)}
                  disabled={isOutOfStock}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shrink-0 flex items-center gap-1"
                >
                  <ShoppingCart className="w-3 h-3" /> Sell
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Today's Transactions Table */}
      <div className="p-5 rounded-2xl bg-[#0f1422]/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Today&apos;s Completed Transactions</h3>
            <p className="text-xs text-slate-400">Recent sales processed during this work session</p>
          </div>
          <button
            onClick={() => onNavigateSection('sales')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            All Sales <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todaySales.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No sales processed yet today. Click &ldquo;Launch New POS Sale&rdquo; to begin.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80 text-xs">
            {todaySales.map((s) => (
              <div key={s.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-mono text-slate-400">#ORD-{s.id}</span>
                  <span className="font-semibold text-slate-200 ml-2">{s.product_name}</span>
                  <span className="text-slate-400 ml-2">
                    ({s.quantity} pcs • Customer: {s.customer_name || 'Walk-in'})
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-emerald-400 text-sm">₹{Number(s.total).toFixed(2)}</span>
                  <button
                    onClick={() => onViewReceipt(s)}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Print Receipt"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
