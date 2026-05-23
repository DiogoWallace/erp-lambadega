'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { apiFetch } from '@/app/lib/api'
import type { Notification } from '@/app/lib/types'

export async function getUnreadCount(): Promise<number> {
  try {
    const res = await apiFetch('/notifications/unread-count')
    const json = await res.json()
    return typeof json?.count === 'number' ? json.count : 0
  } catch {
    return 0
  }
}

export async function getDropdownNotifications(): Promise<Notification[]> {
  try {
    const res = await apiFetch('/notifications/dropdown')
    const json = await res.json()
    return Array.isArray(json?.data) ? json.data : []
  } catch {
    return []
  }
}

export async function markNotificationReadAction(id: string): Promise<void> {
  await apiFetch(`/notifications/${id}/read`, { method: 'POST' })
  revalidatePath('/notifications')
}

export async function markAllNotificationsReadAction(): Promise<void> {
  await apiFetch('/notifications/mark-all-read', { method: 'POST' })
  revalidatePath('/notifications')
}

export interface BroadcastFormState {
  error: string | null
}

export async function broadcastNotificationAction(
  _prev: BroadcastFormState,
  formData: FormData,
): Promise<BroadcastFormState> {
  const payload = {
    type:       String(formData.get('type') ?? 'news'),
    severity:   String(formData.get('severity') ?? 'info'),
    title:      String(formData.get('title') ?? '').trim(),
    body:       String(formData.get('body') ?? '').trim() || null,
    action_url: String(formData.get('action_url') ?? '').trim() || null,
  }

  if (!payload.title) {
    return { error: 'Informe um título.' }
  }

  const res = await apiFetch('/notifications/broadcast', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => null)
    return { error: err?.message ?? 'Falha ao enviar notificação.' }
  }

  revalidatePath('/notifications')
  redirect('/notifications')
}
