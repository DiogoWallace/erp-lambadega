'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { buildBody } from './new/build-body'

const API_BASE = process.env.API_BASE_URL ?? 'http://webserver:8001'

async function getToken(): Promise<string | null> {
  const store = await cookies()
  return store.get('token')?.value ?? null
}

export async function createSaleAction(_prevState: unknown, formData: FormData) {
  const token = await getToken()
  if (!token) redirect('/login')

  const body = buildBody(formData)

  if (!body.items.length) {
    return { error: 'Adicione ao menos um produto ao carrinho.' }
  }

  const res = await fetch(`${API_BASE}/api/orders`, {
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
    return { error: 'Falha ao registrar venda. Tente novamente.' }
  }

  const { data: order } = await res.json()

  revalidatePath('/sales')
  revalidatePath('/products')
  revalidatePath('/stock-movements')

  redirect(`/sales/${order.id}`)
}

export async function paySaleAction(_prevState: unknown, formData: FormData) {
  const token = await getToken()
  if (!token) redirect('/login')

  const orderId = formData.get('order_id') as string
  const paymentMethod = formData.get('payment_method') as string
  const installments = formData.get('installments')

  const res = await fetch(`${API_BASE}/api/orders/${orderId}/pay`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      payment_method: paymentMethod,
      installments: installments ? parseInt(installments as string, 10) : 1,
    }),
  })

  if (res.status === 422) {
    const { message, errors } = await res.json()
    return { error: message, errors }
  }

  if (!res.ok) {
    return { error: 'Falha ao registrar pagamento. Tente novamente.' }
  }

  revalidatePath(`/sales/${orderId}`)
  revalidatePath('/sales')

  redirect(`/sales/${orderId}`)
}

export async function cancelSaleAction(_prevState: unknown, formData: FormData) {
  const token = await getToken()
  if (!token) redirect('/login')

  const orderId = formData.get('order_id') as string

  const res = await fetch(`${API_BASE}/api/orders/${orderId}/cancel`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok && res.status !== 422) {
    return { error: 'Falha ao cancelar venda. Tente novamente.' }
  }

  if (res.status === 422) {
    const { message } = await res.json()
    return { error: message }
  }

  revalidatePath(`/sales/${orderId}`)
  revalidatePath('/sales')
  revalidatePath('/stock-movements')

  redirect(`/sales/${orderId}`)
}
