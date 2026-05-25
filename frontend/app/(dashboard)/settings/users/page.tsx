import Link from 'next/link'
import { forbidden } from 'next/navigation'
import { apiFetch } from '@/app/lib/api'
import type { PaginatedResponse, UserAccount } from '@/app/lib/types'
import { Icon } from '@/app/ui/icons'

interface Props {
  searchParams: Promise<{
    search?: string
    is_active?: string
    role?: string
    page?: string
  }>
}

const ROLES = ['admin', 'gerente', 'financeiro', 'vendedor']

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  gerente: 'Gerente',
  financeiro: 'Financeiro',
  vendedor: 'Vendedor',
}

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'
}

export default async function UsersPage({ searchParams }: Props) {
  const meRes = await apiFetch('/auth/me')
  const { data: me } = await meRes.json()
  const permissions: string[] = me?.permissions ?? []

  if (!permissions.includes('users.view')) {
    forbidden()
  }

  const canCreate = permissions.includes('users.create')
  const canEdit = permissions.includes('users.edit')

  const { search = '', is_active = '', role = '', page = '1' } = await searchParams

  const params = new URLSearchParams({ page })
  if (search) params.set('search', search)
  if (is_active) params.set('is_active', is_active)
  if (role) params.set('role', role)

  const res = await apiFetch(`/users?${params}`)
  const { data: users, meta }: PaginatedResponse<UserAccount> = await res.json()

  function pageUrl(p: number) {
    const q = new URLSearchParams({ page: String(p) })
    if (search) q.set('search', search)
    if (is_active) q.set('is_active', is_active)
    if (role) q.set('role', role)
    return `/settings/users?${q}`
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Usuários</h1>
          <p className="page-subtitle">{meta.total} colaborador(es) cadastrado(s)</p>
        </div>
        {canCreate && (
          <Link href="/settings/users/new" className="btn btn-primary btn-sm">
            <Icon name="plus" size={13} stroke={2} /> Novo usuário
          </Link>
        )}
      </div>

      <form method="GET" style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          name="search"
          type="text"
          defaultValue={search}
          placeholder="Buscar por nome ou email..."
          className="input input-sm"
          style={{ flex: 1, minWidth: 240 }}
        />
        <select name="role" defaultValue={role} className="input input-sm" style={{ width: 180 }}>
          <option value="">Todos os cargos</option>
          {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
        </select>
        <select name="is_active" defaultValue={is_active} className="input input-sm" style={{ width: 160 }}>
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
        <button type="submit" className="btn btn-outline btn-sm"><Icon name="filter" size={12} /> Filtrar</button>
        {(search || role || is_active) && (
          <a href="/settings/users" className="btn btn-ghost btn-sm"><Icon name="x" size={12} /> Limpar</a>
        )}
      </form>

      <div className="card">
        {users.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nenhum usuário encontrado.</p>
          </div>
        ) : (
          <table className="t-table">
            <thead>
              <tr>
                <th></th>
                <th>Nome</th>
                <th>Email</th>
                <th>Cargo</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={{ width: 44 }}>
                    {user.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatar_url} alt="" className="user-row-avatar" />
                    ) : (
                      <span className="user-row-avatar user-row-avatar-fallback">{initialsOf(user.name)}</span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text)' }}>{user.name}</div>
                    {user.must_change_password && (
                      <div style={{ fontSize: 11.5, color: 'var(--warning)', marginTop: 2 }}>
                        precisa trocar senha
                      </div>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{user.email}</td>
                  <td>
                    {user.role
                      ? <span className="badge badge-info">{ROLE_LABEL[user.role] ?? user.role}</span>
                      : <span style={{ color: 'var(--text-faint)' }}>—</span>}
                  </td>
                  <td>
                    <span className={`badge ${user.is_active ? 'badge-success' : ''}`}>
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {canEdit && (
                      <Link href={`/settings/users/${user.id}/edit`} className="btn btn-ghost btn-sm">
                        <Icon name="edit" size={12} /> Editar
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {meta.last_page > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Página {meta.current_page} de {meta.last_page}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {meta.current_page > 1 && (<Link href={pageUrl(meta.current_page - 1)} className="btn btn-outline btn-sm">← Anterior</Link>)}
            {meta.current_page < meta.last_page && (<Link href={pageUrl(meta.current_page + 1)} className="btn btn-outline btn-sm">Próxima →</Link>)}
          </div>
        </div>
      )}
    </div>
  )
}
