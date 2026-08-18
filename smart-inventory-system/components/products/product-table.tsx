'use client'

import { useState, useMemo } from 'react'
import { Product } from '@/lib/types'
import {
  Search,
  Plus,
  Filter,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
  Boxes,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Tag,
  SlidersHorizontal
} from 'lucide-react'

interface ProductTableProps {
  products: Product[]
  isOwner: boolean
  onAddProduct: () => void
  onEditProduct: (product: Product) => void
  onDeleteProduct: (product: Product) => void
  onViewProduct: (product: Product) => void
  onAdjustStock?: (product: Product) => void
  loading?: boolean
}

type SortField = 'name' | 'price' | 'cost_price' | 'quantity' | 'id'
type SortOrder = 'asc' | 'desc'

export function ProductTable({
  products,
  isOwner,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onViewProduct,
  onAdjustStock,
  loading = false,
}: ProductTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [onlyLowStock, setOnlyLowStock] = useState(false)
  const [sortField, setSortField] = useState<SortField>('id')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Extract distinct categories
  const categories = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.category || 'General')))
    return ['All', ...list.sort()]
  }, [products])

  // Filter & sort
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.supplier_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(p.id).includes(searchTerm)

      const matchesCategory =
        selectedCategory === 'All' ||
        (p.category || 'General').toLowerCase() === selectedCategory.toLowerCase()

      const threshold = Number(p.min_stock_threshold || 10)
      const matchesLowStock = onlyLowStock ? Number(p.quantity) < threshold : true

      return matchesSearch && matchesCategory && matchesLowStock
    })

    result.sort((a, b) => {
      let valA: any = a[sortField]
      let valB: any = b[sortField]

      if (sortField === 'price' || sortField === 'cost_price') {
        valA = Number(valA || 0)
        valB = Number(valB || 0)
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [products, searchTerm, selectedCategory, onlyLowStock, sortField, sortOrder])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const lowStockCount = products.filter((p) => Number(p.quantity) < Number(p.min_stock_threshold || 10)).length

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by product name, category, SKU, vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Action & Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Low Stock Toggle */}
          <button
            type="button"
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
              onlyLowStock
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Low Stock Alert ({lowStockCount})</span>
          </button>

          {/* Add Product Button (Owner only) */}
          {isOwner && (
            <button
              onClick={onAddProduct}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
          <Tag className="w-3 h-3" /> Categories:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div className="rounded-2xl bg-[#0f1422]/90 border border-slate-800/80 overflow-hidden shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th
                  onClick={() => toggleSort('id')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('name')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Product Item</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Category</th>
                <th
                  onClick={() => toggleSort('price')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Selling Price</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('cost_price')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Unit Cost</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('quantity')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Stock Level</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">Loading inventory catalog...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Boxes className="w-8 h-8 text-slate-600" />
                      <span className="text-sm font-medium text-slate-400">
                        No products found matching your criteria.
                      </span>
                      {isOwner && (
                        <button
                          onClick={onAddProduct}
                          className="mt-2 text-xs font-semibold text-blue-400 hover:text-blue-300 underline cursor-pointer"
                        >
                          Add a product now
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const qty = Number(p.quantity)
                  const threshold = Number(p.min_stock_threshold || 10)
                  const isOutOfStock = qty <= 0
                  const isLowStock = qty > 0 && qty < threshold

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-900/40 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                        #{p.id}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-100 group-hover:text-blue-300 transition-colors">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {p.sku ? `SKU: ${p.sku} • ` : ''}
                          {p.supplier_name ? `Vendor: ${p.supplier_name}` : ''}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-xs px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                          {p.category || 'General'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        ₹{Number(p.price).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        ₹{Number(p.cost_price || 0).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 font-bold">
                        <span
                          className={
                            isOutOfStock
                              ? 'text-rose-400'
                              : isLowStock
                              ? 'text-amber-400'
                              : 'text-slate-100'
                          }
                        >
                          {qty} <span className="text-[11px] text-slate-500 font-normal">/ {threshold} min</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <XCircle className="w-3 h-3" /> Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <AlertTriangle className="w-3 h-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> In Stock
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details */}
                          <button
                            onClick={() => onViewProduct(p)}
                            title="View Product Specs & Sales"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Owner Only Adjust, Edit & Delete */}
                          {isOwner && (
                            <>
                              {onAdjustStock && (
                                <button
                                  onClick={() => onAdjustStock(p)}
                                  title="Adjust Stock Quantity"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all cursor-pointer"
                                >
                                  <SlidersHorizontal className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                onClick={() => onEditProduct(p)}
                                title="Edit Product"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => onDeleteProduct(p)}
                                title="Delete Product"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="px-6 py-3 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-slate-200">{filteredProducts.length}</strong> of{' '}
            <strong className="text-slate-200">{products.length}</strong> catalog items
          </span>
          {onlyLowStock && (
            <span className="text-amber-400 font-medium">
              Filtered: Low stock items only
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
