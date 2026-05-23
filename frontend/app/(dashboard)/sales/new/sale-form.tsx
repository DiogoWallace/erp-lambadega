'use client'

import { useActionState, useEffect, useMemo, useState } from 'react'
import { Customer, Product } from '@/app/lib/types'
import { Icon } from '@/app/ui/icons'

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
  return <p style={{ marginTop: 6, fontSize: 12, color: 'var(--danger)' }}>{msg}</p>
}

/**
 * Input numérico com estado local enquanto o usuário edita — permite limpar
 * o campo sem disparar onCommit(0). Só comita quando o valor é válido (≥ min).
 * Reverte para o último valor válido no blur se ficar vazio/inválido.
 */
function NumericInput({
  value,
  min,
  step,
  onCommit,
  className,
  title,
  ariaLabel,
}: {
  value: number
  min: number
  step: number
  onCommit: (n: number) => void
  className?: string
  title?: string
  ariaLabel?: string
}) {
  const [text, setText] = useState(() => String(value))

  // Sincroniza se a fonte externa mudar (ex: +1 ao re-adicionar produto).
  useEffect(() => {
    const parsed = parseFloat(text)
    if (!Number.isFinite(parsed) || parsed !== value) {
      setText(String(value))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <input
      type="number"
      min={min}
      step={step}
      value={text}
      onChange={(e) => {
        const raw = e.target.value
        setText(raw)
        const n = parseFloat(raw)
        if (Number.isFinite(n) && n >= min) onCommit(n)
      }}
      onBlur={() => {
        const n = parseFloat(text)
        if (!Number.isFinite(n) || n < min) setText(String(value))
      }}
      className={className}
      title={title}
      aria-label={ariaLabel}
    />
  )
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
        <div style={{
          marginBottom: 16,
          padding: '10px 14px',
          background: 'var(--danger-soft)',
          color: 'var(--danger)',
          border: '1px solid transparent',
          borderRadius: 'var(--r-md)',
          fontSize: 13,
        }}>
          {state.error}
        </div>
      )}

      <div className="pdv-grid">
        {/* Coluna esquerda: busca + cliente + obs */}
        <div className="pdv-col">
          <section className="card">
            <div className="card-head">
              <div>
                <h3>Adicionar produto</h3>
                <p className="card-sub">Busque por nome, SKU ou código de barras</p>
              </div>
            </div>
            <div className="pdv-card-body">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Digite para buscar..."
                className="input"
                autoComplete="off"
              />

              {search.trim() && (
                <div className="pdv-results">
                  {filteredProducts.length === 0 ? (
                    <p style={{ padding: '14px 12px', fontSize: 13, color: 'var(--text-muted)' }}>
                      Nenhum produto encontrado.
                    </p>
                  ) : (
                    filteredProducts.map((p) => {
                      const outOfStock = p.stock_quantity <= 0
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => addToCart(p)}
                          disabled={outOfStock}
                          className="pdv-result"
                        >
                          <div className="pdv-result-info">
                            <div className="pdv-result-name">{p.name}</div>
                            <div className="pdv-result-meta">
                              {p.sku && <span className="mono">{p.sku}</span>}
                              <span className={outOfStock ? 'pdv-result-empty' : ''}>
                                Estoque: {p.stock_quantity}
                              </span>
                            </div>
                          </div>
                          <span className="tnum pdv-result-price">
                            {formatCurrency(parseFloat(p.sale_price))}
                          </span>
                        </button>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          </section>

          <section className="card">
            <div className="card-head">
              <div><h3>Cliente</h3></div>
            </div>
            <div className="pdv-card-body">
              <select name="customer_id" className="input" defaultValue="">
                <option value="">Consumidor final</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <FieldError errors={state?.errors} field="customer_id" />
            </div>
          </section>

          <section className="card">
            <div className="card-head">
              <div><h3>Observações</h3></div>
            </div>
            <div className="pdv-card-body">
              <textarea
                name="notes"
                rows={2}
                placeholder="Observações da venda..."
                className="input"
              />
            </div>
          </section>
        </div>

        {/* Coluna direita: carrinho + pagamento + total */}
        <div className="pdv-col">
          <section className="card">
            <div className="card-head">
              <div>
                <h3>Carrinho</h3>
                {cart.length > 0 && (
                  <p className="card-sub">{cart.length} item(ns)</p>
                )}
              </div>
            </div>

            {cart.length === 0 ? (
              <div style={{ padding: '32px 18px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                Nenhum produto adicionado.
              </div>
            ) : (
              <ul className="pdv-cart">
                {cart.map((item) => (
                  <li key={item.productId} className="pdv-cart-row">
                    <div className="pdv-cart-info">
                      <div className="pdv-cart-name">{item.productName}</div>
                      {item.sku && (
                        <div className="mono pdv-cart-sku">SKU: {item.sku}</div>
                      )}
                    </div>

                    <div className="pdv-cart-ctrl">
                      <div className="pdv-cart-field">
                        <span className="pdv-cart-label">Preço un.</span>
                        <NumericInput
                          value={item.unitPrice}
                          min={0.01}
                          step={0.01}
                          onCommit={(n) => updatePrice(item.productId, n)}
                          className="input input-sm pdv-cart-price"
                          ariaLabel="Preço unitário"
                        />
                      </div>

                      <div className="pdv-cart-field">
                        <span className="pdv-cart-label">Quantidade</span>
                        <div className="pdv-cart-stepper">
                          <button
                            type="button"
                            onClick={() => updateQty(item.productId, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                            className="pdv-cart-step-btn"
                            aria-label="Diminuir quantidade"
                            title="Diminuir"
                          >
                            <Icon name="minus" size={12} stroke={2.4} />
                          </button>
                          <NumericInput
                            value={item.quantity}
                            min={1}
                            step={1}
                            onCommit={(n) => updateQty(item.productId, n)}
                            className="input input-sm pdv-cart-qty"
                            ariaLabel="Quantidade"
                          />
                          <button
                            type="button"
                            onClick={() => updateQty(item.productId, item.quantity + 1)}
                            className="pdv-cart-step-btn"
                            aria-label="Aumentar quantidade"
                            title="Aumentar"
                          >
                            <Icon name="plus" size={12} stroke={2.4} />
                          </button>
                        </div>
                      </div>

                      <div className="pdv-cart-field pdv-cart-field-total">
                        <span className="pdv-cart-label">Total</span>
                        <span className="tnum pdv-cart-total">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="pdv-cart-remove"
                        title="Remover"
                        aria-label="Remover item"
                      >
                        <Icon name="trash" size={14} stroke={2} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="pdv-discount">
              <select
                value={discountType}
                onChange={(e) => {
                  setDiscountType(e.target.value as 'fixed' | 'percentage')
                  setDiscountAmount(0)
                }}
                className="input input-sm"
                style={{ width: 'auto' }}
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
                className="input input-sm"
                style={{ width: 120 }}
              />
            </div>

            <div className="pdv-totals">
              <div className="pdv-totals-row">
                <span>Subtotal</span>
                <span className="tnum">{formatCurrency(subtotal)}</span>
              </div>
              {discountValue > 0 && (
                <div className="pdv-totals-row" style={{ color: 'var(--danger)' }}>
                  <span>Desconto</span>
                  <span className="tnum">− {formatCurrency(discountValue)}</span>
                </div>
              )}
              <div className="pdv-totals-row pdv-totals-strong">
                <span>Total</span>
                <span className="tnum">{formatCurrency(total)}</span>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-head">
              <div><h3>Pagamento</h3></div>
            </div>
            <div className="pdv-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="field-label" style={{ display: 'block', marginBottom: 6 }}>
                  Forma de pagamento
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value)
                    setInstallments(1)
                  }}
                  className="input"
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
                  <label className="field-label" style={{ display: 'block', marginBottom: 6 }}>
                    Parcelas
                  </label>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(parseInt(e.target.value, 10))}
                    className="input"
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
          </section>

          <div className="pdv-submit-wrap">
            <button
              type="submit"
              disabled={pending || cart.length === 0}
              className="btn btn-primary pdv-submit"
            >
              {pending ? 'Registrando…' : `Registrar venda · ${formatCurrency(total)}`}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
