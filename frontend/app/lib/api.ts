import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const API_BASE = process.env.API_BASE_URL ?? 'http://webserver:8001'

export async function apiFetch(path: string, options: RequestInit = {}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) redirect('/login')

  const res = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    cache: 'no-store',
  })

  if (res.status === 401) redirect('/api/auth/clear')
  if (res.status === 403) redirect('/dashboard')

  return res
}

export function getToken(): Promise<string> {
  return cookies().then(async (store) => {
    const token = store.get('token')?.value
    if (!token) redirect('/login')
    return token
  })
}
