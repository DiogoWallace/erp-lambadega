'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const API_BASE = process.env.API_BASE_URL ?? 'http://webserver:8001'

async function getToken(): Promise<string | null> {
  const store = await cookies()
  return store.get('token')?.value ?? null
}

export interface UserFormState {
  error?: string | null
  errors?: Record<string, string[]>
}

const INITIAL: UserFormState = { error: null, errors: undefined }

function buildCreatePayload(formData: FormData) {
  return {
    name:     String(formData.get('name') ?? '').trim(),
    email:    String(formData.get('email') ?? '').trim(),
    phone:    String(formData.get('phone') ?? '').trim() || null,
    password: String(formData.get('password') ?? ''),
    role:     String(formData.get('role') ?? ''),
  }
}

function buildUpdatePayload(formData: FormData) {
  return {
    name:      String(formData.get('name') ?? '').trim(),
    email:     String(formData.get('email') ?? '').trim(),
    phone:     String(formData.get('phone') ?? '').trim() || null,
    role:      String(formData.get('role') ?? ''),
    is_active: formData.get('is_active') === 'true',
  }
}

export async function createUserAction(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const token = await getToken()
  if (!token) redirect('/login')

  const res = await fetch(`${API_BASE}/api/users`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(buildCreatePayload(formData)),
  })

  if (res.status === 422) {
    const { message, errors } = await res.json()
    return { error: message, errors }
  }

  if (!res.ok) {
    return { error: 'Falha ao criar usuário.' }
  }

  revalidatePath('/settings/users')
  redirect('/settings/users')
}

export async function updateUserAction(
  id: string,
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const token = await getToken()
  if (!token) redirect('/login')

  const res = await fetch(`${API_BASE}/api/users/${id}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(buildUpdatePayload(formData)),
  })

  if (res.status === 422) {
    const { message, errors } = await res.json()
    return { error: message, errors }
  }

  if (!res.ok) {
    return { error: 'Falha ao atualizar usuário.' }
  }

  revalidatePath('/settings/users')
  redirect('/settings/users')
}

export async function deleteUserAction(id: string): Promise<void> {
  const token = await getToken()
  if (!token) redirect('/login')

  await fetch(`${API_BASE}/api/users/${id}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  })

  revalidatePath('/settings/users')
  redirect('/settings/users')
}

export interface ResetPasswordResult {
  error?: string | null
  temporary_password?: string | null
}

export async function resetUserPasswordAction(id: string): Promise<ResetPasswordResult> {
  const token = await getToken()
  if (!token) redirect('/login')

  const res = await fetch(`${API_BASE}/api/users/${id}/reset-password`, {
    method: 'POST',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    return { error: 'Falha ao resetar senha.' }
  }

  const json = await res.json()
  revalidatePath('/settings/users')
  return { temporary_password: json?.data?.temporary_password ?? null }
}
