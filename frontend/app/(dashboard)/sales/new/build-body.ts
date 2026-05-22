export interface CartItemRaw {
  product_id: string
  quantity: number
  unit_price: number
}

export function buildBody(formData: FormData) {
  const cartJson = formData.get('cart') as string
  const items: CartItemRaw[] = JSON.parse(cartJson || '[]')

  const discountAmount = formData.get('discount_amount')
  const installments = formData.get('installments')
  const customerId = formData.get('customer_id')
  const paymentMethod = formData.get('payment_method')

  return {
    customer_id: customerId || null,
    items: items.map((i) => ({
      product_id: i.product_id,
      quantity: i.quantity,
      unit_price: i.unit_price,
    })),
    discount_type: formData.get('discount_type') || 'fixed',
    discount_amount: discountAmount ? parseFloat(discountAmount as string) : 0,
    payment_method: paymentMethod || null,
    installments: installments ? parseInt(installments as string, 10) : 1,
    notes: formData.get('notes') || null,
  }
}
