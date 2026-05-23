'use client'

import { useRouter } from 'next/navigation'
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
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', background: 'var(--surface)', overflow: 'hidden' }}>
        {PERIODS.map((p) => {
          const active = period === p.value
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => {
                setPeriod(p.value)
                if (p.value !== 'custom') navigate(p.value)
              }}
              style={{
                padding: '7px 12px', fontSize: 12.5, fontWeight: 500,
                background: active ? 'var(--text)' : 'transparent',
                color: active ? 'var(--text-invert)' : 'var(--text-soft)',
                border: 'none', cursor: 'pointer',
                transition: 'background .12s, color .12s',
              }}
            >
              {p.label}
            </button>
          )
        })}
      </div>

      {period === 'custom' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="input input-sm"
            style={{ width: 'auto' }}
          />
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>até</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="input input-sm"
            style={{ width: 'auto' }}
          />
          <button
            type="button"
            onClick={() => navigate('custom', dateFrom, dateTo)}
            disabled={!dateFrom || !dateTo}
            className="btn btn-primary btn-sm"
            style={{ opacity: !dateFrom || !dateTo ? 0.4 : 1 }}
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  )
}
