import Link from 'next/link'
import { apiFetch } from '@/app/lib/api'
import { Category, PaginatedResponse, Product } from '@/app/lib/types'

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

export default async function ProductsPage({ searchParams }: Props) {
  const {
    search = '',
    page = '1',
    is_active = '',
    category_id = '',
    low_stock = '',
  } = await searchParams

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
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Produtos</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{meta.total} produto(s) cadastrado(s)</p>
        </div>
        <Link
          href="/products/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          + Novo produto
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3 mb-6">
        <input
          name="search"
          type="text"
          defaultValue={search}
          placeholder="Buscar por nome, SKU, código de barras ou marca..."
          className="flex-1 min-w-48 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <select
          name="category_id"
          defaultValue={category_id}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          name="is_active"
          defaultValue={is_active}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
        <label className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 cursor-pointer">
          <input
            type="checkbox"
            name="low_stock"
            value="1"
            defaultChecked={!!low_stock}
            className="rounded"
          />
          Estoque baixo
        </label>
        <button
          type="submit"
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          Filtrar
        </button>
        {hasFilters && (
          <a
            href="/products"
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-50 transition-colors"
          >
            Limpar
          </a>
        )}
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {products.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-zinc-500">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Produto</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Categoria</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Fornecedor</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide text-right">Preço de venda</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide text-right">Estoque</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900">{product.name}</p>
                    {product.brand && (
                      <p className="text-xs text-zinc-400">{product.brand}</p>
                    )}
                    {product.sku && (
                      <p className="text-xs font-mono text-zinc-400">SKU: {product.sku}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {product.category?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {product.supplier?.company_name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-zinc-900">
                    {formatPrice(product.sale_price)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={product.is_low_stock ? 'text-red-600 font-semibold' : 'text-zinc-900'}>
                      {product.stock_quantity}
                    </span>
                    {product.is_low_stock && (
                      <span className="ml-1.5 inline-flex items-center rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-700">
                        baixo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        product.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-zinc-100 text-zinc-500'
                      }`}
                    >
                      {product.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/products/${product.id}/edit`}
                      className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-zinc-500">
            Página {meta.current_page} de {meta.last_page}
          </p>
          <div className="flex gap-2">
            {meta.current_page > 1 && (
              <PaginationLink
                page={meta.current_page - 1}
                search={search}
                isActive={is_active}
                categoryId={category_id}
                lowStock={low_stock}
                label="← Anterior"
              />
            )}
            {meta.current_page < meta.last_page && (
              <PaginationLink
                page={meta.current_page + 1}
                search={search}
                isActive={is_active}
                categoryId={category_id}
                lowStock={low_stock}
                label="Próxima →"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function PaginationLink({
  page,
  search,
  isActive,
  categoryId,
  lowStock,
  label,
}: {
  page: number
  search: string
  isActive: string
  categoryId: string
  lowStock: string
  label: string
}) {
  const params = new URLSearchParams({ page: String(page) })
  if (search) params.set('search', search)
  if (isActive !== '') params.set('is_active', isActive)
  if (categoryId) params.set('category_id', categoryId)
  if (lowStock) params.set('low_stock', lowStock)

  return (
    <Link
      href={`/products?${params}`}
      className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
    >
      {label}
    </Link>
  )
}
