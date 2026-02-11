export function buildPixPayload({
  amountCents,
  referenceId,
}: {
  amountCents: number;
  referenceId: string;
}): string {
  const amount = (amountCents / 100).toFixed(2);
  return `PIX|AMOUNT=${amount}|REF=${referenceId}|STORE=POWER-CELL`;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
