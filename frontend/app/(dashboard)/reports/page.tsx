import Link from 'next/link'
import { Icon } from '@/app/ui/icons'

export default function ReportsIndex() {
  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h1 className="page-title" style={{ fontSize: 32, letterSpacing: '-0.02em', fontWeight: 700 }}>
          Central de Relatórios
        </h1>
        <p className="page-subtitle" style={{ fontSize: 16, marginTop: 8, maxWidth: 640 }}>
          Acompanhe o desempenho da sua empresa com dados precisos e visualizações em tempo real.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Vendas Card */}
        <div className="md:col-span-8 group relative overflow-hidden rounded-2xl card p-8 flex flex-col justify-between min-h-[300px] hover:shadow-md transition-all duration-300">
          <div 
            className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity"
            style={{ pointerEvents: 'none', zIndex: 0 }}
          >
            <Icon name="reports" size={160} />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)]">
                <Icon name="trend_up" size={24} />
              </div>
              <span className="font-mono text-[11px] font-bold text-[var(--accent)] tracking-widest">COMERCIAL</span>
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: '0 0 12px', letterSpacing: '-0.01em', fontFamily: 'var(--font-hanken)' }}>
              Relatório de Vendas
            </h3>
            <p style={{ color: 'var(--text-soft)', fontSize: 14, lineHeight: 1.6, maxWidth: 480 }}>
              Análise detalhada de faturamento, ticket médio e volume de pedidos por período e canal.
            </p>
          </div>
          <div className="flex items-center justify-between mt-6 pt-6" style={{ position: 'relative', zIndex: 1, borderTop: '1px solid var(--border-soft)' }}>
            <div className="flex gap-8">
              <div className="flex flex-col">
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Este Mês</span>
                <span style={{ fontFamily: 'var(--font-geist-mono), monospace', color: 'var(--text)', fontSize: 14, fontWeight: 700, marginTop: 2 }}>R$ 142.500,00</span>
              </div>
              <div className="flex flex-col">
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Crescimento</span>
                <span style={{ fontFamily: 'var(--font-geist-mono), monospace', color: 'var(--success)', fontSize: 14, fontWeight: 700, marginTop: 2 }}>+12.4%</span>
              </div>
            </div>
            <Link 
              href="/reports/sales" 
              className="flex items-center gap-2 text-sm font-bold group-hover:translate-x-1 transition-transform" 
              style={{ textDecoration: 'none', color: 'var(--accent)' }}
            >
              Ver detalhes
              <Icon name="arrow_right" size={14} />
            </Link>
          </div>
        </div>

        {/* Fluxo de Caixa Card */}
        <div className="md:col-span-4 group rounded-2xl border p-8 flex flex-col justify-between hover:shadow-md transition-all duration-300" style={{ background: 'var(--surface-2)', borderColor: 'var(--border-soft)' }}>
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg border flex items-center justify-center" style={{ background: 'var(--surface)', borderColor: 'var(--border-soft)', color: 'var(--text-soft)' }}>
                <Icon name="finance" size={20} />
              </div>
              <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>FINANCEIRO</span>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: '0 0 12px', letterSpacing: '-0.01em', fontFamily: 'var(--font-hanken)' }}>
              Fluxo de Caixa
            </h3>
            <p style={{ color: 'var(--text-soft)', fontSize: 13.5, lineHeight: 1.6 }}>
              Monitoramento de entradas e saídas previstas para os próximos 30 dias.
            </p>
          </div>
          <div className="mt-8">
            <Link 
              href="/reports/cash-flow" 
              className="inline-flex items-center gap-2 text-sm font-bold" 
              style={{ textDecoration: 'none', color: 'var(--accent)' }}
            >
              Acessar fluxo
              <Icon name="arrow_right" size={14} />
            </Link>
          </div>
        </div>

        {/* Top Produtos Card */}
        <div className="md:col-span-4 group rounded-2xl border p-8 flex flex-col justify-between hover:shadow-md transition-all duration-300" style={{ background: 'var(--surface-2)', borderColor: 'var(--border-soft)' }}>
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg border flex items-center justify-center" style={{ background: 'var(--surface)', borderColor: 'var(--border-soft)', color: 'var(--text-soft)' }}>
                <Icon name="package" size={20} />
              </div>
              <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>ESTOQUE</span>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: '0 0 12px', letterSpacing: '-0.01em', fontFamily: 'var(--font-hanken)' }}>
              Top Produtos
            </h3>
            <p style={{ color: 'var(--text-soft)', fontSize: 13.5, lineHeight: 1.6 }}>
              Ranking dos itens mais vendidos e curva ABC de lucratividade por categoria.
            </p>
          </div>
          <div className="mt-8">
            <Link 
              href="/reports/top-products" 
              className="inline-flex items-center gap-2 text-sm font-bold" 
              style={{ textDecoration: 'none', color: 'var(--accent)' }}
            >
              Ver ranking
              <Icon name="arrow_right" size={14} />
            </Link>
          </div>
        </div>

        {/* Contas a Pagar/Receber Card */}
        <div className="md:col-span-8 group rounded-2xl border p-8 grid md:grid-cols-2 gap-8 hover:shadow-md transition-all duration-300" style={{ background: 'var(--surface)', borderColor: 'var(--border-soft)' }}>
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg border flex items-center justify-center" style={{ background: 'var(--surface-2)', borderColor: 'var(--border-soft)', color: 'var(--text-soft)' }}>
                  <Icon name="invoices" size={20} />
                </div>
                <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>CONTABILIDADE</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px', letterSpacing: '-0.01em', fontFamily: 'var(--font-hanken)' }}>
                Contas e Inadimplência
              </h3>
              <p style={{ color: 'var(--text-soft)', fontSize: 13.5, lineHeight: 1.6 }}>
                Visão geral de boletos vencidos, a vencer e histórico de pagamentos.
              </p>
            </div>
            <Link 
              href="/reports/accounts" 
              className="inline-flex items-center gap-2 text-sm font-bold mt-6" 
              style={{ textDecoration: 'none', color: 'var(--accent)' }}
            >
              Gerenciar contas
              <Icon name="arrow_right" size={14} />
            </Link>
          </div>
          <div className="rounded-xl p-6 flex flex-col gap-4 justify-center" style={{ background: 'var(--surface-2)' }}>
            <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid var(--border-soft)' }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>A Receber</span>
              <span style={{ fontFamily: 'var(--font-geist-mono), monospace', color: 'var(--accent)', fontWeight: 700, fontSize: 13.5 }}>R$ 45.200,00</span>
            </div>
            <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid var(--border-soft)' }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>A Pagar</span>
              <span style={{ fontFamily: 'var(--font-geist-mono), monospace', color: 'var(--danger)', fontWeight: 700, fontSize: 13.5 }}>R$ 12.800,00</span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vencidos</span>
              <span style={{ fontFamily: 'var(--font-geist-mono), monospace', color: 'var(--text)', fontWeight: 700, fontSize: 13.5 }}>R$ 2.450,00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Quick Actions Section */}
      <section style={{ marginTop: 16, paddingTop: 32, borderTop: '1px solid var(--border-soft)' }}>
        <h4 style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 24px' }}>
          OUTRAS ANÁLISES
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            href="/audit-logs" 
            className="flex flex-col items-center gap-3 p-6 rounded-xl hover:scale-[1.02] transition-all text-center group" 
            style={{ textDecoration: 'none', background: 'var(--surface)', border: '1px solid var(--border-soft)' }}
          >
            <span 
              style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center' }} 
              className="group-hover:scale-110 transition-transform"
            >
              <Icon name="eye" size={24} />
            </span>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>Auditoria</span>
          </Link>
          
          <div className="flex flex-col items-center gap-3 p-6 rounded-xl text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', opacity: 0.5, cursor: 'not-allowed' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              <Icon name="customers" size={24} />
            </span>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-muted)' }}>Vendedores</span>
          </div>

          <div className="flex flex-col items-center gap-3 p-6 rounded-xl text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', opacity: 0.5, cursor: 'not-allowed' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              <Icon name="pos" size={24} />
            </span>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-muted)' }}>Compras</span>
          </div>

          <div className="flex flex-col items-center gap-3 p-6 rounded-xl text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', opacity: 0.5, cursor: 'not-allowed' }}>
            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              <Icon name="dashboard" size={24} />
            </span>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-muted)' }}>Regiões</span>
          </div>
        </div>
      </section>
    </div>
  )
}
