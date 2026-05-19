# Identificadores (IDs)

## Decisão: UUID v7 em todas as tabelas

Toda chave primária do sistema é um **UUID v7**, não um `bigint` auto-increment.

## Por que UUID em vez de auto-increment

O problema do auto-increment surge quando **dois servidores independentes** geram registros sem se coordenar. Isso vai acontecer assim que o primeiro servidor local entrar em operação (Fase 2):

```
Servidor central:    INSERT orders ... → id = 1500
Servidor local A:    INSERT orders ... → id = 1500   ← MESMO ID
Servidor local B:    INSERT orders ... → id = 1500   ← MESMO ID

sync → conflito catastrófico
```

Com UUID, isso nunca acontece — cada inserção gera um identificador único globalmente, sem coordenação:

```
Servidor central:    INSERT orders ... → 01928c44-7d3e-7a91-...
Servidor local A:    INSERT orders ... → 01928c45-2f1b-7c08-...
Servidor local B:    INSERT orders ... → 01928c45-9e7f-7d22-...

sync → merge trivial, sem conflitos
```

## Por que v7 especificamente (e não v4)

UUID v4 é puramente aleatório. Bom para unicidade, ruim para performance — em índices B-tree (MySQL), inserts em ordem aleatória causam fragmentação e degradam writes ao longo do tempo.

UUID v7 inclui um **timestamp Unix em milissegundos** nos primeiros bits. Resultado:

- Sequencial no tempo, igual auto-increment
- Performance de índice quase igual ao `bigint`
- Mantém unicidade global

```
UUID v7: 01928c44-7d3e-7a91-be6f-c8c43b1f0e3a
         └────┬────┘└──────────┬──────────┘
        timestamp           aleatório
```

A maioria dos clientes (Laravel, JavaScript, etc.) gera v4 por padrão — mas existe biblioteca para v7 em todas as linguagens relevantes.

## Implementação no Laravel

### Migrations

Toda PK e FK passam a ser UUID:

```php
// Antes
$table->id();
$table->foreignId('customer_id')->constrained();

// Depois
$table->uuid('id')->primary();
$table->foreignUuid('customer_id')->constrained();
```

Para relações polimórficas (Sanctum, Spatie):

```php
// Antes
$table->morphs('tokenable');

// Depois
$table->uuidMorphs('tokenable');
```

### Models

Usar a trait `HasUuids` do Laravel:

```php
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Customer extends Model
{
    use HasUuids, SoftDeletes;

    // Gera UUID v7 (sortable) em vez de v4
    public function newUniqueId(): string
    {
        return (string) Str::uuid7();
    }

    // Indica que UUID7 é ordenável para o sistema usar como cursor
    public function uniqueIds(): array
    {
        return ['id'];
    }
}
```

> O Laravel 11+ tem `Str::uuid7()` nativo. Em versões anteriores, era preciso usar `Symfony\Component\Uid\Uuid::v7()`.

### Route Model Binding

UUIDs funcionam normalmente como route parameters — Laravel detecta automaticamente:

```php
Route::apiResource('customers', CustomerController::class);
// GET /api/customers/01928c44-7d3e-7a91-be6f-c8c43b1f0e3a → funciona
```

## Implicações no frontend

### Tipos TypeScript

Todo `id` que era `number` passa a ser `string`:

```typescript
// Antes
interface Customer {
  id: number
  ...
}

// Depois
interface Customer {
  id: string
  ...
}
```

### URLs

Em vez de `/customers/42/edit`, fica `/customers/01928c44-7d3e-7a91-be6f-c8c43b1f0e3a/edit`. URLs ficam mais longas, mas:

- Não revelam contagem total do sistema (`/customers/42` indicava que existem ~42 clientes)
- Não são adivinháveis por força bruta
- Não conflitam entre tenants

## Custo / benefício

| Aspecto | Custo do UUID v7 vs bigint |
|---|---|
| Storage por linha | +20 bytes (16 vs 8) |
| Velocidade de insert | praticamente igual (v7 é sequencial) |
| Velocidade de select por PK | ~5% mais lento |
| Tamanho do índice | ~2x |
| Permite sync distribuído | ✓ Habilita Fase 2/3 |
| Não vaza contagem | ✓ Segurança |

O custo é desprezível. A capacidade que ele habilita (Fase 2 inteira) compensa em ordens de magnitude.

## Migrações futuras de dados antigos

Não temos esse problema agora — o sistema está em fase inicial, com dados de teste apenas. A migração para UUID acontece via `migrate:fresh` no ambiente dev. Quando o sistema entrar em produção com dados reais, ele já vai estar com UUIDs.
