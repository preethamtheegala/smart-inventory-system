'use client'

import { useState } from 'react'
import { User, Product, ProductBatch, NotificationItem } from '@/lib/types'
import { NavSection } from './sidebar'
import { NotificationsPopover } from './notifications-popover'
import {
  Plus,
  ShoppingCart,
  RotateCw,
  AlertTriangle,
  Menu,
  Search,
  Bell,
  PackagePlus,
  User as UserIcon,
  ShieldCheck
} from 'lucide-react'

interface HeaderProps {
  user: User
  currentSection: NavSection
  onOpenProductModal?: () => void
  onOpenSaleModal?: () => void
  onOpenPurchaseModal?: () => void
  onOpenSearchModal: () => void
  onRefresh?: () => void
  isRefreshing?: boolean
  lowStockProducts?: Product[]
  expiringBatches?: ProductBatch[]
  persistedNotifications?: NotificationItem[]
  onRefreshNotifications?: () => void
  onNavigateSection: (section: NavSection) => void
  onToggleMobileMenu?: () => void
}

const sectionTitles: Record<NavSection, { title: string; subtitle: string }> = {
  overview: {
    title: 'Executive Dashboard',
    subtitle: 'Real-time financial performance, inventory valuation, and POS volume',
  },
  products: {
    title: 'Inventory & Catalog',
    subtitle: 'Manage products, selling prices, unit costs, and custom low-stock thresholds',
  },
  low_stock: {
    title: 'Low Stock & Urgency Alerts',
    subtitle: 'Urgency-categorized stock replenishment and out-of-stock monitor',
  },
  purchases: {
    title: 'Purchases & Stock-In',
    subtitle: 'Inbound procurement orders, vendor invoices, and automated stock additions',
  },
  sales: {
    title: 'Sales & POS Ledger',
    subtitle: 'Process customer transactions, itemized discounts, tax calculations, and returns',
  },
  movements: {
    title: 'Inventory Stock Activity',
    subtitle: 'Complete chronological audit log of all stock-ins, sales, returns, and adjustments',
  },
  suppliers: {
    title: 'Supplier Directory',
    subtitle: 'Manage procurement vendors, tax IDs, and purchase history',
  },
  customers: {
    title: 'Customer Directory',
    subtitle: 'Track client purchase histories, order volumes, and lifetime revenues',
  },
  analytics: {
    title: 'Profit & Business Analytics',
    subtitle: 'Deep-dive gross profit, cost of goods sold, margins, and period comparisons',
  },
  reports: {
    title: 'Reports & Export Center',
    subtitle: 'Generate and download certified CSV spreadsheets and printable audit reports',
  },
  logs: {
    title: 'System Activity Audit Log',
    subtitle: 'Comprehensive immutable security and operation audit trail',
  },
  profile: {
    title: 'User Profile & Security',
    subtitle: 'Account details, active role privileges, and secure password management',
  },
}

export function Header({
  user,
  currentSection,
  onOpenProductModal,
  onOpenSaleModal,
  onOpenPurchaseModal,
  onOpenSearchModal,
  onRefresh,
  isRefreshing = false,
  lowStockProducts = [],
  expiringBatches = [],
  persistedNotifications = [],
  onRefreshNotifications = () => {},
  onNavigateSection,
  onToggleMobileMenu,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const isOwner = user.role === 'owner'

  const current = sectionTitles[currentSection] || {
    title: 'Smart Inventory Hub',
    subtitle: 'Manage your operations',
  }

  const outOfStockCount = lowStockProducts.filter((p) => Number(p.quantity) <= 0).length
  const lowStockCount = lowStockProducts.filter((p) => Number(p.quantity) > 0 && Number(p.quantity) < p.min_stock_threshold).length
  const totalAlerts = outOfStockCount + lowStockCount + expiringBatches.length + persistedNotifications.filter((n) => !n.is_read).length

  return (
    <header className="sticky top-0 z-20 h-18 bg-[#090d16]/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between transition-all">
      {/* Left: Mobile Trigger & Section Info */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight">
              {current.title}
            </h1>
            {outOfStockCount > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                {outOfStockCount} Out of Stock
              </span>
            )}
            {lowStockCount > 0 && outOfStockCount === 0 && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {lowStockCount} Low Stock
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Center/Right: Global Search & Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Input Button */}
        <button
          onClick={onOpenSearchModal}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-all cursor-pointer group"
        >
          <Search className="w-3.5 h-3.5 group-hover:text-blue-400" />
          <span className="text-slate-400">Search anything...</span>
          <kbd className="ml-2 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Mobile Search Icon */}
        <button
          onClick={onOpenSearchModal}
          className="sm:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications & Alerts"
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer relative"
          >
            <Bell className="w-4 h-4" />
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-[#090d16] animate-pulse">
                {totalAlerts > 9 ? '9+' : totalAlerts}
              </span>
            )}
          </button>

          <NotificationsPopover
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
            lowStockProducts={lowStockProducts}
            expiringBatches={expiringBatches}
            persistedNotifications={persistedNotifications}
            onRefreshNotifications={onRefreshNotifications}
            onNavigateSection={(sec) => onNavigateSection(sec as NavSection)}
          />
        </div>

        {/* Sync / Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Live Data"
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        )}

        {/* Quick New Sale POS Button */}
        {onOpenSaleModal && (
          <button
            onClick={onOpenSaleModal}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>POS Sale</span>
          </button>
        )}

        {/* Quick Stock-In / Purchase Button (Owner only) */}
        {isOwner && onOpenPurchaseModal && (
          <button
            onClick={onOpenPurchaseModal}
            className="hidden lg:flex px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-sm items-center gap-1.5 transition-all cursor-pointer"
          >
            <PackagePlus className="w-3.5 h-3.5" />
            <span>Stock-In PO</span>
          </button>
        )}
      </div>
    </header>
  )
}
