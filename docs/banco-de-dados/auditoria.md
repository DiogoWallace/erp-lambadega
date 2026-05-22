# Auditoria

## audit_logs

Log imutável de ações dos usuários. Registra mutações em entidades de domínio e eventos de autenticação.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID v7 PK | — |
| `establishment_id` | UUID FK NOT NULL | Tenant do log |
| `user_id` | UUID FK nullable | Usuário que executou a ação (NULL = sistema/automação) |
| `event` | VARCHAR(30) | `created` · `updated` · `deleted` · `login` · `logout` |
| `module` | VARCHAR(60) | `customers` · `suppliers` · `categories` · `products` · `stock` · `auth` |
| `model_type` | VARCHAR(100) nullable | Classe completa do model (ex: `App\Models\Customer`); NULL para eventos de auth |
| `model_id` | VARCHAR(36) nullable | UUID do registro afetado; NULL para eventos de auth |
| `old_values` | JSON nullable | Campos antes da mudança (só `updated` e `deleted`) |
| `new_values` | JSON nullable | Campos depois da mudança (só `created` e `updated`) |
| `ip_address` | VARCHAR(45) nullable | IPv4 ou IPv6 |
| `user_agent` | TEXT nullable | User-Agent HTTP |
| `created_at` | TIMESTAMP | Auto-preenchido; **sem `updated_at`** |

**Índices:** `establishment_id`, `user_id`, `(event, module)`, `(model_type, model_id)`, `created_at`

> A tabela é **imutável** — sem `updated_at`, sem soft delete, sem edição de registros. Logs não se editam.

---

## Formato dos valores auditados

Apenas os campos que mudaram são gravados — diff, não snapshot completo. Campos excluídos por padrão: `id`, `establishment_id`, `updated_at`, `created_at`, `deleted_at`, `remember_token`.

```json
// CREATE: old_values = null
{ "new_values": { "name": "Adega São Paulo", "is_active": true } }

// UPDATE: só os campos que mudaram
{ "old_values": { "phone": "11999990000" },
  "new_values": { "phone": "11988887777" } }

// DELETE (soft): old_values = marca de deleção
{ "old_values": { "deleted_at": "2026-05-21T14:30:00+00:00" } }

// LOGIN / LOGOUT: sem old_values nem new_values
```

---

## Implementação

| Componente | Arquivo |
|---|---|
| Model | `app/Models/AuditLog.php` |
| Trait (observers automáticos) | `app/Models/Concerns/LogsActivity.php` |
| Service (singleton) | `app/Services/AuditService.php` |
| Controller (index, show) | `app/Http/Controllers/Api/AuditLogController.php` |
| Resource | `app/Http/Resources/AuditLogResource.php` |
| Policy (audit.view — admin only) | `app/Policies/AuditLogPolicy.php` |

**Models com `LogsActivity`:** `Customer`, `Supplier`, `Category`, `Product`, `StockMovement`

**Eventos manuais registrados:** login e logout em `AuthController`
