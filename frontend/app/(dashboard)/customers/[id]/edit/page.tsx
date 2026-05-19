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
    <div className="p-8 max-w-3xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{customer.name}</h1>
          <p className="mt-1 text-sm text-zinc-500">Editar dados do cliente</p>
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
