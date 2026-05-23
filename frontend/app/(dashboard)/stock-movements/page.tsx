import Link from 'next/link'
import { apiFetch } from '@/app/lib/api'
import { PaginatedResponse, Product, StockMovement } from '@/app/lib/types'
import { Icon } from '@/app/ui/icons'

interface Props {
  searchParams: Promise<{
    product_id?: string
    type?: string
    date_from?: string
    date_to?: string
    page?: string
  }>
}

const TYPE_LABEL: Record<string, string> = { in: 'Entrada', out: 'Saída', adjustment: 'Ajuste' }
const TYPE_BADGE: Record<string, string> = { in: 'badge-success', out: 'badge-danger', adjustment: 'badge-info' }

function formatQty(movement: StockMovement): string {
  if (movement.type === 'in')  return `+${movement.quantity}`
  if (movement.type === 'out') return `−${movement.quantity}`
  return `→ ${movement.quantity}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function StockMovementsPage({ searchParams }: Props) {
  const { product_id = '', type = '', date_from = '', date_to = '', page = '1' } = await searchParams

  const params = new URLSearchParams({ page })
  if (product_id) params.set('product_id', product_id)
  if (type)       params.set('type', type)
  if (date_from)  params.set('date_from', date_from)
  if (date_to)    params.set('date_to', date_to)

  const [movementsRes, productsRes] = await Promise.all([
    apiFetch(`/stock-movements?${params}`),
    apiFetch('/products?all=1'),
  ])

  const { data: movements, meta }: PaginatedResponse<StockMovement> = await movementsRes.json()
  const { data: products }: { data: Product[] } = await productsRes.json()

  const hasFilters = product_id || type || date_from || date_to

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Movimentações de estoque</h1>
          <p className="page-subtitle">{meta.total} movimentação(ões) registrada(s) · log imutável</p>
        </div>
        <Link href="/stock-movements/new" className="btn btn-primary btn-sm">
          <Icon name="plus" size={13} stroke={2} /> Registrar
        </Link>
      </div>

      <form method="GET" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <select name="product_id" defaultValue={product_id} className="input input-sm" style={{ width: 280 }}>
          <option value="">Todos os produtos</option>
          {products.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
        </select>
        <select name="type" defaultValue={type} className="input input-sm" style={{ width: 160 }}>
          <option value="">Todos os tipos</option>
          <option value="in">Entrada</option>
          <option value="out">Saída</option>
          <option value="adjustment">Ajuste</option>
        </select>
        <input type="date" name="date_from" defaultValue={date_from} className="input input-sm" style={{ width: 150 }} />
        <input type="date" name="date_to" defaultValue={date_to} className="input input-sm" style={{ width: 150 }} />
        <button type="submit" className="btn btn-outline btn-sm"><Icon name="filter" size={12} /> Filtrar</button>
        {hasFilters && (<a href="/stock-movements" className="btn btn-ghost btn-sm"><Icon name="x" size={12} /> Limpar</a>)}
      </form>

      <div className="card">
        {movements.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nenhuma movimentação encontrada.</p>
          </div>
        ) : (
          <table className="t-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Produto</th>
                <th>Tipo</th>
                <th className="t-num">Qtd</th>
                <th className="t-num">Antes → Depois</th>
                <th>Usuário</th>
                <th>Descrição</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatDate(m.created_at)}</td>
                  <td style={{ fontWeight: 500 }}>{m.product?.name ?? '—'}</td>
                  <td><span className={`badge ${TYPE_BADGE[m.type]}`}>{TYPE_LABEL[m.type]}</span></td>
                  <td className="t-num mono" style={{ fontWeight: 600 }}>{formatQty(m)}</td>
                  <td className="t-num mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {m.stock_before} → {m.stock_after}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.user?.name ?? '—'}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-faint)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.description ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {meta.last_page > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Página {meta.current_page} de {meta.last_page}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {meta.current_page > 1 && (
              <PaginationLink page={meta.current_page - 1} productId={product_id} type={type} dateFrom={date_from} dateTo={date_to} label="← Anterior" />
            )}
            {meta.current_page < meta.last_page && (
              <PaginationLink page={meta.current_page + 1} productId={product_id} type={type} dateFrom={date_from} dateTo={date_to} label="Próxima →" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function PaginationLink({ page, productId, type, dateFrom, dateTo, label }: {
  page: number; productId: string; type: string; dateFrom: string; dateTo: string; label: string
}) {
  const p = new URLSearchParams({ page: String(page) })
  if (productId) p.set('product_id', productId)
  if (type)      p.set('type', type)
  if (dateFrom)  p.set('date_from', dateFrom)
  if (dateTo)    p.set('date_to', dateTo)
  return <Link href={`/stock-movements?${p}`} className="btn btn-outline btn-sm">{label}</Link>
}
