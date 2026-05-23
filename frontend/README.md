# ERP Comercial — Frontend

Interface web em Next.js 16 (App Router) para o ERP multi-tenant da Inovabi. Consome a API Laravel via Server Components e Server Actions — sem Redux, sem SWR, sem client-side fetching além do estritamente necessário.

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript 5 |
| UI | React 19 + Tailwind CSS 4 |
| Testes | Vitest |
| Container | Docker + Compose v2 |

---

## Rodando localmente

Os comandos abaixo assumem que o Docker Compose já está up (`docker compose up -d` na raiz).

O container do frontend já roda `next dev` com hot-reload. Acesse em **http://localhost:8000**.

```bash
# Instalar dependências (necessário na primeira vez)
docker compose exec frontend npm install

# Rodar os testes
make test-frontend
# ou diretamente:
docker compose exec frontend npm test
```

> Se o frontend travar após o backend ser recriado (HTTP 200 com body vazio), reinicie: `docker compose restart frontend`.

---

## Estrutura

```
frontend/
├── proxy.ts                     auth check na borda (substitui middleware.ts no Next.js 16)
├── vitest.config.ts             config de testes unitários
├── app/
│   ├── layout.tsx               root layout; força dynamic (lê cookie 'theme'); aplica classe theme-light/dark no <html>
│   ├── global-error.tsx         root error boundary (Next.js) — renderiza <html> próprio
│   ├── (dashboard)/             route group — rotas autenticadas (não aparece na URL)
│   │   ├── __tests__/           testes Vitest para os build-body de todos os módulos
│   │   ├── layout.tsx           async; força dynamic; carrega /auth/me + tema; delega para DashboardShell
│   │   ├── shell.tsx            client; orquestra o drawer mobile (open/close + reset em navegação)
│   │   ├── sidebar-nav.tsx      client; navegação com pin, favoritos, colapso; recebe mobileOpen
│   │   ├── topbar.tsx           client; breadcrumbs por pathname, toggle de tema, logout, burger no mobile
│   │   ├── error.tsx            error boundary do dashboard (client)
│   │   ├── actions.ts           logoutAction
│   │   ├── customers/           CRUD de clientes
│   │   │   ├── page.tsx         lista server-side com paginação e busca
│   │   │   ├── new/page.tsx
│   │   │   ├── [id]/edit/page.tsx
│   │   │   ├── customer-form.tsx   client; useActionState
│   │   │   ├── delete-button.tsx   client; confirm() + form action
│   │   │   ├── build-body.ts    converte FormData → objeto de API (testável)
│   │   │   └── actions.ts       Server Actions (importa build-body)
│   │   ├── categories/          CRUD de categorias + subcategorias
│   │   ├── suppliers/           CRUD de fornecedores
│   │   ├── products/            CRUD de produtos + link "+ Mov." p/ estoque
│   │   ├── stock-movements/     registro e histórico de movimentações
│   │   ├── sales/               PDV web + lista + detalhe (pay/cancel)
│   │   ├── finance/             contas a pagar/receber
│   │   ├── audit-logs/          logs de auditoria (admin only)
│   │   └── reports/             4 relatórios (sales, top-products, cash-flow, accounts) + CSV
│   ├── api/auth/clear/route.ts  route handler — limpa cookie e redireciona para /login
│   ├── lib/
│   │   ├── api.ts               apiFetch: injeta token, trata 401/403/5xx
│   │   ├── theme.ts             getTheme() + toggleThemeAction() (cookie 'theme')
│   │   └── types.ts             interfaces TypeScript de todos os modelos
│   ├── ui/
│   │   ├── icons.tsx            componente Icon (SVG inline) com IconName tipado
│   │   └── skeletons.tsx        TableSkeleton, FormSkeleton (loading states)
│   ├── globals.css              tokens do design system (oklch), tema light/dark, tipografia Geist
│   ├── login/                   tela pública de login
│   └── page.tsx                 home pública
└── next.config.ts
```

---

## Padrões obrigatórios

### Fetch em Server Components

Sempre usar `apiFetch` de `@/app/lib/api`. Nunca fazer `fetch` manual em Server Components.

```ts
import { apiFetch } from '@/app/lib/api'

const res = await apiFetch('/customers?page=1&search=joao')
const { data, meta } = await res.json()
```

`apiFetch` injeta o `Authorization: Bearer {token}` do cookie, e trata:
- `401` → redireciona para `/api/auth/clear` (limpa cookie + manda para login)
- `403` → redireciona para `/dashboard`
- `5xx` → lança exceção (capturada pelo `error.tsx`)

