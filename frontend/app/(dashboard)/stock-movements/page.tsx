import Link from 'next/link'
import { apiFetch } from '@/app/lib/api'
import { PaginatedResponse, Product, StockMovement } from '@/app/lib/types'

interface Props {
  searchParams: Promise<{
    product_id?: string
    type?: string
    date_from?: string
    date_to?: string
    page?: string
  }>
}

const TYPE_LABEL: Record<string, string> = {
  in:         'Entrada',
  out:        'Saída',
  adjustment: 'Ajuste',
}

const TYPE_CLASS: Record<string, string> = {
  in:         'bg-green-100 text-green-700',
  out:        'bg-red-100 text-red-700',
  adjustment: 'bg-blue-100 text-blue-700',
}

function formatQty(movement: StockMovement): string {
  if (movement.type === 'in')         return `+${movement.quantity}`
  if (movement.type === 'out')        return `−${movement.quantity}`
  return `→ ${movement.quantity}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function StockMovementsPage({ searchParams }: Props) {
  const {
    product_id = '',
    type = '',
    date_from = '',
    date_to = '',
    page = '1',
  } = await searchParams

  const params = new URLSearchParams({ page })
  if (product_id) params.set('product_id', product_id)
  if (type)       params.set('type', type)
  if (date_from)  params.set('date_from', date_from)
  if (date_to)    params.set('date_to', date_to)

  const [movementsRes, productsRes] = await Promise.all([
    apiFetch(`/stock-movements?${params}`),
    apiFetch('/products?all=1'),
  ])

  const { data: movements, meta }: PaginatedResponse<StockMovement> = await movementsRes.json()
  const { data: products }: { data: Product[] } = await productsRes.json()

  const hasFilters = product_id || type || date_from || date_to

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Movimentações de estoque</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{meta.total} movimentação(ões) registrada(s)</p>
        </div>
        <Link
          href="/stock-movements/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          + Registrar
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3 mb-6">
        <select
          name="product_id"
          defaultValue={product_id}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          <option value="">Todos os produtos</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          name="type"
          defaultValue={type}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          <option value="">Todos os tipos</option>
          <option value="in">Entrada</option>
          <option value="out">Saída</option>
          <option value="adjustment">Ajuste</option>
        </select>

        <input
          type="date"
          name="date_from"
          defaultValue={date_from}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <input
          type="date"
          name="date_to"
          defaultValue={date_to}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />

        <button
          type="submit"
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          Filtrar
        </button>
        {hasFilters && (
          <a
            href="/stock-movements"
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-50 transition-colors"
          >
            Limpar
          </a>
        )}
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {movements.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-zinc-500">Nenhuma movimentação encontrada.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Data</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Produto</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Tipo</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide text-right">Qtd</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide text-right">Antes → Depois</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Usuário</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Descrição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                    {formatDate(m.created_at)}
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {m.product?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_CLASS[m.type]}`}>
                      {TYPE_LABEL[m.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-zinc-900">
                    {formatQty(m)}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-500 text-xs font-mono">
                    {m.stock_before} → {m.stock_after}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {m.user?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs max-w-xs truncate">
                    {m.description ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-zinc-500">
            Página {meta.current_page} de {meta.last_page}
          </p>
          <div className="flex gap-2">
            {meta.current_page > 1 && (
              <PaginationLink page={meta.current_page - 1} productId={product_id} type={type} dateFrom={date_from} dateTo={date_to} label="← Anterior" />
            )}
            {meta.current_page < meta.last_page && (
              <PaginationLink page={meta.current_page + 1} productId={product_id} type={type} dateFrom={date_from} dateTo={date_to} label="Próxima →" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function PaginationLink({ page, productId, type, dateFrom, dateTo, label }: {
  page: number; productId: string; type: string; dateFrom: string; dateTo: string; label: string
}) {
  const p = new URLSearchParams({ page: String(page) })
  if (productId) p.set('product_id', productId)
  if (type)      p.set('type', type)
  if (dateFrom)  p.set('date_from', dateFrom)
  if (dateTo)    p.set('date_to', dateTo)
  return (
    <Link href={`/stock-movements?${p}`} className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
      {label}
    </Link>
  )
}
