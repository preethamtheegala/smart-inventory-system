import {
  User, Product, Sale, AnalyticsData, Supplier, Customer,
  ProductBatch, Purchase, SaleReturn, InventoryMovement, ActivityLog,
  NotificationItem, GlobalSearchResult, UserProfile, DateRangeType
} from './types'

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api'

// Centralized request wrapper with Token authentication and informative error handling
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Token ${token}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (response.status === 204) {
      return {} as T
    }

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      let message = 'An error occurred with the server request.'
      if (typeof data === 'object' && data !== null) {
        if (data.error) {
          message = data.error
        } else if (data.detail) {
          message = data.detail
        } else if (data.quantity) {
          message = Array.isArray(data.quantity) ? data.quantity.join(' ') : String(data.quantity)
        } else {
          message = Object.entries(data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
            .join(' | ') || `HTTP Error ${response.status}`
        }
      }
      throw new Error(message)
    }

    return data as T
  } catch (error: any) {
    console.error(`API Error on [${options.method || 'GET'} ${url}]:`, error)
    throw error
  }
}

export const api = {
  // Authentication & Profile
  login: async (credentials: { username: string; password: string }): Promise<User> => {
    return request<User>('login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  getProfile: async (): Promise<UserProfile> => {
    return request<UserProfile>('profile/')
  },

  changePassword: async (passwords: { old_password: string; new_password: string }): Promise<{ success: boolean; message: string; token: string }> => {
    return request<{ success: boolean; message: string; token: string }>('change-password/', {
      method: 'POST',
      body: JSON.stringify(passwords),
    })
  },

  // Products
  getProducts: async (params?: { search?: string; category?: string; low_stock?: boolean; out_of_stock?: boolean; supplier?: number }): Promise<Product[]> => {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    if (params?.category && params.category !== 'All') query.set('category', params.category)
    if (params?.low_stock) query.set('low_stock', 'true')
    if (params?.out_of_stock) query.set('out_of_stock', 'true')
    if (params?.supplier) query.set('supplier', String(params.supplier))

    const qs = query.toString()
    return request<Product[]>(`products/${qs ? `?${qs}` : ''}`)
  },

  createProduct: async (data: Partial<Product>): Promise<Product> => {
    return request<Product>('products/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateProduct: async (id: number, data: Partial<Product>): Promise<Product> => {
    return request<Product>(`products/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  deleteProduct: async (id: number): Promise<void> => {
    return request<void>(`products/${id}/`, {
      method: 'DELETE',
    })
  },

  adjustStock: async (payload: { product_id: number; adjustment_type: 'INCREASE' | 'DECREASE' | 'SET'; quantity: number; reason: string }): Promise<any> => {
    return request('inventory/adjust/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  // Suppliers
  getSuppliers: async (params?: { search?: string; status?: string }): Promise<Supplier[]> => {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    if (params?.status && params.status !== 'All') query.set('status', params.status)
    const qs = query.toString()
    return request<Supplier[]>(`suppliers/${qs ? `?${qs}` : ''}`)
  },

  createSupplier: async (data: Partial<Supplier>): Promise<Supplier> => {
    return request<Supplier>('suppliers/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateSupplier: async (id: number, data: Partial<Supplier>): Promise<Supplier> => {
    return request<Supplier>(`suppliers/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  deleteSupplier: async (id: number): Promise<void> => {
    return request<void>(`suppliers/${id}/`, {
      method: 'DELETE',
    })
  },

  // Customers
  getCustomers: async (params?: { search?: string }): Promise<Customer[]> => {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    const qs = query.toString()
    return request<Customer[]>(`customers/${qs ? `?${qs}` : ''}`)
  },

  createCustomer: async (data: Partial<Customer>): Promise<Customer> => {
    return request<Customer>('customers/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateCustomer: async (id: number, data: Partial<Customer>): Promise<Customer> => {
    return request<Customer>(`customers/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  deleteCustomer: async (id: number): Promise<void> => {
    return request<void>(`customers/${id}/`, {
      method: 'DELETE',
    })
  },

  // Purchases (Stock-In)
  getPurchases: async (params?: { search?: string; supplier?: number; product?: number; start_date?: string; end_date?: string }): Promise<Purchase[]> => {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    if (params?.supplier) query.set('supplier', String(params.supplier))
    if (params?.product) query.set('product', String(params.product))
    if (params?.start_date) query.set('start_date', params.start_date)
    if (params?.end_date) query.set('end_date', params.end_date)
    const qs = query.toString()
    return request<Purchase[]>(`purchases/${qs ? `?${qs}` : ''}`)
  },

  createPurchase: async (data: Partial<Purchase>): Promise<Purchase> => {
    return request<Purchase>('purchases/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Product Batches
  getBatches: async (params?: { product?: number; status?: 'expiring_soon' | 'expired' }): Promise<ProductBatch[]> => {
    const query = new URLSearchParams()
    if (params?.product) query.set('product', String(params.product))
    if (params?.status) query.set('status', params.status)
    const qs = query.toString()
    return request<ProductBatch[]>(`batches/${qs ? `?${qs}` : ''}`)
  },

  // Sales
  getSales: async (params?: { search?: string; customer?: number; product?: number; date?: string; start_date?: string; end_date?: string }): Promise<Sale[]> => {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    if (params?.customer) query.set('customer', String(params.customer))
    if (params?.product) query.set('product', String(params.product))
    if (params?.date) query.set('date', params.date)
    if (params?.start_date) query.set('start_date', params.start_date)
    if (params?.end_date) query.set('end_date', params.end_date)

    const qs = query.toString()
    return request<Sale[]>(`sales/${qs ? `?${qs}` : ''}`)
  },

  recordSale: async (data: {
    product: number
    quantity: number
    price?: number
    customer?: number | null
    discount_percent?: number
    tax_percent?: number
  }): Promise<Sale> => {
    return request<Sale>('sales/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  deleteSale: async (id: number): Promise<void> => {
    return request<void>(`sales/${id}/`, {
      method: 'DELETE',
    })
  },

  // Sales Returns
  getReturns: async (params?: { sale?: number; product?: number }): Promise<SaleReturn[]> => {
    const query = new URLSearchParams()
    if (params?.sale) query.set('sale', String(params.sale))
    if (params?.product) query.set('product', String(params.product))
    const qs = query.toString()
    return request<SaleReturn[]>(`returns/${qs ? `?${qs}` : ''}`)
  },

  createReturn: async (data: { sale: number; product?: number; quantity: number; reason: string }): Promise<SaleReturn> => {
    return request<SaleReturn>('returns/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Inventory Movements & Audit Logs
  getMovements: async (params?: { product?: number; type?: string; start_date?: string; end_date?: string; search?: string }): Promise<InventoryMovement[]> => {
    const query = new URLSearchParams()
    if (params?.product) query.set('product', String(params.product))
    if (params?.type && params.type !== 'ALL') query.set('type', params.type)
    if (params?.start_date) query.set('start_date', params.start_date)
    if (params?.end_date) query.set('end_date', params.end_date)
    if (params?.search) query.set('search', params.search)
    const qs = query.toString()
    return request<InventoryMovement[]>(`movements/${qs ? `?${qs}` : ''}`)
  },

  getActivityLogs: async (params?: { action?: string; entity?: string; search?: string; start_date?: string; end_date?: string }): Promise<ActivityLog[]> => {
    const query = new URLSearchParams()
    if (params?.action && params.action !== 'ALL') query.set('action', params.action)
    if (params?.entity && params.entity !== 'ALL') query.set('entity', params.entity)
    if (params?.search) query.set('search', params.search)
    if (params?.start_date) query.set('start_date', params.start_date)
    if (params?.end_date) query.set('end_date', params.end_date)
    const qs = query.toString()
    return request<ActivityLog[]>(`logs/${qs ? `?${qs}` : ''}`)
  },

  // Notifications
  getNotifications: async (unreadOnly = false): Promise<NotificationItem[]> => {
    return request<NotificationItem[]>(`notifications/${unreadOnly ? '?unread=true' : ''}`)
  },

  markNotificationRead: async (id: number): Promise<void> => {
    return request<void>(`notifications/${id}/mark_read/`, {
      method: 'POST',
    })
  },

  markAllNotificationsRead: async (): Promise<void> => {
    return request<void>('notifications/mark_all_read/', {
      method: 'POST',
    })
  },

  // Global Search
  globalSearch: async (query: string): Promise<GlobalSearchResult> => {
    return request<GlobalSearchResult>(`search/?q=${encodeURIComponent(query)}`)
  },

  // Analytics & Profit
  getAnalytics: async (params?: { range?: DateRangeType; start_date?: string; end_date?: string }): Promise<AnalyticsData> => {
    const query = new URLSearchParams()
    if (params?.range) query.set('range', params.range)
    if (params?.start_date) query.set('start_date', params.start_date)
    if (params?.end_date) query.set('end_date', params.end_date)
    const qs = query.toString()
    return request<AnalyticsData>(`analytics/${qs ? `?${qs}` : ''}`)
  },
}
