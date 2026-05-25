import { apiFetch } from '@/app/lib/api'
import { getTheme } from '@/app/lib/theme'
import { DashboardShell } from './shell'

// Tudo aqui dentro depende do cookie 'token'; nunca pré-renderizar estático.
export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let userName = 'Usuário'
  let userRole = 'user'
  let userAvatar: string | null = null
  let permissions: string[] = []
  let tenantId = '—'
  let pinned: string[] = []

  try {
    const res = await apiFetch('/auth/me')
    const { data: user } = await res.json()
    userName = user?.name ?? 'Usuário'
    userRole = user?.roles?.[0] ?? 'user'
    userAvatar = user?.avatar_url ?? null
    permissions = user?.permissions ?? []
    tenantId = (user?.establishment_id ?? '').slice(0, 8) || '—'
    const storedPinned = user?.preferences?.sidebar_pinned
    if (Array.isArray(storedPinned)) pinned = storedPinned.filter((x: unknown): x is string => typeof x === 'string')
  } catch {
    // fail silently — layout still renders with placeholders
  }

  const theme = await getTheme()

  return (
    <DashboardShell
      userName={userName}
      userRole={userRole}
      userAvatar={userAvatar}
      permissions={permissions}
      initialPinned={pinned}
      tenantName="Estabelecimento"
      tenantMeta={`#${tenantId}`}
      theme={theme}
    >
      {children}
    </DashboardShell>
  )
}
