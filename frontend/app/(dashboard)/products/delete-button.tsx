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
    <button
      type="button"
      onClick={handleClick}
      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
    >
      Excluir
    </button>
  )
}
