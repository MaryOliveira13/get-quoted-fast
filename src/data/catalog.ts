export interface Brand {
  id: string;
  name: string;
}

export interface ModelService {
  name: string;
  price: number; // in BRL (not cents)
}

export interface ModelEntry {
  brand: string;
  model: string;
  services: ModelService[];
}

export const BRANDS: Brand[] = [
  { id: "apple", name: "Apple" },
  { id: "samsung", name: "Samsung" },
  { id: "xiaomi", name: "Xiaomi" },
  { id: "motorola", name: "Motorola" },
  { id: "infinix", name: "Infinix" },
];

export const MODELS_DATABASE: ModelEntry[] = [
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
    { name: "Bateria", price: 150 },
  ]},
  { brand: "Apple", model: "iPhone 7", services: [
    { name: "Troca de Tela", price: 220 },
    { name: "Troca de Vidro da Tela", price: 180 },
    { name: "Bateria", price: 130 },
  ]},
  { brand: "Apple", model: "iPhone 7 Plus", services: [
    { name: "Troca de Tela", price: 220 },
    { name: "Troca de Vidro da Tela", price: 190 },
    { name: "Bateria", price: 150 },
  ]},
  { brand: "Apple", model: "iPhone 8", services: [
    { name: "Troca de Tela", price: 220 },
    { name: "Troca de Vidro da Tela", price: 190 },
    { name: "Bateria", price: 150 },
  ]},
  { brand: "Apple", model: "iPhone 8 Plus", services: [
    { name: "Troca de Tela", price: 240 },
    { name: "Troca de Vidro da Tela", price: 190 },
    { name: "Bateria", price: 180 },
  ]},
  { brand: "Apple", model: "iPhone X", services: [
    { name: "Troca de Tela", price: 390 },
    { name: "Troca de Vidro da Tela", price: 250 },
    { name: "Troca de Tampa Traseira", price: 180 },
    { name: "Bateria", price: 230 },
  ]},
  { brand: "Apple", model: "iPhone XR", services: [
    { name: "Troca de Tela", price: 300 },
    { name: "Troca de Vidro da Tela", price: 250 },
    { name: "Troca de Tampa Traseira", price: 180 },
    { name: "Bateria", price: 250 },
  ]},
  { brand: "Apple", model: "iPhone XS", services: [
    { name: "Troca de Tela", price: 390 },
    { name: "Troca de Vidro da Tela", price: 250 },
    { name: "Troca de Tampa Traseira", price: 190 },
    { name: "Bateria", price: 250 },
  ]},
  { brand: "Apple", model: "iPhone XS Max", services: [
    { name: "Troca de Tela", price: 590 },
    { name: "Troca de Vidro da Tela", price: 340 },
    { name: "Bateria", price: 250 },
  ]},
  { brand: "Apple", model: "iPhone 11", services: [
    { name: "Troca de Tela", price: 380 },
    { name: "Troca de Vidro da Tela", price: 250 },
    { name: "Troca de Tampa Traseira", price: 200 },
    { name: "Bateria", price: 250 },
  ]},
  { brand: "Apple", model: "iPhone 11 Pro", services: [
    { name: "Troca de Tela", price: 490 },
    { name: "Troca de Vidro da Tela", price: 290 },
    { name: "Troca de Tampa Traseira", price: 220 },
    { name: "Bateria", price: 290 },
  ]},
  { brand: "Apple", model: "iPhone 11 Pro Max", services: [
    { name: "Troca de Tela", price: 590 },
    { name: "Troca de Vidro da Tela", price: 390 },
    { name: "Troca de Tampa Traseira", price: 250 },
    { name: "Bateria", price: 290 },
  ]},
  { brand: "Apple", model: "iPhone 12", services: [
    { name: "Troca de Tela", price: 579 },
    { name: "Troca de Vidro da Tela", price: 390 },
    { name: "Troca de Tampa Traseira", price: 250 },
    { name: "Bateria", price: 300 },
  ]},
  { brand: "Apple", model: "iPhone 12 Mini", services: [
    { name: "Troca de Tela", price: 679 },
    { name: "Troca de Vidro da Tela", price: 390 },
    { name: "Troca de Tampa Traseira", price: 200 },
  ]},
  { brand: "Apple", model: "iPhone 12 Pro", services: [
    { name: "Troca de Tela", price: 579 },
    { name: "Troca de Vidro da Tela", price: 390 },
    { name: "Troca de Tampa Traseira", price: 250 },
    { name: "Bateria", price: 320 },
  ]},
  { brand: "Apple", model: "iPhone 12 Pro Max", services: [
    { name: "Troca de Tela", price: 890 },
    { name: "Troca de Vidro da Tela", price: 350 },
    { name: "Troca de Tampa Traseira", price: 300 },
    { name: "Bateria", price: 350 },
  ]},
  { brand: "Apple", model: "iPhone 13", services: [
    { name: "Troca de Tela", price: 749 },
    { name: "Troca de Vidro da Tela", price: 350 },
    { name: "Troca de Tampa Traseira", price: 280 },
    { name: "Bateria", price: 350 },
  ]},
  { brand: "Apple", model: "iPhone 13 Mini", services: [
    { name: "Troca de Tela", price: 899 },
    { name: "Troca de Vidro da Tela", price: 300 },
    { name: "Troca de Tampa Traseira", price: 250 },
  ]},
  { brand: "Apple", model: "iPhone 13 Pro", services: [
    { name: "Troca de Tela", price: 1049 },
    { name: "Troca de Vidro da Tela", price: 390 },
    { name: "Troca de Tampa Traseira", price: 280 },
  ]},
  { brand: "Apple", model: "iPhone 13 Pro Max", services: [
    { name: "Troca de Tela", price: 1149 },
    { name: "Troca de Vidro da Tela", price: 500 },
    { name: "Troca de Tampa Traseira", price: 350 },
    { name: "Bateria", price: 390 },
  ]},
  { brand: "Apple", model: "iPhone 14", services: [
    { name: "Troca de Tela", price: 889 },
    { name: "Troca de Vidro da Tela", price: 350 },
    { name: "Troca de Tampa Traseira", price: 300 },
    { name: "Bateria", price: 450 },
  ]},
  { brand: "Apple", model: "iPhone 14 Plus", services: [] },
  { brand: "Apple", model: "iPhone 14 Pro", services: [
    { name: "Troca de Tela", price: 990 },
    { name: "Troca de Vidro da Tela", price: 400 },
    { name: "Troca de Tampa Traseira", price: 300 },
    { name: "Bateria", price: 450 },
  ]},
  { brand: "Apple", model: "iPhone 14 Pro Max", services: [
    { name: "Troca de Tela", price: 1650 },
    { name: "Troca de Vidro da Tela", price: 550 },
    { name: "Troca de Tampa Traseira", price: 400 },
    { name: "Bateria", price: 550 },
  ]},
  { brand: "Apple", model: "iPhone 15", services: [
    { name: "Troca de Tela", price: 1100 },
    { name: "Troca de Vidro da Tela", price: 500 },
    { name: "Troca de Tampa Traseira", price: 400 },
    { name: "Bateria", price: 450 },
  ]},
  { brand: "Apple", model: "iPhone 15 Plus", services: [
    { name: "Troca de Tela", price: 1450 },
    { name: "Troca de Vidro da Tela", price: 650 },
    { name: "Troca de Tampa Traseira", price: 450 },
  ]},
  { brand: "Apple", model: "iPhone 15 Pro", services: [
    { name: "Troca de Tela", price: 1999 },
    { name: "Troca de Vidro da Tela", price: 650 },
    { name: "Troca de Tampa Traseira", price: 450 },
    { name: "Bateria", price: 490 },
  ]},
  { brand: "Apple", model: "iPhone 15 Pro Max", services: [
    { name: "Troca de Tela", price: 2700 },
    { name: "Troca de Vidro da Tela", price: 690 },
    { name: "Troca de Tampa Traseira", price: 490 },
    { name: "Bateria", price: 590 },
  ]},
  { brand: "Apple", model: "iPhone 16", services: [
    { name: "Troca de Tela", price: 1800 },
    { name: "Troca de Vidro da Tela", price: 500 },
    { name: "Troca de Tampa Traseira", price: 400 },
    { name: "Bateria", price: 500 },
  ]},
  { brand: "Apple", model: "iPhone 16 Plus", services: [] },
  { brand: "Apple", model: "iPhone 16 Pro", services: [
    { name: "Troca de Tela", price: 2200 },
    { name: "Troca de Vidro da Tela", price: 550 },
    { name: "Troca de Tampa Traseira", price: 450 },
    { name: "Bateria", price: 650 },
  ]},
  { brand: "Apple", model: "iPhone 16 Pro Max", services: [
    { name: "Troca de Tela", price: 3200 },
    { name: "Troca de Vidro da Tela", price: 650 },
    { name: "Troca de Tampa Traseira", price: 500 },
    { name: "Bateria", price: 850 },
  ]},
  { brand: "Apple", model: "iPhone 16e", services: [
    { name: "Troca de Tela", price: 950 },
    { name: "Troca de Vidro da Tela", price: 400 },
    { name: "Troca de Tampa Traseira", price: 450 },
  ]},
  { brand: "Apple", model: "iPhone 17", services: [
    { name: "Troca de Tela", price: 3100 },
    { name: "Troca de Vidro da Tela", price: 950 },
    { name: "Troca de Tampa Traseira", price: 600 },
  ]},
  { brand: "Apple", model: "iPhone 17 Air", services: [] },
  { brand: "Apple", model: "iPhone 17 Pro", services: [
    { name: "Troca de Tela", price: 3450 },
    { name: "Troca de Vidro da Tela", price: 1000 },
    { name: "Troca de Tampa Traseira", price: 600 },
  ]},
  { brand: "Apple", model: "iPhone 17 Pro Max", services: [
    { name: "Troca de Tela", price: 3990 },
    { name: "Troca de Vidro da Tela", price: 1250 },
    { name: "Troca de Tampa Traseira", price: 850 },
  ]},
  { brand: "Apple", model: "iPhone SE", services: [] },

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
    { name: "Troca de Tela", price: 240 },
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
    { name: "Troca de Tela", price: 490 },
    { name: "Troca de Vidro da Tela", price: 290 },
  ]},
  { brand: "Samsung", model: "Galaxy A17", services: [
    { name: "Troca de Tela", price: 650 },
    { name: "Troca de Vidro da Tela", price: 300 },
  ]},
  { brand: "Samsung", model: "Galaxy A23", services: [
    { name: "Troca de Tela", price: 240 },
    { name: "Troca de Vidro da Tela", price: 200 },
  ]},
  { brand: "Samsung", model: "Galaxy A24", services: [
    { name: "Troca de Tela", price: 490 },
    { name: "Troca de Vidro da Tela", price: 250 },
  ]},
  { brand: "Samsung", model: "Galaxy A25", services: [
    { name: "Troca de Tela", price: 520 },
    { name: "Troca de Vidro da Tela", price: 300 },
  ]},
  { brand: "Samsung", model: "Galaxy A33", services: [
    { name: "Troca de Tela", price: 490 },
    { name: "Troca de Vidro da Tela", price: 290 },
  ]},
  { brand: "Samsung", model: "Galaxy A34", services: [
    { name: "Troca de Tela", price: 590 },
    { name: "Troca de Vidro da Tela", price: 300 },
  ]},
  { brand: "Samsung", model: "Galaxy A35", services: [
    { name: "Troca de Tela", price: 590 },
    { name: "Troca de Vidro da Tela", price: 350 },
  ]},
  { brand: "Samsung", model: "Galaxy A36", services: [
    { name: "Troca de Tela", price: 590 },
    { name: "Troca de Vidro da Tela", price: 300 },
  ]},
  { brand: "Samsung", model: "Galaxy A53", services: [
    { name: "Troca de Tela", price: 690 },
    { name: "Troca de Vidro da Tela", price: 310 },
  ]},
  { brand: "Samsung", model: "Galaxy A54", services: [
    { name: "Troca de Tela", price: 690 },
    { name: "Troca de Vidro da Tela", price: 310 },
  ]},
  { brand: "Samsung", model: "Galaxy A55", services: [
    { name: "Troca de Tela", price: 790 },
    { name: "Troca de Vidro da Tela", price: 350 },
  ]},
  { brand: "Samsung", model: "Galaxy A56", services: [
    { name: "Troca de Tela", price: 890 },
    { name: "Troca de Vidro da Tela", price: 350 },
  ]},
  { brand: "Samsung", model: "Galaxy S8", services: [
    { name: "Troca de Tela", price: 990 },
    { name: "Troca de Vidro da Tela", price: 450 },
    { name: "Troca de Tampa Traseira", price: 200 },
  ]},
  { brand: "Samsung", model: "Galaxy S10e", services: [
    { name: "Troca de Tela", price: 890 },
    { name: "Troca de Vidro da Tela", price: 590 },
  ]},
  { brand: "Samsung", model: "Galaxy S10", services: [
    { name: "Troca de Tela", price: 1200 },
    { name: "Troca de Vidro da Tela", price: 350 },
    { name: "Troca de Tampa Traseira", price: 220 },
  ]},
  { brand: "Samsung", model: "Galaxy S10+", services: [
    { name: "Troca de Tela", price: 1600 },
    { name: "Troca de Vidro da Tela", price: 450 },
    { name: "Troca de Tampa Traseira", price: 220 },
  ]},
  { brand: "Samsung", model: "Galaxy S20 FE", services: [
    { name: "Troca de Tela", price: 690 },
    { name: "Troca de Vidro da Tela", price: 330 },
    { name: "Troca de Tampa Traseira", price: 160 },
  ]},
  { brand: "Samsung", model: "Galaxy S20", services: [
    { name: "Troca de Tela", price: 1200 },
    { name: "Troca de Vidro da Tela", price: 350 },
    { name: "Troca de Tampa Traseira", price: 230 },
  ]},
  { brand: "Samsung", model: "Galaxy S20+", services: [
    { name: "Troca de Tela", price: 1750 },
    { name: "Troca de Vidro da Tela", price: 450 },
    { name: "Troca de Tampa Traseira", price: 230 },
  ]},
  { brand: "Samsung", model: "Galaxy S20 Ultra", services: [
    { name: "Troca de Tela", price: 1990 },
    { name: "Troca de Vidro da Tela", price: 550 },
  ]},
  { brand: "Samsung", model: "Galaxy Note 20", services: [
    { name: "Troca de Tela", price: 2100 },
    { name: "Troca de Vidro da Tela", price: 500 },
  ]},
  { brand: "Samsung", model: "Galaxy Note 20 Ultra", services: [
    { name: "Troca de Tela", price: 2100 },
    { name: "Troca de Vidro da Tela", price: 550 },
  ]},
  { brand: "Samsung", model: "Galaxy S21 FE", services: [
    { name: "Troca de Tela", price: 1200 },
    { name: "Troca de Vidro da Tela", price: 550 },
    { name: "Troca de Tampa Traseira", price: 220 },
  ]},
  { brand: "Samsung", model: "Galaxy S21", services: [
    { name: "Troca de Tela", price: 1299 },
    { name: "Troca de Vidro da Tela", price: 550 },
  ]},
  { brand: "Samsung", model: "Galaxy S21+", services: [
    { name: "Troca de Tela", price: 1290 },
    { name: "Troca de Vidro da Tela", price: 550 },
  ]},
  { brand: "Samsung", model: "Galaxy S21 Ultra", services: [
    { name: "Troca de Tela", price: 1990 },
    { name: "Troca de Vidro da Tela", price: 550 },
  ]},
  { brand: "Samsung", model: "Galaxy Z Flip 3", services: [
    { name: "Troca de Tela", price: 2690 },
  ]},
  { brand: "Samsung", model: "Galaxy S22", services: [
    { name: "Troca de Tela", price: 1590 },
    { name: "Troca de Vidro da Tela", price: 990 },
  ]},
  { brand: "Samsung", model: "Galaxy S22+", services: [
    { name: "Troca de Tela", price: 1990 },
    { name: "Troca de Vidro da Tela", price: 650 },
  ]},
  { brand: "Samsung", model: "Galaxy S22 Ultra", services: [
    { name: "Troca de Tela", price: 2490 },
    { name: "Troca de Vidro da Tela", price: 750 },
  ]},
  { brand: "Samsung", model: "Galaxy Z Flip 4", services: [
    { name: "Troca de Tela", price: 2200 },
  ]},
  { brand: "Samsung", model: "Galaxy S23 FE", services: [
    { name: "Troca de Tela", price: 990 },
    { name: "Troca de Vidro da Tela", price: 490 },
  ]},
  { brand: "Samsung", model: "Galaxy S23", services: [
    { name: "Troca de Tela", price: 1590 },
    { name: "Troca de Vidro da Tela", price: 990 },
  ]},
  { brand: "Samsung", model: "Galaxy S23+", services: [
    { name: "Troca de Tela", price: 2200 },
    { name: "Troca de Vidro da Tela", price: 600 },
  ]},
  { brand: "Samsung", model: "Galaxy S23 Ultra", services: [
    { name: "Troca de Tela", price: 2890 },
    { name: "Troca de Vidro da Tela", price: 790 },
  ]},
  { brand: "Samsung", model: "Galaxy S24 FE", services: [
    { name: "Troca de Tela", price: 1290 },
    { name: "Troca de Vidro da Tela", price: 690 },
  ]},
  { brand: "Samsung", model: "Galaxy S24", services: [
    { name: "Troca de Tela", price: 1590 },
    { name: "Troca de Vidro da Tela", price: 500 },
  ]},
  { brand: "Samsung", model: "Galaxy S24+", services: [
    { name: "Troca de Tela", price: 2000 },
    { name: "Troca de Vidro da Tela", price: 600 },
  ]},
  { brand: "Samsung", model: "Galaxy S24 Ultra", services: [
    { name: "Troca de Tela", price: 3500 },
    { name: "Troca de Vidro da Tela", price: 1200 },
  ]},
  { brand: "Samsung", model: "Galaxy S25 FE", services: [
    { name: "Troca de Tela", price: 1350 },
    { name: "Troca de Vidro da Tela", price: 600 },
  ]},
  { brand: "Samsung", model: "Galaxy S25", services: [
    { name: "Troca de Tela", price: 1590 },
    { name: "Troca de Vidro da Tela", price: 690 },
  ]},
  { brand: "Samsung", model: "Galaxy S25+", services: [
    { name: "Troca de Tela", price: 2100 },
    { name: "Troca de Vidro da Tela", price: 600 },
  ]},
  { brand: "Samsung", model: "Galaxy S25 Ultra", services: [
    { name: "Troca de Tela", price: 3100 },
    { name: "Troca de Vidro da Tela", price: 900 },
  ]},
  // Samsung sem preço
  ...["Galaxy S6","Galaxy S7","Galaxy Note 8","Galaxy S9+",
    "Galaxy Note 10","Galaxy Note 10+",
    "Galaxy Z Fold 3","Galaxy Z Flip 5","Galaxy Z Fold 4",
    "Galaxy Z Fold 5","Galaxy Z Flip 6","Galaxy Z Fold 6",
    "Galaxy Z Flip 7","Galaxy Z Fold 7","Galaxy S25 Edge",
    "Galaxy S26+","Galaxy A04e"
  ].map(model => ({ brand: "Samsung" as const, model, services: [] as ModelService[] })),

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
    { name: "Troca de Tela", price: 550 },
    { name: "Troca de Vidro da Tela", price: 330 },
  ]},
  { brand: "Xiaomi", model: "Poco F4", services: [
    { name: "Troca de Tela", price: 550 },
    { name: "Troca de Vidro da Tela", price: 390 },
  ]},
  { brand: "Xiaomi", model: "Poco X5", services: [
    { name: "Troca de Tela", price: 550 },
    { name: "Troca de Vidro da Tela", price: 290 },
  ]},
  { brand: "Xiaomi", model: "Poco X5 Pro", services: [
    { name: "Troca de Tela", price: 590 },
    { name: "Troca de Vidro da Tela", price: 330 },
  ]},
  { brand: "Xiaomi", model: "Poco F5", services: [
    { name: "Troca de Tela", price: 690 },
    { name: "Troca de Vidro da Tela", price: 440 },
  ]},
  { brand: "Xiaomi", model: "Poco X6", services: [
    { name: "Troca de Tela", price: 690 },
    { name: "Troca de Vidro da Tela", price: 300 },
  ]},
  { brand: "Xiaomi", model: "Poco X6 Pro", services: [
    { name: "Troca de Tela", price: 790 },
    { name: "Troca de Vidro da Tela", price: 300 },
  ]},
  { brand: "Xiaomi", model: "Poco F6 Pro", services: [
    { name: "Troca de Tela", price: 790 },
    { name: "Troca de Vidro da Tela", price: 590 },
  ]},
  { brand: "Xiaomi", model: "Poco X7 Pro", services: [
    { name: "Troca de Tela", price: 890 },
    { name: "Troca de Vidro da Tela", price: 350 },
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
  { brand: "Xiaomi", model: "Redmi Note 13 4G", services: [
    { name: "Troca de Tela", price: 550 },
    { name: "Troca de Vidro da Tela", price: 300 },
  ]},
  { brand: "Xiaomi", model: "Redmi Note 13 Pro 5G", services: [
    { name: "Troca de Tela", price: 550 },
    { name: "Troca de Vidro da Tela", price: 300 },
  ]},
  { brand: "Xiaomi", model: "Redmi Note 13C", services: [
    { name: "Troca de Tela", price: 240 },
    { name: "Troca de Vidro da Tela", price: 180 },
  ]},
  { brand: "Xiaomi", model: "Redmi Note 14 4G", services: [
    { name: "Troca de Tela", price: 650 },
    { name: "Troca de Vidro da Tela", price: 350 },
  ]},
  { brand: "Xiaomi", model: "Redmi Note 14 5G", services: [
    { name: "Troca de Tela", price: 650 },
    { name: "Troca de Vidro da Tela", price: 350 },
  ]},
  { brand: "Xiaomi", model: "Redmi Note 14 Pro 5G", services: [
    { name: "Troca de Tela", price: 890 },
    { name: "Troca de Vidro da Tela", price: 450 },
  ]},
  { brand: "Xiaomi", model: "Redmi Note 14C", services: [
    { name: "Troca de Tela", price: 260 },
    { name: "Troca de Vidro da Tela", price: 180 },
  ]},
  // Xiaomi sem preço
  ...["Pocophone F1","Poco F2 Pro","Poco F4 GT","Poco F5 Pro","Poco M6 Pro",
    "Poco F6","Poco M7","Poco M7 Pro",
    "Redmi Note 11 Pro","Redmi Note 12S","Redmi Note 12 5G",
    "Redmi Note 13 5G",
    "Mi 11 Lite","Mi 11",
    "Xiaomi 12","Xiaomi 12 Pro","Xiaomi 13","Xiaomi 13 Pro",
    "Xiaomi 14","Xiaomi 14 Pro"
  ].map(model => ({ brand: "Xiaomi" as const, model, services: [] as ModelService[] })),

  // ==================== MOTOROLA ====================
  { brand: "Motorola", model: "Moto G8 Play", services: [
    { name: "Troca de Tela", price: 210 },
    { name: "Troca de Vidro da Tela", price: 160 },
  ]},
  { brand: "Motorola", model: "Moto G8", services: [
    { name: "Troca de Tela", price: 240 },
    { name: "Troca de Vidro da Tela", price: 190 },
  ]},
  { brand: "Motorola", model: "Moto G8 Plus", services: [
    { name: "Troca de Tela", price: 260 },
    { name: "Troca de Vidro da Tela", price: 190 },
  ]},
  { brand: "Motorola", model: "Moto G8 Power", services: [
    { name: "Troca de Tela", price: 260 },
    { name: "Troca de Vidro da Tela", price: 190 },
  ]},
  { brand: "Motorola", model: "Moto G9 Play", services: [
    { name: "Troca de Tela", price: 215 },
    { name: "Troca de Vidro da Tela", price: 160 },
  ]},
  { brand: "Motorola", model: "Moto G9 Plus", services: [
    { name: "Troca de Tela", price: 280 },
    { name: "Troca de Vidro da Tela", price: 205 },
  ]},
  { brand: "Motorola", model: "Moto G9 Power", services: [
    { name: "Troca de Tela", price: 280 },
    { name: "Troca de Vidro da Tela", price: 190 },
  ]},
  { brand: "Motorola", model: "Moto G05", services: [
    { name: "Troca de Tela", price: 250 },
    { name: "Troca de Vidro da Tela", price: 200 },
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
  { brand: "Motorola", model: "Moto G60", services: [
    { name: "Troca de Tela", price: 240 },
    { name: "Troca de Vidro da Tela", price: 170 },
  ]},
  { brand: "Motorola", model: "Moto G60s", services: [
    { name: "Troca de Tela", price: 240 },
    { name: "Troca de Vidro da Tela", price: 170 },
  ]},
  { brand: "Motorola", model: "Moto G100", services: [
    { name: "Troca de Tela", price: 360 },
    { name: "Troca de Vidro da Tela", price: 210 },
  ]},
  { brand: "Motorola", model: "Moto G53", services: [
    { name: "Troca de Tela", price: 240 },
    { name: "Troca de Vidro da Tela", price: 180 },
  ]},
  { brand: "Motorola", model: "Moto G54 5G", services: [
    { name: "Troca de Tela", price: 245 },
    { name: "Troca de Vidro da Tela", price: 180 },
  ]},
  { brand: "Motorola", model: "Moto G73", services: [
    { name: "Troca de Tela", price: 390 },
    { name: "Troca de Vidro da Tela", price: 260 },
  ]},
  { brand: "Motorola", model: "Moto G84 5G", services: [
    { name: "Troca de Tela", price: 650 },
    { name: "Troca de Vidro da Tela", price: 390 },
  ]},
  { brand: "Motorola", model: "Moto G04", services: [
    { name: "Troca de Tela", price: 240 },
    { name: "Troca de Vidro da Tela", price: 200 },
  ]},
  { brand: "Motorola", model: "Moto G24", services: [
    { name: "Troca de Tela", price: 240 },
    { name: "Troca de Vidro da Tela", price: 200 },
  ]},
  { brand: "Motorola", model: "Moto G34", services: [
    { name: "Troca de Tela", price: 240 },
    { name: "Troca de Vidro da Tela", price: 200 },
  ]},
  { brand: "Motorola", model: "Moto G55", services: [
    { name: "Troca de Tela", price: 260 },
    { name: "Troca de Vidro da Tela", price: 200 },
  ]},
  { brand: "Motorola", model: "Moto G75", services: [
    { name: "Troca de Tela", price: 310 },
    { name: "Troca de Vidro da Tela", price: 220 },
  ]},
  { brand: "Motorola", model: "Moto G85", services: [
    { name: "Troca de Tela", price: 789.98 },
    { name: "Troca de Vidro da Tela", price: 490 },
  ]},
  { brand: "Motorola", model: "Moto G15", services: [
    { name: "Troca de Tela", price: 250 },
    { name: "Troca de Vidro da Tela", price: 200 },
  ]},
  { brand: "Motorola", model: "Moto G35", services: [
    { name: "Troca de Tela", price: 260 },
    { name: "Troca de Vidro da Tela", price: 200 },
  ]},
  { brand: "Motorola", model: "Moto G56 5G", services: [
    { name: "Troca de Tela", price: 250 },
    { name: "Troca de Vidro da Tela", price: 200 },
  ]},
  { brand: "Motorola", model: "Moto G86 5G", services: [
    { name: "Troca de Tela", price: 890 },
    { name: "Troca de Vidro da Tela", price: 350 },
  ]},
  { brand: "Motorola", model: "Motorola Edge 30 Fusion", services: [
    { name: "Troca de Tela", price: 790 },
    { name: "Troca de Vidro da Tela", price: 330 },
  ]},
  { brand: "Motorola", model: "Motorola Edge 30 Pro", services: [
    { name: "Troca de Tela", price: 690 },
    { name: "Troca de Vidro da Tela", price: 330 },
  ]},
  { brand: "Motorola", model: "Motorola Edge 30 Ultra", services: [
    { name: "Troca de Tela", price: 690 },
    { name: "Troca de Vidro da Tela", price: 330 },
  ]},
  { brand: "Motorola", model: "Motorola Edge 40 Neo", services: [
    { name: "Troca de Tela", price: 890 },
    { name: "Troca de Vidro da Tela", price: 350 },
  ]},
  { brand: "Motorola", model: "Motorola Edge 40", services: [
    { name: "Troca de Tela", price: 790 },
    { name: "Troca de Vidro da Tela", price: 350 },
  ]},
  { brand: "Motorola", model: "Motorola Edge 40 Pro", services: [
    { name: "Troca de Tela", price: 1990 },
    { name: "Troca de Vidro da Tela", price: 590 },
  ]},
  { brand: "Motorola", model: "Motorola Edge 50 Neo", services: [
    { name: "Troca de Tela", price: 690 },
    { name: "Troca de Vidro da Tela", price: 300 },
  ]},
  { brand: "Motorola", model: "Motorola Edge 50 Fusion", services: [
    { name: "Troca de Tela", price: 720 },
    { name: "Troca de Vidro da Tela", price: 350 },
  ]},
  { brand: "Motorola", model: "Motorola Edge 50 Pro", services: [
    { name: "Troca de Tela", price: 890 },
    { name: "Troca de Vidro da Tela", price: 400 },
  ]},
  { brand: "Motorola", model: "Motorola Edge 50 Ultra", services: [
    { name: "Troca de Tela", price: 990 },
    { name: "Troca de Vidro da Tela", price: 450 },
  ]},
  { brand: "Motorola", model: "Motorola Edge 60 Neo", services: [
    { name: "Troca de Tela", price: 790 },
    { name: "Troca de Vidro da Tela", price: 400 },
  ]},
  { brand: "Motorola", model: "Motorola Edge 60 Fusion", services: [
    { name: "Troca de Tela", price: 890 },
    { name: "Troca de Vidro da Tela", price: 400 },
  ]},
  { brand: "Motorola", model: "Motorola Edge 60", services: [
    { name: "Troca de Tela", price: 890 },
    { name: "Troca de Vidro da Tela", price: 400 },
  ]},
  { brand: "Motorola", model: "Motorola Edge 60 Pro", services: [
    { name: "Troca de Tela", price: 990 },
    { name: "Troca de Vidro da Tela", price: 460 },
  ]},
  { brand: "Motorola", model: "Motorola Edge 70 Fusion", services: [
    { name: "Troca de Tela", price: 1980 },
    { name: "Troca de Vidro da Tela", price: 850 },
  ]},
  // Motorola sem preço
  ...["Moto G17","Moto G67","Moto G77",
    "Motorola Razr 40","Motorola Razr 40 Ultra","Motorola Razr 40 Neo",
    "Motorola Razr 50","Motorola Razr 60","Motorola Razr 60 Ultra",
    "Motorola Edge 70 Pro","Motorola Edge 70 Ultra"
  ].map(model => ({ brand: "Motorola" as const, model, services: [] as ModelService[] })),

  // ==================== INFINIX ====================
  ...["Hot 40 Pro","Hot 40","Hot 30 Play","Hot 30","Hot 20 Pro",
    "Note 40 Pro","Note 40","Note 30 Pro","Note 30","Note 12 Pro",
    "Zero 30","Zero 20","Smart 8 Pro","Smart 8"
  ].map(model => ({ brand: "Infinix" as const, model, services: [] as ModelService[] })),
];

// Derived: brand id from name
const BRAND_NAME_TO_ID: Record<string, string> = {};
for (const b of BRANDS) {
  BRAND_NAME_TO_ID[b.name] = b.id;
}

// Derived: MODELS_BY_BRAND for backward compat
export const MODELS_BY_BRAND: Record<string, string[]> = {};
for (const b of BRANDS) {
  MODELS_BY_BRAND[b.id] = [];
}
for (const entry of MODELS_DATABASE) {
  const brandId = BRAND_NAME_TO_ID[entry.brand];
  if (brandId && MODELS_BY_BRAND[brandId]) {
    MODELS_BY_BRAND[brandId].push(entry.model);
  }
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

/** Get services for a specific model of a brand */
export function getModelServices(brandName: string, modelName: string): ModelService[] {
  const entry = MODELS_DATABASE.find(
    (e) => e.brand === brandName && e.model === modelName
  );
  return entry?.services ?? [];
}
