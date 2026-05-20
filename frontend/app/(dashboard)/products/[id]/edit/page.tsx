import { notFound } from 'next/navigation'
import { apiFetch } from '@/app/lib/api'
import { Category, Product, Supplier } from '@/app/lib/types'
import { ProductForm } from '../../product-form'
import { updateProductAction, deleteProductAction } from '../../actions'
import { DeleteProductButton } from '../../delete-button'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params

  const [productRes, categoriesRes, suppliersRes] = await Promise.all([
    apiFetch(`/products/${id}`),
    apiFetch('/categories?all=1'),
    apiFetch('/suppliers?all=1'),
  ])

  if (productRes.status === 404) notFound()

  const { data: product }: { data: Product } = await productRes.json()
  const { data: categories }: { data: Category[] } = await categoriesRes.json()
  const { data: suppliers }: { data: Supplier[] } = await suppliersRes.json()

  const boundUpdate = updateProductAction.bind(null, product.id)
  const boundDelete = deleteProductAction.bind(null, product.id)

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{product.name}</h1>
          <p className="mt-1 text-sm text-zinc-500">Editar dados do produto</p>
        </div>
        <DeleteProductButton action={boundDelete} />
      </div>

      <ProductForm
        action={boundUpdate}
        product={product}
        categories={categories}
        suppliers={suppliers}
        submitLabel="Salvar alterações"
      />
    </div>
  )
}
