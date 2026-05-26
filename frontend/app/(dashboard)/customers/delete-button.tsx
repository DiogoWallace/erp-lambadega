'use client'

import React from 'react'

interface Props {
  action: () => Promise<void>
  className?: string
  children?: React.ReactNode
}

export function DeleteCustomerButton({ action, className, children }: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm('Confirma a exclusão deste cliente?')) e.preventDefault()
      }}
      className={className}
    >
      {children ? (
        children
      ) : (
        <button type="submit" className="btn btn-sm btn-danger-outline">
          Excluir
        </button>
      )}
    </form>
  )
}
