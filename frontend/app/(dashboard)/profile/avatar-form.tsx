'use client'

import { useActionState, useRef, useState, useTransition } from 'react'
import { Icon } from '@/app/ui/icons'
import { removeAvatarAction, uploadAvatarAction, type ProfileFormState } from './actions'

const INITIAL: ProfileFormState = { error: null, errors: undefined, success: false }

interface Props {
  user: { name: string; avatar_url: string | null }
}

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'
}

export function AvatarForm({ user }: Props) {
  const [state, formAction, pending] = useActionState(uploadAvatarAction, INITIAL)
  const [removing, startRemove] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [filename, setFilename] = useState<string>('')

  return (
    <form ref={formRef} action={formAction} className="form-stack">
      {state.error && <div className="form-banner-error">{state.error}</div>}
      {state.success && <div className="form-banner-success">Foto atualizada com sucesso.</div>}

      <section className="card">
        <div className="card-head"><div><h3>Foto de perfil</h3></div></div>
        <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20 }}>
          <div className="avatar-preview">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt="Foto de perfil" />
            ) : (
              <span className="avatar-preview-fallback">{initialsOf(user.name)}</span>
            )}
          </div>

          <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              ref={inputRef}
              type="file"
              name="avatar"
              accept="image/png,image/jpeg,image/webp"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.currentTarget.files?.[0]
                setFilename(f?.name ?? '')
                if (f) formRef.current?.requestSubmit()
              }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={pending || removing}
                onClick={() => inputRef.current?.click()}
              >
                <Icon name="upload" size={12} />
                {pending ? 'Enviando…' : user.avatar_url ? 'Alterar foto' : 'Enviar foto'}
              </button>
              {user.avatar_url && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={pending || removing}
                  onClick={() => startRemove(() => removeAvatarAction())}
                >
                  <Icon name="trash" size={12} />
                  {removing ? 'Removendo…' : 'Remover'}
                </button>
              )}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
              JPG, PNG ou WEBP. Máximo 2 MB, 2000×2000 pixels.
            </p>
            {filename && !state.success && !state.error && (
              <p style={{ fontSize: 12, color: 'var(--text-soft)', margin: 0 }}>{filename}</p>
            )}
          </div>
        </div>
      </section>
    </form>
  )
}
