import Link from 'next/link'
import { apiFetch } from '@/app/lib/api'
import { Customer, PaginatedResponse } from '@/app/lib/types'
import { Icon } from '@/app/ui/icons'
import { DeleteCustomerButton } from './delete-button'
import { deleteCustomerAction } from './actions'

interface Props {
  searchParams: Promise<{ search?: string; page?: string; is_active?: string }>
}

function formatDocument(doc: string | null, type: 'individual' | 'company') {
  if (!doc) return '—'
  const clean = doc.replace(/\D/g, '')
  if (type === 'individual' && clean.length === 11)
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  if (type === 'company' && clean.length === 14)
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  return doc
}

// Cores determinísticas para o avatar com iniciais
const AVATAR_COLORS = [
  { bg: 'var(--accent-soft)',   color: 'var(--accent)' },
  { bg: 'var(--warning-soft)',  color: 'var(--warning)' },
  { bg: 'var(--success-soft)',  color: 'var(--success)' },
  { bg: 'var(--danger-soft)',   color: 'var(--danger)' },
  { bg: 'oklch(0.93 0.05 280 / 0.5)', color: 'oklch(0.42 0.12 280)' },
]

function getAvatarColor(name: string) {
  if (!name) return AVATAR_COLORS[0]
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export default async function CustomersPage({ searchParams }: Props) {
  const { search = '', page = '1', is_active = '' } = await searchParams

  const params = new URLSearchParams({ page })
  if (search) params.set('search', search)
  if (is_active !== '') params.set('is_active', is_active)

  const [res, activeRes, inactiveRes, meRes] = await Promise.all([
    apiFetch(`/customers?${params}`),
    apiFetch('/customers?is_active=true&page=1'),
    apiFetch('/customers?is_active=false&page=1'),
    apiFetch('/auth/me'),
  ])

  const { data: customers, meta }: PaginatedResponse<Customer> = await res.json()
  const { meta: activeMeta }: PaginatedResponse<Customer> = await activeRes.json()
  const { meta: inactiveMeta }: PaginatedResponse<Customer> = await inactiveRes.json()
  const { data: me } = await meRes.json()
  const perms: string[] = me?.permissions ?? []
  const canCreate = perms.includes('customers.create')
  const canEdit = perms.includes('customers.edit')
  const canDelete = perms.includes('customers.delete')

  const from = meta.total > 0 ? (meta.current_page - 1) * meta.per_page + 1 : 0
  const to = Math.min(meta.current_page * meta.per_page, meta.total)

  function pageUrl(p: number) {
    const q = new URLSearchParams({ page: String(p) })
    if (search) q.set('search', search)
    if (is_active !== '') q.set('is_active', is_active)
    return `/customers?${q}`
  }

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <nav className="flex items-center gap-2 text-[var(--text-muted)] text-[11px] uppercase tracking-widest font-bold">
            <span>Cadastros</span>
            <Icon name="chevron_r" size={10} className="text-[var(--text-faint)]" />
            <span className="text-[var(--accent)]">Clientes</span>
          </nav>
          <h2 className="text-3xl font-extrabold text-[var(--text)] tracking-tight">Clientes</h2>
        </div>
        {canCreate && (
          <Link
            href="/customers/new"
            className="btn btn-primary shadow-lg shadow-[var(--accent)]/15 hover:scale-[1.02] active:scale-[0.98] transition-all"
            style={{ height: 40, padding: '0 20px', borderRadius: 10 }}
          >
            <Icon name="plus" size={14} stroke={2.5} />
            Novo Cliente
          </Link>
        )}
      </div>

      {/* Bento KPIs Grid: Horizontal Scroll on Mobile, Grid on Desktop */}
      <div
        className="flex overflow-x-auto gap-4 pb-3 scrollbar-hide md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:pb-0"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {/* Card 1: Total de Clientes */}
        <div
          className="card min-w-[240px] flex-1 md:min-w-0 hover:shadow-md transition-all duration-250 bg-[var(--surface)]"
          style={{ padding: 20, scrollSnapAlign: 'start' }}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
              <Icon name="customers" size={20} />
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/10">
              Geral
            </span>
          </div>
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">
            Total de Clientes
          </p>
          <h3 className="text-2xl font-black text-[var(--text)] tracking-tight">
            {meta.total}
          </h3>
        </div>

        {/* Card 2: Ativos */}
        <div
          className="card min-w-[240px] flex-1 md:min-w-0 hover:shadow-md transition-all duration-250 bg-[var(--surface)]"
          style={{ padding: 20, scrollSnapAlign: 'start' }}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--success-soft)] text-[var(--success)] flex items-center justify-center">
              <Icon name="check" size={20} />
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[var(--success-soft)] text-[var(--success)] border border-[var(--success)]/10">
              {meta.total > 0 ? Math.round((activeMeta.total / meta.total) * 100) : 0}% operacional
            </span>
          </div>
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">
            Clientes Ativos
          </p>
          <h3 className="text-2xl font-black text-[var(--text)] tracking-tight">
            {activeMeta.total}
          </h3>
        </div>

        {/* Card 3: Inativos */}
        <div
          className="card min-w-[240px] flex-1 md:min-w-0 hover:shadow-md transition-all duration-250 bg-[var(--surface)]"
          style={{ padding: 20, scrollSnapAlign: 'start' }}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--danger-soft)] text-[var(--danger)] flex items-center justify-center">
              <Icon name="x" size={20} />
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[var(--danger-soft)] text-[var(--danger)] border border-[var(--danger)]/10">
              Inatividade
            </span>
          </div>
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">
            Clientes Inativos
          </p>
          <h3 className="text-2xl font-black text-[var(--text)] tracking-tight">
            {inactiveMeta.total}
          </h3>
        </div>

        {/* Card 4: Dica de Cadastro */}
        <div
          className="card min-w-[280px] flex-[1.5] md:min-w-0 relative overflow-hidden"
          style={{
            padding: 20,
            scrollSnapAlign: 'start',
            background: 'linear-gradient(135deg, var(--accent) 0%, oklch(0.38 0.12 252) 100%)',
            color: 'var(--accent-ink)',
          }}
        >
          <div className="relative z-10">
            <h4 className="text-sm font-extrabold tracking-tight mb-1" style={{ color: 'var(--accent-ink)' }}>
              Gestão de Relacionamento
            </h4>
            <p className="text-xs opacity-90 leading-relaxed" style={{ color: 'var(--accent-ink)' }}>
              Mantenha os dados cadastrais (CPF/CNPJ e e-mail) completos para garantir a agilidade nas vendas e emissão de notas fiscais.
            </p>
          </div>
          <div className="absolute right-[-15px] bottom-[-15px] opacity-10 pointer-events-none">
            <Icon name="customers" size={100} />
          </div>
        </div>
      </div>

      {/* Main Grid: Filters & Listing */}
      <div className="card">
        {/* Filters Header (Stacked on mobile, row on desktop) */}
        <form
          method="GET"
          className="p-4 md:p-6 bg-[var(--surface-2)]/30 border-b border-[var(--border-soft)] flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] flex items-center justify-center pointer-events-none">
                <Icon name="search" size={16} />
              </span>
              <input
                name="search"
                type="text"
                defaultValue={search}
                placeholder="Buscar por nome, documento ou email..."
                className="input input-sm pl-10 w-full bg-[var(--surface)] border-[var(--border)] focus:border-[var(--accent)]"
                style={{ height: 40, borderRadius: 10 }}
              />
            </div>

            <div className="flex flex-row gap-4 w-full md:w-auto">
              <select
                name="is_active"
                defaultValue={is_active}
                className="input input-sm flex-1 md:w-48 bg-[var(--surface)] border-[var(--border)] focus:border-[var(--accent)]"
                style={{ height: 40, borderRadius: 10 }}
              >
                <option value="">Todos os Status</option>
                <option value="true">Ativos</option>
                <option value="false">Inativos</option>
              </select>

              <button
                type="submit"
                className="btn btn-outline h-[40px] px-4 rounded-[10px] flex items-center justify-center gap-2"
              >
                <Icon name="filter" size={14} />
                <span>Filtrar</span>
              </button>
            </div>
          </div>

          {(search || is_active) && (
            <a
              href="/customers"
              className="btn btn-ghost h-[40px] px-4 rounded-[10px] flex items-center justify-center gap-2 text-sm text-[var(--text-muted)] self-end md:self-auto"
            >
              <Icon name="x" size={14} />
              <span>Limpar</span>
            </a>
          )}
        </form>

        {/* Customers Presentation */}
        {customers.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] text-[var(--text-faint)] flex items-center justify-center mx-auto mb-4">
              <Icon name="customers" size={24} />
            </div>
            <h3 className="text-sm font-bold text-[var(--text)] mb-1">Nenhum cliente encontrado</h3>
            <p className="text-xs text-[var(--text-muted)]">Tente ajustar seus filtros ou cadastrar um novo cliente.</p>
          </div>
        ) : (
          <>
            {/* Desktop View: Table (Hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="t-table w-full">
                <thead>
                  <tr className="border-b border-[var(--border-soft)]">
                    <th>Nome</th>
                    <th>Tipo</th>
                    <th>Documento</th>
                    <th>Telefone</th>
                    <th>Cidade / UF</th>
                    <th className="text-center">Status</th>
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-soft)]/50">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-[var(--surface-hover)]/30 transition-colors">
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[var(--text)]">{customer.name}</span>
                          <span className="text-[10px] text-[var(--text-faint)] font-mono mt-0.5">ID: {customer.id.slice(0, 8)}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${customer.type === 'company' ? 'badge-info' : 'badge-accent'}`}>
                          {customer.type === 'individual' ? 'PF' : 'PJ'}
                        </span>
                      </td>
                      <td className="mono text-xs text-[var(--text-soft)]">
                        {formatDocument(customer.document, customer.type)}
                      </td>
                      <td className="mono text-xs text-[var(--text-soft)]">{customer.phone ?? '—'}</td>
                      <td className="text-[var(--text-soft)] text-sm">
                        {customer.city && customer.state ? `${customer.city} / ${customer.state}` : customer.city ?? '—'}
                      </td>
                      <td className="text-center">
                        <span className={`badge ${customer.is_active ? 'badge-success' : 'bg-[var(--border)] text-[var(--text-soft)] border-transparent'}`} style={{ height: 22, fontSize: 10, padding: '0 8px' }}>
                          {customer.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canEdit && (
                            <Link
                              href={`/customers/${customer.id}/edit`}
                              className="w-8 h-8 rounded-lg text-[var(--text-soft)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] flex items-center justify-center transition-colors"
                              title="Editar"
                            >
                              <Icon name="edit" size={14} />
                            </Link>
                          )}
                          {canDelete && (
                            <DeleteCustomerButton
                              action={deleteCustomerAction.bind(null, customer.id)}
                              className="inline-block"
                            >
                              <button
                                type="submit"
                                className="w-8 h-8 rounded-lg text-[var(--text-soft)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] flex items-center justify-center transition-colors"
                                title="Excluir"
                              >
                                <Icon name="trash" size={14} />
                              </button>
                            </DeleteCustomerButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Cards (Hidden on desktop) */}
            <div className="block md:hidden p-4 space-y-4 bg-[var(--surface-2)]/10">
              {customers.map((customer) => {
                const color = getAvatarColor(customer.name)
                return (
                  <div key={customer.id} className="card p-4 hover:shadow-sm transition-all bg-[var(--surface)] border border-[var(--border-soft)]">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                          style={{ backgroundColor: color.bg, color: color.color }}
                        >
                          {getInitials(customer.name)}
                        </div>
                        <div>
                          <h4 className="font-bold text-[var(--text)] text-sm leading-snug line-clamp-1">
                            {customer.name}
                          </h4>
                          {customer.trade_name && (
                            <p className="text-xs text-[var(--text-muted)] line-clamp-1 mt-0.5">{customer.trade_name}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`badge ${customer.type === 'company' ? 'badge-info' : 'badge-accent'}`} style={{ height: 18, fontSize: 8, padding: '0 5px' }}>
                          {customer.type === 'individual' ? 'PF' : 'PJ'}
                        </span>
                        <span className={`badge ${customer.is_active ? 'badge-success' : 'bg-[var(--border)] text-[var(--text-soft)] border-transparent'}`} style={{ height: 18, fontSize: 8, padding: '0 5px' }}>
                          {customer.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs border-t border-[var(--border-soft)] pt-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Código:</span>
                        <span className="font-mono font-semibold text-[var(--text-soft)]">#{customer.id.slice(0, 8).toUpperCase()}</span>
                      </div>
                      {customer.document && (
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">{customer.type === 'individual' ? 'CPF' : 'CNPJ'}:</span>
                          <span className="font-mono text-[var(--text-soft)]">{formatDocument(customer.document, customer.type)}</span>
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">Telefone:</span>
                          <a href={`tel:${customer.phone.replace(/\D/g, '')}`} className="font-mono text-[var(--accent)] hover:underline">
                            {customer.phone}
                          </a>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Localização:</span>
                        <span className="text-[var(--text-soft)] text-right">
                          {customer.city && customer.state ? `${customer.city} / ${customer.state}` : customer.city ?? '—'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--border-soft)]/50">
                      {canEdit && (
                        <Link
                          href={`/customers/${customer.id}/edit`}
                          className="btn btn-outline btn-sm text-xs font-semibold"
                          style={{ height: 32, borderRadius: 8 }}
                        >
                          <Icon name="edit" size={12} />
                          <span>Editar</span>
                        </Link>
                      )}
                      {canDelete && (
                        <DeleteCustomerButton
                          action={deleteCustomerAction.bind(null, customer.id)}
                        >
                          <button
                            type="submit"
                            className="btn btn-danger-outline btn-sm text-xs font-semibold text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                            style={{ height: 32, borderRadius: 8 }}
                          >
                            <Icon name="trash" size={12} />
                            <span>Excluir</span>
                          </button>
                        </DeleteCustomerButton>
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
          <p className="text-xs text-[var(--text-muted)]">
            Mostrando <span className="font-semibold text-[var(--text-soft)]">{from}</span> a <span className="font-semibold text-[var(--text-soft)]">{to}</span> de <span className="font-semibold text-[var(--text-soft)]">{meta.total}</span> clientes
          </p>

          <div className="flex items-center gap-1.5">
            {meta.current_page > 1 && (
              <Link
                href={pageUrl(meta.current_page - 1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-soft)] hover:bg-[var(--surface-hover)] transition-colors"
                title="Página Anterior"
              >
                <Icon name="chevron_l" size={14} />
              </Link>
            )}

            {Array.from({ length: meta.last_page }).map((_, i) => {
              const p = i + 1
              const isCurrent = p === meta.current_page
              // Exibe apenas páginas próximas à atual
              if (meta.last_page > 6 && Math.abs(meta.current_page - p) > 2 && p !== 1 && p !== meta.last_page) {
                if (p === 2 || p === meta.last_page - 1) {
                  return <span key={p} className="px-1.5 text-xs text-[var(--text-faint)]">...</span>
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
                      : 'border border-[var(--border)] text-[var(--text-soft)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  {p}
                </Link>
              )
            })}

            {meta.current_page < meta.last_page && (
              <Link
                href={pageUrl(meta.current_page + 1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-soft)] hover:bg-[var(--surface-hover)] transition-colors"
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
