'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export type Theme = 'light' | 'dark'

const THEME_COOKIE_OPTIONS = {
  path: '/',
  httpOnly: false,
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 365,
}

export async function getTheme(): Promise<Theme> {
  const store = await cookies()
  return store.get('theme')?.value === 'dark' ? 'dark' : 'light'
}

export async function setThemeCookie(theme: Theme): Promise<void> {
  const store = await cookies()
  store.set('theme', theme, THEME_COOKIE_OPTIONS)
}

export async function toggleThemeAction(): Promise<void> {
  const store = await cookies()
  const current = store.get('theme')?.value === 'dark' ? 'dark' : 'light'
  const next: Theme = current === 'dark' ? 'light' : 'dark'
  store.set('theme', next, THEME_COOKIE_OPTIONS)

  // Persiste no backend (não bloqueia o toggle visual se falhar — ex.: usuário
  // deslogado ou backend offline).
  const token = store.get('token')?.value
  if (token) {
    const apiUrl = process.env.API_BASE_URL ?? 'http://webserver:8001'
    await fetch(`${apiUrl}/api/me/preferences`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ preferences: { theme: next } }),
    }).catch(() => {})
  }

  revalidatePath('/', 'layout')
}
