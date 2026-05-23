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
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Nova venda</h1>
          <p className="page-subtitle">
            Adicione produtos ao carrinho e registre a venda.
          </p>
        </div>
      </div>

      <SaleForm
        action={createSaleAction}
        products={activeProducts}
        customers={customers}
      />
    </div>
  )
}
