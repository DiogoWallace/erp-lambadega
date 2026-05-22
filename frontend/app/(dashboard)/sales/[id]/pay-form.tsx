'use client'

import { useActionState, useState } from 'react'
import { paySaleAction } from '../actions'

interface Props {
  orderId: string
}

const PAYMENT_LABELS: Record<string, string> = {
  cash:          'Dinheiro',
  pix:           'Pix',
  credit_card:   'Cartão de crédito',
  debit_card:    'Cartão de débito',
  bank_transfer: 'Transferência bancária',
  other:         'Outro',
}

export function PayForm({ orderId }: Props) {
  const [state, formAction, pending] = useActionState(paySaleAction, null)
  const [open, setOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [installments, setInstallments] = useState(1)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
      >
        Registrar pagamento
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
        <h2 className="text-base font-semibold text-zinc-900 mb-4">Registrar pagamento</h2>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="order_id" value={orderId} />
          <input type="hidden" name="payment_method" value={paymentMethod} />
          <input type="hidden" name="installments" value={installments} />

          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Forma de pagamento *</label>
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value)
                setInstallments(1)
              }}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            >
              {Object.entries(PAYMENT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {paymentMethod === 'credit_card' && (
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Parcelas</label>
              <select
                value={installments}
                onChange={(e) => setInstallments(parseInt(e.target.value, 10))}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}x {n === 1 ? '(à vista)' : ''}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {pending ? 'Salvando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
