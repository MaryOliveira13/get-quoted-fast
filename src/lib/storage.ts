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
  shippingOptionId?: string;
  shippingOptionName?: string;
  cartItemId?: string;
  printUrl?: string;
  orderId?: string;
  trackingToken?: string;
}


export interface DeviceData {
  type: string;
  brand: string;
  valueCents: number;
  problem: string;
  accessories: string[];
}

export interface OsDraft {
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
  deviceType?: string;
  deviceBrand?: string;
  deviceValueCents?: number;
  problem?: string;
  accessories?: string[];
  photoCount?: number;
}

export interface OsRecord {
  osCode: string;
  brandName: string;
  modelName: string;
  services: { id: string; label: string; priceCents: number }[];
  totalCents: number;
  client: OsDraft;
  createdAt: string;
}

const QUOTE_KEY = "quoteDraft";
const SHIPPING_KEY = "shippingDraft";
const OS_DRAFT_KEY = "osDraft";
const OS_RECORD_KEY = "osRecord";

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

export function getOsDraft(): OsDraft {
  try {
    const raw = localStorage.getItem(OS_DRAFT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setOsDraft(data: OsDraft): void {
  localStorage.setItem(OS_DRAFT_KEY, JSON.stringify(data));
}

export function updateOsDraft(partial: Partial<OsDraft>): void {
  setOsDraft({ ...getOsDraft(), ...partial });
}

export function getOsRecord(): OsRecord | null {
  try {
    const raw = localStorage.getItem(OS_RECORD_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setOsRecord(data: OsRecord): void {
  localStorage.setItem(OS_RECORD_KEY, JSON.stringify(data));
}

export function clearOsData(): void {
  localStorage.removeItem(OS_DRAFT_KEY);
  localStorage.removeItem(OS_RECORD_KEY);
}

export function generateOsCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "ZCT-";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
