'use client'

import { useActionState } from 'react'
import { updateCompanyAction, type CompanyFormState } from './actions'

const INITIAL: CompanyFormState = { error: null, errors: undefined, success: false }

const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
]

interface Company {
  name: string
  trade_name: string | null
  document: string | null
  email: string | null
  phone: string | null
  address: string | null
  address_number: string | null
  address_complement: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  zip_code: string | null
}

interface Props {
  company: Company
  canEdit: boolean
}

function FieldError({ errors, field }: { errors?: Record<string, string[]>; field: string }) {
  const msg = errors?.[field]?.[0]
  if (!msg) return null
  return <p className="form-field-error">{msg}</p>
}

export function CompanyForm({ company, canEdit }: Props) {
  const [state, formAction, pending] = useActionState(updateCompanyAction, INITIAL)
  const readOnly = !canEdit

  return (
    <form action={formAction} className="form-stack">
      {state.error && <div className="form-banner-error">{state.error}</div>}
      {state.success && <div className="form-banner-success">Dados da empresa atualizados com sucesso.</div>}
      {readOnly && (
        <div className="form-banner-error" style={{ background: 'var(--info-soft)', color: 'var(--info)' }}>
          Você tem permissão de leitura mas não de edição. Solicite ao administrador.
        </div>
      )}

      <section className="card">
        <div className="card-head"><div><h3>Dados principais</h3></div></div>
        <div className="card-body form-grid">
          <div className="form-field form-field-span-2">
            <label className="field-label" htmlFor="name">Razão social *</label>
            <input id="name" name="name" type="text" required maxLength={255} defaultValue={company.name} disabled={readOnly} className="input" />
            <FieldError errors={state.errors} field="name" />
          </div>

          <div className="form-field form-field-span-2">
            <label className="field-label" htmlFor="trade_name">Nome fantasia</label>
            <input id="trade_name" name="trade_name" type="text" maxLength={255} defaultValue={company.trade_name ?? ''} disabled={readOnly} className="input" />
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="document">CNPJ</label>
            <input id="document" name="document" type="text" maxLength={20} defaultValue={company.document ?? ''} disabled={readOnly} className="input" />
            <FieldError errors={state.errors} field="document" />
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" maxLength={255} defaultValue={company.email ?? ''} disabled={readOnly} className="input" />
            <FieldError errors={state.errors} field="email" />
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="phone">Telefone</label>
            <input id="phone" name="phone" type="tel" maxLength={20} defaultValue={company.phone ?? ''} disabled={readOnly} className="input" />
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-head"><div><h3>Endereço</h3></div></div>
        <div className="card-body form-grid">
          <div className="form-field form-field-span-2">
            <label className="field-label" htmlFor="address">Logradouro</label>
            <input id="address" name="address" type="text" maxLength={255} defaultValue={company.address ?? ''} disabled={readOnly} className="input" />
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="address_number">Número</label>
            <input id="address_number" name="address_number" type="text" maxLength={20} defaultValue={company.address_number ?? ''} disabled={readOnly} className="input" />
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="address_complement">Complemento</label>
            <input id="address_complement" name="address_complement" type="text" maxLength={255} defaultValue={company.address_complement ?? ''} disabled={readOnly} className="input" />
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="neighborhood">Bairro</label>
            <input id="neighborhood" name="neighborhood" type="text" maxLength={255} defaultValue={company.neighborhood ?? ''} disabled={readOnly} className="input" />
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="city">Cidade</label>
            <input id="city" name="city" type="text" maxLength={255} defaultValue={company.city ?? ''} disabled={readOnly} className="input" />
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="state">Estado (UF)</label>
            <select id="state" name="state" defaultValue={company.state ?? ''} disabled={readOnly} className="input">
              <option value="">—</option>
              {STATES.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
            </select>
            <FieldError errors={state.errors} field="state" />
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="zip_code">CEP</label>
            <input id="zip_code" name="zip_code" type="text" maxLength={10} defaultValue={company.zip_code ?? ''} disabled={readOnly} className="input" />
          </div>
        </div>
      </section>

      <div className="form-actions">
        <a href="/settings" className="btn btn-outline">Voltar</a>
        {canEdit && (
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? 'Salvando…' : 'Salvar alterações'}
          </button>
        )}
      </div>
    </form>
  )
}
