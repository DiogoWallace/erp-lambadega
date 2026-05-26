'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const heroImageRef = useRef<HTMLImageElement>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    // Floating elements subtle animation on scroll
    const handleScroll = () => {
      const scrolled = window.pageYOffset
      if (heroImageRef.current) {
        heroImageRef.current.style.transform = `translateY(${scrolled * 0.05}px)`
      }
    }
    window.addEventListener('scroll', handleScroll)

    // Intersection Observer for scroll reveal animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible')
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    )

    const revealElements = document.querySelectorAll('.reveal-on-scroll, .reveal-left, .reveal-right')
    revealElements.forEach((el) => observer.observe(el))

    return () => {
      window.removeEventListener('scroll', handleScroll)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="bg-background text-on-surface font-body-md overflow-x-hidden min-h-screen">
      
      {/* TopNavBar */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl z-50 glass-card rounded-2xl shadow-md border border-white/20">
        <div className="flex justify-between items-center h-16 px-6">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-display-lg text-headline-md md:text-headline-lg text-primary tracking-tight font-bold cursor-pointer border-none bg-transparent p-0 text-left"
          >
            Inovabi ERP
          </button>
          
          <div className="hidden md:flex items-center gap-8">
            {/* Dropdown Funcionalidades */}
            <div className="relative group">
              <button 
                onClick={() => scrollToSection('funcionalidades')}
                className="flex items-center gap-1 font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors duration-200 ease-in-out cursor-pointer border-none bg-transparent p-0 pb-1"
              >
                Funcionalidades
                <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:rotate-180">keyboard_arrow_down</span>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-64 rounded-2xl bg-white border border-border shadow-lg opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50 p-2">
                <button 
                  onClick={() => scrollToSection('funcionalidades-pdv')}
                  className="flex items-center gap-3 w-full text-left p-3 rounded-xl hover:bg-bg-soft transition-colors cursor-pointer text-on-surface hover:text-primary border-none bg-transparent"
                >
                  <span className="material-symbols-outlined text-primary text-xl">point_of_sale</span>
                  <div>
                    <div className="font-bold text-sm">PDV & Vendas</div>
                    <div className="text-[11px] text-text-soft">Vendas rápidas e fluidas</div>
                  </div>
                </button>
                <button 
                  onClick={() => scrollToSection('funcionalidades-estoque')}
                  className="flex items-center gap-3 w-full text-left p-3 rounded-xl hover:bg-bg-soft transition-colors cursor-pointer text-on-surface hover:text-primary border-none bg-transparent"
                >
                  <span className="material-symbols-outlined text-primary text-xl">inventory_2</span>
                  <div>
                    <div className="font-bold text-sm">Estoque Inteligente</div>
                    <div className="text-[11px] text-text-soft">Controle total de produtos</div>
                  </div>
                </button>
                <button 
                  onClick={() => scrollToSection('funcionalidades-financeiro')}
                  className="flex items-center gap-3 w-full text-left p-3 rounded-xl hover:bg-bg-soft transition-colors cursor-pointer text-on-surface hover:text-primary border-none bg-transparent"
                >
                  <span className="material-symbols-outlined text-primary text-xl">account_balance_wallet</span>
                  <div>
                    <div className="font-bold text-sm">Financeiro Integrado</div>
                    <div className="text-[11px] text-text-soft">Fluxo de caixa e relatórios</div>
                  </div>
                </button>
              </div>
            </div>

            <button 
              onClick={() => scrollToSection('sobre')}
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors duration-200 ease-in-out cursor-pointer border-none bg-transparent p-0"
            >
              Sobre
            </button>
            <button 
              onClick={() => scrollToSection('metricas')}
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors duration-200 ease-in-out cursor-pointer border-none bg-transparent p-0"
            >
              Resultados
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="bg-accent text-on-secondary px-4 py-2 rounded-xl font-label-md text-label-sm md:text-label-md hover:brightness-110 transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              Acesso Administrativo
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center p-2 rounded-xl hover:bg-bg-soft text-on-surface-variant hover:text-primary transition-colors cursor-pointer border-none bg-transparent"
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-2xl">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown Drawer */}
      <div 
        className={`fixed inset-x-4 top-24 z-40 md:hidden glass-card rounded-2xl border border-white/20 shadow-xl p-6 transition-all duration-300 ${
          mobileMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'
        }`}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 border-b border-border-soft pb-4">
            <div className="text-[11px] font-bold text-text-faint uppercase tracking-wider">Funcionalidades</div>
            <button 
              onClick={() => {
                scrollToSection('funcionalidades-pdv')
                setMobileMenuOpen(false)
              }}
              className="flex items-center gap-3 text-left py-2 rounded-xl text-on-surface hover:text-primary font-bold border-none bg-transparent cursor-pointer"
            >
              <span className="material-symbols-outlined text-primary text-xl">point_of_sale</span>
              <span>PDV & Vendas</span>
            </button>
            <button 
              onClick={() => {
                scrollToSection('funcionalidades-estoque')
                setMobileMenuOpen(false)
              }}
              className="flex items-center gap-3 text-left py-2 rounded-xl text-on-surface hover:text-primary font-bold border-none bg-transparent cursor-pointer"
            >
              <span className="material-symbols-outlined text-primary text-xl">inventory_2</span>
              <span>Estoque Inteligente</span>
            </button>
            <button 
              onClick={() => {
                scrollToSection('funcionalidades-financeiro')
                setMobileMenuOpen(false)
              }}
              className="flex items-center gap-3 text-left py-2 rounded-xl text-on-surface hover:text-primary font-bold border-none bg-transparent cursor-pointer"
            >
              <span className="material-symbols-outlined text-primary text-xl">account_balance_wallet</span>
              <span>Financeiro Integrado</span>
            </button>
          </div>
          
          <button 
            onClick={() => {
              scrollToSection('sobre')
              setMobileMenuOpen(false)
            }}
            className="text-left font-bold text-on-surface hover:text-primary transition-colors py-1 border-none bg-transparent cursor-pointer"
          >
            Sobre Nós
          </button>
          <button 
            onClick={() => {
              scrollToSection('metricas')
              setMobileMenuOpen(false)
            }}
            className="text-left font-bold text-on-surface hover:text-primary transition-colors py-1 border-none bg-transparent cursor-pointer"
          >
            Resultados
          </button>
        </div>
      </div>

      <main className="pt-24 md:pt-28">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-8 pb-24 md:pt-32 md:pb-40 bg-mesh">
          <div className="max-w-7xl mx-auto px-gutter grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-6 z-10 reveal-left">
              <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface leading-tight">
                Transforme sua gestão com inteligência e agilidade
              </h1>
              <p className="font-body-lg text-body-lg text-text-soft max-w-xl">
                O ERP completo para quem busca eficiência no PDV, controle total de estoque e gestão financeira simplificada.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link 
                  href="/login" 
                  className="bg-accent text-on-secondary px-8 py-4 rounded-xl font-label-md text-headline-md shadow-sm hover:shadow-md transition-all text-center cursor-pointer"
                >
                  Teste Grátis
                </Link>
                <Link 
                  href="/login" 
                  className="bg-white border border-border text-primary px-8 py-4 rounded-xl font-label-md text-headline-md hover:bg-surface-hover transition-all text-center cursor-pointer"
                >
                  Ver Demonstração
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 relative reveal-right">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                <img 
                  ref={heroImageRef}
                  alt="Inovabi Dashboard Mockup" 
                  className="w-full h-auto object-cover transition-transform duration-100 ease-out" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuADwzH9ZEUOvip1EB4rk-fSL76_yMFL39-jf4GmHtF_Ej7tGVRIN6Gdw2QR3e2T-1VdX7da63grCtMvO7kc-MXCSOpqtdOoHSI_v-hZzJsK1_Pa1cBS6XGujysjpWnzKEojZMz-Z56A3rKIuxXrYh3HpAXmctIvZYX1ocSqg0z68by7aFzu-u8xJqF8xEc4EB6Lfg0s4v8r7cM8Tyh_IlTb1QxJI9QfUesayKrEs7FxyvJyShNCHf2Qjv4zYvxYuO1SPkwjNCkY-XQH"
                />
              </div>
              {/* Decorative Elements */}
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-accent/10 rounded-full blur-3xl -z-10"></div>
            </div>

          </div>
        </section>

        {/* Seção "Por que o Inovabi?" */}
        <section id="funcionalidades" className="py-24 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-gutter">
            <div className="text-center mb-16 reveal-on-scroll">
              <h2 className="font-display-lg text-headline-lg text-on-surface mb-4">Feito para acelerar seu negócio</h2>
              <p className="font-body-md text-text-soft max-w-2xl mx-auto">Tecnologia de ponta para automatizar processos complexos e permitir que você foque no que realmente importa: vender mais.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Agilidade no PDV */}
              <div className="p-8 rounded-2xl bg-bg-soft border border-border-soft hover:shadow-sm transition-all group reveal-on-scroll">
                <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">point_of_sale</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Agilidade no PDV</h3>
                <p className="font-body-sm text-body-sm text-text-soft">Vendas rápidas e sem fricção para o seu negócio, com suporte a múltiplas formas de pagamento.</p>
              </div>

              {/* Estoque Inteligente */}
              <div className="p-8 rounded-2xl bg-bg-soft border border-border-soft hover:shadow-sm transition-all group reveal-on-scroll delay-100">
                <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">inventory_2</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Estoque Inteligente</h3>
                <p className="font-body-sm text-body-sm text-text-soft">Gestão em tempo real com alertas automáticos de reposição e controle de lotes simplificado.</p>
              </div>

              {/* Financeiro Integrado */}
              <div className="p-8 rounded-2xl bg-bg-soft border border-border-soft hover:shadow-sm transition-all group reveal-on-scroll delay-200">
                <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Financeiro Integrado</h3>
                <p className="font-body-sm text-body-sm text-text-soft">Fluxo de caixa e relatórios precisos em um só lugar. Tenha visão clara da sua saúde financeira.</p>
              </div>

            </div>
          </div>
        </section>

        {/* Funcionalidade Detalhada: PDV */}
        <section id="funcionalidades-pdv" className="py-24 bg-surface-container-low overflow-hidden scroll-mt-20">
          <div className="max-w-7xl mx-auto px-gutter">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              
              <div className="w-full lg:w-1/2 relative reveal-left">
                <div className="rounded-3xl overflow-hidden shadow-xl border border-white/20">
                  <img 
                    alt="Interface do PDV Inovabi" 
                    className="w-full aspect-[4/3] object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCynngX1jyNxKI26oH--hU3Erfn3At4PXI5jQNHekyKT-nBe3TBxkDDhqv8rCd1WvpSrWbSJ2meBAnOa-bA3PxlNQR1h6sdcP7PVdxYs0LUYsMIhCatFmO2axZediwiG73IHJw9tJbuNibY4RFY_L-F8y0fHk2oeqoM9sTn6atUaFTol9n7ipjpsSxBR0bO8DO_d7kbjvrixL98Ym83WjZr0XqIFwcouBEtHNGJdndZcj3qPlNQ9aSZ0o4i54lYvfh42pV_3S_lOgP6"
                  />
                </div>
              </div>

              <div className="w-full lg:w-1/2 space-y-6 reveal-right">
                <div className="inline-block px-4 py-1 bg-primary-container/10 text-primary rounded-full font-label-sm text-label-sm uppercase tracking-wider">
                  PDV & Vendas
                </div>
                <h2 className="font-display-lg text-headline-lg text-on-surface">Agilidade no Ponto de Venda</h2>
                <p className="font-body-md text-body-md text-text-soft leading-relaxed">
                  Realize vendas em segundos e evite filas no seu balcão. O PDV da Inovabi é otimizado para alta velocidade, possuindo atalhos rápidos de teclado, leitura de código de barras e emissão imediata de notas fiscais (NFC-e / SAT).
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary mt-1">bolt</span>
                    <div>
                      <h4 className="font-label-md text-label-md font-bold text-on-surface">Atendimento Ultra Rápido</h4>
                      <p className="text-body-sm text-text-soft">Busca instantânea de produtos e registro rápido de itens no carrinho.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary mt-1">credit_card</span>
                    <div>
                      <h4 className="font-label-md text-label-md font-bold text-on-surface">Multi-pagamentos</h4>
                      <p className="text-body-sm text-text-soft">Aceite PIX, cartões de crédito/débito, dinheiro e crediário de forma combinada.</p>
                    </div>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* Funcionalidade Detalhada: Estoque */}
        <section id="funcionalidades-estoque" className="py-24 bg-white overflow-hidden scroll-mt-20">
          <div className="max-w-7xl mx-auto px-gutter">
            <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
              
              <div className="w-full lg:w-1/2 relative reveal-right">
                <div className="rounded-3xl overflow-hidden shadow-xl border border-white/20">
                  <img 
                    alt="Gestão de Estoque no Inovabi" 
                    className="w-full aspect-[4/3] object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuADwzH9ZEUOvip1EB4rk-fSL76_yMFL39-jf4GmHtF_Ej7tGVRIN6Gdw2QR3e2T-1VdX7da63grCtMvO7kc-MXCSOpqtdOoHSI_v-hZzJsK1_Pa1cBS6XGujysjpWnzKEojZMz-Z56A3rKIuxXrYh3HpAXmctIvZYX1ocSqg0z68by7aFzu-u8xJqF8xEc4EB6Lfg0s4v8r7cM8Tyh_IlTb1QxJI9QfUesayKrEs7FxyvJyShNCHf2Qjv4zYvxYuO1SPkwjNCkY-XQH"
                  />
                </div>
              </div>

              <div className="w-full lg:w-1/2 space-y-6 reveal-left">
                <div className="inline-block px-4 py-1 bg-primary-container/10 text-primary rounded-full font-label-sm text-label-sm uppercase tracking-wider">
                  Estoque Inteligente
                </div>
                <h2 className="font-display-lg text-headline-lg text-on-surface">Controle de Estoque em Tempo Real</h2>
                <p className="font-body-md text-body-md text-text-soft leading-relaxed">
                  Monitore suas mercadorias sem esforço. Evite perdas por validade, saiba exatamente quando repor produtos com alertas automáticos de estoque mínimo e automatize o recebimento de mercadorias via importação de XML da nota fiscal.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary mt-1">notifications_active</span>
                    <div>
                      <h4 className="font-label-md text-label-md font-bold text-on-surface">Alertas de Reposição</h4>
                      <p className="text-body-sm text-text-soft">Seja avisado automaticamente quando qualquer item atingir a quantidade mínima.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary mt-1">qr_code_2</span>
                    <div>
                      <h4 className="font-label-md text-label-md font-bold text-on-surface">Etiquetas e Rastreamento</h4>
                      <p className="text-body-sm text-text-soft">Rastreabilidade completa de lotes, datas de validade e geração de etiquetas de código de barras.</p>
                    </div>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* Funcionalidade Detalhada: Financeiro */}
        <section id="funcionalidades-financeiro" className="py-24 bg-surface-container-low overflow-hidden scroll-mt-20">
          <div className="max-w-7xl mx-auto px-gutter">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              
              <div className="w-full lg:w-1/2 relative reveal-left">
                <div className="rounded-3xl overflow-hidden shadow-xl border border-white/20">
                  <img 
                    alt="Painel Financeiro Inovabi" 
                    className="w-full aspect-[4/3] object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCynngX1jyNxKI26oH--hU3Erfn3At4PXI5jQNHekyKT-nBe3TBxkDDhqv8rCd1WvpSrWbSJ2meBAnOa-bA3PxlNQR1h6sdcP7PVdxYs0LUYsMIhCatFmO2axZediwiG73IHJw9tJbuNibY4RFY_L-F8y0fHk2oeqoM9sTn6atUaFTol9n7ipjpsSxBR0bO8DO_d7kbjvrixL98Ym83WjZr0XqIFwcouBEtHNGJdndZcj3qPlNQ9aSZ0o4i54lYvfh42pV_3S_lOgP6"
                  />
                </div>
              </div>

              <div className="w-full lg:w-1/2 space-y-6 reveal-right">
                <div className="inline-block px-4 py-1 bg-primary-container/10 text-primary rounded-full font-label-sm text-label-sm uppercase tracking-wider">
                  Financeiro Integrado
                </div>
                <h2 className="font-display-lg text-headline-lg text-on-surface">Gestão Financeira Simplificada</h2>
                <p className="font-body-md text-body-md text-text-soft leading-relaxed">
                  Mantenha a saúde do seu negócio sob controle com fluxo de caixa em tempo real. Controle contas a pagar e a receber de forma integrada e tenha relatórios gerenciais e DRE automáticos gerados com base nas suas vendas de PDV.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary mt-1">insights</span>
                    <div>
                      <h4 className="font-label-md text-label-md font-bold text-on-surface">Fluxo de Caixa Dinâmico</h4>
                      <p className="text-body-sm text-text-soft">Monitore receitas e despesas por categorias, sabendo exatamente para onde vai o seu lucro.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary mt-1">account_balance</span>
                    <div>
                      <h4 className="font-label-md text-label-md font-bold text-on-surface">Conciliação Bancária</h4>
                      <p className="text-body-sm text-text-soft">Importe arquivos OFX e concilie suas contas bancárias em poucos cliques.</p>
                    </div>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* Seção de Explicação Detalhada */}
        <section id="sobre" className="py-24 bg-white overflow-hidden scroll-mt-20">
          <div className="max-w-7xl mx-auto px-gutter">
            <div className="flex flex-col lg:flex-row items-center gap-24">
              
              <div className="w-full lg:w-1/2 relative reveal-left">
                <div className="rounded-3xl overflow-hidden shadow-xl">
                  <img 
                    alt="Equipe colaborando com o Inovabi ERP" 
                    className="w-full aspect-[4/3] object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCynngX1jyNxKI26oH--hU3Erfn3At4PXI5jQNHekyKT-nBe3TBxkDDhqv8rCd1WvpSrWbSJ2meBAnOa-bA3PxlNQR1h6sdcP7PVdxYs0LUYsMIhCatFmO2axZediwiG73IHJw9tJbuNibY4RFY_L-F8y0fHk2oeqoM9sTn6atUaFTol9n7ipjpsSxBR0bO8DO_d7kbjvrixL98Ym83WjZr0XqIFwcouBEtHNGJdndZcj3qPlNQ9aSZ0o4i54lYvfh42pV_3S_lOgP6"
                  />
                </div>
                <div className="absolute -bottom-8 -right-8 glass-card p-6 rounded-2xl shadow-lg max-w-[240px] hidden md:block">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-success" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span className="font-label-md text-label-md font-bold">Processo Otimizado</span>
                  </div>
                  <p className="text-body-sm text-text-soft">Decisões baseadas em dados reais de toda a sua equipe.</p>
                </div>
              </div>

              <div className="w-full lg:w-1/2 space-y-6 reveal-right">
                <div className="inline-block px-4 py-1 bg-primary-container/10 text-primary rounded-full font-label-sm text-label-sm uppercase tracking-wider">
                  Liderança de Mercado
                </div>
                <h2 className="font-display-lg text-headline-lg md:text-headline-lg text-on-surface">Feito por quem entende de negócios</h2>
                <p className="font-body-md text-body-md text-text-soft leading-relaxed">
                  O Inovabi ERP foi desenvolvido para eliminar as barreiras entre os departamentos. Nossa plataforma integra vendas, estoque e finanças em uma interface intuitiva que permite que sua equipe colabore melhor e tome decisões estratégicas com confiança.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary mt-1">trending_up</span>
                    <div>
                      <h4 className="font-label-md text-label-md font-bold text-on-surface">Crescimento Escalável</h4>
                      <p className="text-body-sm text-text-soft">Prepare sua empresa para crescer sem perder o controle operacional.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary mt-1">security</span>
                    <div>
                      <h4 className="font-label-md text-label-md font-bold text-on-surface">Segurança de Dados</h4>
                      <p className="text-body-sm text-text-soft">Proteção bancária para suas informações comerciais e financeiras.</p>
                    </div>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* Seção de Métricas */}
        <section id="metricas" className="py-24 bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-gutter">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="text-center p-8 border-r border-border last:border-0 md:border-r-0 lg:border-r reveal-on-scroll">
                <div className="font-display-lg text-display-lg text-primary mb-2">+1.000</div>
                <div className="font-headline-md text-headline-md text-on-surface mb-1">Clientes Satisfeitos</div>
                <p className="font-body-sm text-body-sm text-text-soft">Empresas que transformaram sua gestão conosco.</p>
              </div>

              <div className="text-center p-8 border-r border-border last:border-0 md:border-r-0 lg:border-r reveal-on-scroll delay-100">
                <div className="font-display-lg text-display-lg text-primary mb-2">99%</div>
                <div className="font-headline-md text-headline-md text-on-surface mb-1">Uptime Garantido</div>
                <p className="font-body-sm text-body-sm text-text-soft">Sua operação nunca para com nossa infraestrutura robusta.</p>
              </div>

              <div className="text-center p-8 reveal-on-scroll delay-200">
                <div className="font-display-lg text-display-lg text-primary mb-2">30%</div>
                <div className="font-headline-md text-headline-md text-on-surface mb-1">Menos Perdas</div>
                <p className="font-body-sm text-body-sm text-text-soft">Redução média em perdas de estoque no primeiro ano.</p>
              </div>

            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-24 px-gutter">
          <div className="max-w-7xl mx-auto bg-primary rounded-[2.5rem] p-12 md:p-24 text-center text-on-primary relative overflow-hidden reveal-on-scroll">
            <div className="relative z-10">
              <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-6">Pronto para levar sua empresa ao próximo nível?</h2>
              <p className="font-body-lg text-body-lg text-primary-fixed/80 max-w-2xl mx-auto mb-8">
                Junte-se a centenas de empreendedores que já escolheram a eficiência. Comece seu teste gratuito agora mesmo, sem compromisso.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link 
                  href="/login" 
                  className="bg-white text-primary px-8 py-4 rounded-xl font-label-md text-headline-md hover:bg-surface-container-low transition-all text-center cursor-pointer"
                >
                  Criar Conta Grátis
                </Link>
                <Link 
                  href="/login" 
                  className="border border-white/30 text-white px-8 py-4 rounded-xl font-label-md text-headline-md hover:bg-white/10 transition-all text-center cursor-pointer"
                >
                  Falar com Consultor
                </Link>
              </div>
            </div>
            {/* Decorative Glows */}
            <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-white/5 rounded-full blur-[120px]"></div>
            <div className="absolute -bottom-1/2 -right-1/4 w-full h-full bg-accent/20 rounded-full blur-[120px]"></div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low w-full py-8 border-t border-border-soft">
        <div className="max-w-7xl mx-auto px-gutter">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            
            <div className="md:col-span-1 space-y-4">
              <div className="font-headline-md text-headline-md font-bold text-primary">Inovabi ERP</div>
              <p className="font-body-sm text-body-sm text-text-soft">Soluções inteligentes para gestão empresarial de alto desempenho.</p>
            </div>

            <div className="space-y-4">
              <h5 className="font-label-md text-label-md font-bold text-on-surface">Navegação</h5>
              <ul className="space-y-2">
                <li><a className="font-body-sm text-body-sm text-text-soft hover:text-primary transition-all" href="#funcionalidades">Funcionalidades</a></li>
                <li><a className="font-body-sm text-body-sm text-text-soft hover:text-primary transition-all" href="#sobre">Sobre</a></li>
                <li><a className="font-body-sm text-body-sm text-text-soft hover:text-primary transition-all" href="#metricas">Resultados</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h5 className="font-label-md text-label-md font-bold text-on-surface">Legal</h5>
              <ul className="space-y-2">
                <li><a className="font-body-sm text-body-sm text-text-soft hover:text-primary transition-all" href="#">Termos de Uso</a></li>
                <li><a className="font-body-sm text-body-sm text-text-soft hover:text-primary transition-all" href="#">Privacidade</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h5 className="font-label-md text-label-md font-bold text-on-surface">Suporte</h5>
              <ul className="space-y-2">
                <li><a className="font-body-sm text-body-sm text-text-soft hover:text-primary transition-all" href="#">Contato</a></li>
                <li><a className="font-body-sm text-body-sm text-text-soft hover:text-primary transition-all" href="#">Centro de Ajuda</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-lg border-t border-border-soft flex flex-col md:flex-row justify-between items-center gap-md opacity-80">
            <p className="font-body-sm text-body-sm text-text-soft">© 2026 Inovabi ERP. Todos os direitos reservados a heso.com.br</p>
            <div className="flex gap-lg">
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
              </a>
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
