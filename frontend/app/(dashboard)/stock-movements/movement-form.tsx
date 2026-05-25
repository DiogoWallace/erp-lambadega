'use client'

import { useActionState, useState } from 'react'
import { Product } from '@/app/lib/types'

interface FormState {
  error?: string
  errors?: Record<string, string[]>
}

interface Props {
  action: (prevState: unknown, formData: FormData) => Promise<FormState | undefined>
  products: Product[]
  defaultProductId?: string
}

function FieldError({ errors, field }: { errors?: Record<string, string[]>; field: string }) {
  const msg = errors?.[field]?.[0]
  if (!msg) return null
  return <p className="form-field-error">{msg}</p>
}

function Field({
  label,
  name,
  span,
  children,
  errors,
}: {
  label: string
  name: string
  span?: 2 | 'full'
  children: React.ReactNode
  errors?: Record<string, string[]>
}) {
  const cls =
    span === 'full' ? 'form-field-full' :
      span === 2 ? 'form-field-span-2' : ''
  return (
    <div className={`form-field ${cls}`}>
      <label className="field-label" htmlFor={name}>{label}</label>
      {children}
      <FieldError errors={errors} field={name} />
    </div>
  )
}

const TYPE_LABELS: Record<string, string> = {
  in: 'Entrada (aumenta estoque)',
  out: 'Saída (reduz estoque)',
  adjustment: 'Ajuste de inventário (define total)',
}

export function MovementForm({ action, products, defaultProductId }: Props) {
  const [state, formAction, pending] = useActionState(action, null)
  const [type, setType] = useState('in')

  return (
    <form action={formAction} className="form-stack">
      {state?.error && (
        <div className="form-banner-error">{state.error}</div>
      )}

      <section className="card">
        <div className="card-head">
          <div><h3>Movimentação</h3></div>
        </div>
        <div className="card-body form-grid">
          <Field label="Produto *" name="product_id" errors={state?.errors} span={2}>
            <select
              id="product_id"
              name="product_id"
              defaultValue={defaultProductId ?? ''}
              className="input"
              required
            >
              <option value="">Selecione um produto</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.sku ? ` — SKU: ${p.sku}` : ''}
                  {` (estoque: ${p.stock_quantity})`}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Tipo de movimentação *" name="type" errors={state?.errors}>
            <select
              id="type"
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="input"
              required
            >
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>

          <Field
            label={type === 'adjustment' ? 'Quantidade total em estoque *' : 'Quantidade *'}
            name="quantity"
            errors={state?.errors}
          >
            <input
              id="quantity"
              type="number"
              name="quantity"
              min="0"
              step="1"
              placeholder={type === 'adjustment' ? 'Total contado' : 'Ex: 10'}
              className="input tnum"
              required
            />
            {type === 'adjustment' && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Informe o total encontrado na contagem física. O estoque será ajustado para este valor.
              </p>
            )}
          </Field>

          {type === 'in' && (
            <Field label="Preço de custo (R$)" name="cost_price" errors={state?.errors}>
              <input
                id="cost_price"
                type="number"
                name="cost_price"
                min="0"
                step="0.01"
                placeholder="0,00"
                className="input tnum"
              />
            </Field>
          )}

          <Field label="Descrição / motivo" name="description" errors={state?.errors} span="full">
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Ex: Compra NF-e 1234, quebra de mercadoria, contagem mensal…"
              className="input"
            />
          </Field>
        </div>
      </section>

      <div className="form-actions">
        <a href="/stock-movements" className="btn btn-outline">Cancelar</a>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? 'Registrando…' : 'Registrar movimentação'}
        </button>
      </div>
    </form>
  )
}
