# Roadmap

## Fase 1 — Web only (em andamento)

Objetivo: sistema web funcional, operando em produção, com as fundações arquiteturais para evolução.

### Fundações (esta etapa)

- [x] Autenticação (Sanctum, RBAC com Spatie)
- [x] Estrutura de banco (clientes, fornecedores, catálogo, estoque, vendas, financeiro)
- [x] CRUD de clientes (backend + frontend)
- [x] Layout dashboard com route group, sidebar, loading states
- [x] **Migração de IDs para UUID v7** ← bloqueante para Fase 2
- [x] **Tabela `establishments` e `establishment_id` nas tabelas de domínio** ← bloqueante para Fase 2
- [x] **Tabela `sync_log`** (schema; observer fica para a Fase 2)
- [x] Trait `BelongsToEstablishment` + global scope nos models

### Módulos de negócio

- [x] Clientes (CRUD completo)
- [x] Categorias (CRUD completo)
- [ ] Fornecedores (CRUD)
- [ ] Produtos (CRUD com upload de imagem)
- [ ] Movimentação de estoque (registro + histórico)
- [ ] Vendas (PDV web — carrinho, desconto, fechamento)
- [ ] Contas a pagar / receber (financeiro)
- [ ] Relatórios básicos (vendas por período, top produtos, fluxo de caixa)

### Operacional

- [x] Deploy automatizado (dev + prod via GitHub Actions)
- [ ] Backup automatizado do MySQL
- [ ] Monitoramento de uptime
- [ ] Página de manutenção

**Critério de saída:** sistema rodando em produção com pelo menos um estabelecimento real operando todos os módulos.

---

## Fase 2 — Servidor local + sync

Objetivo: permitir que estabelecimentos operem offline com sincronização transparente para o central.

### Backend (central)

- [ ] Observer `SyncObserver` populando `sync_log` em todas as escritas
- [ ] Endpoint `POST /api/sync/push` (recebe eventos do local)
- [ ] Endpoint `GET /api/sync/pull` (envia eventos para o local)
- [ ] Lógica de resolução de conflito por entidade (ver [sincronização](sincronizacao.md))
- [ ] Token de autenticação específico para servidor local (não-user)
- [ ] Painel admin: status de sync por estabelecimento

### Backend (servidor local)

- [ ] Empacotar backend em `docker-compose.local.yml`
- [ ] Comando Artisan `sync:run` (worker em loop)
- [ ] Configuração via env (origem, token, estabelecimento)
- [ ] Setup automatizado (script `install.sh` ou similar)

### Frontend

- [ ] Indicador de "modo offline" no header
- [ ] Tela de status de sync (eventos pendentes, última sincronização)
- [ ] Alertas de conflito para revisão manual

**Critério de saída:** pelo menos um estabelecimento operando com servidor local, e perda de internet por horas não impacta a operação.

---

## Fase 3 — PDV nativo + dispositivos

Objetivo: experiência otimizada para o ponto de venda, com integração de hardware.

### App nativo

- [ ] App React Native ou Flutter (decisão em aberto)
- [ ] Cache local (SQLite) — funciona mesmo se servidor local cair brevemente
- [ ] Conexão prioritária via LAN; fallback para internet direto no central
- [ ] Login simplificado (PIN do operador)
- [ ] Interface foco em velocidade (menos cliques)

### Integração de hardware

- [ ] Impressora térmica (USB / rede)
- [ ] Leitor de código de barras (USB / bluetooth)
- [ ] Gaveta de dinheiro
- [ ] Pinpad de cartão (gateway de pagamento)
- [ ] Balança (loja de granel)

### Fiscal

- [ ] Emissão de NFC-e (Nota Fiscal de Consumidor eletrônica)
- [ ] Integração com SEFAZ
- [ ] Contingência fiscal (operação sem certificado válido)

**Critério de saída:** múltiplos estabelecimentos com PDV nativo, vendendo, imprimindo cupom fiscal, sem depender de browser.

---

## O que NÃO vamos fazer

Decisões explícitas sobre escopo. Coisas que parecem tentadoras mas não trazem valor agora:

- **App mobile do gestor** — gestor usa o web; não vale o esforço de manter dois clients
- **Marketplace / e-commerce integrado** — escopo de outro produto
- **Integração com ERPs externos (Bling, Tiny)** — só se cliente pedir e pagar
- **Multi-idioma full** — sistema é em PT-BR por enquanto; UI/URLs em inglês deixam a porta aberta
- **Custom branding por tenant** — overkill para a fase atual

---

## Como contribuir

1. Pegue uma task da fase atual (Fase 1)
2. Leia os documentos de arquitetura relacionados antes de codificar
3. Siga as convenções já estabelecidas — não introduza um padrão novo sem discussão
4. Commits em inglês, código em inglês, documentação em PT-BR
5. PR contra `dev`; merge para `main` dispara deploy de produção
