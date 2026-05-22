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

export async function createTransactionAction(_prevState: unknown, formData: FormData) {
  const token = await getToken()
  if (!token) redirect('/login')

  const res = await fetch(`${API_BASE}/api/financial-transactions`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(buildBody(formData)),
  })

  if (res.status === 422) {
    const { message, errors } = await res.json()
    return { error: message, errors }
  }

  if (!res.ok) {
    return { error: 'Falha ao criar lançamento. Tente novamente.' }
  }

  revalidatePath('/finance')
  redirect('/finance')
}

export async function updateTransactionAction(id: string, _prevState: unknown, formData: FormData) {
  const token = await getToken()
  if (!token) redirect('/login')

  const res = await fetch(`${API_BASE}/api/financial-transactions/${id}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(buildBody(formData)),
  })

  if (res.status === 422) {
    const { message, errors } = await res.json()
    return { error: message, errors }
  }

  if (!res.ok) {
    return { error: 'Falha ao atualizar lançamento. Tente novamente.' }
  }

  revalidatePath('/finance')
  redirect('/finance')
}

export async function deleteTransactionAction(id: string) {
  const token = await getToken()
  if (!token) redirect('/login')

  await fetch(`${API_BASE}/api/financial-transactions/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  revalidatePath('/finance')
  redirect('/finance')
}

export async function payTransactionAction(id: string) {
  const token = await getToken()
  if (!token) redirect('/login')

  await fetch(`${API_BASE}/api/financial-transactions/${id}/pay`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  })

  revalidatePath('/finance')
  redirect('/finance')
}
