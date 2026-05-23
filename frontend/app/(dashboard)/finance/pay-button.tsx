'use client'

interface Props {
  action: () => Promise<void>
}

export function PayTransactionButton({ action }: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm('Marcar este lançamento como pago hoje?')) e.preventDefault()
      }}
    >
      <button
        type="submit"
        className="btn btn-ghost btn-sm"
        style={{ color: 'var(--success)' }}
      >
        Marcar paga
      </button>
    </form>
  )
}
