import { apiFetch } from '@/app/lib/api'
import { Category, Supplier } from '@/app/lib/types'
import { ProductForm } from '../product-form'
import { createProductAction } from '../actions'

export default async function NewProductPage() {
  const [categoriesRes, suppliersRes] = await Promise.all([
    apiFetch('/categories?all=1'),
    apiFetch('/suppliers?all=1'),
  ])

  const { data: categories }: { data: Category[] } = await categoriesRes.json()
  const { data: suppliers }: { data: Supplier[] } = await suppliersRes.json()

  return (
    <ProductForm
      action={createProductAction}
      categories={categories}
      suppliers={suppliers}
      submitLabel="Criar produto"
    />
  )
}
