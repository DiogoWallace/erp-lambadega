# Módulo de Auditoria

Rastreabilidade completa de quem fez o quê, quando e de onde — sem depender de `git log` ou de memória humana.

---

## O que será rastreado

| Categoria | Exemplos |
|---|---|
| **Mutações em entidades** | criação, edição, exclusão (soft delete) de clientes, produtos, pedidos, estoque, financeiro |
| **Autenticação** | login, logout, falha de login, troca de senha |
| **Acesso a módulos sensíveis** | relatórios, exportações, painel financeiro |
| **Ações administrativas** | criar/editar/desativar usuários, alterar permissões (roles) |

---

## Estrutura da tabela `audit_logs`

```sql
CREATE TABLE audit_logs (
    id              CHAR(36)     NOT NULL PRIMARY KEY,   -- UUID v7
    establishment_id CHAR(36)   NOT NULL,
    user_id         CHAR(36)     NULL,                   -- NULL = sistema/automação
    event           VARCHAR(30)  NOT NULL,               -- created | updated | deleted | login | logout | accessed
    module          VARCHAR(60)  NOT NULL,               -- customers | products | orders | auth | reports ...
    model_type      VARCHAR(100) NULL,                   -- App\Models\Customer (para mutações)
    model_id        CHAR(36)     NULL,
    old_values      JSON         NULL,                   -- só nos updates e deletes
    new_values      JSON         NULL,                   -- só nos creates e updates
    ip_address      VARCHAR(45)  NULL,
    user_agent      TEXT         NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_establishment (establishment_id),
    INDEX idx_user (user_id),
    INDEX idx_event_module (event, module),
    INDEX idx_model (model_type, model_id),
    INDEX idx_created_at (created_at)
);
```

> A tabela é **imutável** — sem `updated_at`, sem soft delete, sem edição de registros. Logs não se editam.

---

## Implementação planejada

### 1. Trait `LogsActivity` nos Models

Adicionar nos models que precisam de rastreio. Usa observers internamente para capturar `created`, `updated`, `deleted`.

```php
// Uso nos models
class Customer extends Model
{
    use BelongsToEstablishment, LogsActivity;

    protected static string $auditModule = 'customers';
    // Campos a excluir do diff (evitar poluição de log)
    protected static array $auditExclude = ['updated_at'];
}
```

O trait registra automaticamente `old_values` (antes da mudança) e `new_values` (depois), calculando apenas o diff de campos alterados no `updated` — não grava o objeto inteiro.

### 2. Facade `Audit::log()` para eventos manuais

Para eventos que não são mutações de model (acesso a módulo, login, export):

```php
Audit::log(
    event: 'accessed',
    module: 'reports',
    context: ['report' => 'financial_summary', 'period' => '2026-05']
);
```

### 3. Middleware `AuditModuleAccess`

Registra acesso a rotas marcadas como sensíveis via atributo de rota:

```php
Route::get('/relatorios/financeiro', [ReportController::class, 'financial'])
    ->middleware('audit:reports');
```

---

## Campos `old_values` / `new_values` — formato

Apenas os campos que mudaram são gravados (diff, não snapshot completo):

```json
// UPDATE em Customer: só o telefone mudou
{ "old_values": { "phone": "11999990000" },
  "new_values": { "phone": "11988887777" } }

// CREATE: old_values = null, new_values = objeto criado
// DELETE (soft): new_values = null, old_values = { "deleted_at": "2026-05-20T..." }
```

Campos sensíveis (`password`, tokens) são sempre excluídos.

---

## Retenção de dados

| Ambiente | Retenção |
|---|---|
| Produção | 12 meses (default) — configurável via `.env AUDIT_RETENTION_DAYS` |
| Dev/local | Sem retenção automática |

Limpeza via `php artisan audit:prune` agendado no `app/Console/Kernel.php`.

---

## O que NÃO será logado

- Leituras simples (GET list, GET show) de entidades não-sensíveis — gera volume sem valor
- Campos de controle interno (`remember_token`, `updated_at`, `created_at` puro)
- Sincronizações automáticas do `SyncObserver` (terão rastreio próprio no `sync_log`)

---

## Relação com `sync_log`

| Tabela | Propósito |
|---|---|
| `audit_logs` | Quem fez o quê — auditoria de usuário |
| `sync_log` | O que mudou e quando — sincronização entre servidores |

São complementares. Um mesmo evento (ex: "admin editou produto") gera uma entrada em `audit_logs` (quem) e, via `SyncObserver` na Fase 2, uma entrada em `sync_log` (o que precisa propagar).

---

## Próximos passos para implementação

1. [ ] Migration `create_audit_logs_table`
2. [ ] Model `AuditLog` (sem mutação — apenas create/read)
3. [ ] Trait `LogsActivity` com observer interno e cálculo de diff
4. [ ] Facade `Audit` + `AuditServiceProvider`
5. [ ] Middleware `AuditModuleAccess`
6. [ ] Seeder de teste + testes feature (verificar que log é criado ao criar/editar/deletar)
7. [ ] Tela de auditoria no frontend (filtro por usuário, módulo, período)
