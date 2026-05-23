'use client'

import { useActionState } from 'react'
import { FinancialTransaction } from '@/app/lib/types'

interface FormState {
  error?: string
  errors?: Record<string, string[]>
}

interface SupplierOption { id: string; company_name: string }
interface CustomerOption { id: string; name: string }

interface Props {
  action: (prevState: unknown, formData: FormData) => Promise<FormState | undefined>
  transaction?: FinancialTransaction
  suppliers: SupplierOption[]
  customers: CustomerOption[]
  submitLabel: string
}

const CATEGORIES: Record<'income' | 'expense', { value: string; label: string }[]> = {
  income: [
    { value: 'sales', label: 'Vendas' },
    { value: 'other_income', label: 'Outras receitas' },
  ],
  expense: [
    { value: 'suppliers', label: 'Fornecedores' },
    { value: 'utilities', label: 'Água / luz / internet' },
    { value: 'rent', label: 'Aluguel' },
    { value: 'payroll', label: 'Folha de pagamento' },
    { value: 'logistics', label: 'Frete e transporte' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'other_expense', label: 'Outras despesas' },
  ],
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Dinheiro',
  pix: 'Pix',
  credit_card: 'Cartão de crédito',
  debit_card: 'Cartão de débito',
  bank_transfer: 'Transferência bancária',
  other: 'Outro',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Paga',
  overdue: 'Vencida',
  canceled: 'Cancelada',
}

function FieldError({ errors, field }: { errors?: Record<string, string[]>; field: string }) {
  const msg = errors?.[field]?.[0]
  if (!msg) return null
  return <p className="form-field-error">{msg}</p>
}

function Field({
  label,
  name,
  span,
  children,
  errors,
}: {
  label: string
  name: string
  span?: 2 | 'full'
  children: React.ReactNode
  errors?: Record<string, string[]>
}) {
  const cls =
    span === 'full' ? 'form-field-full' :
    span === 2 ? 'form-field-span-2' : ''
  return (
    <div className={`form-field ${cls}`}>
      <label className="field-label" htmlFor={name}>{label}</label>
      {children}
      <FieldError errors={errors} field={name} />
    </div>
  )
}

export function FinanceForm({ action, transaction, suppliers, customers, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, null)

  return (
    <form action={formAction} className="form-stack">
      {state?.error && (
        <div className="form-banner-error">{state.error}</div>
      )}

      <section className="card">
        <div className="card-head">
          <div><h3>Lançamento</h3></div>
        </div>
        <div className="card-body form-grid">
          <Field label="Tipo *" name="type" errors={state?.errors}>
            <select id="type" name="type" defaultValue={transaction?.type ?? 'expense'} className="input">
              <option value="expense">Despesa (a pagar)</option>
              <option value="income">Receita (a receber)</option>
            </select>
          </Field>

          <Field label="Categoria" name="category" errors={state?.errors}>
            <select id="category" name="category" defaultValue={transaction?.category ?? ''} className="input">
              <option value="">Sem categoria</option>
              <optgroup label="Receitas">
                {CATEGORIES.income.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </optgroup>
              <optgroup label="Despesas">
                {CATEGORIES.expense.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </optgroup>
            </select>
          </Field>

          <Field label="Status" name="status" errors={state?.errors}>
            <select id="status" name="status" defaultValue={transaction?.status ?? 'pending'} className="input">
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>

          <Field label="Descrição *" name="description" errors={state?.errors} span={2}>
            <input
              id="description"
              name="description"
              type="text"
              defaultValue={transaction?.description ?? ''}
              placeholder="Ex: Conta de energia, comissão…"
              className="input"
            />
          </Field>

          <Field label="Valor (R$) *" name="amount" errors={state?.errors}>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              defaultValue={transaction?.amount ?? ''}
              placeholder="0,00"
              className="input tnum"
            />
          </Field>
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <div><h3>Datas e pagamento</h3></div>
        </div>
        <div className="card-body form-grid">
          <Field label="Vencimento *" name="due_date" errors={state?.errors}>
            <input
              id="due_date"
              name="due_date"
              type="date"
              defaultValue={transaction?.due_date ?? ''}
              className="input"
            />
          </Field>

          <Field label="Data de pagamento" name="payment_date" errors={state?.errors}>
            <input
              id="payment_date"
              name="payment_date"
              type="date"
              defaultValue={transaction?.payment_date ?? ''}
              className="input"
            />
          </Field>

          <Field label="Forma de pagamento" name="payment_method" errors={state?.errors}>
            <select id="payment_method" name="payment_method" defaultValue={transaction?.payment_method ?? ''} className="input">
              <option value="">—</option>
              {Object.entries(PAYMENT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <div>
            <h3>Vínculos</h3>
            <p className="card-sub">Opcional — associa este lançamento a um fornecedor ou cliente</p>
          </div>
        </div>
        <div className="card-body form-grid">
          <Field label="Fornecedor" name="supplier_id" errors={state?.errors}>
            <select id="supplier_id" name="supplier_id" defaultValue={transaction?.supplier_id ?? ''} className="input">
              <option value="">—</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.company_name}</option>
              ))}
            </select>
          </Field>

          <Field label="Cliente" name="customer_id" errors={state?.errors}>
            <select id="customer_id" name="customer_id" defaultValue={transaction?.customer_id ?? ''} className="input">
              <option value="">—</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <div><h3>Observações</h3></div>
        </div>
        <div className="card-body">
          <textarea
            name="notes"
            defaultValue={transaction?.notes ?? ''}
            rows={3}
            placeholder="Notas internas sobre este lançamento…"
            className="input"
          />
        </div>
      </section>

      <div className="form-actions">
        <a href="/finance" className="btn btn-outline">Cancelar</a>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? 'Salvando…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
