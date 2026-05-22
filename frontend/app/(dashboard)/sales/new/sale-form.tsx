'use client'

import { useActionState, useState, useMemo } from 'react'
import { Customer, Product } from '@/app/lib/types'

interface FormState {
  error?: string
  errors?: Record<string, string[]>
}

interface CartItem {
  productId: string
  productName: string
  sku: string | null
  quantity: number
  unitPrice: number
}

interface Props {
  action: (prevState: unknown, formData: FormData) => Promise<FormState | undefined>
  products: Product[]
  customers: Customer[]
}

const inputClass =
  'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent'

const PAYMENT_LABELS: Record<string, string> = {
  cash:          'Dinheiro',
  pix:           'Pix',
  credit_card:   'Cartão de crédito',
  debit_card:    'Cartão de débito',
  bank_transfer: 'Transferência bancária',
  other:         'Outro',
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function FieldError({ errors, field }: { errors?: Record<string, string[]>; field: string }) {
  const msg = errors?.[field]?.[0]
  if (!msg) return null
  return <p className="mt-1 text-xs text-red-600">{msg}</p>
}

export function SaleForm({ action, products, customers }: Props) {
  const [state, formAction, pending] = useActionState(action, null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed')
  const [discountAmount, setDiscountAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [installments, setInstallments] = useState(1)

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return products.slice(0, 20)
    return products
      .filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.toLowerCase().includes(q))
      )
      .slice(0, 20)
  }, [products, search])

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id)
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          quantity: 1,
          unitPrice: parseFloat(product.sale_price),
        },
      ]
    })
    setSearch('')
  }

  function updateQty(productId: string, qty: number) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.productId !== productId))
      return
    }
    setCart((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))
    )
  }

  function updatePrice(productId: string, price: number) {
    setCart((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, unitPrice: price } : i))
    )
  }

  function removeItem(productId: string) {
    setCart((prev) => prev.filter((i) => i.productId !== productId))
  }

  const subtotal = cart.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)

  const discountValue = useMemo(() => {
    if (discountType === 'fixed') return Math.min(discountAmount, subtotal)
    return Math.min((subtotal * discountAmount) / 100, subtotal)
  }, [discountType, discountAmount, subtotal])

  const total = subtotal - discountValue

  const cartJson = JSON.stringify(
    cart.map((i) => ({
      product_id: i.productId,
      quantity: i.quantity,
      unit_price: i.unitPrice,
    }))
  )

  return (
    <form action={formAction}>
      <input type="hidden" name="cart" value={cartJson} />
      <input type="hidden" name="discount_type" value={discountType} />
      <input type="hidden" name="discount_amount" value={discountAmount} />
      <input type="hidden" name="payment_method" value={paymentMethod} />
      <input type="hidden" name="installments" value={installments} />

      {state?.error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: product search */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-zinc-200 p-4">
            <h2 className="text-sm font-semibold text-zinc-700 mb-3">Adicionar produto</h2>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, SKU ou código de barras..."
              className={inputClass}
              autoComplete="off"
            />

            {search.trim() && (
              <div className="mt-2 border border-zinc-100 rounded-lg overflow-hidden divide-y divide-zinc-50">
                {filteredProducts.length === 0 ? (
                  <p className="px-3 py-3 text-sm text-zinc-400">Nenhum produto encontrado.</p>
                ) : (
                  filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addToCart(p)}
                      disabled={p.stock_quantity <= 0}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-zinc-50 transition-colors disabled:opacity-40"
                    >
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{p.name}</p>
                        <p className="text-xs text-zinc-400">
                          {p.sku ? `SKU: ${p.sku} · ` : ''}
                          Estoque: {p.stock_quantity}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-zinc-700 ml-4 shrink-0">
                        {formatCurrency(parseFloat(p.sale_price))}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}

            {!search.trim() && (
              <p className="mt-2 text-xs text-zinc-400">
                Digite para buscar produtos. Clique para adicionar ao carrinho.
              </p>
            )}
          </div>

          {/* Customer (optional) */}
          <div className="bg-white rounded-xl border border-zinc-200 p-4">
            <h2 className="text-sm font-semibold text-zinc-700 mb-3">Cliente (opcional)</h2>
            <select name="customer_id" className={inputClass}>
              <option value="">Consumidor final</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <FieldError errors={state?.errors} field="customer_id" />
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-zinc-200 p-4">
            <h2 className="text-sm font-semibold text-zinc-700 mb-3">Observações</h2>
            <textarea
              name="notes"
              rows={2}
              placeholder="Observações da venda..."
              className={inputClass}
            />
          </div>
        </div>

        {/* Right column: cart + payment */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-zinc-200 p-4">
            <h2 className="text-sm font-semibold text-zinc-700 mb-3">
              Carrinho {cart.length > 0 && <span className="text-zinc-400">({cart.length} item(ns))</span>}
            </h2>

            {cart.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-400">
                Nenhum produto adicionado.
              </p>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center gap-2 py-2 border-b border-zinc-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">{item.productName}</p>
                      {item.sku && <p className="text-xs text-zinc-400">SKU: {item.sku}</p>}
                    </div>

                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updatePrice(item.productId, parseFloat(e.target.value) || 0)}
                      className="w-24 rounded border border-zinc-200 px-2 py-1 text-sm text-right text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                      title="Preço unitário"
                    />

                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(e) => updateQty(item.productId, parseInt(e.target.value, 10) || 0)}
                      className="w-16 rounded border border-zinc-200 px-2 py-1 text-sm text-center text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                      title="Quantidade"
                    />

                    <span className="w-20 text-right text-sm font-semibold text-zinc-900 shrink-0">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="text-zinc-300 hover:text-red-500 transition-colors"
                      title="Remover"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Discount */}
            <div className="mt-4 pt-4 border-t border-zinc-100">
              <div className="flex gap-2 items-center">
                <select
                  value={discountType}
                  onChange={(e) => {
                    setDiscountType(e.target.value as 'fixed' | 'percentage')
                    setDiscountAmount(0)
                  }}
                  className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                >
                  <option value="fixed">Desconto R$</option>
                  <option value="percentage">Desconto %</option>
                </select>
                <input
                  type="number"
                  min="0"
                  step={discountType === 'fixed' ? '0.01' : '0.1'}
                  max={discountType === 'percentage' ? '100' : undefined}
                  value={discountAmount || ''}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-28 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>
            </div>

            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-zinc-100 space-y-1.5 text-sm">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discountValue > 0 && (
                <div className="flex justify-between text-zinc-500">
                  <span>Desconto</span>
                  <span className="text-red-600">− {formatCurrency(discountValue)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-zinc-900 text-base pt-1 border-t border-zinc-100">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl border border-zinc-200 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-700">Pagamento</h2>

            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Forma de pagamento</label>
              <select
                value={paymentMethod}
                onChange={(e) => {
                  setPaymentMethod(e.target.value)
                  setInstallments(1)
                }}
                className={inputClass}
              >
                <option value="">Selecionar depois</option>
                {Object.entries(PAYMENT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <FieldError errors={state?.errors} field="payment_method" />
            </div>

            {paymentMethod === 'credit_card' && (
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Parcelas</label>
                <select
                  value={installments}
                  onChange={(e) => setInstallments(parseInt(e.target.value, 10))}
                  className={inputClass}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}x {n === 1 ? '(à vista)' : `de ${formatCurrency(total / n)}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={pending || cart.length === 0}
            className="w-full rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            {pending ? 'Registrando...' : 'Registrar venda'}
          </button>
        </div>
      </div>
    </form>
  )
}
