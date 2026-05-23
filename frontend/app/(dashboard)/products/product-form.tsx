'use client'

import { useActionState } from 'react'
import { Category, Product, Supplier } from '@/app/lib/types'

const UNITS = [
  { value: 'un', label: 'Unidade (un)' },
  { value: 'kg', label: 'Quilograma (kg)' },
  { value: 'g',  label: 'Grama (g)' },
  { value: 'l',  label: 'Litro (l)' },
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

export function ProductForm({ action, product, categories, suppliers, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, null)

  return (
    <form action={formAction} className="form-stack">
      {state?.error && (
        <div className="form-banner-error">{state.error}</div>
      )}

      <section className="card">
        <div className="card-head">
          <div><h3>Informações</h3></div>
        </div>
        <div className="card-body form-grid">
          <Field label="Status" name="is_active" errors={state?.errors}>
            <select
              id="is_active"
              name="is_active"
              defaultValue={product ? String(product.is_active) : 'true'}
              className="input"
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </Field>

          <Field label="Unidade" name="unit" errors={state?.errors}>
            <select
              id="unit"
              name="unit"
              defaultValue={product?.unit ?? 'un'}
              className="input"
            >
              {UNITS.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Nome *" name="name" errors={state?.errors} span={2}>
            <input
              id="name"
              type="text"
              name="name"
              defaultValue={product?.name ?? ''}
              placeholder="Ex: Caneta esferográfica azul"
              className="input"
              required
            />
          </Field>

          <Field label="Marca" name="brand" errors={state?.errors} span={2}>
            <input
              id="brand"
              type="text"
              name="brand"
              defaultValue={product?.brand ?? ''}
              placeholder="Ex: BIC"
              className="input"
            />
          </Field>

          <Field label="Categoria" name="category_id" errors={state?.errors}>
            <select
              id="category_id"
              name="category_id"
              defaultValue={product?.category_id ?? ''}
              className="input"
            >
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Fornecedor" name="supplier_id" errors={state?.errors}>
            <select
              id="supplier_id"
              name="supplier_id"
              defaultValue={product?.supplier_id ?? ''}
              className="input"
            >
              <option value="">Sem fornecedor</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.company_name}</option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <div><h3>Preços</h3></div>
        </div>
        <div className="card-body form-grid">
          <Field label="Preço de custo (R$)" name="cost_price" errors={state?.errors}>
            <input
              id="cost_price"
              type="number"
              name="cost_price"
              defaultValue={product?.cost_price ?? '0'}
              min="0"
              step="0.01"
              placeholder="0,00"
              className="input tnum"
            />
          </Field>

          <Field label="Preço de venda (R$)" name="sale_price" errors={state?.errors}>
            <input
              id="sale_price"
              type="number"
              name="sale_price"
              defaultValue={product?.sale_price ?? '0'}
              min="0"
              step="0.01"
              placeholder="0,00"
              className="input tnum"
            />
          </Field>
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <div><h3>Estoque e identificação</h3></div>
        </div>
        <div className="card-body form-grid">
          <Field label="Quantidade em estoque" name="stock_quantity" errors={state?.errors}>
            <input
              id="stock_quantity"
              type="number"
              name="stock_quantity"
              defaultValue={product?.stock_quantity ?? 0}
              min="0"
              step="1"
              className="input tnum"
            />
          </Field>

          <Field label="Estoque mínimo" name="min_stock_quantity" errors={state?.errors}>
            <input
              id="min_stock_quantity"
              type="number"
              name="min_stock_quantity"
              defaultValue={product?.min_stock_quantity ?? 0}
              min="0"
              step="1"
              className="input tnum"
            />
          </Field>

          <Field label="SKU" name="sku" errors={state?.errors}>
            <input
              id="sku"
              type="text"
              name="sku"
              defaultValue={product?.sku ?? ''}
              placeholder="Ex: PROD-001"
              className="input mono"
            />
          </Field>

          <Field label="Código de barras" name="barcode" errors={state?.errors}>
            <input
              id="barcode"
              type="text"
              name="barcode"
              defaultValue={product?.barcode ?? ''}
              placeholder="Ex: 7891234567890"
              className="input mono"
            />
          </Field>
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <div><h3>Descrição</h3></div>
        </div>
        <div className="card-body form-stack">
          <div className="form-field">
            <label className="field-label" htmlFor="description">Descrição</label>
            <textarea
              id="description"
              name="description"
              defaultValue={product?.description ?? ''}
              rows={4}
              placeholder="Descreva o produto…"
              className="input"
            />
            <FieldError errors={state?.errors} field="description" />
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="image_path">URL da imagem</label>
            <input
              id="image_path"
              type="text"
              name="image_path"
              defaultValue={product?.image_path ?? ''}
              placeholder="https://…"
              className="input"
            />
            <FieldError errors={state?.errors} field="image_path" />
          </div>
        </div>
      </section>

      <div className="form-actions">
        <a href="/products" className="btn btn-outline">Cancelar</a>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? 'Salvando…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
