import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const API_BASE = process.env.API_BASE_URL ?? 'http://webserver:8001'

interface ApiFetchOptions extends RequestInit {
  /**
   * Quando true, NÃO redireciona em 403 e NÃO joga em 5xx — apenas devolve
   * a Response. Útil para chamadas auxiliares (ex.: dropdowns de filtro)
   * que devem degradar silenciosamente quando o usuário não tem a permissão
   * de leitura do recurso secundário.
   */
  optional?: boolean
}

export async function apiFetch(path: string, options: ApiFetchOptions = {}) {
  const { optional, headers, ...rest } = options

  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) redirect('/login')

  const res = await fetch(`${API_BASE}/api${path}`, {
    ...rest,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...headers,
    },
    cache: 'no-store',
  })

  if (res.status === 401) redirect('/api/auth/clear')
  if (!optional && res.status === 403) redirect('/dashboard')
  if (!optional && res.status >= 500) throw new Error(`API unavailable (${res.status})`)

  return res
}

export function getToken(): Promise<string> {
  return cookies().then(async (store) => {
    const token = store.get('token')?.value
    if (!token) redirect('/login')
    return token
  })
}
