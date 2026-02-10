export interface ServiceItem {
  id: string;
  label: string;
  priceCents: number;
}

export const SERVICES: ServiceItem[] = [
  { id: "tela", label: "Troca de Tela", priceCents: 29900 },
  { id: "vidro", label: "Troca de Vidro", priceCents: 14900 },
  { id: "bateria", label: "Bateria", priceCents: 12900 },
  { id: "conector", label: "Conector de Carga", priceCents: 9900 },
  { id: "altofalante", label: "Alto-falante", priceCents: 8900 },
  { id: "microfone", label: "Microfone", priceCents: 7900 },
  { id: "camera", label: "Câmera", priceCents: 19900 },
  { id: "botoes", label: "Botões", priceCents: 6900 },
  { id: "tampa", label: "Tampa traseira", priceCents: 11900 },
];
