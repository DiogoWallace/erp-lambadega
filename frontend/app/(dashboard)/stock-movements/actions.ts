'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { buildBody } from './build-body'

const API_BASE = process.env.API_BASE_URL ?? 'http://webserver:8001'

async function getToken(): Promise<string | null> {
  const store = await cookies()
  return store.get('token')?.value ?? null
}

export async function createStockMovementAction(_prevState: unknown, formData: FormData) {
  const token = await getToken()
  if (!token) redirect('/login')

  const body = buildBody(formData)

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
