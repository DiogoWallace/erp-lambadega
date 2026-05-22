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

const inputClass =
  'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent'

function FieldError({ errors, field }: { errors?: Record<string, string[]>; field: string }) {
  const msg = errors?.[field]?.[0]
  if (!msg) return null
  return <p className="mt-1 text-xs text-red-600">{msg}</p>
}

function Field({
  label,
  name,
  children,
  errors,
}: {
  label: string
  name: string
  children: React.ReactNode
  errors?: Record<string, string[]>
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-600 mb-1">{label}</label>
      {children}
      <FieldError errors={errors} field={name} />
    </div>
  )
}

export function FinanceForm({ action, transaction, suppliers, customers, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-8">
      {state?.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Lançamento */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">Lançamento</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Tipo *" name="type" errors={state?.errors}>
            <select name="type" defaultValue={transaction?.type ?? 'expense'} className={inputClass}>
              <option value="expense">Despesa (a pagar)</option>
              <option value="income">Receita (a receber)</option>
            </select>
          </Field>

          <Field label="Categoria" name="category" errors={state?.errors}>
            <select name="category" defaultValue={transaction?.category ?? ''} className={inputClass}>
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

          <Field label="Descrição *" name="description" errors={state?.errors}>
            <input
              name="description"
              type="text"
              defaultValue={transaction?.description ?? ''}
              placeholder="Ex: Conta de energia, Comissão..."
              className={inputClass}
            />
          </Field>

          <Field label="Valor *" name="amount" errors={state?.errors}>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              defaultValue={transaction?.amount ?? ''}
              placeholder="0,00"
              className={inputClass}
            />
          </Field>

          <Field label="Status" name="status" errors={state?.errors}>
            <select name="status" defaultValue={transaction?.status ?? 'pending'} className={inputClass}>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      {/* Datas e pagamento */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">Datas e pagamento</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Vencimento *" name="due_date" errors={state?.errors}>
            <input
              name="due_date"
              type="date"
              defaultValue={transaction?.due_date ?? ''}
              className={inputClass}
            />
          </Field>

          <Field label="Data de pagamento" name="payment_date" errors={state?.errors}>
            <input
              name="payment_date"
              type="date"
              defaultValue={transaction?.payment_date ?? ''}
              className={inputClass}
            />
          </Field>

          <Field label="Forma de pagamento" name="payment_method" errors={state?.errors}>
            <select name="payment_method" defaultValue={transaction?.payment_method ?? ''} className={inputClass}>
              <option value="">—</option>
              {Object.entries(PAYMENT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      {/* Vínculos */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">Vínculos (opcional)</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Fornecedor" name="supplier_id" errors={state?.errors}>
            <select name="supplier_id" defaultValue={transaction?.supplier_id ?? ''} className={inputClass}>
              <option value="">—</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.company_name}</option>
              ))}
            </select>
          </Field>

          <Field label="Cliente" name="customer_id" errors={state?.errors}>
            <select name="customer_id" defaultValue={transaction?.customer_id ?? ''} className={inputClass}>
              <option value="">—</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      {/* Observações */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">Observações</h2>
        <textarea
          name="notes"
          defaultValue={transaction?.notes ?? ''}
          rows={3}
          placeholder="Notas internas sobre este lançamento..."
          className={`${inputClass} resize-none`}
        />
      </section>

      <div className="flex justify-end gap-3 pt-2">
        <a
          href="/finance"
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          {pending ? 'Salvando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
