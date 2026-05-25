import { Icon } from '@/app/ui/icons'
import { getTheme, toggleThemeAction } from '@/app/lib/theme'
import { LoginForm } from './login-form'

export const dynamic = 'force-dynamic'

const HIGHLIGHTS: { icon: Parameters<typeof Icon>[0]['name']; text: string }[] = [
  { icon: 'pos',       text: 'PDV completo com parcelamento e múltiplas formas de pagamento' },
  { icon: 'inventory', text: 'Estoque com log imutável e alertas automáticos' },
  { icon: 'finance',   text: 'Contas a pagar/receber e fluxo de caixa' },
  { icon: 'reports',   text: 'Relatórios analíticos com exportação CSV' },
]

export default async function LoginPage() {
  const theme = await getTheme()

  return (
    <div className="auth-shell">
      <aside className="auth-brand" aria-hidden="true">
        <div className="auth-brand-top">
          <div className="auth-brand-row">
            <span className="auth-brand-mark">I</span>
            <span className="auth-brand-name">Inovabi</span>
          </div>
          <p className="auth-brand-tag">ERP comercial multi-tenant</p>
        </div>

        <div className="auth-brand-pitch">
          <h2 className="auth-brand-headline">Toda a operação da sua loja num só lugar.</h2>
          <ul className="auth-brand-features">
            {HIGHLIGHTS.map((h) => (
              <li key={h.icon}>
                <span className="auth-brand-icon"><Icon name={h.icon} size={14} /></span>
                <span>{h.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="auth-brand-foot">v1.0 · Inovabi</p>
      </aside>

      <main className="auth-main">
        <div className="auth-topbar">
          <form action={toggleThemeAction}>
            <button
              type="submit"
              className="topbar-ico-btn"
              title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
              aria-label="Alternar tema"
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
            </button>
          </form>
        </div>

        <div className="auth-card">
          <div className="auth-mobile-brand">
            <span className="auth-brand-mark">I</span>
            <span>Inovabi ERP</span>
          </div>

          <h1 className="auth-title">Entrar na sua conta</h1>
          <p className="auth-sub">Informe seu e-mail e senha para acessar o painel.</p>

          <LoginForm />

          <p className="auth-help">
            Problemas para acessar? Procure o administrador do seu estabelecimento.
          </p>
        </div>

        <p className="auth-foot-mobile">v1.0 · Inovabi</p>
      </main>
    </div>
  )
}
