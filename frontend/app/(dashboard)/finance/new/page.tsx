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
    <div className="page page-form">
      <div className="page-head">
        <div>
          <h1 className="page-title">Novo lançamento</h1>
          <p className="page-subtitle">Registre uma conta a pagar ou a receber.</p>
        </div>
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
