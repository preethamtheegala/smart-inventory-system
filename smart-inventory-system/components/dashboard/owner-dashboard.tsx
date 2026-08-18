'use client'

import { AnalyticsData, Product, Sale, Purchase, ProductBatch } from '@/lib/types'
import {
  DollarSign,
  TrendingUp,
  Boxes,
  ShoppingCart,
  Percent,
  AlertTriangle,
  PackagePlus,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Eye
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface OwnerDashboardProps {
  analytics: AnalyticsData
  products: Product[]
  sales: Sale[]
  purchases: Purchase[]
  expiringBatches: ProductBatch[]
  onNavigateSection: (section: string) => void
  onOpenProductModal: () => void
  onOpenSaleModal: () => void
  onOpenPurchaseModal: () => void
  onViewReceipt: (sale: Sale) => void
}

export function OwnerDashboard({
  analytics,
  products,
  sales,
  purchases,
  expiringBatches = [],
  onNavigateSection,
  onOpenProductModal,
  onOpenSaleModal,
  onOpenPurchaseModal,
  onViewReceipt,
}: OwnerDashboardProps) {
  const revenue = analytics.total_revenue || 0
  const cogs = analytics.total_cogs || 0
  const grossProfit = analytics.gross_profit || (revenue - cogs)
  const grossMargin = analytics.gross_margin_percent || (revenue > 0 ? (grossProfit / revenue) * 100 : 0)

  const outOfStockProducts = products.filter((p) => Number(p.quantity) <= 0)
  const lowStockProducts = products.filter(
    (p) => Number(p.quantity) > 0 && Number(p.quantity) < Number(p.min_stock_threshold || 10)
  )

  const recentPurchases = purchases.slice(0, 5)
  const recentSales = sales.slice(0, 5)
  const dailySales = analytics.daily_sales || []

  return (
    <div className="space-y-6">
      {/* Top Financial & Operational KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="p-5 rounded-2xl bg-[#0f1422]/90 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">
            ₹{revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{analytics.total_sales_count} orders total</span>
            <span className="text-emerald-400 font-semibold">Today: ₹{Number(analytics.today_revenue || 0).toFixed(2)}</span>
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
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Margin: <strong className="text-purple-300">{Number(grossMargin).toFixed(1)}%</strong></span>
            <span className="text-slate-400">COGS: ₹{Number(cogs).toFixed(0)}</span>
          </div>
        </div>

        {/* Inventory Valuation */}
        <div className="p-5 rounded-2xl bg-[#0f1422]/90 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Inventory Asset Value
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">
            ₹{Number(analytics.total_stock_value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{analytics.total_products} items</span>
            <span className="text-indigo-400 font-semibold">{analytics.total_stock} units in stock</span>
          </div>
        </div>

        {/* Urgent Alerts */}
        <div
          onClick={() => onNavigateSection('low_stock')}
          className="p-5 rounded-2xl bg-[#0f1422]/90 border border-amber-500/30 hover:border-amber-500/50 shadow-xl relative overflow-hidden cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Urgent Stock Alerts
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-300 mt-2">
            {outOfStockProducts.length + lowStockProducts.length} <span className="text-xs text-slate-400 font-normal">items</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span className="text-rose-400 font-semibold">{outOfStockProducts.length} out of stock</span>
            <span className="text-amber-400 flex items-center gap-0.5 font-semibold">
              Restock <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Chart & Quick Action Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Area: Revenue Flow Timeline */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0f1422]/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Revenue & Profit Trajectory</h3>
              <p className="text-xs text-slate-400">7-Day financial inflow vs gross profit margin</p>
            </div>
            <button
              onClick={() => onNavigateSection('analytics')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              Full P&L Analytics <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-60 w-full">
            {dailySales.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                No recent transactions recorded.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailySales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ownerRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ownerProf" x1="0" y1="0" x2="0" y2="1">
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
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} fill="url(#ownerRev)" />
                  <Area type="monotone" dataKey="profit" name="Gross Profit" stroke="#3b82f6" strokeWidth={2} fill="url(#ownerProf)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick Operations Sidebar */}
        <div className="p-5 rounded-2xl bg-[#0f1422]/90 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Executive Quick Launch</h3>
            <p className="text-xs text-slate-400">Direct shortcuts for inventory & financial actions</p>

            <div className="space-y-2.5 mt-4">
              <button
                onClick={onOpenSaleModal}
                className="w-full p-3 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-emerald-400" />
                  <span>Process POS Sale</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onOpenPurchaseModal}
                className="w-full p-3 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-semibold text-xs flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <PackagePlus className="w-4 h-4 text-indigo-400" />
                  <span>Record Procurement Stock-In</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onOpenProductModal}
                className="w-full p-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-300 font-semibold text-xs flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-blue-400" />
                  <span>Add Product Catalog Item</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Expiring Batches Warning Card if any */}
          {expiringBatches.length > 0 && (
            <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-1 text-xs">
              <div className="font-bold text-purple-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {expiringBatches.length} Batches Expiring Soon
              </div>
              <p className="text-[11px] text-slate-400">
                Some batches expire within the next 30 days. Review inventory batches.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Split Tables: Recent Inbound Purchases vs Recent Sales Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Purchases */}
        <div className="p-5 rounded-2xl bg-[#0f1422]/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Recent Procurement Inbound</h3>
              <p className="text-xs text-slate-400">Latest stock replenishments from suppliers</p>
            </div>
            <button
              onClick={() => onNavigateSection('purchases')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentPurchases.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No procurement purchase records logged yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80 text-xs">
              {recentPurchases.map((po) => (
                <div key={po.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200">{po.product_name}</span>
                    <div className="text-[10px] text-slate-400">
                      Supplier: {po.supplier_name} • +{po.quantity} pcs
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-amber-400">₹{Number(po.total_cost).toFixed(2)}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {new Date(po.purchase_date || po.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sales */}
        <div className="p-5 rounded-2xl bg-[#0f1422]/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Latest POS Transactions</h3>
              <p className="text-xs text-slate-400">Completed retail orders and customer receipts</p>
            </div>
            <button
              onClick={() => onNavigateSection('sales')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentSales.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No sales orders processed yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80 text-xs">
              {recentSales.map((s) => (
                <div key={s.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200">{s.product_name}</span>
                    <div className="text-[10px] text-slate-400">
                      Customer: {s.customer_name || 'Walk-in'} • {s.quantity} pcs
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-bold text-emerald-400">₹{Number(s.total).toFixed(2)}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <button
                      onClick={() => onViewReceipt(s)}
                      className="p-1 rounded text-slate-400 hover:text-emerald-400 cursor-pointer"
                      title="View Receipt"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
