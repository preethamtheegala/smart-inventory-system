'use client'

import { User } from '@/lib/types'
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  BarChart3,
  FileSpreadsheet,
  LogOut,
  Truck,
  Users,
  History,
  AlertTriangle,
  ClipboardList,
  UserCheck,
  PackagePlus,
  Shield,
  Layers
} from 'lucide-react'

export type NavSection =
  | 'overview'
  | 'products'
  | 'low_stock'
  | 'purchases'
  | 'sales'
  | 'movements'
  | 'suppliers'
  | 'customers'
  | 'analytics'
  | 'reports'
  | 'logs'
  | 'profile'

interface SidebarProps {
  user: User
  currentSection: NavSection
  onSelectSection: (section: NavSection) => void
  onLogout: () => void
  lowStockCount?: number
  expiringCount?: number
  unreadNotificationsCount?: number
}

export function Sidebar({
  user,
  currentSection,
  onSelectSection,
  onLogout,
  lowStockCount = 0,
  expiringCount = 0,
}: SidebarProps) {
  const isOwner = user.role === 'owner'

  const navGroups = [
    {
      group: 'Core Operations',
      items: [
        {
          id: 'overview' as NavSection,
          label: 'Dashboard',
          icon: LayoutDashboard,
          roles: ['owner', 'cashier'],
        },
        {
          id: 'sales' as NavSection,
          label: 'Sales & POS',
          icon: ShoppingCart,
          roles: ['owner', 'cashier'],
        },
        {
          id: 'products' as NavSection,
          label: 'Inventory Catalog',
          icon: Boxes,
          roles: ['owner', 'cashier'],
        },
        {
          id: 'low_stock' as NavSection,
          label: 'Low Stock Alerts',
          icon: AlertTriangle,
          roles: ['owner', 'cashier'],
          badge: lowStockCount > 0 ? String(lowStockCount) : undefined,
          badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
        },
        {
          id: 'movements' as NavSection,
          label: 'Stock Activity Audit',
          icon: History,
          roles: ['owner', 'cashier'],
        },
      ],
    },
    {
      group: 'Procurement & Contacts',
      items: [
        {
          id: 'purchases' as NavSection,
          label: 'Purchases (Stock-In)',
          icon: PackagePlus,
          roles: ['owner'],
        },
        {
          id: 'suppliers' as NavSection,
          label: 'Suppliers',
          icon: Truck,
          roles: ['owner'],
        },
        {
          id: 'customers' as NavSection,
          label: 'Customers',
          icon: Users,
          roles: ['owner', 'cashier'],
        },
      ],
    },
    {
      group: 'Analytics & Management',
      items: [
        {
          id: 'analytics' as NavSection,
          label: 'Profit & Analytics',
          icon: BarChart3,
          roles: ['owner'],
        },
        {
          id: 'reports' as NavSection,
          label: 'Reports & Export',
          icon: FileSpreadsheet,
          roles: ['owner'],
        },
        {
          id: 'logs' as NavSection,
          label: 'System Audit Log',
          icon: ClipboardList,
          roles: ['owner'],
        },
        {
          id: 'profile' as NavSection,
          label: 'Profile & Security',
          icon: UserCheck,
          roles: ['owner', 'cashier'],
        },
      ],
    },
  ]

  return (
    <aside className="w-64 bg-[#0a0f1d] border-r border-slate-800/80 flex flex-col h-screen fixed top-0 left-0 z-30 select-none">
      {/* Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800/80 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 ring-2 ring-blue-500/20">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-slate-100 text-sm tracking-tight block">
            Smart Inventory
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-blue-400 block -mt-0.5">
            Enterprise v2.0
          </span>
        </div>
      </div>

      {/* Role Banner */}
      <div className="px-3 pt-3 pb-1 shrink-0">
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isOwner ? 'bg-blue-400' : 'bg-emerald-400'}`} />
            <span className="text-xs font-semibold text-slate-300 capitalize">
              {user.username}
            </span>
          </div>
          <span
            className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
              isOwner
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}
          >
            {isOwner ? 'Owner' : 'Cashier'}
          </span>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 px-3 py-2 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => item.roles.includes(user.role))
          if (visibleItems.length === 0) return null

          return (
            <div key={group.group} className="space-y-1">
              <div className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {group.group}
              </div>

              {visibleItems.map((item) => {
                const Icon = item.icon
                const isActive = currentSection === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectSection(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-blue-400 border border-blue-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                    </div>
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/50 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => onSelectSection('profile')}
            className="flex items-center gap-2.5 overflow-hidden text-left hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-xs shrink-0">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-slate-200 truncate capitalize">
                {user.username}
              </div>
              <div className="text-[10px] text-slate-400 capitalize">
                {user.role} Account
              </div>
            </div>
          </button>

          <button
            onClick={onLogout}
            title="Logout"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
