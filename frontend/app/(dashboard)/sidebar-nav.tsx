'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Icon } from '@/app/ui/icon'

interface NavChild {
  href: string
  label: string
  badge?: string | number
  badgeKind?: 'success' | 'warning' | 'danger' | 'accent'
}

interface NavItem {
  href?: string
  id: string
  label: string
  icon: Parameters<typeof Icon>[0]['name']
  badge?: string | number
  badgeKind?: 'success' | 'warning' | 'danger' | 'accent'
  children?: NavChild[]
}

interface Section {
  title?: string
  items: NavItem[]
}

const sections: Section[] = [
  {
    items: [
      { id: 'dashboard',  href: '/dashboard',         label: 'Painel',     icon: 'dashboard' },
      { id: 'sales',      href: '/sales',             label: 'Vendas',     icon: 'sales' },
    ],
  },
  {
    title: 'Cadastros',
    items: [
      { id: 'customers',  href: '/customers',  label: 'Clientes',    icon: 'customers' },
      { id: 'suppliers',  href: '/suppliers',  label: 'Fornecedores',icon: 'suppliers' },
      { id: 'products',   href: '/products',   label: 'Produtos',    icon: 'package' },
      { id: 'categories', href: '/categories', label: 'Categorias',  icon: 'bookmark' },
    ],
  },
  {
    title: 'Operação',
    items: [
      { id: 'stock',     href: '/stock-movements', label: 'Estoque',     icon: 'inventory' },
      { id: 'finance',   href: '/finance',         label: 'Financeiro',  icon: 'finance' },
      { id: 'reports',   href: '/reports',         label: 'Relatórios',  icon: 'reports' },
    ],
  },
]

const auditItem: NavItem = {
  id: 'audit', href: '/audit-logs', label: 'Auditoria', icon: 'eye',
}

const STORAGE_KEYS = {
  collapsed: 'sidebar-collapsed',
  pinned: 'sidebar-pinned',
}

interface Props {
  canAudit?: boolean
  tenantName: string
  tenantMeta: string
  userName: string
  userRole: string
}

export function SidebarNav({ canAudit = false, tenantName, tenantMeta, userName, userRole }: Props) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [pinned, setPinned] = useState<string[]>([])

  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEYS.collapsed) === '1')
    const stored = localStorage.getItem(STORAGE_KEYS.pinned)
    if (stored) {
      try { setPinned(JSON.parse(stored)) } catch { /* ignore */ }
    }
  }, [])

  const toggleCollapse = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem(STORAGE_KEYS.collapsed, next ? '1' : '0')
  }

  const togglePin = (id: string) => {
    setPinned((p) => {
      const next = p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
      localStorage.setItem(STORAGE_KEYS.pinned, JSON.stringify(next))
      return next
    })
  }

  const allSections = canAudit
    ? [...sections, { title: 'Sistema', items: [auditItem] }]
    : sections

  const flatItems = allSections.flatMap((s) => s.items)
  const pinnedItems = pinned.map((id) => flatItems.find((i) => i.id === id)).filter(Boolean) as NavItem[]

  const isActive = (href?: string) => {
    if (!href) return false
    if (href === '/dashboard') return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  const badgeClass = (kind?: NavItem['badgeKind']) =>
    kind === 'success' ? 'sb-badge-success'
    : kind === 'warning' ? 'sb-badge-warning'
    : kind === 'danger'  ? 'sb-badge-danger'
    : ''

  const renderItem = (it: NavItem, opts: { noPin?: boolean; suffix?: string } = {}) => {
    const active = isActive(it.href)
    const isPinned = pinned.includes(it.id)
    return (
      <Link
        key={it.id + (opts.suffix ?? '')}
        href={it.href ?? '#'}
        className={`sb-item ${active ? 'active' : ''}`}
        title={collapsed ? it.label : undefined}
      >
        <Icon name={it.icon} size={16} className="sb-icon" />
        <span className="sb-label">{it.label}</span>
        {it.badge !== undefined && (
          <span className={`sb-badge ${badgeClass(it.badgeKind)}`}>{it.badge}</span>
        )}
        {!opts.noPin && (
          <button
            type="button"
            className={`sb-pin ${isPinned ? 'pinned' : ''}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePin(it.id) }}
            title={isPinned ? 'Desafixar' : 'Fixar'}
            aria-label={isPinned ? 'Desafixar' : 'Fixar'}
          >
            <Icon name={isPinned ? 'pin_filled' : 'pin'} size={13} />
          </button>
        )}
      </Link>
    )
  }

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sb-brand">
        <div className="sb-brand-mark">i</div>
        <div className="flex flex-col min-w-0">
          <div className="sb-brand-name">Inovabi</div>
          <div className="sb-brand-tag">ERP · v1.0</div>
        </div>
      </div>

      <div className="sb-tenant" title={collapsed ? tenantName : undefined}>
        <div className="sb-tenant-logo">{tenantName.charAt(0).toUpperCase()}</div>
        <div className="flex flex-col min-w-0 sb-tenant-info" style={{ flex: 1 }}>
          <div className="sb-tenant-name truncate">{tenantName}</div>
          <div className="sb-tenant-meta truncate">{tenantMeta}</div>
        </div>
      </div>

      <div className="sb-scroll">
        {pinnedItems.length > 0 && !collapsed && (
          <div className="sb-section">
            <div className="sb-section-title"><span>Fixados</span></div>
            <div className="sb-nav">
              {pinnedItems.map((it) => renderItem(it, { noPin: false, suffix: '-pin' }))}
            </div>
          </div>
        )}

        {allSections.map((sec, i) => (
          <div className="sb-section" key={i}>
            {sec.title && !collapsed && (
              <div className="sb-section-title"><span>{sec.title}</span></div>
            )}
            <div className="sb-nav">
              {sec.items.map((it) => renderItem(it))}
            </div>
          </div>
        ))}
      </div>

      <div className="sb-foot">
        <button
          type="button"
          className="sb-item"
          onClick={toggleCollapse}
          title={collapsed ? 'Expandir' : 'Recolher'}
        >
          <Icon name={collapsed ? 'chevron_r' : 'chevron_l'} size={16} className="sb-icon" />
          <span className="sb-label">Recolher</span>
        </button>
        <div className="sb-user">
          <div className="sb-avatar">{userName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}</div>
          <div className="flex flex-col min-w-0 sb-user-info" style={{ flex: 1 }}>
            <div className="sb-user-name truncate">{userName}</div>
            <div className="sb-user-role">{userRole.toUpperCase()}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
