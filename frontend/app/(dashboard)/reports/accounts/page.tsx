import { apiFetch } from '@/app/lib/api'
import { AccountsReport, FinancialStatus } from '@/app/lib/types'
import { formatBRL, formatDate, buildExportHref } from '../_lib'
import { DateRangeFilter } from '../_filters'

interface Props {
  searchParams: Promise<{ type?: string; status?: string; due_from?: string; due_to?: string }>
}

const STATUS_LABEL: Record<FinancialStatus, string> = {
  pending: 'Pendente', paid: 'Paga', overdue: 'Vencida', canceled: 'Cancelada',
}
const STATUS_BADGE: Record<FinancialStatus, string> = {
  pending: 'badge-warning', paid: 'badge-success', overdue: 'badge-danger', canceled: 'badge',
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
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Contas a pagar/receber</h1>
          <p className="page-subtitle">{data.totals.count} lançamento(s) — total {formatBRL(data.totals.amount)}</p>
        </div>
      </div>

      <DateRangeFilter
        action="/reports/accounts"
        date_from={due_from}
        date_to={due_to}
        fromName="due_from"
        toName="due_to"
        exportHref={exportHref}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label className="field-label">Tipo</label>
          <select name="type" defaultValue={type} className="input input-sm" style={{ width: 160 }}>
            <option value="">Todos</option>
            <option value="income">Receita</option>
            <option value="expense">Despesa</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label className="field-label">Status</label>
          <select name="status" defaultValue={status} className="input input-sm" style={{ width: 160 }}>
            <option value="">Todos</option>
            <option value="pending">Pendente</option>
            <option value="paid">Paga</option>
            <option value="overdue">Vencida</option>
            <option value="canceled">Cancelada</option>
          </select>
        </div>
      </DateRangeFilter>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14, marginBottom: 20 }}>
        {(['pending', 'paid', 'overdue', 'canceled'] as FinancialStatus[]).map((s) => {
          const agg = data.by_status[s] ?? { count: 0, total: 0 }
          const kind = s === 'pending' ? 'warning' : s === 'paid' ? 'success' : s === 'overdue' ? 'danger' : ''
          return (
            <div key={s} className="card" style={{ padding: 18 }}>
              <div className="mono" style={{ fontSize: 11, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {STATUS_LABEL[s]}
              </div>
              <div className="tnum" style={{ fontWeight: 700, fontSize: 20, marginTop: 8, color: kind ? `var(--${kind})` : 'var(--text-soft)', letterSpacing: '-0.02em' }}>
                {formatBRL(agg.total)}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 4 }}>{agg.count} lançamento(s)</div>
            </div>
          )
        })}
      </div>

      <div className="card">
        {data.items.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nenhum lançamento encontrado.</p>
          </div>
        ) : (
          <table className="t-table">
            <thead>
              <tr>
                <th>Vencimento</th>
                <th>Descrição</th>
                <th>Vínculo</th>
                <th className="t-num">Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((it) => {
                const link = it.supplier ?? it.customer ?? (it.order_number ? `Venda ${it.order_number}` : '—')
                const isIncome = it.type === 'income'
                return (
                  <tr key={it.id}>
                    <td style={{ color: 'var(--text-soft)' }}>{formatDate(it.due_date)}</td>
                    <td style={{ fontWeight: 500 }}>{it.description}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{link}</td>
                    <td className="t-num tnum" style={{ fontWeight: 500, color: isIncome ? 'var(--success)' : 'var(--danger)' }}>
                      {isIncome ? '+' : '−'} {formatBRL(it.amount)}
                    </td>
                    <td><span className={`badge ${STATUS_BADGE[it.status]}`}>{STATUS_LABEL[it.status]}</span></td>
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
