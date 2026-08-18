'use client'

import { useState, useMemo } from 'react'
import { Customer } from '@/lib/types'
import {
  Search,
  Plus,
  Users,
  Eye,
  Pencil,
  Trash2,
  Phone,
  Mail,
  MapPin,
  DollarSign
} from 'lucide-react'

interface CustomerTableProps {
  customers: Customer[]
  isOwner: boolean
  onAddCustomer: () => void
  onEditCustomer: (customer: Customer) => void
  onDeleteCustomer: (customer: Customer) => void
  onViewCustomer: (customer: Customer) => void
  loading?: boolean
}

export function CustomerTable({
  customers,
  isOwner,
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onViewCustomer,
  loading = false,
}: CustomerTableProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      return (
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone || '').includes(searchTerm) ||
        (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
  }, [customers, searchTerm])

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search customers by name, phone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <button
          onClick={onAddCustomer}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl bg-[#0f1422]/90 border border-slate-800/80 overflow-hidden shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Contact Details</th>
                <th className="py-3.5 px-4">Address</th>
                <th className="py-3.5 px-4">Total Orders</th>
                <th className="py-3.5 px-4">Total Spent</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">Loading customer directory...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-slate-600" />
                      <span className="text-sm font-medium text-slate-400">
                        No customer profiles found.
                      </span>
                      <button
                        onClick={onAddCustomer}
                        className="mt-2 text-xs font-semibold text-purple-400 hover:text-purple-300 underline cursor-pointer"
                      >
                        Add your first customer
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/40 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-100 group-hover:text-purple-300 transition-colors">
                        {c.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">ID: #{c.id}</div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      <div>{c.phone || '—'}</div>
                      <div className="text-slate-400 text-[11px]">{c.email || '—'}</div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-400 max-w-xs truncate">
                      {c.address || '—'}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      {c.total_orders || 0} orders
                    </td>

                    <td className="py-3.5 px-4 font-bold text-emerald-400">
                      ₹{Number(c.total_spent || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewCustomer(c)}
                          title="View Customer Order Ledger"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onEditCustomer(c)}
                          title="Edit Customer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {isOwner && (
                          <button
                            onClick={() => onDeleteCustomer(c)}
                            title="Delete Customer"
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
            Total <strong className="text-slate-200">{filteredCustomers.length}</strong> customer records
          </span>
        </div>
      </div>
    </div>
  )
}
