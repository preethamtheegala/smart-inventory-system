'use client'

import { Sale } from '@/lib/types'
import { X, Printer, CheckCircle, ShoppingBag, Layers, Percent, RotateCcw } from 'lucide-react'

interface ReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  sale: Sale | null
}

export function ReceiptModal({ isOpen, onClose, sale }: ReceiptModalProps) {
  if (!isOpen || !sale) return null

  const handlePrint = () => {
    window.print()
  }

  const subtotal = Number(sale.subtotal || (sale.quantity * Number(sale.price)))
  const discountAmount = Number(sale.discount_amount || 0)
  const taxAmount = Number(sale.tax_amount || 0)
  const total = Number(sale.total)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-[#0f1422] border border-slate-800 shadow-2xl p-6 relative">
        {/* Actions header (Hidden on Print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 print:hidden mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tax Invoice & Receipt
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                sale.status === 'returned'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : sale.status === 'partially_returned'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {sale.status || 'completed'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="receipt-content text-slate-200 font-mono text-xs space-y-4 p-2 bg-slate-950/40 rounded-xl border border-slate-900">
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-800">
            <h2 className="text-sm font-bold text-white tracking-wider uppercase">
              Smart Inventory Enterprise
            </h2>
            <p className="text-[10px] text-slate-400">Official POS Transaction Receipt</p>
            <p className="text-[10px] text-slate-400">GSTIN: 27AAAAA0000A1Z5</p>
          </div>

          <div className="space-y-1 text-[11px] text-slate-400 pb-3 border-b border-dashed border-slate-800">
            <div className="flex justify-between">
              <span>Receipt No:</span>
              <span className="text-slate-200 font-bold">#ORD-{sale.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Date & Time:</span>
              <span className="text-slate-200">
                {new Date(sale.created_at).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="text-slate-200">
                {sale.customer_name || 'Retail Walk-In'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span className="text-slate-200">{sale.created_by_username || 'Staff'}</span>
            </div>
          </div>

          {/* Line Items */}
          <div className="py-2 border-b border-dashed border-slate-800 space-y-2">
            <div className="flex justify-between font-bold text-slate-100 text-xs">
              <span>{sale.product_name || `Product #${sale.product}`}</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>
                {sale.quantity} units @ ₹{Number(sale.price).toFixed(2)}
              </span>
              <span>Category: {sale.product_category || 'General'}</span>
            </div>
          </div>

          {/* Calculations */}
          <div className="space-y-1.5 text-xs text-slate-400 pb-3 border-b border-dashed border-slate-800">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="text-slate-200">₹{subtotal.toFixed(2)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount ({sale.discount_percent || 0}%):</span>
                <span>- ₹{discountAmount.toFixed(2)}</span>
              </div>
            )}

            {taxAmount > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Tax / GST ({sale.tax_percent || 0}%):</span>
                <span>+ ₹{taxAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
              <span>Grand Total:</span>
              <span className="text-emerald-400">₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Return summary if any */}
          {sale.returns && sale.returns.length > 0 && (
            <div className="p-2 rounded bg-rose-950/30 border border-rose-500/20 text-[10px] text-rose-300 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Returns Processed:
              </div>
              {sale.returns.map((r) => (
                <div key={r.id} className="flex justify-between">
                  <span>Returned {r.quantity} unit(s) ({r.reason}):</span>
                  <span>- ₹{Number(r.refund_amount).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="text-center pt-2 text-[10px] text-slate-500">
            <p>Thank you for your business!</p>
            <p>Goods once sold can be returned within 7 days with this bill.</p>
          </div>
        </div>

        {/* Footer print action button */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 print:hidden mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  )
}
