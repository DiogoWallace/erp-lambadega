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
const STATUS_BADGE: Record<string, string> = {
  pending: 'badge-warning', paid: 'badge-success', canceled: 'badge-danger',
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
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Vendas por período</h1>
          <p className="page-subtitle">
            {formatDate(data.period.date_from)} — {formatDate(data.period.date_to)}
          </p>
        </div>
      </div>

      <DateRangeFilter action="/reports/sales" date_from={date_from} date_to={date_to} exportHref={exportHref}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label className="field-label">Status</label>
          <select name="status" defaultValue={status} className="input input-sm" style={{ width: 160 }}>
            <option value="">Todos</option>
            <option value="pending">Pendente</option>
            <option value="paid">Pago</option>
            <option value="canceled">Cancelado</option>
          </select>
        </div>
      </DateRangeFilter>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14, marginBottom: 20 }}>
        <SummaryCard label="Receita" value={formatBRL(data.totals.revenue)} />
        <SummaryCard label="Pedidos pagos" value={String(data.totals.paid)} />
        <SummaryCard label="Ticket médio" value={formatBRL(data.totals.avg_ticket)} />
        <SummaryCard label="Total" value={String(data.totals.orders)} />
      </div>

      {Object.keys(data.by_payment_method).length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-head">
            <div><h3>Receita por forma de pagamento</h3></div>
          </div>
          <table className="t-table">
            <tbody>
              {Object.entries(data.by_payment_method).map(([method, agg]) => (
                <tr key={method}>
                  <td style={{ textTransform: 'capitalize' }}>{method}</td>
                  <td className="t-num" style={{ color: 'var(--text-muted)' }}>{agg.count} pedido(s)</td>
                  <td className="t-num tnum" style={{ fontWeight: 600 }}>{formatBRL(agg.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <div className="card-head">
          <div><h3>Pedidos ({data.orders.length})</h3></div>
        </div>
        {data.orders.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nenhum pedido no período.</p>
          </div>
        ) : (
          <table className="t-table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Pagamento</th>
                <th className="t-num">Total</th>
                <th>Status</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((o) => (
                <tr key={o.id}>
                  <td className="mono" style={{ fontWeight: 500, color: 'var(--accent)' }}>{o.order_number}</td>
                  <td style={{ color: 'var(--text-soft)' }}>{o.customer ?? 'Balcão'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{o.payment_method ?? '—'}</td>
                  <td className="t-num tnum" style={{ fontWeight: 600 }}>{formatBRL(o.total)}</td>
                  <td><span className={`badge ${STATUS_BADGE[o.status]}`}>{STATUS_LABEL[o.status]}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{formatDate(o.created_at)}</td>
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
    <div className="card" style={{ padding: 18 }}>
      <div className="mono" style={{ fontSize: 11, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
      <div className="tnum" style={{ fontWeight: 700, fontSize: 22, marginTop: 8, color: 'var(--text)', letterSpacing: '-0.02em' }}>{value}</div>
    </div>
  )
}
