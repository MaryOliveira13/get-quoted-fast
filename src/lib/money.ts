const formatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRL(value: number): string {
  // If the value is very small (less than 1 and not 0), it might be incorrectly handled.
  // The system stores shipping_amount in REAIS (e.g., 69.10).
  // formatBRL should handle REAIS.
  return formatter.format(value);
}
