export function buildBody(formData: FormData) {
  const amount = formData.get('amount')

  return {
    type:           formData.get('type') || undefined,
    category:       formData.get('category') || null,
    description:    formData.get('description') || undefined,
    amount:         amount !== null && amount !== '' ? parseFloat(amount as string) : undefined,
    payment_method: formData.get('payment_method') || null,
    due_date:       formData.get('due_date') || undefined,
    payment_date:   formData.get('payment_date') || null,
    status:         formData.get('status') || 'pending',
    supplier_id:    formData.get('supplier_id') || null,
    customer_id:    formData.get('customer_id') || null,
    notes:          formData.get('notes') || null,
  }
}
