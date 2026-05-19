import React from 'react'

function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse rounded bg-zinc-200 ${className ?? ''}`} style={style} />
}

export function PageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-9 w-32 rounded-lg" />
    </div>
  )
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="p-8">
      <PageHeaderSkeleton />

      {/* filtros */}
      <div className="flex gap-3 mb-6">
        <Skeleton className="flex-1 h-9 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
        <Skeleton className="h-9 w-20 rounded-lg" />
      </div>

      {/* tabela */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {/* header */}
        <div className="flex gap-4 px-4 py-3 border-b border-zinc-100 bg-zinc-50">
          {[160, 60, 120, 100, 120, 72].map((w, i) => (
            <Skeleton key={i} className="h-3" style={{ width: w }} />
          ))}
        </div>
        {/* rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-zinc-100 last:border-0">
            <div className="space-y-1.5" style={{ width: 160 }}>
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-2.5 w-2/3" />
            </div>
            <Skeleton className="h-3 w-[60px]" />
            <Skeleton className="h-3 w-[120px]" />
            <Skeleton className="h-3 w-[100px]" />
            <Skeleton className="h-3 w-[120px]" />
            <Skeleton className="h-5 w-[72px] rounded-full" />
            <Skeleton className="h-3 w-10 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="p-8 max-w-3xl">
      {/* page header */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* section 1 */}
      <FormSectionSkeleton label cols={7} />

      {/* section 2 */}
      <FormSectionSkeleton label cols={7} />

      {/* section 3 */}
      <div className="space-y-3 mb-8">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>

      {/* actions */}
      <div className="flex justify-end gap-3">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
    </div>
  )
}

function FormSectionSkeleton({ cols }: { label?: boolean; cols: number }) {
  return (
    <div className="mb-8">
      <Skeleton className="h-4 w-32 mb-4" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SidebarUserSkeleton() {
  return (
    <div className="px-4 py-4 border-t border-zinc-100 space-y-2">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-3 w-36" />
      <Skeleton className="h-3 w-14 mt-3" />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="p-8">
      <Skeleton className="h-7 w-36 mb-2" />
      <Skeleton className="h-4 w-52" />
    </div>
  )
}
