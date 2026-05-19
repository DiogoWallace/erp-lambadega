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

## Convenções

- Todas as tabelas usam `id` BIGINT auto-increment como PK
- Tabelas com dados sensíveis usam `deleted_at` (Soft Delete)
- Decimais financeiros usam `DECIMAL(10,2)`
- Enums são definidos no banco e espelhados no Model Laravel
- FKs seguem o padrão `{tabela_singular}_id`

## Diagrama de Relacionamentos

```
users
 ├──< orders
 │      ├──< order_items >── products
 │      ├──< financial_transactions
 │      └──< stock_movements (via reference polimórfico)
 └──< stock_movements

customers ──< orders
          └──< financial_transactions

suppliers ──< products
          └──< financial_transactions

categories ──< categories (parent_id, subcategorias)
           └──< products

products ──< stock_movements
         └──< order_items
```
