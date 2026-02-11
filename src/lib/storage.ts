export interface QuoteDraft {
  brandId: string;
  brandName: string;
  modelSlug: string;
  modelName: string;
  services: { id: string; label: string; priceCents: number }[];
  totalCents: number;
}

export interface ShippingDraft {
  shippingMethod?: "label_by_us" | "self_label";
  fullName?: string;
  cpf?: string;
  phone?: string;
  email?: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  uf?: string;
  devices?: DeviceData[];
  selectedShipping?: "PAC" | "SEDEX";
  shippingPriceCents?: number;
}

export interface DeviceData {
  type: string;
  brand: string;
  valueCents: number;
  problem: string;
  accessories: string[];
}

const QUOTE_KEY = "quoteDraft";
const SHIPPING_KEY = "shippingDraft";

export function getQuoteDraft(): QuoteDraft | null {
  try {
    const raw = localStorage.getItem(QUOTE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setQuoteDraft(data: QuoteDraft): void {
  localStorage.setItem(QUOTE_KEY, JSON.stringify(data));
}

export function getShippingDraft(): ShippingDraft {
  try {
    const raw = localStorage.getItem(SHIPPING_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setShippingDraft(data: ShippingDraft): void {
  localStorage.setItem(SHIPPING_KEY, JSON.stringify(data));
}

export function updateShippingDraft(partial: Partial<ShippingDraft>): void {
  const current = getShippingDraft();
  setShippingDraft({ ...current, ...partial });
}
