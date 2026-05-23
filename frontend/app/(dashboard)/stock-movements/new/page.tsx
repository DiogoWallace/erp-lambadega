import { apiFetch } from '@/app/lib/api'
import { Product } from '@/app/lib/types'
import { MovementForm } from '../movement-form'
import { createStockMovementAction } from '../actions'

interface Props {
  searchParams: Promise<{ product_id?: string }>
}

export default async function NewStockMovementPage({ searchParams }: Props) {
  const { product_id } = await searchParams

  const res = await apiFetch('/products?all=1')
  const { data: products }: { data: Product[] } = await res.json()

  return (
    <div className="page page-form">
      <div className="page-head">
        <div>
          <h1 className="page-title">Registrar movimentação</h1>
          <p className="page-subtitle">
            Registre uma entrada, saída ou ajuste de inventário.
          </p>
        </div>
      </div>

      <MovementForm
        action={createStockMovementAction}
        products={products}
        defaultProductId={product_id}
      />
    </div>
  )
}
