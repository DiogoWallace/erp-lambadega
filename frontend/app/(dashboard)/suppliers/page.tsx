import Link from 'next/link'
import { apiFetch } from '@/app/lib/api'
import { Supplier, PaginatedResponse } from '@/app/lib/types'

interface Props {
  searchParams: Promise<{ search?: string; page?: string; is_active?: string }>
}

function formatCnpj(cnpj: string | null): string {
  if (!cnpj) return '—'
  const digits = cnpj.replace(/\D/g, '')
  if (digits.length === 14)
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  return cnpj
}

export default async function SuppliersPage({ searchParams }: Props) {
  const { search = '', page = '1', is_active = '' } = await searchParams

  const params = new URLSearchParams({ page })
  if (search) params.set('search', search)
  if (is_active !== '') params.set('is_active', is_active)

  const res = await apiFetch(`/suppliers?${params}`)
  const { data: suppliers, meta }: PaginatedResponse<Supplier> = await res.json()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Suppliers</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{meta.total} suppliers registered</p>
        </div>
        <Link
          href="/suppliers/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          + New supplier
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex gap-3 mb-6">
        <input
          name="search"
          type="text"
          defaultValue={search}
          placeholder="Search by name, CNPJ, contact or email..."
          className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <select
          name="is_active"
          defaultValue={is_active}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          <option value="">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button
          type="submit"
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          Search
        </button>
        {(search || is_active) && (
          <a
            href="/suppliers"
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-50 transition-colors"
          >
            Clear
          </a>
        )}
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {suppliers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-zinc-500">No suppliers found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Company</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">CNPJ</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Contact</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Phone</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">City / State</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900">{supplier.company_name}</p>
                    {supplier.trade_name && (
                      <p className="text-xs text-zinc-400">{supplier.trade_name}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-zinc-600 text-xs">
                    {formatCnpj(supplier.cnpj)}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{supplier.contact_name ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-500">{supplier.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {supplier.city && supplier.state
                      ? `${supplier.city} / ${supplier.state}`
                      : supplier.city ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        supplier.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-zinc-100 text-zinc-500'
                      }`}
                    >
                      {supplier.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/suppliers/${supplier.id}/edit`}
                      className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      Edit
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
            Page {meta.current_page} of {meta.last_page}
          </p>
          <div className="flex gap-2">
            {meta.current_page > 1 && (
              <PaginationLink page={meta.current_page - 1} search={search} isActive={is_active} label="← Previous" />
            )}
            {meta.current_page < meta.last_page && (
              <PaginationLink page={meta.current_page + 1} search={search} isActive={is_active} label="Next →" />
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
      href={`/suppliers?${params}`}
      className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
    >
      {label}
    </Link>
  )
}
