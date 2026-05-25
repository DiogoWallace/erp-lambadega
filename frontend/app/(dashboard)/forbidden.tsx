'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export const FORBIDDEN_FLASH_KEY = 'forbidden_flash'
const FALLBACK_MESSAGE =
  'Você não tem permissão para esta ação. Solicite a liberação ao seu gestor.'

export default function Forbidden() {
  const router = useRouter()
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    try {
      sessionStorage.setItem(FORBIDDEN_FLASH_KEY, FALLBACK_MESSAGE)
    } catch {
      // sessionStorage indisponível (modo privado etc.) — segue sem flash
    }

    const ref = typeof document !== 'undefined' ? document.referrer : ''
    const sameOrigin = ref && ref.startsWith(window.location.origin) && ref !== window.location.href

    if (sameOrigin) {
      router.back()
    } else {
      router.replace('/dashboard')
    }
  }, [router])

  return null
}
