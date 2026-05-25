'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Icon } from '@/app/ui/icons'
import { FORBIDDEN_FLASH_KEY } from './forbidden'

const AUTO_DISMISS_MS = 5000

export function FlashToast() {
  const pathname = usePathname()
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    try {
      const m = sessionStorage.getItem(FORBIDDEN_FLASH_KEY)
      if (m) {
        sessionStorage.removeItem(FORBIDDEN_FLASH_KEY)
        setMsg(m)
      }
    } catch {
      // sem storage
    }
  }, [pathname])

  useEffect(() => {
    if (!msg) return
    const id = setTimeout(() => setMsg(null), AUTO_DISMISS_MS)
    return () => clearTimeout(id)
  }, [msg])

  if (!msg) return null

  return (
    <div className="flash-toast" role="alert" aria-live="polite">
      <span className="flash-toast-icon" aria-hidden="true">!</span>
      <span className="flash-toast-msg">{msg}</span>
      <button
        type="button"
        className="flash-toast-close"
        onClick={() => setMsg(null)}
        aria-label="Fechar"
      >
        <Icon name="x" size={12} />
      </button>
    </div>
  )
}
