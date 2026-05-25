'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { apiFetch } from '@/app/lib/api'

export async function updateSidebarPinnedAction(pinned: string[]): Promise<void> {
  await apiFetch('/me/preferences', {
    method: 'PATCH',
    body: JSON.stringify({ preferences: { sidebar_pinned: pinned } }),
  })
}

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