### Mutações com Server Actions

Formulários usam `useActionState` no componente client, com a action definida em `actions.ts`:

```tsx
// Componente client
'use client'
const [state, formAction, pending] = useActionState(createCustomerAction, null)
return <form action={formAction}>...</form>
```

```ts
// actions.ts (Server Action)
'use server'
export async function createCustomerAction(_prev: unknown, formData: FormData) {
  const body = buildBody(formData)
  // ...chama a API, retorna erros ou redireciona
}
```

### build-body.ts

Cada módulo tem um `build-body.ts` com a função pura `buildBody(formData: FormData)` que converte os campos do formulário para o objeto de API (strings → números, strings vazias → `null`, etc.). Separada do contexto `'use server'` para ser testável diretamente com Vitest.

### Auth na borda

`proxy.ts` verifica só a existência do cookie `token`. Não faz chamada à API (rodaria em todo prefetch). Token inválido é tratado pelos Server Components via `apiFetch`.

### Layouts dependem de cookies → `force-dynamic`

`app/layout.tsx` lê o cookie `theme` e `app/(dashboard)/layout.tsx` lê `token` + `theme`. Ambos declaram:

```ts
export const dynamic = 'force-dynamic'
```

Sem isso, o Next.js pode tentar pré-renderizar e o tema/usuário ficam indisponíveis em build.

### Tipos

Todos os IDs são `string` (UUID v7). Nunca `number`. Interfaces em `app/lib/types.ts`.

---

## Design system

Sistema próprio do projeto (não é lib externa). Vive em `app/globals.css` + componentes em `app/(dashboard)/` e `app/ui/`. Detalhes em [`docs/arquitetura/design-system.md`](../docs/arquitetura/design-system.md).

- **Tokens em CSS** — `:root`/`.theme-light`/`.theme-dark` definem cores (`oklch`), raios, sombras (`rgba` por causa do lightning CSS), ring.
- **Tema light/dark via cookie** — `app/lib/theme.ts` expõe `getTheme()` (server) e `toggleThemeAction()` (server action). A classe `theme-light`/`theme-dark` é aplicada no `<html>` em SSR — sem flash de troca.
- **Tipografia Geist** — `Geist` + `Geist_Mono` via `next/font/google`, expostas como `--font-geist-sans` / `--font-geist-mono`.
- **Ícones** — componente `Icon` em `app/ui/icons.tsx` com `IconName` tipado. SVG inline, sem dependência externa. Para adicionar ícone: incluir no `type IconName` + `PATHS`.
- **Shell do dashboard** — `DashboardShell` (client) envolve `SidebarNav` (pin/favoritos/colapso) + `Topbar` (breadcrumbs, toggle de tema, logout, burger no mobile) e gerencia o estado do drawer mobile.
- **Responsivo** — três breakpoints (≥1024 desktop, 768–1023 tablet, <768 mobile). No mobile: sidebar vira drawer off-canvas com overlay, burger no topbar, breadcrumb compacto, search escondido, tabelas com scroll horizontal (`.card:has(>.t-table)`), grids do dashboard em 2 cols, filtros fluidos, botão "Registrar venda" do PDV sticky no rodapé. `height: 100dvh` no shell evita o salto da URL bar mobile.
- **Escopo aplicado** — todas as listas, relatórios, detalhe de venda e **PDV (`/sales/new`)**. **Login e forms (novo/editar) ainda no estilo antigo** — follow-up restante.

---

## Error boundaries

| Arquivo | Quando dispara |
|---|---|
| `app/global-error.tsx` | erro fora do dashboard ou no root layout — renderiza `<html>` próprio |
| `app/(dashboard)/error.tsx` | erro dentro do dashboard — fica dentro do shell (sidebar/topbar) |

---

## Testes

```bash
make test-frontend     # roda via Docker
# ou dentro do container:
npm test               # vitest run (one-shot)
npm run test:watch     # vitest em modo watch
```

- 21 testes unitários cobrindo `buildBody` de todos os 5 módulos (customers, categories, suppliers, products, stock-movements)
- Rodam em ~500ms, sem necessidade de mocks de Next.js (build-body são funções puras)

---

## Variáveis de ambiente

Copiar `frontend/.env.local.example` para `frontend/.env.local` e ajustar:

| Variável | Descrição |
|---|---|
| `API_BASE_URL` | URL interna para Server Components (`http://webserver:8001` em Docker) |
| `NEXT_PUBLIC_API_URL` | URL pública para uso eventual no client (pouco usado hoje) |
