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
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Fluxo de caixa</h1>
          <p className="page-subtitle">
            {formatDate(data.period.date_from)} — {formatDate(data.period.date_to)}
          </p>
        </div>
      </div>

      <DateRangeFilter action="/reports/cash-flow" date_from={date_from} date_to={date_to} exportHref={exportHref} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14, marginBottom: 20 }}>
        <div className="card" style={{ padding: 18 }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>Realizado</div>
          <Row label="Entradas" value={formatBRL(data.totals.income_realized)} kind="success" />
          <Row label="Saídas" value={formatBRL(data.totals.expense_realized)} kind="danger" />
          <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: 10, marginTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 14 }}>
            <span style={{ color: 'var(--text)' }}>Saldo</span>
            <span className="tnum" style={{ color: data.totals.net_realized >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {formatBRL(data.totals.net_realized)}
            </span>
          </div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>Pendentes</div>
          <Row label="A receber" value={formatBRL(data.totals.income_pending)} kind="success" />
          <Row label="A pagar" value={formatBRL(data.totals.expense_pending)} kind="danger" />
          <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: 10, marginTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 14 }}>
            <span style={{ color: 'var(--text)' }}>Projeção total</span>
            <span className="tnum" style={{ color: data.totals.net_projected >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {formatBRL(data.totals.net_projected)}
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div><h3>Detalhamento diário</h3></div></div>
        <table className="t-table">
          <thead>
            <tr>
              <th>Data</th>
              <th className="t-num">Entradas</th>
              <th className="t-num">Saídas</th>
              <th className="t-num">A receber</th>
              <th className="t-num">A pagar</th>
              <th className="t-num">Líquido</th>
              <th className="t-num">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {data.by_day.map((d) => (
              <tr key={d.date}>
                <td style={{ color: 'var(--text-soft)' }}>{formatDate(d.date)}</td>
                <td className="t-num tnum" style={{ color: d.income_realized > 0 ? 'var(--success)' : 'var(--text-faint)' }}>
                  {d.income_realized > 0 ? formatBRL(d.income_realized) : '—'}
                </td>
                <td className="t-num tnum" style={{ color: d.expense_realized > 0 ? 'var(--danger)' : 'var(--text-faint)' }}>
                  {d.expense_realized > 0 ? formatBRL(d.expense_realized) : '—'}
                </td>
                <td className="t-num tnum" style={{ color: 'var(--text-muted)' }}>{d.income_pending > 0 ? formatBRL(d.income_pending) : '—'}</td>
                <td className="t-num tnum" style={{ color: 'var(--text-muted)' }}>{d.expense_pending > 0 ? formatBRL(d.expense_pending) : '—'}</td>
                <td className="t-num tnum" style={{ fontWeight: 500, color: d.net >= 0 ? 'var(--success)' : 'var(--danger)' }}>{formatBRL(d.net)}</td>
                <td className="t-num tnum" style={{ fontWeight: 600, color: 'var(--text)' }}>{formatBRL(d.running_balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Row({ label, value, kind }: { label: string; value: string; kind?: 'success' | 'danger' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="tnum" style={{ color: kind ? `var(--${kind})` : 'var(--text)' }}>{value}</span>
    </div>
  )
}
