export interface ServiceItem {
  id: string;
  label: string;
  priceCents: number;
}

export const SERVICES: ServiceItem[] = [
  { id: "troca_tela", label: "Troca de Tela", priceCents: 29900 },
  { id: "troca_vidro_tela", label: "Troca de Vidro da Tela", priceCents: 14900 },
  { id: "troca_tampa_traseira", label: "Troca de Tampa Traseira", priceCents: 11900 },
];
