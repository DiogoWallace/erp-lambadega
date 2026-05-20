import { notFound } from 'next/navigation'
import { apiFetch } from '@/app/lib/api'
import { Supplier } from '@/app/lib/types'
import { SupplierForm } from '../../supplier-form'
import { updateSupplierAction, deleteSupplierAction } from '../../actions'
import { DeleteSupplierButton } from '../../delete-button'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditSupplierPage({ params }: Props) {
  const { id } = await params

  const res = await apiFetch(`/suppliers/${id}`)

  if (res.status === 404) notFound()

  const { data: supplier }: { data: Supplier } = await res.json()

  const boundUpdate = updateSupplierAction.bind(null, supplier.id)
  const boundDelete = deleteSupplierAction.bind(null, supplier.id)

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{supplier.company_name}</h1>
          <p className="mt-1 text-sm text-zinc-500">Editar dados do fornecedor</p>
        </div>
        <DeleteSupplierButton action={boundDelete} />
      </div>

      <SupplierForm
        action={boundUpdate}
        supplier={supplier}
        submitLabel="Salvar alterações"
      />
    </div>
  )
}
