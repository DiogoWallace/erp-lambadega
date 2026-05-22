import { apiFetch } from '@/app/lib/api'
import { Customer, Product } from '@/app/lib/types'
import { SaleForm } from './sale-form'
import { createSaleAction } from '../actions'

export default async function NewSalePage() {
  const [productsRes, customersRes] = await Promise.all([
    apiFetch('/products?all=1'),
    apiFetch('/customers?all=1'),
  ])

  const { data: products }: { data: Product[] } = await productsRes.json()
  const { data: customers }: { data: Customer[] } = await customersRes.json()

  const activeProducts = products.filter((p) => p.is_active)

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Nova venda</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Adicione produtos ao carrinho e registre a venda.
        </p>
      </div>

      <SaleForm
        action={createSaleAction}
        products={activeProducts}
        customers={customers}
      />
    </div>
  )
}
