import { apiFetch } from '@/app/lib/api'
import { AccountsReport, FinancialStatus } from '@/app/lib/types'
import { formatBRL, formatDate, buildExportHref } from '../_lib'
import { DateRangeFilter } from '../_filters'

interface Props {
  searchParams: Promise<{
    type?: string
    status?: string
    due_from?: string
    due_to?: string
  }>
}

const STATUS_LABEL: Record<FinancialStatus, string> = {
  pending: 'Pendente', paid: 'Paga', overdue: 'Vencida', canceled: 'Cancelada',
}
const STATUS_CLASS: Record<FinancialStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  canceled: 'bg-zinc-100 text-zinc-500',
}

export default async function AccountsReportPage({ searchParams }: Props) {
  const { type = '', status = '', due_from = '', due_to = '' } = await searchParams

  const params = new URLSearchParams()
  if (type) params.set('type', type)
  if (status) params.set('status', status)
  if (due_from) params.set('due_from', due_from)
  if (due_to) params.set('due_to', due_to)

  const res = await apiFetch(`/reports/accounts?${params}`)
  const { data }: { data: AccountsReport } = await res.json()

  const exportHref = buildExportHref('accounts', { type, status, due_from, due_to })

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Contas a pagar/receber</h1>
        <p className="mt-0.5 text-sm text-zinc-500">{data.totals.count} lançamento(s) — total {formatBRL(data.totals.amount)}</p>
      </div>

      <DateRangeFilter
        action="/reports/accounts"
        date_from={due_from}
        date_to={due_to}
        fromName="due_from"
        toName="due_to"
        exportHref={exportHref}
      >
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">Tipo</label>
          <select
            name="type"
            defaultValue={type}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="">Todos</option>
            <option value="income">Receita</option>
            <option value="expense">Despesa</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">Status</label>
          <select
            name="status"
            defaultValue={status}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="">Todos</option>
            <option value="pending">Pendente</option>
            <option value="paid">Paga</option>
            <option value="overdue">Vencida</option>
            <option value="canceled">Cancelada</option>
          </select>
        </div>
      </DateRangeFilter>

      {/* By status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['pending', 'paid', 'overdue', 'canceled'] as FinancialStatus[]).map((s) => {
          const agg = data.by_status[s] ?? { count: 0, total: 0 }
          return (
            <div key={s} className="bg-white rounded-xl border border-zinc-200 p-5">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">{STATUS_LABEL[s]}</p>
              <p className="mt-2 text-xl font-bold text-zinc-900">{formatBRL(agg.total)}</p>
              <p className="mt-0.5 text-xs text-zinc-400">{agg.count} lançamento(s)</p>
            </div>
          )
        })}
      </div>

      {/* Items table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {data.items.length === 0 ? (
          <p className="px-5 py-10 text-sm text-zinc-400 text-center">Nenhum lançamento encontrado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Vencimento</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Descrição</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Vínculo</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide text-right">Valor</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {data.items.map((it) => {
                const link = it.supplier ?? it.customer ?? (it.order_number ? `Venda ${it.order_number}` : '—')
                const isIncome = it.type === 'income'
                return (
                  <tr key={it.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3 text-zinc-600">{formatDate(it.due_date)}</td>
                    <td className="px-4 py-3 font-medium text-zinc-900">{it.description}</td>
                    <td className="px-4 py-3 text-zinc-500">{link}</td>
                    <td className={`px-4 py-3 text-right font-medium ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isIncome ? '+' : '−'} {formatBRL(it.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[it.status]}`}>
                        {STATUS_LABEL[it.status]}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
