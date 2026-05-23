import { apiFetch } from '@/app/lib/api'
import { ProfileForm } from './profile-form'
import { PasswordForm } from './password-form'

interface ProfileData {
  id: string
  name: string
  email: string
  phone: string | null
  roles: string[]
}

export default async function ProfilePage() {
  const res = await apiFetch('/me/profile')
  const { data: user }: { data: ProfileData } = await res.json()

  return (
    <div className="page page-form">
      <div className="page-head">
        <div>
          <h1 className="page-title">Meu perfil</h1>
          <p className="page-subtitle">
            {user.roles?.[0] ? `Cargo: ${user.roles[0]}` : 'Edite seus dados e senha de acesso.'}
          </p>
        </div>
      </div>

      <ProfileForm user={user} />

      <div style={{ height: 12 }} />

      <PasswordForm />
    </div>
  )
}
