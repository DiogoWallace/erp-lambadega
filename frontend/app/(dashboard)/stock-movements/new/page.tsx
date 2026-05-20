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
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Registrar movimentação</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Registre uma entrada, saída ou ajuste de inventário.
        </p>
      </div>

      <MovementForm
        action={createStockMovementAction}
        products={products}
        defaultProductId={product_id}
      />
    </div>
  )
}
