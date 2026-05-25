'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/app/ui/icons'
import { toggleThemeAction } from '@/app/lib/theme'
import { logoutAction } from './actions'
import { NotificationsBell } from './notifications-bell'

const LABELS: Record<string, string> = {
  dashboard: 'Painel',
  sales: 'Vendas',
  customers: 'Clientes',
  suppliers: 'Fornecedores',
  products: 'Produtos',
  categories: 'Categorias',
  'stock-movements': 'Movimentações',
  finance: 'Financeiro',
  reports: 'Relatórios',
  'audit-logs': 'Auditoria',
  new: 'Novo',
  edit: 'Editar',
  'top-products': 'Top produtos',
  'cash-flow': 'Fluxo de caixa',
  accounts: 'Contas',
  sales_report: 'Vendas',
}

function humanize(segment: string): string {
  if (LABELS[segment]) return LABELS[segment]
  if (/^[0-9a-f-]{8,}$/i.test(segment)) return '…'
  return segment.charAt(0).toUpperCase() + segment.slice(1)
}

interface Props {
  userName: string
  userRole: string
  userAvatar: string | null
  theme: 'light' | 'dark'
  canBroadcast: boolean
  canSettings: boolean
  onMenuClick?: () => void
}

export function Topbar({ userName, userRole, userAvatar, theme, canBroadcast, canSettings, onMenuClick }: Props) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onDocClick = (e: MouseEvent) => {
      if (menuWrapRef.current?.contains(e.target as Node)) return
      setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  const segments = pathname.split('/').filter(Boolean)
  const crumbs = segments.map((seg, i) => ({
    label: humanize(seg),
    href: '/' + segments.slice(0, i + 1).join('/'),
  }))

  const initials = userName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="topbar">
      <button
        type="button"
        className="topbar-burger"
        onClick={onMenuClick}
        aria-label="Abrir menu"
      >
        <Icon name="menu" size={18} />
      </button>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/dashboard">Início</Link>
        {crumbs.map((c, i) => (
          <span key={c.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span className="sep">/</span>
            {i === crumbs.length - 1 ? (
              <span className="current">{c.label}</span>
            ) : (
              <Link href={c.href}>{c.label}</Link>
            )}
          </span>
        ))}
      </nav>

      <div className="topbar-search">
        <Icon name="search" size={14} className="topbar-search-icon" />
        <input className="input" placeholder="Buscar por cliente, produto, pedido (ORD-...)..." aria-label="Buscar" />
        <kbd className="kbd">⌘K</kbd>
      </div>

      <div className="topbar-actions">
        <form action={toggleThemeAction}>
          <button type="submit" className="topbar-ico-btn" title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'} aria-label="Alternar tema">
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
          </button>
        </form>
        <NotificationsBell canBroadcast={canBroadcast} />
        <div style={{ width: 1, height: 22, background: 'var(--border)', margin: '0 4px' }} />
        <div ref={menuWrapRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className="topbar-ico-btn"
            style={{ width: 'auto', padding: '0 8px', gap: 8 }}
            onClick={() => setMenuOpen((m) => !m)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            {userAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userAvatar}
                alt=""
                style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <span
                style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: 'linear-gradient(135deg, oklch(0.65 0.13 28), oklch(0.55 0.16 18))',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 600, fontSize: 11,
                }}
              >
                {initials || 'U'}
              </span>
            )}
            <Icon name="caret_down" size={12} />
          </button>
          {menuOpen && (
            <div role="menu" className="user-menu">
              <div className="user-menu-head">
                <div className="user-menu-name">{userName}</div>
                <div className="user-menu-role">{userRole}</div>
              </div>

              <Link href="/profile" className="user-menu-item" onClick={closeMenu}>
                <Icon name="customers" size={14} />
                <span>Meu perfil</span>
              </Link>

              <Link href="/notifications" className="user-menu-item" onClick={closeMenu}>
                <Icon name="bell" size={14} />
                <span>Notificações</span>
              </Link>

              <Link href="/preferences" className="user-menu-item" onClick={closeMenu}>
                <Icon name={theme === 'dark' ? 'moon' : 'sun'} size={14} />
                <span>Preferências</span>
              </Link>

              {canSettings && (
                <Link href="/settings" className="user-menu-item" onClick={closeMenu}>
                  <Icon name="settings" size={14} />
                  <span>Configurações</span>
                </Link>
              )}

              <div className="user-menu-item user-menu-item-disabled" aria-disabled="true">
                <Icon name="package" size={14} />
                <span style={{ flex: 1 }}>Ajuda / Suporte</span>
                <span className="badge badge-info">Em breve</span>
              </div>

              <div className="user-menu-item user-menu-item-disabled" aria-disabled="true">
                <Icon name="edit" size={14} />
                <span style={{ flex: 1 }}>Enviar feedback</span>
                <span className="badge badge-info">Em breve</span>
              </div>

              <div className="user-menu-sep" />

              <form action={logoutAction}>
                <button type="submit" className="user-menu-item user-menu-item-danger" style={{ width: '100%' }}>
                  <Icon name="logout" size={14} />
                  <span>Sair</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
