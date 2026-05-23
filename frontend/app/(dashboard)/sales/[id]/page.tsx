import Link from 'next/link'
import { apiFetch } from '@/app/lib/api'
import { Order } from '@/app/lib/types'
import { Icon } from '@/app/ui/icons'
import { PayForm } from './pay-form'
import { CancelForm } from './cancel-form'

interface Props {
  params: Promise<{ id: string }>
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente', paid: 'Pago', canceled: 'Cancelado',
}
const STATUS_BADGE: Record<string, string> = {
  pending: 'badge-warning', paid: 'badge-success', canceled: 'badge-danger',
}

const PAYMENT_LABEL: Record<string, string> = {
  cash: 'Dinheiro', pix: 'PIX',
  credit_card: 'Crédito', debit_card: 'Débito',
  bank_transfer: 'Transferência', other: 'Outro',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function formatCurrency(value: string): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(value))
}

export default async function SaleDetailPage({ params }: Props) {
  const { id } = await params
  const res = await apiFetch(`/orders/${id}`)
  const { data: order }: { data: Order } = await res.json()

  return (
    <div className="page" style={{ maxWidth: 980 }}>
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
          <Link href="/sales" className="btn btn-ghost btn-sm"><Icon name="arrow_left" size={13} /> Voltar</Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 className="page-title mono">{order.order_number}</h1>
              <span className={`badge ${STATUS_BADGE[order.status]}`}>{STATUS_LABEL[order.status]}</span>
            </div>
            <p className="page-subtitle">{formatDate(order.created_at)}</p>
          </div>
        </div>
        {order.status === 'pending' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <PayForm orderId={order.id} />
            <CancelForm orderId={order.id} />
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 16 }}>
        <InfoCard label="Cliente" value={order.customer?.name ?? 'Balcão'} />
        <InfoCard label="Vendedor" value={order.user?.name ?? '—'} />
        {order.payment_method && (
          <InfoCard label="Pagamento" value={PAYMENT_LABEL[order.payment_method] ?? order.payment_method} />
        )}
        {order.paid_at && (
          <InfoCard label="Pago em" value={formatDate(order.paid_at)} />
        )}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-head"><div><h3>Itens</h3></div></div>
        <table className="t-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th className="t-num">Qtd</th>
              <th className="t-num">Unit.</th>
              <th className="t-num">Desconto</th>
              <th className="t-num">Total</th>
            </tr>
          </thead>
          <tbody>
            {(order.items ?? []).map((item) => (
              <tr key={item.id}>
                <td>
                  <span style={{ fontWeight: 500 }}>{item.product?.name ?? '—'}</span>
                  {item.product?.sku && (
                    <span className="mono" style={{ marginLeft: 8, fontSize: 11.5, color: 'var(--text-muted)' }}>{item.product.sku}</span>
                  )}
                </td>
                <td className="t-num tnum">{item.quantity}</td>
                <td className="t-num tnum">{formatCurrency(item.unit_price)}</td>
                <td className="t-num tnum" style={{ color: 'var(--text-muted)' }}>{formatCurrency(item.discount_amount)}</td>
                <td className="t-num tnum" style={{ fontWeight: 600 }}>{formatCurrency(item.total_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div className="card" style={{ padding: 18, minWidth: 280 }}>
          <Row label="Subtotal" value={formatCurrency(order.subtotal_amount)} />
          {parseFloat(order.discount_amount) > 0 && (
            <Row label="Desconto" value={`− ${formatCurrency(order.discount_amount)}`} kind="danger" />
          )}
          <div style={{ borderTop: '1px solid var(--border-soft)', marginTop: 8, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15 }}>
            <span>Total</span>
            <span className="tnum">{formatCurrency(order.total_amount)}</span>
          </div>
        </div>
      </div>

      {order.notes && (
        <div className="card" style={{ padding: 18, marginTop: 16 }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Observações</div>
          <div style={{ fontSize: 13, color: 'var(--text-soft)', whiteSpace: 'pre-wrap' }}>{order.notes}</div>
        </div>
      )}
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="mono" style={{ fontSize: 11, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{value}</div>
    </div>
  )
}

function Row({ label, value, kind }: { label: string; value: string; kind?: 'danger' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0', color: 'var(--text-muted)' }}>
      <span>{label}</span>
      <span className="tnum" style={{ color: kind ? `var(--${kind})` : 'var(--text)' }}>{value}</span>
    </div>
  )
}
