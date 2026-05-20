'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const API_BASE = process.env.API_BASE_URL ?? 'http://webserver:8001'

async function getToken(): Promise<string | null> {
  const store = await cookies()
  return store.get('token')?.value ?? null
}

export async function createProductAction(_prevState: unknown, formData: FormData) {
  const token = await getToken()
  if (!token) redirect('/login')

  const body = buildBody(formData)

  const res = await fetch(`${API_BASE}/api/products`, {
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
    return { error: 'Falha ao criar produto. Tente novamente.' }
  }

  revalidatePath('/products')
  redirect('/products')
}

export async function updateProductAction(id: string, _prevState: unknown, formData: FormData) {
  const token = await getToken()
  if (!token) redirect('/login')

  const body = buildBody(formData)

  const res = await fetch(`${API_BASE}/api/products/${id}`, {
    method: 'PUT',
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
    return { error: 'Falha ao atualizar produto. Tente novamente.' }
  }

  revalidatePath('/products')
  redirect('/products')
}

export async function deleteProductAction(id: string) {
  const token = await getToken()
  if (!token) redirect('/login')

  await fetch(`${API_BASE}/api/products/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  revalidatePath('/products')
  redirect('/products')
}

function buildBody(formData: FormData) {
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
