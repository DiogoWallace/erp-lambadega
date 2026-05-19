'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const API_BASE = process.env.API_BASE_URL ?? 'http://webserver:8001'

async function getToken(): Promise<string | null> {
  const store = await cookies()
  return store.get('token')?.value ?? null
}

export async function createCategoryAction(_prevState: unknown, formData: FormData) {
  const token = await getToken()
  if (!token) redirect('/login')

  const body = buildBody(formData)

  const res = await fetch(`${API_BASE}/api/categories`, {
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
    return { error: 'Falha ao criar categoria. Tente novamente.' }
  }

  revalidatePath('/categories')
  redirect('/categories')
}

export async function updateCategoryAction(id: string, _prevState: unknown, formData: FormData) {
  const token = await getToken()
  if (!token) redirect('/login')

  const body = buildBody(formData)

  const res = await fetch(`${API_BASE}/api/categories/${id}`, {
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
    return { error: 'Falha ao atualizar categoria. Tente novamente.' }
  }

  revalidatePath('/categories')
  redirect('/categories')
}

export async function deleteCategoryAction(id: string) {
  const token = await getToken()
  if (!token) redirect('/login')

  await fetch(`${API_BASE}/api/categories/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  revalidatePath('/categories')
  redirect('/categories')
}

function buildBody(formData: FormData) {
  const sortOrder = formData.get('sort_order')

  return {
    name:        formData.get('name') || undefined,
    description: formData.get('description') || null,
    parent_id:   formData.get('parent_id') || null,
    sort_order:  sortOrder ? Number(sortOrder) : 0,
    is_active:   formData.get('is_active') === 'true',
  }
}
