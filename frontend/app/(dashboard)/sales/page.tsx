import Link from 'next/link'
import { apiFetch } from '@/app/lib/api'
import { Customer, Order, PaginatedResponse } from '@/app/lib/types'

interface Props {
  searchParams: Promise<{
    status?: string
    customer_id?: string
    date_from?: string
    date_to?: string
    search?: string
    page?: string
  }>
}

const STATUS_LABEL: Record<string, string> = {
  pending:  'Pendente',
  paid:     'Pago',
  canceled: 'Cancelado',
}

const STATUS_CLASS: Record<string, string> = {
  pending:  'bg-yellow-100 text-yellow-700',
  paid:     'bg-green-100 text-green-700',
  canceled: 'bg-red-100 text-red-700',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatCurrency(value: string): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    parseFloat(value)
  )
}

export default async function SalesPage({ searchParams }: Props) {
  const {
    status = '',
    customer_id = '',
    date_from = '',
    date_to = '',
    search = '',
    page = '1',
  } = await searchParams

  const params = new URLSearchParams({ page })
  if (status)      params.set('status', status)
  if (customer_id) params.set('customer_id', customer_id)
  if (date_from)   params.set('date_from', date_from)
  if (date_to)     params.set('date_to', date_to)
  if (search)      params.set('search', search)

  const [ordersRes, customersRes] = await Promise.all([
    apiFetch(`/orders?${params}`),
    apiFetch('/customers?all=1'),
  ])

  const { data: orders, meta }: PaginatedResponse<Order> = await ordersRes.json()
  const { data: customers }: { data: Customer[] } = await customersRes.json()

  const hasFilters = status || customer_id || date_from || date_to || search

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Vendas</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{meta.total} venda(s) registrada(s)</p>
        </div>
        <Link
          href="/sales/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          + Nova venda
        </Link>
      </div>

      <form method="GET" className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Buscar por número..."
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 w-48"
        />

        <select
          name="status"
          defaultValue={status}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          <option value="">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="paid">Pago</option>
          <option value="canceled">Cancelado</option>
        </select>

        <select
          name="customer_id"
          defaultValue={customer_id}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          <option value="">Todos os clientes</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
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
            href="/sales"
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-50 transition-colors"
          >
            Limpar
          </a>
        )}
      </form>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {orders.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-zinc-500">Nenhuma venda encontrada.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Nº</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Data</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Cliente</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Itens</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide text-right">Total</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Vendedor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/sales/${order.id}`}
                      className="font-mono font-semibold text-zinc-900 hover:underline"
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {order.customer?.name ?? <span className="text-zinc-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {order.items_count ?? '—'} item(ns)
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-zinc-900">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[order.status]}`}>
                      {STATUS_LABEL[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {order.user?.name ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {meta.last_page > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-zinc-500">
            Página {meta.current_page} de {meta.last_page}
          </p>
          <div className="flex gap-2">
            {meta.current_page > 1 && (
              <PaginationLink page={meta.current_page - 1} {...{ status, customer_id, date_from, date_to, search }} label="← Anterior" />
            )}
            {meta.current_page < meta.last_page && (
              <PaginationLink page={meta.current_page + 1} {...{ status, customer_id, date_from, date_to, search }} label="Próxima →" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function PaginationLink({ page, status, customer_id, date_from, date_to, search, label }: {
  page: number; status: string; customer_id: string; date_from: string; date_to: string; search: string; label: string
}) {
  const p = new URLSearchParams({ page: String(page) })
  if (status)      p.set('status', status)
  if (customer_id) p.set('customer_id', customer_id)
  if (date_from)   p.set('date_from', date_from)
  if (date_to)     p.set('date_to', date_to)
  if (search)      p.set('search', search)
  return (
    <Link href={`/sales?${p}`} className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
      {label}
    </Link>
  )
}
