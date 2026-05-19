'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function logoutAction() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (token) {
    const apiUrl = process.env.API_BASE_URL ?? 'http://webserver:8001'
    await fetch(`${apiUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    }).catch(() => {})

    cookieStore.delete('token')
  }

  redirect('/login')
}
