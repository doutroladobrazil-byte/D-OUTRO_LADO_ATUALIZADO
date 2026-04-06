# D’OUTRO LADO

Projeto monorepo para operação premium de exportação internacional de produtos brasileiros, com dois sites distintos, painel administrativo central, backend modular, motor de frete, base fiscal, autenticação multicamada e fluxo de compra completo.

## Estrutura

- `frontend/` — Next.js App Router + TypeScript + design system premium
- `backend/` — Node.js + Express + Supabase/PostgreSQL + Stripe/webhooks
- `docs/` — arquitetura, escopo e observações de produção

## Conceito do produto

### Site A — Casa, Decoração, Cerâmica, Cozinha, Enxoval, Arte

Linguagem visual mais leve, editorial, silenciosa e autoral.

### Site B — Moda, Couro, Bolsas, Acessórios, Calçados, Vestuário

Linguagem visual mais contrastada, fashion, densa e contemporânea.

## Features incluídas nesta fundação avançada

### Frontend
- App Router com rotas públicas e admin
- Home raiz de entrada para os dois universos
- Navbar premium com idioma, moeda, busca, favoritos, conta e carrinho
- Brand pages distintas para `casa` e `moda`
- Home de marca com hero, campanha, categorias, best sellers, lançamentos, kits de presente, manifesto, diferenciais e newsletter
- Páginas de categoria, produto, favoritos, carrinho, checkout, login, conta, atacado, envio internacional, contato e montar kit
- Admin central com dashboard, produtos, pedidos, clientes, estoque, frete, fiscal, conteúdo, analytics e configurações
- Camada de dados mock pronta para troca por Supabase/API
- Tokens de design consistentes para os dois sites

### Backend
- Express modular em TypeScript
- Rotas para produtos, pedidos, frete, Stripe, fiscal, admin, usuários e conteúdo
- Middleware de autenticação e autorização por papel
- Services separados por domínio
- Validação com Zod
- Estrutura para webhook Stripe
- Logs e respostas padronizadas
- Base preparada para integração com Supabase Auth

### Banco / Supabase
- Schema SQL com perfis, produtos, categorias, subcategorias, imagens, favoritos, carrinho, pedidos, itens, frete, fiscal, conteúdo, kits de presente, moedas, idiomas e logs administrativos

## O que já está preparado
- perfis: customer, wholesale, admin
- atacado dinâmico por regra de negócio
- cálculo de frete por faixa de peso e região
- checkout premium com resumo e segurança
- camada fiscal inicial por pedido
- estrutura para recomendações
- múltiplas moedas e idiomas na modelagem

## O que ainda precisa ser conectado para produção real
- chaves reais do Supabase
- providers reais Google/Apple no Auth
- persistência real de carrinho/favoritos/kits
- upload de imagens para bucket
- Stripe em ambiente real com webhook ativo
- integrações fiscais/logísticas externas
- observabilidade, filas e jobs de produção

## Como rodar

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

### Banco
1. Criar projeto no Supabase
2. Executar `backend/supabase/schema.sql`
3. Preencher `.env` do frontend e backend

## Observação importante

Este pacote foi montado como **fundação premium avançada e coerente** para o projeto D’OUTRO LADO. Ele já está muito acima de um template simples, mas ainda depende da conexão com seus serviços reais para ser considerado produção final completa.
