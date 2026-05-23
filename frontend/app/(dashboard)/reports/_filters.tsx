import Link from 'next/link'
import { Icon } from '@/app/ui/icons'

interface DateRangeFilterProps {
  action: string
  date_from?: string
  date_to?: string
  exportHref: string
  fromName?: string
  toName?: string
  children?: React.ReactNode
}

export function DateRangeFilter({
  action, date_from, date_to, exportHref,
  fromName = 'date_from', toName = 'date_to',
  children,
}: DateRangeFilterProps) {
  return (
    <form method="GET" action={action} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 12, marginBottom: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label className="field-label">De</label>
        <input type="date" name={fromName} defaultValue={date_from} className="input input-sm" style={{ width: 160 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label className="field-label">Até</label>
        <input type="date" name={toName} defaultValue={date_to} className="input input-sm" style={{ width: 160 }} />
      </div>
      {children}
      <button type="submit" className="btn btn-primary btn-sm">
        <Icon name="filter" size={12} /> Filtrar
      </button>
      <Link href={exportHref} className="btn btn-outline btn-sm" prefetch={false}>
        <Icon name="download" size={12} /> Exportar CSV
      </Link>
    </form>
  )
}
