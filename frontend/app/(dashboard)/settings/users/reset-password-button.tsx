'use client'

import { useState, useTransition } from 'react'
import { Icon } from '@/app/ui/icons'
import { resetUserPasswordAction } from './actions'

interface Props {
  id: string
  name: string
}

export function ResetPasswordButton({ id, name }: Props) {
  const [open, setOpen] = useState(false)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleReset() {
    startTransition(async () => {
      const res = await resetUserPasswordAction(id)
      if (res.error || !res.temporary_password) {
        setError(res.error ?? 'Falha ao gerar senha.')
        return
      }
      setError(null)
      setTempPassword(res.temporary_password)
    })
  }

  function handleClose() {
    setOpen(false)
    setTempPassword(null)
    setError(null)
    setCopied(false)
  }

  async function copyToClipboard() {
    if (!tempPassword) return
    try {
      await navigator.clipboard.writeText(tempPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // user can copy manually
    }
  }

  return (
    <>
      <button type="button" className="btn btn-outline" onClick={() => setOpen(true)}>
        <Icon name="refresh" size={12} /> Resetar senha
      </button>

      {open && (
        <div className="modal-backdrop" onClick={handleClose}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            {!tempPassword ? (
              <>
                <h3 className="modal-title">Resetar senha de {name}?</h3>
                <p className="modal-sub">
                  Uma senha temporária será gerada. Os tokens ativos do usuário serão revogados e ele terá que
                  trocar a senha no próximo acesso.
                </p>
                {error && <div className="form-banner-error" style={{ marginTop: 4 }}>{error}</div>}
                <div className="modal-actions">
                  <button type="button" className="btn btn-outline" onClick={handleClose} disabled={pending}>Cancelar</button>
                  <button type="button" className="btn btn-primary" onClick={handleReset} disabled={pending}>
                    {pending ? 'Gerando…' : 'Resetar senha'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="modal-title">Senha temporária gerada</h3>
                <p className="modal-sub">
                  Copie e envie para {name}. Esta senha não poderá ser visualizada novamente.
                </p>
                <div style={{
                  padding: '14px 16px',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  fontFamily: 'var(--font-geist-mono), monospace',
                  fontSize: 16,
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  textAlign: 'center',
                  margin: '4px 0',
                  userSelect: 'all',
                }}>
                  {tempPassword}
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-outline" onClick={copyToClipboard}>
                    <Icon name={copied ? 'check' : 'invoices'} size={12} />
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleClose}>Fechar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
