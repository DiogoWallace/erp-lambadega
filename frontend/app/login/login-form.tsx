'use client'

import { useActionState } from 'react'
import { Icon } from '@/app/ui/icons'
import { loginAction } from './actions'

interface State {
  error?: string
}

export function LoginForm() {
  const [state, formAction, pending] = useActionState<State | null, FormData>(loginAction, null)

  return (
    <form action={formAction} className="form-stack" style={{ gap: 14, marginTop: 18 }}>
      {state?.error && (
        <div className="form-banner-error" role="alert">
          <Icon name="x" size={14} />
          <span>{state.error}</span>
        </div>
      )}

      <div className="form-field">
        <label className="field-label" htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="seu@email.com"
          className="input"
        />
      </div>

      <div className="form-field">
        <label className="field-label" htmlFor="password">Senha</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="input"
        />
      </div>

      <button type="submit" className="btn btn-primary auth-submit" disabled={pending}>
        {pending ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}
