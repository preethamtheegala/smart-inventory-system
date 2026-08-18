'use client'

import { useState, useEffect } from 'react'
import { Product, Customer } from '@/lib/types'
import {
  X,
  ShoppingCart,
  DollarSign,
  Layers,
  AlertCircle,
  Percent,
  Receipt,
  UserCheck,
  CheckCircle2
} from 'lucide-react'

interface NewSaleModalProps {
  isOpen: boolean
  onClose: () => void
  products: Product[]
  customers?: Customer[]
  initialProduct?: Product | null
  onRecordSale: (data: {
    product: number
    quantity: number
    price?: number
    customer?: number | null
    discount_percent?: number
    tax_percent?: number
  }) => Promise<void>
}

export function NewSaleModal({
  isOpen,
  onClose,
  products,
  customers = [],
  initialProduct,
  onRecordSale,
}: NewSaleModalProps) {
  const [productId, setProductId] = useState<number | ''>('')
  const [customerId, setCustomerId] = useState<number | ''>('')
  const [quantity, setQuantity] = useState<number | ''>(1)
  const [price, setPrice] = useState<string>('')
  const [discountPercent, setDiscountPercent] = useState<number | ''>(0)
  const [taxPercent, setTaxPercent] = useState<number | ''>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedProduct = products.find((p) => p.id === Number(productId))

  useEffect(() => {
    if (isOpen) {
      if (initialProduct) {
        setProductId(initialProduct.id)
        setPrice(String(initialProduct.price))
      } else if (products.length > 0) {
        setProductId(products[0].id)
        setPrice(String(products[0].price))
      }
      setCustomerId('')
      setQuantity(1)
      setDiscountPercent(0)
      setTaxPercent(0)
      setError('')
    }
  }, [isOpen, initialProduct, products])

  useEffect(() => {
    if (selectedProduct) {
      setPrice(String(selectedProduct.price))
    }
  }, [selectedProduct])

  if (!isOpen) return null

  const numQuantity = typeof quantity === 'number' ? quantity : parseInt(String(quantity), 10) || 0
  const numPrice = parseFloat(price) || 0
  const numDiscount = typeof discountPercent === 'number' ? discountPercent : parseFloat(String(discountPercent)) || 0
  const numTax = typeof taxPercent === 'number' ? taxPercent : parseFloat(String(taxPercent)) || 0

  // Calculations
  const subtotal = numQuantity * numPrice
  const discountAmount = subtotal * (numDiscount / 100)
  const afterDiscount = subtotal - discountAmount
  const taxAmount = afterDiscount * (numTax / 100)
  const grandTotal = afterDiscount + taxAmount

  const isStockAvailable = selectedProduct ? selectedProduct.quantity >= numQuantity : true
  const maxStock = selectedProduct ? selectedProduct.quantity : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!productId) {
      setError('Please select a product.')
      return
    }

    if (numQuantity <= 0) {
      setError('Quantity must be at least 1 unit.')
      return
    }

    if (numPrice <= 0) {
      setError('Price must be greater than zero.')
      return
    }

    if (!isStockAvailable) {
      setError(`Cannot sell ${numQuantity} units. Only ${maxStock} unit(s) in inventory.`)
      return
    }

    if (numDiscount < 0 || numDiscount > 100) {
      setError('Discount must be between 0% and 100%.')
      return
    }

    if (numTax < 0 || numTax > 100) {
      setError('Tax percentage cannot be negative.')
      return
    }

    setLoading(true)
    try {
      await onRecordSale({
        product: Number(productId),
        quantity: numQuantity,
        price: numPrice,
        customer: customerId ? Number(customerId) : null,
        discount_percent: numDiscount,
        tax_percent: numTax,
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to complete sale transaction.')
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
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                New POS Sale Transaction
              </h2>
              <p className="text-xs text-slate-400">
                Real-time stock deduction with itemized discounts & taxes
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
          {/* Customer Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Customer (Optional)
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Walk-in / Direct Retail Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Product Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Product Item *
              </label>
              {selectedProduct && (
                <span
                  className={`text-[11px] font-semibold ${
                    selectedProduct.quantity <= 0
                      ? 'text-rose-400'
                      : selectedProduct.quantity < selectedProduct.min_stock_threshold
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  Stock: {selectedProduct.quantity} units available
                </span>
              )}
            </div>

            <select
              value={productId}
              onChange={(e) => setProductId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ₹{Number(p.price).toFixed(2)} (Stock: {p.quantity})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Unit Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                max={maxStock > 0 ? maxStock : undefined}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Selling Price / Unit (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Discount & Tax */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Discount (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                GST / Tax (%)
              </label>
              <select
                value={taxPercent}
                onChange={(e) => setTaxPercent(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="0">0% (Zero Tax)</option>
                <option value="5">5% GST</option>
                <option value="12">12% GST</option>
                <option value="18">18% GST (Standard)</option>
                <option value="28">28% GST</option>
              </select>
            </div>
          </div>

          {/* Calculation Breakdown Banner */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Subtotal ({numQuantity} × ₹{numPrice.toFixed(2)}):</span>
              <span className="font-semibold text-slate-200">₹{subtotal.toFixed(2)}</span>
            </div>

            {numDiscount > 0 && (
              <div className="flex items-center justify-between text-emerald-400">
                <span>Discount ({numDiscount}%):</span>
                <span>- ₹{discountAmount.toFixed(2)}</span>
              </div>
            )}

            {numTax > 0 && (
              <div className="flex items-center justify-between text-slate-400">
                <span>Tax / GST ({numTax}%):</span>
                <span>+ ₹{taxAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1.5 border-t border-slate-800 text-sm font-bold">
              <span className="text-slate-100">Grand Total:</span>
              <span className="text-emerald-400 text-base">₹{grandTotal.toFixed(2)}</span>
            </div>
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
              disabled={loading || !isStockAvailable || products.length === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Processing Sale...' : 'Complete & Print Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
