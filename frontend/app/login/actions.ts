'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAction(_prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const apiUrl = process.env.API_BASE_URL ?? 'http://webserver:8001'

  let token: string | null = null

  try {
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.message ?? 'Credenciais inválidas.' }
    }

    token = data.data.token
  } catch {
    return { error: 'Não foi possível conectar ao servidor. Tente novamente.' }
  }

  const cookieStore = await cookies()
  cookieStore.set('token', token!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24,
    path: '/',
  })

  redirect('/dashboard')
}
