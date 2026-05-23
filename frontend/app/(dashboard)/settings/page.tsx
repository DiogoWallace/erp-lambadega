import Link from 'next/link'
import { redirect } from 'next/navigation'
import { apiFetch } from '@/app/lib/api'
import { Icon, type IconName } from '@/app/ui/icons'

interface Card {
  title: string
  description: string
  href: string | null
  icon: IconName
  available: boolean
  badge?: string
}

export default async function SettingsPage() {
  const res = await apiFetch('/auth/me')
  const { data: user } = await res.json()
  const permissions: string[] = user?.permissions ?? []

  if (!permissions.includes('settings.view')) {
    redirect('/dashboard')
  }

  const canEditCompany = permissions.includes('settings.edit')
  const canViewUsers = permissions.includes('users.view')

  const cards: Card[] = [
    {
      title: 'Empresa',
      description: 'Dados cadastrais do estabelecimento: nome, CNPJ, endereço, contato.',
      href: canEditCompany ? '/settings/company' : null,
      icon: 'suppliers',
      available: canEditCompany,
    },
    {
      title: 'Usuários',
      description: 'Cadastro de colaboradores e atribuição de cargos.',
      href: canViewUsers ? '/settings/users' : null,
      icon: 'customers',
      available: canViewUsers,
    },
    {
      title: 'Preferências',
      description: 'Tema (claro/escuro) e outras opções pessoais.',
      href: '/settings/preferences',
      icon: 'settings',
      available: true,
    },
    {
      title: 'Integrações',
      description: 'Conectores externos (pagamentos, fiscal, banco) — futuro.',
      href: null,
      icon: 'package',
      available: false,
      badge: 'Em breve',
    },
  ]

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Configurações</h1>
          <p className="page-subtitle">Ajustes do estabelecimento e preferências pessoais.</p>
        </div>
      </div>

      <div className="settings-grid">
        {cards.map((card) => {
          const inner = (
            <div className={`settings-card ${!card.available ? 'settings-card-disabled' : ''}`}>
              <div className="settings-card-icon"><Icon name={card.icon} size={18} /></div>
              <div className="settings-card-body">
                <div className="settings-card-title">
                  {card.title}
                  {card.badge && <span className="badge badge-info" style={{ marginLeft: 8 }}>{card.badge}</span>}
                </div>
                <div className="settings-card-desc">{card.description}</div>
              </div>
              {card.available && card.href && <Icon name="arrow_right" size={14} className="settings-card-arrow" />}
            </div>
          )

          return card.href && card.available
            ? <Link key={card.title} href={card.href} className="settings-card-link">{inner}</Link>
            : <div key={card.title} className="settings-card-link">{inner}</div>
        })}
      </div>
    </div>
  )
}
