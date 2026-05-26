import { notFound } from 'next/navigation'
import { apiFetch } from '@/app/lib/api'
import { Customer } from '@/app/lib/types'
import { CustomerForm } from '../../customer-form'
import { updateCustomerAction, deleteCustomerAction } from '../../actions'
import { DeleteCustomerButton } from '../../delete-button'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditCustomerPage({ params }: Props) {
  const { id } = await params

  const res = await apiFetch(`/customers/${id}`)

  if (res.status === 404) notFound()

  const { data: customer }: { data: Customer } = await res.json()

  const boundUpdate = updateCustomerAction.bind(null, customer.id)
  const boundDelete = deleteCustomerAction.bind(null, customer.id)

  return (
    <CustomerForm
      action={boundUpdate}
      customer={customer}
      submitLabel="Salvar Alterações"
      title="Editar Cliente"
      subtitle={`Gerencie os dados cadastrais de ${customer.name}`}
      deleteButton={<DeleteCustomerButton action={boundDelete} />}
    />
  )
}
