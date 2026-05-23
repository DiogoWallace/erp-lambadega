import { apiFetch } from '@/app/lib/api'
import { TopProductsReport } from '@/app/lib/types'
import { formatBRL, formatDate, buildExportHref, defaultDateRange } from '../_lib'
import { DateRangeFilter } from '../_filters'

interface Props {
  searchParams: Promise<{ date_from?: string; date_to?: string; limit?: string }>
}

export default async function TopProductsReportPage({ searchParams }: Props) {
  const { from, to } = defaultDateRange()
  const { date_from = from, date_to = to, limit = '20' } = await searchParams

  const params = new URLSearchParams({ date_from, date_to, limit })
  const res = await apiFetch(`/reports/top-products?${params}`)
  const { data }: { data: TopProductsReport } = await res.json()

  const exportHref = buildExportHref('top-products', { date_from, date_to, limit })

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Top produtos</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          {formatDate(data.period.date_from)} — {formatDate(data.period.date_to)}
        </p>
      </div>

      <DateRangeFilter action="/reports/top-products" date_from={date_from} date_to={date_to} exportHref={exportHref}>
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">Limite</label>
          <select
            name="limit"
            defaultValue={limit}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="10">Top 10</option>
            <option value="20">Top 20</option>
            <option value="50">Top 50</option>
            <option value="100">Top 100</option>
          </select>
        </div>
      </DateRangeFilter>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Produtos vendidos</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">{data.totals.products}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Itens (unidades)</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">{data.totals.quantity_sold}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Receita total</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">{formatBRL(data.totals.revenue)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {data.items.length === 0 ? (
          <p className="px-5 py-10 text-sm text-zinc-400 text-center">Nenhuma venda paga no período.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">#</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Produto</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">SKU</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide text-right">Quantidade</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide text-right">Pedidos</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide text-right">Receita</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {data.items.map((it, idx) => (
                <tr key={it.product_id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 text-zinc-400">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-zinc-900">{it.product_name}</td>
                  <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{it.sku ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-zinc-700">{it.quantity}</td>
                  <td className="px-4 py-3 text-right text-zinc-500">{it.orders_count}</td>
                  <td className="px-4 py-3 text-right font-semibold text-zinc-900">{formatBRL(it.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
