import Link from 'next/link'
import { apiFetch } from '@/app/lib/api'
import { Category, PaginatedResponse } from '@/app/lib/types'
import { Icon } from '@/app/ui/icon'

interface Props {
  searchParams: Promise<{ search?: string; page?: string; is_active?: string }>
}

export default async function CategoriesPage({ searchParams }: Props) {
  const { search = '', page = '1', is_active = '' } = await searchParams

  const params = new URLSearchParams({ page })
  if (search) params.set('search', search)
  if (is_active !== '') params.set('is_active', is_active)

  const res = await apiFetch(`/categories?${params}`)
  const { data: categories, meta }: PaginatedResponse<Category> = await res.json()

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Categorias</h1>
          <p className="page-subtitle">{meta.total} categoria(s) cadastrada(s)</p>
        </div>
        <Link href="/categories/new" className="btn btn-primary btn-sm">
          <Icon name="plus" size={13} stroke={2} /> Nova categoria
        </Link>
      </div>

      <form method="GET" style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          name="search"
          type="text"
          defaultValue={search}
          placeholder="Buscar por nome..."
          className="input input-sm"
          style={{ flex: 1, minWidth: 240 }}
        />
        <select name="is_active" defaultValue={is_active} className="input input-sm" style={{ width: 160 }}>
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
        <button type="submit" className="btn btn-outline btn-sm">
          <Icon name="filter" size={12} /> Filtrar
        </button>
        {(search || is_active) && (
          <a href="/categories" className="btn btn-ghost btn-sm"><Icon name="x" size={12} /> Limpar</a>
        )}
      </form>

      <div className="card">
        {categories.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nenhuma categoria encontrada.</p>
          </div>
        ) : (
          <table className="t-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Pai</th>
                <th className="t-num">Ordem</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text)' }}>{category.name}</div>
                    {category.description && (
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {category.description}
                      </div>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{category.parent?.name ?? '—'}</td>
                  <td className="t-num tnum" style={{ color: 'var(--text-muted)' }}>{category.sort_order}</td>
                  <td>
                    <span className={`badge ${category.is_active ? 'badge-success' : ''}`}>
                      {category.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link href={`/categories/${category.id}/edit`} className="btn btn-ghost btn-sm">
                      <Icon name="edit" size={12} /> Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {meta.last_page > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Página {meta.current_page} de {meta.last_page}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {meta.current_page > 1 && (
              <PaginationLink page={meta.current_page - 1} search={search} isActive={is_active} label="← Anterior" />
            )}
            {meta.current_page < meta.last_page && (
              <PaginationLink page={meta.current_page + 1} search={search} isActive={is_active} label="Próxima →" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function PaginationLink({ page, search, isActive, label }: { page: number; search: string; isActive: string; label: string }) {
  const params = new URLSearchParams({ page: String(page) })
  if (search) params.set('search', search)
  if (isActive !== '') params.set('is_active', isActive)
  return <Link href={`/categories?${params}`} className="btn btn-outline btn-sm">{label}</Link>
}
