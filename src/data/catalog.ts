export interface Brand {
  id: string;
  name: string;
}

export const BRANDS: Brand[] = [
  { id: "apple", name: "Apple" },
  { id: "samsung", name: "Samsung" },
  { id: "xiaomi", name: "Xiaomi" },
  { id: "redmi", name: "Redmi" },
  { id: "poco", name: "POCO" },
  { id: "motorola", name: "Motorola" },
  { id: "lg", name: "LG" },
  { id: "realme", name: "Realme" },
];

export const MODELS_BY_BRAND: Record<string, string[]> = {
  apple: [
    "iPhone 17 Pro Max","iPhone 17 Pro","iPhone 17 Air","iPhone 17",
    "iPhone 16e","iPhone 16 Pro Max","iPhone 16 Pro","iPhone 16 Plus","iPhone 16",
    "iPhone 15 Pro Max","iPhone 15 Pro","iPhone 15 Plus","iPhone 15",
    "iPhone 14 Pro Max","iPhone 14 Pro","iPhone 14 Plus","iPhone 14",
    "iPhone 13 Pro Max","iPhone 13 Pro","iPhone 13","iPhone 13 Mini",
    "iPhone 12 Pro Max","iPhone 12 Pro","iPhone 12","iPhone 12 Mini",
    "iPhone 11 Pro Max","iPhone 11 Pro","iPhone 11",
    "iPhone XS Max","iPhone XS","iPhone XR","iPhone X",
    "iPhone 8 Plus","iPhone 8","iPhone 7 Plus","iPhone 7",
    "iPhone SE","iPhone 6S Plus","iPhone 6S","iPhone 6 Plus","iPhone 6","iPhone 5S",
  ],
  samsung: [
    "Galaxy S26 Ultra","Galaxy S26+","Galaxy S26",
    "Galaxy Z Fold7","Galaxy Z Flip7",
    "Galaxy S25 Ultra","Galaxy S25+","Galaxy S25","Galaxy S25 Edge","Galaxy S25 FE",
    "Galaxy A56","Galaxy A36",
    "Galaxy Z Fold6","Galaxy Z Flip6",
    "Galaxy S24 Ultra","Galaxy S24+","Galaxy S24","Galaxy S24 FE",
    "Galaxy A55","Galaxy A35",
    "Galaxy Z Fold5","Galaxy Z Flip5",
    "Galaxy S23 Ultra","Galaxy S23+","Galaxy S23","Galaxy S23 FE",
    "Galaxy A54","Galaxy A34",
    "Galaxy Z Fold4","Galaxy Z Flip4",
    "Galaxy S22 Ultra","Galaxy S22+","Galaxy S22",
    "Galaxy A53","Galaxy A33",
    "Galaxy Z Fold3","Galaxy Z Flip3",
    "Galaxy S21 Ultra","Galaxy S21+","Galaxy S21","Galaxy S21 FE",
    "Galaxy Note 20 Ultra","Galaxy Note 20",
    "Galaxy S20 Ultra","Galaxy S20+","Galaxy S20","Galaxy S20 FE",
    "Galaxy Note 10+","Galaxy Note 10",
    "Galaxy S10+","Galaxy S10","Galaxy S10e",
    "Galaxy Note 9","Galaxy S9+","Galaxy S9",
    "Galaxy Note 8","Galaxy S8+","Galaxy S8",
    "Galaxy S7 Edge","Galaxy S7",
    "Galaxy S6 Edge","Galaxy S6","Galaxy S5",
  ],
  xiaomi: [
    "Xiaomi 17 Ultra","Xiaomi 17 Pro","Xiaomi 17",
    "Xiaomi 15T Pro","Xiaomi 15T",
    "Xiaomi 15 Ultra","Xiaomi 15 Pro","Xiaomi 15",
    "Xiaomi 14T Pro","Xiaomi 14T",
    "Xiaomi 14 Ultra","Xiaomi 14 Pro","Xiaomi 14",
    "Xiaomi 13 Ultra","Xiaomi 13T Pro","Xiaomi 13T",
    "Xiaomi 13 Pro","Xiaomi 13","Xiaomi 13 Lite",
    "Xiaomi 12T Pro","Xiaomi 12T",
    "Xiaomi 12S Ultra","Xiaomi 12 Pro","Xiaomi 12","Xiaomi 12 Lite",
    "Xiaomi 11T Pro","Xiaomi 11T",
    "Mi 11 Ultra","Mi 11","Mi 11 Lite",
  ],
  redmi: [
    "Redmi Note 15 Pro+ 5G","Redmi Note 15 Pro 5G","Redmi Note 15 5G","Redmi Note 15 4G",
    "Redmi 14C",
    "Redmi Note 14 Pro+ 5G","Redmi Note 14 Pro 5G","Redmi Note 14 5G","Redmi Note 14 4G",
    "Redmi 13C",
    "Redmi Note 13 Pro+ 5G","Redmi Note 13 Pro 5G","Redmi Note 13 5G","Redmi Note 13 4G",
    "Redmi Note 12 Pro+","Redmi Note 12 Pro","Redmi Note 12 5G","Redmi Note 12S",
    "Redmi 12C",
    "Redmi Note 11 Pro+ 5G","Redmi Note 11 Pro","Redmi Note 11",
    "Redmi Note 10 Pro","Redmi Note 10",
    "Redmi Note 9S","Redmi Note 8 Pro",
  ],
  poco: [
    "POCO F8 Pro","POCO F8",
    "POCO X8 Pro","POCO X8",
    "POCO M8 Pro 5G","POCO M8 5G",
    "POCO F7 Ultra","POCO F7 Pro","POCO F7",
    "POCO X7 Pro","POCO X7",
    "POCO M7 Pro","POCO M7",
    "POCO F6 Pro","POCO F6",
    "POCO X6 Pro","POCO X6",
    "POCO M6 Pro",
    "POCO F5 Pro","POCO F5",
    "POCO X5 Pro","POCO X5",
    "POCO F4 GT","POCO F4",
    "POCO X4 Pro 5G",
    "POCO F3",
    "POCO X3 Pro","POCO X3 NFC",
    "POCO F2 Pro",
    "Pocophone F1",
  ],
  motorola: [
    "Motorola Signature",
    "Motorola Edge 70 Ultra","Motorola Edge 70 Pro","Motorola Edge 70 Fusion",
    "Motorola Razr 70 Ultra","Motorola Razr 70",
    "Motorola Edge 60 Pro","Motorola Edge 60","Motorola Edge 60 Fusion","Motorola Edge 60 Neo",
    "Motorola Razr 60 Ultra","Motorola Razr 60",
    "Moto G86 5G","Moto G77","Moto G67","Moto G56 5G","Moto G35","Moto G17","Moto G15",
    "Motorola Edge 50 Ultra","Motorola Edge 50 Pro","Motorola Edge 50 Fusion","Motorola Edge 50 Neo",
    "Motorola Razr 50 Ultra","Motorola Razr 50",
    "Moto G85","Moto G75","Moto G55","Moto G34","Moto G24","Moto G04",
    "Motorola Edge 40 Pro","Motorola Edge 40","Motorola Edge 40 Neo",
    "Motorola Razr 40 Ultra","Motorola Razr 40",
    "Moto G84 5G","Moto G54 5G","Moto G73","Moto G53",
    "Motorola Edge 30 Ultra","Motorola Edge 30 Pro","Motorola Edge 30 Fusion",
    "Moto G60","Moto G60s","Moto G100",
  ],
  lg: [],
  realme: [],
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function findBrand(brandSlug: string): Brand | undefined {
  return BRANDS.find((b) => b.id === brandSlug);
}

export function findModel(brandId: string, modelSlug: string): string | undefined {
  const models = MODELS_BY_BRAND[brandId] ?? [];
  return models.find((m) => slugify(m) === modelSlug);
}
