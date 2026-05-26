import Link from 'next/link'
import { apiFetch } from '@/app/lib/api'
import { AuditLog, PaginatedResponse } from '@/app/lib/types'
import { Icon } from '@/app/ui/icons'

interface Props {
  searchParams: Promise<{
    event?: string
    module?: string
    date_from?: string
    date_to?: string
    page?: string
  }>
}

const EVENT_LABEL: Record<string, string> = {
  created: 'Insert', updated: 'Update', deleted: 'Delete', login: 'Login', logout: 'Logout',
}

const EVENT_STYLE: Record<string, { bg: string; color: string }> = {
  created:  { bg: 'var(--accent-soft)',   color: 'var(--accent)' },
  updated:  { bg: 'var(--warning-soft)',  color: 'var(--warning)' },
  deleted:  { bg: 'var(--danger-soft)',   color: 'var(--danger)' },
  login:    { bg: 'var(--success-soft)',  color: 'var(--success)' },
  logout:   { bg: 'var(--surface-2)',     color: 'var(--text-muted)' },
}

const MODULE_LABEL: Record<string, string> = {
  customers: 'Clientes', suppliers: 'Fornecedores', categories: 'Categorias',
  products: 'Produtos', stock: 'Estoque', sales: 'Vendas', finance: 'Financeiro', auth: 'Autenticação',
}

function formatDate(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  }
}

function formatValues(values: Record<string, unknown> | null): string {
  if (!values) return '—'
  const keys = Object.keys(values)
  if (keys.length === 0) return '—'
  return keys.slice(0, 3).join(', ') + (keys.length > 3 ? ` +${keys.length - 3}` : '')
}

