import Link from 'next/link'
import { apiFetch } from '@/app/lib/api'
import { FinancialTransaction, FinancialStatus, PaginatedResponse } from '@/app/lib/types'
import { Icon } from '@/app/ui/icon'
import { payTransactionAction } from './actions'
import { PayTransactionButton } from './pay-button'

interface Props {
  searchParams: Promise<{ search?: string; page?: string; type?: string; status?: string }>
}

const STATUS_BADGE: Record<FinancialStatus, string> = {
  pending: 'badge-warning',
  paid: 'badge-success',
  overdue: 'badge-danger',
  canceled: 'badge',
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
  if (type)   params.set('type', type)
  if (status) params.set('status', status)

  const res = await apiFetch(`/financial-transactions?${params}`)
  const { data: transactions, meta }: PaginatedResponse<FinancialTransaction> = await res.json()

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Financeiro</h1>
          <p className="page-subtitle">{meta.total} lançamento(s) · contas a pagar e receber</p>
        </div>
        <Link href="/finance/new" className="btn btn-primary btn-sm">
          <Icon name="plus" size={13} stroke={2} /> Novo lançamento
        </Link>
      </div>

      <form method="GET" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <input
          name="search"
          type="text"
          defaultValue={search}
          placeholder="Buscar por descrição..."
          className="input input-sm"
          style={{ flex: 1, minWidth: 240 }}
        />
        <select name="type" defaultValue={type} className="input input-sm" style={{ width: 180 }}>
          <option value="">Todos os tipos</option>
          <option value="income">Receitas</option>
          <option value="expense">Despesas</option>
        </select>
        <select name="status" defaultValue={status} className="input input-sm" style={{ width: 180 }}>
          <option value="">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="paid">Paga</option>
          <option value="overdue">Vencida</option>
          <option value="canceled">Cancelada</option>
        </select>
        <button type="submit" className="btn btn-outline btn-sm"><Icon name="filter" size={12} /> Filtrar</button>
        {(search || type || status) && (<a href="/finance" className="btn btn-ghost btn-sm"><Icon name="x" size={12} /> Limpar</a>)}
      </form>

      <div className="card">
        {transactions.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nenhum lançamento encontrado.</p>
          </div>
        ) : (
          <table className="t-table">
            <thead>
              <tr>
                <th>Vencimento</th>
                <th>Descrição</th>
                <th>Vínculo</th>
                <th className="t-num">Valor</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const isIncome = tx.type === 'income'
                const link = tx.supplier?.company_name ?? tx.customer?.name ?? (tx.order ? `Venda ${tx.order.order_number}` : '—')
                const canPay = tx.status === 'pending' || tx.status === 'overdue'
                return (
                  <tr key={tx.id}>
                    <td style={{ color: 'var(--text-soft)' }}>{formatDate(tx.due_date)}</td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text)' }}>{tx.description}</div>
                      {tx.installment_count && (
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                          Parcela {tx.installment_number}/{tx.installment_count}
                        </div>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{link}</td>
                    <td className="t-num tnum" style={{ fontWeight: 500, color: isIncome ? 'var(--success)' : 'var(--danger)' }}>
                      {isIncome ? '+' : '−'} {formatBRL(tx.amount)}
                    </td>
                    <td><span className={`badge ${STATUS_BADGE[tx.status]}`}>{STATUS_LABELS[tx.status]}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                        {canPay && <PayTransactionButton action={payTransactionAction.bind(null, tx.id)} />}
                        <Link href={`/finance/${tx.id}/edit`} className="btn btn-ghost btn-sm">
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

function PaginationLink({ page, search, type, status, label }: {
  page: number; search: string; type: string; status: string; label: string
}) {
  const params = new URLSearchParams({ page: String(page) })
  if (search) params.set('search', search)
  if (type)   params.set('type', type)
  if (status) params.set('status', status)
  return <Link href={`/finance?${params}`} className="btn btn-outline btn-sm">{label}</Link>
}
