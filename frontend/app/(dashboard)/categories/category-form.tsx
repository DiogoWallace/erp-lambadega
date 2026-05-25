'use client'

import { useActionState } from 'react'
import { Category } from '@/app/lib/types'

interface FormState {
  error?: string
  errors?: Record<string, string[]>
}

interface Props {
  action: (prevState: unknown, formData: FormData) => Promise<FormState | undefined>
  category?: Category
  categories: Pick<Category, 'id' | 'name'>[]
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

export function CategoryForm({ action, category, categories, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, null)

  return (
    <form action={formAction} className="form-stack">
      {state?.error && (
        <div className="form-banner-error">{state.error}</div>
      )}

      <section className="card">
        <div className="card-head">
          <div><h3>Dados da categoria</h3></div>
        </div>
        <div className="card-body form-grid">
          <Field label="Nome *" name="name" errors={state?.errors} span={2}>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={category?.name ?? ''}
              placeholder="Nome da categoria"
              className="input"
            />
          </Field>

          <Field label="Status" name="is_active" errors={state?.errors}>
            <select
              id="is_active"
              name="is_active"
              defaultValue={category ? String(category.is_active) : 'true'}
              className="input"
            >
              <option value="true">Ativa</option>
              <option value="false">Inativa</option>
            </select>
          </Field>

          <Field label="Ordem" name="sort_order" errors={state?.errors}>
            <input
              id="sort_order"
              name="sort_order"
              type="number"
              min={0}
              defaultValue={category?.sort_order ?? 0}
              className="input"
            />
          </Field>

          <Field label="Categoria pai" name="parent_id" errors={state?.errors} span={2}>
            <select
              id="parent_id"
              name="parent_id"
              defaultValue={category?.parent_id ?? ''}
              className="input"
            >
              <option value="">Nenhuma (raiz)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Descrição" name="description" errors={state?.errors} span={2}>
            <textarea
              id="description"
              name="description"
              defaultValue={category?.description ?? ''}
              rows={3}
              placeholder="Descrição opcional da categoria…"
              className="input"
            />
          </Field>
        </div>
      </section>

      <div className="form-actions">
        <a href="/categories" className="btn btn-outline">Cancelar</a>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? 'Salvando…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
