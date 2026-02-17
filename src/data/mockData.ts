import { Product, ProductStatus, StoreUnit, ProductCategory, HistoryEntry, SofaDetails, SystemUser, SYSTEM_USERS, Manufacturer, MANUFACTURERS } from "@/types/inventory";

const systemUsers: SystemUser[] = ["ANA", "ALESSANDRA", "DEISE", "EDUARDA", "JOHNATTAN", "JULIANO", "LARISSA", "LUCAS", "LUIZA", "RODOLFO", "ROMUALDO", "VITOR"];

const names = [
  "Sofá Retrátil Florença", "Poltrona Giratória Oslo", "Cadeira de Jantar Milão",
  "Banqueta Alta Industrial", "Sofá 3 Lugares Nápoles", "Poltrona Decorativa Berna",
  "Cadeira Eames Réplica", "Banqueta Rústica Madeira", "Sofá Cama Zurique",
  "Poltrona Charles Eames", "Cadeira Estofada Paris", "Mesa de Centro Viena",
  "Sofá Chesterfield", "Poltrona Egg Swan", "Banqueta Tolix Metal",
  "Cadeira Bertoia Cromada", "Sofá Modular Lisboa", "Poltrona Barcelona",
];

const categories: ProductCategory[] = ["Sofá", "Poltrona", "Cadeira", "Banqueta", "Mesa", "Outros"];
const units: StoreUnit[] = ["Shopping Praça Nova", "Camobi", "Estoque"];
const statuses: ProductStatus[] = ["Disponível", "Vendido", "Pedido", "Reservado"];
const colors = ["Cinza", "Bege", "Marrom", "Preto", "Azul", "Verde", "Terracota"];
const fabrics = ["Veludo", "Linho", "Suede", "Couro", "Chenille", "Boucle"];
const manufacturers = ["DallaCosta",
  "Artesano", "Mobly", "Muma", "Oppa", "Westwing"];

const sofaImages = [
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop",
];

const chairImages = [
  "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=300&fit=crop",
];

const armchairImages = [
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=300&fit=crop",
];

const stoolImages = [
  "https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=300&fit=crop",
];

const tableImages = [
  "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400&h=300&fit=crop",
];

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateSKU(i: number) {
  return `LC-${String(i + 1).padStart(4, "0")}`;
}

function getImageForCategory(category: ProductCategory): string {
  switch (category) {
    case "Sofá": return sofaImages[Math.floor(Math.random() * sofaImages.length)];
    case "Poltrona": return armchairImages[Math.floor(Math.random() * armchairImages.length)];
    case "Cadeira": return chairImages[Math.floor(Math.random() * chairImages.length)];
    case "Banqueta": return stoolImages[Math.floor(Math.random() * stoolImages.length)];
    case "Mesa": return tableImages[Math.floor(Math.random() * tableImages.length)];
    default: return sofaImages[0];
  }
}

function generateSofaDetails(): SofaDetails {
  return {
    size: `${(Math.random() * 1.5 + 1.5).toFixed(2)}m`,
    fabric: fabrics[Math.floor(Math.random() * fabrics.length)],
    manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
    seats: Math.floor(Math.random() * 4) + 2,
  };
}

export function generateMockProducts(): Product[] {
  return names.map((name, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const unit = units[Math.floor(Math.random() * units.length)];
    const category = categories.find(c => name.toLowerCase().includes(c.toLowerCase())) || "Outros";
    const createdAt = randomDate(new Date("2024-09-01"), new Date("2025-01-15"));
    const createdByUser = systemUsers[Math.floor(Math.random() * systemUsers.length)];

    const history: HistoryEntry[] = [
      {
        id: `h-${i}-1`,
        action: "CREATED",
        user: createdByUser,
        timestamp: createdAt.toISOString(),
        details: {
          reason: `Produto cadastrado na unidade ${unit}`,
        },
      },
    ];

    if (status === "Vendido") {
      const soldDate = randomDate(createdAt, new Date());
      const soldByUser = systemUsers[Math.floor(Math.random() * systemUsers.length)];
      history.push({
        id: `h-${i}-2`,
        action: "STATUS_CHANGED",
        user: soldByUser,
        timestamp: soldDate.toISOString(),
        details: {
          oldStatus: "Disponível",
          newStatus: "Vendido",
          reason: `Marcado como vendido`,
        },
      });
    }

    const product: Product = {
      id: `p-${i + 1}`,
      sku: generateSKU(i),
      name,
      category: category as ProductCategory,
      status,
      unit,
      // price field removed
      color: colors[Math.floor(Math.random() * colors.length)],
      description: `${name} de alta qualidade. Perfeito para ambientes modernos e aconchegantes.`,
      imageUrl: getImageForCategory(category as ProductCategory),
      manufacturer: MANUFACTURERS[Math.floor(Math.random() * MANUFACTURERS.length)],
      createdAt: createdAt.toISOString(),
      createdBy: createdByUser,
      updatedAt: new Date().toISOString(),
      soldBy: status === "Vendido" ? systemUsers[Math.floor(Math.random() * systemUsers.length)] : undefined,
      soldAt: status === "Vendido" ? randomDate(createdAt, new Date()).toISOString() : undefined,
      soldUnit: status === "Vendido" ? unit : undefined,
      history,
    };

    // Adiciona detalhes específicos para sofás
    if (category === "Sofá") {
      product.sofaDetails = generateSofaDetails();
    }

    return product;
  });
}
