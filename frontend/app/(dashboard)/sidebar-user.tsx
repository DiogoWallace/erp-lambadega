import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { logoutAction } from './actions'

export async function SidebarUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) redirect('/login')

  const apiUrl = process.env.API_BASE_URL ?? 'http://webserver:8001'
  const res = await fetch(`${apiUrl}/api/auth/me`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  if (!res.ok) redirect('/api/auth/clear')

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
