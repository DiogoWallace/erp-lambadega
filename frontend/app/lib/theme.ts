'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export type Theme = 'light' | 'dark'

export async function getTheme(): Promise<Theme> {
  const store = await cookies()
  return store.get('theme')?.value === 'dark' ? 'dark' : 'light'
}

export async function toggleThemeAction(): Promise<void> {
  const store = await cookies()
  const current = store.get('theme')?.value === 'dark' ? 'dark' : 'light'
  const next: Theme = current === 'dark' ? 'light' : 'dark'
  store.set('theme', next, {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  })
  revalidatePath('/', 'layout')
}
