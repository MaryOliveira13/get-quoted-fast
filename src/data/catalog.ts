export interface ServicePrice {
  name: string;
  price: number; // in BRL (e.g. 220 = R$220,00)
}

export interface ModelEntry {
  brand: string;
  brandId: string;
  model: string;
  services: ServicePrice[];
}

export interface Brand {
  id: string;
  name: string;
}

export const BRANDS: Brand[] = [
  { id: "apple", name: "Apple" },
  { id: "samsung", name: "Samsung" },
  { id: "xiaomi", name: "Xiaomi" },
  { id: "motorola", name: "Motorola" },
  { id: "infinix", name: "Infinix" },
];

const BRAND_ID_MAP: Record<string, string> = {
  Apple: "apple",
  Samsung: "samsung",
  Xiaomi: "xiaomi",
  Motorola: "motorola",
  Infinix: "infinix",
};

const rawModels: { brand: string; model: string; services: { name: string; price: number }[] }[] = [
  // ==================== APPLE ====================
  { brand: "Apple", model: "iPhone 5S", services: [
    { name: "Troca de Tela", price: 220 },
    { name: "Troca de Vidro da Tela", price: 150 },
  ]},
  { brand: "Apple", model: "iPhone 6", services: [
    { name: "Troca de Tela", price: 220 },
    { name: "Troca de Vidro da Tela", price: 150 },
  ]},
  { brand: "Apple", model: "iPhone 6 Plus", services: [
    { name: "Troca de Tela", price: 220 },
    { name: "Troca de Vidro da Tela", price: 150 },
  ]},
  { brand: "Apple", model: "iPhone 6S", services: [
    { name: "Troca de Tela", price: 220 },
    { name: "Troca de Vidro da Tela", price: 180 },
  ]},
  { brand: "Apple", model: "iPhone 7", services: [
    { name: "Troca de Tela", price: 205 },
    { name: "Troca de Vidro da Tela", price: 150 },
  ]},
  { brand: "Apple", model: "iPhone 7 Plus", services: [
    { name: "Troca de Tela", price: 270 },
    { name: "Troca de Vidro da Tela", price: 225 },
  ]},
  { brand: "Apple", model: "iPhone 8", services: [
    { name: "Troca de Tela", price: 220 },
    { name: "Troca de Vidro da Tela", price: 160 },
  ]},
  { brand: "Apple", model: "iPhone 8 Plus", services: [
    { name: "Troca de Tela", price: 270 },
    { name: "Troca de Vidro da Tela", price: 190 },
  ]},
  { brand: "Apple", model: "iPhone X", services: [
    { name: "Troca de Tela", price: 390 },
    { name: "Troca de Vidro da Tela", price: 310 },
  ]},
  { brand: "Apple", model: "iPhone XR", services: [
    { name: "Troca de Tela", price: 340 },
    { name: "Troca de Vidro da Tela", price: 225 },
  ]},
  { brand: "Apple", model: "iPhone XS", services: [
    { name: "Troca de Tela", price: 390 },
    { name: "Troca de Vidro da Tela", price: 290 },
  ]},
  { brand: "Apple", model: "iPhone XS Max", services: [
    { name: "Troca de Tela", price: 590 },
    { name: "Troca de Vidro da Tela", price: 340 },
  ]},
  { brand: "Apple", model: "iPhone 11", services: [
    { name: "Troca de Tela", price: 380 },
    { name: "Troca de Vidro da Tela", price: 260 },
  ]},
  { brand: "Apple", model: "iPhone 11 Pro", services: [
    { name: "Troca de Tela", price: 490 },
    { name: "Troca de Vidro da Tela", price: 290 },
  ]},
  { brand: "Apple", model: "iPhone 11 Pro Max", services: [
    { name: "Troca de Tela", price: 590 },
    { name: "Troca de Vidro da Tela", price: 390 },
  ]},
  { brand: "Apple", model: "iPhone 12", services: [
    { name: "Troca de Tela", price: 579 },
    { name: "Troca de Vidro da Tela", price: 390 },
  ]},
  { brand: "Apple", model: "iPhone 12 Mini", services: [
    { name: "Troca de Tela", price: 679 },
    { name: "Troca de Vidro da Tela", price: 390 },
  ]},
  { brand: "Apple", model: "iPhone 12 Pro", services: [
    { name: "Troca de Tela", price: 579 },
    { name: "Troca de Vidro da Tela", price: 390 },
  ]},
  { brand: "Apple", model: "iPhone 12 Pro Max", services: [
    { name: "Troca de Tela", price: 890 },
    { name: "Troca de Vidro da Tela", price: 690 },
  ]},
  { brand: "Apple", model: "iPhone 13", services: [
    { name: "Troca de Tela", price: 749 },
    { name: "Troca de Vidro da Tela", price: 490 },
  ]},
  { brand: "Apple", model: "iPhone 13 Mini", services: [
    { name: "Troca de Tela", price: 899 },
    { name: "Troca de Vidro da Tela", price: 690 },
  ]},
  { brand: "Apple", model: "iPhone 13 Pro", services: [
    { name: "Troca de Tela", price: 1049 },
    { name: "Troca de Vidro da Tela", price: 390 },
  ]},
  { brand: "Apple", model: "iPhone 13 Pro Max", services: [
    { name: "Troca de Tela", price: 1149 },
    { name: "Troca de Vidro da Tela", price: 790 },
  ]},
  { brand: "Apple", model: "iPhone 14", services: [
    { name: "Troca de Tela", price: 889 },
    { name: "Troca de Vidro da Tela", price: 690 },
  ]},
  { brand: "Apple", model: "iPhone 14 Pro", services: [
    { name: "Troca de Tela", price: 1560 },
    { name: "Troca de Vidro da Tela", price: 990 },
  ]},
  { brand: "Apple", model: "iPhone 14 Pro Max", services: [
    { name: "Troca de Tela", price: 1840 },
    { name: "Troca de Vidro da Tela", price: 1199 },
  ]},
  { brand: "Apple", model: "iPhone 15", services: [
    { name: "Troca de Tela", price: 1190 },
    { name: "Troca de Vidro da Tela", price: 790 },
  ]},
  { brand: "Apple", model: "iPhone 15 Plus", services: [
    { name: "Troca de Tela", price: 1450 },
    { name: "Troca de Vidro da Tela", price: 1199 },
  ]},
  { brand: "Apple", model: "iPhone 15 Pro", services: [
    { name: "Troca de Tela", price: 1450 },
    { name: "Troca de Vidro da Tela", price: 1049 },
  ]},
  { brand: "Apple", model: "iPhone 15 Pro Max", services: [
    { name: "Troca de Tela", price: 2100 },
    { name: "Troca de Vidro da Tela", price: 1199 },
  ]},
  { brand: "Apple", model: "iPhone 16", services: [
    { name: "Troca de Tela", price: 2100 },
    { name: "Troca de Vidro da Tela", price: 1400 },
  ]},
  { brand: "Apple", model: "iPhone 16 Pro", services: [
    { name: "Troca de Tela", price: 2200 },
    { name: "Troca de Vidro da Tela", price: 1300 },
  ]},
  { brand: "Apple", model: "iPhone 16 Pro Max", services: [
    { name: "Troca de Tela", price: 2400 },
    { name: "Troca de Vidro da Tela", price: 1490 },
  ]},
  // iPhone sem preço
  ...["iPhone 16e", "iPhone 17", "iPhone 17 Air", "iPhone 17 Pro", "iPhone 17 Pro Max"].map(
    (model) => ({ brand: "Apple", model, services: [] as { name: string; price: number }[] })
  ),

  // ==================== SAMSUNG ====================
  { brand: "Samsung", model: "Galaxy A04", services: [
    { name: "Troca de Tela", price: 210 },
    { name: "Troca de Vidro da Tela", price: 165 },
  ]},
  { brand: "Samsung", model: "Galaxy A04s", services: [
    { name: "Troca de Tela", price: 220 },
    { name: "Troca de Vidro da Tela", price: 160 },
  ]},
  { brand: "Samsung", model: "Galaxy A05", services: [
    { name: "Troca de Tela", price: 240 },
    { name: "Troca de Vidro da Tela", price: 190 },
  ]},
  { brand: "Samsung", model: "Galaxy A05s", services: [
    { name: "Troca de Tela", price: 290 },
    { name: "Troca de Vidro da Tela", price: 190 },
  ]},
  { brand: "Samsung", model: "Galaxy A06", services: [
    { name: "Troca de Tela", price: 245 },
    { name: "Troca de Vidro da Tela", price: 180 },
  ]},
  { brand: "Samsung", model: "Galaxy A07", services: [
    { name: "Troca de Tela", price: 290 },
    { name: "Troca de Vidro da Tela", price: 180 },
  ]},
  { brand: "Samsung", model: "Galaxy A14", services: [
    { name: "Troca de Tela", price: 240 },
    { name: "Troca de Vidro da Tela", price: 190 },
  ]},
  { brand: "Samsung", model: "Galaxy A15", services: [
    { name: "Troca de Tela", price: 390 },
    { name: "Troca de Vidro da Tela", price: 240 },
  ]},
  { brand: "Samsung", model: "Galaxy A16", services: [
    { name: "Troca de Tela", price: 590 },
    { name: "Troca de Vidro da Tela", price: 390 },
  ]},
  { brand: "Samsung", model: "Galaxy S10e", services: [
    { name: "Troca de Tela", price: 890 },
    { name: "Troca de Vidro da Tela", price: 590 },
  ]},
  { brand: "Samsung", model: "Galaxy S20 FE", services: [
    { name: "Troca de Tela", price: 590 },
    { name: "Troca de Vidro da Tela", price: 330 },
  ]},
  { brand: "Samsung", model: "Galaxy Note 20", services: [
    { name: "Troca de Tela", price: 1290 },
  ]},
  { brand: "Samsung", model: "Galaxy Note 20 Ultra", services: [
    { name: "Troca de Tela", price: 1600 },
  ]},
  { brand: "Samsung", model: "Galaxy S21 FE", services: [
    { name: "Troca de Tela", price: 840 },
    { name: "Troca de Vidro da Tela", price: 590 },
  ]},
  { brand: "Samsung", model: "Galaxy A33", services: [
    { name: "Troca de Tela", price: 460 },
    { name: "Troca de Vidro da Tela", price: 290 },
  ]},
  { brand: "Samsung", model: "Galaxy A53", services: [
    { name: "Troca de Tela", price: 520 },
    { name: "Troca de Vidro da Tela", price: 310 },
  ]},
  { brand: "Samsung", model: "Galaxy S22", services: [
    { name: "Troca de Tela", price: 1590 },
    { name: "Troca de Vidro da Tela", price: 990 },
  ]},
  { brand: "Samsung", model: "Galaxy A34", services: [
    { name: "Troca de Tela", price: 590 },
    { name: "Troca de Vidro da Tela", price: 390 },
  ]},
  { brand: "Samsung", model: "Galaxy A54", services: [
    { name: "Troca de Tela", price: 510 },
    { name: "Troca de Vidro da Tela", price: 310 },
  ]},
  { brand: "Samsung", model: "Galaxy S23 FE", services: [
    { name: "Troca de Tela", price: 960 },
    { name: "Troca de Vidro da Tela", price: 490 },
  ]},
  { brand: "Samsung", model: "Galaxy S23", services: [
    { name: "Troca de Tela", price: 1590 },
    { name: "Troca de Vidro da Tela", price: 990 },
  ]},
  { brand: "Samsung", model: "Galaxy S23 Ultra", services: [
    { name: "Troca de Tela", price: 1440 },
  ]},
  { brand: "Samsung", model: "Galaxy A35", services: [
    { name: "Troca de Tela", price: 690 },
    { name: "Troca de Vidro da Tela", price: 490 },
  ]},
  { brand: "Samsung", model: "Galaxy A55", services: [
    { name: "Troca de Tela", price: 790 },
    { name: "Troca de Vidro da Tela", price: 490 },
  ]},
  { brand: "Samsung", model: "Galaxy S24 FE", services: [
    { name: "Troca de Tela", price: 1290 },
    { name: "Troca de Vidro da Tela", price: 690 },
  ]},
  { brand: "Samsung", model: "Galaxy S24 Ultra", services: [
    { name: "Troca de Tela", price: 1890 },
    { name: "Troca de Vidro da Tela", price: 1290 },
  ]},
  { brand: "Samsung", model: "Galaxy A36", services: [
    { name: "Troca de Tela", price: 790 },
    { name: "Troca de Vidro da Tela", price: 590 },
  ]},
  { brand: "Samsung", model: "Galaxy A56", services: [
    { name: "Troca de Tela", price: 890 },
    { name: "Troca de Vidro da Tela", price: 590 },
  ]},
  ...[
    "Galaxy S6","Galaxy S7","Galaxy S8","Galaxy Note 8","Galaxy S9+",
    "Galaxy S10","Galaxy S10+","Galaxy Note 10","Galaxy Note 10+",
    "Galaxy S20","Galaxy S20+","Galaxy S20 Ultra","Galaxy S21","Galaxy S21+",
    "Galaxy S21 Ultra","Galaxy Z Flip 3","Galaxy Z Fold 3","Galaxy S22+",
    "Galaxy S22 Ultra","Galaxy Z Flip 4","Galaxy Z Fold 4","Galaxy A23",
    "Galaxy A24","Galaxy A25","Galaxy S23+","Galaxy Z Flip 5","Galaxy Z Fold 5",
    "Galaxy S24","Galaxy S24+","Galaxy Z Flip 6","Galaxy Z Fold 6",
    "Galaxy S25","Galaxy S25+","Galaxy S25 Ultra","Galaxy S25 FE",
    "Galaxy S25 Edge","Galaxy Z Flip 7","Galaxy Z Fold 7","Galaxy S26+",
    "Galaxy A04e","Galaxy A17"
  ].map((model) => ({ brand: "Samsung", model, services: [] as { name: string; price: number }[] })),

  // ==================== XIAOMI ====================
  { brand: "Xiaomi", model: "Poco X3 NFC", services: [
    { name: "Troca de Tela", price: 240 },
    { name: "Troca de Vidro da Tela", price: 190 },
  ]},
  { brand: "Xiaomi", model: "Poco X3 Pro", services: [
    { name: "Troca de Tela", price: 240 },
    { name: "Troca de Vidro da Tela", price: 190 },
  ]},
  { brand: "Xiaomi", model: "Poco F3", services: [
    { name: "Troca de Tela", price: 590 },
    { name: "Troca de Vidro da Tela", price: 390 },
  ]},
  { brand: "Xiaomi", model: "Poco X4 Pro 5G", services: [
    { name: "Troca de Tela", price: 440 },
    { name: "Troca de Vidro da Tela", price: 330 },
  ]},
  { brand: "Xiaomi", model: "Poco F4", services: [
    { name: "Troca de Tela", price: 550 },
    { name: "Troca de Vidro da Tela", price: 390 },
  ]},
  { brand: "Xiaomi", model: "Poco X5", services: [
    { name: "Troca de Tela", price: 490 },
    { name: "Troca de Vidro da Tela", price: 290 },
  ]},
  { brand: "Xiaomi", model: "Poco X5 Pro", services: [
    { name: "Troca de Tela", price: 490 },
    { name: "Troca de Vidro da Tela", price: 330 },
  ]},
  { brand: "Xiaomi", model: "Poco F5", services: [
    { name: "Troca de Tela", price: 690 },
    { name: "Troca de Vidro da Tela", price: 440 },
  ]},
  { brand: "Xiaomi", model: "Poco X6 Pro", services: [
    { name: "Troca de Tela", price: 790 },
    { name: "Troca de Vidro da Tela", price: 490 },
  ]},
  { brand: "Xiaomi", model: "Poco F6 Pro", services: [
    { name: "Troca de Tela", price: 790 },
    { name: "Troca de Vidro da Tela", price: 590 },
  ]},
  { brand: "Xiaomi", model: "Redmi Note 8", services: [
    { name: "Troca de Tela", price: 210 },
    { name: "Troca de Vidro da Tela", price: 160 },
  ]},
  { brand: "Xiaomi", model: "Redmi Note 8 Pro", services: [
    { name: "Troca de Tela", price: 240 },
    { name: "Troca de Vidro da Tela", price: 160 },
  ]},
  { brand: "Xiaomi", model: "Redmi Note 9S", services: [
    { name: "Troca de Tela", price: 215 },
    { name: "Troca de Vidro da Tela", price: 190 },
  ]},
  { brand: "Xiaomi", model: "Redmi Note 10", services: [
    { name: "Troca de Tela", price: 360 },
    { name: "Troca de Vidro da Tela", price: 225 },
  ]},
  { brand: "Xiaomi", model: "Redmi Note 11", services: [
    { name: "Troca de Tela", price: 390 },
    { name: "Troca de Vidro da Tela", price: 260 },
  ]},
  { brand: "Xiaomi", model: "Redmi Note 12C", services: [
    { name: "Troca de Tela", price: 210 },
    { name: "Troca de Vidro da Tela", price: 180 },
  ]},
  { brand: "Xiaomi", model: "Redmi Note 13C", services: [
    { name: "Troca de Tela", price: 240 },
    { name: "Troca de Vidro da Tela", price: 180 },
  ]},
  { brand: "Xiaomi", model: "Redmi Note 14 Pro 5G", services: [
    { name: "Troca de Tela", price: 690 },
    { name: "Troca de Vidro da Tela", price: 449 },
  ]},
  { brand: "Xiaomi", model: "Redmi Note 14C", services: [
    { name: "Troca de Tela", price: 260 },
    { name: "Troca de Vidro da Tela", price: 180 },
  ]},
  ...[
    "Pocophone F1","Poco F2 Pro","Poco F4 GT","Poco F5 Pro","Poco M6 Pro",
    "Poco X6","Poco F6","Poco M7","Poco M7 Pro","Poco X7 Pro",
    "Redmi Note 11 Pro","Redmi Note 12S","Redmi Note 12 5G",
    "Redmi Note 13 4G","Redmi Note 13 5G","Redmi Note 13 Pro 5G",
    "Redmi Note 14 4G","Redmi Note 14 5G","Mi 11 Lite","Mi 11",
    "Xiaomi 12","Xiaomi 12 Pro","Xiaomi 13","Xiaomi 13 Pro",
    "Xiaomi 14","Xiaomi 14 Pro"
  ].map((model) => ({ brand: "Xiaomi", model, services: [] as { name: string; price: number }[] })),

  // ==================== MOTOROLA ====================
  { brand: "Motorola", model: "Moto G8 Power", services: [
    { name: "Troca de Tela", price: 260 },
    { name: "Troca de Vidro da Tela", price: 190 },
  ]},
  { brand: "Motorola", model: "Moto G8", services: [
    { name: "Troca de Tela", price: 240 },
    { name: "Troca de Vidro da Tela", price: 160 },
  ]},
  { brand: "Motorola", model: "Moto G8 Plus", services: [
    { name: "Troca de Tela", price: 260 },
    { name: "Troca de Vidro da Tela", price: 190 },
  ]},
  { brand: "Motorola", model: "Moto G8 Play", services: [
    { name: "Troca de Tela", price: 210 },
    { name: "Troca de Vidro da Tela", price: 160 },
  ]},
  { brand: "Motorola", model: "Moto G9 Power", services: [
    { name: "Troca de Tela", price: 280 },
    { name: "Troca de Vidro da Tela", price: 190 },
  ]},
  { brand: "Motorola", model: "Moto G9 Plus", services: [
    { name: "Troca de Tela", price: 280 },
    { name: "Troca de Vidro da Tela", price: 205 },
  ]},
  { brand: "Motorola", model: "Moto G9 Play", services: [
    { name: "Troca de Tela", price: 215 },
    { name: "Troca de Vidro da Tela", price: 160 },
  ]},
  { brand: "Motorola", model: "Moto G10", services: [
    { name: "Troca de Tela", price: 210 },
    { name: "Troca de Vidro da Tela", price: 170 },
  ]},
  { brand: "Motorola", model: "Moto G20", services: [
    { name: "Troca de Tela", price: 210 },
    { name: "Troca de Vidro da Tela", price: 170 },
  ]},
  { brand: "Motorola", model: "Moto G30", services: [
    { name: "Troca de Tela", price: 210 },
    { name: "Troca de Vidro da Tela", price: 170 },
  ]},
  { brand: "Motorola", model: "Moto G100", services: [
    { name: "Troca de Tela", price: 360 },
    { name: "Troca de Vidro da Tela", price: 210 },
  ]},
  { brand: "Motorola", model: "Moto G60s", services: [
    { name: "Troca de Tela", price: 240 },
    { name: "Troca de Vidro da Tela", price: 170 },
  ]},
  { brand: "Motorola", model: "Moto G60", services: [
    { name: "Troca de Tela", price: 240 },
    { name: "Troca de Vidro da Tela", price: 170 },
  ]},
  { brand: "Motorola", model: "Moto G53", services: [
    { name: "Troca de Tela", price: 240 },
    { name: "Troca de Vidro da Tela", price: 180 },
  ]},
  { brand: "Motorola", model: "Moto G73", services: [
    { name: "Troca de Tela", price: 390 },
    { name: "Troca de Vidro da Tela", price: 260 },
  ]},
  { brand: "Motorola", model: "Moto G54 5G", services: [
    { name: "Troca de Tela", price: 245 },
    { name: "Troca de Vidro da Tela", price: 180 },
  ]},
  { brand: "Motorola", model: "Moto G84 5G", services: [
    { name: "Troca de Tela", price: 590 },
    { name: "Troca de Vidro da Tela", price: 390 },
  ]},
  { brand: "Motorola", model: "Motorola Edge 40", services: [
    { name: "Troca de Tela", price: 790 },
  ]},
  { brand: "Motorola", model: "Moto G34", services: [
    { name: "Troca de Tela", price: 240 },
    { name: "Troca de Vidro da Tela", price: 180 },
  ]},
  { brand: "Motorola", model: "Moto G55", services: [
    { name: "Troca de Tela", price: 260 },
    { name: "Troca de Vidro da Tela", price: 190 },
  ]},
  { brand: "Motorola", model: "Moto G75", services: [
    { name: "Troca de Tela", price: 310 },
    { name: "Troca de Vidro da Tela", price: 220 },
  ]},
  { brand: "Motorola", model: "Moto G85", services: [
    { name: "Troca de Tela", price: 790 },
    { name: "Troca de Vidro da Tela", price: 490 },
  ]},
  { brand: "Motorola", model: "Motorola Edge 50 Fusion", services: [
    { name: "Troca de Tela", price: 720 },
    { name: "Troca de Vidro da Tela", price: 490 },
  ]},
  { brand: "Motorola", model: "Moto G35", services: [
    { name: "Troca de Tela", price: 260 },
    { name: "Troca de Vidro da Tela", price: 190 },
  ]},
  ...[
    "Moto G05","Moto G04","Moto G24","Moto G15","Moto G17",
    "Moto G56 5G","Moto G67","Moto G77","Moto G86 5G",
    "Motorola Edge 30 Fusion","Motorola Edge 30 Pro","Motorola Edge 30 Ultra",
    "Motorola Razr 40","Motorola Razr 40 Ultra","Motorola Razr 40 Neo",
    "Motorola Edge 40 Neo","Motorola Edge 40 Pro",
    "Motorola Razr 50","Motorola Edge 50 Neo","Motorola Edge 50 Pro","Motorola Edge 50 Ultra",
    "Motorola Razr 60","Motorola Razr 60 Ultra",
    "Motorola Edge 60 Neo","Motorola Edge 60 Fusion","Motorola Edge 60",
    "Motorola Edge 60 Pro","Motorola Edge 70 Fusion","Motorola Edge 70 Pro",
    "Motorola Edge 70 Ultra"
  ].map((model) => ({ brand: "Motorola", model, services: [] as { name: string; price: number }[] })),

  // ==================== INFINIX ====================
  ...[
    "Hot 40 Pro","Hot 40","Hot 30 Play","Hot 30","Hot 20 Pro",
    "Note 40 Pro","Note 40","Note 30 Pro","Note 30","Note 12 Pro",
    "Zero 30","Zero 20","Smart 8 Pro","Smart 8"
  ].map((model) => ({ brand: "Infinix", model, services: [] as { name: string; price: number }[] })),
];

// Build the processed MODELS_DATABASE
export const MODELS_DATABASE: ModelEntry[] = rawModels.map((m) => ({
  brand: m.brand,
  brandId: BRAND_ID_MAP[m.brand] ?? m.brand.toLowerCase(),
  model: m.model,
  services: m.services,
}));

// Derived: models grouped by brand (for backward compat)
export const MODELS_BY_BRAND: Record<string, string[]> = {};
for (const entry of MODELS_DATABASE) {
  if (!MODELS_BY_BRAND[entry.brandId]) MODELS_BY_BRAND[entry.brandId] = [];
  MODELS_BY_BRAND[entry.brandId].push(entry.model);
}

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

export function findModelEntry(brandId: string, modelSlug: string): ModelEntry | undefined {
  return MODELS_DATABASE.find(
    (m) => m.brandId === brandId && slugify(m.model) === modelSlug
  );
}
