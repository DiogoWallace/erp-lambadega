import { SupplierForm } from '../supplier-form'
import { createSupplierAction } from '../actions'

export default function NewSupplierPage() {
  return (
    <div className="page page-form">
      <div className="page-head">
        <div>
          <h1 className="page-title">Novo fornecedor</h1>
          <p className="page-subtitle">Preencha os dados do fornecedor abaixo.</p>
        </div>
      </div>

      <SupplierForm action={createSupplierAction} submitLabel="Criar fornecedor" />
    </div>
  )
}
