import { Suspense } from 'react'
import { apiFetch } from '@/app/lib/api'
import { SidebarNav } from './sidebar-nav'
import { SidebarUser } from './sidebar-user'
import { SidebarUserSkeleton } from '@/app/ui/skeletons'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let canAudit = false
  try {
    const res = await apiFetch('/auth/me')
    const { data: user } = await res.json()
    canAudit = (user?.permissions ?? []).includes('audit.view')
  } catch {
    // fail silently — sidebar renders without audit link
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <aside className="w-56 shrink-0 bg-white border-r border-zinc-200 flex flex-col h-full">
        <div className="px-5 py-4 border-b border-zinc-100">
          <span className="text-sm font-bold text-zinc-900 tracking-tight">ERP Comercial</span>
        </div>
        <SidebarNav canAudit={canAudit} />
        <Suspense fallback={<SidebarUserSkeleton />}>
          <SidebarUser />
        </Suspense>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
