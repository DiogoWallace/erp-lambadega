import Link from 'next/link'
import { apiFetch } from '@/app/lib/api'
import type { Notification, NotificationSeverity, PaginatedResponse } from '@/app/lib/types'
import { Icon, type IconName } from '@/app/ui/icons'
import { MarkAllButton, MarkReadButton } from './row-actions'

interface Props {
  searchParams: Promise<{
    status?: string
    type?: string
    page?: string
  }>
}

const STATUS_LABEL: Record<string, string> = {
  unread: 'Não lidas',
  read: 'Lidas',
}

const TYPE_LABEL: Record<string, string> = {
  'stock.out':         'Estoque zerado',
  'stock.critical':    'Estoque crítico',
  'finance.overdue':   'Conta vencida',
  'finance.due_soon':  'Conta próxima do vencimento',
  'system.update':     'Atualização do sistema',
  news:                'Novidade',
}

function iconForType(type: string): IconName {
  if (type.startsWith('stock.')) return 'package'
  if (type.startsWith('finance.')) return 'finance'
  if (type === 'system.update') return 'settings'
  if (type === 'news') return 'star'
  return 'bell'
}

function severityClass(severity: NotificationSeverity): string {
  if (severity === 'critical') return 'notif-icon-critical'
  if (severity === 'warning') return 'notif-icon-warning'
  return 'notif-icon-info'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default async function NotificationsPage({ searchParams }: Props) {
  const { status = '', type = '', page = '1' } = await searchParams

  const params = new URLSearchParams({ page })
  if (status) params.set('status', status)
  if (type)   params.set('type', type)

  const res = await apiFetch(`/notifications?${params}`)
  const { data: items, meta }: PaginatedResponse<Notification> = await res.json()

  function pageUrl(p: number) {
    const q = new URLSearchParams({ page: String(p) })
    if (status) q.set('status', status)
    if (type)   q.set('type', type)
    return `/notifications?${q}`
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Notificações</h1>
          <p className="page-subtitle">{meta.total} registro(s)</p>
        </div>
        <MarkAllButton />
      </div>

      <form method="GET" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <select name="status" defaultValue={status} className="input input-sm" style={{ width: 180 }}>
          <option value="">Todos os status</option>
          {Object.entries(STATUS_LABEL).map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
        </select>
        <select name="type" defaultValue={type} className="input input-sm" style={{ width: 220 }}>
          <option value="">Todos os tipos</option>
          {Object.entries(TYPE_LABEL).map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
        </select>
        <button type="submit" className="btn btn-outline btn-sm"><Icon name="filter" size={12} /> Filtrar</button>
        {(status || type) && (
          <a href="/notifications" className="btn btn-ghost btn-sm"><Icon name="x" size={12} /> Limpar</a>
        )}
      </form>

      <div className="card">
        {items.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nenhuma notificação encontrada.</p>
          </div>
        ) : (
          <div className="notif-list" style={{ maxHeight: 'none' }}>
            {items.map((item) => {
              const unread = !item.read_at
              return (
                <div key={item.id} className={`notif-item ${unread ? 'notif-item-unread' : ''}`} style={{ cursor: 'default' }}>
                  <span className={`notif-icon ${severityClass(item.severity)}`}>
                    <Icon name={iconForType(item.type)} size={14} />
                  </span>
                  <span className="notif-content">
                    <span className="notif-title">{item.title}</span>
                    {item.body && <span className="notif-body">{item.body}</span>}
                    <span className="notif-meta">
                      {TYPE_LABEL[item.type] ?? item.type} · {formatDate(item.created_at)}
                      {item.broadcast && ' · broadcast'}
                    </span>
                    {(item.action_url || unread) && (
                      <span style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                        {item.action_url && (
                          <Link href={item.action_url} className="btn btn-ghost btn-sm">
                            <Icon name="arrow_right" size={12} /> Abrir
                          </Link>
                        )}
                        {unread && <MarkReadButton id={item.id} />}
                      </span>
                    )}
                  </span>
                  {unread && <span className="notif-dot" aria-hidden="true" />}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {meta.last_page > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Página {meta.current_page} de {meta.last_page}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {meta.current_page > 1 && (<Link href={pageUrl(meta.current_page - 1)} className="btn btn-outline btn-sm">← Anterior</Link>)}
            {meta.current_page < meta.last_page && (<Link href={pageUrl(meta.current_page + 1)} className="btn btn-outline btn-sm">Próxima →</Link>)}
          </div>
        </div>
      )}
    </div>
  )
}
