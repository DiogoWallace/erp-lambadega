import { apiFetch } from '@/app/lib/api'
import { Category } from '@/app/lib/types'
import { CategoryForm } from '../category-form'
import { createCategoryAction } from '../actions'

export default async function NewCategoryPage() {
  const res = await apiFetch('/categories?all=1')
  const { data: categories }: { data: Category[] } = await res.json()

  return (
    <div className="page page-form">
      <div className="page-head">
        <div>
          <h1 className="page-title">Nova categoria</h1>
          <p className="page-subtitle">Preencha os dados da categoria abaixo.</p>
        </div>
      </div>

      <CategoryForm action={createCategoryAction} categories={categories} submitLabel="Criar categoria" />
    </div>
  )
}
