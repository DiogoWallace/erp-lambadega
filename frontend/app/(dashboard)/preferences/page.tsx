import { getTheme, toggleThemeAction } from '@/app/lib/theme'
import { Icon } from '@/app/ui/icons'

export default async function PreferencesPage() {
  const theme = await getTheme()

  return (
    <div className="page page-form">
      <div className="page-head">
        <div>
          <h1 className="page-title">Preferências</h1>
          <p className="page-subtitle">Ajustes pessoais que afetam apenas o seu acesso.</p>
        </div>
      </div>

      <section className="card">
        <div className="card-head"><div><h3>Aparência</h3></div></div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="settings-row">
            <div>
              <div className="settings-row-title">Tema</div>
              <div className="settings-row-desc">
                Atualmente em modo {theme === 'dark' ? 'escuro' : 'claro'}.
              </div>
            </div>
            <form action={toggleThemeAction}>
              <button type="submit" className="btn btn-outline btn-sm">
                <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={12} />
                Alternar para modo {theme === 'dark' ? 'claro' : 'escuro'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <div style={{ height: 12 }} />

      <section className="card">
        <div className="card-head"><div><h3>Regional</h3></div></div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="settings-row">
            <div>
              <div className="settings-row-title">Idioma</div>
              <div className="settings-row-desc">Outros idiomas serão adicionados em versões futuras.</div>
            </div>
            <select className="input input-sm" defaultValue="pt-BR" disabled style={{ width: 200 }}>
              <option value="pt-BR">Português (Brasil)</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  )
}
