'use client'

import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import { NotificationItem, Product, ProductBatch } from '@/lib/types'
import {
  Bell,
  Check,
  AlertTriangle,
  XCircle,
  Clock,
  CheckCircle2,
  Info,
  Layers,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'

interface NotificationsPopoverProps {
  isOpen: boolean
  onClose: () => void
  lowStockProducts: Product[]
  expiringBatches: ProductBatch[]
  persistedNotifications: NotificationItem[]
  onRefreshNotifications: () => void
  onNavigateSection: (section: string) => void
}

export function NotificationsPopover({
  isOpen,
  onClose,
  lowStockProducts = [],
  expiringBatches = [],
  persistedNotifications = [],
  onRefreshNotifications,
  onNavigateSection,
}: NotificationsPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead()
      toast.success('All notifications marked as read.')
      onRefreshNotifications()
    } catch (err) {
      console.error('Failed to mark all read:', err)
    }
  }

  const handleMarkRead = async (id: number) => {
    try {
      await api.markNotificationRead(id)
      onRefreshNotifications()
    } catch (err) {
      console.error('Failed to mark read:', err)
    }
  }

  const outOfStockItems = lowStockProducts.filter((p) => Number(p.quantity) <= 0)
  const lowStockItems = lowStockProducts.filter((p) => Number(p.quantity) > 0 && Number(p.quantity) < p.min_stock_threshold)

  const totalDynamicAlerts = outOfStockItems.length + lowStockItems.length + expiringBatches.length
  const unreadPersisted = persistedNotifications.filter((n) => !n.is_read)

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-14 w-80 sm:w-96 rounded-2xl bg-[#0f1422] border border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="p-3.5 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-slate-100">
            Notification Center
          </span>
          {(totalDynamicAlerts > 0 || unreadPersisted.length > 0) && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {totalDynamicAlerts + unreadPersisted.length}
            </span>
          )}
        </div>

        {unreadPersisted.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            <Check className="w-3 h-3" /> Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 p-1">
        {/* Dynamic Out of Stock Alerts */}
        {outOfStockItems.map((p) => (
          <div
            key={`out-${p.id}`}
            onClick={() => {
              onClose()
              onNavigateSection('low_stock')
            }}
            className="p-3 hover:bg-slate-900/50 transition-colors flex items-start gap-2.5 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
              <XCircle className="w-4 h-4" />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-semibold text-rose-300 group-hover:text-rose-200">
                Critical: Out of Stock
              </div>
              <div className="text-[11px] text-slate-300 truncate">
                &lsquo;{p.name}&rsquo; has 0 units remaining.
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Click to restock immediately</div>
            </div>
          </div>
        ))}

        {/* Dynamic Low Stock Alerts */}
        {lowStockItems.slice(0, 4).map((p) => (
          <div
            key={`low-${p.id}`}
            onClick={() => {
              onClose()
              onNavigateSection('low_stock')
            }}
            className="p-3 hover:bg-slate-900/50 transition-colors flex items-start gap-2.5 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-semibold text-amber-300 group-hover:text-amber-200">
                Low Stock Threshold Warning
              </div>
              <div className="text-[11px] text-slate-300 truncate">
                &lsquo;{p.name}&rsquo; ({p.quantity}/{p.min_stock_threshold} units remaining).
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Threshold alert</div>
            </div>
          </div>
        ))}

        {/* Dynamic Expiring Batches */}
        {expiringBatches.slice(0, 3).map((b) => (
          <div
            key={`exp-${b.id}`}
            onClick={() => {
              onClose()
              onNavigateSection('products')
            }}
            className="p-3 hover:bg-slate-900/50 transition-colors flex items-start gap-2.5 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-semibold text-purple-300 group-hover:text-purple-200">
                Batch Expiring Soon
              </div>
              <div className="text-[11px] text-slate-300 truncate">
                {b.product_name} (Batch {b.batch_number}): Exp {b.expiry_date}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{b.quantity} units in batch</div>
            </div>
          </div>
        ))}

        {/* Persisted Notifications */}
        {persistedNotifications.map((n) => (
          <div
            key={n.id}
            className={`p-3 hover:bg-slate-900/50 transition-colors flex items-start gap-2.5 ${
              n.is_read ? 'opacity-60' : 'bg-blue-500/5'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-semibold text-slate-200">{n.title}</div>
              <div className="text-[11px] text-slate-400">{n.message}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {new Date(n.created_at).toLocaleDateString()}
              </div>
            </div>
            {!n.is_read && (
              <button
                onClick={() => handleMarkRead(n.id)}
                title="Mark read"
                className="p-1 rounded text-slate-400 hover:text-blue-400 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}

        {totalDynamicAlerts === 0 && persistedNotifications.length === 0 && (
          <div className="py-8 text-center text-slate-500 text-xs">
            <CheckCircle2 className="w-6 h-6 text-emerald-500/60 mx-auto mb-1.5" />
            <p className="font-medium text-slate-400">All clear!</p>
            <p>No critical stock or expiry warnings at this time.</p>
          </div>
        )}
      </div>
    </div>
  )
}
