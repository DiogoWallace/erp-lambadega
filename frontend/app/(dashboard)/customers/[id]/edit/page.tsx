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
    <div className="page page-form">
      <div className="page-head">
        <div>
          <h1 className="page-title">{customer.name}</h1>
          <p className="page-subtitle">Editar dados do cliente</p>
        </div>
        <DeleteCustomerButton action={boundDelete} />
      </div>

      <CustomerForm
        action={boundUpdate}
        customer={customer}
        submitLabel="Salvar alterações"
      />
    </div>
  )
}
