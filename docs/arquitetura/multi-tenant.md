# Multi-tenant

## O modelo: estabelecimento como tenant

O sistema é um **SaaS multi-tenant**. Cada **estabelecimento** (loja, restaurante, adega) é um tenant — seus dados são isolados dos outros, mesmo compartilhando o mesmo banco de dados.

```
┌─────────────────────────────────────────────────────┐
│                  Banco de dados                      │
│                                                      │
│  establishments                                      │
│  ┌──────────────────────────────────────┐          │
│  │ Adega do João  │ Restaurante Maria   │  ...     │
│  └──────────────────────────────────────┘          │
│                                                      │
│  customers, orders, products, stock_movements...    │
│  ┌──────────────────────────────────────┐          │
│  │ establishment_id = adega-uuid        │          │
│  │ establishment_id = adega-uuid        │          │
│  │ establishment_id = restaurante-uuid  │          │
│  │ ...                                  │          │
│  └──────────────────────────────────────┘          │
└─────────────────────────────────────────────────────┘
```

## Por que tabelas compartilhadas com `establishment_id`

Existem três modelos clássicos de multi-tenant:

| Modelo | Isolamento | Custo | Quando faz sentido |
|---|---|---|---|
| **Database per tenant** | Alto | Alto (1 DB por cliente) | Compliance estrita, dados muito grandes |
| **Schema per tenant** | Médio | Médio | Compromisso entre isolamento e custo |
| **Shared tables com `tenant_id`** | Baixo (por código) | Baixo | SaaS escalável, dados de tamanho normal |

O ERP Comercial usa **shared tables**. É o modelo mais simples, mais barato e mais fácil de operar — desde que o isolamento por código seja **rigoroso**.

## Tabela `establishments`

```sql
establishments
  id            UUID PK
  name          VARCHAR        -- "Adega do João"
  trade_name    VARCHAR        -- "Adega"
  document      VARCHAR(20)    -- CNPJ
  email         VARCHAR
  phone         VARCHAR(20)
  address       VARCHAR
  city          VARCHAR
  state         VARCHAR(2)
  zip_code      VARCHAR(10)
  is_active     BOOLEAN
  created_at    TIMESTAMP
  updated_at    TIMESTAMP
  deleted_at    TIMESTAMP NULL
```

## Quais tabelas têm `establishment_id`

Todas as tabelas de domínio. Configurações globais (roles, permissions) ficam de fora.

| Tabela | Tem `establishment_id` | Observação |
|---|---|---|
| `establishments` | — | É a raiz |
| `users` | ✓ | Cada usuário pertence a um estabelecimento |
| `customers` | ✓ | |
| `suppliers` | ✓ | |
| `categories` | ✓ | Cada estabelecimento tem suas próprias |
| `products` | ✓ | Catálogo é por estabelecimento (não global) |
| `stock_movements` | ✓ | |
| `orders` | ✓ | |
| `order_items` | (via order) | Implícito pelo `order_id` |
| `financial_transactions` | ✓ | |
| `roles`, `permissions` | ✗ | Configuração global do sistema |
| `sync_log` | ✓ | Cada tenant tem seu cursor de sync |

## Isolamento por código: Global Scopes

Todo modelo de domínio deve aplicar **automaticamente** um filtro pelo `establishment_id` do usuário autenticado. Isso garante que código de aplicação **nunca** vaze dados entre tenants por engano.

```php
// app/Models/Concerns/BelongsToEstablishment.php
trait BelongsToEstablishment
{
    protected static function bootBelongsToEstablishment(): void
    {
        static::addGlobalScope('establishment', function (Builder $builder) {
            if ($establishmentId = auth()->user()?->establishment_id) {
                $builder->where('establishment_id', $establishmentId);
            }
        });

        static::creating(function ($model) {
            if (!$model->establishment_id && $establishmentId = auth()->user()?->establishment_id) {
                $model->establishment_id = $establishmentId;
            }
        });
    }
}
```

Cada model de domínio usa o trait:

```php
class Customer extends Model
{
    use HasUuids, SoftDeletes, BelongsToEstablishment;
}
```

Resultado: `Customer::all()` retorna **só** os clientes do estabelecimento do usuário logado. `Customer::create([...])` preenche automaticamente o `establishment_id`.

> **Atenção:** o trait é uma rede de segurança — não substitui authorization policies. Permissões Spatie continuam aplicáveis para controlar **quem dentro do estabelecimento** pode fazer o quê.

## Usuários e estabelecimentos

Versão simples (Fase 1):

- **Cada usuário pertence a um único estabelecimento** (`users.establishment_id`)
- O admin do SaaS (nós) tem um estabelecimento próprio, "Inovabi", para operar

Versão futura (se necessário):

- Tabela pivot `establishment_user` para suportar usuários com acesso a múltiplos estabelecimentos
- Coluna `current_establishment_id` na sessão para o usuário escolher em qual está operando

A Fase 1 vai com o modelo simples. Migrar depois é trivial.

## Estabelecimento padrão (Fase 1)

Enquanto não temos onboarding de novos tenants, o seeder cria um estabelecimento padrão e atribui o admin a ele:

```php
$establishment = Establishment::firstOrCreate(
    ['document' => '00000000000000'],
    ['name' => 'Inovabi', 'is_active' => true]
);

$admin = User::firstOrCreate(
    ['email' => 'admin@inovabi.com'],
    ['name' => 'Admin', 'password' => 'password', 'is_active' => true, 'establishment_id' => $establishment->id]
);
```

## Mudando de estabelecimento (futuro)

Quando o sistema for SaaS de verdade, o cadastro de um novo estabelecimento será o ponto de entrada — não a criação de usuários. Cada estabelecimento terá seu próprio subdomínio (ex: `adega-joao.inovabi.com`) ou URL com slug.

Por enquanto, isso não é necessário — só nós usamos o sistema.
