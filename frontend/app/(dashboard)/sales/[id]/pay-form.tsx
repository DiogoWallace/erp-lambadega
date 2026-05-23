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
        className="btn btn-success btn-sm"
      >
        Registrar pagamento
      </button>
    )
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-panel">
        <h2 className="modal-title">Registrar pagamento</h2>
        <p className="modal-sub">Confirme a forma de pagamento da venda.</p>

        <form action={formAction} className="form-stack">
          <input type="hidden" name="order_id" value={orderId} />
          <input type="hidden" name="payment_method" value={paymentMethod} />
          <input type="hidden" name="installments" value={installments} />

          {state?.error && (
            <div className="form-banner-error">{state.error}</div>
          )}

          <div className="form-field">
            <label className="field-label" htmlFor="pay-method">Forma de pagamento *</label>
            <select
              id="pay-method"
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value)
                setInstallments(1)
              }}
              className="input"
            >
              {Object.entries(PAYMENT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {paymentMethod === 'credit_card' && (
            <div className="form-field">
              <label className="field-label" htmlFor="pay-installments">Parcelas</label>
              <select
                id="pay-installments"
                value={installments}
                onChange={(e) => setInstallments(parseInt(e.target.value, 10))}
                className="input"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}x {n === 1 ? '(à vista)' : ''}</option>
                ))}
              </select>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={() => setOpen(false)} className="btn btn-outline">
              Cancelar
            </button>
            <button type="submit" disabled={pending} className="btn btn-success">
              {pending ? 'Salvando…' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
