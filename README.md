# Orçamento Vínicius

You are building a mobile-first web app in Lovable (React app) for an online quote funnel that sends the user to WhatsApp with a pre-filled message (NO WhatsApp API).

GOAL
Create a complete “Orçamento + WhatsApp” flow:
Brand → Model (search) → Services (prices always visible + multi-select + total) → Send to WhatsApp
And an alternative:
Personalized Quote (form/report with City, State/UF and ZIP/CEP) → Send report to WhatsApp

TECH / CONSTRAINTS (IMPORTANT)
- Build as a React SPA with client-side routing (React Router).
- No backend, no database (MVP). Everything is local.
- Store service prices in cents (integer) to avoid float errors.
- Format BRL with Intl.NumberFormat.
- WhatsApp link format: https://wa.me/55SEUNUMERO?text=...
- Always use encodeURIComponent for the message (accents, spaces, line breaks).
- Open WhatsApp in a new tab (window.open).
- Must work great on mobile.

ROUTES (REQUIRED)
1) /orcamento
   - Brand selection screen in cards:
     Apple, Samsung, Xiaomi, Redmi, POCO, Motorola, LG, Realme
   - Click goes to /orcamento/:brand

2) /orcamento/:brand
   - Model selection screen for the chosen brand
   - Search input “Buscar modelo…”
   - Filter models case-insensitive
   - Only show results after typing at least 1 character (or 2 if needed)
   - Show results count “X resultados”
   - Click model goes to /orcamento/:brand/:model

3) /orcamento/:brand/:model
   - Services screen (prices always visible)
   - Multi-select services (toggle on/off)
   - Live total calculation
   - Microcopy: “Valores base. Confirmação final após avaliação do aparelho.”
   - “Outro Defeito” row (no fixed price) → go to personalized quote with brand/model prefilled in querystring:
     /orcamento-personalizado?brand=...&model=...
   - “Enviar para WhatsApp” button ONLY enabled if at least 1 service is selected
   - WhatsApp message template (quick quote):
     Olá! Quero um orçamento.
     📱 Aparelho: {MODEL} ({BRAND})
     ✅ Serviços:
     • {SERVICO} — {PRECO}
     • {SERVICO} — {PRECO}
     💰 Total estimado: {TOTAL}
     Pode me confirmar prazo e disponibilidade?

4) /orcamento-personalizado
   - “Report / Form” screen:
     REQUIRED fields:
       - Nome completo
       - Modelo do aparelho (prefilled when coming from previous steps)
       - O que o aparelho está tendo (textarea)
     OPTIONAL fields:
       - Cidade
       - UF (select with all Brazilian states)
       - CEP (accept 99999-999 or only digits; format if possible)
       - Urgência (baixa/média/alta)
       - Caiu na água? (sim/não)
       - Liga? (sim/não)
   - CTA: “Enviar relatório para WhatsApp”
   - WhatsApp message template (personalized quote):
     Olá! Quero um orçamento personalizado.
     👤 Nome: {NOME}
     📍 Local: {CIDADE}-{UF} | CEP: {CEP}   (only include if provided)
     📱 Aparelho: {MODEL} ({BRAND})
     📝 Problema: {DESCRICAO}
     ⏱️ Urgência: {URGENCIA} (if provided)
     💧 Caiu na água? {AGUA} (if provided)
     🔌 Liga? {LIGA} (if provided)
     Consegue me informar valor aproximado e prazo?

DATA SOURCE (MUST MATCH EXACTLY)
Do NOT fetch models from external datasets. Use a local catalog file exactly like below.

Create: src/data/catalog.ts
- brands list (id + name)
- MODELS_BY_BRAND: arrays of models for each brand
- Generate slugs for routing using a slugify() helper.

IMPORTANT: The models must follow EXACTLY this catalog (no extra, no missing).

