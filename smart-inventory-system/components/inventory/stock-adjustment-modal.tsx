'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/lib/types'
import { X, SlidersHorizontal, AlertCircle, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react'

interface StockAdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  products: Product[]
  initialProduct?: Product | null
  onAdjustStock: (payload: {
    product_id: number
    adjustment_type: 'INCREASE' | 'DECREASE' | 'SET'
    quantity: number
    reason: string
  }) => Promise<void>
}

export function StockAdjustmentModal({
  isOpen,
  onClose,
  products,
  initialProduct,
  onAdjustStock,
}: StockAdjustmentModalProps) {
  const [productId, setProductId] = useState<number | ''>('')
  const [adjustmentType, setAdjustmentType] = useState<'INCREASE' | 'DECREASE' | 'SET'>('DECREASE')
  const [quantity, setQuantity] = useState<number | ''>(1)
  const [reasonCategory, setReasonCategory] = useState('Damaged in warehouse')
  const [customReason, setCustomReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedProduct = products.find((p) => p.id === Number(productId))

  useEffect(() => {
    if (isOpen) {
      if (initialProduct) {
        setProductId(initialProduct.id)
      } else if (products.length > 0 && !productId) {
        setProductId(products[0].id)
      }
      setQuantity(1)
      setAdjustmentType('DECREASE')
      setReasonCategory('Damaged in warehouse')
      setCustomReason('')
      setError('')
    }
  }, [isOpen, initialProduct, products])

  if (!isOpen) return null

  const numQty = typeof quantity === 'number' ? quantity : parseInt(String(quantity), 10) || 0
  const currentStock = selectedProduct ? selectedProduct.quantity : 0

  let resultingStock = currentStock
  if (adjustmentType === 'INCREASE') resultingStock = currentStock + numQty
  else if (adjustmentType === 'DECREASE') resultingStock = Math.max(0, currentStock - numQty)
  else resultingStock = numQty

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!productId) {
      setError('Please select a product.')
      return
    }

    if (numQty < 0 || (adjustmentType !== 'SET' && numQty === 0)) {
      setError('Adjustment quantity must be greater than zero.')
      return
    }

    const finalReason = reasonCategory === 'Other' ? customReason.trim() : reasonCategory
    if (!finalReason) {
      setError('Please specify an adjustment reason for the audit log.')
      return
    }

    setLoading(true)
    try {
      await onAdjustStock({
        product_id: Number(productId),
        adjustment_type: adjustmentType,
        quantity: numQty,
        reason: finalReason,
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to adjust stock.')
    } finally {
      setLoading(false)
    }
  }

  const standardReasons = [
    'Damaged in warehouse',
    'Expired inventory write-off',
    'Physical stock count correction',
    'Lost or stolen inventory',
    'Supplier shipment discrepancy',
    'Sample / Promotion giveaway',
    'Other',
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-[#0f1422] border border-slate-800 shadow-2xl p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                Manual Stock Adjustment
              </h2>
              <p className="text-xs text-slate-400">
                Owner-only audit-logged inventory quantity correction
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
          {/* Select Product */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Product Item *
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Current Stock: {p.quantity} units)
                </option>
              ))}
            </select>
          </div>

          {/* Adjustment Mode Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Adjustment Action *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAdjustmentType('DECREASE')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  adjustmentType === 'DECREASE'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 text-rose-400" />
                <span>Reduce Stock</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType('INCREASE')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  adjustmentType === 'INCREASE'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                <span>Add Stock</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType('SET')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  adjustmentType === 'SET'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <RefreshCw className="w-4 h-4 text-blue-400" />
                <span>Set Exact Qty</span>
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              {adjustmentType === 'SET' ? 'Exact New Total Quantity *' : 'Units to Adjust *'}
            </label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Audit Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Audit Reason *
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {standardReasons.map((r) => (
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
                placeholder="Enter specific audit explanation"
                required
                className="mt-2 w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {/* Preview Calculation Banner */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Inventory Preview: <strong className="text-slate-200">{currentStock} units</strong> &rarr;
            </span>
            <span className="text-base font-bold text-blue-400">
              {resultingStock} units after adjustment
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Applying Adjustment...' : 'Apply Stock Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
