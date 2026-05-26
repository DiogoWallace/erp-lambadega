'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const API_BASE = process.env.API_BASE_URL ?? 'http://webserver:8001'

interface ActionState {
  error?: string
  errors?: Record<string, string[]>
  ok?: boolean
}

export async function createQuoteAction(
  productId: string,
  _prevState: unknown,
  formData: FormData,
): Promise<ActionState> {
  const store = await cookies()
  const token = store.get('token')?.value
  if (!token) redirect('/login')

  const supplierId = formData.get('supplier_id') as string
  const costPriceRaw = formData.get('cost_price') as string
  const notes = formData.get('notes') as string
  const effectiveAt = formData.get('effective_at') as string

  const body = {
    supplier_id: supplierId || null,
    cost_price: parseFloat(costPriceRaw),
    notes: notes || null,
    effective_at: effectiveAt || null,
  }

  const res = await fetch(`${API_BASE}/api/products/${productId}/cost-history`, {
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

  if (res.status === 403) {
    return { error: 'Você não tem permissão para registrar cotações (products.quote).' }
  }

  if (!res.ok) {
    return { error: 'Falha ao registrar cotação.' }
  }

  revalidatePath(`/products/${productId}/edit`)
  return { ok: true }
}
