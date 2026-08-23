---
title: Recupere o Acesso Administrativo
description: Diagnóstico do sistema de autenticação e plano de recuperação de senha.
---

## 1. Diagnóstico do Sistema

*   **Rota do Painel:** `/admin`
*   **Rota de Login:** `/auth`
*   **Sistema de Autenticação:** Backend seguro (Supabase Auth) via E-mail e Senha.
*   **Estrutura de Permissões:** Armazenada na tabela `public.profiles` na coluna `role`. O valor deve ser `admin`.
*   **Usuários Identificados como Administradores:**
    *   `v.gsouza376@gmail.com` (Ativo - Último login: 17/08/2026)
    *   `admin@powercell.com.br` (Ativo - Aguardando primeiro acesso)
    *   `vinicius@admin.com` (Ativo - Aguardando primeiro acesso)

## 2. Plano de Ação para Recuperação

Para recuperar o acesso de forma segura, seguiremos estes passos:

1.  **Redefinição de Senha:** Vou adicionar uma funcionalidade de "Esqueci minha senha" na página de login (`/auth`) para que você possa disparar um link oficial de redefinição para o seu e-mail.
2.  **Página de Reset:** Criarei uma rota segura `/auth/reset-password` onde você poderá cadastrar a nova senha após clicar no link do e-mail.
3.  **Segurança:** A alteração da senha invalidará automaticamente sessões em outros dispositivos.

## 3. Próximos Passos

Deseja que eu proceda agora com a implementação do botão "Esqueci minha senha" e da página de redefinição? Se preferir utilizar um e-mail diferente dos listados acima, por favor, informe qual e-mail deseja cadastrar como novo administrador.

Aguardando sua confirmação para iniciar a implementação técnica.
