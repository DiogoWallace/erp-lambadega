'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SidebarNav } from './sidebar-nav'
import { Topbar } from './topbar'

// Reset drawer state ao navegar — padrão do React 19 (compara durante render,
// evita cascading render do setState-em-useEffect). Cobre navegações fora da
// sidebar (breadcrumb, redirects).

interface Props {
  userName: string
  userRole: string
  userAvatar: string | null
  permissions: string[]
  tenantName: string
  tenantMeta: string
  theme: 'light' | 'dark'
  children: React.ReactNode
}

export function DashboardShell({
  userName,
  userRole,
  userAvatar,
  permissions,
  tenantName,
  tenantMeta,
  theme,
  children,
}: Props) {
  const canBroadcast = permissions.includes('notification.broadcast')
  const canSettings = permissions.includes('settings.view')
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setMobileOpen(false)
  }

  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [mobileOpen])

  return (
    <div className={`app-shell ${mobileOpen ? 'mobile-open' : ''}`}>
      <SidebarNav
        permissions={permissions}
        tenantName={tenantName}
        tenantMeta={tenantMeta}
        userName={userName}
        userRole={userRole}
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
      />
      {mobileOpen && (
        <button
          type="button"
          className="app-overlay"
          aria-label="Fechar menu"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <main className="app-main">
        <Topbar
          userName={userName}
          userRole={userRole}
          userAvatar={userAvatar}
          theme={theme}
          canBroadcast={canBroadcast}
          canSettings={canSettings}
          onMenuClick={() => setMobileOpen((v) => !v)}
        />
        {children}
      </main>
    </div>
  )
}
