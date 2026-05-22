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
        className="text-xs font-medium text-green-600 hover:text-green-700 transition-colors"
      >
        Marcar paga
      </button>
    </form>
  )
}
