import { apiFetch } from '@/app/lib/api'
import { CashFlowReport } from '@/app/lib/types'
import { formatBRL, formatDate, buildExportHref, defaultDateRange } from '../_lib'
import { DateRangeFilter } from '../_filters'

interface Props {
  searchParams: Promise<{ date_from?: string; date_to?: string }>
}

export default async function CashFlowReportPage({ searchParams }: Props) {
  const { from, to } = defaultDateRange()
  const { date_from = from, date_to = to } = await searchParams

  const params = new URLSearchParams({ date_from, date_to })
  const res = await apiFetch(`/reports/cash-flow?${params}`)
  const { data }: { data: CashFlowReport } = await res.json()

  const exportHref = buildExportHref('cash-flow', { date_from, date_to })

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Fluxo de caixa</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          {formatDate(data.period.date_from)} — {formatDate(data.period.date_to)}
        </p>
      </div>

      <DateRangeFilter action="/reports/cash-flow" date_from={date_from} date_to={date_to} exportHref={exportHref} />

      {/* Realized vs projected */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Realizado</p>
          <div className="space-y-2 text-sm">
            <Row label="Entradas" value={formatBRL(data.totals.income_realized)} positive />
            <Row label="Saídas" value={formatBRL(data.totals.expense_realized)} negative />
            <div className="border-t border-zinc-100 pt-2 mt-2 flex justify-between font-semibold">
              <span className="text-zinc-700">Saldo</span>
              <span className={data.totals.net_realized >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                {formatBRL(data.totals.net_realized)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Pendentes</p>
          <div className="space-y-2 text-sm">
            <Row label="A receber" value={formatBRL(data.totals.income_pending)} positive />
            <Row label="A pagar" value={formatBRL(data.totals.expense_pending)} negative />
            <div className="border-t border-zinc-100 pt-2 mt-2 flex justify-between font-semibold">
              <span className="text-zinc-700">Projeção total</span>
              <span className={data.totals.net_projected >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                {formatBRL(data.totals.net_projected)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily breakdown */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-100">
          <p className="text-sm font-semibold text-zinc-700">Detalhamento diário</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50 text-left">
              <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Data</th>
              <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide text-right">Entradas</th>
              <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide text-right">Saídas</th>
              <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide text-right">A receber</th>
              <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide text-right">A pagar</th>
              <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide text-right">Líquido</th>
              <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide text-right">Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {data.by_day.map((d) => (
              <tr key={d.date} className="hover:bg-zinc-50 transition-colors">
                <td className="px-4 py-3 text-zinc-600">{formatDate(d.date)}</td>
                <td className="px-4 py-3 text-right text-emerald-700">{d.income_realized > 0 ? formatBRL(d.income_realized) : '—'}</td>
                <td className="px-4 py-3 text-right text-rose-700">{d.expense_realized > 0 ? formatBRL(d.expense_realized) : '—'}</td>
                <td className="px-4 py-3 text-right text-zinc-500">{d.income_pending > 0 ? formatBRL(d.income_pending) : '—'}</td>
                <td className="px-4 py-3 text-right text-zinc-500">{d.expense_pending > 0 ? formatBRL(d.expense_pending) : '—'}</td>
                <td className={`px-4 py-3 text-right font-medium ${d.net >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{formatBRL(d.net)}</td>
                <td className="px-4 py-3 text-right font-semibold text-zinc-900">{formatBRL(d.running_balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Row({ label, value, positive, negative }: { label: string; value: string; positive?: boolean; negative?: boolean }) {
  const color = positive ? 'text-emerald-700' : negative ? 'text-rose-700' : 'text-zinc-900'
  return (
    <div className="flex justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className={color}>{value}</span>
    </div>
  )
}
