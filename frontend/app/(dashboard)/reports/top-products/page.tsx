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
  const maxRevenue = Math.max(...data.items.map((it) => it.revenue), 1)

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Top produtos</h1>
          <p className="page-subtitle">
            {formatDate(data.period.date_from)} — {formatDate(data.period.date_to)}
          </p>
        </div>
      </div>

      <DateRangeFilter action="/reports/top-products" date_from={date_from} date_to={date_to} exportHref={exportHref}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label className="field-label">Limite</label>
          <select name="limit" defaultValue={limit} className="input input-sm" style={{ width: 120 }}>
            <option value="10">Top 10</option>
            <option value="20">Top 20</option>
            <option value="50">Top 50</option>
            <option value="100">Top 100</option>
          </select>
        </div>
      </DateRangeFilter>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginBottom: 20 }}>
        <SummaryCard label="Produtos vendidos" value={String(data.totals.products)} />
        <SummaryCard label="Itens (unidades)" value={String(data.totals.quantity_sold)} />
        <SummaryCard label="Receita total" value={formatBRL(data.totals.revenue)} />
      </div>

      <div className="card">
        {data.items.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nenhuma venda paga no período.</p>
          </div>
        ) : (
          <table className="t-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Produto</th>
                <th>SKU</th>
                <th className="t-num">Quantidade</th>
                <th className="t-num">Pedidos</th>
                <th>Receita</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((it, idx) => {
                const pct = (it.revenue / maxRevenue) * 100
                return (
                  <tr key={it.product_id}>
                    <td style={{ color: 'var(--text-faint)' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 500 }}>{it.product_name}</td>
                    <td className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{it.sku ?? '—'}</td>
                    <td className="t-num tnum" style={{ color: 'var(--text-soft)' }}>{it.quantity}</td>
                    <td className="t-num" style={{ color: 'var(--text-muted)' }}>{it.orders_count}</td>
                    <td style={{ minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="tnum" style={{ fontWeight: 600, minWidth: 90, textAlign: 'right' }}>{formatBRL(it.revenue)}</span>
                        <div style={{ flex: 1, height: 5, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)' }} />
                        </div>
                      </div>
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

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div className="mono" style={{ fontSize: 11, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
      <div className="tnum" style={{ fontWeight: 700, fontSize: 22, marginTop: 8, color: 'var(--text)', letterSpacing: '-0.02em' }}>{value}</div>
    </div>
  )
}
