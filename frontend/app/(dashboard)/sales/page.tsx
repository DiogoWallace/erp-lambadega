import Link from 'next/link'
import { apiFetch } from '@/app/lib/api'
import { Customer, Order, PaginatedResponse } from '@/app/lib/types'
import { Icon } from '@/app/ui/icons'

interface Props {
  searchParams: Promise<{
    status?: string
    customer_id?: string
    date_from?: string
    date_to?: string
    search?: string
    page?: string
  }>
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente', paid: 'Pago', canceled: 'Cancelado',
}
const STATUS_BADGE: Record<string, string> = {
  pending: 'badge-warning', paid: 'badge-success', canceled: 'badge-danger',
}

const PAYMENT_LABEL: Record<string, string> = {
  pix: 'PIX',
  credit_card: 'Crédito',
  debit_card: 'Débito',
  cash: 'Dinheiro',
  bank_transfer: 'Transferência',
  other: 'Outro',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatCurrency(value: string | number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    typeof value === 'string' ? parseFloat(value) : value,
  )
}

export default async function SalesPage({ searchParams }: Props) {
  const {
    status = '', customer_id = '', date_from = '', date_to = '', search = '', page = '1',
  } = await searchParams

  const params = new URLSearchParams({ page })
  if (status) params.set('status', status)
  if (customer_id) params.set('customer_id', customer_id)
  if (date_from) params.set('date_from', date_from)
  if (date_to) params.set('date_to', date_to)
  if (search) params.set('search', search)

  const [ordersRes, customersRes, meRes] = await Promise.all([
    apiFetch(`/orders?${params}`),
    apiFetch('/customers?all=1'),
    apiFetch('/auth/me'),
  ])

  const { data: orders, meta }: PaginatedResponse<Order> = await ordersRes.json()
  const { data: customers }: { data: Customer[] } = await customersRes.json()
  const { data: me } = await meRes.json()
  const perms: string[] = me?.permissions ?? []
  const canCreate = perms.includes('sales.create')

  const hasFilters = status || customer_id || date_from || date_to || search

  const totals = orders.reduce(
    (acc, o) => {
      const total = parseFloat(o.total_amount)
      acc.gross += total + parseFloat(o.discount_amount)
      acc.discount += parseFloat(o.discount_amount)
      acc.net += total
      return acc
    },
    { gross: 0, discount: 0, net: 0 },
  )

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Vendas</h1>
          <p className="page-subtitle">{meta.total} venda(s) registrada(s)</p>
        </div>
        {canCreate && (
          <Link href="/sales/new" className="btn btn-primary btn-sm">
            <Icon name="plus" size={13} stroke={2} />
            Nova venda
          </Link>
        )}
      </div>

      <form method="GET" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Buscar por número (ORD-...)"
          className="input input-sm"
          style={{ width: 220 }}
        />
        <select name="status" defaultValue={status} className="input input-sm" style={{ width: 160 }}>
          <option value="">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="paid">Pago</option>
          <option value="canceled">Cancelado</option>
        </select>
        <select name="customer_id" defaultValue={customer_id} className="input input-sm" style={{ width: 220 }}>
          <option value="">Todos os clientes</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input type="date" name="date_from" defaultValue={date_from} className="input input-sm" style={{ width: 150 }} />
        <input type="date" name="date_to" defaultValue={date_to} className="input input-sm" style={{ width: 150 }} />
        <button type="submit" className="btn btn-outline btn-sm">
          <Icon name="filter" size={12} /> Filtrar
        </button>
        {hasFilters && (
          <a href="/sales" className="btn btn-ghost btn-sm"><Icon name="x" size={12} /> Limpar</a>
        )}
      </form>

      <div className="card">
        {orders.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nenhuma venda encontrada.</p>
          </div>
        ) : (
          <>
            <div className="t-table-wrap">
              <table className="t-table">
                <thead>
                  <tr>
                    <th>Nº</th>
                    <th>Data</th>
                    <th>Cliente</th>
                    <th>Pagamento</th>
                    <th>Vendedor</th>
                    <th className="t-num">Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <Link href={`/sales/${order.id}`} className="mono" style={{ fontWeight: 500, color: 'var(--accent)' }}>
                          {order.order_number}
                        </Link>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {formatDate(order.created_at)}
                      </td>
                      <td>
                        {order.customer?.name ?? (
                          <span style={{ color: 'var(--text-faint)' }}>Balcão</span>
                        )}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {order.payment_method ? PAYMENT_LABEL[order.payment_method] ?? order.payment_method : '—'}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.user?.name ?? '—'}</td>
                      <td className="t-num tnum" style={{ fontWeight: 600 }}>{formatCurrency(order.total_amount)}</td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[order.status]}`}>{STATUS_LABEL[order.status]}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sales-totals" style={{ display: 'flex', justifyContent: 'flex-end', gap: 32, padding: '14px 18px', borderTop: '1px solid var(--border-soft)', background: 'var(--surface-2)' }}>
              <Total label="Bruto" value={formatCurrency(totals.gross)} muted />
              <Total label="Descontos" value={formatCurrency(totals.discount)} muted />
              <Total label="Líquido" value={formatCurrency(totals.net)} />
            </div>
          </>
        )}
      </div>

      {meta.last_page > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Página {meta.current_page} de {meta.last_page}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {meta.current_page > 1 && (
              <PaginationLink page={meta.current_page - 1} {...{ status, customer_id, date_from, date_to, search }} label="← Anterior" />
            )}
            {meta.current_page < meta.last_page && (
              <PaginationLink page={meta.current_page + 1} {...{ status, customer_id, date_from, date_to, search }} label="Próxima →" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Total({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
      <div className="tnum" style={{ fontWeight: 600, fontSize: 14, marginTop: 4, color: muted ? 'var(--text-soft)' : 'var(--text)' }}>{value}</div>
    </div>
  )
}

function PaginationLink({ page, status, customer_id, date_from, date_to, search, label }: {
  page: number; status: string; customer_id: string; date_from: string; date_to: string; search: string; label: string
}) {
  const p = new URLSearchParams({ page: String(page) })
  if (status) p.set('status', status)
  if (customer_id) p.set('customer_id', customer_id)
  if (date_from) p.set('date_from', date_from)
  if (date_to) p.set('date_to', date_to)
  if (search) p.set('search', search)
  return (
    <Link href={`/sales?${p}`} className="btn btn-outline btn-sm">{label}</Link>
  )
}
