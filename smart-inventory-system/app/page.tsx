'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  User,
  Product,
  Sale,
  AnalyticsData,
  Supplier,
  Customer,
  Purchase,
  ProductBatch,
  SaleReturn,
  InventoryMovement,
  ActivityLog,
  NotificationItem,
  DateRangeType
} from '@/lib/types'
import { api } from '@/lib/api'
import { toast } from 'sonner'

// Layout Components
import { Sidebar, NavSection } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { LoginView } from '@/components/auth/login-view'
import { GlobalSearchModal } from '@/components/layout/global-search-modal'

// Dashboard Components
import { OwnerDashboard } from '@/components/dashboard/owner-dashboard'
import { CashierDashboard } from '@/components/dashboard/cashier-dashboard'

// Product & Inventory Components
import { ProductTable } from '@/components/products/product-table'
import { ProductModal } from '@/components/products/product-modal'
import { ProductDetailModal } from '@/components/products/product-detail-modal'
import { DeleteConfirmDialog } from '@/components/products/delete-confirm-dialog'
import { LowStockPage } from '@/components/inventory/low-stock-page'
import { MovementTable } from '@/components/inventory/movement-table'
import { StockAdjustmentModal } from '@/components/inventory/stock-adjustment-modal'

// Purchases & Stock-In
import { PurchaseTable } from '@/components/purchases/purchase-table'
import { NewPurchaseModal } from '@/components/purchases/new-purchase-modal'

// Suppliers & Customers
import { SupplierTable } from '@/components/suppliers/supplier-table'
import { SupplierModal } from '@/components/suppliers/supplier-modal'
import { SupplierDetailModal } from '@/components/suppliers/supplier-detail-modal'
import { CustomerTable } from '@/components/customers/customer-table'
import { CustomerModal } from '@/components/customers/customer-modal'
import { CustomerDetailModal } from '@/components/customers/customer-detail-modal'

// Sales, Returns & Receipts
import { SalesTable } from '@/components/sales/sales-table'
import { NewSaleModal } from '@/components/sales/new-sale-modal'
import { ReceiptModal } from '@/components/sales/receipt-modal'
import { SaleReturnModal } from '@/components/sales/sale-return-modal'

// Analytics, Reports & Logs
import { AnalyticsView } from '@/components/analytics/analytics-view'
import { ReportExport } from '@/components/analytics/report-export'
import { ActivityLogTable } from '@/components/audit/activity-log-table'
import { ProfileView } from '@/components/profile/profile-view'

