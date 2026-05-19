# Arquitetura

Documentação da arquitetura do ERP Comercial: visão, decisões técnicas e roadmap.

## Documentos

| Documento | Descrição |
|---|---|
| [Visão geral](visao-geral.md) | Modelo hub-and-spoke, três fases de evolução, razões para uma arquitetura offline-first |
| [Multi-tenant](multi-tenant.md) | Isolamento por estabelecimento, escopo global, modelo SaaS |
| [Identificadores](identificadores.md) | Estratégia de UUIDs v7, por que e como |
| [Sincronização](sincronizacao.md) | Protocolo de sync entre servidor central e servidores locais |
| [Roadmap](roadmap.md) | Cronograma das fases, o que está pronto e o que vem a seguir |

## Princípios

1. **Capitalizar primeiro, sofisticar depois** — o sistema web funcional vem antes de qualquer trabalho de offline. A Fase 1 entrega valor imediato.
2. **Decisões irreversíveis primeiro** — IDs e multi-tenant precisam ser corretos desde o início; o resto pode ser incremental.
3. **Cada estabelecimento é dono dos dados que gera** — o servidor central é fonte da verdade para configuração; o servidor local é fonte da verdade para operação.
4. **Sync é assíncrono e tolerante a falhas** — operações locais nunca dependem do servidor central estar online.
