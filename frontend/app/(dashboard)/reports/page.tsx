import Link from 'next/link'

const reports = [
  {
    href: '/reports/sales',
    title: 'Vendas por período',
    description: 'Pedidos no intervalo, totais por status, dia e forma de pagamento.',
  },
  {
    href: '/reports/top-products',
    title: 'Top produtos',
    description: 'Produtos mais vendidos no período (quantidade, receita, ticket médio).',
  },
  {
    href: '/reports/cash-flow',
    title: 'Fluxo de caixa',
    description: 'Entradas e saídas previstas e realizadas, com saldo diário acumulado.',
  },
  {
    href: '/reports/accounts',
    title: 'Contas a pagar/receber',
    description: 'Posição atual de pendentes, pagas e vencidas, com agregados por status.',
  },
]

export default function ReportsIndex() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Relatórios</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Análises detalhadas com exportação para CSV.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="bg-white rounded-xl border border-zinc-200 p-5 hover:border-zinc-400 hover:shadow-sm transition-all"
          >
            <h2 className="text-base font-semibold text-zinc-900">{r.title}</h2>
            <p className="mt-1 text-sm text-zinc-500">{r.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
