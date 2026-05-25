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
  
  const isCritical = kind === 'danger' && value !== '0'
  const valueColor = isCritical ? 'var(--danger)' : 'var(--text)'

  const card = (
    <div
      className={`card hover:shadow-md transition-all ${
        isCritical ? 'border-[var(--danger)]/25 ring-1 ring-[var(--danger)]/5' : ''
      }`}
      style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <span
          className="font-mono text-label-sm font-bold text-text-muted uppercase tracking-wider"
          style={{ fontSize: 11.5, letterSpacing: '0.05em' }}
        >
          {label}
        </span>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--r-md)',
            background: iconBg,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={icon} size={18} />
        </div>
      </div>
      <div>
        <h3
          className="font-hanken text-headline-md leading-none font-bold"
          style={{ color: valueColor, margin: 0, fontSize: 24, letterSpacing: '-0.02em' }}
        >
          {value}
        </h3>
        <div style={{ marginTop: 8 }}>
          {isCritical ? (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-sm text-white font-mono text-[9px] font-bold tracking-tighter"
              style={{ background: 'var(--danger)', lineHeight: 1.3 }}
            >
              AÇÃO NECESSÁRIA
            </span>
          ) : (
            <div
              className="font-mono text-label-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: deltaColor,
                fontWeight: 600,
              }}
            >
              {change != null && <Icon name={change >= 0 ? 'trend_up' : 'trend_dn'} size={12} stroke={2} />}
              <span>{sub}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
  return href ? (
    <Link href={href} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      {card}
    </Link>
  ) : (
    card
  )
}

export default async function DashboardPage({ searchParams }: Props) {
  const { period = 'month', date_from, date_to } = await searchParams

  const params = new URLSearchParams({ period })
  if (period === 'custom' && date_from) params.set('date_from', date_from)
  if (period === 'custom' && date_to) params.set('date_to', date_to)

  const res = await apiFetch(`/dashboard?${params}`)
  const { data }: { data: DashboardData } = await res.json()

  const revenueDelta = data.revenue.change_percent
  const ordersDelta = data.orders.change_percent
  const previousLabel = data.revenue.previous !== null
    ? `vs ${formatCurrency(data.revenue.previous)} antes`
    : '—'

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-head" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Painel</h1>
          <nav className="breadcrumbs" style={{ marginTop: 6 }}>
            <Link href="/dashboard">Home</Link>
            <span className="sep">/</span>
            <span className="current">Dashboard Geral</span>
          </nav>
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

      {/* Bottom grid */}
      <div className="dash-bottom">
        {/* Recent orders */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="card-head" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Pedidos Recentes</h3>
            <Link href="/sales" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}>
              VER TUDO <Icon name="arrow_right" size={14} />
            </Link>
          </div>
          {data.recent_orders.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', flexGrow: 1 }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nenhuma venda ainda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto" style={{ flexGrow: 1 }}>
              <table className="t-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>Nº</th>
                    <th style={{ padding: '12px 16px' }}>Cliente</th>
                    <th style={{ padding: '12px 16px' }}>Vendedor</th>
                    <th style={{ padding: '12px 16px' }} className="t-num">Valor</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_orders.map((o) => (
                    <tr key={o.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td style={{ padding: '14px 16px' }} className="mono">
                        <Link href={`/sales/${o.id}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                          {o.order_number}
                        </Link>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text)' }}>
                        {o.customer?.name ?? 'Balcão'}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-soft)' }}>
                        {o.user?.name ?? '—'}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }} className="t-num mono">
                        {formatCurrency(o.total_amount)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`badge ${STATUS_BADGE[o.status]}`}>
                          {STATUS_LABEL[o.status]}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                        {formatDate(o.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="card-head" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center' }}>
                <Icon name="package" size={18} />
              </span>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Estoque Crítico</h3>
            </div>
            {data.low_stock_count > 0 && (
              <span className="badge badge-danger font-bold">
                {data.low_stock_count}
              </span>
            )}
          </div>
          <div style={{ flexGrow: 1, padding: 8 }}>
            {data.low_stock.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nenhum produto crítico.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {data.low_stock.slice(0, 5).map((p) => {
                  const isZero = p.stock_quantity === 0
                  const color = isZero ? 'var(--danger)' : 'var(--warning)'
                  return (
                    <div
                      key={p.id}
                      className="hover:bg-[var(--surface-hover)] rounded-lg flex items-center gap-4 transition-colors"
                      style={{ padding: '10px 12px' }}
                    >
                      <div
                        style={{
                          width: 40, height: 40, borderRadius: 'var(--r-md)',
                          background: 'var(--surface-2)', border: '1px solid var(--border-soft)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--text-soft)', flexShrink: 0,
                        }}
                      >
                        <Icon name="package" size={18} />
                      </div>
                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.name}
                        </div>
                        {p.sku && (
                          <div className="mono" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                            SKU: {p.sku}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13.5, color: color }}>
                          {p.stock_quantity} {p.unit}
                        </div>
                        <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 2 }}>
                          Mín: {p.min_stock_quantity}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <div style={{ padding: 16, background: 'var(--surface-2)', borderTop: '1px solid var(--border)' }}>
            <Link
              href="/products?low_stock=1"
              className="btn btn-outline"
              style={{ width: '100%', justifyContent: 'center', fontWeight: 600, fontSize: 12.5 }}
            >
              GERAR ORDEM DE COMPRA <Icon name="suppliers" size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Performance Banner */}
      <div
        className="card"
        style={{
          padding: 32, overflow: 'hidden', height: 160,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          textAlign: 'center', position: 'relative'
        }}
      >
        <div
          style={{
            position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none',
          }}
        >
          <img
            alt="Analytical Background"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgdaQdW0LWnnH1M5_H23D0WNudNoNOSbTRvfbjgTkOnPxwqAkaUD-WE54mxl4PQuuLx3jH0rgYkk9uZjQ_L7lwHxsXzcEJtwgZ1b8q4U40ZRQvF7gBzerxfA2ujaKiSd1O_dYPU9mPlxKQXXDkcqQEmj31u5b9fxdJx9TgfJarDv5hUnAo_6K-GgUj7Dah_dlDaoIvmQ38RwTx20dNKces7lYTmszxwg5agT3q2lln8DG6raB1ETqe6KPFg79CkB2flhzZw5ZX8-fb"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ position: 'relative', zIndex: 10 }}>
          <h4 style={{ margin: 0, color: 'var(--accent)', fontWeight: 600, fontSize: 18, marginBottom: 8 }}>
            Visão de Performance Semanal
          </h4>
          <p style={{ margin: 0, maxWidth: 512, marginLeft: 'auto', marginRight: 'auto', fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            O sistema está processando as métricas de conversão em tempo real. Suas vendas aumentaram{' '}
            <span style={{ color: 'var(--success)', fontWeight: 700 }}>12%</span> em comparação ao mesmo período da semana passada.
          </p>
        </div>
      </div>
    </div>
  )
}

