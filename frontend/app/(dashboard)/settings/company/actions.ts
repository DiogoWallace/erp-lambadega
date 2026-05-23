'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const API_BASE = process.env.API_BASE_URL ?? 'http://webserver:8001'

async function getToken(): Promise<string | null> {
  const store = await cookies()
  return store.get('token')?.value ?? null
}

export interface CompanyFormState {
  error?: string | null
  errors?: Record<string, string[]>
  success?: boolean
}

const INITIAL: CompanyFormState = { error: null, errors: undefined, success: false }

export async function updateCompanyAction(
  _prev: CompanyFormState,
  formData: FormData,
): Promise<CompanyFormState> {
  const token = await getToken()
  if (!token) redirect('/login')

  const body = {
    name:               String(formData.get('name') ?? '').trim(),
    trade_name:         String(formData.get('trade_name') ?? '').trim() || null,
    document:           String(formData.get('document') ?? '').trim() || null,
    email:              String(formData.get('email') ?? '').trim() || null,
    phone:              String(formData.get('phone') ?? '').trim() || null,
    address:            String(formData.get('address') ?? '').trim() || null,
    address_number:     String(formData.get('address_number') ?? '').trim() || null,
    address_complement: String(formData.get('address_complement') ?? '').trim() || null,
    neighborhood:       String(formData.get('neighborhood') ?? '').trim() || null,
    city:               String(formData.get('city') ?? '').trim() || null,
    state:              String(formData.get('state') ?? '').trim().toUpperCase() || null,
    zip_code:           String(formData.get('zip_code') ?? '').trim() || null,
  }

  const res = await fetch(`${API_BASE}/api/establishment`, {
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
    return { ...INITIAL, error: message, errors }
  }

  if (!res.ok) {
    return { ...INITIAL, error: 'Falha ao atualizar dados da empresa.' }
  }

  revalidatePath('/settings/company')
  return { ...INITIAL, success: true }
}
