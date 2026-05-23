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
  let canAudit = false
  let canBroadcast = false
  let canSettings = false
  let tenantId = '—'

  try {
    const res = await apiFetch('/auth/me')
    const { data: user } = await res.json()
    userName = user?.name ?? 'Usuário'
    userRole = user?.roles?.[0] ?? 'user'
    const permissions: string[] = user?.permissions ?? []
    canAudit = permissions.includes('audit.view')
    canBroadcast = permissions.includes('notification.broadcast')
    canSettings = permissions.includes('settings.view')
    tenantId = (user?.establishment_id ?? '').slice(0, 8) || '—'
  } catch {
    // fail silently — layout still renders with placeholders
  }

  const theme = await getTheme()

  return (
    <DashboardShell
      userName={userName}
      userRole={userRole}
      canAudit={canAudit}
      canBroadcast={canBroadcast}
      canSettings={canSettings}
      tenantName="Estabelecimento"
      tenantMeta={`#${tenantId}`}
      theme={theme}
    >
      {children}
    </DashboardShell>
  )
}
