'use client'

interface Props {
  action: () => Promise<void>
}

export function DeleteTransactionButton({ action }: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm('Confirma a exclusão deste lançamento?')) e.preventDefault()
      }}
    >
      <button
        type="submit"
        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
      >
        Excluir
      </button>
    </form>
  )
}
