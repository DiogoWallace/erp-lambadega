# Sincronização

> **Status:** especificação. A tabela `sync_log` é criada na Fase 1; o engine de sync e os endpoints de API são implementados na Fase 2.

## Princípios

1. **Bidirecional assíncrono** — central e local podem operar independentemente; sync acontece quando há conexão
2. **Por cursor (sequence)** — cada servidor sabe qual foi o último evento que recebeu; só pede o diff
3. **Idempotente** — receber o mesmo evento duas vezes nunca causa problemas
4. **Resolução por entidade** — cada tabela tem sua regra de conflito; não há "regra geral"

## A tabela `sync_log`

Toda escrita relevante no banco gera uma entrada aqui:

```sql
sync_log
  id                UUID PK
  establishment_id  UUID FK         -- tenant escopo
  table_name        VARCHAR         -- 'orders', 'customers', etc.
  record_id         UUID            -- ID do registro afetado
  operation         ENUM            -- insert | update | delete
  payload           JSON            -- snapshot completo do registro
  sequence          BIGINT          -- cursor incremental por (establishment_id, origin)
  origin            ENUM            -- central | local
  origin_server_id  VARCHAR NULL    -- ID do servidor local (para identificar a origem)
  created_at        TIMESTAMP
  applied_at        TIMESTAMP NULL  -- quando foi aplicado no destino

INDEX (establishment_id, origin, sequence)
INDEX (table_name, record_id)
```

`sequence` é o relógio lógico. É **incremental por (establishment_id, origin)** — cada combinação de tenant + servidor de origem tem sua própria sequência. Isso permite que os dois lados saibam exatamente o que já foi sincronizado.

## Como o `sync_log` é populado

Via **Eloquent Observer** — automático, sem boilerplate em controllers:

```php
class SyncObserver
{
    public function created(Model $model)    { $this->log('insert', $model); }
    public function updated(Model $model)    { $this->log('update', $model); }
    public function deleted(Model $model)    { $this->log('delete', $model); }

    private function log(string $op, Model $model): void
    {
        SyncLog::create([
            'establishment_id' => $model->establishment_id,
            'table_name'       => $model->getTable(),
            'record_id'        => $model->getKey(),
            'operation'        => $op,
            'payload'          => $model->toArray(),
            'sequence'         => $this->nextSequence($model->establishment_id),
            'origin'           => config('app.server_origin', 'central'),
        ]);
    }
}
```

Cada model de domínio é observado:

```php
// app/Providers/AppServiceProvider.php
Customer::observe(SyncObserver::class);
Order::observe(SyncObserver::class);
StockMovement::observe(SyncObserver::class);
// ...
```

## Protocolo de sync (Fase 2)

### Local → Central (push)

O servidor local envia suas operações desde o último push:

```http
POST /api/sync/push
Authorization: Bearer <token-do-server-local>

{
  "establishment_id": "01928c44-...",
  "origin_server_id": "loja-adega-001",
  "from_sequence": 1500,
  "events": [
    {
      "table": "orders",
      "id": "01928c45-...",
      "operation": "insert",
      "payload": {...},
      "sequence": 1501,
      "timestamp": "2026-05-19T14:32:01Z"
    },
    {
      "table": "stock_movements",
      ...
    }
  ]
}

→ 200 OK
{
  "accepted": 50,
  "last_applied_sequence": 1550
}
```

### Central → Local (pull)

O servidor local pede atualizações desde o último pull:

```http
GET /api/sync/pull?since=12345
Authorization: Bearer <token-do-server-local>

→ 200 OK
{
  "events": [
    {
      "table": "products",
      "id": "01928c46-...",
      "operation": "update",
      "payload": {...},
      "sequence": 12346,
      "origin": "central"
    }
  ],
  "next_sequence": 12347
}
```

### Frequência

O servidor local executa um job Laravel (`SyncJob`) em loop:

- **Push** a cada 30 segundos (drena o que aconteceu localmente)
- **Pull** a cada 60 segundos (busca atualizações de configuração)

Quando sem internet, o job falha e tenta novamente — não acumula problema porque o cursor é persistente.

## Regras de conflito por entidade

Conflito acontece quando o mesmo registro foi modificado em ambos os lados entre dois syncs. A regra é definida **por tabela**:

| Tabela | Origem que vence | Justificativa |
|---|---|---|
| `establishments` | Central | Dado de configuração gerenciado no SaaS |
| `users` | Central | Gestão de acesso é centralizada |
| `roles` / `permissions` | Central | Configuração global |
| `customers` | Local | Cadastrado no balcão com urgência; central é referência |
| `suppliers` | Central | Cadastro feito pela retaguarda |
| `categories` | Central | Gestão de catálogo é centralizada |
| `products` | Central | Catálogo + preços vêm de cima |
| `orders` | Sem conflito | UUIDs distintos, merge é trivial |
| `order_items` | Via order | Implícito |
| `stock_movements` | Sem conflito | Log imutável, só inserts |
| `financial_transactions` | Origem que criou | Quem criou o registro mantém a versão dele |

### O caso especial: estoque

`stock_movements` nunca tem conflito direto — é um log de inserts. Mas o **saldo** (`products.stock_quantity`) pode ficar negativo quando dois PDVs vendem o último item offline.

**Política:** aceitar estoque negativo e reconciliar. O sistema gera um alerta para o operador, e o gestor decide se rejeita uma das vendas ou compra estoque emergencial.

Alternativas mais restritivas (reservar buffer mínimo offline, bloquear venda) podem ser implementadas como **configuração por estabelecimento** na Fase 3.

## Empacotamento do servidor local

O servidor local é **o mesmo backend Laravel** rodando em Docker, com algumas variáveis de ambiente diferentes:

```env
APP_SERVER_ORIGIN=local
APP_SERVER_ID=loja-adega-001
APP_CENTRAL_URL=https://api.inovabi.com
APP_ESTABLISHMENT_ID=01928c44-...
APP_SYNC_TOKEN=<token-fixo-gerado-no-onboarding>
```

O `docker-compose.local.yml` adiciona:
- O backend (sem o `webserver` central; usa o nginx local na máquina)
- MySQL local
- Um service `sync-worker` rodando `php artisan sync:run --daemon`

Onboarding de um novo estabelecimento:
1. Admin cadastra o estabelecimento no painel central
2. Central gera o `APP_SYNC_TOKEN`
3. Admin baixa um instalador (ou script `setup.sh`) com as variáveis pré-configuradas
4. Roda no servidor da loja, e em minutos está sincronizando

## Idempotência

Toda operação de sync precisa ser **idempotente**: receber a mesma sequência duas vezes não pode duplicar nada.

- **Inserts** usam o UUID gerado na origem; se o registro já existe, é update silencioso (ou pulado)
- **Updates** verificam `updated_at` para evitar sobrescrever versão mais nova
- **Deletes** marcam `deleted_at`; se já está deletado, não faz nada

## Observabilidade

Cada servidor mantém metadata visível no painel:

- **Última sincronização bem-sucedida** (push e pull separadamente)
- **Eventos pendentes na fila local**
- **Status de conexão com central** (verde/amarelo/vermelho)
- **Conflitos detectados** (lista para revisão manual)
