'use client'

import { useActionState, useRef, useEffect } from 'react'
import { changePasswordAction, type ProfileFormState } from './actions'

const INITIAL: ProfileFormState = { error: null, errors: undefined, success: false }

function FieldError({ errors, field }: { errors?: Record<string, string[]>; field: string }) {
  const msg = errors?.[field]?.[0]
  if (!msg) return null
  return <p className="form-field-error">{msg}</p>
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, INITIAL)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) formRef.current?.reset()
  }, [state.success])

  return (
    <form ref={formRef} action={formAction} className="form-stack">
      {state.error && <div className="form-banner-error">{state.error}</div>}
      {state.success && <div className="form-banner-success">Senha alterada com sucesso. Outras sessões foram encerradas.</div>}

      <section className="card">
        <div className="card-head"><div><h3>Alterar senha</h3></div></div>
        <div className="card-body form-grid">
          <div className="form-field form-field-full">
            <label className="field-label" htmlFor="current_password">Senha atual *</label>
            <input id="current_password" name="current_password" type="password" required autoComplete="current-password" className="input" />
            <FieldError errors={state.errors} field="current_password" />
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="new_password">Nova senha *</label>
            <input id="new_password" name="new_password" type="password" required minLength={8} autoComplete="new-password" className="input" />
            <FieldError errors={state.errors} field="new_password" />
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="new_password_confirmation">Confirme a nova senha *</label>
            <input id="new_password_confirmation" name="new_password_confirmation" type="password" required minLength={8} autoComplete="new-password" className="input" />
          </div>
        </div>
      </section>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? 'Alterando…' : 'Alterar senha'}
        </button>
      </div>
    </form>
  )
}
