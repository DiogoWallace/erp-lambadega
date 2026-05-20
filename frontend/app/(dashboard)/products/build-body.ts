export function buildBody(formData: FormData) {
  const costPrice = formData.get('cost_price')
  const salePrice = formData.get('sale_price')
  const stockQty = formData.get('stock_quantity')
  const minStockQty = formData.get('min_stock_quantity')

  return {
    name:               formData.get('name') || undefined,
    description:        formData.get('description') || null,
    brand:              formData.get('brand') || null,
    sku:                formData.get('sku') || null,
    barcode:            formData.get('barcode') || null,
    unit:               formData.get('unit') || 'un',
    cost_price:         costPrice ? parseFloat(costPrice as string) : 0,
    sale_price:         salePrice ? parseFloat(salePrice as string) : 0,
    stock_quantity:     stockQty ? parseInt(stockQty as string, 10) : 0,
    min_stock_quantity: minStockQty ? parseInt(minStockQty as string, 10) : 0,
    image_path:         formData.get('image_path') || null,
    is_active:          formData.get('is_active') === 'true',
    category_id:        formData.get('category_id') || null,
    supplier_id:        formData.get('supplier_id') || null,
  }
}
