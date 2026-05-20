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
  return <p className="mt-1 text-xs text-red-600">{msg}</p>
}

function Field({
  label,
  name,
  children,
  errors,
}: {
  label: string
  name: string
  children: React.ReactNode
  errors?: Record<string, string[]>
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-600 mb-1">{label}</label>
      {children}
      <FieldError errors={errors} field={name} />
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent'

const TYPE_LABELS: Record<string, string> = {
  in: 'Entrada (aumenta estoque)',
  out: 'Saída (reduz estoque)',
  adjustment: 'Ajuste de inventário (define total)',
}

export function MovementForm({ action, products, defaultProductId }: Props) {
  const [state, formAction, pending] = useActionState(action, null)
  const [type, setType] = useState('in')

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <Field label="Produto *" name="product_id" errors={state?.errors}>
        <select
          name="product_id"
          defaultValue={defaultProductId ?? ''}
          className={inputClass}
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
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={inputClass}
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
          type="number"
          name="quantity"
          min="0"
          step="1"
          placeholder={type === 'adjustment' ? 'Informe a quantidade real contada' : 'Ex: 10'}
          className={inputClass}
          required
        />
        {type === 'adjustment' && (
          <p className="mt-1 text-xs text-zinc-400">
            Informe o total encontrado na contagem física. O estoque será ajustado para este valor.
          </p>
        )}
      </Field>

      {type === 'in' && (
        <Field label="Preço de custo (R$)" name="cost_price" errors={state?.errors}>
          <input
            type="number"
            name="cost_price"
            min="0"
            step="0.01"
            placeholder="0,00"
            className={inputClass}
          />
        </Field>
      )}

      <Field label="Descrição / motivo" name="description" errors={state?.errors}>
        <textarea
          name="description"
          rows={3}
          placeholder="Ex: Compra NF-e 1234, Quebra de mercadoria, Contagem mensal..."
          className={inputClass}
        />
      </Field>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          {pending ? 'Registrando...' : 'Registrar movimentação'}
        </button>
      </div>
    </form>
  )
}
