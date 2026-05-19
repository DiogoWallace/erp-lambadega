# Clientes e Fornecedores

## customers

Pessoas físicas (CPF) ou jurídicas (CNPJ) que realizam compras.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | BIGINT PK | — |
| `type` | ENUM | `individual` (PF) ou `company` (PJ) |
| `name` | VARCHAR | Nome / Razão social |
| `trade_name` | VARCHAR nullable | Nome fantasia |
| `document` | VARCHAR(20) UNIQUE nullable | CPF ou CNPJ (sem máscara) |
| `email` | VARCHAR nullable | — |
| `phone` | VARCHAR(20) nullable | — |
| `address` | VARCHAR nullable | Logradouro |
| `address_number` | VARCHAR(20) nullable | Número |
| `address_complement` | VARCHAR nullable | Complemento |
| `neighborhood` | VARCHAR nullable | Bairro |
| `city` | VARCHAR nullable | Cidade |
| `state` | VARCHAR(2) nullable | UF |
| `zip_code` | VARCHAR(10) nullable | CEP (sem máscara) |
| `notes` | TEXT nullable | Observações internas |
| `is_active` | BOOLEAN default true | — |
| `created_at` / `updated_at` | TIMESTAMP | — |
| `deleted_at` | TIMESTAMP nullable | Soft delete |

**Índices:** `type`, `is_active`, `city`, `document` (unique)

**Relacionamentos:**
- `orders` — um cliente pode ter muitos pedidos
- `financial_transactions` — contas a receber vinculadas ao cliente

---

## suppliers

Fornecedores de produtos. Sempre pessoa jurídica (CNPJ).

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | BIGINT PK | — |
| `company_name` | VARCHAR | Razão social |
| `trade_name` | VARCHAR nullable | Nome fantasia |
| `cnpj` | VARCHAR(20) UNIQUE nullable | CNPJ (sem máscara) |
| `contact_name` | VARCHAR nullable | Nome do contato comercial |
| `email` | VARCHAR nullable | — |
| `phone` | VARCHAR(20) nullable | — |
| `website` | VARCHAR nullable | — |
| `address` | VARCHAR nullable | — |
| `city` | VARCHAR nullable | — |
| `state` | VARCHAR(2) nullable | UF |
| `zip_code` | VARCHAR(10) nullable | CEP |
| `notes` | TEXT nullable | Observações internas |
| `is_active` | BOOLEAN default true | — |
| `created_at` / `updated_at` | TIMESTAMP | — |
| `deleted_at` | TIMESTAMP nullable | Soft delete |

**Índices:** `is_active`, `cnpj` (unique)

**Relacionamentos:**
- `products` — um fornecedor pode fornecer muitos produtos
- `financial_transactions` — contas a pagar vinculadas ao fornecedor
