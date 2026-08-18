'use client'

import { useState, useMemo } from 'react'
import { Purchase, Supplier, Product } from '@/lib/types'
import {
  Search,
  PackagePlus,
  Calendar,
  Truck,
  Filter,
  DollarSign,
  ArrowUpDown,
  Tag
} from 'lucide-react'

interface PurchaseTableProps {
  purchases: Purchase[]
  suppliers: Supplier[]
  products: Product[]
  isOwner: boolean
  onNewPurchase: () => void
  loading?: boolean
}

type SortField = 'id' | 'purchase_date' | 'total_cost' | 'quantity'
type SortOrder = 'asc' | 'desc'

export function PurchaseTable({
  purchases,
  suppliers,
  products,
  isOwner,
  onNewPurchase,
  loading = false,
}: PurchaseTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSupplier, setSelectedSupplier] = useState('All')
  const [sortField, setSortField] = useState<SortField>('purchase_date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const filteredPurchases = useMemo(() => {
    let result = purchases.filter((po) => {
      const matchesSearch =
        (po.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (po.supplier_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (po.invoice_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(po.id).includes(searchTerm)

      const matchesSupplier =
        selectedSupplier === 'All' || String(po.supplier) === selectedSupplier

      return matchesSearch && matchesSupplier
    })

    result.sort((a, b) => {
      let valA: any = a[sortField]
      let valB: any = b[sortField]

      if (sortField === 'total_cost') {
        valA = Number(valA)
        valB = Number(valB)
      } else if (sortField === 'purchase_date') {
        valA = new Date(valA).getTime()
        valB = new Date(valB).getTime()
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [purchases, searchTerm, selectedSupplier, sortField, sortOrder])

  const totalFilteredCost = filteredPurchases.reduce((sum, po) => sum + Number(po.total_cost), 0)
  const totalFilteredUnits = filteredPurchases.reduce((sum, po) => sum + po.quantity, 0)

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
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
            placeholder="Search purchases by invoice, product, vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none"
          >
            <option value="All">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.name}
              </option>
            ))}
          </select>

          {isOwner && (
            <button
              onClick={onNewPurchase}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <PackagePlus className="w-4 h-4" />
              <span>Record Purchase</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Purchase Orders
          </span>
          <span className="text-xl font-bold text-slate-100 mt-0.5 block">
            {filteredPurchases.length} POs
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Inbound Units
          </span>
          <span className="text-xl font-bold text-indigo-400 mt-0.5 block">
            {totalFilteredUnits} units
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Procurement Spend
          </span>
          <span className="text-xl font-bold text-amber-400 mt-0.5 block">
            ₹{totalFilteredCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl bg-[#0f1422]/90 border border-slate-800/80 overflow-hidden shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th
                  onClick={() => toggleSort('id')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>PO ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Product Item</th>
                <th className="py-3.5 px-4">Supplier Vendor</th>
                <th
                  onClick={() => toggleSort('purchase_date')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Date & Invoice</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('quantity')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Qty</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Unit Cost</th>
                <th
                  onClick={() => toggleSort('total_cost')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Total Cost</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">Loading purchase records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <PackagePlus className="w-8 h-8 text-slate-600" />
                      <span className="text-sm font-medium text-slate-400">
                        No purchase records found.
                      </span>
                      {isOwner && (
                        <button
                          onClick={onNewPurchase}
                          className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                        >
                          Record your first stock-in order
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-900/40 transition-colors group">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                      #PO-{po.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                        {po.product_name || `Product #${po.product}`}
                      </div>
                      {po.batch_number && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          Batch: {po.batch_number} {po.expiry_date ? `(Exp: ${po.expiry_date})` : ''}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs text-slate-300 font-medium">
                        {po.supplier_name || `Supplier #${po.supplier}`}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      <div>
                        {new Date(po.purchase_date || po.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      {po.invoice_no && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          Inv: {po.invoice_no}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-indigo-400">
                      +{po.quantity} pcs
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      ₹{Number(po.cost_price).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-amber-400">
                      ₹{Number(po.total_cost).toFixed(2)}
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
            Showing <strong className="text-slate-200">{filteredPurchases.length}</strong> of{' '}
            <strong className="text-slate-200">{purchases.length}</strong> purchase orders
          </span>
        </div>
      </div>
    </div>
  )
}