Apple models:
iPhone 17 Pro Max
iPhone 17 Pro
iPhone 17 Air
iPhone 17
iPhone 16e
iPhone 16 Pro Max
iPhone 16 Pro
iPhone 16 Plus
iPhone 16
iPhone 15 Pro Max
iPhone 15 Pro
iPhone 15 Plus
iPhone 15
iPhone 14 Pro Max
iPhone 14 Pro
iPhone 14 Plus
iPhone 14
iPhone 13 Pro Max
iPhone 13 Pro
iPhone 13
iPhone 13 Mini
iPhone 12 Pro Max
iPhone 12 Pro
iPhone 12
iPhone 12 Mini
iPhone 11 Pro Max
iPhone 11 Pro
iPhone 11
iPhone XS Max
iPhone XS
iPhone XR
iPhone X
iPhone 8 Plus
iPhone 8
iPhone 7 Plus
iPhone 7
iPhone SE
iPhone 6S Plus
iPhone 6S
iPhone 6 Plus
iPhone 6
iPhone 5S

Samsung models:
Galaxy S26 Ultra
Galaxy S26+
Galaxy S26
Galaxy Z Fold7
Galaxy Z Flip7
Galaxy S25 Ultra
Galaxy S25+
Galaxy S25
Galaxy S25 Edge
Galaxy S25 FE
Galaxy A56
Galaxy A36
Galaxy Z Fold6
Galaxy Z Flip6
Galaxy S24 Ultra
Galaxy S24+
Galaxy S24
Galaxy S24 FE
Galaxy A55
Galaxy A35
Galaxy Z Fold5
Galaxy Z Flip5
Galaxy S23 Ultra
Galaxy S23+
Galaxy S23
Galaxy S23 FE
Galaxy A54
Galaxy A34
Galaxy Z Fold4
Galaxy Z Flip4
Galaxy S22 Ultra
Galaxy S22+
Galaxy S22
Galaxy A53
Galaxy A33
Galaxy Z Fold3
Galaxy Z Flip3
Galaxy S21 Ultra
Galaxy S21+
Galaxy S21
Galaxy S21 FE
Galaxy Note 20 Ultra
Galaxy Note 20
Galaxy S20 Ultra
Galaxy S20+
Galaxy S20
Galaxy S20 FE
Galaxy Note 10+
Galaxy Note 10
Galaxy S10+
Galaxy S10
Galaxy S10e
Galaxy Note 9
Galaxy S9+
Galaxy S9
Galaxy Note 8
Galaxy S8+
Galaxy S8
Galaxy S7 Edge
Galaxy S7
Galaxy S6 Edge
Galaxy S6
Galaxy S5

Xiaomi models:
Xiaomi 17 Ultra
Xiaomi 17 Pro
Xiaomi 17
Xiaomi 15T Pro
Xiaomi 15T
Xiaomi 15 Ultra
Xiaomi 15 Pro
Xiaomi 15
Xiaomi 14T Pro
Xiaomi 14T
Xiaomi 14 Ultra
Xiaomi 14 Pro
Xiaomi 14
Xiaomi 13 Ultra
Xiaomi 13T Pro
Xiaomi 13T
Xiaomi 13 Pro
Xiaomi 13
Xiaomi 13 Lite
Xiaomi 12T Pro
Xiaomi 12T
Xiaomi 12S Ultra
Xiaomi 12 Pro
Xiaomi 12
Xiaomi 12 Lite
Xiaomi 11T Pro
Xiaomi 11T
Mi 11 Ultra
Mi 11
Mi 11 Lite

Redmi models:
Redmi Note 15 Pro+ 5G
Redmi Note 15 Pro 5G
Redmi Note 15 5G
Redmi Note 15 4G
Redmi 14C
Redmi Note 14 Pro+ 5G
Redmi Note 14 Pro 5G
Redmi Note 14 5G
Redmi Note 14 4G
Redmi 13C
Redmi Note 13 Pro+ 5G
Redmi Note 13 Pro 5G
Redmi Note 13 5G
Redmi Note 13 4G
Redmi Note 12 Pro+
Redmi Note 12 Pro
Redmi Note 12 5G
Redmi Note 12S
Redmi 12C
Redmi Note 11 Pro+ 5G
Redmi Note 11 Pro
Redmi Note 11
Redmi Note 10 Pro
Redmi Note 10
Redmi Note 9S
Redmi Note 8 Pro

