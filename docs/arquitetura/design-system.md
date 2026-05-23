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
| **Login** | ✗ ainda no estilo antigo |
| **Forms (novo/editar) de todos os módulos** | ✗ ainda no estilo antigo |

Os dois blocos restantes ficaram como follow-up.

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
