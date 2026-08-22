# Plan: Asaas Production Integration Improvements

Optimize the Asaas production payment flow for better UX (single-click Pix generation) and a more intuitive layout on the payment page.

## Frontend Changes

### `src/pages/FreightPayment.tsx`
- **Single-Click Pix Flow**:
  - Implement `useRef` and `isGeneratingPix` state to prevent duplicate clicks.
  - Disable the "Gerar Pix" button immediately on click.
  - Show a spinner and "Gerando seu Pix..." text during processing.
  - Automatically display the QR Code and copy-paste code once the backend returns data.
  - Implement up to 3 automatic retries for network or server errors (429, 5xx), but not for 400 errors.
- **Layout Reorganization**:
  - Move "Resumo do Pedido" to the bottom of the page.
  - Order: Header -> Tabs (Pix/Cartão) -> Content -> Summary.
  - Ensure QR Code is centered, sharp, and has a white background.
  - Ensure payload (copy-paste code) wraps correctly.
  - Consistent spacing and mobile responsiveness.

### `src/pages/PixPayment.tsx`
- Update to match the new behavior and layout if used, ensuring consistency with `FreightPayment.tsx`.

## Backend Changes

### `supabase/functions/asaas-create-pix/index.ts`
- **Idempotency & QR Code Polling**:
  - Ensure the function is idempotent based on `order_id`.
  - If a payment already exists for the order, retrieve it instead of creating a new one.
  - If the QR Code (encodedImage/payload) is not immediately available from Asaas, implement up to 5 automatic retries with progressive delays within the Edge Function.
  - Only return when `payment_id`, `encodedImage`, and `payload` are all available or a definitive error occurs.

## Technical Details
- Use `useRef` for a locking mechanism in the frontend to prevent concurrent API calls.
- Implement exponential backoff or progressive intervals for retries.
- Ensure the QR Code container has `bg-white` and adequate padding for scanability.
- The Edge Function will handle the complexity of Asaas QR Code generation latency internally.

## Constraints
- Do NOT alter Asaas secrets, Production keys, Webhook tokens, Base URLs, or existing authentication/calculation logic.
- Preserve the dark theme and branding of Power Cell.
- No changes to shipping amount or order data.
