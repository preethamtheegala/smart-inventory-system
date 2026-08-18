'use client'

import { useState, useEffect } from 'react'
import { Sale, SaleReturn } from '@/lib/types'
import { X, RotateCcw, AlertCircle, ShoppingCart, DollarSign } from 'lucide-react'

interface SaleReturnModalProps {
  isOpen: boolean
  onClose: () => void
  sale: Sale | null
  onProcessReturn: (payload: { sale: number; product: number; quantity: number; reason: string }) => Promise<void>
}

export function SaleReturnModal({
  isOpen,
  onClose,
  sale,
  onProcessReturn,
}: SaleReturnModalProps) {
  const [quantity, setQuantity] = useState<number | ''>(1)
  const [reasonCategory, setReasonCategory] = useState('Customer returned item')
  const [customReason, setCustomReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const alreadyReturned = sale ? (sale.returned_quantity || (sale.returns ? sale.returns.reduce((sum, r) => sum + r.quantity, 0) : 0)) : 0
  const maxReturnable = sale ? sale.quantity - alreadyReturned : 0

  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
      setReasonCategory('Customer returned item')
      setCustomReason('')
      setError('')
    }
  }, [isOpen, sale])

  if (!isOpen || !sale) return null

  const numQty = typeof quantity === 'number' ? quantity : parseInt(String(quantity), 10) || 0
  const unitEffectivePrice = Number(sale.total) / sale.quantity
  const calculatedRefund = (unitEffectivePrice * numQty).toFixed(2)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (numQty <= 0) {
      setError('Return quantity must be at least 1 unit.')
      return
    }

    if (numQty > maxReturnable) {
      setError(`Cannot return ${numQty} units. Only ${maxReturnable} unit(s) eligible for return.`)
      return
    }

    const finalReason = reasonCategory === 'Other' ? customReason.trim() : reasonCategory
    if (!finalReason) {
      setError('Please provide a reason for the refund.')
      return
    }

    setLoading(true)
    try {
      await onProcessReturn({
        sale: sale.id,
        product: sale.product,
        quantity: numQty,
        reason: finalReason,
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to process return.')
    } finally {
      setLoading(false)
    }
  }

  const returnReasons = [
    'Customer returned item',
    'Defective or damaged piece',
    'Wrong size / color exchanged',
    'Customer changed mind',
    'Billing error correction',
    'Other',
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-[#0f1422] border border-slate-800 shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                Process Sale Return
              </h2>
              <p className="text-xs text-slate-400">
                Order #{sale.id} • Item: {sale.product_name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Summary Box */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span>Original Sold Quantity:</span>
              <span className="font-semibold text-slate-200">{sale.quantity} units</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Already Returned:</span>
              <span className="font-semibold text-rose-400">{alreadyReturned} units</span>
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-slate-800 text-slate-200 font-bold">
              <span>Max Returnable:</span>
              <span className="text-emerald-400">{maxReturnable} units</span>
            </div>
          </div>

          {maxReturnable <= 0 ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center">
              This order has already been fully refunded and returned.
            </div>
          ) : (
            <>
              {/* Return Quantity */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Return Quantity (Max {maxReturnable}) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={maxReturnable}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Return Reason *
                </label>
                <select
                  value={reasonCategory}
                  onChange={(e) => setReasonCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {returnReasons.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>

                {reasonCategory === 'Other' && (
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Enter reason details"
                    required
                    className="mt-2 w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                )}
              </div>

              {/* Calculated Refund Banner */}
              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  Calculated Customer Refund:
                </span>
                <span className="text-base font-bold text-rose-400">
                  ₹{calculatedRefund}
                </span>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            {maxReturnable > 0 && (
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-sm font-semibold shadow-lg shadow-rose-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Processing Refund...' : 'Confirm Return & Restore Stock'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
