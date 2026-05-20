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
