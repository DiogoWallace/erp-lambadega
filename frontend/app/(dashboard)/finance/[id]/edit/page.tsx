import { notFound } from 'next/navigation'
import { apiFetch } from '@/app/lib/api'
import { FinancialTransaction } from '@/app/lib/types'
import { FinanceForm } from '../../finance-form'
import { updateTransactionAction, deleteTransactionAction } from '../../actions'
import { DeleteTransactionButton } from '../../delete-button'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditTransactionPage({ params }: Props) {
  const { id } = await params

  const res = await apiFetch(`/financial-transactions/${id}`)
  if (res.status === 404) notFound()

  const { data: transaction }: { data: FinancialTransaction } = await res.json()

  const [supRes, custRes] = await Promise.all([
    apiFetch('/suppliers?all=1'),
    apiFetch('/customers?all=1'),
  ])
  const { data: suppliers } = await supRes.json()
  const { data: customers } = await custRes.json()

  const boundUpdate = updateTransactionAction.bind(null, transaction.id)
  const boundDelete = deleteTransactionAction.bind(null, transaction.id)
  const isFromSale = Boolean(transaction.order_id)

  return (
    <div className="page page-form">
      <div className="page-head">
        <div>
          <h1 className="page-title">{transaction.description}</h1>
          <p className="page-subtitle">Editar lançamento financeiro</p>
        </div>
        <DeleteTransactionButton action={boundDelete} />
      </div>

      {isFromSale && (
        <div
          className="form-banner-error"
          style={{
            marginBottom: 16,
            background: 'var(--warning-soft)',
            color: 'var(--warning)',
          }}
        >
          Este lançamento foi gerado por uma venda
          {transaction.order ? ` (${transaction.order.order_number})` : ''}. Edições manuais não alteram o pedido de origem.
        </div>
      )}

      <FinanceForm
        action={boundUpdate}
        transaction={transaction}
        suppliers={suppliers}
        customers={customers}
        submitLabel="Salvar alterações"
      />
    </div>
  )
}