export default function Page() {
  const [user, setUser] = useState<User | null>(null)

  // Enterprise Data States
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [batches, setBatches] = useState<ProductBatch[]>([])
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)

  const [currentSection, setCurrentSection] = useState<NavSection>('overview')
  const [analyticsRange, setAnalyticsRange] = useState<DateRangeType>('7days')

  // Modals & Active Selections
  const [showSearchModal, setShowSearchModal] = useState(false)

  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)

  const [showStockAdjustModal, setShowStockAdjustModal] = useState(false)
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null)

  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [purchaseInitialSupplier, setPurchaseInitialSupplier] = useState<number | undefined>(undefined)

  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [showSupplierDetail, setShowSupplierDetail] = useState(false)
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null)

  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [showCustomerDetail, setShowCustomerDetail] = useState(false)
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null)

  const [showSaleModal, setShowSaleModal] = useState(false)
  const [saleInitialProduct, setSaleInitialProduct] = useState<Product | null>(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [viewingSale, setViewingSale] = useState<Sale | null>(null)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [returningSale, setReturningSale] = useState<Sale | null>(null)

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingItem, setDeletingItem] = useState<{
    type: 'product' | 'sale' | 'supplier' | 'customer'
    id: number
    name: string
  } | null>(null)
  const [deletingLoading, setDeletingLoading] = useState(false)

  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (savedUser && token) {
      try {
        const parsed = JSON.parse(savedUser)
        setUser(parsed)
      } catch {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
  }, [])

  // Master Data Loader
  const loadData = useCallback(async (quiet = false, range: DateRangeType = analyticsRange, start?: string, end?: string) => {
    if (!quiet) setLoading(true)
    setIsRefreshing(true)

    try {
      const [
        prodsData,
        salesData,
        suppliersData,
        customersData,
        purchasesData,
        batchesData,
        movementsData,
        logsData,
        notifsData,
        analyticsData,
      ] = await Promise.all([
        api.getProducts().catch(() => []),
        api.getSales().catch(() => []),
        api.getSuppliers().catch(() => []),
        api.getCustomers().catch(() => []),
        api.getPurchases().catch(() => []),
        api.getBatches().catch(() => []),
        api.getMovements().catch(() => []),
        api.getActivityLogs().catch(() => []),
        api.getNotifications().catch(() => []),
        api.getAnalytics({ range, start_date: start, end_date: end }).catch(() => null),
      ])

      setProducts(prodsData)
      setSales(salesData)
      setSuppliers(suppliersData)
      setCustomers(customersData)
      setPurchases(purchasesData)
      setBatches(batchesData)
      setMovements(movementsData)
      setLogs(logsData)
      setNotifications(notifsData)

      if (analyticsData) {
        setAnalytics(analyticsData)
      } else {
        // Fallback calculations
        const totalRev = salesData.reduce((sum, s) => sum + Number(s.total), 0)
        const totalUnits = prodsData.reduce((sum, p) => sum + p.quantity, 0)
        const lowStock = prodsData.filter((p) => Number(p.quantity) < Number(p.min_stock_threshold || 10))

        setAnalytics({
          total_products: prodsData.length,
          total_stock: totalUnits,
          total_stock_value: prodsData.reduce((sum, p) => sum + Number(p.price) * p.quantity, 0),
          total_sales_count: salesData.length,
          total_revenue: totalRev,
          today_sales_count: salesData.length,
          today_revenue: totalRev,
          low_stock_count: lowStock.length,
          low_stock_products: lowStock,
          best_selling_products: [],
          category_breakdown: [],
          daily_sales: [],
        })
      }
    } catch (err: any) {
      console.error('Failed to load inventory data:', err)
      toast.error('Could not connect to the backend server. Please verify backend is running.')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [analyticsRange])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, loadData])

  // Logout handler
  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    toast.info('Logged out successfully.')
  }

  // --- ACTIONS & MUTATIONS ---

  // 1. Products
  const handleSaveProduct = async (productData: Partial<Product>) => {
    if (editingProduct) {
      await api.updateProduct(editingProduct.id, productData)
      toast.success(`Updated '${productData.name}' successfully.`)
    } else {
      await api.createProduct(productData)
      toast.success(`Created product '${productData.name}' successfully.`)
    }
    await loadData(true)
  }

  // 2. Manual Stock Adjustment
  const handleAdjustStock = async (payload: {
    product_id: number
    adjustment_type: 'INCREASE' | 'DECREASE' | 'SET'
    quantity: number
    reason: string
  }) => {
    await api.adjustStock(payload)
    toast.success('Inventory stock adjustment applied and logged to audit trail!')
    await loadData(true)
  }

  // 3. Purchases (Stock-In)
  const handleSavePurchase = async (purchaseData: Partial<Purchase>) => {
    await api.createPurchase(purchaseData)
    toast.success('Procurement stock-in recorded and inventory increased!')
    await loadData(true)
  }

  // 4. Suppliers
  const handleSaveSupplier = async (supplierData: Partial<Supplier>) => {
    if (editingSupplier) {
      await api.updateSupplier(editingSupplier.id, supplierData)
      toast.success(`Updated vendor '${supplierData.name}'.`)
    } else {
      await api.createSupplier(supplierData)
      toast.success(`Registered new vendor '${supplierData.name}'.`)
    }
    await loadData(true)
  }

  // 5. Customers
  const handleSaveCustomer = async (customerData: Partial<Customer>) => {
    if (editingCustomer) {
      await api.updateCustomer(editingCustomer.id, customerData)
      toast.success(`Updated customer '${customerData.name}'.`)
    } else {
      await api.createCustomer(customerData)
      toast.success(`Created customer '${customerData.name}'.`)
    }
    await loadData(true)
  }

  // 6. POS Sales
  const handleRecordSale = async (saleData: {
    product: number
    quantity: number
    price?: number
    customer?: number | null
    discount_percent?: number
    tax_percent?: number
  }) => {
    const newSale = await api.recordSale(saleData)
    toast.success('Sale transaction completed and receipt ready!')
    setViewingSale(newSale)
    setShowReceiptModal(true)
    await loadData(true)
  }

  // 7. Sales Returns
  const handleProcessReturn = async (payload: {
    sale: number
    product: number
    quantity: number
    reason: string
  }) => {
    await api.createReturn(payload)
    toast.success('Return processed successfully! Refund logged and stock restored.')
    await loadData(true)
  }

  // 8. Deletions
  const handleConfirmDelete = async () => {
    if (!deletingItem) return
    setDeletingLoading(true)

    try {
      if (deletingItem.type === 'product') {
        await api.deleteProduct(deletingItem.id)
        toast.success(`Deleted product '${deletingItem.name}'.`)
      } else if (deletingItem.type === 'sale') {
        await api.deleteSale(deletingItem.id)
        toast.success(`Cancelled order #${deletingItem.id} and restored stock.`)
      } else if (deletingItem.type === 'supplier') {
        await api.deleteSupplier(deletingItem.id)
        toast.success(`Deleted supplier '${deletingItem.name}'.`)
      } else if (deletingItem.type === 'customer') {
        await api.deleteCustomer(deletingItem.id)
        toast.success(`Deleted customer profile '${deletingItem.name}'.`)
      }
      setShowDeleteDialog(false)
      setDeletingItem(null)
      await loadData(true)
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete deletion.')
    } finally {
      setDeletingLoading(false)
    }
  }

  // Date Range change for Analytics
  const handleRangeChange = async (range: DateRangeType, start?: string, end?: string) => {
    setAnalyticsRange(range)
    await loadData(true, range, start, end)
  }

  // Unauthenticated view
  if (!user) {
    return <LoginView onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />
  }

  const isOwner = user.role === 'owner'
  const lowStockItems = products.filter((p) => Number(p.quantity) < Number(p.min_stock_threshold || 10))
  const expiringBatches = batches.filter((b) => b.is_expiring_soon || b.is_expired)
  const existingCategories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean) as string[]

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        user={user}
        currentSection={currentSection}
        onSelectSection={(sec) => {
          setCurrentSection(sec)
          setMobileMenuOpen(false)
        }}
        onLogout={handleLogout}
        lowStockCount={lowStockItems.length}
        expiringCount={expiringBatches.length}
        unreadNotificationsCount={notifications.filter((n) => !n.is_read).length}
      />

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Workspace */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0 min-h-screen">
        {/* Universal Header */}
        <Header
          user={user}
          currentSection={currentSection}
          onOpenProductModal={
            isOwner
              ? () => {
                  setEditingProduct(null)
                  setShowProductModal(true)
                }
              : undefined
          }
          onOpenSaleModal={() => {
            setSaleInitialProduct(null)
            setShowSaleModal(true)
          }}
          onOpenPurchaseModal={
            isOwner
              ? () => {
                  setPurchaseInitialSupplier(undefined)
                  setShowPurchaseModal(true)
                }
              : undefined
          }
          onOpenSearchModal={() => setShowSearchModal(true)}
          onRefresh={() => loadData(true)}
          isRefreshing={isRefreshing}
          lowStockProducts={lowStockItems}
          expiringBatches={expiringBatches}
          persistedNotifications={notifications}
          onRefreshNotifications={() => loadData(true)}
          onNavigateSection={(sec) => setCurrentSection(sec)}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        {/* Dynamic Section View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* SECTION: DASHBOARD / OVERVIEW */}
          {currentSection === 'overview' && (
            <div className="animate-in fade-in duration-200">
              {isOwner ? (
                <OwnerDashboard
                  analytics={analytics || ({} as any)}
                  products={products}
                  sales={sales}
                  purchases={purchases}
                  expiringBatches={expiringBatches}
                  onNavigateSection={(sec) => setCurrentSection(sec as NavSection)}
                  onOpenProductModal={() => {
                    setEditingProduct(null)
                    setShowProductModal(true)
                  }}
                  onOpenSaleModal={() => {
                    setSaleInitialProduct(null)
                    setShowSaleModal(true)
                  }}
                  onOpenPurchaseModal={() => {
                    setPurchaseInitialSupplier(undefined)
                    setShowPurchaseModal(true)
                  }}
                  onViewReceipt={(s) => {
                    setViewingSale(s)
                    setShowReceiptModal(true)
                  }}
                />
              ) : (
                <CashierDashboard
                  analytics={analytics || ({} as any)}
                  products={products}
                  sales={sales}
                  onOpenSaleModal={(p) => {
                    setSaleInitialProduct(p || null)
                    setShowSaleModal(true)
                  }}
                  onViewReceipt={(s) => {
                    setViewingSale(s)
                    setShowReceiptModal(true)
                  }}
                  onNavigateSection={(sec) => setCurrentSection(sec as NavSection)}
                />
              )}
            </div>
          )}

          {/* SECTION: PRODUCTS / INVENTORY */}
          {currentSection === 'products' && (
            <div className="animate-in fade-in duration-200">
              <ProductTable
                products={products}
                isOwner={isOwner}
                onAddProduct={() => {
                  setEditingProduct(null)
                  setShowProductModal(true)
                }}
                onEditProduct={(p) => {
                  setEditingProduct(p)
                  setShowProductModal(true)
                }}
                onDeleteProduct={(p) => {
                  setDeletingItem({
                    type: 'product',
                    id: p.id,
                    name: `${p.name} (#${p.id})`,
                  })
                  setShowDeleteDialog(true)
                }}
                onViewProduct={(p) => {
                  setViewingProduct(p)
                  setShowDetailModal(true)
                }}
                onAdjustStock={(p) => {
                  setAdjustingProduct(p)
                  setShowStockAdjustModal(true)
                }}
                loading={loading}
              />
            </div>
          )}

          {/* SECTION: LOW STOCK ALERTS */}
          {currentSection === 'low_stock' && (
            <div className="animate-in fade-in duration-200">
              <LowStockPage
                products={products}
                isOwner={isOwner}
                onOpenPurchaseModal={() => {
                  setPurchaseInitialSupplier(undefined)
                  setShowPurchaseModal(true)
                }}
                onAdjustStock={(p) => {
                  setAdjustingProduct(p)
                  setShowStockAdjustModal(true)
                }}
                onViewProduct={(p) => {
                  setViewingProduct(p)
                  setShowDetailModal(true)
                }}
              />
            </div>
          )}

          {/* SECTION: PURCHASES / PROCUREMENT */}
          {currentSection === 'purchases' && isOwner && (
            <div className="animate-in fade-in duration-200">
              <PurchaseTable
                purchases={purchases}
                suppliers={suppliers}
                products={products}
                isOwner={isOwner}
                onNewPurchase={() => {
                  setPurchaseInitialSupplier(undefined)
                  setShowPurchaseModal(true)
                }}
                loading={loading}
              />
            </div>
          )}

          {/* SECTION: SALES & POS */}
          {currentSection === 'sales' && (
            <div className="animate-in fade-in duration-200">
              <SalesTable
                sales={sales}
                products={products}
                customers={customers}
                isOwner={isOwner}
                onNewSale={() => {
                  setSaleInitialProduct(null)
                  setShowSaleModal(true)
                }}
                onDeleteSale={(s) => {
                  setDeletingItem({
                    type: 'sale',
                    id: s.id,
                    name: `Order #${s.id} (${s.product_name} x ${s.quantity} pcs)`,
                  })
                  setShowDeleteDialog(true)
                }}
                onViewReceipt={(s) => {
                  setViewingSale(s)
                  setShowReceiptModal(true)
                }}
                onProcessReturn={(s) => {
                  setReturningSale(s)
                  setShowReturnModal(true)
                }}
                loading={loading}
              />
            </div>
          )}

          {/* SECTION: STOCK ACTIVITY AUDIT */}
          {currentSection === 'movements' && (
            <div className="animate-in fade-in duration-200">
              <MovementTable
                movements={movements}
                products={products}
                loading={loading}
              />
            </div>
          )}

          {/* SECTION: SUPPLIERS */}
          {currentSection === 'suppliers' && isOwner && (
            <div className="animate-in fade-in duration-200">
              <SupplierTable
                suppliers={suppliers}
                isOwner={isOwner}
                onAddSupplier={() => {
                  setEditingSupplier(null)
                  setShowSupplierModal(true)
                }}
                onEditSupplier={(s) => {
                  setEditingSupplier(s)
                  setShowSupplierModal(true)
                }}
                onDeleteSupplier={(s) => {
                  setDeletingItem({
                    type: 'supplier',
                    id: s.id,
                    name: `${s.name} (#${s.id})`,
                  })
                  setShowDeleteDialog(true)
                }}
                onViewSupplier={(s) => {
                  setViewingSupplier(s)
                  setShowSupplierDetail(true)
                }}
                loading={loading}
              />
            </div>
          )}

          {/* SECTION: CUSTOMERS */}
          {currentSection === 'customers' && (
            <div className="animate-in fade-in duration-200">
              <CustomerTable
                customers={customers}
                isOwner={isOwner}
                onAddCustomer={() => {
                  setEditingCustomer(null)
                  setShowCustomerModal(true)
                }}
                onEditCustomer={(c) => {
                  setEditingCustomer(c)
                  setShowCustomerModal(true)
                }}
                onDeleteCustomer={(c) => {
                  setDeletingItem({
                    type: 'customer',
                    id: c.id,
                    name: `${c.name} (#${c.id})`,
                  })
                  setShowDeleteDialog(true)
                }}
                onViewCustomer={(c) => {
                  setViewingCustomer(c)
                  setShowCustomerDetail(true)
                }}
                loading={loading}
              />
            </div>
          )}

          {/* SECTION: PROFIT & ANALYTICS */}
          {currentSection === 'analytics' && isOwner && (
            <div className="animate-in fade-in duration-200">
              <AnalyticsView
                data={analytics || ({} as any)}
                currentRange={analyticsRange}
                onRangeChange={handleRangeChange}
                loading={loading}
              />
            </div>
          )}

          {/* SECTION: REPORTS & EXPORT */}
          {currentSection === 'reports' && isOwner && (
            <div className="animate-in fade-in duration-200">
              <ReportExport
                products={products}
                sales={sales}
                purchases={purchases}
                suppliers={suppliers}
                customers={customers}
                movements={movements}
                analytics={analytics || ({} as any)}
              />
            </div>
          )}

          {/* SECTION: SYSTEM AUDIT LOG */}
          {currentSection === 'logs' && isOwner && (
            <div className="animate-in fade-in duration-200">
              <ActivityLogTable
                logs={logs}
                loading={loading}
              />
            </div>
          )}

          {/* SECTION: USER PROFILE & SECURITY */}
          {currentSection === 'profile' && (
            <div className="animate-in fade-in duration-200">
              <ProfileView
                user={user}
                onLogout={handleLogout}
              />
            </div>
          )}
        </main>
      </div>

      {/* --- ENTERPRISE MODALS & DIALOGS --- */}

      {/* Universal Search Modal (Cmd+K) */}
      <GlobalSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectProduct={(p) => {
          setViewingProduct(p)
          setShowDetailModal(true)
        }}
        onSelectSale={(s) => {
          setViewingSale(s)
          setShowReceiptModal(true)
        }}
        onNavigateSection={(sec) => setCurrentSection(sec as NavSection)}
      />

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false)
          setEditingProduct(null)
        }}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
        existingCategories={existingCategories}
        suppliers={suppliers}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setViewingProduct(null)
        }}
        product={viewingProduct}
        sales={sales}
        onEdit={(p) => {
          setEditingProduct(p)
          setShowProductModal(true)
        }}
        onAdjustStock={(p) => {
          setAdjustingProduct(p)
          setShowStockAdjustModal(true)
        }}
        isOwner={isOwner}
      />

      {/* Manual Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={showStockAdjustModal}
        onClose={() => {
          setShowStockAdjustModal(false)
          setAdjustingProduct(null)
        }}
        products={products}
        initialProduct={adjustingProduct}
        onAdjustStock={handleAdjustStock}
      />

      {/* New Purchase (Stock-In) Modal */}
      <NewPurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => {
          setShowPurchaseModal(false)
          setPurchaseInitialSupplier(undefined)
        }}
        suppliers={suppliers}
        products={products}
        initialSupplierId={purchaseInitialSupplier}
        onSavePurchase={handleSavePurchase}
      />

      {/* Supplier Create/Edit Modal */}
      <SupplierModal
        isOpen={showSupplierModal}
        onClose={() => {
          setShowSupplierModal(false)
          setEditingSupplier(null)
        }}
        onSave={handleSaveSupplier}
        initialSupplier={editingSupplier}
      />

      {/* Supplier Detail Modal */}
      <SupplierDetailModal
        isOpen={showSupplierDetail}
        onClose={() => {
          setShowSupplierDetail(false)
          setViewingSupplier(null)
        }}
        supplier={viewingSupplier}
        purchases={purchases}
        products={products}
        onNewPurchase={(s) => {
          setPurchaseInitialSupplier(s.id)
          setShowPurchaseModal(true)
        }}
      />

      {/* Customer Create/Edit Modal */}
      <CustomerModal
        isOpen={showCustomerModal}
        onClose={() => {
          setShowCustomerModal(false)
          setEditingCustomer(null)
        }}
        onSave={handleSaveCustomer}
        initialCustomer={editingCustomer}
      />

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        isOpen={showCustomerDetail}
        onClose={() => {
          setShowCustomerDetail(false)
          setViewingCustomer(null)
        }}
        customer={viewingCustomer}
        sales={sales}
        onViewReceipt={(s) => {
          setViewingSale(s)
          setShowReceiptModal(true)
        }}
      />

      {/* New Sale POS Modal */}
      <NewSaleModal
        isOpen={showSaleModal}
        onClose={() => {
          setShowSaleModal(false)
          setSaleInitialProduct(null)
        }}
        products={products}
        customers={customers}
        initialProduct={saleInitialProduct}
        onRecordSale={handleRecordSale}
      />

      {/* Sales Return Modal */}
      <SaleReturnModal
        isOpen={showReturnModal}
        onClose={() => {
          setShowReturnModal(false)
          setReturningSale(null)
        }}
        sale={returningSale}
        onProcessReturn={handleProcessReturn}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => {
          setShowReceiptModal(false)
          setViewingSale(null)
        }}
        sale={viewingSale}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setDeletingItem(null)
        }}
        onConfirm={handleConfirmDelete}
        title={
          deletingItem?.type === 'product'
            ? 'Delete Product Item?'
            : deletingItem?.type === 'sale'
            ? 'Cancel & Delete Sale Order?'
            : deletingItem?.type === 'supplier'
            ? 'Delete Supplier Vendor?'
            : 'Delete Customer Profile?'
        }
        description={
          deletingItem?.type === 'product'
            ? 'This will remove the product permanently from your catalog. This action cannot be undone.'
            : deletingItem?.type === 'sale'
            ? 'Deleting this sale will cancel the record and automatically restore the sold quantity back to inventory stock.'
            : deletingItem?.type === 'supplier'
            ? 'This will remove the vendor from your active supplier directory.'
            : 'This will remove the client profile from your customer directory.'
        }
        itemName={deletingItem?.name}
        loading={deletingLoading}
      />
    </div>
  )
}
