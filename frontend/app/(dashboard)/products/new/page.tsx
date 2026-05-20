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
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Novo produto</h1>
        <p className="mt-1 text-sm text-zinc-500">Preencha os dados do produto abaixo.</p>
      </div>

      <ProductForm
        action={createProductAction}
        categories={categories}
        suppliers={suppliers}
        submitLabel="Criar produto"
      />
    </div>
  )
}
