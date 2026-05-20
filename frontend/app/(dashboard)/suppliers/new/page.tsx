import { SupplierForm } from '../supplier-form'
import { createSupplierAction } from '../actions'

export default function NewSupplierPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Novo fornecedor</h1>
        <p className="mt-1 text-sm text-zinc-500">Preencha os dados do fornecedor abaixo.</p>
      </div>

      <SupplierForm action={createSupplierAction} submitLabel="Criar fornecedor" />
    </div>
  )
}
