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
        className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
      >
        Cancelar venda
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
        <h2 className="text-base font-semibold text-zinc-900 mb-2">Cancelar venda?</h2>
        <p className="text-sm text-zinc-500 mb-4">
          O estoque dos produtos será devolvido. Esta ação não pode ser desfeita.
        </p>

        <form action={formAction}>
          <input type="hidden" name="order_id" value={orderId} />

          {state?.error && (
            <p className="mb-3 text-sm text-red-600">{state.error}</p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {pending ? 'Cancelando...' : 'Confirmar cancelamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
