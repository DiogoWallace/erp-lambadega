'use client'

interface Props {
  action: () => Promise<void>
}

export function DeleteCategoryButton({ action }: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm('Confirma a exclusão desta categoria?')) e.preventDefault()
      }}
    >
      <button type="submit" className="btn btn-sm btn-danger-outline">
        Excluir
      </button>
    </form>
  )
}
