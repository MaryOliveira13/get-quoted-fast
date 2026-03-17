import { formatBRL } from "./money";

const WHATSAPP_PHONE = "5531998562010";

export function buildWaLink(message: string): string {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(message: string): void {
  const whatsappUrl = buildWaLink(message);

  try {
    window.top!.location.href = whatsappUrl;
  } catch (e) {
    window.open(whatsappUrl, "_blank");
  }
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

export interface SelfLabelOsData {
  osCode: string;
  fullName: string;
  phone: string;
  email: string;
  street: string;
  number: string;
  district: string;
  city: string;
  uf: string;
  cep: string;
  modelName: string;
  brandName: string;
  services: { label: string; priceCents: number }[];
  totalCents: number;
  accessories: string[];
}

export function msgEtiquetaPropria(data: SelfLabelOsData): string {
  const servLines = data.services
    .map((s) => `• ${s.label} — ${formatBRL(s.priceCents)}`)
    .join("\n");
  const accText = data.accessories.length > 0 ? data.accessories.join(", ") : "Nenhum";

  return `Olá! Vou enviar meu aparelho com etiqueta própria.

✅ OS: ${data.osCode}
👤 Cliente: ${data.fullName}
📞 WhatsApp: ${data.phone}
📧 E-mail: ${data.email}

📍 Endereço do cliente:
${data.street}, ${data.number} - ${data.district}
${data.city}-${data.uf} | CEP: ${data.cep}

📱 Aparelho: ${data.modelName} (${data.brandName})

🧾 Serviços/Problema:
${servLines}

💰 Total estimado: ${formatBRL(data.totalCents)}

🔌 Acessórios enviados:
${accText}

📦 Enviarei para o endereço informado no site.
Pode me confirmar o recebimento e os próximos passos?`;
}
