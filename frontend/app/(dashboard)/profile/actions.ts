'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const API_BASE = process.env.API_BASE_URL ?? 'http://webserver:8001'

async function getToken(): Promise<string | null> {
  const store = await cookies()
  return store.get('token')?.value ?? null
}

export interface ProfileFormState {
  error?: string | null
  errors?: Record<string, string[]>
  success?: boolean
}

const INITIAL: ProfileFormState = { error: null, errors: undefined, success: false }

export async function updateProfileAction(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const token = await getToken()
  if (!token) redirect('/login')

  const body = {
    name:  String(formData.get('name') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim(),
    phone: String(formData.get('phone') ?? '').trim() || null,
  }

  const res = await fetch(`${API_BASE}/api/me/profile`, {
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
    return { ...INITIAL, error: 'Falha ao atualizar perfil.' }
  }

  revalidatePath('/profile', 'layout')
  return { ...INITIAL, success: true }
}

export async function changePasswordAction(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const token = await getToken()
  if (!token) redirect('/login')

  const body = {
    current_password:          String(formData.get('current_password') ?? ''),
    new_password:              String(formData.get('new_password') ?? ''),
    new_password_confirmation: String(formData.get('new_password_confirmation') ?? ''),
  }

  const res = await fetch(`${API_BASE}/api/me/password`, {
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
    return { ...INITIAL, error: message, errors }
  }

  if (!res.ok) {
    return { ...INITIAL, error: 'Falha ao alterar senha.' }
  }

  return { ...INITIAL, success: true }
}
