# Visão geral

## O problema

ERPs comerciais com PDV (ponto de venda) **não podem parar** quando a internet cai. Um estabelecimento que fica meia hora sem vender perde receita real, e a confiança no sistema desaba.

Mas centralizar tudo em um servidor cloud é o modelo mais simples, mais barato e mais fácil de manter. A solução é evoluir gradualmente — começar centralizado e migrar para hub-and-spoke conforme a operação cresce.

## O modelo: hub-and-spoke

```
                    ┌──────────────────────┐
                    │  Servidor Central    │
                    │  (cloud, inovabi)    │
                    │                       │
                    │  - Catálogo global    │
                    │  - Configuração       │
                    │  - Usuários           │
                    │  - Relatórios         │
                    └──────────┬───────────┘
                               │
                          sync bidirecional
                               │
              ┌────────────────┼────────────────┐
              │                │                │
        ┌─────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐
        │ Servidor  │    │ Servidor  │    │ Servidor  │
        │  Local A  │    │  Local B  │    │  Local C  │
        │ (Loja 1)  │    │ (Loja 2)  │    │ (Loja 3)  │
        └─────┬─────┘    └─────┬─────┘    └─────┬─────┘
              │                │                │
              ▼                ▼                ▼
          PDV app          PDV app          PDV app
          (LAN)            (LAN)            (LAN)
```

O **servidor central** é a "sede". O **servidor local** roda dentro do estabelecimento (mini PC ou Raspberry Pi). O **PDV** é uma aplicação (web, desktop ou mobile) que conecta no servidor local via rede LAN.

Internet cai? O estabelecimento continua operando contra o servidor local. Quando volta, os dois servidores reconciliam.

## Três fases de evolução

### Fase 1 — Web only (agora)

Toda operação acontece contra o servidor central. Sem servidor local, sem PDV nativo. O sistema web é o suficiente para começar a operar e validar o modelo.

- **Quem usa:** estabelecimentos com internet confiável, operações de retaguarda, gestão
- **O que entrega:** CRUD de clientes, produtos, vendas, financeiro; tudo no navegador
- **Limitação:** se a internet cai, ninguém vende

A Fase 1 já tem que ser construída com as **fundações** que vão permitir as Fases 2 e 3 — caso contrário, virar offline-first depois é uma reescrita.

### Fase 2 — Servidor local + sync

Estabelecimentos com volume alto ou internet ruim recebem um **servidor local**. É o mesmo backend Laravel empacotado em Docker, rodando on-premise, com um banco de dados independente.

- **PDV continua sendo web** (ou já evoluiu para nativo) — só muda o endereço do backend
- **Sync** roda em background: o servidor local empurra operações para o central e puxa atualizações de configuração
- **Catálogo, preços, usuários** continuam sendo gerenciados no central — o local recebe via sync
- **Vendas, movimentações de estoque, contas a pagar/receber** nascem no local — o central recebe via sync

### Fase 3 — PDV nativo + dispositivos

PDV vira um aplicativo nativo (React Native ou Flutter). Roda no tablet/celular do caixa, conecta no servidor local via Wi-Fi, e tem seu próprio cache offline para tolerar até a queda do servidor local.

- **Integração com hardware:** impressora fiscal, leitor de código de barras, gaveta
- **UX otimizada para velocidade** — interface simples, sem hierarquia de menus

## Por que essa abordagem

| Alternativa | Por que não |
|---|---|
| Tudo cloud, sem offline | Estabelecimento perde vendas quando internet cai — inaceitável para varejo |
| Tudo on-premise, sem central | Sem visibilidade para gestão de múltiplas lojas, sem updates, sem backup |
| PWA com IndexedDB | Funciona, mas não acessa hardware fiscal e tem limites de storage no browser |
| Cliente local dedicado por máquina | Cada caixa precisa de seu próprio backend — não escala |

A solução **hub-and-spoke** combina o melhor dos dois mundos: gestão centralizada + operação resiliente.

## O que isso significa para o código

A Fase 1 (atual) precisa nascer com **três coisas certas** que são caras de mudar depois:

1. **UUIDs em vez de IDs incrementais** — para que servidores diferentes possam gerar registros sem coordenação
2. **`establishment_id` em todos os recursos** — para isolar dados por tenant
3. **Soft deletes em vez de hard deletes** — para que sync saiba o que foi removido

Esses três são **decisões irreversíveis sem dor**. Tudo o mais (sync engine, observer, API de push/pull) pode vir depois sem refazer o que já existe.

Ver [Roadmap](roadmap.md) para o detalhamento das fases.
