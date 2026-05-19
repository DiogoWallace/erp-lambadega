import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SidebarNav } from './sidebar-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) redirect('/login')

  const apiUrl = process.env.API_BASE_URL ?? 'http://webserver:8001'
  const res = await fetch(`${apiUrl}/api/auth/me`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  if (!res.ok) redirect('/login')

  const { data: user } = await res.json()

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <SidebarNav user={user} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
