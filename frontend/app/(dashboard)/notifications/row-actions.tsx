'use client'

import { useTransition } from 'react'
import { Icon } from '@/app/ui/icons'
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from './actions'

export function MarkReadButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      disabled={pending}
      onClick={() => startTransition(() => markNotificationReadAction(id))}
    >
      <Icon name="check" size={12} /> Marcar como lida
    </button>
  )
}

export function MarkAllButton() {
  const [pending, startTransition] = useTransition()
  return (
    <button
      type="button"
      className="btn btn-outline btn-sm"
      disabled={pending}
      onClick={() => startTransition(() => markAllNotificationsReadAction())}
    >
      <Icon name="check" size={12} /> Marcar todas como lidas
    </button>
  )
}
