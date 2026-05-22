# Banco de Dados — ERP Comercial

Documentação das tabelas do sistema. Cada módulo tem seu próprio arquivo.

## Módulos

| Arquivo | Módulo |
|---|---|
| [autenticacao.md](./autenticacao.md) | Usuários, roles e permissões |
| [clientes-fornecedores.md](./clientes-fornecedores.md) | Clientes e fornecedores |
| [catalogo-estoque.md](./catalogo-estoque.md) | Categorias, produtos e movimentações de estoque |
| [vendas.md](./vendas.md) | Pedidos e itens de venda |
| [financeiro.md](./financeiro.md) | Transações financeiras |
| [auditoria.md](./auditoria.md) | Logs de auditoria (imutável) |

## Convenções

- Todas as tabelas usam `id` UUID v7 como PK (gerado via `HasUuidV7` — `Str::uuid7()`)
- FKs são `foreignUuid`, nunca `foreignId`
- Morphs polimórficos são `uuidMorphs` / `nullableUuidMorphs`
- Tabelas de domínio têm `establishment_id` com FK para `establishments`
- Tabelas com dados sensíveis usam `deleted_at` (Soft Delete)
- Decimais financeiros usam `DECIMAL(10,2)`
- Enums são definidos no banco e espelhados no Model Laravel

## Diagrama de Relacionamentos

```
establishments
 ├──< users
 │      └──< stock_movements
 ├──< customers ──< orders ──< order_items >── products
 │              └──< financial_transactions
 ├──< suppliers ──< products
 │              └──< financial_transactions
 ├──< categories ──< categories (parent_id)
 │               └──< products ──< stock_movements
 │                              └──< order_items
 ├──< orders ──< order_items
 └──< audit_logs (imutável — quem fez o quê)
```
