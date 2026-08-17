# Plano de Revisão e Preparação para Produção - Integração PagBank

Este plano detalha as correções cirúrgicas e preparativos necessários para levar a integração PagBank existente no projeto Power Cell para o ambiente de produção com segurança e confiabilidade.

## 1. Configuração de Ambiente e Domínios
Centralização da configuração de ambiente para evitar alterações manuais frequentes.

- **Variável de Ambiente:** Implementar o uso de `PAGBANK_ENVIRONMENT` (sandbox/production) na Edge Function.
- **Domínio de Produção:** O domínio definitivo identificado é `https://powercelll.netlify.app`.
- **URLs de Retorno:** Configurar a `redirect_url` dinamicamente com base no ambiente, priorizando o domínio de produção no backend.

## 2. Refatoração Backend (Edge Functions)

### pagbank-create-checkout
- **Idempotência no Checkout:** Adicionar verificação de transação existente. Se o `payment_id` já existir e for de um checkout válido, reutilizar o link ou criar um novo apenas se necessário.
- **Validação de Valor:** Garantir que o `shipping_amount` seja recuperado diretamente do banco de dados (tabela `orders`) para evitar manipulações no frontend.
- **Ambiente Dinâmico:** Selecionar `PAGBANK_API_URL` automaticamente com base no `PAGBANK_ENVIRONMENT`.

### pagbank-webhook
- **Segurança:** Implementar validação server-side consultando a API do PagBank para confirmar o status da transação antes de aprovar o pedido internamente.
- **Idempotência Crítica:** Impedir o reprocessamento de notificações `PAID`. Verificar se `freight_payment_status` já é `approved` antes de disparar a geração da etiqueta.

### generate-label
- **Proteção de Duplicidade:** Verificar se `label_status === 'generated'` antes de iniciar qualquer chamada ao Melhor Envio.
- **Isolamento de Erro:** Garantir que falhas na logística não alterem o status de pagamento já aprovado.

## 3. Ajustes no Frontend

### Fluxo de Pagamento (`FreightPayment.tsx` e `PixPayment.tsx`)
- **Gestão de Estado:** Garantir que o botão de pagamento seja desabilitado e mostre estado de carregamento durante a chamada ao backend.
- **Persistência:** `PixPayment.tsx` será mantido como rota alternativa, pois já está integrado ao fluxo PagBank.

### Painel Administrativo
- **Visibilidade:** Exibir `Forma de Pagamento (PagBank)`, `Status (Pago/Pendente/...)` e `ID da Transação` nos detalhes do pedido em `AdminOrders.tsx`.

## 4. Banco de Dados e Compatibilidade
- **Dados Legados:** Manter colunas `mp_*` e `paypal_*` para garantir que o histórico de pedidos antigos não seja perdido.

## Detalhes Técnicos
- **Mapeamento de Status:**
  - `WAITING` / `IN_ANALYSIS` -> `pending`
  - `PAID` -> `approved`
  - `DECLINED` -> `rejected`
  - `CANCELED` -> `cancelled`
- **Segurança de Logs:** A tabela `payment_logs` registrará apenas eventos e IDs, nunca tokens ou dados sensíveis de cartão.

## Ordem de Implementação Recomendada
1. Configuração do Secret `PAGBANK_ENVIRONMENT` no Lovable Cloud.
2. Atualização das Edge Functions com lógica de idempotência e validação server-side.
3. Ajustes de UI no Admin para exibição de dados do PagBank.
4. Testes completos em ambiente Sandbox.
5. checklist final de segurança.
6. Virada para Produção (sob demanda).
