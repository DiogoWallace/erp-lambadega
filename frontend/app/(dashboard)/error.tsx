'use client'

import { useEffect } from 'react'

export default function DashboardError({
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-[var(--text-faint)]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-[var(--text)] mb-1">Something went wrong</h2>
      <p className="text-sm text-[var(--text-muted)] mb-6 max-w-sm">
        {error.message ?? 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-[var(--text)] px-4 py-2 text-sm font-medium text-[var(--surface)] hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  )
}
