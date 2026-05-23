import Link from 'next/link'
import { Icon } from '@/app/ui/icon'

const reports = [
  {
    href: '/reports/sales',
    title: 'Vendas por período',
    description: 'Pedidos no intervalo, totais por status, dia e forma de pagamento.',
    icon: 'sales' as const,
    kind: 'success' as const,
  },
  {
    href: '/reports/top-products',
    title: 'Top produtos',
    description: 'Produtos mais vendidos no período (quantidade, receita, ticket médio).',
    icon: 'package' as const,
    kind: 'accent' as const,
  },
  {
    href: '/reports/cash-flow',
    title: 'Fluxo de caixa',
    description: 'Entradas e saídas previstas e realizadas, com saldo diário acumulado.',
    icon: 'finance' as const,
    kind: 'warning' as const,
  },
  {
    href: '/reports/accounts',
    title: 'Contas a pagar/receber',
    description: 'Posição atual de pendentes, pagas e vencidas, com agregados por status.',
    icon: 'invoices' as const,
    kind: 'danger' as const,
  },
]

export default function ReportsIndex() {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Relatórios</h1>
          <p className="page-subtitle">Análises detalhadas com exportação para CSV.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {reports.map((r) => (
          <Link key={r.href} href={r.href} className="card" style={{ padding: 18, textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 'var(--r-md)',
                background: `var(--${r.kind}-soft)`, color: `var(--${r.kind})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={r.icon} size={16} />
              </div>
              <h3 style={{ margin: 0, fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>{r.title}</h3>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-muted)', margin: 0 }}>{r.description}</p>
            <div style={{ marginTop: 14, fontSize: 12.5, fontWeight: 500, color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Abrir <Icon name="arrow_right" size={12} stroke={2} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
