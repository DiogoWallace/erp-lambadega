'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { Icon, type IconName } from '@/app/ui/icons'
import type { Notification, NotificationSeverity } from '@/app/lib/types'
import {
  getDropdownNotifications,
  getUnreadCount,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from './notifications/actions'

const POLL_INTERVAL_MS = 60_000

interface Props {
  canBroadcast: boolean
}

function iconForType(type: string): IconName {
  if (type.startsWith('stock.')) return 'package'
  if (type.startsWith('finance.')) return 'finance'
  if (type === 'system.update') return 'settings'
  if (type === 'news') return 'star'
  return 'bell'
}

function severityClass(severity: NotificationSeverity): string {
  if (severity === 'critical') return 'notif-icon-critical'
  if (severity === 'warning') return 'notif-icon-warning'
  return 'notif-icon-info'
}

function formatRelative(iso: string): string {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const min = Math.round(diffMs / 60_000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `há ${h}h`
  const d = Math.round(h / 24)
  if (d < 7) return `há ${d}d`
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export function NotificationsBell({ canBroadcast }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)
  const [items, setItems] = useState<Notification[] | null>(null)
  const [loadingItems, setLoadingItems] = useState(false)
  const [, startTransition] = useTransition()
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    const tick = async () => {
      const n = await getUnreadCount()
      if (!cancelled) setCount(n)
    }
    tick()
    const id = setInterval(tick, POLL_INTERVAL_MS)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  async function handleOpen() {
    const next = !open
    setOpen(next)
    if (next) {
      setLoadingItems(true)
      const list = await getDropdownNotifications()
      setItems(list)
      setLoadingItems(false)
    }
  }

  function handleItemClick(item: Notification) {
    startTransition(async () => {
      if (!item.read_at) {
        await markNotificationReadAction(item.id)
        setCount((c) => Math.max(0, c - 1))
        setItems((prev) =>
          prev?.map((n) => (n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n)) ?? null,
        )
      }
      setOpen(false)
      if (item.action_url) router.push(item.action_url)
    })
  }

  function handleMarkAll() {
    startTransition(async () => {
      await markAllNotificationsReadAction()
      setCount(0)
      setItems((prev) =>
        prev?.map((n) => (n.read_at ? n : { ...n, read_at: new Date().toISOString() })) ?? null,
      )
    })
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="topbar-ico-btn"
        title="Notificações"
        aria-label={`Notificações${count > 0 ? ` (${count} não lidas)` : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={handleOpen}
      >
        <Icon name="bell" size={16} />
        {count > 0 && <span className="notif-badge">{count > 99 ? '99+' : count}</span>}
      </button>

      {open && (
        <div role="menu" className="notif-popover">
          <div className="notif-head">
            <strong>Notificações</strong>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleMarkAll}
              disabled={count === 0}
            >
              <Icon name="check" size={12} /> Marcar todas
            </button>
          </div>

          <div className="notif-list">
            {loadingItems ? (
              <div className="notif-empty">Carregando…</div>
            ) : !items || items.length === 0 ? (
              <div className="notif-empty">Nenhuma notificação ainda.</div>
            ) : (
              items.map((item) => {
                const unread = !item.read_at
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className={`notif-item ${unread ? 'notif-item-unread' : ''}`}
                  >
                    <span className={`notif-icon ${severityClass(item.severity)}`}>
                      <Icon name={iconForType(item.type)} size={14} />
                    </span>
                    <span className="notif-content">
                      <span className="notif-title">{item.title}</span>
                      {item.body && <span className="notif-body">{item.body}</span>}
                      <span className="notif-meta">{formatRelative(item.created_at)}</span>
                    </span>
                    {unread && <span className="notif-dot" aria-hidden="true" />}
                  </button>
                )
              })
            )}
          </div>

          <div className="notif-foot">
            <Link href="/notifications" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
              Ver todas
            </Link>
            {canBroadcast && (
              <Link href="/notifications/admin/new" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>
                <Icon name="plus" size={12} /> Nova
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
