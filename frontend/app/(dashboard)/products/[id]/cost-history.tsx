import { apiFetch } from '@/app/lib/api'
import type { PaginatedResponse, ProductCostHistory, ProductCostHistorySource, Supplier } from '@/app/lib/types'
import { QuoteModal } from './quote-modal'

interface Props {
  productId: string
  defaultSupplierId: string | null
  suppliers: Supplier[]
  canQuote: boolean
}

const SOURCE_LABEL: Record<ProductCostHistorySource, string> = {
  stock_in: 'Entrada estoque',
  product_update: 'Edição do produto',
  quote: 'Cotação manual',
}

const SOURCE_BADGE: Record<ProductCostHistorySource, string> = {
  stock_in: 'badge-success',
  product_update: 'badge-info',
  quote: 'badge-warning',
}

function formatBRL(value: string): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export async function CostHistorySection({ productId, defaultSupplierId, suppliers, canQuote }: Props) {
  const res = await apiFetch(`/products/${productId}/cost-history`, { optional: true })
  if (!res.ok) return null

  const { data: entries }: PaginatedResponse<ProductCostHistory> = await res.json()

  return (
    <section className="card" style={{ marginTop: 16 }}>
      <div className="card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3>Histórico de custos</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Variação do preço de custo ao longo do tempo, por fornecedor.
          </p>
        </div>
        {canQuote && (
          <QuoteModal productId={productId} defaultSupplierId={defaultSupplierId} suppliers={suppliers} />
        )}
      </div>

      <div className="card-body" style={{ padding: 0 }}>
        {entries.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            Nenhum registro de custo ainda. Cadastre uma cotação ou registre uma entrada de estoque.
          </div>
        ) : (
          <table className="t-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Fornecedor</th>
                <th className="t-num">Custo</th>
                <th>Origem</th>
                <th>Por</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDate(entry.effective_at)}</td>
                  <td>{entry.supplier?.company_name ?? <span style={{ color: 'var(--text-faint)' }}>—</span>}</td>
                  <td className="t-num tnum" style={{ fontWeight: 500 }}>{formatBRL(entry.cost_price)}</td>
                  <td>
                    <span className={`badge ${SOURCE_BADGE[entry.source]}`}>{SOURCE_LABEL[entry.source]}</span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{entry.user?.name ?? '—'}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-faint)', maxWidth: 240 }}>{entry.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
