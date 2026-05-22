import { apiFetch } from '@/app/lib/api'
import { FinanceForm } from '../finance-form'
import { createTransactionAction } from '../actions'

export default async function NewTransactionPage() {
  const [supRes, custRes] = await Promise.all([
    apiFetch('/suppliers?all=1'),
    apiFetch('/customers?all=1'),
  ])
  const { data: suppliers } = await supRes.json()
  const { data: customers } = await custRes.json()

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Novo lançamento</h1>
        <p className="mt-1 text-sm text-zinc-500">Registre uma conta a pagar ou a receber.</p>
      </div>

      <FinanceForm
        action={createTransactionAction}
        suppliers={suppliers}
        customers={customers}
        submitLabel="Criar lançamento"
      />
    </div>
  )
}
