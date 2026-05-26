'use client'

import { useActionState, useEffect, useState } from 'react'
import { Icon } from '@/app/ui/icons'
import type { Supplier } from '@/app/lib/types'
import { createQuoteAction } from './cost-history-actions'

interface Props {
  productId: string
  defaultSupplierId: string | null
  suppliers: Supplier[]
}

export function QuoteModal({ productId, defaultSupplierId, suppliers }: Props) {
  const [open, setOpen] = useState(false)
  const boundAction = createQuoteAction.bind(null, productId)
  const [state, action, pending] = useActionState(boundAction, null)

  useEffect(() => {
    if (state?.ok) setOpen(false)
  }, [state])

  return (
    <>
      <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(true)}>
        <Icon name="plus" size={12} /> Registrar cotação
      </button>

      {open && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-panel" style={{ maxWidth: 480 }}>
            <div className="modal-title">Registrar cotação</div>
            <div className="modal-sub">
              Cadastra uma cotação de fornecedor sem dar entrada de estoque. Útil
              para comparar preços antes de comprar.
            </div>

            <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
              {state?.error && (
                <div className="form-banner-error">{state.error}</div>
              )}

              <div>
                <label className="form-label">Fornecedor</label>
                <select
                  name="supplier_id"
                  defaultValue={defaultSupplierId ?? ''}
                  className="input input-sm"
                  style={{ width: '100%' }}
                >
                  <option value="">— Sem fornecedor específico —</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.company_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Preço de custo (R$) *</label>
                <input
                  name="cost_price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  className="input input-sm"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="form-label">Data da cotação</label>
                <input
                  name="effective_at"
                  type="date"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className="input input-sm"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="form-label">Notas</label>
                <textarea
                  name="notes"
                  rows={3}
                  maxLength={500}
                  className="input input-sm"
                  style={{ width: '100%' }}
                  placeholder="Ex.: condição de pagamento, prazo, frete..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)} disabled={pending}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
                  {pending ? 'Salvando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
