export function formatBRL(value: number | string): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    typeof value === 'string' ? parseFloat(value) : value,
  )
}

export function formatDate(value: string | null): string {
  if (!value) return '—'
  const date = value.length === 10 ? value.split('-').reverse().join('/') : null
  if (date) return date
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function defaultDateRange(): { from: string; to: string } {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return { from: toIsoDate(from), to: toIsoDate(to) }
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function buildExportHref(type: 'sales' | 'top-products' | 'cash-flow' | 'accounts', filters: Record<string, string | undefined>): string {
  const params = new URLSearchParams({ type })
  for (const [k, v] of Object.entries(filters)) {
    if (v) params.set(k, v)
  }
  return `/api/reports/export?${params}`
}
