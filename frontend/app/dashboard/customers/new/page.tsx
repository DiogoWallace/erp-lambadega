import { CustomerForm } from '../customer-form'
import { createCustomerAction } from '../actions'

export default function NewCustomerPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Novo cliente</h1>
        <p className="mt-1 text-sm text-zinc-500">Preencha os dados do cliente abaixo.</p>
      </div>

      <CustomerForm action={createCustomerAction} submitLabel="Criar cliente" />
    </div>
  )
}
