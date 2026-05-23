import Link from 'next/link'
import { apiFetch } from '@/app/lib/api'
import { Customer, PaginatedResponse } from '@/app/lib/types'
import { Icon } from '@/app/ui/icon'

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
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">{meta.total} cliente(s) cadastrado(s)</p>
        </div>
        <Link href="/customers/new" className="btn btn-primary btn-sm">
          <Icon name="plus" size={13} stroke={2} /> Novo cliente
        </Link>
      </div>

      <form method="GET" style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          name="search"
          type="text"
          defaultValue={search}
          placeholder="Buscar por nome, documento ou email..."
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
          <a href="/customers" className="btn btn-ghost btn-sm"><Icon name="x" size={12} /> Limpar</a>
        )}
      </form>

      <div className="card">
        {customers.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nenhum cliente encontrado.</p>
          </div>
        ) : (
          <table className="t-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Documento</th>
                <th>Telefone</th>
                <th>Cidade / UF</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text)' }}>{customer.name}</div>
                    {customer.trade_name && (
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>{customer.trade_name}</div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${customer.type === 'company' ? 'badge-info' : 'badge-accent'}`}>
                      {customer.type === 'individual' ? 'PF' : 'PJ'}
                    </span>
                  </td>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--text-soft)' }}>
                    {formatDocument(customer.document, customer.type)}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{customer.phone ?? '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {customer.city && customer.state ? `${customer.city} / ${customer.state}` : customer.city ?? '—'}
                  </td>
                  <td>
                    <span className={`badge ${customer.is_active ? 'badge-success' : ''}`}>
                      {customer.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link href={`/customers/${customer.id}/edit`} className="btn btn-ghost btn-sm">
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
  return <Link href={`/customers?${params}`} className="btn btn-outline btn-sm">{label}</Link>
}
