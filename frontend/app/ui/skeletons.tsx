import React from 'react'

function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded ${className ?? ''}`}
      style={{ background: 'var(--surface-2)', ...style }}
    />
  )
}

export function PageHeaderSkeleton() {
  return (
    <div className="page-head">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton className="h-7" style={{ width: 180 }} />
        <Skeleton className="h-4" style={{ width: 220 }} />
      </div>
      <Skeleton className="h-9" style={{ width: 140, borderRadius: 'var(--r-md)' }} />
    </div>
  )
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="page">
      <PageHeaderSkeleton />

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <Skeleton className="h-9" style={{ flex: 1, borderRadius: 'var(--r-md)' }} />
        <Skeleton className="h-9" style={{ width: 140, borderRadius: 'var(--r-md)' }} />
        <Skeleton className="h-9" style={{ width: 96, borderRadius: 'var(--r-md)' }} />
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 16, padding: '12px 14px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
          {[160, 80, 120, 100, 120, 72].map((w, i) => (
            <Skeleton key={i} className="h-3" style={{ width: w }} />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px', borderBottom: i < rows - 1 ? '1px solid var(--border-soft)' : 'none' }}>
            <div style={{ width: 160, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Skeleton className="h-3" style={{ width: '100%' }} />
              <Skeleton className="h-2.5" style={{ width: '66%' }} />
            </div>
            <Skeleton className="h-3" style={{ width: 80 }} />
            <Skeleton className="h-3" style={{ width: 120 }} />
            <Skeleton className="h-3" style={{ width: 100 }} />
            <Skeleton className="h-3" style={{ width: 120 }} />
            <Skeleton className="h-5" style={{ width: 72, borderRadius: 999 }} />
            <Skeleton className="h-3" style={{ width: 40, marginLeft: 'auto' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="page" style={{ maxWidth: 880 }}>
      <div className="page-head">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skeleton className="h-7" style={{ width: 220 }} />
          <Skeleton className="h-4" style={{ width: 280 }} />
        </div>
      </div>

      <FormSectionSkeleton cols={6} />
      <FormSectionSkeleton cols={4} />

      <div className="card" style={{ padding: 18, marginBottom: 24 }}>
        <Skeleton className="h-4" style={{ width: 120, marginBottom: 12 }} />
        <Skeleton className="h-20" style={{ width: '100%', borderRadius: 'var(--r-md)' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <Skeleton className="h-9" style={{ width: 96, borderRadius: 'var(--r-md)' }} />
        <Skeleton className="h-9" style={{ width: 140, borderRadius: 'var(--r-md)' }} />
      </div>
    </div>
  )
}

function FormSectionSkeleton({ cols }: { cols: number }) {
  return (
    <div className="card" style={{ padding: 18, marginBottom: 16 }}>
      <Skeleton className="h-4" style={{ width: 140, marginBottom: 16 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Skeleton className="h-3" style={{ width: 100 }} />
            <Skeleton className="h-10" style={{ width: '100%', borderRadius: 'var(--r-md)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SidebarUserSkeleton() {
  return (
    <div className="sb-foot">
      <Skeleton className="h-3" style={{ width: 120 }} />
      <Skeleton className="h-3" style={{ width: 160, marginTop: 6 }} />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="page">
      <div className="page-head">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skeleton className="h-7" style={{ width: 180 }} />
          <Skeleton className="h-4" style={{ width: 280 }} />
        </div>
        <Skeleton className="h-9" style={{ width: 280, borderRadius: 'var(--r-md)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" style={{ borderRadius: 'var(--r-lg)' }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
        <Skeleton className="h-72" style={{ borderRadius: 'var(--r-lg)' }} />
        <Skeleton className="h-72" style={{ borderRadius: 'var(--r-lg)' }} />
      </div>
    </div>
  )
}
