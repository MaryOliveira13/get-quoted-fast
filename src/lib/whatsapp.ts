import { formatBRL } from "./money";

const WHATSAPP_PHONE = "5531998562010";

export function buildWaLink(message: string): string {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(message: string): void {
  window.open(buildWaLink(message), "_blank");
}

export interface QuickQuoteItem {
  label: string;
  priceCents: number;
}

export function msgOrcamentoRapido(
  brand: string,
  model: string,
  items: QuickQuoteItem[],
  totalCents: number
): string {
  const lines = items.map((i) => `• ${i.label} — ${formatBRL(i.priceCents)}`).join("\n");
  return `Olá! Quero um orçamento.
📱 Aparelho: ${model} (${brand})
✅ Serviços:
${lines}
💰 Total estimado: ${formatBRL(totalCents)}
Pode me confirmar prazo e disponibilidade?`;
}

export interface PersonalizedQuoteData {
  nome: string;
  modelo: string;
  marca: string;
  problema: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  urgencia?: string;
  agua?: string;
  liga?: string;
}

export function msgOrcamentoPersonalizado(data: PersonalizedQuoteData): string {
  let msg = `Olá! Quero um orçamento personalizado.
👤 Nome: ${data.nome}`;

  if (data.cidade && data.uf) {
    msg += `\n📍 Local: ${data.cidade}-${data.uf}`;
    if (data.cep) msg += ` | CEP: ${data.cep}`;
  } else if (data.cep) {
    msg += `\n📍 CEP: ${data.cep}`;
  }

  msg += `\n📱 Aparelho: ${data.modelo}${data.marca ? ` (${data.marca})` : ""}`;
  msg += `\n📝 Problema: ${data.problema}`;

  if (data.urgencia) msg += `\n⏱️ Urgência: ${data.urgencia}`;
  if (data.agua) msg += `\n💧 Caiu na água? ${data.agua}`;
  if (data.liga) msg += `\n🔌 Liga? ${data.liga}`;

  msg += `\nConsegue me informar valor aproximado e prazo?`;
  return msg;
}
