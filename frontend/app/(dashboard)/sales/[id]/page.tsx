import Link from 'next/link'
import { apiFetch } from '@/app/lib/api'
import { Order } from '@/app/lib/types'
import { PayForm } from './pay-form'
import { CancelForm } from './cancel-form'

interface Props {
  params: Promise<{ id: string }>
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

const PAYMENT_LABEL: Record<string, string> = {
  cash:          'Dinheiro',
  pix:           'Pix',
  credit_card:   'Cartão de crédito',
  debit_card:    'Cartão de débito',
  bank_transfer: 'Transferência bancária',
  other:         'Outro',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatCurrency(value: string): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    parseFloat(value)
  )
}

export default async function SaleDetailPage({ params }: Props) {
  const { id } = await params

  const res = await apiFetch(`/orders/${id}`)
  const { data: order }: { data: Order } = await res.json()

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/sales"
          className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          ← Voltar
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-900 font-mono">{order.order_number}</h1>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASS[order.status]}`}>
              {STATUS_LABEL[order.status]}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-zinc-500">{formatDate(order.created_at)}</p>
        </div>

        {order.status === 'pending' && (
          <div className="flex gap-2">
            <PayForm orderId={order.id} />
            <CancelForm orderId={order.id} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-zinc-200 p-4 space-y-2 text-sm">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Cliente</p>
          <p className="text-zinc-900">{order.customer?.name ?? <span className="text-zinc-400">Consumidor final</span>}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 p-4 space-y-2 text-sm">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Vendedor</p>
          <p className="text-zinc-900">{order.user?.name ?? '—'}</p>
        </div>
        {order.payment_method && (
          <div className="bg-white rounded-xl border border-zinc-200 p-4 space-y-2 text-sm">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Pagamento</p>
            <p className="text-zinc-900">{PAYMENT_LABEL[order.payment_method] ?? order.payment_method}</p>
          </div>
        )}
        {order.paid_at && (
          <div className="bg-white rounded-xl border border-zinc-200 p-4 space-y-2 text-sm">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Pago em</p>
            <p className="text-zinc-900">{formatDate(order.paid_at)}</p>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Itens</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-left">
              <th className="px-4 py-2 text-xs font-medium text-zinc-500">Produto</th>
              <th className="px-4 py-2 text-xs font-medium text-zinc-500 text-right">Qtd</th>
              <th className="px-4 py-2 text-xs font-medium text-zinc-500 text-right">Unit.</th>
              <th className="px-4 py-2 text-xs font-medium text-zinc-500 text-right">Desconto</th>
              <th className="px-4 py-2 text-xs font-medium text-zinc-500 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {(order.items ?? []).map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {item.product?.name ?? '—'}
                  {item.product?.sku && (
                    <span className="ml-2 text-xs text-zinc-400">SKU: {item.product.sku}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-zinc-700">{item.quantity}</td>
                <td className="px-4 py-3 text-right text-zinc-700">{formatCurrency(item.unit_price)}</td>
                <td className="px-4 py-3 text-right text-zinc-500">{formatCurrency(item.discount_amount)}</td>
                <td className="px-4 py-3 text-right font-semibold text-zinc-900">{formatCurrency(item.total_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4 ml-auto max-w-xs space-y-2 text-sm">
        <div className="flex justify-between text-zinc-500">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotal_amount)}</span>
        </div>
        {parseFloat(order.discount_amount) > 0 && (
          <div className="flex justify-between text-zinc-500">
            <span>Desconto</span>
            <span className="text-red-600">− {formatCurrency(order.discount_amount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-zinc-900 text-base pt-2 border-t border-zinc-100">
          <span>Total</span>
          <span>{formatCurrency(order.total_amount)}</span>
        </div>
      </div>

      {order.notes && (
        <div className="mt-4 bg-white rounded-xl border border-zinc-200 p-4 text-sm text-zinc-700">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Observações</p>
          {order.notes}
        </div>
      )}
    </div>
  )
}
