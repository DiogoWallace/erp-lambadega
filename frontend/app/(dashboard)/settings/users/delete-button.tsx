'use client'

import { useState, useTransition } from 'react'
import { Icon } from '@/app/ui/icons'
import { deleteUserAction } from './actions'

interface Props {
  id: string
  name: string
}

export function DeleteUserButton({ id, name }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <>
      <button type="button" className="btn btn-danger-outline" onClick={() => setOpen(true)}>
        <Icon name="trash" size={12} /> Excluir usuário
      </button>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Excluir {name}?</h3>
            <p className="modal-sub">O acesso será revogado e o usuário deixará de aparecer na lista. Esta ação pode ser revertida via banco (soft delete).</p>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setOpen(false)} disabled={pending}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={pending}
                onClick={() => startTransition(() => deleteUserAction(id))}
              >
                {pending ? 'Excluindo…' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
