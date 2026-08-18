'use client'

import { useState, useMemo } from 'react'
import { Supplier } from '@/lib/types'
import {
  Search,
  Plus,
  Truck,
  Eye,
  Pencil,
  Trash2,
  Phone,
  Mail,
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Filter
} from 'lucide-react'

interface SupplierTableProps {
  suppliers: Supplier[]
  isOwner: boolean
  onAddSupplier: () => void
  onEditSupplier: (supplier: Supplier) => void
  onDeleteSupplier: (supplier: Supplier) => void
  onViewSupplier: (supplier: Supplier) => void
  loading?: boolean
}

export function SupplierTable({
  suppliers,
  isOwner,
  onAddSupplier,
  onEditSupplier,
  onDeleteSupplier,
  onViewSupplier,
  loading = false,
}: SupplierTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.company_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.phone || '').includes(searchTerm) ||
        (s.tax_id || '').toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === 'All' || s.status.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }, [suppliers, searchTerm, statusFilter])

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
            placeholder="Search suppliers by name, company, tax ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active Vendors</option>
            <option value="inactive">Inactive</option>
          </select>

          {isOwner && (
            <button
              onClick={onAddSupplier}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Supplier</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl bg-[#0f1422]/90 border border-slate-800/80 overflow-hidden shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Supplier Name</th>
                <th className="py-3.5 px-4">Company & GST</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Total Purchases</th>
                <th className="py-3.5 px-4">Total Spend</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">Loading supplier directory...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Truck className="w-8 h-8 text-slate-600" />
                      <span className="text-sm font-medium text-slate-400">
                        No supplier records found.
                      </span>
                      {isOwner && (
                        <button
                          onClick={onAddSupplier}
                          className="mt-2 text-xs font-semibold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                        >
                          Register a new vendor
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/40 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                        {s.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">ID: #{s.id}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs text-slate-300 font-medium">{s.company_name || '—'}</div>
                      {s.tax_id && <div className="text-[10px] text-slate-400 font-mono">GST: {s.tax_id}</div>}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      <div>{s.phone || '—'}</div>
                      <div className="text-slate-400 text-[11px]">{s.email || '—'}</div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      {s.total_purchases || 0} orders
                    </td>

                    <td className="py-3.5 px-4 font-bold text-amber-400">
                      ₹{Number(s.total_spend || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                          s.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {s.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span className="capitalize">{s.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewSupplier(s)}
                          title="View Details & Purchase History"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {isOwner && (
                          <>
                            <button
                              onClick={() => onEditSupplier(s)}
                              title="Edit Supplier"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all cursor-pointer"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => onDeleteSupplier(s)}
                              title="Delete Supplier"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
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
            Total <strong className="text-slate-200">{filteredSuppliers.length}</strong> active & partner suppliers
          </span>
        </div>
      </div>
    </div>
  )
}
