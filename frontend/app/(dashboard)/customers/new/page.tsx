import { CustomerForm } from '../customer-form'
import { createCustomerAction } from '../actions'

export default function NewCustomerPage() {
  return (
    <div className="page page-form">
      <div className="page-head">
        <div>
          <h1 className="page-title">Novo cliente</h1>
          <p className="page-subtitle">Preencha os dados do cliente abaixo.</p>
        </div>
      </div>

      <CustomerForm action={createCustomerAction} submitLabel="Criar cliente" />
    </div>
  )
}
