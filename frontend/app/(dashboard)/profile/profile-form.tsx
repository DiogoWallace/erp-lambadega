'use client'

import { useActionState } from 'react'
import { updateProfileAction, type ProfileFormState } from './actions'

const INITIAL: ProfileFormState = { error: null, errors: undefined, success: false }

interface Props {
  user: { name: string; email: string; phone: string | null }
}

function FieldError({ errors, field }: { errors?: Record<string, string[]>; field: string }) {
  const msg = errors?.[field]?.[0]
  if (!msg) return null
  return <p className="form-field-error">{msg}</p>
}

export function ProfileForm({ user }: Props) {
  const [state, formAction, pending] = useActionState(updateProfileAction, INITIAL)

  return (
    <form action={formAction} className="form-stack">
      {state.error && <div className="form-banner-error">{state.error}</div>}
      {state.success && <div className="form-banner-success">Perfil atualizado com sucesso.</div>}

      <section className="card">
        <div className="card-head"><div><h3>Dados pessoais</h3></div></div>
        <div className="card-body form-grid">
          <div className="form-field form-field-span-2">
            <label className="field-label" htmlFor="name">Nome *</label>
            <input id="name" name="name" type="text" required maxLength={255} defaultValue={user.name} className="input" />
            <FieldError errors={state.errors} field="name" />
          </div>

          <div className="form-field form-field-span-2">
            <label className="field-label" htmlFor="email">E-mail *</label>
            <input id="email" name="email" type="email" required maxLength={255} defaultValue={user.email} className="input" />
            <FieldError errors={state.errors} field="email" />
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="phone">Telefone</label>
            <input id="phone" name="phone" type="tel" maxLength={20} defaultValue={user.phone ?? ''} className="input" />
            <FieldError errors={state.errors} field="phone" />
          </div>
        </div>
      </section>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </div>
    </form>
  )
}