POCO models:
POCO F8 Pro
POCO F8
POCO X8 Pro
POCO X8
POCO M8 Pro 5G
POCO M8 5G
POCO F7 Ultra
POCO F7 Pro
POCO F7
POCO X7 Pro
POCO X7
POCO M7 Pro
POCO M7
POCO F6 Pro
POCO F6
POCO X6 Pro
POCO X6
POCO M6 Pro
POCO F5 Pro
POCO F5
POCO X5 Pro
POCO X5
POCO F4 GT
POCO F4
POCO X4 Pro 5G
POCO F3
POCO X3 Pro
POCO X3 NFC
POCO F2 Pro
Pocophone F1

Motorola models:
Motorola Signature
Motorola Edge 70 Ultra
Motorola Edge 70 Pro
Motorola Edge 70 Fusion
Motorola Razr 70 Ultra
Motorola Razr 70
Motorola Edge 60 Pro
Motorola Edge 60
Motorola Edge 60 Fusion
Motorola Edge 60 Neo
Motorola Razr 60 Ultra
Motorola Razr 60
Moto G86 5G
Moto G77
Moto G67
Moto G56 5G
Moto G35
Moto G17
Moto G15
Motorola Edge 50 Ultra
Motorola Edge 50 Pro
Motorola Edge 50 Fusion
Motorola Edge 50 Neo
Motorola Razr 50 Ultra
Motorola Razr 50
Moto G85
Moto G75
Moto G55
Moto G34
Moto G24
Moto G04
Motorola Edge 40 Pro
Motorola Edge 40
Motorola Edge 40 Neo
Motorola Razr 40 Ultra
Motorola Razr 40
Moto G84 5G
Moto G54 5G
Moto G73
Moto G53
Motorola Edge 30 Ultra
Motorola Edge 30 Pro
Motorola Edge 30 Fusion
Moto G60
Moto G60s
Moto G100

LG models:
(leave empty for now, show “Modelos não cadastrados ainda” and provide CTA to Personalized Quote)

Realme models:
(leave empty for now, show “Modelos não cadastrados ainda” and provide CTA to Personalized Quote)

SERVICES + PRICES (MVP)
Create src/data/services.ts with a list of service items:
- id, label, priceCents
Example services:
- Troca de Tela
- Troca de Vidro
- Bateria
- Conector de Carga
- Alto-falante
- Microfone
- Câmera
- Botões
- Tampa traseira
Prices can be generic for MVP (same across models), but must be always visible and stored in cents.

HELPERS (REQUIRED)
Create:
- src/lib/money.ts → formatBRL(cents)
- src/lib/whatsapp.ts → buildWaLink(phone, message), msgOrcamentoRapido(...), msgOrcamentoPersonalizado(...)

GLOBAL SETTINGS (IMPORTANT)
Use this exact WhatsApp phone number everywhere:
const WHATSAPP_PHONE = "5531998562010";

Use it to build the link:
https://wa.me/5531998562010?text=ENCODED_MESSAGE
Always use encodeURIComponent(message) and open in a new tab.

ERROR HANDLING
- If brand param invalid → show “Marca não encontrada” and a back button.
- If model param invalid → show “Modelo não encontrado” and back button.
- If LG/Realme list empty → show “Modelos não cadastrados ainda” + CTA to /orcamento-personalizado with brand prefilled.

DELIVERABLE
Generate all screens, routing, components, helpers, and data files so it runs immediately in Lovable.
Make it clean, simple, responsive, and ready to test.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://get-quoted-fast.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/449f2797-962b-48cf-863d-e0156e26e00a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
