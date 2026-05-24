# Design system — Inovabi ERP

Aplica a identidade visual do ERP da Inovabi sobre o frontend Next.js. O sistema é nativo do projeto (não é uma lib externa) — vive em `frontend/app/globals.css` e em alguns componentes em `frontend/app/(dashboard)/` e `frontend/app/ui/`.

> Origem: handoff do "Claude Design" portado para o Next.js existente (commit `08e1b6d`).

---

## Pilares

1. **Tokens em CSS puro** — `:root` / `.theme-light` / `.theme-dark` em `globals.css` definem cores (`oklch`), espaçamentos, raios, sombras e ring. As páginas consomem via `var(--token)` ou utilitários do Tailwind v4 que mapeiam para essas variáveis.
2. **Tema light/dark via cookie** — não há flash de troca: o tema é resolvido no servidor, aplicado como classe no `<html>` (`theme-light` ou `theme-dark`) já no SSR.
3. **Tipografia Geist** — `Geist` (sans) e `Geist_Mono` (mono) carregados via `next/font/google` em `app/layout.tsx`, expostos como variáveis `--font-geist-sans` / `--font-geist-mono` e adotadas como `--font-sans`/`--font-mono` no `@theme` do Tailwind.
4. **Ícones inline em SVG** — sem dependência externa. Um componente `Icon` lê um `name` tipado e renderiza o `<svg>` correspondente.

---

## Tokens

Definidos em `frontend/app/globals.css` dentro de `@layer base`, dois temas com a mesma chave.

| Família | Exemplos |
|---|---|
| Superfícies | `--bg`, `--bg-soft`, `--surface`, `--surface-2`, `--surface-hover` |
| Bordas | `--border`, `--border-soft`, `--border-strong` |
| Texto | `--text`, `--text-soft`, `--text-muted`, `--text-faint`, `--text-invert` |
| Acento | `--accent`, `--accent-soft`, `--accent-hover`, `--accent-ink` |
| Status | `--success` / `--success-soft`, `--warning` / `--warning-soft`, `--danger` / `--danger-soft`, `--info` / `--info-soft` |
| Sombras | `--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--ring` |
| Raios | `--r-xs` … `--r-2xl`, `--r-full` |

Notas:

- **Cores em `oklch`** — paletas com matiz/croma calculados em espaço perceptualmente uniforme.
- **Sombras em `rgba`** — o bundler do Tailwind v4 (lightning CSS) descarta sombras com `oklch`; por isso `--shadow-*` usa `rgba`.
- **Regras fora de `@layer`** — algumas regras críticas (p. ex. utilities customizados) ficam fora de `@layer base` porque o lightning CSS pode dropá-las dentro de camadas em certas condições.
- **Não adicione CSS após o último `@media` do arquivo** — Lightning CSS descarta silenciosamente regras posicionadas após o último bloco `@media` em `globals.css` (testado com Next 16 / Turbopack). Há uma sentinela `FIM DO ARQUIVO` no rodapé do arquivo; sempre insira CSS novo ANTES da seção "Responsivo" no fim.

---

## Tema light/dark

```
app/lib/theme.ts            getTheme() lê cookie 'theme'; toggleThemeAction() alterna e revalida o layout
app/layout.tsx              aplica className `theme-light` ou `theme-dark` no <html> (server-side)
app/(dashboard)/topbar.tsx  botão de toggle (Sun/Moon) chama toggleThemeAction
```

- Cookie: `theme` (`'light'` ou `'dark'`), `path=/`, `maxAge` de 1 ano, `httpOnly: false`.
- Como os dois layouts (`app/layout.tsx` e `app/(dashboard)/layout.tsx`) leem cookies, ambos declaram `export const dynamic = 'force-dynamic'`. Sem isso o Next.js poderia tentar pré-renderizar e o tema (e o token de autenticação no dashboard) não estariam disponíveis em build.
- A troca usa `revalidatePath('/', 'layout')` para forçar o re-render do layout raiz com a nova classe.

