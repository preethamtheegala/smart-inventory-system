export interface User {
  token: string
  username: string
  role: 'owner' | 'cashier'
}

export interface UserProfile {
  id: number
  username: string
  email: string
  role: 'owner' | 'cashier'
  first_name?: string
  last_name?: string
  date_joined?: string
  last_login?: string
}

export interface Supplier {
  id: number
  name: string
  company_name?: string
  phone?: string
  email?: string
  address?: string
  tax_id?: string
  status: 'active' | 'inactive'
  created_at: string
  total_purchases?: number
  total_spend?: number
  products_count?: number
}

export interface Customer {
  id: number
  name: string
  phone?: string
  email?: string
  address?: string
  created_at: string
  total_orders?: number
  total_spent?: number
}

export interface ProductBatch {
  id: number
  product: number
  product_name?: string
  batch_number: string
  expiry_date?: string
  quantity: number
  purchase_price: number | string
  supplier?: number
  supplier_name?: string
  is_expired?: boolean
  is_expiring_soon?: boolean
  created_at: string
}

export interface Product {
  id: number
  name: string
  category: string
  price: string | number
  cost_price?: string | number
  quantity: number
  min_stock_threshold: number
  sku?: string
  supplier?: number
  supplier_name?: string
  is_low_stock?: boolean
  is_out_of_stock?: boolean
  batches?: ProductBatch[]
  created_at: string
}

export interface SaleReturn {
  id: number
  sale: number
  product: number
  product_name?: string
  quantity: number
  refund_amount: string | number
  reason: string
  created_by_username?: string
  created_at: string
}

export interface Sale {
  id: number
  product: number
  product_name?: string
  product_category?: string
  customer?: number
  customer_name?: string
  quantity: number
  price: string | number
  subtotal?: string | number
  discount_percent?: string | number
  discount_amount?: string | number
  tax_percent?: string | number
  tax_amount?: string | number
  total: string | number
  cost_price?: string | number
  status: 'completed' | 'partially_returned' | 'returned'
  created_by_username?: string
  created_at: string
  returns?: SaleReturn[]
  returned_quantity?: number
}

export interface Purchase {
  id: number
  supplier: number
  supplier_name?: string
  product: number
  product_name?: string
  quantity: number
  cost_price: string | number
  total_cost: string | number
  invoice_no?: string
  notes?: string
  batch_number?: string
  expiry_date?: string
  created_by_username?: string
  purchase_date: string
  created_at: string
}

export interface InventoryMovement {
  id: number
  product: number
  product_name?: string
  movement_type: 'PURCHASE' | 'SALE' | 'SALE_RETURN' | 'MANUAL_ADJUSTMENT'
  previous_quantity: number
  new_quantity: number
  quantity_changed: number
  reason?: string
  reference_id?: string
  user_username?: string
  created_at: string
}

export interface ActivityLog {
  id: number
  user_username?: string
  action: string
  entity: string
  entity_id?: string
  description: string
  created_at: string
}

export interface NotificationItem {
  id: number
  title: string
  message: string
  notification_type: 'low_stock' | 'out_of_stock' | 'expiry' | 'sale' | 'adjustment' | 'system'
  is_read: boolean
  created_at: string
}

export interface GlobalSearchResult {
  products: Product[]
  sales: Sale[]
  customers: Customer[]
  suppliers: Supplier[]
  purchases: Purchase[]
}

export interface BestSellerProduct {
  product_id: number
  product_name: string
  category: string
  quantity_sold: number
  revenue: number
}

export interface ProfitableProduct {
  product_id: number
  product_name: string
  category: string
  revenue: number
  cogs: number
  profit: number
}

export interface CategoryProfitability {
  category: string
  revenue: number
  cogs: number
  profit: number
  units_sold: number
  margin_percent: number
}

export interface CategoryBreakdown {
  category: string
  product_count: number
  total_quantity: number
  total_value: number
}

export interface DailySalePoint {
  date: string
  display_date: string
  revenue: number
  cogs?: number
  profit?: number
  sales_count: number
}

export type DateRangeType = 'today' | 'yesterday' | '7days' | '30days' | 'this_month' | 'prev_month' | 'custom'

export interface AnalyticsData {
  range?: string
  start_date?: string
  end_date?: string
  total_products: number
  total_stock: number
  total_stock_value: number
  total_cost_value?: number
  low_stock_count: number
  out_of_stock_count?: number
  expiring_batches_count?: number
  total_sales_count: number
  total_units_sold?: number
  total_revenue: number
  total_cogs?: number
  gross_profit?: number
  gross_margin_percent?: number
  total_discounts?: number
  total_taxes?: number
  total_returns_amount?: number
  total_returned_units?: number
  net_revenue?: number
  avg_order_value?: number
  today_sales_count: number
  today_revenue: number
  low_stock_products: Product[]
  best_selling_products: BestSellerProduct[]
  top_profitable_products?: ProfitableProduct[]
  category_profitability?: CategoryProfitability[]
  category_breakdown: CategoryBreakdown[]
  daily_sales: DailySalePoint[]
}
