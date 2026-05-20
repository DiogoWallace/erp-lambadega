'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const API_BASE = process.env.API_BASE_URL ?? 'http://webserver:8001'

async function getToken(): Promise<string | null> {
  const store = await cookies()
  return store.get('token')?.value ?? null
}

export async function createSupplierAction(_prevState: unknown, formData: FormData) {
  const token = await getToken()
  if (!token) redirect('/login')

  const body = buildBody(formData)

  const res = await fetch(`${API_BASE}/api/suppliers`, {
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
    return { error: 'Failed to create supplier. Please try again.' }
  }

  revalidatePath('/suppliers')
  redirect('/suppliers')
}

export async function updateSupplierAction(id: string, _prevState: unknown, formData: FormData) {
  const token = await getToken()
  if (!token) redirect('/login')

  const body = buildBody(formData)

  const res = await fetch(`${API_BASE}/api/suppliers/${id}`, {
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
    return { error: 'Failed to update supplier. Please try again.' }
  }

  revalidatePath('/suppliers')
  redirect('/suppliers')
}

export async function deleteSupplierAction(id: string) {
  const token = await getToken()
  if (!token) redirect('/login')

  await fetch(`${API_BASE}/api/suppliers/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  revalidatePath('/suppliers')
  redirect('/suppliers')
}

function buildBody(formData: FormData) {
  return {
    company_name:  formData.get('company_name') || undefined,
    trade_name:    formData.get('trade_name') || null,
    cnpj:          formData.get('cnpj') || null,
    contact_name:  formData.get('contact_name') || null,
    email:         formData.get('email') || null,
    phone:         formData.get('phone') || null,
    website:       formData.get('website') || null,
    address:       formData.get('address') || null,
    city:          formData.get('city') || null,
    state:         formData.get('state') || null,
    zip_code:      formData.get('zip_code') || null,
    notes:         formData.get('notes') || null,
    is_active:     formData.get('is_active') === 'true',
  }
}
