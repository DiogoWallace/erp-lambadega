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
  created: 'Criado', updated: 'Editado', deleted: 'Deletado', login: 'Login', logout: 'Logout',
}

const EVENT_BADGE: Record<string, string> = {
  created: 'badge-success', updated: 'badge-info', deleted: 'badge-danger',
  login: 'badge-accent', logout: 'badge',
}

const MODULE_LABEL: Record<string, string> = {
  customers: 'Clientes', suppliers: 'Fornecedores', categories: 'Categorias',
  products: 'Produtos', stock: 'Estoque', sales: 'Vendas', finance: 'Financeiro', auth: 'Autenticação',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function formatValues(values: Record<string, unknown> | null): string {
  if (!values) return '—'
  const keys = Object.keys(values)
  if (keys.length === 0) return '—'
  return keys.slice(0, 3).join(', ') + (keys.length > 3 ? ` +${keys.length - 3}` : '')
}

export default async function AuditLogsPage({ searchParams }: Props) {
  const { event = '', module = '', date_from = '', date_to = '', page = '1' } = await searchParams

  const params = new URLSearchParams({ page })
  if (event)     params.set('event', event)
  if (module)    params.set('module', module)
  if (date_from) params.set('date_from', date_from)
  if (date_to)   params.set('date_to', date_to)

  const res = await apiFetch(`/audit-logs?${params}`)
  const { data: logs, meta }: PaginatedResponse<AuditLog> = await res.json()

  function pageUrl(p: number) {
    const q = new URLSearchParams({ page: String(p) })
    if (event)     q.set('event', event)
    if (module)    q.set('module', module)
    if (date_from) q.set('date_from', date_from)
    if (date_to)   q.set('date_to', date_to)
    return `/audit-logs?${q}`
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Auditoria</h1>
          <p className="page-subtitle">{meta.total} registro(s) · log imutável de quem criou/editou/deletou</p>
        </div>
      </div>

      <form method="GET" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <select name="event" defaultValue={event} className="input input-sm" style={{ width: 180 }}>
          <option value="">Todos os eventos</option>
          {Object.entries(EVENT_LABEL).map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
        </select>
        <select name="module" defaultValue={module} className="input input-sm" style={{ width: 180 }}>
          <option value="">Todos os módulos</option>
          {Object.entries(MODULE_LABEL).map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
        </select>
        <input type="date" name="date_from" defaultValue={date_from} className="input input-sm" style={{ width: 150 }} />
        <input type="date" name="date_to" defaultValue={date_to} className="input input-sm" style={{ width: 150 }} />
        <button type="submit" className="btn btn-outline btn-sm"><Icon name="filter" size={12} /> Filtrar</button>
        {(event || module || date_from || date_to) && (
          <a href="/audit-logs" className="btn btn-ghost btn-sm"><Icon name="x" size={12} /> Limpar</a>
        )}
      </form>

      <div className="card">
        {logs.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nenhum registro encontrado.</p>
          </div>
        ) : (
          <table className="t-table">
            <thead>
              <tr>
                <th>Quando</th>
                <th>Usuário</th>
                <th>Evento</th>
                <th>Módulo</th>
                <th>Registro</th>
                <th>Campos alterados</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ whiteSpace: 'nowrap', color: 'var(--text-soft)', fontSize: 12 }}>{formatDate(log.created_at)}</td>
                  <td>{log.user?.name ?? <span style={{ color: 'var(--text-faint)' }}>—</span>}</td>
                  <td><span className={`badge ${EVENT_BADGE[log.event] ?? ''}`}>{EVENT_LABEL[log.event] ?? log.event}</span></td>
                  <td style={{ color: 'var(--text-soft)' }}>{MODULE_LABEL[log.module] ?? log.module}</td>
                  <td className="mono" style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    {log.model_type ?? <span style={{ color: 'var(--text-faint)' }}>—</span>}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {log.event === 'updated' ? (
                      <span>{formatValues(log.old_values)} → {formatValues(log.new_values)}</span>
                    ) : log.event === 'created' ? (
                      formatValues(log.new_values)
                    ) : (
                      <span style={{ color: 'var(--text-faint)' }}>—</span>
                    )}
                  </td>
                  <td className="mono" style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{log.ip_address ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
