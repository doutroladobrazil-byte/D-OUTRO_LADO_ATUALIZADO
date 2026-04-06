# Arquitetura D’OUTRO LADO

## Visão macro

O ecossistema foi dividido em três camadas:

1. **Experiência pública multi-brand**
   - um frontend único com dois universos visuais distintos
   - identidade da marca controlada por tema (`casa` e `moda`)
   - páginas públicas, conta do cliente, fluxo de compra e kit builder

2. **Camada operacional**
   - painel administrativo central
   - gestão de catálogo, pedidos, estoque, frete, fiscal e conteúdo

3. **Camada de serviços**
   - backend Express modular
   - PostgreSQL via Supabase
   - Supabase Auth
   - Stripe
   - integrações futuras (NFe, gateways logísticos, CRM, ERP)

## Estratégia multi-brand

Em vez de manter dois projetos isolados, a arquitetura usa:
- um **núcleo compartilhado** de autenticação, dados, checkout, frete, pedidos e admin
- uma **camada visual e editorial específica por brand**

Isso reduz duplicação de código e mantém consistência operacional.

## Domínios principais

- `catalog`
- `pricing`
- `wholesale`
- `freight`
- `checkout`
- `orders`
- `fiscal`
- `gift-kits`
- `content`
- `accounts`
- `admin`
- `recommendations`

## Regras críticas

- todos os produtos devem ter faixa de peso obrigatória
- atacado é controlado por regra de perfil e thresholds, não por fluxo manual rígido
- fiscal existe como camada desde a origem do pedido
- o frete é calculado por região + weight range + composição do carrinho
- conteúdo de campanha e slider é administrável

## Escala futura

Para evolução real de produção, recomenda-se:
- filas para webhooks e faturamento
- cache distribuído
- busca indexada
- recomendação por eventos comportamentais
- monitoramento com tracing e alertas
- storage com transformação de imagens
