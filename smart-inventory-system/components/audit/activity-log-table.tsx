'use client'

import { useState, useMemo } from 'react'
import { ActivityLog } from '@/lib/types'
import {
  ClipboardList,
  Search,
  Calendar,
  Filter,
  Shield,
  User,
  Clock,
  Layers
} from 'lucide-react'

interface ActivityLogTableProps {
  logs: ActivityLog[]
  loading?: boolean
}

export function ActivityLogTable({ logs, loading = false }: ActivityLogTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')
  const [entityFilter, setEntityFilter] = useState('ALL')

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchesSearch =
        (l.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.user_username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.entity || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.entity_id || '').includes(searchTerm)

      const matchesAction = actionFilter === 'ALL' || l.action === actionFilter
      const matchesEntity = entityFilter === 'ALL' || l.entity === entityFilter

      return matchesSearch && matchesAction && matchesEntity
    })
  }, [logs, searchTerm, actionFilter, entityFilter])

  const getActionBadge = (action: string) => {
    const act = action.toUpperCase()
    if (act.includes('CREATE') || act.includes('ADD') || act.includes('INBOUND')) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
          {action}
        </span>
      )
    }
    if (act.includes('DELETE') || act.includes('REMOVE') || act.includes('OUT_OF_STOCK')) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase">
          {action}
        </span>
      )
    }
    if (act.includes('RETURN') || act.includes('ADJUST') || act.includes('UPDATE')) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
          {action}
        </span>
      )
    }
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
        {action}
      </span>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search audit trail by description, user, entity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="SALE">SALE</option>
            <option value="RETURN">RETURN</option>
            <option value="PURCHASE">PURCHASE</option>
            <option value="STOCK_ADJUST">STOCK_ADJUST</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Entities</option>
            <option value="Product">Product</option>
            <option value="Sale">Sale</option>
            <option value="Purchase">Purchase</option>
            <option value="SaleReturn">SaleReturn</option>
            <option value="Supplier">Supplier</option>
            <option value="Customer">Customer</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl bg-[#0f1422]/90 border border-slate-800/80 overflow-hidden shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Operator / User</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Entity & Target ID</th>
                <th className="py-3.5 px-4">Description Audit</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">Loading audit logs...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ClipboardList className="w-8 h-8 text-slate-600" />
                      <span className="text-sm font-medium text-slate-400">
                        No system activity audit records found.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 text-xs text-slate-400 font-mono">
                      {new Date(log.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-xs font-semibold text-slate-200 capitalize">
                        {log.user_username || 'System'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {getActionBadge(log.action)}
                    </td>

                    <td className="py-3.5 px-4 text-xs font-mono text-slate-300">
                      <span className="font-semibold text-blue-400">{log.entity}</span>{' '}
                      {log.entity_id && <span className="text-slate-500">#{log.entity_id}</span>}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      {log.description}
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
            Total <strong className="text-slate-200">{filteredLogs.length}</strong> immutable system audit events
          </span>
        </div>
      </div>
    </div>
  )
}
