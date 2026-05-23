'use client'

import { useActionState, useState } from 'react'
import { cancelSaleAction } from '../actions'

interface Props {
  orderId: string
}

export function CancelForm({ orderId }: Props) {
  const [state, formAction, pending] = useActionState(cancelSaleAction, null)
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-outline btn-sm"
      >
        Cancelar venda
      </button>
    )
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-panel">
        <h2 className="modal-title">Cancelar venda?</h2>
        <p className="modal-sub">
          O estoque dos produtos será devolvido. Esta ação não pode ser desfeita.
        </p>

        <form action={formAction}>
          <input type="hidden" name="order_id" value={orderId} />

          {state?.error && (
            <div className="form-banner-error" style={{ marginBottom: 12 }}>
              {state.error}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={() => setOpen(false)} className="btn btn-outline">
              Voltar
            </button>
            <button type="submit" disabled={pending} className="btn btn-danger">
              {pending ? 'Cancelando…' : 'Confirmar cancelamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
