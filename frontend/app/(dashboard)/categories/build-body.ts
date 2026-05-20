export function buildBody(formData: FormData) {
  const sortOrder = formData.get('sort_order')

  return {
    name:        formData.get('name') || undefined,
    description: formData.get('description') || null,
    parent_id:   formData.get('parent_id') || null,
    sort_order:  sortOrder ? Number(sortOrder) : 0,
    is_active:   formData.get('is_active') === 'true',
  }
}
