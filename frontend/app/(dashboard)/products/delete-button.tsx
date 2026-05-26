'use client'

import { useTransition } from 'react'

interface Props {
  action: () => Promise<void>
}

export function DeleteProductButton({ action }: Props) {
  const [isPending, startTransition] = useTransition()

  async function handleClick() {
    if (!confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) return
    startTransition(async () => {
      await action()
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="px-4 py-2.5 rounded-lg border border-danger/30 text-danger hover:bg-danger-soft hover:border-danger/50 transition-colors active:scale-95 flex items-center gap-2 font-bold font-body-md disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-lg">delete</span>
      {isPending ? 'Excluindo...' : 'Excluir'}
    </button>
  )
}
