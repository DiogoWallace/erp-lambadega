import Link from 'next/link'
import { apiFetch } from '@/app/lib/api'
import { DashboardData } from '@/app/lib/types'
import { Icon } from '@/app/ui/icons'
import { PeriodSelector } from './period-selector'

interface Props {
  searchParams: Promise<{
    period?: string
    date_from?: string
    date_to?: string
  }>
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente', paid: 'Pago', canceled: 'Cancelado',
}
const STATUS_BADGE: Record<string, string> = {
  pending: 'badge-warning', paid: 'badge-success', canceled: 'badge-danger',
}

function formatCurrency(value: string | number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    typeof value === 'string' ? parseFloat(value) : value,
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

function MetricCard({
  label, value, sub, change, href, icon, kind,
}: {
  label: string
  value: string
  sub?: string
  change?: number | null
  href?: string
  icon: Parameters<typeof Icon>[0]['name']
  kind: 'success' | 'warning' | 'danger' | 'accent'
}) {
  const iconBg = `var(--${kind}-soft)`
  const iconColor = `var(--${kind})`
  const deltaColor = change == null ? 'var(--text-muted)' : change >= 0 ? 'var(--success)' : 'var(--danger)'
  const card = (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="mono" style={{ fontSize: 11.5, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          {label}
        </div>
        <div style={{
          width: 28, height: 28, borderRadius: 'var(--r-sm)',
          background: iconBg, color: iconColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={icon} size={14} />
        </div>
      </div>
      <div className="tnum" style={{ fontWeight: 600, fontSize: 28, lineHeight: 1.1, letterSpacing: '-0.025em', marginTop: 12, color: 'var(--text)' }}>
        {value}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginTop: 8,
        fontSize: 12, fontWeight: 500, color: deltaColor,
      }}>
        {change != null && <Icon name={change >= 0 ? 'trend_up' : 'trend_dn'} size={12} stroke={2} />}
        {sub}
      </div>
    </div>
  )
  return href ? <Link href={href}>{card}</Link> : card
}

export default async function DashboardPage({ searchParams }: Props) {
  const { period = 'month', date_from, date_to } = await searchParams

  const params = new URLSearchParams({ period })
  if (period === 'custom' && date_from) params.set('date_from', date_from)
  if (period === 'custom' && date_to)   params.set('date_to', date_to)

  const res = await apiFetch(`/dashboard?${params}`)
  const { data }: { data: DashboardData } = await res.json()

  const revenueDelta = data.revenue.change_percent
  const ordersDelta = data.orders.change_percent
  const previousLabel = data.revenue.previous !== null
    ? `vs ${formatCurrency(data.revenue.previous)} antes`
    : '—'

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Painel</h1>
          <p className="page-subtitle">
            {data.scope === 'self' ? 'Suas vendas' : 'Resumo da operação'} · {data.period.label}
          </p>
        </div>
        <PeriodSelector
          currentPeriod={period}
          currentDateFrom={date_from}
          currentDateTo={date_to}
        />
      </div>

      {/* KPI strip */}
      <div className="dash-kpis">
        <MetricCard
          label="Receita"
          value={formatCurrency(data.revenue.current)}
          sub={revenueDelta != null ? `${revenueDelta > 0 ? '+' : ''}${revenueDelta}% · ${previousLabel}` : previousLabel}
          change={revenueDelta}
          href="/sales?status=paid"
          icon="sales"
          kind="success"
        />
        <MetricCard
          label="Pedidos pagos"
          value={String(data.orders.paid)}
          sub={ordersDelta != null ? `${ordersDelta > 0 ? '+' : ''}${ordersDelta}% · ${data.orders.total} no período` : `${data.orders.total} no período`}
          change={ordersDelta}
          href="/sales?status=paid"
          icon="invoices"
          kind="accent"
        />
        <MetricCard
          label="Ticket médio"
          value={formatCurrency(data.avg_ticket.current)}
          sub="por pedido pago"
          icon="finance"
          kind="warning"
        />
        <MetricCard
          label="Estoque baixo"
          value={String(data.low_stock_count)}
          sub={data.low_stock_count > 0 ? 'produto(s) abaixo do mínimo' : 'tudo em ordem'}
          href="/products?low_stock=1"
          icon="package"
          kind={data.low_stock_count > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Status breakdown */}
      <div className="dash-stats">
        {[
          { key: 'pending',  label: 'Pendentes',  count: data.orders.pending,  kind: 'warning' as const },
          { key: 'paid',     label: 'Pagos',      count: data.orders.paid,     kind: 'success' as const },
          { key: 'canceled', label: 'Cancelados', count: data.orders.canceled, kind: 'danger'  as const },
        ].map((s) => (
          <Link
            key={s.key}
            href={`/sales?status=${s.key}`}
            className="card"
            style={{ padding: 16, textDecoration: 'none', display: 'block' }}
          >
            <div className="mono" style={{ fontSize: 11, letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {s.label}
            </div>
            <div className="tnum" style={{ fontWeight: 700, fontSize: 24, color: `var(--${s.kind})`, marginTop: 6 }}>
              {s.count}
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom grid */}
      <div className="dash-bottom">
        {/* Low stock */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Estoque crítico</h3>
              <div className="card-sub">
                Produtos abaixo do mínimo · <code style={{ background: 'var(--surface-2)', padding: '1px 6px', borderRadius: 4, fontSize: 11.5 }}>stock_quantity &lt; min_stock_quantity</code>
              </div>
            </div>
            <Link href="/products?low_stock=1" style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--accent)' }}>
              Ver produtos →
            </Link>
          </div>
          {data.low_stock.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nenhum produto crítico.</p>
            </div>
          ) : (
            <table className="t-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Produto</th>
                  <th className="t-num">Saldo</th>
                  <th className="t-num">Mínimo</th>
                </tr>
              </thead>
              <tbody>
                {data.low_stock.map((p) => {
                  const critical = p.stock_quantity === 0
                  return (
                    <tr key={p.id}>
                      <td style={{ width: 24 }}>
                        <span style={{ display: 'block', width: 8, height: 8, borderRadius: '50%', background: critical ? 'var(--danger)' : 'var(--warning)' }} />
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text)' }}>{p.name}</div>
                        {p.sku && <div className="mono" style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>{p.sku}</div>}
                      </td>
                      <td className="t-num">
                        <span className={`badge ${critical ? 'badge-danger' : 'badge-warning'}`}>
                          {p.stock_quantity} {p.unit}
                        </span>
                      </td>
                      <td className="t-num tnum" style={{ color: 'var(--text-muted)' }}>{p.min_stock_quantity} {p.unit}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent orders */}
        <div className="card">
          <div className="card-head">
            <div><h3>Últimas vendas</h3></div>
            <Link href="/sales" style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--accent)' }}>
              Ver todas →
            </Link>
          </div>
          {data.recent_orders.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nenhuma venda ainda.</p>
            </div>
          ) : (
            <div>
              {data.recent_orders.map((o, i) => (
                <Link
                  key={o.id}
                  href={`/sales/${o.id}`}
                  style={{
                    display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: 12, padding: '12px 18px',
                    borderTop: i === 0 ? '1px solid var(--border-soft)' : 'none',
                    borderBottom: i < data.recent_orders.length - 1 ? '1px solid var(--border-soft)' : 'none',
                    alignItems: 'center', textDecoration: 'none',
                  }}
                >
                  <span className="mono" style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent)', letterSpacing: '0.02em' }}>{o.order_number}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {o.customer?.name ?? 'Balcão'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{formatDate(o.created_at)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="tnum" style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text)' }}>
                      {formatCurrency(o.total_amount)}
                    </span>
                    <span className={`badge ${STATUS_BADGE[o.status]}`}>{STATUS_LABEL[o.status]}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
