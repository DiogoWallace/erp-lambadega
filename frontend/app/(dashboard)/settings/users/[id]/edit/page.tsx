import { notFound, redirect } from 'next/navigation'
import { apiFetch } from '@/app/lib/api'
import type { UserAccount } from '@/app/lib/types'
import { UserForm } from '../../user-form'
import { updateUserAction } from '../../actions'
import { DeleteUserButton } from '../../delete-button'
import { ResetPasswordButton } from '../../reset-password-button'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditUserPage({ params }: Props) {
  const { id } = await params

  const meRes = await apiFetch('/auth/me')
  const { data: me } = await meRes.json()
  const permissions: string[] = me?.permissions ?? []

  if (!permissions.includes('users.view')) {
    redirect('/settings')
  }

  const canEdit = permissions.includes('users.edit')
  const canDelete = permissions.includes('users.delete')
  const isSelf = me?.id === id

  const res = await apiFetch(`/users/${id}`)
  if (res.status === 404) notFound()

  const { data: user }: { data: UserAccount } = await res.json()

  const boundUpdate = updateUserAction.bind(null, user.id)

  return (
    <div className="page page-form">
      <div className="page-head">
        <div>
          <h1 className="page-title">{user.name}</h1>
          <p className="page-subtitle">Editar usuário</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {canEdit && !isSelf && <ResetPasswordButton id={user.id} name={user.name} />}
          {canDelete && !isSelf && <DeleteUserButton id={user.id} name={user.name} />}
        </div>
      </div>

      <UserForm action={boundUpdate} user={user} mode="update" submitLabel="Salvar alterações" />
    </div>
  )
}
