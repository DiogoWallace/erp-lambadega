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
  if (severity === 'critical') return 'bg-[var(--danger-soft)] text-[var(--danger)] border border-[var(--danger)]/20'
  if (severity === 'warning') return 'bg-[var(--warning-soft)] text-[var(--warning)] border border-[var(--warning)]/20'
  return 'bg-[var(--info-soft)] text-[var(--info)] border border-[var(--info)]/20'
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

  const [res, meRes] = await Promise.all([
    apiFetch(`/notifications?${params}`),
    apiFetch('/auth/me'),
  ])

  const { data: items, meta }: PaginatedResponse<Notification> = await res.json()
  const { data: me } = await meRes.json()

  const permissions: string[] = me?.permissions ?? []
  const canBroadcast = permissions.includes('notification.broadcast')

  // Dynamic calculations for feed stats
  const totalCount = meta.total
  const unreadCount = items.filter(item => !item.read_at).length
  const criticalCount = items.filter(item => item.severity === 'critical').length

  function pageUrl(p: number) {
    const q = new URLSearchParams({ page: String(p) })
    if (status) q.set('status', status)
    if (type)   q.set('type', type)
    return `/notifications?${q}`
  }

  return (
    <div className="page">
      {/* Breadcrumb & Header */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-[var(--text-muted)] mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Sistema</span>
          <Icon name="chevron_r" size={10} />
          <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider text-primary">Notificações</span>
        </nav>
        <div className="flex justify-between items-end flex-wrap gap-4">
          <div>
            <h1 className="page-title text-[32px] font-bold text-[var(--text)]">Notificações</h1>
            <p className="page-subtitle text-[var(--text-soft)]">Acompanhe alertas importantes de estoque, finanças e atualizações do sistema.</p>
          </div>
          <div className="flex items-center gap-3">
            <MarkAllButton />
            {canBroadcast && (
              <Link href="/notifications/admin/new" className="btn btn-primary px-6 py-2.5 rounded-xl font-bold bg-primary text-white shadow-sm flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all">
                <Icon name="plus" size={16} stroke={2.5} /> Enviar Mensagem
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] shadow-sm">
          <p className="text-[10px] font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wider">Total de Alertas</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[var(--text)]">{totalCount}</span>
            <span className="text-xs text-[var(--text-soft)]">registrados</span>
          </div>
        </div>
        <div className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] shadow-sm">
          <p className="text-[10px] font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wider">Não Lidas (Pág)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[var(--accent)]">{unreadCount}</span>
            <span className="text-xs text-[var(--text-soft)]">mensagens</span>
          </div>
        </div>
        <div className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] shadow-sm">
          <p className="text-[10px] font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wider">Críticas (Pág)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[var(--danger)]">{criticalCount}</span>
            <span className="text-xs text-[var(--text-soft)]">alertas</span>
          </div>
        </div>
        <div className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] shadow-sm">
          <p className="text-[10px] font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wider">Status das Filas</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[var(--success)]">Online</span>
            <span className="text-xs font-bold text-[var(--success)] flex items-center gap-0.5">
              <Icon name="check" size={12} /> OK
            </span>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <form method="GET" className="bg-[var(--surface)] p-4 rounded-t-2xl flex items-center justify-between border border-[var(--border)] border-b-0 flex-wrap gap-4">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          <select name="status" defaultValue={status} className="input input-sm bg-[var(--surface-2)] border-none" style={{ width: 180 }}>
            <option value="">Todos os status</option>
            {Object.entries(STATUS_LABEL).map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
          </select>
          <select name="type" defaultValue={type} className="input input-sm bg-[var(--surface-2)] border-none" style={{ width: 220 }}>
            <option value="">Todos os tipos</option>
            {Object.entries(TYPE_LABEL).map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
          </select>
          <button type="submit" className="btn btn-outline btn-sm flex items-center gap-1.5">
            <Icon name="filter" size={13} /> Filtrar
          </button>
          {(status || type) && (
            <a href="/notifications" className="btn btn-ghost btn-sm flex items-center gap-1">
              <Icon name="x" size={13} /> Limpar
            </a>
          )}
        </div>
        <div className="text-sm font-medium text-[var(--text-soft)]">
          Mostrando {items.length} de {meta.total} registros
        </div>
      </form>

      {/* Notifications Feed Card List */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-b-2xl shadow-sm overflow-hidden divide-y divide-[var(--border-soft)]">
        {items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-[var(--text-muted)]">Nenhuma notificação encontrada.</p>
          </div>
        ) : (
          items.map((item) => {
            const unread = !item.read_at
            return (
              <div key={item.id} className={`flex items-start gap-4 p-6 transition-colors hover:bg-[var(--surface-2)]/30 ${unread ? 'bg-[var(--accent-soft)]/20' : ''}`}>
                {/* Severity Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${severityClass(item.severity)}`}>
                  <Icon name={iconForType(item.type)} size={18} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="text-sm font-bold text-[var(--text)] leading-tight">{item.title}</h4>
                    {unread && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] shrink-0 shadow-[0_0_8px_rgba(43,108,176,0.4)]" title="Não lida"></span>
                    )}
                  </div>
                  {item.body && (
                    <p className="text-xs text-[var(--text-soft)] mt-1.5 leading-relaxed">{item.body}</p>
                  )}
                  <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] font-medium mt-3">
                    <span className="uppercase font-semibold text-[var(--text-soft)]">{TYPE_LABEL[item.type] ?? item.type}</span>
                    <span>·</span>
                    <span>{formatDate(item.created_at)}</span>
                    {item.broadcast && (
                      <>
                        <span>·</span>
                        <span className="bg-[var(--info-soft)] text-[var(--info)] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider text-[9px]">Geral</span>
                      </>
                    )}
                  </div>

                  {/* Actions inside row */}
                  {(item.action_url || unread) && (
                    <div className="flex items-center gap-3 mt-4">
                      {item.action_url && (
                        <Link href={item.action_url} className="btn btn-outline btn-sm flex items-center gap-1">
                          <Icon name="arrow_right" size={13} /> Abrir
                        </Link>
                      )}
                      {unread && <MarkReadButton id={item.id} />}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="mt-6 flex items-center justify-between px-2">
          <p className="text-sm text-[var(--text-soft)]">
            Página {meta.current_page} de {meta.last_page}
          </p>
          <div className="flex items-center gap-2">
            {meta.current_page > 1 && (
              <Link href={pageUrl(meta.current_page - 1)} className="btn btn-outline btn-sm">
                ← Anterior
              </Link>
            )}
            {meta.current_page < meta.last_page && (
              <Link href={pageUrl(meta.current_page + 1)} className="btn btn-outline btn-sm">
                Próxima →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

