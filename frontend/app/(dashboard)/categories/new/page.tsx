import { apiFetch } from '@/app/lib/api'
import { Category } from '@/app/lib/types'
import { CategoryForm } from '../category-form'
import { createCategoryAction } from '../actions'

export default async function NewCategoryPage() {
  const res = await apiFetch('/categories?all=1')
  const { data: categories }: { data: Category[] } = await res.json()

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Nova categoria</h1>
        <p className="mt-1 text-sm text-zinc-500">Preencha os dados da categoria abaixo.</p>
      </div>

      <CategoryForm action={createCategoryAction} categories={categories} submitLabel="Criar categoria" />
    </div>
  )
}
