export type CustomerType = 'individual' | 'company'

export interface Customer {
  id: string
  establishment_id: string
  type: CustomerType
  name: string
  trade_name: string | null
  document: string | null
  email: string | null
  phone: string | null
  address: string | null
  address_number: string | null
  address_complement: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  establishment_id: string
  parent_id: string | null
  parent?: { id: string; name: string } | null
  name: string
  slug: string
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  establishment_id: string
  company_name: string
  trade_name: string | null
  cnpj: string | null
  contact_name: string | null
  email: string | null
  phone: string | null
  website: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ProductUnit = 'un' | 'kg' | 'g' | 'l' | 'ml' | 'cx'

export interface Product {
  id: string
  establishment_id: string
  category_id: string | null
  supplier_id: string | null
  name: string
  description: string | null
  brand: string | null
  sku: string | null
  barcode: string | null
  unit: ProductUnit
  cost_price: string
  sale_price: string
  stock_quantity: number
  min_stock_quantity: number
  image_path: string | null
  is_active: boolean
  is_low_stock: boolean
  category: { id: string; name: string } | null
  supplier: { id: string; company_name: string } | null
  created_at: string
  updated_at: string
}

export type StockMovementType = 'in' | 'out' | 'adjustment'

export interface StockMovement {
  id: string
  product_id: string
  user_id: string
  type: StockMovementType
  quantity: number
  stock_before: number
  stock_after: number
  cost_price: string | null
  description: string | null
  product: { id: string; name: string } | null
  user: { id: string; name: string } | null
  created_at: string
}

export type OrderStatus = 'pending' | 'paid' | 'canceled'
export type PaymentMethod = 'credit_card' | 'debit_card' | 'pix' | 'cash' | 'bank_transfer' | 'other'
export type DiscountType = 'fixed' | 'percentage'

export interface OrderItem {
  id: string
  product_id: string
  quantity: number
  unit_price: string
  cost_price: string
  discount_amount: string
  total_price: string
  notes: string | null
  product: { id: string; name: string; sku: string | null } | null
}

export interface Order {
  id: string
  order_number: string
  status: OrderStatus
  payment_method: PaymentMethod | null
  subtotal_amount: string
  discount_amount: string
  discount_type: DiscountType
  total_amount: string
  paid_at: string | null
  notes: string | null
  items_count?: number
  items?: OrderItem[]
  customer: { id: string; name: string } | null
  user: { id: string; name: string } | null
  created_at: string
  updated_at: string
}

export type AuditEvent = 'created' | 'updated' | 'deleted' | 'login' | 'logout'

export interface AuditLog {
  id: string
  event: AuditEvent
  module: string
  model_type: string | null
  model_id: string | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  ip_address: string | null
  user: { id: string; name: string } | null
  created_at: string
}

export interface DashboardMetric {
  current: string
  previous: string | null
  change_percent: number | null
}

export interface DashboardOrders {
  total: number
  paid: number
  pending: number
  canceled: number
  previous_paid: number | null
  change_percent: number | null
}

export interface DashboardLowStockItem {
  id: string
  name: string
  sku: string | null
  stock_quantity: number
  min_stock_quantity: number
  unit: string
}

export interface DashboardRecentOrder {
  id: string
  order_number: string
  status: OrderStatus
  total_amount: string
  customer: { id: string; name: string } | null
  user: { id: string; name: string } | null
  created_at: string
}

export interface DashboardData {
  period: { key: string; label: string; date_from: string; date_to: string }
  revenue: DashboardMetric
  orders: DashboardOrders
  avg_ticket: { current: string; change_percent: number | null }
  low_stock_count: number
  low_stock: DashboardLowStockItem[]
  recent_orders: DashboardRecentOrder[]
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}
