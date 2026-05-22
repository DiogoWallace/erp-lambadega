import Link from 'next/link'
import { apiFetch } from '@/app/lib/api'
import { DashboardData } from '@/app/lib/types'
import { PeriodSelector } from './period-selector'

interface Props {
  searchParams: Promise<{
    period?: string
    date_from?: string
    date_to?: string
  }>
}

const STATUS_LABEL: Record<string, string> = {
  pending:  'Pendente',
  paid:     'Pago',
  canceled: 'Cancelado',
}

const STATUS_CLASS: Record<string, string> = {
  pending:  'bg-yellow-100 text-yellow-700',
  paid:     'bg-green-100 text-green-700',
  canceled: 'bg-red-100 text-red-700',
}

function formatCurrency(value: string | number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    typeof value === 'string' ? parseFloat(value) : value
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

function ChangeIndicator({ value }: { value: number | null }) {
  if (value === null) return null
  const positive = value >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}>
      {positive ? '↑' : '↓'} {Math.abs(value)}%
    </span>
  )
}

function MetricCard({
  title, value, sub, change, href, icon,
}: {
  title: string
  value: string
  sub?: string
  change?: number | null
  href?: string
  icon: React.ReactNode
}) {
  const content = (
    <div className="bg-white rounded-xl border border-zinc-200 p-5 flex flex-col gap-3 hover:border-zinc-300 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">{title}</span>
        <span className="text-zinc-300">{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-900">{value}</p>
        {(sub || change !== undefined) && (
          <div className="flex items-center gap-2 mt-1">
            {sub && <p className="text-xs text-zinc-400">{sub}</p>}
            {change !== undefined && <ChangeIndicator value={change} />}
          </div>
        )}
      </div>
    </div>
  )
  return href ? <Link href={href}>{content}</Link> : <>{content}</>
}

export default async function DashboardPage({ searchParams }: Props) {
  const { period = 'month', date_from, date_to } = await searchParams

  const params = new URLSearchParams({ period })
  if (period === 'custom' && date_from) params.set('date_from', date_from)
  if (period === 'custom' && date_to)   params.set('date_to', date_to)

  const res = await apiFetch(`/dashboard?${params}`)
  const { data }: { data: DashboardData } = await res.json()

  const vsLabel = data.revenue.previous !== null
    ? `vs ${formatCurrency(data.revenue.previous)} período anterior`
    : undefined

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{data.period.label}</p>
        </div>
        <PeriodSelector
          currentPeriod={period}
          currentDateFrom={date_from}
          currentDateTo={date_to}
        />
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Receita"
          value={formatCurrency(data.revenue.current)}
          sub={vsLabel}
          change={data.revenue.change_percent}
          href="/sales?status=paid"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <MetricCard
          title="Pedidos pagos"
          value={String(data.orders.paid)}
          sub={`${data.orders.total} total no período`}
          change={data.orders.change_percent}
          href="/sales?status=paid"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <MetricCard
          title="Ticket médio"
          value={formatCurrency(data.avg_ticket.current)}
          sub="por pedido pago"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          }
        />

        <MetricCard
          title="Estoque crítico"
          value={String(data.low_stock_count)}
          sub={data.low_stock_count > 0 ? 'produto(s) abaixo do mínimo' : 'tudo em ordem'}
          href="/products?low_stock=1"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          }
        />
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: 'pending',  label: 'Pendentes', count: data.orders.pending,  color: 'bg-yellow-50 border-yellow-100' },
          { key: 'paid',     label: 'Pagos',     count: data.orders.paid,     color: 'bg-green-50 border-green-100' },
          { key: 'canceled', label: 'Cancelados',count: data.orders.canceled, color: 'bg-red-50 border-red-100' },
        ].map((s) => (
          <Link
            key={s.key}
            href={`/sales?status=${s.key}`}
            className={`rounded-xl border p-4 ${s.color} hover:opacity-80 transition-opacity`}
          >
            <p className="text-2xl font-bold text-zinc-900">{s.count}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100">
            <p className="text-sm font-semibold text-zinc-700">Últimas vendas</p>
            <Link href="/sales" className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors">
              Ver todas →
            </Link>
          </div>
          {data.recent_orders.length === 0 ? (
            <p className="px-5 py-10 text-sm text-zinc-400 text-center">Nenhuma venda ainda.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-zinc-50">
                {data.recent_orders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/sales/${order.id}`} className="font-mono font-semibold text-zinc-900 hover:underline">
                        {order.order_number}
                      </Link>
                      <p className="text-xs text-zinc-400">{order.customer?.name ?? 'Consumidor final'}</p>
                    </td>
                    <td className="px-5 py-3 text-xs text-zinc-400 whitespace-nowrap">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-zinc-900">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[order.status]}`}>
                        {STATUS_LABEL[order.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Low stock */}
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100">
            <p className="text-sm font-semibold text-zinc-700">Estoque crítico</p>
            <Link href="/products?low_stock=1" className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors">
              Ver todos →
            </Link>
          </div>
          {data.low_stock.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-2xl mb-1">✓</p>
              <p className="text-sm text-zinc-400">Nenhum produto crítico.</p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-50">
              {data.low_stock.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-5 py-3 hover:bg-zinc-50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">{p.name}</p>
                    <p className="text-xs text-zinc-400">
                      {p.sku ? `SKU: ${p.sku} · ` : ''}
                      mín: {p.min_stock_quantity} {p.unit}
                    </p>
                  </div>
                  <span className={`ml-3 shrink-0 text-sm font-bold ${p.stock_quantity === 0 ? 'text-red-600' : 'text-orange-500'}`}>
                    {p.stock_quantity}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
