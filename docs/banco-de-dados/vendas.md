# Vendas

## orders

Cabeçalho da venda. Pode ser vinculado a um cliente cadastrado ou ser uma venda de balcão (`customer_id: null`).

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | BIGINT PK | — |
| `order_number` | VARCHAR UNIQUE | Número legível (ex: `ORD-000001`) |
| `customer_id` | BIGINT FK nullable | Cliente (null = balcão) |
| `user_id` | BIGINT FK | Operador que registrou a venda |
| `subtotal_amount` | DECIMAL(10,2) | Soma dos itens sem desconto |
| `discount_amount` | DECIMAL(10,2) | Valor do desconto aplicado |
| `discount_type` | ENUM | `fixed` (R$) ou `percentage` (%) |
| `total_amount` | DECIMAL(10,2) | Valor final (`subtotal - desconto`) |
| `status` | ENUM | `pending`, `paid`, `canceled` |
| `payment_method` | ENUM nullable | `credit_card`, `debit_card`, `pix`, `cash`, `bank_transfer`, `other` |
| `paid_at` | TIMESTAMP nullable | Data/hora do pagamento |
| `notes` | TEXT nullable | Observações do operador |
| `created_at` / `updated_at` | TIMESTAMP | — |
| `deleted_at` | TIMESTAMP nullable | Soft delete |

**Índices:** `status`, `customer_id`, `user_id`, `created_at`

**Fluxo de status:**
```
pending → paid     (pagamento confirmado)
pending → canceled (venda cancelada)
```

> Ao cancelar (`canceled`), os `stock_movements` de saída devem ser revertidos com movimentos de entrada.

---

## order_items

Itens de cada venda. Os preços são **congelados no momento da venda** — não dependem dos valores atuais do produto.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | BIGINT PK | — |
| `order_id` | BIGINT FK | Venda pai |
| `product_id` | BIGINT FK | Produto vendido |
| `quantity` | INT | Quantidade |
| `unit_price` | DECIMAL(10,2) | Preço de venda unitário no momento da venda |
| `cost_price` | DECIMAL(10,2) | Preço de custo unitário no momento da venda |
| `discount_amount` | DECIMAL(10,2) | Desconto no item (R$) |
| `total_price` | DECIMAL(10,2) | `(unit_price × quantity) - discount_amount` |
| `notes` | TEXT nullable | Observações do item |
| `created_at` / `updated_at` | TIMESTAMP | — |

**Índices:** `order_id`, `product_id`

> **Margem do item:** `(unit_price - cost_price) × quantity` — calculada a qualquer momento pois ambos os preços estão registrados.
