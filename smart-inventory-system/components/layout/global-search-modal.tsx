'use client'

import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import { GlobalSearchResult, Product, Sale, Supplier, Customer, Purchase } from '@/lib/types'
import {
  Search,
  X,
  Boxes,
  ShoppingCart,
  Truck,
  Users,
  PackagePlus,
  ArrowRight,
  Sparkles
} from 'lucide-react'

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectProduct?: (product: Product) => void
  onSelectSale?: (sale: Sale) => void
  onNavigateSection?: (section: string) => void
}

export function GlobalSearchModal({
  isOpen,
  onClose,
  onSelectProduct,
  onSelectSale,
  onNavigateSection,
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GlobalSearchResult>({
    products: [],
    sales: [],
    customers: [],
    suppliers: [],
    purchases: [],
  })
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setResults({ products: [], sales: [], customers: [], suppliers: [], purchases: [] })
    }
  }, [isOpen])

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ products: [], sales: [], customers: [], suppliers: [], purchases: [] })
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await api.globalSearch(query.trim())
        setResults(data)
      } catch (err) {
        console.error('Global search error:', err)
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else {
          // Open search modal handled from outside
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const hasAnyResults =
    results.products.length > 0 ||
    results.sales.length > 0 ||
    results.customers.length > 0 ||
    results.suppliers.length > 0 ||
    results.purchases.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-[#0f1422] border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products, orders, customers, suppliers, purchases..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Searching enterprise catalog...</span>
            </div>
          ) : !query.trim() ? (
            <div className="py-12 text-center text-slate-500 text-xs space-y-1">
              <p className="font-semibold text-slate-400">Quick Universal Search</p>
              <p>Type keywords to search across products, sales transactions, suppliers, and contacts.</p>
            </div>
          ) : !hasAnyResults ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No results found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Products */}
              {results.products.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-blue-400" /> Products ({results.products.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.products.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onClose()
                          onSelectProduct?.(p)
                        }}
                        className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-200">{p.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {p.category} • ₹{Number(p.price).toFixed(2)} • Stock: {p.quantity} units
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold">
                          View Specs
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sales */}
              {results.sales.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" /> Sales Orders ({results.sales.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.sales.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onClose()
                          onSelectSale?.(s)
                        }}
                        className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-200">
                            Order #{s.id} — {s.product_name || `Product #${s.product}`}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Qty: {s.quantity} • Total: ₹{Number(s.total).toFixed(2)} • {new Date(s.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                          Receipt
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers */}
              {results.customers.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-400" /> Customers ({results.customers.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.customers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onClose()
                          onNavigateSection?.('customers')
                        }}
                        className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/40 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-200">{c.name}</div>
                          <div className="text-[10px] text-slate-400">{c.phone || c.email || 'No contact details'}</div>
                        </div>
                        <span className="text-[10px] text-purple-400 flex items-center gap-1">
                          View Customer <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suppliers */}
              {results.suppliers.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-amber-400" /> Suppliers ({results.suppliers.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.suppliers.map((sup) => (
                      <div
                        key={sup.id}
                        onClick={() => {
                          onClose()
                          onNavigateSection?.('suppliers')
                        }}
                        className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-200">{sup.name}</div>
                          <div className="text-[10px] text-slate-400">{sup.company_name || sup.phone}</div>
                        </div>
                        <span className="text-[10px] text-amber-400 flex items-center gap-1">
                          View Supplier <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Purchases */}
              {results.purchases.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <PackagePlus className="w-3.5 h-3.5 text-indigo-400" /> Purchases ({results.purchases.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.purchases.map((po) => (
                      <div
                        key={po.id}
                        onClick={() => {
                          onClose()
                          onNavigateSection?.('purchases')
                        }}
                        className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/40 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-200">
                            PO #{po.id} — {po.product_name} x {po.quantity} pcs
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Supplier: {po.supplier_name} • Total Cost: ₹{Number(po.total_cost).toFixed(2)}
                          </div>
                        </div>
                        <span className="text-[10px] text-indigo-400 flex items-center gap-1">
                          View PO <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-2.5 px-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Press ESC to close</span>
          <span>Shortcut: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">Cmd + K</kbd></span>
        </div>
      </div>
    </div>
  )
}
