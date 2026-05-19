import { notFound } from 'next/navigation'
import { apiFetch } from '@/app/lib/api'
import { Customer } from '@/app/lib/types'
import { CustomerForm } from '../../customer-form'
import { updateCustomerAction, deleteCustomerAction } from '../../actions'

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
        <form action={boundDelete}>
          <button
            type="submit"
            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            onClick={(e) => {
              if (!confirm('Confirma a exclusão deste cliente?')) e.preventDefault()
            }}
          >
            Excluir
          </button>
        </form>
      </div>

      <CustomerForm
        action={boundUpdate}
        customer={customer}
        submitLabel="Salvar alterações"
      />
    </div>
  )
}
