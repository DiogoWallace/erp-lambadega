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
    <SupplierForm
      action={boundUpdate}
      supplier={supplier}
      submitLabel="Salvar Alterações"
      title="Editar Fornecedor"
      subtitle={`Gerencie os dados cadastrais de ${supplier.company_name}`}
      deleteButton={<DeleteSupplierButton action={boundDelete} />}
    />
  )
}
