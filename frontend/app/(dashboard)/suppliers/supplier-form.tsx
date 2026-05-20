'use client'

import { useActionState } from 'react'
import { Supplier } from '@/app/lib/types'

const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
]

interface FormState {
  error?: string
  errors?: Record<string, string[]>
}

interface Props {
  action: (prevState: unknown, formData: FormData) => Promise<FormState | undefined>
  supplier?: Supplier
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

export function SupplierForm({ action, supplier, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-8">
      {state?.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Company data */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">Company data</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Status" name="is_active" errors={state?.errors}>
            <select
              name="is_active"
              defaultValue={supplier ? String(supplier.is_active) : 'true'}
              className={inputClass}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </Field>

          <div /> {/* spacer */}

          <Field label="Company name *" name="company_name" errors={state?.errors}>
            <input
              name="company_name"
              type="text"
              defaultValue={supplier?.company_name ?? ''}
              placeholder="Full company name (razão social)"
              className={inputClass}
            />
          </Field>

          <Field label="Trade name" name="trade_name" errors={state?.errors}>
            <input
              name="trade_name"
              type="text"
              defaultValue={supplier?.trade_name ?? ''}
              placeholder="Nome fantasia"
              className={inputClass}
            />
          </Field>

          <Field label="CNPJ" name="cnpj" errors={state?.errors}>
            <input
              name="cnpj"
              type="text"
              defaultValue={supplier?.cnpj ?? ''}
              placeholder="00.000.000/0001-00"
              className={inputClass}
            />
          </Field>

          <Field label="Website" name="website" errors={state?.errors}>
            <input
              name="website"
              type="url"
              defaultValue={supplier?.website ?? ''}
              placeholder="https://..."
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      {/* Contact */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">Contact</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Contact name" name="contact_name" errors={state?.errors}>
            <input
              name="contact_name"
              type="text"
              defaultValue={supplier?.contact_name ?? ''}
              placeholder="Sales rep or main contact"
              className={inputClass}
            />
          </Field>

          <Field label="Email" name="email" errors={state?.errors}>
            <input
              name="email"
              type="email"
              defaultValue={supplier?.email ?? ''}
              placeholder="email@supplier.com"
              className={inputClass}
            />
          </Field>

          <Field label="Phone" name="phone" errors={state?.errors}>
            <input
              name="phone"
              type="text"
              defaultValue={supplier?.phone ?? ''}
              placeholder="(11) 99999-9999"
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      {/* Address */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">Address</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="ZIP code" name="zip_code" errors={state?.errors}>
            <input
              name="zip_code"
              type="text"
              defaultValue={supplier?.zip_code ?? ''}
              placeholder="00000-000"
              className={inputClass}
            />
          </Field>

          <Field label="Street" name="address" errors={state?.errors}>
            <input
              name="address"
              type="text"
              defaultValue={supplier?.address ?? ''}
              placeholder="Street, number..."
              className={inputClass}
            />
          </Field>

          <Field label="City" name="city" errors={state?.errors}>
            <input
              name="city"
              type="text"
              defaultValue={supplier?.city ?? ''}
              placeholder="City"
              className={inputClass}
            />
          </Field>

          <Field label="State" name="state" errors={state?.errors}>
            <select
              name="state"
              defaultValue={supplier?.state ?? ''}
              className={inputClass}
            >
              <option value="">Select...</option>
              {STATES.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      {/* Notes */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">Notes</h2>
        <textarea
          name="notes"
          defaultValue={supplier?.notes ?? ''}
          rows={3}
          placeholder="Internal notes about this supplier..."
          className={`${inputClass} resize-none`}
        />
      </section>

      <div className="flex justify-end gap-3 pt-2">
        <a
          href="/suppliers"
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          Cancel
        </a>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          {pending ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
