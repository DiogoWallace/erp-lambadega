import { describe, it, expect } from 'vitest'
import { buildBody as buildCustomer } from '../customers/build-body'
import { buildBody as buildCategory } from '../categories/build-body'
import { buildBody as buildSupplier } from '../suppliers/build-body'
import { buildBody as buildProduct } from '../products/build-body'
import { buildBody as buildMovement } from '../stock-movements/build-body'

function fd(pairs: Record<string, string>): FormData {
  const form = new FormData()
  for (const [k, v] of Object.entries(pairs)) form.append(k, v)
  return form
}

// ── customers ───────────────────────────────────────────────────────────────

describe('customers buildBody', () => {
  it('maps all fields', () => {
    const body = buildCustomer(fd({
      type: 'pf', name: 'João', email: 'j@j.com',
      phone: '11999', is_active: 'true',
    }))
    expect(body.type).toBe('pf')
    expect(body.name).toBe('João')
    expect(body.email).toBe('j@j.com')
    expect(body.is_active).toBe(true)
  })

  it('is_active false when not "true"', () => {
    expect(buildCustomer(fd({ is_active: 'false' })).is_active).toBe(false)
    expect(buildCustomer(fd({})).is_active).toBe(false)
  })

  it('empty string fields become null', () => {
    const body = buildCustomer(fd({ document: '' }))
    expect(body.document).toBeNull()
  })

  it('missing name becomes undefined', () => {
    expect(buildCustomer(fd({})).name).toBeUndefined()
  })
})

// ── categories ───────────────────────────────────────────────────────────────

describe('categories buildBody', () => {
  it('converts sort_order to number', () => {
    expect(buildCategory(fd({ sort_order: '5' })).sort_order).toBe(5)
  })

  it('sort_order defaults to 0 when missing', () => {
    expect(buildCategory(fd({})).sort_order).toBe(0)
  })

  it('is_active maps correctly', () => {
    expect(buildCategory(fd({ is_active: 'true' })).is_active).toBe(true)
    expect(buildCategory(fd({ is_active: 'false' })).is_active).toBe(false)
  })

  it('parent_id null when empty', () => {
    expect(buildCategory(fd({})).parent_id).toBeNull()
  })
})

// ── suppliers ────────────────────────────────────────────────────────────────

describe('suppliers buildBody', () => {
  it('maps company_name', () => {
    const body = buildSupplier(fd({ company_name: 'ACME' }))
    expect(body.company_name).toBe('ACME')
  })

  it('empty strings become null', () => {
    const body = buildSupplier(fd({ cnpj: '' }))
    expect(body.cnpj).toBeNull()
  })

  it('is_active maps correctly', () => {
    expect(buildSupplier(fd({ is_active: 'true' })).is_active).toBe(true)
    expect(buildSupplier(fd({})).is_active).toBe(false)
  })
})

// ── products ─────────────────────────────────────────────────────────────────

describe('products buildBody', () => {
  it('parses numeric fields', () => {
    const body = buildProduct(fd({
      cost_price: '9.99', sale_price: '14.99',
      stock_quantity: '10', min_stock_quantity: '2',
    }))
    expect(body.cost_price).toBe(9.99)
    expect(body.sale_price).toBe(14.99)
    expect(body.stock_quantity).toBe(10)
    expect(body.min_stock_quantity).toBe(2)
  })

  it('numeric fields default to 0 when missing', () => {
    const body = buildProduct(fd({}))
    expect(body.cost_price).toBe(0)
    expect(body.sale_price).toBe(0)
    expect(body.stock_quantity).toBe(0)
    expect(body.min_stock_quantity).toBe(0)
  })

  it('unit defaults to "un"', () => {
    expect(buildProduct(fd({})).unit).toBe('un')
  })

  it('is_active maps correctly', () => {
    expect(buildProduct(fd({ is_active: 'true' })).is_active).toBe(true)
    expect(buildProduct(fd({ is_active: 'false' })).is_active).toBe(false)
  })

  it('category_id and supplier_id null when empty', () => {
    const body = buildProduct(fd({}))
    expect(body.category_id).toBeNull()
    expect(body.supplier_id).toBeNull()
  })
})

// ── stock movements ──────────────────────────────────────────────────────────

describe('stock-movements buildBody', () => {
  it('parses quantity as integer', () => {
    expect(buildMovement(fd({ quantity: '5' })).quantity).toBe(5)
  })

  it('quantity undefined when missing', () => {
    expect(buildMovement(fd({})).quantity).toBeUndefined()
  })

  it('parses cost_price as float', () => {
    expect(buildMovement(fd({ cost_price: '12.50' })).cost_price).toBe(12.5)
  })

  it('cost_price null when missing', () => {
    expect(buildMovement(fd({})).cost_price).toBeNull()
  })

  it('product_id and type undefined when missing', () => {
    const body = buildMovement(fd({}))
    expect(body.product_id).toBeUndefined()
    expect(body.type).toBeUndefined()
  })
})
