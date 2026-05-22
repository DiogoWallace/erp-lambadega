'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

const PERIODS = [
  { value: 'today', label: 'Hoje' },
  { value: 'week',  label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
  { value: 'custom', label: 'Personalizado' },
]

interface Props {
  currentPeriod: string
  currentDateFrom?: string
  currentDateTo?: string
}

export function PeriodSelector({ currentPeriod, currentDateFrom, currentDateTo }: Props) {
  const router = useRouter()
  const [dateFrom, setDateFrom] = useState(currentDateFrom ?? '')
  const [dateTo, setDateTo]     = useState(currentDateTo ?? '')
  const [period, setPeriod]     = useState(currentPeriod)

  function navigate(p: string, from?: string, to?: string) {
    const params = new URLSearchParams({ period: p })
    if (p === 'custom' && from) params.set('date_from', from)
    if (p === 'custom' && to)   params.set('date_to', to)
    router.push(`/dashboard?${params}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex rounded-lg border border-zinc-200 bg-white overflow-hidden">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => {
              setPeriod(p.value)
              if (p.value !== 'custom') navigate(p.value)
            }}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              period === p.value
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {period === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
          <span className="text-zinc-400 text-sm">até</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
          <button
            type="button"
            onClick={() => navigate('custom', dateFrom, dateTo)}
            disabled={!dateFrom || !dateTo}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40 transition-colors"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  )
}
