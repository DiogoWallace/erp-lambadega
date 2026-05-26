import Link from 'next/link'
import { apiFetch } from '@/app/lib/api'
import { FinancialTransaction, FinancialStatus, PaginatedResponse } from '@/app/lib/types'
import { Icon } from '@/app/ui/icons'
import { payTransactionAction } from './actions'
import { PayTransactionButton } from './pay-button'

interface Props {
  searchParams: Promise<{ search?: string; page?: string; type?: string; status?: string }>
}

const STATUS_STYLE: Record<FinancialStatus, { bg: string; color: string; label: string }> = {
  pending:  { bg: 'var(--warning-soft)',  color: 'var(--warning)',  label: 'Pendente'  },
  paid:     { bg: 'var(--success-soft)',  color: 'var(--success)',  label: 'Pago'      },
  overdue:  { bg: 'var(--danger-soft)',   color: 'var(--danger)',   label: 'Atrasado'  },
  canceled: { bg: 'var(--surface-2)',     color: 'var(--text-muted)', label: 'Cancelado' },
}

function formatBRL(value: string): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))
}

function formatDate(date: string | null): string {
  if (!date) return '—'
  const [y, m, d] = date.split('-')
  return `${d}/${m}/${y}`
}

export default async function FinancePage({ searchParams }: Props) {
  const { search = '', page = '1', type = '', status = '' } = await searchParams

  const params = new URLSearchParams({ page })
  if (search) params.set('search', search)
  if (type) params.set('type', type)
  if (status) params.set('status', status)

  const [res, meRes] = await Promise.all([
    apiFetch(`/financial-transactions?${params}`),
    apiFetch('/auth/me'),
  ])
  const { data: transactions, meta }: PaginatedResponse<FinancialTransaction> = await res.json()
  const { data: me } = await meRes.json()
  const perms: string[] = me?.permissions ?? []
  const canCreate = perms.includes('finance.create')
  const canEdit = perms.includes('finance.edit')

  // KPI calculations
  const totalReceivable = transactions
    .filter(t => t.type === 'income' && t.status !== 'canceled')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const totalPayable = transactions
    .filter(t => t.type === 'expense' && t.status !== 'canceled')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const balance = totalReceivable - totalPayable

  const hasFilters = !!(search || type || status)

  function pageUrl(p: number) {
    const q = new URLSearchParams({ page: String(p) })
    if (search) q.set('search', search)
    if (type) q.set('type', type)
    if (status) q.set('status', status)
    return `/finance?${q}`
  }

  return (
    <div className="page flex flex-col gap-6 w-full max-w-[1200px] mx-auto">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-headline-lg font-headline-lg text-text">Gestão Financeira</h1>
          <p className="page-subtitle text-body-sm text-text-muted mt-1.5">
            {meta.total} lançamento(s) · contas a pagar e receber
          </p>
        </div>
        {canCreate && (
          <Link
            href="/finance/new"
            className="btn btn-primary px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-bold w-full sm:w-auto self-stretch sm:self-auto text-center active:scale-95 transition-all shadow-sm"
          >
            <Icon name="plus" size={16} stroke={2.5} />
            Nova Transação
          </Link>
        )}
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* A Receber */}
        <div className="card bg-surface border border-border-soft rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              A Receber
            </span>
            <div className="p-2 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
              <Icon name="trend_up" size={18} />
            </div>
          </div>
          <h2 className="text-headline-lg font-bold text-text mb-2 font-headline-lg tracking-tight">
            {formatBRL(String(totalReceivable))}
          </h2>
          <div className="flex items-center gap-1.5 text-body-sm text-text-soft">
            <span className="text-accent font-bold">
              {transactions.filter(t => t.type === 'income').length} entrada(s)
            </span>
            <span className="text-text-faint">nesta página</span>
          </div>
        </div>

        {/* A Pagar */}
        <div className="card bg-surface border border-border-soft rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              A Pagar
            </span>
            <div className="p-2 rounded-lg bg-danger-soft text-danger flex items-center justify-center">
              <Icon name="trend_dn" size={18} />
            </div>
          </div>
          <h2 className="text-headline-lg font-bold text-text mb-2 font-headline-lg tracking-tight">
            {formatBRL(String(totalPayable))}
          </h2>
          <div className="flex items-center gap-1.5 text-body-sm text-text-soft">
            <span className="text-danger font-bold">
              {transactions.filter(t => t.type === 'expense').length} saída(s)
            </span>
            <span className="text-text-faint">nesta página</span>
          </div>
        </div>

        {/* Saldo Previsto — card destaque */}
        <div
          className="rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          style={{
            background: 'linear-gradient(135deg, oklch(0.40 0.13 280), oklch(0.32 0.14 268))',
            boxShadow: '0 8px 24px -4px oklch(0.40 0.13 280 / 0.35)',
          }}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-white/70 uppercase tracking-wider">
              Saldo Previsto
            </span>
            <div className="p-2 rounded-lg bg-white/20 text-white flex items-center justify-center">
              <Icon name="finance" size={18} />
            </div>
          </div>
          <h2 className="text-headline-lg font-bold text-white mb-2 font-headline-lg tracking-tight">
            {formatBRL(String(balance))}
          </h2>
          <div className="text-body-sm text-white/80 font-medium">
            {balance >= 0 ? '✓ Fluxo de caixa saudável' : '⚠ Atenção: saldo negativo'}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="card bg-surface border border-border-soft rounded-lg p-5 shadow-sm">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end">
          {/* Busca */}
          <div className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2">
            <label className="block text-xs font-bold text-text-soft uppercase tracking-wider mb-2">
              Buscar Lançamento
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint flex items-center">
                <Icon name="search" size={16} />
              </span>
              <input
                name="search"
                type="text"
                defaultValue={search}
                placeholder="Descrição, cliente ou documento..."
                className="w-full bg-bg-soft border border-border-soft rounded-lg pl-10 pr-4 py-2 text-body-md transition-all focus:bg-surface"
              />
            </div>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-xs font-bold text-text-soft uppercase tracking-wider mb-2">
              Tipo
            </label>
            <select
              name="type"
              defaultValue={type}
              className="w-full bg-bg-soft border border-border-soft rounded-lg px-3 py-2 text-body-md transition-all focus:bg-surface"
            >
              <option value="">Todos os tipos</option>
              <option value="income">Entradas</option>
              <option value="expense">Saídas</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-text-soft uppercase tracking-wider mb-2">
              Status
            </label>
            <select
              name="status"
              defaultValue={status}
              className="w-full bg-bg-soft border border-border-soft rounded-lg px-3 py-2 text-body-md transition-all focus:bg-surface"
            >
              <option value="">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="overdue">Atrasado</option>
              <option value="canceled">Cancelado</option>
            </select>
          </div>

          {/* Ações */}
          <div className="flex gap-2 w-full lg:col-span-1">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-body-md shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Icon name="filter" size={14} />
              Filtrar
            </button>
            {hasFilters && (
              <a
                href="/finance"
                className="px-4 py-2 border border-border-strong text-text-soft rounded-lg font-bold text-body-md hover:bg-surface-hover transition-colors flex items-center justify-center gap-2 active:scale-95"
              >
                <Icon name="x" size={14} />
                Limpar
              </a>
            )}
          </div>
        </form>
      </div>

      {/* Transactions Container */}
      <div className="card bg-surface border border-border-soft rounded-lg shadow-sm overflow-hidden">
        {transactions.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="text-text-faint mb-3 flex justify-center">
              <Icon name="finance" size={40} />
            </div>
            <p className="text-body-md text-text-muted font-medium">Nenhum lançamento encontrado.</p>
            {hasFilters && (
              <a
                href="/finance"
                className="inline-block mt-3 text-body-sm text-primary font-bold hover:underline"
              >
                Limpar filtros
              </a>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-surface-2 border-b border-border text-left">
                    {['TIPO', 'DESCRIÇÃO', 'CLIENTE / FORNECEDOR', 'VALOR', 'VENCIMENTO', 'STATUS', 'AÇÕES'].map((h) => (
                      <th
                        key={h}
                        className={`p-3 px-4 text-xs font-bold text-text-muted uppercase tracking-wider ${
                          (h === 'VALOR' || h === 'AÇÕES') ? 'text-right' : 'text-left'
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, idx) => {
                    const isIncome = tx.type === 'income'
                    const link = tx.supplier?.company_name ?? tx.customer?.name ?? (tx.order ? `Venda ${tx.order.order_number}` : '—')
                    const canPay = tx.status === 'pending' || tx.status === 'overdue'
                    const stStyle = STATUS_STYLE[tx.status]
                    const isOverdue = tx.status === 'overdue'

                    return (
                      <tr
                        key={tx.id}
                        className={`border-b hover:bg-surface-hover transition-colors ${
                          idx === transactions.length - 1 ? 'border-b-0' : 'border-border-soft'
                        }`}
                      >
                        {/* Tipo */}
                        <td className="p-4 py-3.5 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 font-bold text-xs ${
                            isIncome ? 'text-accent' : 'text-danger'
                          }`}>
                            <Icon name={isIncome ? 'trend_up' : 'trend_dn'} size={15} stroke={2} />
                            {isIncome ? 'Entrada' : 'Saída'}
                          </span>
                        </td>

                        {/* Descrição */}
                        <td className="p-4 py-3.5 max-w-xs">
                          <div className="font-bold text-body-md text-text truncate">
                            {tx.description}
                          </div>
                          {tx.installment_count && (
                            <div className="text-xs text-text-muted mt-0.5">
                              Parcela {tx.installment_number}/{tx.installment_count}
                            </div>
                          )}
                        </td>

                        {/* Cliente / Fornecedor */}
                        <td className="p-4 py-3.5 text-body-md text-text-soft">
                          {link}
                        </td>

                        {/* Valor */}
                        <td className="p-4 py-3.5 text-right whitespace-nowrap">
                          <span className={`font-mono text-body-md font-bold ${
                            isIncome ? 'text-success' : 'text-danger'
                          }`}>
                            {isIncome ? '+' : '−'} {formatBRL(tx.amount)}
                          </span>
                        </td>

                        {/* Vencimento */}
                        <td className="p-4 py-3.5 whitespace-nowrap">
                          <span className={`font-mono text-body-sm font-semibold ${
                            isOverdue ? 'text-danger font-bold' : 'text-text-soft'
                          }`}>
                            {formatDate(tx.due_date)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="p-4 py-3.5 whitespace-nowrap">
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                            style={{ background: stStyle.bg, color: stStyle.color }}
                          >
                            {stStyle.label}
                          </span>
                        </td>

                        {/* Ações */}
                        <td className="p-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            {canPay && canEdit && (
                              <PayTransactionButton action={payTransactionAction.bind(null, tx.id)} />
                            )}
                            {canEdit && (
                              <Link
                                href={`/finance/${tx.id}/edit`}
                                className="px-2.5 py-1 rounded border border-border text-text-soft hover:bg-surface-hover transition-colors font-bold text-xs flex items-center gap-1 active:scale-95"
                              >
                                <Icon name="edit" size={11} />
                                Editar
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card List View */}
            <div className="block md:hidden divide-y divide-border-soft">
              {transactions.map((tx) => {
                const isIncome = tx.type === 'income'
                const link = tx.supplier?.company_name ?? tx.customer?.name ?? (tx.order ? `Venda ${tx.order.order_number}` : '—')
                const canPay = tx.status === 'pending' || tx.status === 'overdue'
                const stStyle = STATUS_STYLE[tx.status]
                const isOverdue = tx.status === 'overdue'

                return (
                  <div key={tx.id} className="p-4 flex flex-col gap-3 bg-surface hover:bg-bg-soft transition-colors">
                    {/* Card Top Row */}
                    <div className="flex justify-between items-center">
                      <span className={`inline-flex items-center gap-1.5 font-bold text-xs ${
                        isIncome ? 'text-accent' : 'text-danger'
                      }`}>
                        <Icon name={isIncome ? 'trend_up' : 'trend_dn'} size={14} stroke={2} />
                        {isIncome ? 'Entrada' : 'Saída'}
                      </span>

                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: stStyle.bg, color: stStyle.color }}
                      >
                        {stStyle.label}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div>
                      <div className="font-bold text-body-md text-text truncate">
                        {tx.description}
                      </div>
                      {tx.installment_count && (
                        <div className="text-xs text-text-muted mt-0.5">
                          Parcela {tx.installment_number}/{tx.installment_count}
                        </div>
                      )}
                      <div className="text-xs text-text-soft mt-1">
                        <span className="font-semibold text-text-muted">Vínculo:</span> {link}
                      </div>
                    </div>

                    {/* Card Price & Date Row */}
                    <div className="flex justify-between items-baseline border-t border-border-soft pt-2.5">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-text-faint uppercase font-bold tracking-wider">Vencimento</span>
                        <span className={`font-mono text-body-sm font-semibold ${
                          isOverdue ? 'text-danger font-bold' : 'text-text-soft'
                        }`}>
                          {formatDate(tx.due_date)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-text-faint uppercase font-bold tracking-wider block mb-0.5">Valor</span>
                        <span className={`font-mono text-body-lg font-bold ${
                          isIncome ? 'text-success' : 'text-danger'
                        }`}>
                          {isIncome ? '+' : '−'} {formatBRL(tx.amount)}
                        </span>
                      </div>
                    </div>

                    {/* Card Actions Row */}
                    {canEdit && (
                      <div className="flex justify-end gap-2 border-t border-border-soft pt-2.5 mt-1">
                        {canPay && (
                          <div className="flex-1 sm:flex-initial">
                            <PayTransactionButton action={payTransactionAction.bind(null, tx.id)} />
                          </div>
                        )}
                        <Link
                          href={`/finance/${tx.id}/edit`}
                          className="px-3 py-1.5 border border-border text-text-soft rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all flex-1 sm:flex-initial"
                        >
                          <Icon name="edit" size={12} />
                          Editar
                        </Link>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-surface-2 border-t border-border">
              <span className="text-xs font-bold text-text-muted text-center sm:text-left">
                Mostrando {(meta.current_page - 1) * meta.per_page + 1}–{Math.min(meta.current_page * meta.per_page, meta.total)} de {meta.total.toLocaleString('pt-BR')} transações
              </span>

              {meta.last_page > 1 && (
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  {/* Anterior */}
                  {meta.current_page > 1 ? (
                    <Link
                      href={pageUrl(meta.current_page - 1)}
                      className="w-9 h-9 flex items-center justify-center border border-border rounded-lg bg-surface text-text-soft hover:bg-surface-hover transition-colors"
                    >
                      <Icon name="chevron_l" size={16} />
                    </Link>
                  ) : (
                    <span className="w-9 h-9 flex items-center justify-center border border-border rounded-lg opacity-30 text-text-muted bg-surface-hover">
                      <Icon name="chevron_l" size={16} />
                    </span>
                  )}

                  {/* Páginas */}
                  {Array.from({ length: Math.min(meta.last_page, 5) }, (_, idx) => {
                    const p = idx + 1
                    const isCurrent = p === meta.current_page
                    return (
                      <Link
                        key={p}
                        href={pageUrl(p)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface text-text-soft border border-border hover:bg-surface-hover'
                        }`}
                      >
                        {p}
                      </Link>
                    )
                  })}

                  {meta.last_page > 5 && (
                    <>
                      <span className="px-1 text-text-muted text-xs">…</span>
                      <Link
                        href={pageUrl(meta.last_page)}
                        className="w-10 h-9 flex items-center justify-center border border-border rounded-lg bg-surface text-xs font-bold text-text-soft hover:bg-surface-hover transition-colors"
                      >
                        {meta.last_page}
                      </Link>
                    </>
                  )}

                  {/* Próxima */}
                  {meta.current_page < meta.last_page ? (
                    <Link
                      href={pageUrl(meta.current_page + 1)}
                      className="w-9 h-9 flex items-center justify-center border border-border rounded-lg bg-surface text-text-soft hover:bg-surface-hover transition-colors"
                    >
                      <Icon name="chevron_r" size={16} />
                    </Link>
                  ) : (
                    <span className="w-9 h-9 flex items-center justify-center border border-border rounded-lg opacity-30 text-text-muted bg-surface-hover">
                      <Icon name="chevron_r" size={16} />
                    </span>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
