'use client'

import React, { useActionState, useState } from 'react'
import { Supplier } from '@/app/lib/types'
import { Icon } from '@/app/ui/icons'

const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

interface FormState {
  error?: string
  errors?: Record<string, string[]>
}

interface Props {
  action: (prevState: unknown, formData: FormData) => Promise<FormState | undefined>
  supplier?: Supplier
  submitLabel: string
  title: string
  subtitle: string
  deleteButton?: React.ReactNode
}

function FieldError({ errors, field }: { errors?: Record<string, string[]>; field: string }) {
  const msg = errors?.[field]?.[0]
  if (!msg) return null
  return (
    <p className="text-[11px] text-[var(--danger)] font-medium mt-1.5 flex items-center gap-1 animate-fadeIn">
      <span className="w-1 h-1 rounded-full bg-[var(--danger)] shrink-0"></span>
      {msg}
    </p>
  )
}

export function SupplierForm({ action, supplier, submitLabel, title, subtitle, deleteButton }: Props) {
  const [state, formAction, pending] = useActionState(action, null)

  // Estados controlados para integração com a busca de CEP
  const [zipCode, setZipCode] = useState(supplier?.zip_code ?? '')
  const [address, setAddress] = useState(supplier?.address ?? '')
  const [city, setCity] = useState(supplier?.city ?? '')
  const [stateVal, setStateVal] = useState(supplier?.state ?? '')
  const [searchingCep, setSearchingCep] = useState(false)

  // Função para consultar o CEP via ViaCEP
  async function handleCepSearch(e: React.MouseEvent) {
    e.preventDefault()
    const cleanCep = zipCode.replace(/\D/g, '')
    if (cleanCep.length !== 8) {
      alert('Por favor, informe um CEP válido com 8 dígitos.')
      return
    }
    setSearchingCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await res.json()
      if (data.erro) {
        alert('CEP não encontrado.')
      } else {
        setAddress(data.logradouro || '')
        setCity(data.localidade || '')
        setStateVal(data.uf || '')
      }
    } catch (err) {
      console.error(err)
      alert('Erro ao buscar o CEP. Tente preencher manualmente.')
    } finally {
      setSearchingCep(false)
    }
  }

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Form Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <nav className="flex items-center gap-2 text-[var(--text-muted)] text-[11px] uppercase tracking-widest font-bold">
            <span>Cadastros</span>
            <Icon name="chevron_r" size={10} className="text-[var(--text-faint)]" />
            <span>Fornecedores</span>
            <Icon name="chevron_r" size={10} className="text-[var(--text-faint)]" />
            <span className="text-[var(--accent)]">{supplier ? 'Editar' : 'Novo'}</span>
          </nav>
          <h2 className="text-3xl font-extrabold text-[var(--text)] tracking-tight">{title}</h2>
          <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>
        </div>
        
        {/* Top actions (Hidden on mobile) */}
        <div className="hidden md:flex gap-3">
          <a href="/suppliers" className="btn btn-outline" style={{ height: 40, borderRadius: 10 }}>
            Cancelar
          </a>
          <button
            type="submit"
            form="supplier-form"
            disabled={pending}
            className="btn btn-primary shadow-lg shadow-[var(--accent)]/15 hover:scale-[1.02] active:scale-[0.98] transition-all"
            style={{ height: 40, padding: '0 20px', borderRadius: 10 }}
          >
            {pending ? 'Salvando...' : submitLabel}
          </button>
        </div>
      </div>

      {state?.error && (
        <div className="p-4 bg-[var(--danger-soft)] border border-[var(--danger)]/20 rounded-xl text-[var(--danger)] text-sm font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--danger)] shrink-0"></span>
          {state.error}
        </div>
      )}

      {/* Main Form Shell */}
      <form action={formAction} id="supplier-form">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Column: Data cards (span 8 on desktop, 12 on mobile) */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* Card: Dados Principais */}
            <div className="card bg-[var(--surface)] p-6 border border-[var(--border-soft)] shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-[var(--accent)]">
                <Icon name="suppliers" size={18} stroke={2.5} />
                <h3 className="text-base font-extrabold text-[var(--text)] tracking-tight">Dados Principais</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="col-span-1 md:col-span-2">
                  <label className="field-label" htmlFor="company_name">Razão Social *</label>
                  <input
                    id="company_name"
                    name="company_name"
                    type="text"
                    defaultValue={supplier?.company_name ?? ''}
                    placeholder="Razão social completa da empresa"
                    className="input bg-[var(--surface)] border-[var(--border)] focus:border-[var(--accent)]"
                    style={{ height: 42, borderRadius: 10 }}
                  />
                  <FieldError errors={state?.errors} field="company_name" />
                </div>

                <div className="col-span-1">
                  <label className="field-label" htmlFor="trade_name">Nome Fantasia</label>
                  <input
                    id="trade_name"
                    name="trade_name"
                    type="text"
                    defaultValue={supplier?.trade_name ?? ''}
                    placeholder="Nome comercial ou marca"
                    className="input bg-[var(--surface)] border-[var(--border)] focus:border-[var(--accent)]"
                    style={{ height: 42, borderRadius: 10 }}
                  />
                  <FieldError errors={state?.errors} field="trade_name" />
                </div>

                <div className="col-span-1">
                  <label className="field-label" htmlFor="cnpj">CNPJ</label>
                  <input
                    id="cnpj"
                    name="cnpj"
                    type="text"
                    defaultValue={supplier?.cnpj ?? ''}
                    placeholder="00.000.000/0001-00"
                    className="input bg-[var(--surface)] border-[var(--border)] focus:border-[var(--accent)]"
                    style={{ height: 42, borderRadius: 10 }}
                  />
                  <FieldError errors={state?.errors} field="cnpj" />
                </div>

                <div className="col-span-1">
                  <label className="field-label" htmlFor="contact_name">Nome do Contato</label>
                  <input
                    id="contact_name"
                    name="contact_name"
                    type="text"
                    defaultValue={supplier?.contact_name ?? ''}
                    placeholder="Vendedor ou contato principal"
                    className="input bg-[var(--surface)] border-[var(--border)] focus:border-[var(--accent)]"
                    style={{ height: 42, borderRadius: 10 }}
                  />
                  <FieldError errors={state?.errors} field="contact_name" />
                </div>

                <div className="col-span-1">
                  <label className="field-label" htmlFor="email">E-mail de Contato</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={supplier?.email ?? ''}
                    placeholder="contato@fornecedor.com"
                    className="input bg-[var(--surface)] border-[var(--border)] focus:border-[var(--accent)]"
                    style={{ height: 42, borderRadius: 10 }}
                  />
                  <FieldError errors={state?.errors} field="email" />
                </div>

                <div className="col-span-1">
                  <label className="field-label" htmlFor="phone">Telefone / WhatsApp</label>
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    defaultValue={supplier?.phone ?? ''}
                    placeholder="(11) 99999-9999"
                    className="input bg-[var(--surface)] border-[var(--border)] focus:border-[var(--accent)]"
                    style={{ height: 42, borderRadius: 10 }}
                  />
                  <FieldError errors={state?.errors} field="phone" />
                </div>

                <div className="col-span-1">
                  <label className="field-label" htmlFor="website">Website</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-[11px] text-[var(--text-faint)] pointer-events-none select-none">
                      https://
                    </span>
                    <input
                      id="website"
                      name="website"
                      type="text"
                      defaultValue={supplier?.website ? supplier.website.replace(/^https?:\/\//, '') : ''}
                      placeholder="www.fornecedor.com.br"
                      className="input pl-16 bg-[var(--surface)] border-[var(--border)] focus:border-[var(--accent)]"
                      style={{ height: 42, borderRadius: 10 }}
                    />
                  </div>
                  <FieldError errors={state?.errors} field="website" />
                </div>
              </div>
            </div>

            {/* Card: Endereço */}
            <div className="card bg-[var(--surface)] p-6 border border-[var(--border-soft)] shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-[var(--accent)]">
                <Icon name="pin" size={18} stroke={2.5} />
                <h3 className="text-base font-extrabold text-[var(--text)] tracking-tight">Localização & Endereço</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="col-span-1">
                  <label className="field-label" htmlFor="zip_code">CEP</label>
                  <div className="flex gap-2">
                    <input
                      id="zip_code"
                      name="zip_code"
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="00000-000"
                      className="input flex-1 bg-[var(--surface)] border-[var(--border)] focus:border-[var(--accent)]"
                      style={{ height: 42, borderRadius: 10 }}
                    />
                    <button
                      onClick={handleCepSearch}
                      disabled={searchingCep}
                      className="btn btn-outline shrink-0 w-11 h-11 flex items-center justify-center p-0"
                      style={{ borderRadius: 10 }}
                      title="Buscar Endereço pelo CEP"
                    >
                      <Icon name={searchingCep ? 'refresh' : 'search'} size={16} className={searchingCep ? 'animate-spin' : ''} />
                    </button>
                  </div>
                  <FieldError errors={state?.errors} field="zip_code" />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="field-label" htmlFor="city">Cidade</label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Nome da Cidade"
                    className="input bg-[var(--surface)] border-[var(--border)] focus:border-[var(--accent)]"
                    style={{ height: 42, borderRadius: 10 }}
                  />
                  <FieldError errors={state?.errors} field="city" />
                </div>

                <div className="col-span-1">
                  <label className="field-label" htmlFor="state">UF (Estado)</label>
                  <select
                    id="state"
                    name="state"
                    value={stateVal}
                    onChange={(e) => setStateVal(e.target.value)}
                    className="input bg-[var(--surface)] border-[var(--border)] focus:border-[var(--accent)]"
                    style={{ height: 42, borderRadius: 10 }}
                  >
                    <option value="">Selecionar...</option>
                    {STATES.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                  <FieldError errors={state?.errors} field="state" />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="field-label" htmlFor="address">Logradouro Completo</label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, número, complemento e bairro"
                    className="input bg-[var(--surface)] border-[var(--border)] focus:border-[var(--accent)]"
                    style={{ height: 42, borderRadius: 10 }}
                  />
                  <FieldError errors={state?.errors} field="address" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Aux cards (span 4 on desktop, 12 on mobile) */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* Card: Status & Observações */}
            <div className="card bg-[var(--surface)] p-6 border border-[var(--border-soft)] shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-[var(--accent)]">
                <Icon name="settings" size={18} stroke={2.5} />
                <h3 className="text-base font-extrabold text-[var(--text)] tracking-tight">Status & Observações</h3>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="field-label" htmlFor="is_active">Status Cadastral</label>
                  <select
                    id="is_active"
                    name="is_active"
                    defaultValue={supplier ? String(supplier.is_active) : 'true'}
                    className="input bg-[var(--surface)] border-[var(--border)] focus:border-[var(--accent)]"
                    style={{ height: 42, borderRadius: 10 }}
                  >
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                  <FieldError errors={state?.errors} field="is_active" />
                </div>

                <div>
                  <label className="field-label" htmlFor="notes">Notas Internas</label>
                  <textarea
                    id="notes"
                    name="notes"
                    defaultValue={supplier?.notes ?? ''}
                    placeholder="Adicione observações de fornecimento, prazos, faturamento e dados de contato secundários..."
                    className="input bg-[var(--surface)] border-[var(--border)] focus:border-[var(--accent)]"
                    style={{ height: 120, padding: '10px 14px', borderRadius: 10, resize: 'none' }}
                  />
                  <FieldError errors={state?.errors} field="notes" />
                </div>

                <div className="p-4 bg-[var(--warning-soft)] border border-[var(--warning)]/15 rounded-xl flex gap-2.5">
                  <span className="text-[var(--warning)] mt-0.5">
                    <Icon name="bell" size={16} />
                  </span>
                  <p className="text-[11px] text-[var(--text-soft)] leading-relaxed">
                    Estas notas são de <strong>uso puramente interno</strong> e não serão impressas ou visualizadas em documentos externos.
                  </p>
                </div>
              </div>
            </div>

            {/* Card: Dica de Cadastro */}
            <div
              className="card text-[var(--accent-ink)]"
              style={{
                padding: 24,
                background: 'linear-gradient(135deg, var(--accent) 0%, oklch(0.38 0.12 252) 100%)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span style={{ color: 'var(--accent-ink)' }}>
                  <Icon name="check" size={18} stroke={3} />
                </span>
                <h4 className="text-sm font-extrabold tracking-tight" style={{ color: 'var(--accent-ink)' }}>
                  Sincronização Ativa
                </h4>
              </div>
              <p className="text-[12px] opacity-90 leading-relaxed mb-0" style={{ color: 'var(--accent-ink)' }}>
                Dados sincronizados com o módulo de estoque. O preenchimento correto agiliza a entrada de notas fiscais XML no sistema.
              </p>
            </div>

          </div>

          {/* Bottom Actions Form Actions */}
          <div className="col-span-12 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-6 border-t border-[var(--border-soft)]">
            <div>
              {deleteButton}
            </div>
            
            <div className="flex flex-row justify-end gap-3 w-full sm:w-auto">
              <a href="/suppliers" className="btn btn-outline flex-1 sm:flex-none justify-center" style={{ height: 40, borderRadius: 10 }}>
                Cancelar
              </a>
              <button
                type="submit"
                disabled={pending}
                className="btn btn-primary flex-1 sm:flex-none justify-center shadow-md shadow-[var(--accent)]/10"
                style={{ height: 40, borderRadius: 10, padding: '0 24px' }}
              >
                {pending ? 'Salvando...' : submitLabel}
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  )
}
