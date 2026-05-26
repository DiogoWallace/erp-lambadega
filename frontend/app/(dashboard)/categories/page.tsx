import Link from 'next/link'
import { apiFetch } from '@/app/lib/api'
import { Category, PaginatedResponse } from '@/app/lib/types'
import { Icon } from '@/app/ui/icons'

interface Props {
  searchParams: Promise<{ search?: string; page?: string; is_active?: string }>
}

// Gera uma cor de fundo determinística baseada no primeiro char do nome
const CAT_COLORS = [
  { bg: 'var(--accent-soft)',   color: 'var(--accent)' },
  { bg: 'var(--warning-soft)',  color: 'var(--warning)' },
  { bg: 'var(--success-soft)',  color: 'var(--success)' },
  { bg: 'var(--danger-soft)',   color: 'var(--danger)' },
  { bg: 'oklch(0.93 0.05 280 / 0.5)', color: 'oklch(0.42 0.12 280)' },
]
function catColor(name: string) {
  return CAT_COLORS[name.charCodeAt(0) % CAT_COLORS.length]
}

export default async function CategoriesPage({ searchParams }: Props) {
  const { search = '', page = '1', is_active = '' } = await searchParams

  const params = new URLSearchParams({ page })
  if (search) params.set('search', search)
  if (is_active !== '') params.set('is_active', is_active)

  const [res, meRes] = await Promise.all([
    apiFetch(`/categories?${params}`),
    apiFetch('/auth/me'),
  ])
  const { data: categories, meta }: PaginatedResponse<Category> = await res.json()
  const { data: me } = await meRes.json()
  const perms: string[] = me?.permissions ?? []
  const canCreate = perms.includes('categories.create')
  const canEdit = perms.includes('categories.edit')

  const hasFilters = !!(search || is_active)

  const totalActive = categories.filter(c => c.is_active).length
  const totalSubs = categories.filter(c => c.parent_id !== null).length

  function pageUrl(p: number) {
    const q = new URLSearchParams({ page: String(p) })
    if (search) q.set('search', search)
    if (is_active !== '') q.set('is_active', is_active)
    return `/categories?${q}`
  }

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Page Header */}
      <div className="page-head" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Gestão de Categorias</h1>
          <p className="page-subtitle" style={{ marginTop: 6 }}>
            Organize seus produtos em estruturas hierárquicas.
          </p>
        </div>
        {canCreate && (
          <Link href="/categories/new" className="btn btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="plus" size={14} stroke={2} />
            Nova Categoria
          </Link>
        )}
      </div>

      {/* Bento Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 20 }}>
        {/* Total */}
        <div className="card hover:shadow-md" style={{ padding: 24, transition: 'box-shadow 0.2s, border-color 0.2s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'var(--accent-soft)', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="bookmark" size={20} />
            </div>
            <span style={{
              padding: '2px 8px', fontSize: 10, fontWeight: 700, borderRadius: 4,
              background: 'var(--success-soft)', color: 'var(--success)',
              border: '1px solid oklch(0.85 0.10 152)',
            }}>
              +4%
            </span>
          </div>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
            TOTAL DE CATEGORIAS
          </p>
          <h3 style={{ fontSize: 30, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-hanken)', letterSpacing: '-0.02em', margin: 0 }}>
            {meta.total}
          </h3>
        </div>

        {/* Subcategorias */}
        <div className="card hover:shadow-md" style={{ padding: 24, transition: 'box-shadow 0.2s, border-color 0.2s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'var(--warning-soft)', color: 'var(--warning)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="caret" size={20} />
            </div>
            <span style={{
              padding: '2px 8px', fontSize: 10, fontWeight: 700, borderRadius: 4,
              background: 'var(--accent-soft)', color: 'var(--accent)',
              border: '1px solid oklch(0.85 0.10 252)',
            }}>
              Hierárquico
            </span>
          </div>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
            SUBCATEGORIAS
          </p>
          <h3 style={{ fontSize: 30, fontWeight: 900, color: 'var(--text)', fontFamily: 'var(--font-hanken)', letterSpacing: '-0.02em', margin: 0 }}>
            {totalSubs}
          </h3>
        </div>

        {/* Dica de Performance — card destaque indigo */}
        <div style={{
          padding: 24, borderRadius: 'var(--r-lg)',
          background: 'linear-gradient(135deg, oklch(0.42 0.18 270), oklch(0.34 0.20 258))',
          boxShadow: '0 8px 24px -4px oklch(0.42 0.18 270 / 0.35)',
          position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          {/* Background decorative icon */}
          <div style={{
            position: 'absolute', right: -24, bottom: -24, opacity: 0.08,
            fontSize: 140, lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
          }}>
            <Icon name="reports" size={160} />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h4 style={{ color: '#fff', fontWeight: 700, fontSize: 18, margin: '0 0 8px', fontFamily: 'var(--font-hanken)' }}>
              Dica de Performance
            </h4>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13.5, lineHeight: 1.6, maxWidth: 420 }}>
              Categorias bem estruturadas melhoram a precisão dos relatórios de vendas e a agilidade no PDV em até 30%.
            </p>
          </div>
          <div style={{ position: 'relative', zIndex: 1, marginTop: 16 }}>
            <span style={{
              display: 'inline-block', padding: '6px 16px',
              background: '#fff', color: 'oklch(0.42 0.18 270)',
              fontWeight: 700, fontSize: 12, borderRadius: 8,
              cursor: 'default',
            }}>
              Ver Guia Completo
            </span>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="card" style={{ padding: 20 }}>
        <form method="GET" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 12 }}>
          {/* Pesquisar */}
          <div style={{ flex: '2 1 280px' }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              Pesquisar
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                <Icon name="search" size={14} />
              </span>
              <input
                name="search"
                type="text"
                defaultValue={search}
                placeholder="Nome ou slug da categoria..."
                className="input input-sm"
                style={{ width: '100%', paddingLeft: 32 }}
              />
            </div>
          </div>

          {/* Status */}
          <div style={{ flex: '1 1 160px' }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              Status
            </label>
            <select name="is_active" defaultValue={is_active} className="input input-sm" style={{ width: '100%' }}>
              <option value="">Todos</option>
              <option value="true">Ativos</option>
              <option value="false">Inativos</option>
            </select>
          </div>

          {/* Ações */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button type="submit" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="filter" size={13} /> Filtrar
            </button>
            {hasFilters && (
              <a href="/categories" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="x" size={13} /> Limpar
              </a>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {categories.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-faint)', marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
              <Icon name="bookmark" size={36} />
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>Nenhuma categoria encontrada.</p>
            {hasFilters && (
              <a href="/categories" style={{ display: 'inline-block', marginTop: 12, fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                Limpar filtros
              </a>
            )}
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                    {[
                      { label: 'ORDEM', align: 'center' },
                      { label: 'NOME', align: 'left' },
                      { label: 'SLUG', align: 'left' },
                      { label: 'CATEGORIA PAI', align: 'left' },
                      { label: 'STATUS', align: 'left' },
                      { label: 'AÇÕES', align: 'right' },
                    ].map(h => (
                      <th
                        key={h.label}
                        style={{
                          padding: '12px 16px',
                          fontSize: 11, fontWeight: 700,
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase', letterSpacing: '0.07em',
                          textAlign: h.align as 'left' | 'right' | 'center',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, i) => {
                    const av = catColor(category.name)
                    const initials = category.name.slice(0, 2).toUpperCase()
                    const isRoot = !category.parent_id
                    const isActive = category.is_active

                    return (
                      <tr
                        key={category.id}
                        style={{
                          borderBottom: i < categories.length - 1 ? '1px solid var(--border-soft)' : 'none',
                          transition: 'background 0.1s',
                        }}
                        className="hover:bg-[var(--surface-hover)]"
                      >
                        {/* Ordem */}
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <span style={{
                            fontFamily: 'var(--font-geist-mono), monospace',
                            fontSize: 12, fontWeight: 600,
                            color: 'var(--text-muted)',
                          }}>
                            {String(category.sort_order).padStart(2, '0')}
                          </span>
                        </td>

                        {/* Nome */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {/* Indentação para subcategoria */}
                            {!isRoot && (
                              <div style={{
                                width: 3, height: 28, borderRadius: 2,
                                background: 'var(--border)',
                                marginLeft: 8, flexShrink: 0,
                              }} />
                            )}
                            <div style={{
                              width: 32, height: 32, borderRadius: 8,
                              background: av.bg, color: av.color,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 11, fontWeight: 700,
                              border: `1px solid ${av.color}22`,
                              flexShrink: 0,
                            }}>
                              {initials}
                            </div>
                            <div>
                              <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text)' }}>
                                {category.name}
                              </span>
                              {category.description && (
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {category.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Slug */}
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            fontFamily: 'var(--font-geist-mono), monospace',
                            fontSize: 11.5,
                            color: 'var(--text-muted)',
                          }}>
                            {category.slug}
                          </span>
                        </td>

                        {/* Pai */}
                        <td style={{ padding: '14px 16px' }}>
                          {category.parent ? (
                            <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-soft)' }}>
                              {category.parent.name}
                            </span>
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--text-faint)', fontStyle: 'italic' }}>
                              Nenhuma (Principal)
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '3px 10px', borderRadius: 6,
                            background: isActive ? 'var(--success-soft)' : 'var(--surface-2)',
                            color: isActive ? 'var(--success)' : 'var(--text-muted)',
                            border: `1px solid ${isActive ? 'oklch(0.85 0.10 152)' : 'var(--border)'}`,
                            fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                          }}>
                            <span style={{
                              width: 6, height: 6, borderRadius: '50%',
                              background: isActive ? 'var(--success)' : 'var(--text-faint)',
                              flexShrink: 0,
                            }} />
                            {isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>

                        {/* Ações */}
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          {canEdit && (
                            <Link
                              href={`/categories/${category.id}/edit`}
                              className="btn btn-ghost btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            >
                              <Icon name="edit" size={12} /> Editar
                            </Link>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: 'var(--surface-2)',
              borderTop: '1px solid var(--border)',
            }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
                Exibindo {(meta.current_page - 1) * meta.per_page + 1}–{Math.min(meta.current_page * meta.per_page, meta.total)} de {meta.total.toLocaleString('pt-BR')} categorias
              </p>

              {meta.last_page > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {meta.current_page > 1 ? (
                    <Link href={pageUrl(meta.current_page - 1)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface)', color: 'var(--text-soft)', textDecoration: 'none' }}>
                      <Icon name="chevron_l" size={16} />
                    </Link>
                  ) : (
                    <span style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: 6, opacity: 0.3, color: 'var(--text-muted)' }}>
                      <Icon name="chevron_l" size={16} />
                    </span>
                  )}

                  {Array.from({ length: Math.min(meta.last_page, 5) }, (_, idx) => {
                    const p = idx + 1
                    const isCurrent = p === meta.current_page
                    return (
                      <Link key={p} href={pageUrl(p)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, fontSize: 12, fontWeight: isCurrent ? 700 : 600, textDecoration: 'none', background: isCurrent ? 'oklch(0.42 0.18 270)' : 'var(--surface)', color: isCurrent ? '#fff' : 'var(--text-soft)', border: isCurrent ? 'none' : '1px solid var(--border)' }}>
                        {p}
                      </Link>
                    )
                  })}

                  {meta.last_page > 5 && (
                    <>
                      <span style={{ padding: '0 2px', color: 'var(--text-muted)', fontSize: 12 }}>…</span>
                      <Link href={pageUrl(meta.last_page)} style={{ width: 40, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface)', fontSize: 12, fontWeight: 600, color: 'var(--text-soft)', textDecoration: 'none' }}>
                        {meta.last_page}
                      </Link>
                    </>
                  )}

                  {meta.current_page < meta.last_page ? (
                    <Link href={pageUrl(meta.current_page + 1)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface)', color: 'var(--text-soft)', textDecoration: 'none' }}>
                      <Icon name="chevron_r" size={16} />
                    </Link>
                  ) : (
                    <span style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: 6, opacity: 0.3, color: 'var(--text-muted)' }}>
                      <Icon name="chevron_r" size={16} />
                    </span>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Contextual Help Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="eye" size={18} />
          </div>
          <div>
            <h5 style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text)', margin: '0 0 4px' }}>
              Estrutura de Slugs
            </h5>
            <p style={{ fontSize: 12, color: 'var(--text-soft)', lineHeight: 1.6, margin: 0 }}>
              Os slugs são gerados automaticamente a partir do nome para uso em integrações de E-commerce e API. Evite caracteres especiais.
            </p>
          </div>
        </div>

        <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--warning-soft)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="caret_down" size={18} />
          </div>
          <div>
            <h5 style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text)', margin: '0 0 4px' }}>
              Ordenação Visual
            </h5>
            <p style={{ fontSize: 12, color: 'var(--text-soft)', lineHeight: 1.6, margin: 0 }}>
              A coluna &apos;Ordem&apos; define como as categorias aparecem no módulo de PDV. Categorias com ordem menor aparecem primeiro.
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
