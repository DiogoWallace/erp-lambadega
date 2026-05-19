import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { LogoutButton } from './logout-button'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) redirect('/login')

  const apiUrl = process.env.API_BASE_URL ?? 'http://webserver:8001'

  const response = await fetch(`${apiUrl}/api/auth/me`, {
    headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    cache: 'no-store',
  })

  if (!response.ok) redirect('/login')

  const { data: user } = await response.json()

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-12">
      <div className="mx-auto max-w-xl space-y-6">

        <div className="flex items-center gap-3 rounded-2xl bg-green-50 border border-green-200 px-5 py-4">
          <svg className="w-5 h-5 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-green-800">Login realizado com sucesso</p>
            <p className="text-xs text-green-600 mt-0.5">Autenticado via Laravel Sanctum</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-900">Dados do usuário</h2>
            <LogoutButton />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide mb-1">Nome</p>
              <p className="text-zinc-900 font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide mb-1">E-mail</p>
              <p className="text-zinc-900 font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide mb-1">Status</p>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {user.is_active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <div>
              <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide mb-1">Telefone</p>
              <p className="text-zinc-900 font-medium">{user.phone ?? '—'}</p>
            </div>
          </div>

          <div>
            <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide mb-2">Roles</p>
            <div className="flex flex-wrap gap-2">
              {user.roles.map((role: string) => (
                <span key={role} className="rounded-full bg-zinc-900 px-3 py-0.5 text-xs font-semibold text-white">
                  {role}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide mb-2">Permissões</p>
            <div className="flex flex-wrap gap-1.5">
              {user.permissions.map((perm: string) => (
                <span key={perm} className="rounded-md bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600 font-mono">
                  {perm}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
