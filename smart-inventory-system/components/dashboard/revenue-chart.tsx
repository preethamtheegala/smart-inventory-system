'use client'

import { DailySalePoint } from '@/lib/types'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'
import { TrendingUp, Calendar } from 'lucide-react'

interface RevenueChartProps {
  data: DailySalePoint[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data && data.length > 0 ? data : [
    { display_date: 'Mon', revenue: 0, sales_count: 0 },
    { display_date: 'Tue', revenue: 0, sales_count: 0 },
    { display_date: 'Wed', revenue: 0, sales_count: 0 },
    { display_date: 'Thu', revenue: 0, sales_count: 0 },
    { display_date: 'Fri', revenue: 0, sales_count: 0 },
    { display_date: 'Sat', revenue: 0, sales_count: 0 },
    { display_date: 'Sun', revenue: 0, sales_count: 0 },
  ]

  const totalWeekRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0)
  const totalWeekSales = chartData.reduce((sum, item) => sum + item.sales_count, 0)

  return (
    <div className="rounded-2xl bg-[#0f1422]/90 border border-slate-800/80 p-6 shadow-lg shadow-black/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-100">
              Revenue & Activity Trend
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
              Last 7 Days
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time daily transaction totals and sales volume
          </p>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Period Total
            </span>
            <span className="text-lg font-bold text-emerald-400">
              ₹{totalWeekRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="border-l border-slate-800 pl-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Volume
            </span>
            <span className="text-lg font-bold text-blue-400">
              {totalWeekSales} orders
            </span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
            <XAxis
              dataKey="display_date"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const val = payload[0].value as number
                  const salesCount = payload[0].payload.sales_count
                  return (
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-xl">
                      <div className="text-xs font-semibold text-slate-300 mb-1">{label}</div>
                      <div className="text-sm font-bold text-blue-400">
                        Revenue: ₹{val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Orders: {salesCount}
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#revenueGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
