'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const API_BASE = process.env.API_BASE_URL ?? 'http://webserver:8001'

async function getToken(): Promise<string | null> {
  const store = await cookies()
  return store.get('token')?.value ?? null
}

export async function createCustomerAction(_prevState: unknown, formData: FormData) {
  const token = await getToken()
  if (!token) redirect('/login')

  const body = buildBody(formData)

  const res = await fetch(`${API_BASE}/api/customers`, {
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
    return { error: 'Failed to create customer. Please try again.' }
  }

  revalidatePath('/customers')
  redirect('/customers')
}

export async function updateCustomerAction(id: number, _prevState: unknown, formData: FormData) {
  const token = await getToken()
  if (!token) redirect('/login')

  const body = buildBody(formData)

  const res = await fetch(`${API_BASE}/api/customers/${id}`, {
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
    return { error: 'Failed to update customer. Please try again.' }
  }

  revalidatePath('/customers')
  redirect('/customers')
}

export async function deleteCustomerAction(id: number) {
  const token = await getToken()
  if (!token) redirect('/login')

  await fetch(`${API_BASE}/api/customers/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  revalidatePath('/customers')
  redirect('/customers')
}

function buildBody(formData: FormData) {
  return {
    type: formData.get('type') || undefined,
    name: formData.get('name') || undefined,
    trade_name: formData.get('trade_name') || null,
    document: formData.get('document') || null,
    email: formData.get('email') || null,
    phone: formData.get('phone') || null,
    address: formData.get('address') || null,
    address_number: formData.get('address_number') || null,
    address_complement: formData.get('address_complement') || null,
    neighborhood: formData.get('neighborhood') || null,
    city: formData.get('city') || null,
    state: formData.get('state') || null,
    zip_code: formData.get('zip_code') || null,
    notes: formData.get('notes') || null,
    is_active: formData.get('is_active') === 'true',
  }
}
