import { notFound } from 'next/navigation'
import { apiFetch } from '@/app/lib/api'
import { Category, Product, Supplier } from '@/app/lib/types'
import { ProductForm } from '../../product-form'
import { updateProductAction, deleteProductAction } from '../../actions'
import { DeleteProductButton } from '../../delete-button'
import { CostHistorySection } from '../cost-history'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params

  const [productRes, categoriesRes, suppliersRes, meRes] = await Promise.all([
    apiFetch(`/products/${id}`),
    apiFetch('/categories?all=1'),
    apiFetch('/suppliers?all=1'),
    apiFetch('/auth/me'),
  ])

  if (productRes.status === 404) notFound()

  const { data: product }: { data: Product } = await productRes.json()
  const { data: categories }: { data: Category[] } = await categoriesRes.json()
  const { data: suppliers }: { data: Supplier[] } = await suppliersRes.json()
  const { data: me } = await meRes.json()
  const perms: string[] = me?.permissions ?? []
  const canDelete = perms.includes('products.delete')
  const canQuote = perms.includes('products.quote')

  const boundUpdate = updateProductAction.bind(null, product.id)
  const boundDelete = deleteProductAction.bind(null, product.id)

  return (
    <>
      <ProductForm
        action={boundUpdate}
        product={product}
        categories={categories}
        suppliers={suppliers}
        submitLabel="Salvar alterações"
        deleteButton={canDelete ? <DeleteProductButton action={boundDelete} /> : null}
      />

      <div className="w-full max-w-[1200px] mx-auto px-4">
        <CostHistorySection
          productId={product.id}
          defaultSupplierId={product.supplier_id}
          suppliers={suppliers}
          canQuote={canQuote}
        />
      </div>
    </>
  )
}
