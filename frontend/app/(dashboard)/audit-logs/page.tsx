import Link from 'next/link'
import { apiFetch } from '@/app/lib/api'
import { AuditLog, PaginatedResponse } from '@/app/lib/types'

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
  created:    'Criado',
  updated:    'Editado',
  deleted:    'Deletado',
  login:      'Login',
  logout:     'Logout',
}

const EVENT_CLASS: Record<string, string> = {
  created:    'bg-green-100 text-green-700',
  updated:    'bg-blue-100 text-blue-700',
  deleted:    'bg-red-100 text-red-700',
  login:      'bg-purple-100 text-purple-700',
  logout:     'bg-zinc-100 text-zinc-600',
}

const MODULE_LABEL: Record<string, string> = {
  customers:  'Clientes',
  suppliers:  'Fornecedores',
  categories: 'Categorias',
  products:   'Produtos',
  stock:      'Estoque',
  auth:       'Autenticação',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatValues(values: Record<string, unknown> | null): string {
  if (!values) return '—'
  const keys = Object.keys(values)
  if (keys.length === 0) return '—'
  return keys.slice(0, 3).join(', ') + (keys.length > 3 ? ` +${keys.length - 3}` : '')
}

export default async function AuditLogsPage({ searchParams }: Props) {
  const {
    event     = '',
    module    = '',
    date_from = '',
    date_to   = '',
    page      = '1',
  } = await searchParams

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
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Audit Logs</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{meta.total} registros</p>
        </div>
      </div>

      {/* Filtros */}
      <form method="GET" className="flex flex-wrap gap-3 mb-6">
        <select
          name="event"
          defaultValue={event}
          className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          <option value="">Todos os eventos</option>
          {Object.entries(EVENT_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>

        <select
          name="module"
          defaultValue={module}
          className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          <option value="">Todos os módulos</option>
          {Object.entries(MODULE_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>

        <input
          type="date"
          name="date_from"
          defaultValue={date_from}
          className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />

        <input
          type="date"
          name="date_to"
          defaultValue={date_to}
          className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />

        <button
          type="submit"
          className="h-9 px-4 rounded-lg bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          Filtrar
        </button>

        {(event || module || date_from || date_to) && (
          <Link
            href="/audit-logs"
            className="h-9 px-4 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 flex items-center transition-colors"
          >
            Limpar
          </Link>
        )}
      </form>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
              <th className="px-4 py-3">Quando</th>
              <th className="px-4 py-3">Usuário</th>
              <th className="px-4 py-3">Evento</th>
              <th className="px-4 py-3">Módulo</th>
              <th className="px-4 py-3">Registro</th>
              <th className="px-4 py-3">Campos alterados</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-zinc-400 text-sm">
                  Nenhum registro encontrado.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 text-zinc-700 whitespace-nowrap">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {log.user?.name ?? <span className="text-zinc-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${EVENT_CLASS[log.event] ?? 'bg-zinc-100 text-zinc-600'}`}>
                      {EVENT_LABEL[log.event] ?? log.event}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {MODULE_LABEL[log.module] ?? log.module}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 font-mono text-xs">
                    {log.model_type ? (
                      <span title={log.model_id ?? ''}>
                        {log.model_type}
                      </span>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {log.event === 'updated' ? (
                      <span title={JSON.stringify(log.old_values)}>
                        {formatValues(log.old_values)} → {formatValues(log.new_values)}
                      </span>
                    ) : log.event === 'created' ? (
                      <span className="text-zinc-400">{formatValues(log.new_values)}</span>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 font-mono text-xs">
                    {log.ip_address ?? '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-zinc-500">
            Página {meta.current_page} de {meta.last_page}
          </p>
          <div className="flex gap-2">
            {meta.current_page > 1 && (
              <Link
                href={pageUrl(meta.current_page - 1)}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                Anterior
              </Link>
            )}
            {meta.current_page < meta.last_page && (
              <Link
                href={pageUrl(meta.current_page + 1)}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                Próxima
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
