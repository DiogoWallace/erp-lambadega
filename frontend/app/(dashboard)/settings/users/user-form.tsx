'use client'

import { useActionState } from 'react'
import type { UserAccount } from '@/app/lib/types'
import type { UserFormState } from './actions'

const INITIAL: UserFormState = { error: null, errors: undefined }

const ROLES = [
  { value: 'admin', label: 'Admin — acesso total' },
  { value: 'gerente', label: 'Gerente — gerencia operação' },
  { value: 'financeiro', label: 'Financeiro — contas e relatórios' },
  { value: 'vendedor', label: 'Vendedor — PDV e clientes' },
]

interface Props {
  action: (prev: UserFormState, formData: FormData) => Promise<UserFormState>
  user?: UserAccount
  submitLabel: string
  mode: 'create' | 'update'
}

function FieldError({ errors, field }: { errors?: Record<string, string[]>; field: string }) {
  const msg = errors?.[field]?.[0]
  if (!msg) return null
  return <p className="form-field-error">{msg}</p>
}

export function UserForm({ action, user, submitLabel, mode }: Props) {
  const [state, formAction, pending] = useActionState(action, INITIAL)

  return (
    <form action={formAction} className="form-stack">
      {state.error && <div className="form-banner-error">{state.error}</div>}

      <section className="card">
        <div className="card-head"><div><h3>Dados do usuário</h3></div></div>
        <div className="card-body form-grid">
          <div className="form-field form-field-span-2">
            <label className="field-label" htmlFor="name">Nome *</label>
            <input id="name" name="name" type="text" required maxLength={255} defaultValue={user?.name ?? ''} className="input" />
            <FieldError errors={state.errors} field="name" />
          </div>

          <div className="form-field form-field-span-2">
            <label className="field-label" htmlFor="email">E-mail *</label>
            <input id="email" name="email" type="email" required maxLength={255} defaultValue={user?.email ?? ''} className="input" />
            <FieldError errors={state.errors} field="email" />
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="phone">Telefone</label>
            <input id="phone" name="phone" type="tel" maxLength={20} defaultValue={user?.phone ?? ''} className="input" />
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="role">Cargo *</label>
            <select id="role" name="role" required defaultValue={user?.role ?? ''} className="input">
              <option value="">Selecione…</option>
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <FieldError errors={state.errors} field="role" />
          </div>

          {mode === 'create' && (
            <div className="form-field form-field-span-2">
              <label className="field-label" htmlFor="password">Senha inicial *</label>
              <input id="password" name="password" type="text" required minLength={8} className="input" />
              <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Mínimo 8 caracteres. Compartilhe com o usuário — ele poderá trocá-la depois em Meu perfil.
              </p>
              <FieldError errors={state.errors} field="password" />
            </div>
          )}

          {mode === 'update' && (
            <div className="form-field form-field-span-2">
              <label className="field-label" htmlFor="is_active">Status</label>
              <select id="is_active" name="is_active" defaultValue={user?.is_active === false ? 'false' : 'true'} className="input">
                <option value="true">Ativo</option>
                <option value="false">Inativo (revoga acesso)</option>
              </select>
            </div>
          )}
        </div>
      </section>

      <div className="form-actions">
        <a href="/settings/users" className="btn btn-outline">Cancelar</a>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? 'Salvando…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
