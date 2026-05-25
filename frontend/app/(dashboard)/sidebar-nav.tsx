'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { Icon } from '@/app/ui/icons'
import { updateSidebarPinnedAction } from './actions'

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
  permission?: string
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
      { id: 'dashboard',  href: '/dashboard',         label: 'Painel',     icon: 'dashboard', permission: 'dashboard.view' },
      { id: 'sales',      href: '/sales',             label: 'Vendas',     icon: 'sales',     permission: 'sales.view' },
    ],
  },
  {
    title: 'Cadastros',
    items: [
      { id: 'customers',  href: '/customers',  label: 'Clientes',    icon: 'customers', permission: 'customers.view' },
      { id: 'suppliers',  href: '/suppliers',  label: 'Fornecedores',icon: 'suppliers', permission: 'suppliers.view' },
      { id: 'products',   href: '/products',   label: 'Produtos',    icon: 'package',   permission: 'products.view' },
      { id: 'categories', href: '/categories', label: 'Categorias',  icon: 'bookmark',  permission: 'categories.view' },
    ],
  },
  {
    title: 'Operação',
    items: [
      { id: 'stock',     href: '/stock-movements', label: 'Estoque',     icon: 'inventory', permission: 'stock.view' },
      { id: 'finance',   href: '/finance',         label: 'Financeiro',  icon: 'finance',   permission: 'finance.view' },
      { id: 'reports',   href: '/reports',         label: 'Relatórios',  icon: 'reports',   permission: 'reports.view' },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { id: 'audit', href: '/audit-logs', label: 'Auditoria', icon: 'eye', permission: 'audit.view' },
    ],
  },
]

const COLLAPSED_KEY = 'sidebar-collapsed'

interface Props {
  permissions: string[]
  initialPinned: string[]
  tenantName: string
  tenantMeta: string
  userName: string
  userRole: string
  mobileOpen?: boolean
  onNavigate?: () => void
}

export function SidebarNav({
  permissions,
  initialPinned,
  tenantName,
  tenantMeta,
  userName,
  userRole,
  mobileOpen = false,
  onNavigate,
}: Props) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [pinned, setPinned] = useState<string[]>(initialPinned)
  const [, startTransition] = useTransition()

  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSED_KEY) === '1')
  }, [])

  const toggleCollapse = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0')
  }

  const togglePin = (id: string) => {
    const next = pinned.includes(id) ? pinned.filter((x) => x !== id) : [...pinned, id]
    setPinned(next)
    startTransition(() => {
      updateSidebarPinnedAction(next).catch(() => {
        // se falhar, reverte o estado local para refletir o servidor
        setPinned(pinned)
      })
    })
  }

  // Filtra cada item pelas permissões do usuário; itens sem `permission` são
  // sempre visíveis. Seções inteiras somem quando ficam vazias.
  const can = (perm?: string) => !perm || permissions.includes(perm)
  const visibleSections = sections
    .map((sec) => ({ ...sec, items: sec.items.filter((it) => can(it.permission)) }))
    .filter((sec) => sec.items.length > 0)

  const flatItems = visibleSections.flatMap((s) => s.items)
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
        onClick={() => onNavigate?.()}
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
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
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

        {visibleSections.map((sec, i) => (
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
