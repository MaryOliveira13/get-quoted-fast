# Plan - Selective Rollback of PagBank Integration

Reverting the recent PagBank/PagSeguro implementation to restore the previous Mercado Pago check-out experience, as requested.

## Technical Details

- **Frontend Restoration**:
    - Revert `src/pages/FreightPayment.tsx` to the version from commit `9c4b8d4`. This restores the in-page payment tabs (Pix/Card), Mercado Pago SDK integration, and summary section.
    - Revert `src/pages/PixPayment.tsx` to the version from commit `9c4b8d4`.
- **Backend Cleanup**:
    - Remove the newly created PagBank Edge Functions:
        - `supabase/functions/pagbank-create-checkout/index.ts`
        - `supabase/functions/pagbank-webhook/index.ts`
- **Preservation**:
    - All non-payment logic (shipping calculation, order creation, admin dashboard, security policies, and RLS) will remain untouched.

## Steps

1. **Restore Frontend Files**: Overwrite `src/pages/FreightPayment.tsx` and `src/pages/PixPayment.tsx` with their previous working versions.
2. **Remove PagBank Functions**: Delete the `pagbank-create-checkout` and `pagbank-webhook` directories from `supabase/functions/`.
3. **Verify**: Ensure the payment screen renders the Pix/Card tabs instead of a redirect button.
