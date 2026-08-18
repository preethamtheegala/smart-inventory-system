'use client'

import { Sale } from '@/lib/types'
import { ShoppingBag, ArrowRight, Receipt, Eye } from 'lucide-react'

interface RecentSalesTableProps {
  sales: Sale[]
  onViewAllSales: () => void
  onViewReceipt: (sale: Sale) => void
}

export function RecentSalesTable({
  sales,
  onViewAllSales,
  onViewReceipt,
}: RecentSalesTableProps) {
  const recentList = sales.slice(0, 5)

  return (
    <div className="rounded-2xl bg-[#0f1422]/90 border border-slate-800/80 p-6 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100">
            Recent Transactions
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Latest point-of-sale activities recorded
          </p>
        </div>

        <button
          onClick={onViewAllSales}
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {recentList.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-sm">
          No sales recorded yet. Start by recording a sale.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pr-4">Order ID</th>
                <th className="pb-3 pr-4">Product</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Qty</th>
                <th className="pb-3 pr-4">Total</th>
                <th className="pb-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {recentList.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 pr-4 font-mono text-xs text-slate-400">
                    #{sale.id}
                  </td>
                  <td className="py-3 pr-4 font-medium text-slate-200">
                    {sale.product_name || `Product #${sale.product}`}
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-400">
                    {new Date(sale.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 pr-4 text-slate-300">
                    {sale.quantity}
                  </td>
                  <td className="py-3 pr-4 font-semibold text-emerald-400">
                    ₹{Number(sale.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => onViewReceipt(sale)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all cursor-pointer"
                      title="View Receipt"
                    >
                      <Receipt className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
