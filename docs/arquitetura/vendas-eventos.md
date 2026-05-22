# Vendas — arquitetura orientada a eventos

> Decisões da refatoração que desacoplou o módulo de Vendas para escalar. Aplica-se ao backend Laravel.

## Problema

O `OrderService` original fazia tudo inline: criava o pedido, validava e baixava estoque, criava o `StockMovement`, e no pagamento criava as `FinancialTransaction`s. Cada novo efeito de uma venda (e-mail, NF-e, fidelidade) engordaria esse service e acoplaria contextos que deveriam ser independentes.

A meta foi obter ~90% dos benefícios de DDD (isolamento de contexto, manutenção) **mantendo a estrutura em camadas (Layered)** já existente, sem reconfigurar o Laravel inteiro.

## Decisões

### 1. DTOs tipados na camada de serviço

Controllers convertem o request validado em DTOs `readonly` (`app/DataTransferObjects/`) antes de chamar o service. O service nunca recebe array solto nem o `Request`.

```php
// OrderController
$order = $this->service->create(CreateOrderDTO::fromArray($request->validated()));
```

- `CreateOrderDTO`, `OrderItemDTO`, `PayOrderDTO` — imutáveis, tipados, com factory `fromArray()`.
- Ganho: integridade garantida na fronteira do service, autocomplete, testabilidade sem mocks.

### 2. Eventos de domínio + listeners

O `OrderService` só orquestra o **estado do pedido** e despacha eventos. Os efeitos colaterais reagem isoladamente.

| Evento (`app/Events/`) | Quando | Listener (`app/Listeners/`) |
|---|---|---|
| `OrderCreated` | pedido criado (após estoque) | — (seam para futuro: recibo, fidelidade) |
| `OrderPaid` | pedido pago | `GenerateFinancialTransactions` (gera contas a receber) |
| `OrderCancelled` | pedido cancelado | `CancelOrderFinancials` (cancela receivables pendentes) |

- Listeners são **auto-descobertos** pelo Laravel (type-hint do `handle()`). Não registrar manualmente no `AppServiceProvider` — duplica a execução.
- Eventos são despachados **dentro da transação** do service. Com listeners síncronos, isso preserva a atomicidade (pedido pago e suas transações financeiras commitam juntos).

#### Por que listeners síncronos (e não em fila)

A intenção de longo prazo é rodar efeitos não-bloqueantes em fila. **Hoje isso não é seguro:** o global scope multi-tenant (`BelongsToEstablishment`) resolve o `establishment_id` via `auth()->user()`. Um job de fila não tem usuário autenticado → o scope não filtra (vaza dados entre tenants) e o hook `creating` não preenche `establishment_id`.

**Pré-requisito para filas:** propagar o contexto de tenant para dentro dos jobs (ex.: refatorar o scope para ler um tenant resolvido do container, não só do `auth()`), adicionar um worker e só então marcar listeners não-bloqueantes como `ShouldQueue`. Os listeners de financeiro já setam `establishment_id` explícito a partir do `$order` (meio caminho andado).

> **Estoque é sempre síncrono e transacional.** A baixa de estoque fica dentro da transação do `create()` com `lockForUpdate`, nunca em listener/fila — caso contrário dois pedidos simultâneos poderiam vender o mesmo último item (oversell).

### 3. Fronteiras rígidas (InventoryService + Deptrac)

- **`InventoryService`** (renomeado de `StockMovementService`) é o **dono único** das escritas de estoque: toda alteração de `Product.stock_quantity` e toda criação de `StockMovement` passa por ele. O `OrderService` chama `decreaseForOrder()` / `restoreForOrder()` — nunca instancia `StockMovement`.
- **Escrever `FinancialTransaction`** é exclusivo do `FinancialTransactionService` (dono do contexto financeiro). Os listeners de venda **delegam** a ele (`recordForOrder`/`cancelForOrder`), em vez de criar a transação direto — mesmo padrão do `InventoryService`.
- **Deptrac** (`backend/deptrac.yaml`) trava essas fronteiras no CI. A regra central: a camada `Services` pode **chamar** o `InventoryService`, mas **não pode tocar** nos models `StockMovement` / `FinancialTransaction`. Uma violação **falha o build**.

```
Controllers      → Services / InventoryService / FinancialService / Requests / Resources / DTOs / Models
Services         → Models / DTOs / Events / InventoryService    (NÃO StockMovement/FinancialTransaction)
Listeners        → Events / FinancialService
InventoryService → StockMovement / Models
FinancialService → FinancialTransaction / Models
```

`AuditService` é uma camada cross-cutting (a trait `LogsActivity` propaga a dependência para todo model).

## Estado

Implementado em 2026-05 (branch `dev`). Suíte: 118 testes de feature backend + 21 unit frontend. Filas/worker ainda não implementados (ver pré-requisito acima).
