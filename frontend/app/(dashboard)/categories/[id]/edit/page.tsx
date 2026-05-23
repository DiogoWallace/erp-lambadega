import { notFound } from 'next/navigation'
import { apiFetch } from '@/app/lib/api'
import { Category } from '@/app/lib/types'
import { CategoryForm } from '../../category-form'
import { updateCategoryAction, deleteCategoryAction } from '../../actions'
import { DeleteCategoryButton } from '../../delete-button'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params

  const [catRes, allRes] = await Promise.all([
    apiFetch(`/categories/${id}`),
    apiFetch('/categories?all=1'),
  ])

  if (catRes.status === 404) notFound()

  const { data: category }: { data: Category } = await catRes.json()
  const { data: allCategories }: { data: Category[] } = await allRes.json()

  const boundUpdate = updateCategoryAction.bind(null, category.id)
  const boundDelete = deleteCategoryAction.bind(null, category.id)

  return (
    <div className="page page-form">
      <div className="page-head">
        <div>
          <h1 className="page-title">{category.name}</h1>
          <p className="page-subtitle">Editar dados da categoria</p>
        </div>
        <DeleteCategoryButton action={boundDelete} />
      </div>

      <CategoryForm
        action={boundUpdate}
        category={category}
        categories={allCategories.filter((c) => c.id !== category.id)}
        submitLabel="Salvar alterações"
      />
    </div>
  )
}
