import { CustomerForm } from '../customer-form'
import { createCustomerAction } from '../actions'

export default function NewCustomerPage() {
  return (
    <CustomerForm
      action={createCustomerAction}
      submitLabel="Salvar Cadastro"
      title="Novo Cliente"
      subtitle="Cadastre um novo cliente no sistema para realizar vendas e emissões."
    />
  )
}
