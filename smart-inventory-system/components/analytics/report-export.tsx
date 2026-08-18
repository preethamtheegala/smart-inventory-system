'use client'

import { useState } from 'react'
import {
  Product,
  Sale,
  Purchase,
  Supplier,
  Customer,
  InventoryMovement,
  AnalyticsData
} from '@/lib/types'
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Layers,
  CheckCircle2,
  DollarSign,
  Truck,
  Users,
  History,
  ShoppingCart,
  Boxes
} from 'lucide-react'
import { toast } from 'sonner'

interface ReportExportProps {
  products: Product[]
  sales: Sale[]
  purchases: Purchase[]
  suppliers: Supplier[]
  customers: Customer[]
  movements: InventoryMovement[]
  analytics: AnalyticsData
}

export function ReportExport({
  products,
  sales,
  purchases,
  suppliers,
  customers,
  movements,
  analytics,
}: ReportExportProps) {
  const [exportingType, setExportingType] = useState<string | null>(null)

  // Helper to trigger browser CSV file download
  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((item) => {
            const str = String(item ?? '')
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str.replace(/"/g, '""')}"`
            }
            return str
          })
          .join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Exported ${filename}.csv successfully!`)
  }

  // 1. Sales Report
  const exportSalesReport = () => {
    const headers = ['Order ID', 'Product Name', 'Category', 'Customer', 'Quantity', 'Unit Price', 'Discount %', 'Tax %', 'Total Amount', 'Status', 'Cashier', 'Date']
    const rows = sales.map((s) => [
      s.id,
      s.product_name || `Product #${s.product}`,
      s.product_category || 'General',
      s.customer_name || 'Walk-in',
      s.quantity,
      Number(s.price).toFixed(2),
      s.discount_percent || 0,
      s.tax_percent || 0,
      Number(s.total).toFixed(2),
      s.status || 'completed',
      s.created_by_username || 'Staff',
      new Date(s.created_at).toLocaleString(),
    ])
    downloadCSV('sales_transactions_report', headers, rows)
  }

  // 2. Purchases Report
  const exportPurchasesReport = () => {
    const headers = ['PO ID', 'Product Name', 'Supplier Name', 'Invoice No', 'Quantity', 'Cost Price', 'Total Cost', 'Batch No', 'Expiry Date', 'Date']
    const rows = purchases.map((p) => [
      p.id,
      p.product_name || `Product #${p.product}`,
      p.supplier_name || `Supplier #${p.supplier}`,
      p.invoice_no || '',
      p.quantity,
      Number(p.cost_price).toFixed(2),
      Number(p.total_cost).toFixed(2),
      p.batch_number || '',
      p.expiry_date || '',
      new Date(p.purchase_date || p.created_at).toLocaleDateString(),
    ])
    downloadCSV('purchases_stockin_report', headers, rows)
  }

  // 3. Inventory Valuation Report
  const exportInventoryReport = () => {
    const headers = ['Product ID', 'Product Name', 'Category', 'Quantity', 'Min Threshold', 'Cost Price', 'Selling Price', 'Total Cost Value', 'Total Retail Value', 'Supplier']
    const rows = products.map((p) => {
      const cost = Number(p.cost_price || 0)
      const price = Number(p.price || 0)
      const qty = p.quantity
      return [
        p.id,
        p.name,
        p.category,
        qty,
        p.min_stock_threshold,
        cost.toFixed(2),
        price.toFixed(2),
        (qty * cost).toFixed(2),
        (qty * price).toFixed(2),
        p.supplier_name || 'None',
      ]
    })
    downloadCSV('inventory_valuation_catalog', headers, rows)
  }

  // 4. Profit & Loss Report
  const exportProfitReport = () => {
    const headers = ['Product Name', 'Category', 'Quantity Sold', 'Gross Revenue', 'Total COGS', 'Gross Profit', 'Margin %']
    const rows = (analytics.top_profitable_products || []).map((p) => {
      const margin = p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0
      return [
        p.product_name,
        p.category,
        '-',
        p.revenue.toFixed(2),
        p.cogs.toFixed(2),
        p.profit.toFixed(2),
        `${margin.toFixed(1)}%`,
      ]
    })
    downloadCSV('profit_and_loss_report', headers, rows)
  }

  // 5. Stock Movements Report
  const exportMovementsReport = () => {
    const headers = ['Movement ID', 'Product', 'Type', 'Prev Qty', 'New Qty', 'Change', 'Reason', 'Ref ID', 'Auditor', 'Date']
    const rows = movements.map((m) => [
      m.id,
      m.product_name || `Product #${m.product}`,
      m.movement_type,
      m.previous_quantity,
      m.new_quantity,
      m.quantity_changed,
      m.reason || '',
      m.reference_id || '',
      m.user_username || 'System',
      new Date(m.created_at).toLocaleString(),
    ])
    downloadCSV('stock_activity_audit_report', headers, rows)
  }

  // 6. Suppliers Directory Report
  const exportSuppliersReport = () => {
    const headers = ['Supplier ID', 'Contact Name', 'Company Name', 'Phone', 'Email', 'Tax ID', 'Status', 'Total Orders', 'Total Spend']
    const rows = suppliers.map((s) => [
      s.id,
      s.name,
      s.company_name || '',
      s.phone || '',
      s.email || '',
      s.tax_id || '',
      s.status,
      s.total_purchases || 0,
      Number(s.total_spend || 0).toFixed(2),
    ])
    downloadCSV('supplier_directory_report', headers, rows)
  }

  // 7. Customers Directory Report
  const exportCustomersReport = () => {
    const headers = ['Customer ID', 'Full Name', 'Phone', 'Email', 'Address', 'Total Orders', 'Total Spent']
    const rows = customers.map((c) => [
      c.id,
      c.name,
      c.phone || '',
      c.email || '',
      c.address || '',
      c.total_orders || 0,
      Number(c.total_spent || 0).toFixed(2),
    ])
    downloadCSV('customer_directory_report', headers, rows)
  }

  const reportsList = [
    {
      id: 'sales',
      title: 'Sales & POS Transaction Ledger',
      description: 'Itemized sales, customer link, discounts, taxes, net totals, and refund status.',
      icon: ShoppingCart,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      action: exportSalesReport,
      count: `${sales.length} transactions`,
    },
    {
      id: 'purchases',
      title: 'Procurement Purchases (Stock-In)',
      description: 'Vendor invoices, batch numbers, unit costs, inbound quantities, and PO timestamps.',
      icon: Truck,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      action: exportPurchasesReport,
      count: `${purchases.length} purchase orders`,
    },
    {
      id: 'inventory',
      title: 'Inventory Stock Valuation & Catalog',
      description: 'Catalog items, on-hand counts, unit costs, retail values, and asset totals.',
      icon: Boxes,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      action: exportInventoryReport,
      count: `${products.length} products`,
    },
    {
      id: 'profit',
      title: 'Profit & Loss Performance Audit',
      description: 'Gross revenue, COGS, gross margins, and itemized product profitability ranking.',
      icon: DollarSign,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      action: exportProfitReport,
      count: `P&L summary`,
    },
    {
      id: 'movements',
      title: 'Stock Movements & Activity History',
      description: 'Immutable chronological audit log of all sales, purchases, returns, and adjustments.',
      icon: History,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      action: exportMovementsReport,
      count: `${movements.length} audit records`,
    },
    {
      id: 'suppliers',
      title: 'Suppliers Directory & Spend',
      description: 'Procurement vendor profiles, tax registrations, lifetime orders, and total expenditures.',
      icon: Truck,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      action: exportSuppliersReport,
      count: `${suppliers.length} vendors`,
    },
    {
      id: 'customers',
      title: 'Customer Directory & Order Histories',
      description: 'Client contacts, total completed transactions, and lifetime customer values.',
      icon: Users,
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
      action: exportCustomersReport,
      count: `${customers.length} clients`,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Intro card */}
      <div className="p-5 rounded-2xl bg-[#0f1422]/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-400" />
            Enterprise Reports & CSV Export Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Download certified CSV data sheets formatted for Microsoft Excel, Google Sheets, or ERP integration.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Page View</span>
        </button>
      </div>

      {/* Grid of Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportsList.map((rep) => {
          const Icon = rep.icon

          return (
            <div
              key={rep.id}
              className="p-5 rounded-2xl bg-[#0f1422]/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${rep.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 font-mono">
                    {rep.count}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 mb-1.5">{rep.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{rep.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 mt-5 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono uppercase">Format: .CSV</span>

                <button
                  onClick={rep.action}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
