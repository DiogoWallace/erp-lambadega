import Link from 'next/link'
import { apiFetch } from '@/app/lib/api'
import { Category, PaginatedResponse, Product } from '@/app/lib/types'
import { Icon } from '@/app/ui/icon'

interface Props {
  searchParams: Promise<{
    search?: string
    page?: string
    is_active?: string
    category_id?: string
    low_stock?: string
  }>
}

function formatPrice(value: string): string {
  return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function stockKind(p: Product): 'danger' | 'warning' | 'success' {
  if (p.stock_quantity === 0) return 'danger'
  if (p.is_low_stock) return 'warning'
  return 'success'
}

export default async function ProductsPage({ searchParams }: Props) {
  const { search = '', page = '1', is_active = '', category_id = '', low_stock = '' } = await searchParams

  const params = new URLSearchParams({ page })
  if (search) params.set('search', search)
  if (is_active !== '') params.set('is_active', is_active)
  if (category_id) params.set('category_id', category_id)
  if (low_stock) params.set('low_stock', low_stock)

  const [productsRes, categoriesRes] = await Promise.all([
    apiFetch(`/products?${params}`),
    apiFetch('/categories?all=1'),
  ])

  const { data: products, meta }: PaginatedResponse<Product> = await productsRes.json()
  const { data: categories }: { data: Category[] } = await categoriesRes.json()

  const hasFilters = search || is_active || category_id || low_stock

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Produtos</h1>
          <p className="page-subtitle">{meta.total} produto(s) cadastrado(s)</p>
        </div>
        <Link href="/products/new" className="btn btn-primary btn-sm">
          <Icon name="plus" size={13} stroke={2} /> Novo produto
        </Link>
      </div>

      <form method="GET" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <input
          name="search"
          type="text"
          defaultValue={search}
          placeholder="Buscar por nome, SKU, barcode ou marca..."
          className="input input-sm"
          style={{ flex: 1, minWidth: 240 }}
        />
        <select name="category_id" defaultValue={category_id} className="input input-sm" style={{ width: 220 }}>
          <option value="">Todas as categorias</option>
          {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
        </select>
        <select name="is_active" defaultValue={is_active} className="input input-sm" style={{ width: 140 }}>
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
        <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
          <input type="checkbox" name="low_stock" value="1" defaultChecked={!!low_stock} style={{ accentColor: 'var(--accent)' }} />
          Estoque baixo
        </label>
        <button type="submit" className="btn btn-outline btn-sm"><Icon name="filter" size={12} /> Filtrar</button>
        {hasFilters && (<a href="/products" className="btn btn-ghost btn-sm"><Icon name="x" size={12} /> Limpar</a>)}
      </form>

      <div className="card">
        {products.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nenhum produto encontrado.</p>
          </div>
        ) : (
          <table className="t-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Fornecedor</th>
                <th className="t-num">Preço</th>
                <th className="t-num">Estoque / Mín.</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const kind = stockKind(p)
                const pct = p.min_stock_quantity > 0
                  ? Math.min(100, Math.round((p.stock_quantity / p.min_stock_quantity) * 100))
                  : 100
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text)' }}>{p.name}</div>
                      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        {p.brand && <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{p.brand}</span>}
                        {p.sku && <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{p.sku}</span>}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{p.category?.name ?? '—'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{p.supplier?.company_name ?? '—'}</td>
                    <td className="t-num tnum" style={{ fontWeight: 500 }}>{formatPrice(p.sale_price)}</td>
                    <td className="t-num" style={{ width: 180 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                        <span className={`badge badge-${kind}`}>{p.stock_quantity}</span>
                        <span className="tnum" style={{ color: 'var(--text-muted)', fontSize: 11.5 }}>/ {p.min_stock_quantity}</span>
                      </div>
                      <div style={{ marginTop: 6, height: 4, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: `var(--${kind})` }} />
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${p.is_active ? 'badge-success' : ''}`}>{p.is_active ? 'Ativo' : 'Inativo'}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        <Link href={`/stock-movements/new?product_id=${p.id}`} className="btn btn-ghost btn-sm">
                          <Icon name="plus" size={11} /> Mov.
                        </Link>
                        <Link href={`/products/${p.id}/edit`} className="btn btn-ghost btn-sm">
                          <Icon name="edit" size={11} /> Editar
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {meta.last_page > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Página {meta.current_page} de {meta.last_page}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {meta.current_page > 1 && (
              <PaginationLink page={meta.current_page - 1} {...{ search, isActive: is_active, categoryId: category_id, lowStock: low_stock }} label="← Anterior" />
            )}
            {meta.current_page < meta.last_page && (
              <PaginationLink page={meta.current_page + 1} {...{ search, isActive: is_active, categoryId: category_id, lowStock: low_stock }} label="Próxima →" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function PaginationLink({ page, search, isActive, categoryId, lowStock, label }: {
  page: number; search: string; isActive: string; categoryId: string; lowStock: string; label: string
}) {
  const p = new URLSearchParams({ page: String(page) })
  if (search) p.set('search', search)
  if (isActive !== '') p.set('is_active', isActive)
  if (categoryId) p.set('category_id', categoryId)
  if (lowStock) p.set('low_stock', lowStock)
  return <Link href={`/products?${p}`} className="btn btn-outline btn-sm">{label}</Link>
}
