'use client'

import { useActionState } from 'react'
import { Supplier } from '@/app/lib/types'

const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
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

export function SupplierForm({ action, supplier, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, null)

  return (
    <form action={formAction} className="form-stack">
      {state?.error && (
        <div className="form-banner-error">{state.error}</div>
      )}

      <section className="card">
        <div className="card-head">
          <div><h3>Dados da empresa</h3></div>
        </div>
        <div className="card-body form-grid">
          <Field label="Status" name="is_active" errors={state?.errors}>
            <select
              id="is_active"
              name="is_active"
              defaultValue={supplier ? String(supplier.is_active) : 'true'}
              className="input"
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </Field>

          <Field label="CNPJ" name="cnpj" errors={state?.errors}>
            <input
              id="cnpj"
              name="cnpj"
              type="text"
              defaultValue={supplier?.cnpj ?? ''}
              placeholder="00.000.000/0001-00"
              className="input"
            />
          </Field>

          <Field label="Razão social *" name="company_name" errors={state?.errors} span={2}>
            <input
              id="company_name"
              name="company_name"
              type="text"
              defaultValue={supplier?.company_name ?? ''}
              placeholder="Razão social completa"
              className="input"
            />
          </Field>

          <Field label="Nome fantasia" name="trade_name" errors={state?.errors} span={2}>
            <input
              id="trade_name"
              name="trade_name"
              type="text"
              defaultValue={supplier?.trade_name ?? ''}
              placeholder="Nome fantasia"
              className="input"
            />
          </Field>

          <Field label="Website" name="website" errors={state?.errors} span={2}>
            <input
              id="website"
              name="website"
              type="url"
              defaultValue={supplier?.website ?? ''}
              placeholder="https://…"
              className="input"
            />
          </Field>
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <div><h3>Contato</h3></div>
        </div>
        <div className="card-body form-grid">
          <Field label="Nome do contato" name="contact_name" errors={state?.errors} span={2}>
            <input
              id="contact_name"
              name="contact_name"
              type="text"
              defaultValue={supplier?.contact_name ?? ''}
              placeholder="Vendedor ou contato principal"
              className="input"
            />
          </Field>

          <Field label="Email" name="email" errors={state?.errors}>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={supplier?.email ?? ''}
              placeholder="email@fornecedor.com"
              className="input"
            />
          </Field>

          <Field label="Telefone" name="phone" errors={state?.errors}>
            <input
              id="phone"
              name="phone"
              type="text"
              defaultValue={supplier?.phone ?? ''}
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
              defaultValue={supplier?.zip_code ?? ''}
              placeholder="00000-000"
              className="input"
            />
          </Field>

          <Field label="UF" name="state" errors={state?.errors}>
            <select
              id="state"
              name="state"
              defaultValue={supplier?.state ?? ''}
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
              defaultValue={supplier?.address ?? ''}
              placeholder="Rua, avenida, número…"
              className="input"
            />
          </Field>

          <Field label="Cidade" name="city" errors={state?.errors} span={2}>
            <input
              id="city"
              name="city"
              type="text"
              defaultValue={supplier?.city ?? ''}
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
            defaultValue={supplier?.notes ?? ''}
            rows={3}
            placeholder="Anotações internas sobre este fornecedor…"
            className="input"
          />
        </div>
      </section>

      <div className="form-actions">
        <a href="/suppliers" className="btn btn-outline">Cancelar</a>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? 'Salvando…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
