'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Icon } from '@/app/ui/icons'
import { toggleThemeAction } from '@/app/lib/theme'
import { logoutAction } from './actions'

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
  theme: 'light' | 'dark'
}

export function Topbar({ userName, theme }: Props) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onDocClick = () => setMenuOpen(false)
    if (menuOpen) {
      document.addEventListener('click', onDocClick)
      return () => document.removeEventListener('click', onDocClick)
    }
  }, [menuOpen])

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
        <button type="button" className="topbar-ico-btn" title="Notificações" aria-label="Notificações">
          <Icon name="bell" size={16} />
          <span className="dot" />
        </button>
        <div style={{ width: 1, height: 22, background: 'var(--border)', margin: '0 4px' }} />
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="topbar-ico-btn"
            style={{ width: 'auto', padding: '0 8px', gap: 8 }}
            onClick={(e) => { e.stopPropagation(); setMenuOpen((m) => !m) }}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
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
            <Icon name="caret_down" size={12} />
          </button>
          {menuOpen && (
            <div
              role="menu"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                minWidth: 200, padding: 6,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-md)',
                zIndex: 50,
              }}
            >
              <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-soft)', marginBottom: 4 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text)' }}>{userName}</div>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="sb-item"
                  style={{ width: '100%', cursor: 'pointer' }}
                >
                  <Icon name="logout" size={14} className="sb-icon" />
                  <span className="sb-label">Sair</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
