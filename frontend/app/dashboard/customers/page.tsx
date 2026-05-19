import Link from 'next/link'
import { apiFetch } from '@/app/lib/api'
import { Customer, PaginatedResponse } from '@/app/lib/types'

interface Props {
  searchParams: Promise<{ search?: string; page?: string; is_active?: string }>
}

function formatDocument(doc: string | null, type: 'individual' | 'company') {
  if (!doc) return '—'
  if (type === 'individual' && doc.length === 11)
    return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  if (type === 'company' && doc.length === 14)
    return doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  return doc
}

export default async function CustomersPage({ searchParams }: Props) {
  const { search = '', page = '1', is_active = '' } = await searchParams

  const params = new URLSearchParams({ page })
  if (search) params.set('search', search)
  if (is_active !== '') params.set('is_active', is_active)

  const res = await apiFetch(`/customers?${params}`)
  const { data: customers, meta }: PaginatedResponse<Customer> = await res.json()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Clientes</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{meta.total} clientes cadastrados</p>
        </div>
        <Link
          href="/dashboard/customers/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          + Novo cliente
        </Link>
      </div>

      {/* Filtros */}
      <form method="GET" className="flex gap-3 mb-6">
        <input
          name="search"
          type="text"
          defaultValue={search}
          placeholder="Buscar por nome, documento ou e-mail..."
          className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <select
          name="is_active"
          defaultValue={is_active}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
        <button
          type="submit"
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          Buscar
        </button>
        {(search || is_active) && (
          <a
            href="/dashboard/customers"
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-50 transition-colors"
          >
            Limpar
          </a>
        )}
      </form>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {customers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-zinc-500">Nenhum cliente encontrado.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Nome</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Tipo</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Documento</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Telefone</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Cidade/UF</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900">{customer.name}</p>
                    {customer.trade_name && (
                      <p className="text-xs text-zinc-400">{customer.trade_name}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {customer.type === 'individual' ? 'PF' : 'PJ'}
                  </td>
                  <td className="px-4 py-3 font-mono text-zinc-600 text-xs">
                    {formatDocument(customer.document, customer.type)}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{customer.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {customer.city && customer.state
                      ? `${customer.city} / ${customer.state}`
                      : customer.city ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        customer.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-zinc-100 text-zinc-500'
                      }`}
                    >
                      {customer.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/customers/${customer.id}/edit`}
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

      {/* Paginação */}
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
                label="← Anterior"
              />
            )}
            {meta.current_page < meta.last_page && (
              <PaginationLink
                page={meta.current_page + 1}
                search={search}
                isActive={is_active}
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
  label,
}: {
  page: number
  search: string
  isActive: string
  label: string
}) {
  const params = new URLSearchParams({ page: String(page) })
  if (search) params.set('search', search)
  if (isActive !== '') params.set('is_active', isActive)

  return (
    <Link
      href={`/dashboard/customers?${params}`}
      className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
    >
      {label}
    </Link>
  )
}
