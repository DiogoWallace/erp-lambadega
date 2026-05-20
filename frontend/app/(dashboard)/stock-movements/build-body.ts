export function buildBody(formData: FormData) {
  const quantity = formData.get('quantity')
  const costPrice = formData.get('cost_price')

  return {
    product_id:  formData.get('product_id') || undefined,
    type:        formData.get('type') || undefined,
    quantity:    quantity ? parseInt(quantity as string, 10) : undefined,
    cost_price:  costPrice ? parseFloat(costPrice as string) : null,
    description: formData.get('description') || null,
  }
}
