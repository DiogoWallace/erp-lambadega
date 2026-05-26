'use client'

import { useActionState, useState } from 'react'
import { Category, Product, Supplier } from '@/app/lib/types'

const UNITS = [
  { value: 'un', label: 'Unidade (un)' },
  { value: 'kg', label: 'Quilograma (kg)' },
  { value: 'g', label: 'Grama (g)' },
  { value: 'l', label: 'Litro (l)' },
  { value: 'ml', label: 'Mililitro (ml)' },
  { value: 'cx', label: 'Caixa (cx)' },
]

interface FormState {
  error?: string
  errors?: Record<string, string[]>
}

interface Props {
  action: (prevState: unknown, formData: FormData) => Promise<FormState | undefined>
  product?: Product
  categories: Category[]
  suppliers: Supplier[]
  submitLabel: string
  deleteButton?: React.ReactNode
}

function FieldError({ errors, field }: { errors?: Record<string, string[]>; field: string }) {
  const msg = errors?.[field]?.[0]
  if (!msg) return null
  return (
    <p className="mt-1.5 text-label-sm text-danger flex items-center gap-1 font-bold">
      <span className="material-symbols-outlined text-sm">info</span>
      {msg}
    </p>
  )
}

export function ProductForm({ action, product, categories, suppliers, submitLabel, deleteButton }: Props) {
  const [state, formAction, pending] = useActionState(action, null)

  // Client-side interactive states
  const [sku, setSku] = useState(product?.sku ?? '')
  const [costPrice, setCostPrice] = useState<string>(product ? String(product.cost_price) : '')
  const [salePrice, setSalePrice] = useState<string>(product ? String(product.sale_price) : '')
  const [imagePath, setImagePath] = useState(product?.image_path ?? '')

  // Live Gross Margin calculator
  const costNum = parseFloat(costPrice) || 0
  const saleNum = parseFloat(salePrice) || 0
  const margin = saleNum > 0 ? ((saleNum - costNum) / saleNum) * 100 : 0

  // SKU Auto-generator
  const generateSKU = (e: React.MouseEvent) => {
    e.preventDefault()
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let randomPart = ''
    for (let i = 0; i < 6; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setSku(`PROD-${randomPart}`)
  }

  return (
    <form action={formAction} className="page w-full max-w-[1200px] mx-auto">
      {/* Header Area */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-text-faint mb-2">
            <span className="font-label-md uppercase tracking-wider text-xs">Cadastros</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <a href="/products" className="font-label-md uppercase tracking-wider text-xs hover:text-primary transition-colors">
              Produtos
            </a>
          </nav>
          <h2 className="font-display-lg text-headline-lg text-text">
            {product ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          {product && (
            <p className="text-body-md text-text-soft mt-1">{product.name}</p>
          )}
        </div>

        {/* Desktop actions: hidden on mobile, flex on large screens */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href="/products"
            className="px-6 py-2.5 rounded-lg border border-border-strong text-text-soft font-body-md font-bold hover:bg-surface-hover transition-colors active:scale-95 text-center"
          >
            Cancelar
          </a>
          {deleteButton && (
            <div>{deleteButton}</div>
          )}
          <button
            type="submit"
            disabled={pending}
            className="px-8 py-2.5 rounded-lg bg-primary text-on-primary font-body-md font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {pending ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                Salvando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">save</span>
                {submitLabel}
              </>
            )}
          </button>
        </div>
      </header>

      {state?.error && (
        <div className="form-banner-error mb-6 p-4 bg-danger-soft border border-danger/30 text-danger rounded-lg flex items-center gap-2 font-bold font-body-md">
          <span className="material-symbols-outlined text-xl">error</span>
          {state.error}
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Left Column: Primary Info */}
        <div className="col-span-12 lg:col-span-8 space-y-gutter">
          {/* Section: Identificação */}
          <section className="bg-surface border border-border-soft rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-border-soft pb-4">
              <span className="material-symbols-outlined text-primary">branding_watermark</span>
              <h3 className="font-headline-md text-headline-md text-text">Identificação</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block font-label-md font-bold text-text-soft mb-1.5" htmlFor="name">
                  Nome do Produto *
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  defaultValue={product?.name ?? ''}
                  placeholder="Ex: Cadeira de Escritório Ergonômica"
                  className="w-full bg-bg-soft border border-border-soft rounded-lg px-4 py-2.5 text-body-md transition-all focus:bg-surface"
                  required
                />
                <FieldError errors={state?.errors} field="name" />
              </div>

              <div className="md:col-span-2">
                <label className="block font-label-md font-bold text-text-soft mb-1.5" htmlFor="description">
                  Descrição Curta
                </label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={product?.description ?? ''}
                  placeholder="Informações básicas sobre o produto..."
                  rows={3}
                  className="w-full bg-bg-soft border border-border-soft rounded-lg px-4 py-2.5 text-body-md transition-all resize-none focus:bg-surface"
                />
                <FieldError errors={state?.errors} field="description" />
              </div>

              <div>
                <label className="block font-label-md font-bold text-text-soft mb-1.5" htmlFor="brand">
                  Marca
                </label>
                <input
                  id="brand"
                  type="text"
                  name="brand"
                  defaultValue={product?.brand ?? ''}
                  placeholder="Marca do fabricante"
                  className="w-full bg-bg-soft border border-border-soft rounded-lg px-4 py-2.5 text-body-md transition-all focus:bg-surface"
                />
                <FieldError errors={state?.errors} field="brand" />
              </div>

              <div>
                <label className="block font-label-md font-bold text-text-soft mb-1.5" htmlFor="unit">
                  Unidade de Medida
                </label>
                <select
                  id="unit"
                  name="unit"
                  defaultValue={product?.unit ?? 'un'}
                  className="w-full bg-bg-soft border border-border-soft rounded-lg px-4 py-2.5 text-body-md transition-all focus:bg-surface"
                >
                  {UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
                <FieldError errors={state?.errors} field="unit" />
              </div>

              <div>
                <label className="block font-label-md font-bold text-text-soft mb-1.5" htmlFor="sku">
                  SKU
                </label>
                <div className="flex">
                  <input
                    id="sku"
                    type="text"
                    name="sku"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="PROD-001"
                    className="w-full bg-bg-soft border border-border-soft rounded-l-lg px-4 py-2.5 text-body-md transition-all focus:bg-surface"
                  />
                  <button
                    type="button"
                    onClick={generateSKU}
                    className="bg-surface-container-high px-3 border-y border-r border-border-soft rounded-r-lg text-primary hover:bg-primary-container hover:text-on-primary transition-colors flex items-center justify-center"
                    title="Gerar SKU automático"
                  >
                    <span className="material-symbols-outlined text-lg">autorenew</span>
                  </button>
                </div>
                <FieldError errors={state?.errors} field="sku" />
              </div>

              <div>
                <label className="block font-label-md font-bold text-text-soft mb-1.5" htmlFor="barcode">
                  Código de Barras (EAN)
                </label>
                <input
                  id="barcode"
                  type="text"
                  name="barcode"
                  defaultValue={product?.barcode ?? ''}
                  placeholder="7890000000001"
                  className="w-full bg-bg-soft border border-border-soft rounded-lg px-4 py-2.5 text-body-md transition-all focus:bg-surface"
                />
                <FieldError errors={state?.errors} field="barcode" />
              </div>
            </div>
          </section>

          {/* Section: Preços */}
          <section className="bg-surface border border-border-soft rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-border-soft pb-4">
              <span className="material-symbols-outlined text-primary">payments</span>
              <h3 className="font-headline-md text-headline-md text-text">Preços</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-surface-container-low p-4 rounded-lg">
                <label className="block font-label-md font-bold text-text-soft mb-1.5" htmlFor="cost_price">
                  Preço de Custo
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-label-sm text-text-faint">R$</span>
                  <input
                    id="cost_price"
                    type="number"
                    name="cost_price"
                    step="0.01"
                    min="0"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full bg-surface border border-border-soft rounded-lg pl-12 pr-4 py-3 text-headline-md font-bold text-text-soft"
                    placeholder="0,00"
                  />
                </div>
                <FieldError errors={state?.errors} field="cost_price" />
                <p className="mt-2 text-label-sm text-text-faint uppercase">
                  Última atualização: {product ? new Date().toLocaleDateString('pt-BR') : '--/--/----'}
                </p>
              </div>

              <div className="bg-accent-soft p-4 rounded-lg">
                <label className="block font-label-md font-bold text-accent mb-1.5" htmlFor="sale_price">
                  Preço de Venda
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-label-sm text-primary">R$</span>
                  <input
                    id="sale_price"
                    type="number"
                    name="sale_price"
                    step="0.01"
                    min="0"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="w-full bg-surface border border-accent/20 rounded-lg pl-12 pr-4 py-3 text-headline-md font-bold text-primary"
                    placeholder="0,00"
                  />
                </div>
                <FieldError errors={state?.errors} field="sale_price" />
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-label-sm text-text-muted uppercase">Margem bruta ideal</span>
                  <span className="bg-tertiary-fixed text-on-tertiary-fixed text-label-sm font-bold px-2 py-0.5 rounded-full">
                    {margin.toFixed(2).replace('.', ',')}%
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Secondary Info */}
        <div className="col-span-12 lg:col-span-4 space-y-gutter">
          {/* Section: Estoque */}
          <section className="bg-surface border border-border-soft rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-border-soft pb-4">
              <span className="material-symbols-outlined text-primary">inventory</span>
              <h3 className="font-headline-md text-headline-md text-text">Estoque</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block font-label-md font-bold text-text-soft mb-1.5">
                  Quantidade Atual
                </label>
                <div className="w-full bg-bg-soft border border-border-soft rounded-lg px-4 py-3 text-headline-lg font-bold text-text-soft flex justify-between items-center">
                  <span>{product?.stock_quantity ?? 0}</span>
                  <span className="text-body-sm font-normal text-text-faint">Leitura apenas</span>
                </div>
                <input type="hidden" name="stock_quantity" value={product?.stock_quantity ?? 0} />
                <p className="mt-2 text-label-sm text-danger flex items-center gap-1 font-bold">
                  <span className="material-symbols-outlined text-sm">info</span>
                  Ajuste via entrada de nota ou inventário
                </p>
              </div>

              <div>
                <label className="block font-label-md font-bold text-text-soft mb-1.5" htmlFor="min_stock_quantity">
                  Quantidade Mínima
                </label>
                <input
                  id="min_stock_quantity"
                  type="number"
                  name="min_stock_quantity"
                  defaultValue={product?.min_stock_quantity ?? 5}
                  min="0"
                  step="1"
                  className="w-full bg-surface border border-border-soft rounded-lg px-4 py-2.5 text-body-md font-bold"
                />
                <FieldError errors={state?.errors} field="min_stock_quantity" />
                <p className="mt-2 text-label-sm text-text-faint uppercase">Gera alerta de reposição automática</p>
              </div>
            </div>
          </section>

          {/* Section: Organização */}
          <section className="bg-surface border border-border-soft rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-border-soft pb-4">
              <span className="material-symbols-outlined text-primary">category</span>
              <h3 className="font-headline-md text-headline-md text-text">Organização</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block font-label-md font-bold text-text-soft mb-1.5" htmlFor="is_active">
                  Status do Produto
                </label>
                <select
                  id="is_active"
                  name="is_active"
                  defaultValue={product ? String(product.is_active) : 'true'}
                  className="w-full bg-bg-soft border border-border-soft rounded-lg px-4 py-2.5 text-body-md transition-all focus:bg-surface"
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
                <FieldError errors={state?.errors} field="is_active" />
              </div>

              <div>
                <label className="block font-label-md font-bold text-text-soft mb-1.5" htmlFor="category_id">
                  Categoria
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  defaultValue={product?.category_id ?? ''}
                  className="w-full bg-bg-soft border border-border-soft rounded-lg px-4 py-2.5 text-body-md transition-all focus:bg-surface"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <FieldError errors={state?.errors} field="category_id" />
              </div>

              <div>
                <label className="block font-label-md font-bold text-text-soft mb-1.5" htmlFor="supplier_id">
                  Fornecedor Principal
                </label>
                <select
                  id="supplier_id"
                  name="supplier_id"
                  defaultValue={product?.supplier_id ?? ''}
                  className="w-full bg-bg-soft border border-border-soft rounded-lg px-4 py-2.5 text-body-md transition-all focus:bg-surface"
                >
                  <option value="">Selecione o fornecedor</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.company_name}
                    </option>
                  ))}
                </select>
                <FieldError errors={state?.errors} field="supplier_id" />
                <a
                  href="/suppliers/new"
                  className="mt-2.5 text-primary text-body-sm font-bold flex items-center gap-1 hover:underline w-fit"
                >
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  Cadastrar Fornecedor
                </a>
              </div>
            </div>
          </section>

          {/* Section: Foto do Produto */}
          <section className="space-y-4">
            <label className="block font-label-md font-bold text-text-soft mb-1" htmlFor="image_path">
              Foto do Produto
            </label>

            {imagePath ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden group border border-border-soft bg-bg-soft shadow-sm">
                <img
                  src={imagePath}
                  alt="Preview do produto"
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    // Falls back gracefully if image URL fails to load
                    ;(e.target as HTMLElement).style.display = 'none'
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setImagePath('')}
                    className="p-3 bg-danger text-white rounded-full hover:bg-danger-hover transition-colors shadow-md flex items-center justify-center"
                    title="Remover imagem"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => document.getElementById('image_path')?.focus()}
                className="bg-bg-soft rounded-lg border-2 border-dashed border-border-strong p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-surface-hover transition-all"
              >
                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl text-text-faint">add_a_photo</span>
                </div>
                <p className="font-body-md font-bold text-text-soft">Foto do Produto</p>
                <p className="text-label-sm text-text-faint mt-1 uppercase">Cole a URL da imagem abaixo</p>
              </div>
            )}

            <div>
              <input
                id="image_path"
                type="text"
                name="image_path"
                value={imagePath}
                onChange={(e) => setImagePath(e.target.value)}
                placeholder="https://exemplo.com/imagem.png"
                className="w-full bg-surface border border-border-soft rounded-lg px-4 py-2.5 text-body-md transition-all focus:bg-surface"
              />
              <FieldError errors={state?.errors} field="image_path" />
            </div>
          </section>
        </div>
      </div>

      {/* Floating Form Actions (Mobile view) */}
      <div className="mt-12 lg:hidden bg-surface-container-low p-4 rounded-lg border border-border-soft flex gap-3 shadow-lg sticky bottom-4 z-40">
        <a
          href="/products"
          className="flex-1 py-3 rounded-lg border border-border-strong text-text font-bold text-body-md text-center flex items-center justify-center hover:bg-surface-hover transition-colors"
        >
          Cancelar
        </a>
        {deleteButton && (
          <div className="flex-1 flex justify-center">
            {deleteButton}
          </div>
        )}
        <button
          type="submit"
          disabled={pending}
          className="flex-[2] py-3 rounded-lg bg-primary text-on-primary font-bold text-body-md shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {pending ? (
            <>
              <span className="material-symbols-outlined text-lg animate-spin">sync</span>
              Salvando...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-lg">save</span>
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
