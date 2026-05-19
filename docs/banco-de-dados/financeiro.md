# Financeiro

## financial_transactions

Registro unificado de receitas e despesas. Cobre tanto contas a receber (vendas) quanto contas a pagar (fornecedores, despesas operacionais).

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | BIGINT PK | — |
| `order_id` | BIGINT FK nullable | Venda de origem (se for receita de venda) |
| `user_id` | BIGINT FK nullable | Usuário que registrou |
| `supplier_id` | BIGINT FK nullable | Fornecedor (se for despesa de compra) |
| `customer_id` | BIGINT FK nullable | Cliente (se for receita de venda) |
| `type` | ENUM | `income` (receita) ou `expense` (despesa) |
| `category` | VARCHAR nullable | Categoria da transação (ver tabela abaixo) |
| `description` | VARCHAR | Ex: `Venda #ORD-000012`, `Conta de energia` |
| `amount` | DECIMAL(10,2) | Valor da transação |
| `payment_method` | ENUM nullable | `credit_card`, `debit_card`, `pix`, `cash`, `bank_transfer`, `other` |
| `due_date` | DATE | Data de vencimento |
| `payment_date` | DATE nullable | Data do pagamento efetivo |
| `status` | ENUM | `pending`, `paid`, `overdue`, `canceled` |
| `installment_number` | SMALLINT nullable | Parcela atual (ex: `2`) |
| `installment_count` | SMALLINT nullable | Total de parcelas (ex: `3`) |
| `notes` | TEXT nullable | Observações internas |
| `created_at` / `updated_at` | TIMESTAMP | — |
| `deleted_at` | TIMESTAMP nullable | Soft delete |

**Índices:** `type`, `status`, `due_date`, `(type, status)`

---

### Categorias sugeridas

| Tipo | Categoria | Descrição |
|---|---|---|
| `income` | `sales` | Receita de vendas |
| `income` | `other_income` | Outras receitas |
| `expense` | `suppliers` | Pagamento a fornecedores |
| `expense` | `utilities` | Água, luz, internet |
| `expense` | `rent` | Aluguel |
| `expense` | `payroll` | Folha de pagamento |
| `expense` | `logistics` | Frete e transporte |
| `expense` | `marketing` | Publicidade |
| `expense` | `other_expense` | Outras despesas |

---

### Parcelamento

Uma venda parcelada em 3x gera 3 registros vinculados ao mesmo `order_id`:

| `installment_number` | `installment_count` | `due_date` | `status` |
|---|---|---|---|
| 1 | 3 | 2026-06-01 | paid |
| 2 | 3 | 2026-07-01 | pending |
| 3 | 3 | 2026-08-01 | pending |

---

### Fluxo de status

```
pending → paid     (baixa manual ou automática via integração)
pending → overdue  (job agendado que verifica due_date < hoje)
pending → canceled
```

> O status `overdue` deve ser atualizado por um job/command agendado que verifica diariamente `due_date < today AND status = pending`.
