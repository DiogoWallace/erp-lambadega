import { redirect } from 'next/navigation'
import { apiFetch } from '@/app/lib/api'
import { BroadcastForm } from './broadcast-form'

export default async function NewBroadcastPage() {
  // Gating server-side: lê /auth/me e bloqueia se o usuário não tem permissão.
  try {
    const res = await apiFetch('/auth/me')
    const { data: user } = await res.json()
    const permissions: string[] = user?.permissions ?? []
    if (!permissions.includes('notification.broadcast')) {
      redirect('/notifications')
    }
  } catch {
    redirect('/notifications')
  }

  return (
    <div className="page page-form">
      <div className="page-head">
        <div>
          <h1 className="page-title">Nova notificação</h1>
          <p className="page-subtitle">A mensagem será exibida para todos os usuários do estabelecimento.</p>
        </div>
      </div>

      <BroadcastForm />
    </div>
  )
}