function initials(name: string): string {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

// Deterministic avatar color based on name
const AVATAR_COLORS = [
  { bg: 'oklch(0.92 0.07 252)', color: 'oklch(0.38 0.13 252)' },
  { bg: 'oklch(0.93 0.06 152)', color: 'oklch(0.40 0.12 152)' },
  { bg: 'oklch(0.93 0.07 75)',  color: 'oklch(0.48 0.14 75)' },
  { bg: 'oklch(0.93 0.06 25)',  color: 'oklch(0.45 0.14 25)' },
  { bg: 'oklch(0.93 0.06 300)', color: 'oklch(0.42 0.12 300)' },
]
function avatarColor(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

export default async function AuditLogsPage({ searchParams }: Props) {
  const { event = '', module = '', date_from = '', date_to = '', page = '1' } = await searchParams

  const params = new URLSearchParams({ page })
  if (event) params.set('event', event)
  if (module) params.set('module', module)
  if (date_from) params.set('date_from', date_from)
  if (date_to) params.set('date_to', date_to)

  const res = await apiFetch(`/audit-logs?${params}`)
  const { data: logs, meta }: PaginatedResponse<AuditLog> = await res.json()

  function pageUrl(p: number) {
    const q = new URLSearchParams({ page: String(p) })
    if (event) q.set('event', event)
    if (module) q.set('module', module)
    if (date_from) q.set('date_from', date_from)
    if (date_to) q.set('date_to', date_to)
    return `/audit-logs?${q}`
  }

  const hasFilters = !!(event || module || date_from || date_to)

  return (
    <div className="page flex flex-col gap-6 w-full max-w-[1200px] mx-auto">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-headline-lg font-headline-lg text-text">Auditoria do Sistema</h1>
          <p className="page-subtitle text-body-sm text-text-muted mt-1.5">
            Rastreamento de logs de segurança e operações de registros.
          </p>
        </div>
        <div className="flex gap-2.5 w-full sm:w-auto self-stretch sm:self-auto">
          <a
            href={`/audit-logs?${params}&export=csv`}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg border border-border-strong text-text-soft font-bold text-body-md hover:bg-surface-hover transition-colors flex items-center justify-center gap-2 active:scale-95 shadow-sm"
          >
            <Icon name="download" size={16} />
            Exportar CSV
          </a>
          <a
            href={`/audit-logs?${params}`}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg bg-primary text-on-primary font-bold text-body-md hover:shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
          >
            <Icon name="refresh" size={16} />
            Atualizar
          </a>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de logs */}
        <div className="card bg-surface border border-border-soft rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
            TOTAL DE LOGS
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-headline-lg font-bold text-text font-headline-lg">
              {meta.total.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>

        {/* Alertas críticos (deleted) */}
        <div className="card bg-surface border border-border-soft rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
            ALERTAS CRÍTICOS
          </p>
          <div className="flex items-baseline gap-2 justify-between">
            <span className="text-headline-lg font-bold text-danger font-headline-lg">
              {logs.filter(l => l.event === 'deleted').length}
            </span>
            <span className="text-[10px] font-bold text-danger bg-danger-soft px-2 py-0.5 rounded-full uppercase tracking-wider">
              EXCLUSÕES
            </span>
          </div>
        </div>

        {/* Módulo mais ativo */}
        <div className="card bg-surface border border-border-soft rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
            MÓDULO MAIS ATIVO
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-headline-md font-bold text-text font-headline-lg truncate">
              {(() => {
                const counts: Record<string, number> = {}
                logs.forEach(l => { counts[l.module] = (counts[l.module] ?? 0) + 1 })
                const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
                return top ? MODULE_LABEL[top[0]] ?? top[0] : '—'
              })()}
            </span>
          </div>
        </div>

        {/* Página atual */}
        <div className="card bg-surface border border-border-soft rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
            PÁGINA ATUAL
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-headline-lg font-bold text-text font-headline-lg">
              {meta.current_page}
            </span>
            <span className="text-body-sm text-text-muted font-medium">
              de {meta.last_page}
            </span>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="card bg-surface border border-border-soft rounded-lg p-5 shadow-sm">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Evento */}
          <div>
            <label className="block text-xs font-bold text-text-soft uppercase tracking-wider mb-2">
              Evento
            </label>
            <select
              name="event"
              defaultValue={event}
              className="w-full bg-bg-soft border border-border-soft rounded-lg px-3 py-2 text-body-md transition-all focus:bg-surface"
            >
              <option value="">Todos os eventos</option>
              {Object.entries(EVENT_LABEL).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          {/* Módulo */}
          <div>
            <label className="block text-xs font-bold text-text-soft uppercase tracking-wider mb-2">
              Módulo
            </label>
            <select
              name="module"
              defaultValue={module}
              className="w-full bg-bg-soft border border-border-soft rounded-lg px-3 py-2 text-body-md transition-all focus:bg-surface"
            >
              <option value="">Todos os módulos</option>
              {Object.entries(MODULE_LABEL).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          {/* Período */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-text-soft uppercase tracking-wider mb-2">
              Período
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                name="date_from"
                defaultValue={date_from}
                className="w-full bg-bg-soft border border-border-soft rounded-lg px-3 py-1.5 text-body-md transition-all focus:bg-surface"
              />
              <span className="text-xs font-bold text-text-faint uppercase tracking-wider">até</span>
              <input
                type="date"
                name="date_to"
                defaultValue={date_to}
                className="w-full bg-bg-soft border border-border-soft rounded-lg px-3 py-1.5 text-body-md transition-all focus:bg-surface"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-2 w-full sm:col-span-2 lg:col-span-4 justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-primary text-on-primary rounded-lg font-bold text-body-md shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Icon name="filter" size={14} />
              Filtrar
            </button>
            {hasFilters && (
              <a
                href="/audit-logs"
                className="px-5 py-2 border border-border-strong text-text-soft rounded-lg font-bold text-body-md hover:bg-surface-hover transition-colors flex items-center justify-center gap-2 active:scale-95"
              >
                <Icon name="x" size={14} />
                Limpar
              </a>
            )}
          </div>
        </form>
      </div>

      {/* Logs Table Container */}
      <div className="card bg-surface border border-border-soft rounded-lg shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="text-text-faint mb-3 flex justify-center">
              <Icon name="eye" size={40} />
            </div>
            <p className="text-body-md text-text-muted font-medium">Nenhum registro encontrado.</p>
            {hasFilters && (
              <a
                href="/audit-logs"
                className="inline-block mt-3 text-body-sm text-primary font-bold hover:underline"
              >
                Limpar filtros
              </a>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-surface-2 border-b border-border text-left">
                    {['QUANDO', 'USUÁRIO', 'EVENTO', 'MÓDULO', 'REGISTRO', 'ALTERAÇÃO', 'IP'].map((h) => (
                      <th
                        key={h}
                        className={`p-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider ${
                          h === 'EVENTO' ? 'text-center' : 'text-left'
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => {
                    const { date, time } = formatDate(log.created_at)
                    const evStyle = EVENT_STYLE[log.event] ?? { bg: 'var(--surface-2)', color: 'var(--text-muted)' }
                    const userName = log.user?.name ?? '—'
                    const av = userName !== '—' ? avatarColor(userName) : { bg: 'var(--surface-2)', color: 'var(--text-muted)' }

                    return (
                      <tr
                        key={log.id}
                        className={`border-b hover:bg-surface-hover transition-colors ${
                          i === logs.length - 1 ? 'border-b-0' : 'border-border-soft'
                        }`}
                      >
                        {/* Quando */}
                        <td className="p-4 py-3.5 whitespace-nowrap">
                          <div className="font-mono text-body-sm font-semibold text-text">
                            {date}
                          </div>
                          <div className="text-[10px] text-text-faint mt-0.5 font-mono">
                            {time}
                          </div>
                        </td>

                        {/* Usuário */}
                        <td className="p-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                              style={{ background: av.bg, color: av.color }}
                            >
                              {userName !== '—' ? initials(userName) : '—'}
                            </div>
                            <span className="text-body-sm font-semibold text-text">
                              {userName}
                            </span>
                          </div>
                        </td>

                        {/* Evento */}
                        <td className="p-4 py-3.5 text-center whitespace-nowrap">
                          <span
                            className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono"
                            style={{ background: evStyle.bg, color: evStyle.color }}
                          >
                            {EVENT_LABEL[log.event] ?? log.event}
                          </span>
                        </td>

                        {/* Módulo */}
                        <td className="p-4 py-3.5 text-body-sm text-text-soft whitespace-nowrap">
                          {MODULE_LABEL[log.module] ?? log.module}
                        </td>

                        {/* Registro */}
                        <td className="p-4 py-3.5 whitespace-nowrap">
                          <span className="font-mono text-xs text-text-muted">
                            {log.model_type ?? '—'}
                            {log.model_id && (
                              <span className="text-text-faint ml-1">#{log.model_id.slice(0, 8)}</span>
                            )}
                          </span>
                        </td>

                        {/* Alteração */}
                        <td className="p-4 py-3.5 max-w-xs">
                          {log.event === 'updated' && log.old_values && log.new_values ? (
                            <div className="bg-surface-2 border border-border-soft rounded-lg px-2 py-1 font-mono text-xs inline-flex items-center gap-1.5">
                              <span className="text-danger font-semibold truncate max-w-[100px]">{formatValues(log.old_values)}</span>
                              <span className="text-text-faint">→</span>
                              <span className="text-accent font-semibold truncate max-w-[100px]">{formatValues(log.new_values)}</span>
                            </div>
                          ) : log.event === 'deleted' ? (
                            <div className="bg-danger-soft border border-danger/10 rounded-lg px-2 py-1 font-mono text-xs inline-flex items-center gap-1.5 text-danger font-semibold">
                              {formatValues(log.old_values)}
                            </div>
                          ) : log.event === 'created' ? (
                            <span className="text-xs italic text-text-muted font-mono truncate block">
                              {formatValues(log.new_values)}
                            </span>
                          ) : (
                            <span className="text-text-faint text-xs">—</span>
                          )}
                        </td>

                        {/* IP */}
                        <td className="p-4 py-3.5 whitespace-nowrap font-mono text-xs text-text-faint">
                          {log.ip_address ?? '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card List View */}
            <div className="block md:hidden divide-y divide-border-soft">
              {logs.map((log) => {
                const { date, time } = formatDate(log.created_at)
                const evStyle = EVENT_STYLE[log.event] ?? { bg: 'var(--surface-2)', color: 'var(--text-muted)' }
                const userName = log.user?.name ?? '—'
                const av = userName !== '—' ? avatarColor(userName) : { bg: 'var(--surface-2)', color: 'var(--text-muted)' }

                return (
                  <div key={log.id} className="p-4 flex flex-col gap-3 bg-surface hover:bg-bg-soft transition-colors">
                    {/* Top Row: Event & Module */}
                    <div className="flex justify-between items-center">
                      <span
                        className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono"
                        style={{ background: evStyle.bg, color: evStyle.color }}
                      >
                        {EVENT_LABEL[log.event] ?? log.event}
                      </span>
                      <span className="text-xs text-text-soft font-bold">
                        {MODULE_LABEL[log.module] ?? log.module}
                      </span>
                    </div>

                    {/* User & Time Row */}
                    <div className="flex justify-between items-center bg-bg-soft/50 p-2.5 rounded-lg border border-border-soft">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                          style={{ background: av.bg, color: av.color }}
                        >
                          {userName !== '—' ? initials(userName) : '—'}
                        </div>
                        <span className="text-body-sm font-bold text-text truncate max-w-[120px]">
                          {userName}
                        </span>
                      </div>
                      <div className="text-right font-mono text-[11px] text-text-soft">
                        <div>{date}</div>
                        <div className="text-[10px] text-text-faint mt-0.5">{time}</div>
                      </div>
                    </div>

                    {/* Target Model Row */}
                    <div className="text-xs text-text-soft flex items-baseline gap-1">
                      <span className="font-semibold text-text-muted">Registro:</span>
                      <span className="font-mono text-text">
                        {log.model_type ?? '—'}
                        {log.model_id && (
                          <span className="text-text-faint ml-1">#{log.model_id.slice(0, 8)}</span>
                        )}
                      </span>
                    </div>

                    {/* Changes Row */}
                    <div className="text-xs">
                      <span className="font-semibold text-text-muted block mb-1">Alterações:</span>
                      {log.event === 'updated' && log.old_values && log.new_values ? (
                        <div className="bg-bg-soft border border-border-soft rounded-lg p-2 font-mono text-[10px] flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="bg-danger-soft text-danger px-1.5 py-0.5 rounded font-bold uppercase text-[8px]">Antes</span>
                            <span className="text-danger truncate">{formatValues(log.old_values)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="bg-accent-soft text-accent px-1.5 py-0.5 rounded font-bold uppercase text-[8px]">Depois</span>
                            <span className="text-accent truncate">{formatValues(log.new_values)}</span>
                          </div>
                        </div>
                      ) : log.event === 'deleted' ? (
                        <div className="bg-danger-soft border border-border-soft rounded-lg p-2 font-mono text-[10px] flex items-center gap-1.5">
                          <span className="bg-danger text-white px-1.5 py-0.5 rounded font-bold uppercase text-[8px]">Excluído</span>
                          <span className="text-danger font-semibold truncate">{formatValues(log.old_values)}</span>
                        </div>
                      ) : log.event === 'created' ? (
                        <div className="bg-success-soft border border-success/15 rounded-lg p-2 font-mono text-[10px] flex items-center gap-1.5 text-success">
                          <span className="bg-success text-white px-1.5 py-0.5 rounded font-bold uppercase text-[8px]">Criado</span>
                          <span className="font-semibold truncate">{formatValues(log.new_values)}</span>
                        </div>
                      ) : (
                        <span className="text-text-faint">—</span>
                      )}
                    </div>

                    {/* Footer IP Address */}
                    {log.ip_address && (
                      <div className="text-[10px] text-text-faint font-mono mt-1 border-t border-border-soft pt-2 flex justify-between items-center">
                        <span>IP Originador:</span>
                        <span className="font-semibold">{log.ip_address}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Pagination footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-surface-2 border-t border-border">
              <span className="text-xs font-bold text-text-muted text-center sm:text-left">
                Exibindo {(meta.current_page - 1) * meta.per_page + 1}–{Math.min(meta.current_page * meta.per_page, meta.total)} de {meta.total.toLocaleString('pt-BR')} resultados
              </span>

              {meta.last_page > 1 && (
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  {/* Anterior */}
                  {meta.current_page > 1 ? (
                    <Link
                      href={pageUrl(meta.current_page - 1)}
                      className="w-9 h-9 flex items-center justify-center border border-border rounded-lg bg-surface text-text-soft hover:bg-surface-hover transition-colors"
                    >
                      <Icon name="chevron_l" size={16} />
                    </Link>
                  ) : (
                    <span className="w-9 h-9 flex items-center justify-center border border-border rounded-lg opacity-30 text-text-muted bg-surface-hover">
                      <Icon name="chevron_l" size={16} />
                    </span>
                  )}

                  {/* Páginas */}
                  {Array.from({ length: Math.min(meta.last_page, 5) }, (_, idx) => {
                    const p = idx + 1
                    const isCurrent = p === meta.current_page
                    return (
                      <Link
                        key={p}
                        href={pageUrl(p)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface text-text-soft border border-border hover:bg-surface-hover'
                        }`}
                      >
                        {p}
                      </Link>
                    )
                  })}

                  {meta.last_page > 5 && (
                    <>
                      <span className="px-1 text-text-muted text-xs">…</span>
                      <Link
                        href={pageUrl(meta.last_page)}
                        className="w-10 h-9 flex items-center justify-center border border-border rounded-lg bg-surface text-xs font-bold text-text-soft hover:bg-surface-hover transition-colors"
                      >
                        {meta.last_page}
                      </Link>
                    </>
                  )}

                  {/* Próxima */}
                  {meta.current_page < meta.last_page ? (
                    <Link
                      href={pageUrl(meta.current_page + 1)}
                      className="w-9 h-9 flex items-center justify-center border border-border rounded-lg bg-surface text-text-soft hover:bg-surface-hover transition-colors"
                    >
                      <Icon name="chevron_r" size={16} />
                    </Link>
                  ) : (
                    <span className="w-9 h-9 flex items-center justify-center border border-border rounded-lg opacity-30 text-text-muted bg-surface-hover">
                      <Icon name="chevron_r" size={16} />
                    </span>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