---

## Componentes do shell

| Arquivo | Papel |
|---|---|
| `app/(dashboard)/layout.tsx` | server async; busca `/auth/me`, lê `theme`, delega o render para `DashboardShell` |
| `app/(dashboard)/shell.tsx` | client; orquestra estado do drawer mobile (open/close) e fecha em navegação |
| `app/(dashboard)/sidebar-nav.tsx` | client; navegação com pin de favoritos, colapso de seções, ícones; recebe `mobileOpen` |
| `app/(dashboard)/topbar.tsx` | client; breadcrumbs por `usePathname`, toggle de tema, logout, **burger no mobile** |
| `app/ui/icons.tsx` | componente `Icon` (SVG inline) com `IconName` enumerado |
| `app/ui/skeletons.tsx` | `TableSkeleton`, `FormSkeleton` etc. para loading states |
| `app/global-error.tsx` | root error boundary do Next.js (fallback fora do dashboard) |

`sidebar-user.tsx` (Suspense + fetch separado) foi removido no commit do design — o `layout.tsx` agora carrega o usuário direto e passa por props.

---

## Ícones

`app/ui/icons.tsx` exporta:

```ts
type IconName = 'dashboard' | 'pos' | 'sales' | 'customers' | ...

export function Icon({ name, size = 16, stroke = 1.6, className = '' }: IconProps)
```

- Cada `name` mapeia para o conteúdo de um `<svg viewBox="0 0 24 24">` — `stroke="currentColor"`, sem `fill`, com `strokeLinecap="round"`.
- Para adicionar ícone novo: incluir no `type IconName`, depois no `PATHS`. Sem isso, TypeScript barra.
- Tamanho default 16px, espessura 1.6 — combina com o ritmo visual da sidebar e dos badges.

---

## Escopo aplicado

| Tela | Status |
|---|---|
| Dashboard (`/dashboard`) | ✓ design novo |
| Vendas — listas, detalhe e **PDV** (`/sales`, `/sales/[id]`, `/sales/new`) | ✓ design novo |
| Clientes, Fornecedores, Categorias, Produtos, Estoque, Financeiro, Auditoria (listas) | ✓ design novo |
| Relatórios (índice + 4 telas) | ✓ design novo |
| **Forms (novo/editar) de todos os módulos** | ✓ design novo |
| Modais (Pagamento e Cancelamento de venda) | ✓ design novo |
| **Login** | ✓ design novo (split brand + form, com toggle de tema) |

Todos os blocos do app foram migrados para o design system.

---

## Padrão de autenticação (`/login`)

Tela de entrada usa um layout dividido em duas colunas:

- **Painel esquerdo (`.auth-brand`)** — visível apenas em ≥900px. Apresenta o produto: marca + headline + lista de destaques com ícones (PDV, estoque, financeiro, relatórios). Background com gradiente sutil (`surface-2 → surface`) e borda direita pra separar da área funcional.
- **Painel direito (`.auth-main`)** — centraliza o `.auth-card` (max-width 380px) com título "Entrar na sua conta", subtítulo e formulário (email + senha). Botão "Entrar" usa `.btn-primary.auth-submit` (full width, 42px). No topo direito tem o toggle de tema (form que dispara `toggleThemeAction`).
- Em mobile (<900px), o painel esquerdo some — o usuário vê apenas o card centralizado, com `.auth-mobile-brand` no topo (marca compacta) e `.auth-foot-mobile` no rodapé (versão).
- Erros vêm via `.form-banner-error` (agora com `display: flex` para acomodar ícone + texto).

---

## Padrão de forms (novo/editar)

Todos os forms de cadastro seguem a mesma estrutura:

