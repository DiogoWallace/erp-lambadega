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
    <div className="p-8 max-w-3xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{transaction.description}</h1>
          <p className="mt-1 text-sm text-zinc-500">Editar lançamento financeiro</p>
        </div>
        <DeleteTransactionButton action={boundDelete} />
      </div>

      {isFromSale && (
        <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
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
