import { SupplierForm } from '../supplier-form'
import { createSupplierAction } from '../actions'

export default function NewSupplierPage() {
  return (
    <SupplierForm
      action={createSupplierAction}
      submitLabel="Salvar Fornecedor"
      title="Novo Fornecedor"
      subtitle="Preencha os campos abaixo para cadastrar um novo parceiro comercial."
    />
  )
}
