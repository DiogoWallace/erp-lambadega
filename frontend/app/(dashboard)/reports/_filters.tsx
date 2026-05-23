import Link from 'next/link'

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
    <form method="GET" action={action} className="flex flex-wrap items-end gap-3 mb-6">
      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1">De</label>
        <input
          type="date"
          name={fromName}
          defaultValue={date_from}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1">Até</label>
        <input
          type="date"
          name={toName}
          defaultValue={date_to}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
      {children}
      <button
        type="submit"
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
      >
        Filtrar
      </button>
      <Link
        href={exportHref}
        className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
        prefetch={false}
      >
        ↓ Exportar CSV
      </Link>
    </form>
  )
}
