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

export function CustomerForm({ action, customer, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, null)
  const [type, setType] = useState<'individual' | 'company'>(customer?.type ?? 'individual')

  return (
    <form action={formAction} className="form-stack">
      {state?.error && (
        <div className="form-banner-error">{state.error}</div>
      )}

      <section className="card">
        <div className="card-head">
          <div><h3>Dados principais</h3></div>
        </div>
        <div className="card-body form-grid">
          <Field label="Tipo *" name="type" errors={state?.errors}>
            <select
              id="type"
              name="type"
              defaultValue={customer?.type ?? 'individual'}
              onChange={(e) => setType(e.target.value as 'individual' | 'company')}
              className="input"
            >
              <option value="individual">Pessoa física (CPF)</option>
              <option value="company">Pessoa jurídica (CNPJ)</option>
            </select>
          </Field>

          <Field label="Status" name="is_active" errors={state?.errors}>
            <select
              id="is_active"
              name="is_active"
              defaultValue={customer ? String(customer.is_active) : 'true'}
              className="input"
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </Field>

          <Field label="Nome / Razão social *" name="name" errors={state?.errors} span={2}>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={customer?.name ?? ''}
              placeholder="Nome completo ou razão social"
              className="input"
            />
          </Field>

          <Field label="Nome fantasia" name="trade_name" errors={state?.errors} span={2}>
            <input
              id="trade_name"
              name="trade_name"
              type="text"
              defaultValue={customer?.trade_name ?? ''}
              placeholder="Nome fantasia"
              className="input"
            />
          </Field>

          <Field
            label={type === 'individual' ? 'CPF' : 'CNPJ'}
            name="document"
            errors={state?.errors}
          >
            <input
              id="document"
              name="document"
              type="text"
              defaultValue={customer?.document ?? ''}
              placeholder={type === 'individual' ? '00000000000' : '00000000000000'}
              className="input"
            />
          </Field>

          <Field label="Email" name="email" errors={state?.errors}>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={customer?.email ?? ''}
              placeholder="email@exemplo.com"
              className="input"
            />
          </Field>

          <Field label="Telefone" name="phone" errors={state?.errors}>
            <input
              id="phone"
              name="phone"
              type="text"
              defaultValue={customer?.phone ?? ''}
              placeholder="(11) 99999-9999"
              className="input"
            />
          </Field>
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <div><h3>Endereço</h3></div>
        </div>
        <div className="card-body form-grid">
          <Field label="CEP" name="zip_code" errors={state?.errors}>
            <input
              id="zip_code"
              name="zip_code"
              type="text"
              defaultValue={customer?.zip_code ?? ''}
              placeholder="00000-000"
              className="input"
            />
          </Field>

          <Field label="UF" name="state" errors={state?.errors}>
            <select
              id="state"
              name="state"
              defaultValue={customer?.state ?? ''}
              className="input"
            >
              <option value="">Selecionar…</option>
              {STATES.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </Field>

          <Field label="Logradouro" name="address" errors={state?.errors} span={2}>
            <input
              id="address"
              name="address"
              type="text"
              defaultValue={customer?.address ?? ''}
              placeholder="Rua, avenida…"
              className="input"
            />
          </Field>

          <Field label="Número" name="address_number" errors={state?.errors}>
            <input
              id="address_number"
              name="address_number"
              type="text"
              defaultValue={customer?.address_number ?? ''}
              placeholder="123"
              className="input"
            />
          </Field>

          <Field label="Complemento" name="address_complement" errors={state?.errors}>
            <input
              id="address_complement"
              name="address_complement"
              type="text"
              defaultValue={customer?.address_complement ?? ''}
              placeholder="Apto, sala…"
              className="input"
            />
          </Field>

          <Field label="Bairro" name="neighborhood" errors={state?.errors}>
            <input
              id="neighborhood"
              name="neighborhood"
              type="text"
              defaultValue={customer?.neighborhood ?? ''}
              placeholder="Bairro"
              className="input"
            />
          </Field>

          <Field label="Cidade" name="city" errors={state?.errors}>
            <input
              id="city"
              name="city"
              type="text"
              defaultValue={customer?.city ?? ''}
              placeholder="Cidade"
              className="input"
            />
          </Field>
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <div><h3>Observações</h3></div>
        </div>
        <div className="card-body">
          <textarea
            name="notes"
            defaultValue={customer?.notes ?? ''}
            rows={3}
            placeholder="Anotações internas sobre este cliente…"
            className="input"
          />
        </div>
      </section>

      <div className="form-actions">
        <a href="/customers" className="btn btn-outline">Cancelar</a>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? 'Salvando…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
