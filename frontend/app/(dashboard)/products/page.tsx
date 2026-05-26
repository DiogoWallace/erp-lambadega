import Link from 'next/link'
import { apiFetch } from '@/app/lib/api'
import { Category, PaginatedResponse, Product } from '@/app/lib/types'
import { Icon } from '@/app/ui/icons'

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
  if (p.stock_quantity <= p.min_stock_quantity) {
    if (p.min_stock_quantity > 0 && (p.stock_quantity / p.min_stock_quantity) <= 0.5) {
      return 'danger'
    }
    return 'warning'
  }
  return 'success'
}

const STOCK_STYLES = {
  danger: {
    badgeClass: 'bg-red-50 text-red-600 border-red-100',
    barBg: 'bg-red-500'
  },
  warning: {
    badgeClass: 'bg-orange-50 text-orange-600 border-orange-100',
    barBg: 'bg-orange-400'
  },
  success: {
    badgeClass: 'bg-green-50 text-green-600 border-green-100',
    barBg: 'bg-[var(--accent)]'
  }
}

export default async function ProductsPage({ searchParams }: Props) {
  const { search = '', page = '1', is_active = '', category_id = '', low_stock = '' } = await searchParams

  const params = new URLSearchParams({ page })
  if (search) params.set('search', search)
  if (is_active !== '') params.set('is_active', is_active)
  if (category_id) params.set('category_id', category_id)
  if (low_stock) params.set('low_stock', low_stock)

  const [productsRes, allProductsRes, categoriesRes, meRes] = await Promise.all([
    apiFetch(`/products?${params}`),
    apiFetch('/products?all=1'),
    apiFetch('/categories?all=1', { optional: true }),
    apiFetch('/auth/me'),
  ])

  const { data: products, meta }: PaginatedResponse<Product> = await productsRes.json()
  const { data: allProducts }: { data: Product[] } = await allProductsRes.json()
  const categories: Category[] = categoriesRes.ok
    ? (await categoriesRes.json()).data ?? []
    : []
  const { data: me } = await meRes.json()
  const perms: string[] = me?.permissions ?? []
  const canCreateProduct = perms.includes('products.create')
  const canEditProduct = perms.includes('products.edit')
  const canCreateStock = perms.includes('stock.create')

  const hasFilters = !!(search || is_active || category_id || low_stock)

  // KPI Calculations based on all active/cached items from api
  const totalItemsCount = allProducts.length
  const activeProductsCount = allProducts.filter(p => p.is_active).length
  const lowStockProductsCount = allProducts.filter(p => p.stock_quantity <= p.min_stock_quantity).length
  const totalStockValue = allProducts.reduce((sum, p) => sum + (parseFloat(p.sale_price) * p.stock_quantity), 0)

  const from = meta.total > 0 ? (meta.current_page - 1) * meta.per_page + 1 : 0
  const to = Math.min(meta.current_page * meta.per_page, meta.total)

  function pageUrl(p: number) {
    const q = new URLSearchParams({ page: String(p) })
    if (search) q.set('search', search)
    if (is_active !== '') q.set('is_active', is_active)
    if (category_id) q.set('category_id', category_id)
    if (low_stock) q.set('low_stock', low_stock)
    return `/products?${q}`
  }

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Breadcrumbs & Title Head */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <nav className="flex items-center gap-2 text-neutral-400 text-[11px] uppercase tracking-widest font-bold">
            <span>Início</span>
            <Icon name="chevron_r" size={10} className="text-neutral-300" />
            <span className="text-[var(--accent)] font-semibold">Produtos</span>
          </nav>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Produtos</h2>
          <p className="text-sm text-neutral-400">{meta.total} produto(s) cadastrado(s)</p>
        </div>
        {canCreateProduct && (
          <Link
            href="/products/new"
            className="btn btn-primary shadow-soft hover:scale-[1.02] active:scale-[0.98] transition-all"
            style={{ height: 40, padding: '0 20px', borderRadius: 10 }}
          >
            <Icon name="plus" size={14} stroke={2.5} />
            Novo Produto
          </Link>
        )}
      </div>

      {/* Bento Grid: KPIs with scroll on Mobile */}
      <div
        className="flex overflow-x-auto gap-4 pb-3 scrollbar-hide md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:pb-0"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {/* KPI 1: Total Products */}
        <div
          className="card min-w-[240px] flex-1 md:min-w-0 bg-white p-5 border border-neutral-100 shadow-soft hover:shadow-md transition-all duration-200"
          style={{ scrollSnapAlign: 'start' }}
        >
          <div className="flex justify-between items-start mb-4">
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total de Produtos</p>
            <span className="w-9 h-9 rounded-lg bg-brand-50 text-[var(--accent)] flex items-center justify-center border border-brand-100">
              <Icon name="inventory" size={18} />
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-neutral-900">{totalItemsCount} itens</h3>
            <p className="text-neutral-400 text-[11px]">Cadastrados no sistema</p>
          </div>
        </div>

        {/* KPI 2: Low Stock */}
        <div
          className={`card min-w-[240px] flex-1 md:min-w-0 bg-white p-5 border shadow-soft hover:shadow-md transition-all duration-200 ${
            lowStockProductsCount > 0 ? 'border-red-200 ring-1 ring-red-500/5' : 'border-neutral-100'
          }`}
          style={{ scrollSnapAlign: 'start' }}
        >
          <div className="flex justify-between items-start mb-4">
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Estoque Baixo</p>
            <span className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
              lowStockProductsCount > 0
                ? 'bg-red-50 text-red-500 border-red-100'
                : 'bg-neutral-50 text-neutral-400 border-neutral-100'
            }`}>
              <Icon name="bell" size={18} />
            </span>
          </div>
          <div className="space-y-2">
            <h3 className={`text-2xl font-black ${lowStockProductsCount > 0 ? 'text-red-600' : 'text-neutral-900'}`}>
              {lowStockProductsCount} itens
            </h3>
            {lowStockProductsCount > 0 && (
              <div className="inline-flex items-center px-2 py-0.5 rounded bg-red-500 text-white text-[10px] font-bold tracking-tighter">
                AÇÃO NECESSÁRIA
              </div>
            )}
          </div>
        </div>

        {/* KPI 3: Active Products */}
        <div
          className="card min-w-[240px] flex-1 md:min-w-0 bg-white p-5 border border-neutral-100 shadow-soft hover:shadow-md transition-all duration-200"
          style={{ scrollSnapAlign: 'start' }}
        >
          <div className="flex justify-between items-start mb-4">
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Produtos Ativos</p>
            <span className="w-9 h-9 rounded-lg bg-green-50 text-green-500 flex items-center justify-center border border-green-100">
              <Icon name="check" size={18} stroke={2.5} />
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-neutral-900">{activeProductsCount} itens</h3>
            <p className="text-neutral-400 text-[11px]">Disponíveis para venda</p>
          </div>
        </div>

        {/* KPI 4: Stock Value */}
        <div
          className="card min-w-[240px] flex-1 md:min-w-0 bg-white p-5 border border-neutral-100 shadow-soft hover:shadow-md transition-all duration-200"
          style={{ scrollSnapAlign: 'start' }}
        >
          <div className="flex justify-between items-start mb-4">
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Valor em Estoque</p>
            <span className="w-9 h-9 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-100">
              <Icon name="finance" size={18} />
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-neutral-900">{formatPrice(String(totalStockValue))}</h3>
            <p className="text-neutral-400 text-[11px] flex items-center gap-1">
              <Icon name="reports" size={12} />
              <span>Valor estimado total</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Card: Filters & List */}
      <div className="card bg-white border border-neutral-100 shadow-soft">
        {/* Filters bar */}
        <form
          method="GET"
          className="p-4 md:p-6 bg-neutral-50/50 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 flex items-center justify-center pointer-events-none">
                <Icon name="search" size={16} />
              </span>
              <input
                name="search"
                type="text"
                defaultValue={search}
                placeholder="Buscar por nome, SKU, barcode ou marca..."
                className="input input-sm pl-10 w-full bg-white border-neutral-200 focus:border-[var(--accent)]"
                style={{ height: 40, borderRadius: 10 }}
              />
            </div>

            <div className="flex flex-wrap md:flex-nowrap items-center gap-4 w-full md:w-auto">
              {categories.length > 0 && (
                <select
                  name="category_id"
                  defaultValue={category_id}
                  className="input input-sm flex-1 md:w-56 bg-white border-neutral-200"
                  style={{ height: 40, borderRadius: 10 }}
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}

              <select
                name="is_active"
                defaultValue={is_active}
                className="input input-sm flex-1 md:w-40 bg-white border-neutral-200"
                style={{ height: 40, borderRadius: 10 }}
              >
                <option value="">Todos Status</option>
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>

              <label className="btn btn-outline flex items-center gap-2 h-[40px] px-4 rounded-[10px] cursor-pointer">
                <input
                  type="checkbox"
                  name="low_stock"
                  value="1"
                  defaultChecked={!!low_stock}
                  style={{ accentColor: 'var(--accent)' }}
                  className="rounded text-[var(--accent)] focus:ring-[var(--accent)] border-neutral-300"
                />
                <span className="text-xs font-semibold text-neutral-600">Estoque baixo</span>
              </label>

              <button
                type="submit"
                className="btn btn-outline h-[40px] px-4 rounded-[10px] flex items-center justify-center gap-2"
              >
                <Icon name="filter" size={14} />
                <span>Filtrar</span>
              </button>
            </div>
          </div>

          {hasFilters && (
            <a
              href="/products"
              className="btn btn-ghost h-[40px] px-4 rounded-[10px] flex items-center justify-center gap-2 text-sm text-neutral-400 self-end md:self-auto"
            >
              <Icon name="x" size={14} />
              <span>Limpar</span>
            </a>
          )}
        </form>

        {/* Products Listing Presentation */}
        {products.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-50 text-neutral-300 flex items-center justify-center mx-auto mb-4 border border-neutral-100">
              <Icon name="inventory" size={20} />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 mb-1">Nenhum produto encontrado</h3>
            <p className="text-xs text-neutral-400">Tente ajustar seus filtros ou cadastrar um novo produto.</p>
          </div>
        ) : (
          <>
            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-neutral-50/50 border-b border-neutral-100">
                  <tr>
                    <th className="px-6 py-4 font-bold text-neutral-400 text-[11px] uppercase tracking-wider">Produto</th>
                    <th className="px-6 py-4 font-bold text-neutral-400 text-[11px] uppercase tracking-wider text-center">Categoria</th>
                    <th className="px-6 py-4 font-bold text-neutral-400 text-[11px] uppercase tracking-wider">Fornecedor</th>
                    <th className="px-6 py-4 font-bold text-neutral-400 text-[11px] uppercase tracking-wider text-right">Preço</th>
                    <th className="px-6 py-4 font-bold text-neutral-400 text-[11px] uppercase tracking-wider">Estoque / Mín.</th>
                    <th className="px-6 py-4 font-bold text-neutral-400 text-[11px] uppercase tracking-wider text-center">Status</th>
                    <th className="px-6 py-4 font-bold text-neutral-400 text-[11px] uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {products.map((p) => {
                    const kind = stockKind(p)
                    const styleInfo = STOCK_STYLES[kind]
                    const pct = p.min_stock_quantity > 0
                      ? Math.min(100, Math.round((p.stock_quantity / p.min_stock_quantity) * 100))
                      : 100
                    return (
                      <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-neutral-50 flex-shrink-0 flex items-center justify-center border border-neutral-200 text-neutral-400">
                              <Icon name="package" size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-neutral-900 leading-tight">{p.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {p.brand && <span className="text-[11px] text-neutral-400">{p.brand}</span>}
                                {p.sku && <span className="mono text-[10px] text-neutral-400 bg-neutral-100 px-1 py-0.5 rounded">SKU: {p.sku}</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center font-medium text-neutral-600">
                          {p.category?.name ?? '—'}
                        </td>
                        <td className="px-6 py-5 font-medium text-neutral-600">
                          {p.supplier?.company_name ?? '—'}
                        </td>
                        <td className="px-6 py-5 text-right font-bold text-neutral-900">
                          {formatPrice(p.sale_price)}
                        </td>
                        <td className="px-6 py-5 w-48">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${styleInfo.badgeClass}`}>
                              {p.stock_quantity}
                            </span>
                            <span className="text-[10px] text-neutral-400">/ {p.min_stock_quantity}</span>
                          </div>
                          <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                            <div className={`${styleInfo.barBg} h-full`} style={{ width: `${pct}%` }}></div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            p.is_active
                              ? 'bg-green-50 text-green-600 border-green-100'
                              : 'bg-neutral-100 text-neutral-400 border-neutral-200'
                          }`}>
                            {p.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right space-x-2 whitespace-nowrap">
                          {canCreateStock && (
                            <Link
                              href={`/stock-movements/new?product_id=${p.id}`}
                              className="text-[11px] font-bold text-neutral-400 hover:text-brand-500 inline-flex items-center gap-1 transition-colors"
                            >
                              <Icon name="plus" size={12} stroke={2.5} />
                              <span>Mov.</span>
                            </Link>
                          )}
                          {canEditProduct && (
                            <Link
                              href={`/products/${p.id}/edit`}
                              className="text-[11px] font-bold text-neutral-400 hover:text-brand-500 inline-flex items-center gap-1 transition-colors"
                            >
                              <Icon name="edit" size={12} stroke={2.5} />
                              <span>Editar</span>
                            </Link>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Cards */}
            <div className="block md:hidden p-4 space-y-4 bg-neutral-50/30">
              {products.map((p) => {
                const kind = stockKind(p)
                const styleInfo = STOCK_STYLES[kind]
                const pct = p.min_stock_quantity > 0
                  ? Math.min(100, Math.round((p.stock_quantity / p.min_stock_quantity) * 100))
                  : 100
                return (
                  <div key={p.id} className="card bg-white p-4 border border-neutral-100 shadow-soft">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-neutral-50 flex items-center justify-center border border-neutral-200 text-neutral-400 shrink-0">
                          <Icon name="package" size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-neutral-900 text-sm leading-snug line-clamp-1">
                            {p.name}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {p.brand && <span className="text-xs text-neutral-400">{p.brand}</span>}
                            {p.sku && <span className="mono text-[9px] text-neutral-400 bg-neutral-100 px-1 py-0.2 rounded">SKU: {p.sku}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          p.is_active
                            ? 'bg-green-50 text-green-600 border-green-100'
                            : 'bg-neutral-100 text-neutral-400 border-neutral-200'
                        }`}>
                          {p.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs border-t border-neutral-100 pt-3 mb-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-neutral-400">Preço de Venda:</span>
                        <span className="font-extrabold text-neutral-900 text-sm">{formatPrice(p.sale_price)}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Categoria:</span>
                        <span className="font-semibold text-neutral-600">{p.category?.name ?? '—'}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-neutral-400">Fornecedor:</span>
                        <span className="font-semibold text-neutral-600">{p.supplier?.company_name ?? '—'}</span>
                      </div>

                      {/* Stock Info with Bar */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-neutral-400">Estoque / Mínimo:</span>
                          <span className="font-bold text-neutral-900">
                            <span className={`px-1.5 py-0.5 rounded font-mono ${styleInfo.badgeClass.replace('border', '')}`}>
                              {p.stock_quantity}
                            </span>
                            <span className="text-neutral-400 font-normal"> / {p.min_stock_quantity}</span>
                          </span>
                        </div>
                        <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                          <div className={`${styleInfo.barBg} h-full`} style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-100/60">
                      {canCreateStock && (
                        <Link
                          href={`/stock-movements/new?product_id=${p.id}`}
                          className="btn btn-outline btn-sm text-xs font-semibold"
                          style={{ height: 32, borderRadius: 8 }}
                        >
                          <Icon name="plus" size={12} stroke={2.5} />
                          <span>Movimentar</span>
                        </Link>
                      )}
                      {canEditProduct && (
                        <Link
                          href={`/products/${p.id}/edit`}
                          className="btn btn-outline btn-sm text-xs font-semibold"
                          style={{ height: 32, borderRadius: 8 }}
                        >
                          <Icon name="edit" size={12} stroke={2.5} />
                          <span>Editar</span>
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Pagination Footer */}
      {meta.last_page > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 px-1">
          <p className="text-xs text-neutral-400">
            Mostrando <span className="font-semibold text-neutral-900">{from}</span> a <span className="font-semibold text-neutral-900">{to}</span> de <span className="font-semibold text-neutral-900">{meta.total}</span> produtos
          </p>

          <div className="flex items-center gap-1.5">
            {meta.current_page > 1 && (
              <Link
                href={pageUrl(meta.current_page - 1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 transition-colors"
                title="Página Anterior"
              >
                <Icon name="chevron_l" size={14} />
              </Link>
            )}

            {Array.from({ length: meta.last_page }).map((_, i) => {
              const p = i + 1
              const isCurrent = p === meta.current_page
              if (meta.last_page > 6 && Math.abs(meta.current_page - p) > 2 && p !== 1 && p !== meta.last_page) {
                if (p === 2 || p === meta.last_page - 1) {
                  return <span key={p} className="px-1.5 text-xs text-neutral-300">...</span>
                }
                return null
              }
              return (
                <Link
                  key={p}
                  href={pageUrl(p)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-[var(--accent)] text-white shadow-sm shadow-[var(--accent)]/10'
                      : 'border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {p}
                </Link>
              )
            })}

            {meta.current_page < meta.last_page && (
              <Link
                href={pageUrl(meta.current_page + 1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 transition-colors"
                title="Próxima Página"
              >
                <Icon name="chevron_r" size={14} />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
