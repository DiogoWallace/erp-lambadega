import { apiFetch } from '@/app/lib/api'
import { SalesReport } from '@/app/lib/types'
import { formatBRL, formatDate, buildExportHref, defaultDateRange } from '../_lib'
import { DateRangeFilter } from '../_filters'

interface Props {
  searchParams: Promise<{
    date_from?: string
    date_to?: string
    status?: string
    payment_method?: string
  }>
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente', paid: 'Pago', canceled: 'Cancelado',
}
const STATUS_CLASS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  canceled: 'bg-red-100 text-red-700',
}

export default async function SalesReportPage({ searchParams }: Props) {
  const { from, to } = defaultDateRange()
  const { date_from = from, date_to = to, status = '', payment_method = '' } = await searchParams

  const params = new URLSearchParams({ date_from, date_to })
  if (status) params.set('status', status)
  if (payment_method) params.set('payment_method', payment_method)

  const res = await apiFetch(`/reports/sales?${params}`)
  const { data }: { data: SalesReport } = await res.json()

  const exportHref = buildExportHref('sales', { date_from, date_to, status, payment_method })

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Vendas por período</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          {formatDate(data.period.date_from)} — {formatDate(data.period.date_to)}
        </p>
      </div>

      <DateRangeFilter action="/reports/sales" date_from={date_from} date_to={date_to} exportHref={exportHref}>
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">Status</label>
          <select
            name="status"
            defaultValue={status}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="">Todos</option>
            <option value="pending">Pendente</option>
            <option value="paid">Pago</option>
            <option value="canceled">Cancelado</option>
          </select>
        </div>
      </DateRangeFilter>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Receita" value={formatBRL(data.totals.revenue)} />
        <SummaryCard label="Pedidos pagos" value={String(data.totals.paid)} />
        <SummaryCard label="Ticket médio" value={formatBRL(data.totals.avg_ticket)} />
        <SummaryCard label="Total de pedidos" value={String(data.totals.orders)} />
      </div>

      {/* Breakdown by payment method */}
      {Object.keys(data.by_payment_method).length > 0 && (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-100">
            <p className="text-sm font-semibold text-zinc-700">Receita por forma de pagamento</p>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-zinc-50">
              {Object.entries(data.by_payment_method).map(([method, agg]) => (
                <tr key={method}>
                  <td className="px-5 py-3 text-zinc-700">{method}</td>
                  <td className="px-5 py-3 text-zinc-500 text-right">{agg.count} pedido(s)</td>
                  <td className="px-5 py-3 text-right font-semibold text-zinc-900">{formatBRL(agg.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Orders table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-100">
          <p className="text-sm font-semibold text-zinc-700">Pedidos ({data.orders.length})</p>
        </div>
        {data.orders.length === 0 ? (
          <p className="px-5 py-10 text-sm text-zinc-400 text-center">Nenhum pedido no período.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Pedido</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Cliente</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Pagamento</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide text-right">Total</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {data.orders.map((o) => (
                <tr key={o.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-zinc-900">{o.order_number}</td>
                  <td className="px-4 py-3 text-zinc-600">{o.customer ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-500">{o.payment_method ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-zinc-900">{formatBRL(o.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[o.status]}`}>
                      {STATUS_LABEL[o.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{formatDate(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-2xl font-bold text-zinc-900">{value}</p>
    </div>
  )
}
