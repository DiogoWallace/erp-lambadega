'use client'

import { useActionState } from 'react'
import { broadcastNotificationAction, type BroadcastFormState } from '../../actions'

const INITIAL: BroadcastFormState = { error: null }

export function BroadcastForm() {
  const [state, formAction, pending] = useActionState(broadcastNotificationAction, INITIAL)

  return (
    <form action={formAction} className="form-stack">
      {state.error && <div className="form-banner-error">{state.error}</div>}

      <section className="card">
        <div className="card-head"><div><h3>Conteúdo da notificação</h3></div></div>
        <div className="card-body form-grid">
          <div className="form-field">
            <label className="field-label" htmlFor="type">Tipo *</label>
            <select id="type" name="type" defaultValue="news" className="input">
              <option value="news">Novidade</option>
              <option value="system.update">Atualização do sistema</option>
              <option value="custom">Outro</option>
            </select>
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="severity">Severidade *</label>
            <select id="severity" name="severity" defaultValue="info" className="input">
              <option value="info">Informativa</option>
              <option value="warning">Atenção</option>
              <option value="critical">Crítica</option>
            </select>
          </div>

          <div className="form-field form-field-full">
            <label className="field-label" htmlFor="title">Título *</label>
            <input id="title" name="title" type="text" required maxLength={200} className="input" />
          </div>

          <div className="form-field form-field-full">
            <label className="field-label" htmlFor="body">Mensagem</label>
            <textarea id="body" name="body" rows={4} maxLength={2000} className="input" />
          </div>

          <div className="form-field form-field-full">
            <label className="field-label" htmlFor="action_url">URL de ação (opcional)</label>
            <input
              id="action_url"
              name="action_url"
              type="text"
              maxLength={255}
              placeholder="/dashboard"
              className="input"
            />
          </div>
        </div>
      </section>

      <div className="form-actions">
        <a href="/notifications" className="btn btn-outline">Cancelar</a>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? 'Enviando…' : 'Enviar para todos'}
        </button>
      </div>
    </form>
  )
}
