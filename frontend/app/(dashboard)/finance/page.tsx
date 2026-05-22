import Link from 'next/link'
import { apiFetch } from '@/app/lib/api'
import { FinancialTransaction, FinancialStatus, PaginatedResponse } from '@/app/lib/types'
import { payTransactionAction } from './actions'
import { PayTransactionButton } from './pay-button'

interface Props {
  searchParams: Promise<{ search?: string; page?: string; type?: string; status?: string }>
}

const STATUS_STYLES: Record<FinancialStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  canceled: 'bg-zinc-100 text-zinc-500',
}

const STATUS_LABELS: Record<FinancialStatus, string> = {
  pending: 'Pendente',
  paid: 'Paga',
  overdue: 'Vencida',
  canceled: 'Cancelada',
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

  const res = await apiFetch(`/financial-transactions?${params}`)
  const { data: transactions, meta }: PaginatedResponse<FinancialTransaction> = await res.json()

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Financeiro</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{meta.total} lançamentos · contas a pagar e receber</p>
        </div>
        <Link
          href="/finance/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          + Novo lançamento
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex gap-3 mb-6">
        <input
          name="search"
          type="text"
          defaultValue={search}
          placeholder="Buscar por descrição..."
          className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <select
          name="type"
          defaultValue={type}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          <option value="">Todos os tipos</option>
          <option value="income">Receitas</option>
          <option value="expense">Despesas</option>
        </select>
        <select
          name="status"
          defaultValue={status}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          <option value="">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="paid">Paga</option>
          <option value="overdue">Vencida</option>
          <option value="canceled">Cancelada</option>
        </select>
        <button
          type="submit"
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          Filtrar
        </button>
        {(search || type || status) && (
          <a
            href="/finance"
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-50 transition-colors"
          >
            Limpar
          </a>
        )}
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {transactions.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-zinc-500">Nenhum lançamento encontrado.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Vencimento</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Descrição</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Vínculo</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide text-right">Valor</th>
                <th className="px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {transactions.map((tx) => {
                const isIncome = tx.type === 'income'
                const link = tx.supplier?.company_name ?? tx.customer?.name ?? (tx.order ? `Venda ${tx.order.order_number}` : '—')
                const canPay = tx.status === 'pending' || tx.status === 'overdue'

                return (
                  <tr key={tx.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3 text-zinc-600">{formatDate(tx.due_date)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-900">{tx.description}</p>
                      {tx.installment_count && (
                        <p className="text-xs text-zinc-400">
                          Parcela {tx.installment_number}/{tx.installment_count}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{link}</td>
                    <td className={`px-4 py-3 text-right font-medium ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isIncome ? '+' : '−'} {formatBRL(tx.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[tx.status]}`}>
                        {STATUS_LABELS[tx.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        {canPay && <PayTransactionButton action={payTransactionAction.bind(null, tx.id)} />}
                        <Link
                          href={`/finance/${tx.id}/edit`}
                          className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                        >
                          Editar
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

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-zinc-500">
            Página {meta.current_page} de {meta.last_page}
          </p>
          <div className="flex gap-2">
            {meta.current_page > 1 && (
              <PaginationLink page={meta.current_page - 1} search={search} type={type} status={status} label="← Anterior" />
            )}
            {meta.current_page < meta.last_page && (
              <PaginationLink page={meta.current_page + 1} search={search} type={type} status={status} label="Próxima →" />
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
  type,
  status,
  label,
}: {
  page: number
  search: string
  type: string
  status: string
  label: string
}) {
  const params = new URLSearchParams({ page: String(page) })
  if (search) params.set('search', search)
  if (type) params.set('type', type)
  if (status) params.set('status', status)

  return (
    <Link
      href={`/finance?${params}`}
      className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
    >
      {label}
    </Link>
  )
}
