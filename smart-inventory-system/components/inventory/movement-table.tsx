'use client'

import { useState, useMemo } from 'react'
import { InventoryMovement, Product } from '@/lib/types'
import {
  Search,
  History,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  RotateCcw,
  PackagePlus,
  ShoppingCart
} from 'lucide-react'

interface MovementTableProps {
  movements: InventoryMovement[]
  products: Product[]
  loading?: boolean
}

export function MovementTable({
  movements,
  products,
  loading = false,
}: MovementTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [selectedProduct, setSelectedProduct] = useState('All')

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const matchesSearch =
        (m.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.reason || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.reference_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.user_username || '').toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = typeFilter === 'ALL' || m.movement_type === typeFilter
      const matchesProduct = selectedProduct === 'All' || String(m.product) === selectedProduct

      return matchesSearch && matchesType && matchesProduct
    })
  }, [movements, searchTerm, typeFilter, selectedProduct])

  const getMovementBadge = (type: string, change: number) => {
    switch (type) {
      case 'PURCHASE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <PackagePlus className="w-3 h-3" /> Purchase Stock-In (+{change})
          </span>
        )
      case 'SALE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShoppingCart className="w-3 h-3" /> Sale Stock-Out ({change})
          </span>
        )
      case 'SALE_RETURN':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <RotateCcw className="w-3 h-3" /> Return Restock (+{change})
          </span>
        )
      default: // MANUAL_ADJUSTMENT
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <RefreshCw className="w-3 h-3" /> Manual Adjustment ({change > 0 ? `+${change}` : change})
          </span>
        )
    }
  }

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search activity by product, reason, reference ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Movement Types</option>
            <option value="PURCHASE">Stock-In (Purchase)</option>
            <option value="SALE">Stock-Out (Sale)</option>
            <option value="SALE_RETURN">Sale Return</option>
            <option value="MANUAL_ADJUSTMENT">Manual Adjustment</option>
          </select>

          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none"
          >
            <option value="All">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl bg-[#0f1422]/90 border border-slate-800/80 overflow-hidden shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Movement Action</th>
                <th className="py-3.5 px-4">Prev &rarr; New Qty</th>
                <th className="py-3.5 px-4">Change</th>
                <th className="py-3.5 px-4">Reason & Ref</th>
                <th className="py-3.5 px-4 text-right">Auditor</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">Loading inventory movement audit records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <History className="w-8 h-8 text-slate-600" />
                      <span className="text-sm font-medium text-slate-400">
                        No inventory movements recorded.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {new Date(m.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-100">{m.product_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Product #{m.product}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      {getMovementBadge(m.movement_type, m.quantity_changed)}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                      <span>{m.previous_quantity}</span> &rarr;{' '}
                      <strong className="text-slate-100 font-bold">{m.new_quantity}</strong>
                    </td>

                    <td className="py-3.5 px-4 font-bold">
                      <span
                        className={
                          m.quantity_changed > 0
                            ? 'text-emerald-400'
                            : m.quantity_changed < 0
                            ? 'text-rose-400'
                            : 'text-slate-400'
                        }
                      >
                        {m.quantity_changed > 0 ? `+${m.quantity_changed}` : m.quantity_changed}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      <div>{m.reason || '—'}</div>
                      {m.reference_id && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          Ref: {m.reference_id}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right text-xs text-slate-400 font-medium">
                      {m.user_username || 'System'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Total <strong className="text-slate-200">{filteredMovements.length}</strong> audited inventory movement events
          </span>
        </div>
      </div>
    </div>
  )
}
