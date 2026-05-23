import { redirect } from 'next/navigation'
import { apiFetch } from '@/app/lib/api'
import { UserForm } from '../user-form'
import { createUserAction } from '../actions'

export default async function NewUserPage() {
  const res = await apiFetch('/auth/me')
  const { data: me } = await res.json()
  const permissions: string[] = me?.permissions ?? []

  if (!permissions.includes('users.create')) {
    redirect('/settings/users')
  }

  return (
    <div className="page page-form">
      <div className="page-head">
        <div>
          <h1 className="page-title">Novo usuário</h1>
          <p className="page-subtitle">Cadastre um colaborador e atribua um cargo.</p>
        </div>
      </div>

      <UserForm action={createUserAction} mode="create" submitLabel="Criar usuário" />
    </div>
  )
}
