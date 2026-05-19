'use client'

import { useActionState } from 'react'
import { logoutAction } from './actions'

export function LogoutButton() {
  const [, formAction, pending] = useActionState(logoutAction, null)

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={pending}
        className="text-xs font-medium text-zinc-500 hover:text-zinc-900 disabled:opacity-50 transition"
      >
        {pending ? 'Saindo...' : 'Sair'}
      </button>
    </form>
  )
}
