import { redirect } from 'next/navigation'
import { apiFetch } from '@/app/lib/api'
import { logoutAction } from './actions'

export async function SidebarUser() {
  const res = await apiFetch('/auth/me')
  const { data: user } = await res.json()

  return (
    <div className="px-4 py-4 border-t border-zinc-100">
      <p className="text-xs font-semibold text-zinc-900 truncate">{user.name}</p>
      <p className="text-xs text-zinc-400 truncate mt-0.5">{user.email}</p>
      <form action={logoutAction} className="mt-3">
        <button
          type="submit"
          className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          Sign out
        </button>
      </form>
    </div>
  )
}
