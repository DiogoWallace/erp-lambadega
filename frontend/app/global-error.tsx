'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="pt-BR">
      <body
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          textAlign: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
          color: '#222',
          background: '#fafafa',
        }}
      >
        <h1 style={{ fontWeight: 600, fontSize: 22, margin: '0 0 8px' }}>Algo deu errado</h1>
        <p style={{ fontSize: 14, color: '#666', margin: '0 0 20px', maxWidth: 420 }}>
          {error.message ?? 'Ocorreu um erro inesperado. Tente novamente.'}
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 13.5, fontWeight: 500,
            background: '#111', color: '#fff', border: 'none', cursor: 'pointer',
          }}
        >
          Tentar novamente
        </button>
      </body>
    </html>
  )
}
