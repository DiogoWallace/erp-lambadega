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

export function CategoryForm({ action, category, categories, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nome *" name="name" errors={state?.errors}>
          <input
            name="name"
            type="text"
            defaultValue={category?.name ?? ''}
            placeholder="Nome da categoria"
            className={inputClass}
          />
        </Field>

        <Field label="Status" name="is_active" errors={state?.errors}>
          <select
            name="is_active"
            defaultValue={category ? String(category.is_active) : 'true'}
            className={inputClass}
          >
            <option value="true">Ativa</option>
            <option value="false">Inativa</option>
          </select>
        </Field>

        <Field label="Categoria pai" name="parent_id" errors={state?.errors}>
          <select
            name="parent_id"
            defaultValue={category?.parent_id ?? ''}
            className={inputClass}
          >
            <option value="">Nenhuma (raiz)</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Ordem" name="sort_order" errors={state?.errors}>
          <input
            name="sort_order"
            type="number"
            min={0}
            defaultValue={category?.sort_order ?? 0}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Descrição" name="description" errors={state?.errors}>
        <textarea
          name="description"
          defaultValue={category?.description ?? ''}
          rows={3}
          placeholder="Descrição opcional da categoria..."
          className={`${inputClass} resize-none`}
        />
      </Field>

      <div className="flex justify-end gap-3 pt-2">
        <a
          href="/categories"
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          {pending ? 'Salvando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
