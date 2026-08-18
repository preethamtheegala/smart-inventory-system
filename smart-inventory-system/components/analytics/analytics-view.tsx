'use client'

import { useState } from 'react'
import { AnalyticsData, DateRangeType } from '@/lib/types'
import {
  TrendingUp,
  DollarSign,
  Boxes,
  ShoppingCart,
  Percent,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  RotateCcw,
  Sparkles,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

interface AnalyticsViewProps {
  data: AnalyticsData
  currentRange: DateRangeType
  onRangeChange: (range: DateRangeType, start?: string, end?: string) => void
  loading?: boolean
}

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f43f5e']

export function AnalyticsView({
  data,
  currentRange,
  onRangeChange,
  loading = false,
}: AnalyticsViewProps) {
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [showCustomPicker, setShowCustomPicker] = useState(false)

  const handlePresetClick = (range: DateRangeType) => {
    if (range === 'custom') {
      setShowCustomPicker(true)
    } else {
      setShowCustomPicker(false)
      onRangeChange(range)
    }
  }

  const handleApplyCustom = () => {
    if (customStart && customEnd) {
      onRangeChange('custom', customStart, customEnd)
    }
  }

  // P&L metrics with fallbacks
  const revenue = data.total_revenue || 0
  const cogs = data.total_cogs || 0
  const grossProfit = data.gross_profit || (revenue - cogs)
  const grossMargin = data.gross_margin_percent || (revenue > 0 ? (grossProfit / revenue) * 100 : 0)
  const returns = data.total_returns_amount || 0
  const netRevenue = data.net_revenue || (revenue - returns)
  const discounts = data.total_discounts || 0
  const taxes = data.total_taxes || 0

  const topProfitable = data.top_profitable_products || []
  const categoryProfits = data.category_profitability || []
  const dailySales = data.daily_sales || []

  return (
    <div className="space-y-6">
      {/* Date Range Selector Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0f1422]/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-slate-200">Analytics Period:</span>
          {data.start_date && data.end_date && (
            <span className="text-xs font-mono text-slate-400">
              ({data.start_date} to {data.end_date})
            </span>
          )}
        </div>

        {/* Range Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'today' as DateRangeType, label: 'Today' },
            { id: 'yesterday' as DateRangeType, label: 'Yesterday' },
            { id: '7days' as DateRangeType, label: 'Last 7 Days' },
            { id: '30days' as DateRangeType, label: 'Last 30 Days' },
            { id: 'this_month' as DateRangeType, label: 'This Month' },
            { id: 'prev_month' as DateRangeType, label: 'Previous Month' },
            { id: 'custom' as DateRangeType, label: 'Custom Range' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => handlePresetClick(btn.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentRange === btn.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Range Drawer */}
      {showCustomPicker && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-blue-500/40 flex flex-wrap items-center gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span>Start Date:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span>End Date:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleApplyCustom}
            disabled={!customStart || !customEnd}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            Apply Range Filter
          </button>
        </div>
      )}

      {/* Profit & Loss Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="p-5 rounded-2xl bg-[#0f1422]/90 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Gross Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">
            ₹{revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>{data.total_sales_count} orders completed</span>
          </div>
        </div>

        {/* Cost of Goods Sold (COGS) */}
        <div className="p-5 rounded-2xl bg-[#0f1422]/90 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Cost of Goods (COGS)
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">
            ₹{cogs.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Acquisition & procurement cost
          </div>
        </div>

        {/* Gross Profit */}
        <div className="p-5 rounded-2xl bg-[#0f1422]/90 border border-blue-500/30 bg-gradient-to-b from-blue-950/20 to-transparent shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Gross Profit
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-300 mt-2">
            ₹{grossProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-blue-400/80 mt-1 font-semibold">
            Revenue minus Procurement COGS
          </div>
        </div>

        {/* Gross Margin % */}
        <div className="p-5 rounded-2xl bg-[#0f1422]/90 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Gross Margin %
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-300 mt-2">
            {Number(grossMargin).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Overall profit margin efficiency
          </div>
        </div>
      </div>

      {/* Secondary Financial Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Net Revenue</span>
          <span className="text-base font-bold text-slate-100 mt-0.5 block">
            ₹{netRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Refunds / Returns</span>
          <span className="text-base font-bold text-rose-400 mt-0.5 block">
            - ₹{returns.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Promotional Discounts</span>
          <span className="text-base font-bold text-amber-400 mt-0.5 block">
            ₹{discounts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Collected GST / Tax</span>
          <span className="text-base font-bold text-teal-400 mt-0.5 block">
            ₹{taxes.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Charts Row: Revenue vs COGS Trend & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Revenue & Profit Timeline */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0f1422]/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Revenue & Profit Timeline</h3>
              <p className="text-xs text-slate-400">Daily financial inflow vs estimated product costs</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Revenue
              </span>
              <span className="flex items-center gap-1.5 text-blue-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Gross Profit
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            {dailySales.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                No transaction data available for this date period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailySales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="display_date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    formatter={(val: any) => [`₹${Number(val).toFixed(2)}`, '']}
                  />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} fill="url(#revGrad)" />
                  <Area type="monotone" dataKey="profit" name="Gross Profit" stroke="#3b82f6" strokeWidth={2} fill="url(#profGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right 1 Col: Category Share / Margin */}
        <div className="p-5 rounded-2xl bg-[#0f1422]/90 border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Category Profit Share</h3>
            <p className="text-xs text-slate-400">Profit contribution by product category</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {categoryProfits.length === 0 ? (
              <div className="text-slate-500 text-xs">No category profit data.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryProfits}
                    dataKey="profit"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={3}
                  >
                    {categoryProfits.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    formatter={(val: any) => [`₹${Number(val).toFixed(2)} Profit`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Top Most Profitable Products Table */}
      <div className="p-5 rounded-2xl bg-[#0f1422]/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Top Profitable Products (P&L Ranking)</h3>
            <p className="text-xs text-slate-400">Ranked by total gross profit generated during this period</p>
          </div>
          <span className="text-xs text-blue-400 font-semibold">
            {topProfitable.length} High-Margin Products
          </span>
        </div>

        {topProfitable.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No product profit metrics recorded for this selected range.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Revenue</th>
                  <th className="py-2.5 px-3">Total COGS</th>
                  <th className="py-2.5 px-3 font-bold text-blue-400">Gross Profit</th>
                  <th className="py-2.5 px-3 text-right">Profit Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {topProfitable.map((p) => {
                  const itemMargin = p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0
                  return (
                    <tr key={p.product_id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-3 font-semibold text-slate-200">{p.product_name}</td>
                      <td className="py-3 px-3 text-slate-400">{p.category}</td>
                      <td className="py-3 px-3 text-slate-200">₹{Number(p.revenue).toFixed(2)}</td>
                      <td className="py-3 px-3 text-slate-400">₹{Number(p.cogs).toFixed(2)}</td>
                      <td className="py-3 px-3 font-bold text-blue-400">₹{Number(p.profit).toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-bold text-purple-400">
                        {itemMargin.toFixed(1)}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
