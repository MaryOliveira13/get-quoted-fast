# Asaas Payment Layer Integration Plan - Production Ready

Objective: Complete the Asaas payment integration for production, including Pix (real QR Code), Credit Card (with installments and direct processing), Debit Card (redirect flow), and Webhook confirmation.

## 1. Environment and Secrets
- Ensure `ASAAS_ENVIRONMENT` is set to `production` (or `sandbox` as currently configured for testing).
- Use dynamic base URL selection: `https://api.asaas.com/v3` for production, `https://api-sandbox.asaas.com/v3` for sandbox.
- Verify `ASAAS_API_KEY` matches the environment.

## 2. Backend Enhancements (Edge Functions)

### asaas-create-pix
- **Billing Type**: Ensure `billingType = PIX`.
- **Value**: Use `orders.shipping_amount` directly (Asaas expects decimal value, not cents).
- **Official QR Code**: Fetch the official Pix QR Code using `GET /v3/payments/{payment_id}/pixQrCode`.
- **Response**: Return `encodedImage` (Base64), `payload` (Copy & Paste), `expirationDate`, and `payment_id`.
- **Idempotency**: Reuse existing pending Pix charges for the same order instead of creating new ones.

### asaas-pay-credit-card
- **Billing Type**: `CREDIT_CARD`.
- **Installments**: Support `installmentCount` and `totalValue` for multi-installment charges. For 1x, omit installment parameters.
- **Security**: Process card data server-side via Edge Function. NEVER log or store full card number or CVV.
- **Response**: Return status (`approved`, `pending`, `rejected`) based on Asaas response.

### asaas-webhook
- **Event Mapping**: 
  - `PAYMENT_CONFIRMED` / `PAYMENT_RECEIVED` -> `approved`.
  - `PAYMENT_REJECTED` / `PAYMENT_REPROVED_BY_RISK_ANALYSIS` -> `rejected`.
  - `PAYMENT_AWAITING_RISK_ANALYSIS` -> `pending`.
- **Idempotency**: Check `label_status` before triggering `generate-label` to avoid duplicates.

## 3. Frontend Enhancements (FreightPayment.tsx)

### Payment Method Selection
- Maintain [ PIX ] and [ CARTÃO ] tabs.
- Add sub-selection for Card: (●) Crédito ( ) Débito.

### Pix Flow
- Display the official QR Code image from Asaas.
- "Copiar código Pix" must copy the exact `payload` string returned by Asaas.

### Credit Card Flow
- Internal form for: Number, Month, Year, CVV, Holder Name, Holder CPF.
- Add "Parcelas" select (1x up to 12x). 
- Calculate installment display (e.g., "3x de R$ 40,00") based on `shipping_amount`. Initially interest-free.
- If Debit selected: show message "Você será redirecionado para o Asaas" and a button "Continuar com cartão de débito".

### Debit Card Flow
- Create an Asaas charge with `billingType = DEBIT_CARD` (or similar web-checkout compatible type).
- Obtain `invoiceUrl` from Asaas.
- Redirect user to `invoiceUrl` for secure debit processing.

## 4. Technical Details

### Installment Logic
```typescript
// Calculation
const amount = order.shipping_amount;
const installments = [];
for (let i = 1; i <= 12; i++) {
  const value = amount / i;
  if (value >= 5) { // Minimum installment value could be applied if needed
    installments.push({ count: i, value: value });
  }
}
```

### Debit Redirect
The `asaas-create-pix` function (or a new shared one) will be adapted to handle Debit by creating a charge and returning the `invoiceUrl`.

## 5. Verification Plan
- **Pix Production**: Verify Nubank/Inter can read the generated QR Code.
- **Credit Card**: Test 1x and 3x flows. Verify Asaas receives the correct `totalValue` and `installmentCount`.
- **Debit**: Verify redirect to Asaas invoice page.
- **Webhook**: Simulate/test Asaas events to confirm status updates and label generation.
- **Security**: Confirm card data is not logged or stored in the database.
