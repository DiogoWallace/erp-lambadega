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
    <div className="page page-form">
      <div className="page-head">
        <div>
          <h1 className="page-title">{supplier.company_name}</h1>
          <p className="page-subtitle">Editar dados do fornecedor</p>
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
