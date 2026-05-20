'use client'

import { useActionState } from 'react'
import { Category, Product, Supplier } from '@/app/lib/types'

const UNITS = [
  { value: 'un', label: 'Unidade (un)' },
  { value: 'kg', label: 'Quilograma (kg)' },
  { value: 'g', label: 'Grama (g)' },
  { value: 'l', label: 'Litro (l)' },
  { value: 'ml', label: 'Mililitro (ml)' },
  { value: 'cx', label: 'Caixa (cx)' },
]

interface FormState {
  error?: string
  errors?: Record<string, string[]>
}

interface Props {
  action: (prevState: unknown, formData: FormData) => Promise<FormState | undefined>
  product?: Product
  categories: Category[]
  suppliers: Supplier[]
  submitLabel: string
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

export function ProductForm({ action, product, categories, suppliers, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-8">
      {state?.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Informações */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">Informações</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Status" name="is_active" errors={state?.errors}>
            <select
              name="is_active"
              defaultValue={product ? String(product.is_active) : 'true'}
              className={inputClass}
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </Field>

          <Field label="Unidade" name="unit" errors={state?.errors}>
            <select
              name="unit"
              defaultValue={product?.unit ?? 'un'}
              className={inputClass}
            >
              {UNITS.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </Field>

          <div className="sm:col-span-2">
            <Field label="Nome *" name="name" errors={state?.errors}>
              <input
                type="text"
                name="name"
                defaultValue={product?.name ?? ''}
                placeholder="Ex: Caneta Esferográfica Azul"
                className={inputClass}
                required
              />
            </Field>
          </div>

          <Field label="Marca" name="brand" errors={state?.errors}>
            <input
              type="text"
              name="brand"
              defaultValue={product?.brand ?? ''}
              placeholder="Ex: BIC"
              className={inputClass}
            />
          </Field>

          <Field label="Categoria" name="category_id" errors={state?.errors}>
            <select
              name="category_id"
              defaultValue={product?.category_id ?? ''}
              className={inputClass}
            >
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Fornecedor" name="supplier_id" errors={state?.errors}>
            <select
              name="supplier_id"
              defaultValue={product?.supplier_id ?? ''}
              className={inputClass}
            >
              <option value="">Sem fornecedor</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.company_name}</option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      {/* Preços */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">Preços</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Preço de custo (R$)" name="cost_price" errors={state?.errors}>
            <input
              type="number"
              name="cost_price"
              defaultValue={product?.cost_price ?? '0'}
              min="0"
              step="0.01"
              placeholder="0,00"
              className={inputClass}
            />
          </Field>

          <Field label="Preço de venda (R$)" name="sale_price" errors={state?.errors}>
            <input
              type="number"
              name="sale_price"
              defaultValue={product?.sale_price ?? '0'}
              min="0"
              step="0.01"
              placeholder="0,00"
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      {/* Estoque e identificação */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">Estoque e identificação</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Quantidade em estoque" name="stock_quantity" errors={state?.errors}>
            <input
              type="number"
              name="stock_quantity"
              defaultValue={product?.stock_quantity ?? 0}
              min="0"
              step="1"
              className={inputClass}
            />
          </Field>

          <Field label="Estoque mínimo" name="min_stock_quantity" errors={state?.errors}>
            <input
              type="number"
              name="min_stock_quantity"
              defaultValue={product?.min_stock_quantity ?? 0}
              min="0"
              step="1"
              className={inputClass}
            />
          </Field>

          <Field label="SKU" name="sku" errors={state?.errors}>
            <input
              type="text"
              name="sku"
              defaultValue={product?.sku ?? ''}
              placeholder="Ex: PROD-001"
              className={inputClass}
            />
          </Field>

          <Field label="Código de barras" name="barcode" errors={state?.errors}>
            <input
              type="text"
              name="barcode"
              defaultValue={product?.barcode ?? ''}
              placeholder="Ex: 7891234567890"
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      {/* Descrição */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">Descrição</h2>
        <div className="space-y-4">
          <Field label="Descrição" name="description" errors={state?.errors}>
            <textarea
              name="description"
              defaultValue={product?.description ?? ''}
              rows={4}
              placeholder="Descreva o produto..."
              className={inputClass}
            />
          </Field>

          <Field label="URL da imagem" name="image_path" errors={state?.errors}>
            <input
              type="text"
              name="image_path"
              defaultValue={product?.image_path ?? ''}
              placeholder="https://..."
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          {pending ? 'Salvando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