```tsx
<div className="page page-form">
  <div className="page-head">
    <div>
      <h1 className="page-title">…</h1>
      <p className="page-subtitle">…</p>
    </div>
    {/* opcional: <DeleteXxxButton /> à direita */}
  </div>

  <form className="form-stack">
    {state?.error && <div className="form-banner-error">…</div>}

    <section className="card">
      <div className="card-head"><div><h3>Título da seção</h3></div></div>
      <div className="card-body form-grid">
        <Field label="…" name="…">
          <input className="input" />
        </Field>
        {/* span={2} para campos médios, span="full" para textareas */}
      </div>
    </section>

    <div className="form-actions">
      <a href="…" className="btn btn-outline">Cancelar</a>
      <button type="submit" className="btn btn-primary">Salvar</button>
    </div>
  </form>
</div>
```

Utilitários CSS principais:

- `.form-grid` — `repeat(auto-fit, minmax(240px, 1fr))`. Renderiza 1/2/3/4+ colunas automaticamente conforme a largura disponível. Em ultrawide pode chegar a 6 colunas.
- `.form-field-full` — `grid-column: 1 / -1` (linha inteira; use em textareas).
- `.form-field-span-2` — `grid-column: span 2` (campos médios como "Nome", "Logradouro"). Em mobile reverte para `auto` (1 col por linha).
- `.form-banner-error` — banner padrão de erro usando `--danger-soft` + `--danger`.
- `.form-actions` — flex-end + flex-wrap. Em mobile, os botões esticam (`flex: 1 1 auto`).
- `.btn-danger-outline` — botão "Excluir" no topo dos forms de edição.
- `.btn-success` — botão "Registrar pagamento" (verde).
- `.modal-backdrop` / `.modal-panel` / `.modal-title` / `.modal-sub` / `.modal-actions` — padrão para modais simples (pagamento, cancelamento).

---

## Responsividade

O shell é mobile-first com três breakpoints:

| Largura | Comportamento |
|---|---|
| ≥1024px (desktop) | Sidebar inline 248px (ou 64px se colapsada), topbar com search, conteúdo full |
| 768–1023px (tablet) | Sidebar inline; paddings/typografia reduzidos; KPIs do dashboard em 2×2; PDV em coluna única |
| <768px (mobile) | Sidebar vira **drawer off-canvas** (280px) com overlay; **burger no topbar** abre/fecha; search escondido; breadcrumb mostra só o segmento atual; tabelas com scroll horizontal (`.card:has(>.t-table)` aplica `overflow-x: auto`); filtros fluidos; botão "Registrar venda" do PDV fica **sticky** no rodapé do viewport |

Convenções:

- `height: 100dvh` no shell (não `100vh`) — evita salto causado pela URL bar do mobile.
- Drawer fecha automaticamente em `usePathname` change (sem `useEffect` em cascata — comparação durante render, padrão React 19).
- Body com `overflow: hidden` enquanto o drawer está aberto.
- Componentes utilitários CSS:
  - `.t-table-wrap` — wrapper opcional para isolar o scroll horizontal quando o card tem mais conteúdo abaixo da tabela (caso `/sales`, que tem footer de totais).
  - `.dash-kpis`, `.dash-stats`, `.dash-bottom` — grids do dashboard com breakpoints próprios.
  - `.pdv-*` — layout e linhas do carrinho do PDV; em mobile, cada item se reorganiza em 2 níveis (nome em cima, controles embaixo).

---

## Como estender

1. **Nova superfície/cor:** prefira reutilizar um token existente. Se precisar de um novo, adicione em ambos `theme-light` e `theme-dark` em `globals.css`.
2. **Novo card / badge / tabela:** procure padrão existente nas listas (`sales/page.tsx`, `customers/page.tsx`); o vocabulário visual já está consolidado lá.
3. **Novo ícone:** ver acima (`IconName` + `PATHS`). Mantenha o estilo (24×24, stroke 1.6, sem `fill`).
4. **Nova tela:** use `app/ui/skeletons.tsx` para o loading; use o `Icon` para headers de seção; respeite o cookie de tema (não force cores fixas — sempre `var(--token)` ou utilitário Tailwind que mapeie para token).
