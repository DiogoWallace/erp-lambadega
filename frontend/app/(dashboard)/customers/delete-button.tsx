'use client'

interface Props {
  action: () => Promise<void>
}

export function DeleteCustomerButton({ action }: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm('Confirma a exclusão deste cliente?')) e.preventDefault()
      }}
    >
      <button type="submit" className="btn btn-sm btn-danger-outline">
        Excluir
      </button>
    </form>
  )
}
