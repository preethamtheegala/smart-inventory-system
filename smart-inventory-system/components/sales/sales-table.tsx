'use client'

import { useState, useMemo } from 'react'
import { Sale, Product, Customer } from '@/lib/types'
import {
  Search,
  ShoppingCart,
  Receipt,
  Trash2,
  Filter,
  Calendar,
  RotateCcw,
  User,
  ArrowUpDown,
  Tag,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react'

interface SalesTableProps {
  sales: Sale[]
  products: Product[]
  customers?: Customer[]
  isOwner: boolean
  onNewSale: () => void
  onDeleteSale: (sale: Sale) => void
  onViewReceipt: (sale: Sale) => void
  onProcessReturn?: (sale: Sale) => void
  loading?: boolean
}

type SortField = 'id' | 'created_at' | 'total' | 'quantity'
type SortOrder = 'asc' | 'desc'

export function SalesTable({
  sales,
  products,
  customers = [],
  isOwner,
  onNewSale,
  onDeleteSale,
  onViewReceipt,
  onProcessReturn,
  loading = false,
}: SalesTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [customerFilter, setCustomerFilter] = useState('ALL')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const filteredSales = useMemo(() => {
    let result = sales.filter((s) => {
      const matchesSearch =
        (s.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.created_by_username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(s.id).includes(searchTerm)

      const matchesStatus = statusFilter === 'ALL' || (s.status || 'completed') === statusFilter
      const matchesCustomer = customerFilter === 'ALL' || String(s.customer) === customerFilter

      return matchesSearch && matchesStatus && matchesCustomer
    })

    result.sort((a, b) => {
      let valA: any = a[sortField]
      let valB: any = b[sortField]

      if (sortField === 'total') {
        valA = Number(valA)
        valB = Number(valB)
      } else if (sortField === 'created_at') {
        valA = new Date(valA).getTime()
        valB = new Date(valB).getTime()
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [sales, searchTerm, statusFilter, customerFilter, sortField, sortOrder])

  const totalFilteredRevenue = filteredSales.reduce((sum, s) => sum + Number(s.total), 0)
  const totalFilteredUnits = filteredSales.reduce((sum, s) => sum + s.quantity, 0)

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <RotateCcw className="w-3 h-3" /> Fully Refunded
          </span>
        )
      case 'partially_returned':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> Partially Returned
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Completed
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
            placeholder="Search orders by ID, product, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="completed">Completed Orders</option>
            <option value="partially_returned">Partially Returned</option>
            <option value="returned">Fully Refunded</option>
          </select>

          {customers.length > 0 && (
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Customers</option>
              {customers.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={onNewSale}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>New POS Sale</span>
          </button>
        </div>
      </div>

      {/* KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Orders Processed
          </span>
          <span className="text-xl font-bold text-slate-100 mt-0.5 block">
            {filteredSales.length} orders
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Units Sold
          </span>
          <span className="text-xl font-bold text-blue-400 mt-0.5 block">
            {totalFilteredUnits} units
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Gross Sales Revenue
          </span>
          <span className="text-xl font-bold text-emerald-400 mt-0.5 block">
            ₹{totalFilteredRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                    <span>Order ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Product Item</th>
                <th className="py-3.5 px-4">Customer</th>
                <th
                  onClick={() => toggleSort('created_at')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Date & Time</span>
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
                <th className="py-3.5 px-4">Pricing Breakdown</th>
                <th
                  onClick={() => toggleSort('total')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Grand Total</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">Loading sales transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShoppingCart className="w-8 h-8 text-slate-600" />
                      <span className="text-sm font-medium text-slate-400">
                        No sales orders match your criteria.
                      </span>
                      <button
                        onClick={onNewSale}
                        className="mt-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                      >
                        Create your first POS sale
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/40 transition-colors group">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                      #ORD-{s.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">
                        {s.product_name || `Product #${s.product}`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {s.product_category || 'General'} • By {s.created_by_username || 'Staff'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      {s.customer_name || <span className="text-slate-500">Walk-in</span>}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {new Date(s.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-200">
                      {s.quantity} pcs
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      <div className="text-slate-300">
                        ₹{Number(s.price).toFixed(2)}/unit
                      </div>
                      {(Number(s.discount_percent || 0) > 0 || Number(s.tax_percent || 0) > 0) && (
                        <div className="text-[10px] text-slate-400">
                          {Number(s.discount_percent || 0) > 0 && <span className="text-emerald-400">-{s.discount_percent}% Disc </span>}
                          {Number(s.tax_percent || 0) > 0 && <span className="text-slate-400">+{s.tax_percent}% Tax</span>}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-emerald-400">
                      ₹{Number(s.total).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(s.status)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewReceipt(s)}
                          title="Print / View Invoice Receipt"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>

                        {onProcessReturn && s.status !== 'returned' && (
                          <button
                            onClick={() => onProcessReturn(s)}
                            title="Process Return & Refund"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}

                        {isOwner && (
                          <button
                            onClick={() => onDeleteSale(s)}
                            title="Cancel / Delete Order"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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
            Showing <strong className="text-slate-200">{filteredSales.length}</strong> of{' '}
            <strong className="text-slate-200">{sales.length}</strong> transactions
          </span>
        </div>
      </div>
    </div>
  )
}
