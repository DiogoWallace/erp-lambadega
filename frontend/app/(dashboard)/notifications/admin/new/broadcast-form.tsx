'use client'

import { useActionState } from 'react'
import { broadcastNotificationAction, type BroadcastFormState } from '../../actions'
import { Icon } from '@/app/ui/icons'

const INITIAL: BroadcastFormState = { error: null }

export function BroadcastForm() {
  const [state, formAction, pending] = useActionState(broadcastNotificationAction, INITIAL)

  return (
    <form action={formAction} className="form-stack max-w-3xl">
      {state.error && (
        <div className="p-4 bg-[var(--danger-soft)] border border-[var(--danger)]/20 text-[var(--danger)] rounded-xl text-sm font-semibold flex items-center gap-2 mb-6">
          <Icon name="x" size={16} />
          {state.error}
        </div>
      )}

      <div className="card shadow-sm border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="card-head bg-[var(--surface-2)] border-b border-[var(--border)] px-8 py-5">
          <div>
            <h3 className="text-lg font-bold text-[var(--text)]">Conteúdo da Notificação</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">Preencha os campos abaixo para disparar o alerta para todos os usuários.</p>
          </div>
        </div>

        <div className="p-8 form-grid">
          <div className="form-field">
            <label className="field-label" htmlFor="type">Tipo *</label>
            <select id="type" name="type" defaultValue="news" className="input bg-[var(--surface)]">
              <option value="news">Novidade</option>
              <option value="system.update">Atualização do sistema</option>
              <option value="custom">Outro</option>
            </select>
          </div>

          <div className="form-field">
            <label className="field-label" htmlFor="severity">Severidade *</label>
            <select id="severity" name="severity" defaultValue="info" className="input bg-[var(--surface)]">
              <option value="info">Informativa</option>
              <option value="warning">Atenção</option>
              <option value="critical">Crítica</option>
            </select>
          </div>

          <div className="form-field form-field-span-2">
            <label className="field-label" htmlFor="title">Título *</label>
            <input 
              id="title" 
              name="title" 
              type="text" 
              required 
              maxLength={200} 
              className="input bg-[var(--surface)]" 
              placeholder="Digite o título da notificação"
            />
          </div>

          <div className="form-field form-field-span-2">
            <label className="field-label" htmlFor="body">Mensagem / Corpo</label>
            <textarea 
              id="body" 
              name="body" 
              rows={4} 
              maxLength={2000} 
              className="input bg-[var(--surface)]" 
              placeholder="Descreva detalhadamente o conteúdo do alerta..."
            />
          </div>

          <div className="form-field form-field-span-2">
            <label className="field-label" htmlFor="action_url">URL de Ação (opcional)</label>
            <input
              id="action_url"
              name="action_url"
              type="text"
              maxLength={255}
              placeholder="Ex: /dashboard ou /sales"
              className="input bg-[var(--surface)] font-mono"
            />
            <p className="text-[11px] text-[var(--text-muted)] mt-2">
              Se fornecido, os usuários poderão clicar na notificação para serem redirecionados para esta página.
            </p>
          </div>
        </div>
      </div>

      <div className="form-actions mt-8 flex items-center gap-4">
        <a href="/notifications" className="btn btn-outline px-6 py-2.5 rounded-lg font-bold border text-center">
          Cancelar
        </a>
        <button 
          type="submit" 
          className="btn btn-primary px-6 py-2.5 rounded-lg font-bold bg-primary text-white shadow-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          disabled={pending}
        >
          {pending ? 'Enviando…' : 'Enviar para Todos'}
        </button>
      </div>
    </form>
  )
}

