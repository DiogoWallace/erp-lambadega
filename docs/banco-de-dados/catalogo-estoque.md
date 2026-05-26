# Catálogo e Estoque

## categories

Classificação hierárquica de produtos. Suporta subcategorias via `parent_id`.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | BIGINT PK | — |
| `parent_id` | BIGINT FK nullable | Categoria pai (auto-referencial) |
| `name` | VARCHAR | Ex: `Vinhos Tintos` |
| `slug` | VARCHAR UNIQUE | Gerado automaticamente do name |
| `description` | TEXT nullable | Descrição da categoria |
| `sort_order` | SMALLINT default 0 | Ordem de exibição |
| `is_active` | BOOLEAN default true | — |
| `created_at` / `updated_at` | TIMESTAMP | — |
| `deleted_at` | TIMESTAMP nullable | Soft delete |

**Índices:** `parent_id`, `is_active`, `sort_order`

**Exemplo de hierarquia:**
```
Bebidas (parent_id: null)
 ├── Vinhos (parent_id: 1)
 │    ├── Tintos (parent_id: 2)
 │    └── Brancos (parent_id: 2)
 └── Cervejas (parent_id: 1)
```

> O slug é gerado automaticamente via `Str::slug($name)` no evento `creating` do Model.

---

## products

Catálogo de produtos para venda. O `stock_quantity` é atualizado a cada `stock_movement`.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | BIGINT PK | — |
| `category_id` | BIGINT FK nullable | Categoria |
| `supplier_id` | BIGINT FK nullable | Fornecedor padrão |
| `name` | VARCHAR | Nome do produto |
| `description` | TEXT nullable | Descrição detalhada |
| `brand` | VARCHAR nullable | Marca |
| `sku` | VARCHAR UNIQUE nullable | Código interno de controle |
| `barcode` | VARCHAR UNIQUE nullable | Código de barras (EAN-13 / QR) |
| `unit` | ENUM | `un`, `kg`, `g`, `l`, `ml`, `cx` |
| `cost_price` | DECIMAL(10,2) | Preço de custo atual |
| `sale_price` | DECIMAL(10,2) | Preço de venda atual |
| `stock_quantity` | INT default 0 | Saldo atual em estoque |
| `min_stock_quantity` | INT default 0 | Mínimo para alerta de estoque baixo |
| `image_path` | VARCHAR nullable | Caminho da imagem no storage |
| `is_active` | BOOLEAN default true | — |
| `created_at` / `updated_at` | TIMESTAMP | — |
| `deleted_at` | TIMESTAMP nullable | Soft delete |

**Índices:** `category_id`, `supplier_id`, `is_active`, `stock_quantity`

> **Atenção:** nunca atualizar `stock_quantity` diretamente. Sempre criar um `stock_movement` — o Model deve ser responsável por manter o saldo sincronizado.

---

## stock_movements

Registro imutável de toda movimentação de estoque. Fonte da verdade para auditoria.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | BIGINT PK | — |
| `product_id` | BIGINT FK | Produto movimentado |
| `user_id` | BIGINT FK | Usuário que registrou |
| `reference_type` | VARCHAR nullable | Tipo da origem (polimórfico) |
| `reference_id` | BIGINT nullable | ID da origem (polimórfico) |
| `type` | ENUM | `in` (entrada), `out` (saída), `adjustment` (ajuste) |
| `quantity` | INT | Quantidade movimentada (sempre positivo) |
| `stock_before` | INT | Saldo antes da movimentação |
| `stock_after` | INT | Saldo após a movimentação |
| `cost_price` | DECIMAL(10,2) nullable | Custo unitário no momento |
| `description` | VARCHAR nullable | Ex: `Venda #ORD-000012`, `Ajuste de inventário` |
| `created_at` / `updated_at` | TIMESTAMP | — |

**Índices:** `(product_id, created_at)`, `type`

**Reference polimórfico** — a origem do movimento pode ser:

| `reference_type` | Origem |
|---|---|
| `App\Models\Order` | Saída por venda |
| `null` | Ajuste manual |

> Futuro: adicionar `App\Models\PurchaseOrder` para entradas via ordem de compra.

---

## product_cost_history

Log imutável de variações do `cost_price` de produtos, por fornecedor. Alimenta o relatório de evolução de custos e a análise comparativa entre fornecedores.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID v7 PK | — |
| `establishment_id` | UUID FK | Tenant |
| `product_id` | UUID FK | Produto |
| `supplier_id` | UUID FK nullable | Fornecedor (null = sem fornecedor específico, ex: cotação solta) |
| `user_id` | UUID FK nullable | Quem registrou |
| `stock_movement_id` | UUID FK nullable | Vínculo quando origem = `stock_in` |
| `cost_price` | DECIMAL(10,2) | Custo registrado |
| `source` | ENUM | `stock_in`, `product_update`, `quote` |
| `notes` | TEXT nullable | Observação (cotações manuais) |
| `effective_at` | TIMESTAMP | Data efetiva da cotação/movimento |
| `created_at` | TIMESTAMP | Quando o registro foi gravado |

**Sem `updated_at` nem soft delete** — log imutável.

**Índices:** `pch_estab_product_effective_idx`, `pch_estab_supplier_effective_idx`

**Origens:**
- `stock_in` — `InventoryService::record()` em movimento `in` com `cost_price > 0`
- `product_update` — `ProductService::create/update()` quando `cost_price` ou `supplier_id` mudou
- `quote` — `POST /products/{id}/cost-history` (cotação manual, requer `products.quote`)

Todas as escritas passam pelo `ProductCostHistoryService` (camada Deptrac dedicada). Nenhum outro service instancia `ProductCostHistory` diretamente.
