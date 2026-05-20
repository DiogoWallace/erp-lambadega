'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const API_BASE = process.env.API_BASE_URL ?? 'http://webserver:8001'

async function getToken(): Promise<string | null> {
  const store = await cookies()
  return store.get('token')?.value ?? null
}

export async function createStockMovementAction(_prevState: unknown, formData: FormData) {
  const token = await getToken()
  if (!token) redirect('/login')

  const quantity = formData.get('quantity')
  const costPrice = formData.get('cost_price')

  const body = {
    product_id:  formData.get('product_id') || undefined,
    type:        formData.get('type') || undefined,
    quantity:    quantity ? parseInt(quantity as string, 10) : undefined,
    cost_price:  costPrice ? parseFloat(costPrice as string) : null,
    description: formData.get('description') || null,
  }

  const res = await fetch(`${API_BASE}/api/stock-movements`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  if (res.status === 422) {
    const { message, errors } = await res.json()
    return { error: message, errors }
  }

  if (!res.ok) {
    return { error: 'Falha ao registrar movimentação. Tente novamente.' }
  }

  revalidatePath('/stock-movements')
  revalidatePath('/products')

  const productId = formData.get('product_id')
  redirect(productId ? `/stock-movements?product_id=${productId}` : '/stock-movements')
}
