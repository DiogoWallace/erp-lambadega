'use client'

import { useActionState, useState } from 'react'
import { Customer } from '@/app/lib/types'

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
  customer?: Customer
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

export function CustomerForm({ action, customer, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, null)
  const [type, setType] = useState<'individual' | 'company'>(customer?.type ?? 'individual')

  return (
    <form action={formAction} className="space-y-8">
      {state?.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Dados principais */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">Dados principais</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Tipo *" name="type" errors={state?.errors}>
            <select
              name="type"
              defaultValue={customer?.type ?? 'individual'}
              onChange={(e) => setType(e.target.value as 'individual' | 'company')}
              className={inputClass}
            >
              <option value="individual">Pessoa Física (CPF)</option>
              <option value="company">Pessoa Jurídica (CNPJ)</option>
            </select>
          </Field>

          <Field label="Status" name="is_active" errors={state?.errors}>
            <select
              name="is_active"
              defaultValue={customer ? String(customer.is_active) : 'true'}
              className={inputClass}
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </Field>

          <Field label="Nome / Razão social *" name="name" errors={state?.errors}>
            <input
              name="name"
              type="text"
              defaultValue={customer?.name ?? ''}
              placeholder="Nome completo ou razão social"
              className={inputClass}
            />
          </Field>

          <Field label="Nome fantasia" name="trade_name" errors={state?.errors}>
            <input
              name="trade_name"
              type="text"
              defaultValue={customer?.trade_name ?? ''}
              placeholder="Nome fantasia"
              className={inputClass}
            />
          </Field>

          <Field
            label={type === 'individual' ? 'CPF' : 'CNPJ'}
            name="document"
            errors={state?.errors}
          >
            <input
              name="document"
              type="text"
              defaultValue={customer?.document ?? ''}
              placeholder={type === 'individual' ? '00000000000' : '00000000000000'}
              className={inputClass}
            />
          </Field>

          <Field label="E-mail" name="email" errors={state?.errors}>
            <input
              name="email"
              type="email"
              defaultValue={customer?.email ?? ''}
              placeholder="email@exemplo.com"
              className={inputClass}
            />
          </Field>

          <Field label="Telefone" name="phone" errors={state?.errors}>
            <input
              name="phone"
              type="text"
              defaultValue={customer?.phone ?? ''}
              placeholder="(11) 99999-9999"
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      {/* Endereço */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">Endereço</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="CEP" name="zip_code" errors={state?.errors}>
            <input
              name="zip_code"
              type="text"
              defaultValue={customer?.zip_code ?? ''}
              placeholder="00000000"
              className={inputClass}
            />
          </Field>

          <Field label="Logradouro" name="address" errors={state?.errors}>
            <input
              name="address"
              type="text"
              defaultValue={customer?.address ?? ''}
              placeholder="Rua, Avenida..."
              className={inputClass}
            />
          </Field>

          <Field label="Número" name="address_number" errors={state?.errors}>
            <input
              name="address_number"
              type="text"
              defaultValue={customer?.address_number ?? ''}
              placeholder="123"
              className={inputClass}
            />
          </Field>

          <Field label="Complemento" name="address_complement" errors={state?.errors}>
            <input
              name="address_complement"
              type="text"
              defaultValue={customer?.address_complement ?? ''}
              placeholder="Apto, sala..."
              className={inputClass}
            />
          </Field>

          <Field label="Bairro" name="neighborhood" errors={state?.errors}>
            <input
              name="neighborhood"
              type="text"
              defaultValue={customer?.neighborhood ?? ''}
              placeholder="Bairro"
              className={inputClass}
            />
          </Field>

          <Field label="Cidade" name="city" errors={state?.errors}>
            <input
              name="city"
              type="text"
              defaultValue={customer?.city ?? ''}
              placeholder="Cidade"
              className={inputClass}
            />
          </Field>

          <Field label="Estado" name="state" errors={state?.errors}>
            <select
              name="state"
              defaultValue={customer?.state ?? ''}
              className={inputClass}
            >
              <option value="">Selecione...</option>
              {STATES.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      {/* Observações */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">Observações</h2>
        <textarea
          name="notes"
          defaultValue={customer?.notes ?? ''}
          rows={3}
          placeholder="Anotações internas sobre o cliente..."
          className={`${inputClass} resize-none`}
        />
      </section>

      <div className="flex justify-end gap-3 pt-2">
        <a
          href="/dashboard/customers"
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
