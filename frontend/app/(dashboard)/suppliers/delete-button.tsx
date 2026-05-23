'use client'

interface Props {
  action: () => Promise<void>
}

export function DeleteSupplierButton({ action }: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm('Confirma a exclusão deste fornecedor?')) e.preventDefault()
      }}
    >
      <button type="submit" className="btn btn-sm btn-danger-outline">
        Excluir
      </button>
    </form>
  )
}
