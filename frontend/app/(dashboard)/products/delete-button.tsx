'use client'

interface Props {
  action: () => Promise<void>
}

export function DeleteProductButton({ action }: Props) {
  async function handleClick() {
    if (!confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) return
    await action()
  }

  return (
    <button type="button" onClick={handleClick} className="btn btn-sm btn-danger-outline">
      Excluir
    </button>
  )
}
