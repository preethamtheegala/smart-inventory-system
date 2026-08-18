'use client'

import { useState, useEffect } from 'react'
import { Product, Supplier, Purchase } from '@/lib/types'
import { X, PackagePlus, Truck, DollarSign, Calendar, Tag, Layers, AlertCircle } from 'lucide-react'

interface NewPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  suppliers: Supplier[]
  products: Product[]
  initialSupplierId?: number
  onSavePurchase: (data: Partial<Purchase>) => Promise<void>
}

export function NewPurchaseModal({
  isOpen,
  onClose,
  suppliers,
  products,
  initialSupplierId,
  onSavePurchase,
}: NewPurchaseModalProps) {
  const [supplierId, setSupplierId] = useState<number | ''>('')
  const [productId, setProductId] = useState<number | ''>('')
  const [quantity, setQuantity] = useState<number | ''>(10)
  const [costPrice, setCostPrice] = useState<string>('')
  const [invoiceNo, setInvoiceNo] = useState('')
  const [batchNumber, setBatchNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedProduct = products.find((p) => p.id === Number(productId))

  useEffect(() => {
    if (isOpen) {
      if (initialSupplierId) {
        setSupplierId(initialSupplierId)
      } else if (suppliers.length > 0 && !supplierId) {
        setSupplierId(suppliers[0].id)
      }

      if (products.length > 0 && !productId) {
        setProductId(products[0].id)
        setCostPrice(String(products[0].cost_price || '0.00'))
      }
      setError('')
    }
  }, [isOpen, initialSupplierId, suppliers, products])

  useEffect(() => {
    if (selectedProduct) {
      if (selectedProduct.cost_price && Number(selectedProduct.cost_price) > 0) {
        setCostPrice(String(selectedProduct.cost_price))
      }
      if (selectedProduct.supplier && !supplierId) {
        setSupplierId(selectedProduct.supplier)
      }
    }
  }, [selectedProduct])

  if (!isOpen) return null

  const numQuantity = typeof quantity === 'number' ? quantity : parseInt(String(quantity), 10) || 0
  const numCostPrice = parseFloat(costPrice) || 0
  const totalCost = numQuantity * numCostPrice

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!supplierId) {
      setError('Please select a supplier.')
      return
    }

    if (!productId) {
      setError('Please select a product.')
      return
    }

    if (numQuantity <= 0) {
      setError('Quantity must be at least 1 unit.')
      return
    }

    if (numCostPrice < 0) {
      setError('Cost price cannot be negative.')
      return
    }

    setLoading(true)
    try {
      await onSavePurchase({
        supplier: Number(supplierId),
        product: Number(productId),
        quantity: numQuantity,
        cost_price: numCostPrice,
        invoice_no: invoiceNo.trim(),
        batch_number: batchNumber.trim(),
        expiry_date: expiryDate || undefined,
        notes: notes.trim(),
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to record purchase stock-in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-[#0f1422] border border-slate-800 shadow-2xl p-6 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                Record Stock-In Purchase
              </h2>
              <p className="text-xs text-slate-400">
                Inbound procurement order & automatic inventory replenishment
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

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1">
          {/* Supplier & Product */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Supplier Vendor *
              </label>
              {suppliers.length === 0 ? (
                <div className="text-xs text-amber-400 p-2 bg-amber-500/10 rounded-lg">
                  No suppliers found. Please add a supplier first.
                </div>
              ) : (
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">-- Choose Supplier --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.company_name ? `(${s.company_name})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Product Item *
              </label>
              <select
                value={productId}
                onChange={(e) => setProductId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">-- Choose Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Current: {p.quantity} units)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity & Unit Cost Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Inbound Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Cost Price / Unit (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Optional Batch Number & Expiry Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Batch Number (Optional)
              </label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="e.g. BATCH-2026-X1"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Invoice / Reference & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Invoice / Reference No.
              </label>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="e.g. INV-98214"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Procurement Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Express courier delivery"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Total Cost Banner */}
          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-between text-xs">
            <span className="text-slate-300">
              Inbound Cost Total ({numQuantity} units × ₹{numCostPrice.toFixed(2)}):
            </span>
            <span className="text-base font-bold text-indigo-400">
              ₹{totalCost.toFixed(2)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || suppliers.length === 0 || products.length === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Processing Stock-In...' : 'Confirm & Inbound Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
