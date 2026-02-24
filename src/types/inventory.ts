export type ProductStatus = "Disponível" | "Vendido" | "Pedido" | "Reservado";
export type ProductCategory = "Sofá" | "Poltrona" | "Cadeira" | "Banqueta" | "Mesa" | "Outros";
export type StoreUnit = "Shopping Praça Nova" | "Camobi" | "Estoque";

export type SystemUser = 
  | "ANA" 
  | "ALESSANDRA" 
  | "DEISE" 
  | "EDUARDA" 
  | "JOHNATTAN" 
  | "JULIANO" 
  | "LARISSA" 
  | "LUCAS" 
  | "LUIZA" 
  | "RODOLFO" 
  | "ROMUALDO" 
  | "VITOR";

export const SYSTEM_USERS: SystemUser[] = [
  "ANA",
  "ALESSANDRA",
  "DEISE",
  "EDUARDA",
  "JOHNATTAN",
  "JULIANO",
  "LARISSA",
  "LUCAS",
  "LUIZA",
  "RODOLFO",
  "ROMUALDO",
  "VITOR",
];

export type Manufacturer = "Tokstok" | "Etna" | "Mobly" | "Muma" | "Oppa" | "Westwing";

export const MANUFACTURERS: Manufacturer[] = [
  "DallaCosta",
  "Artesano",
  "Mobly",
  "Muma",
  "Oppa",
  "Westwing",
];

export type SalesUser = "ANA" | "ALESSANDRA" | "DEISE" | "EDUARDA" | "JOHNATTAN" | "JULIANO" | "LARISSA" | "LUCAS" | "LUIZA" | "RODOLFO" | "ROMUALDO" | "VITOR";

export const SALES_USERS: SalesUser[] = SYSTEM_USERS;

export interface SofaDetails {
  size: string;
  fabric: string;
  manufacturer: Manufacturer;
  seats: number;
}

export interface HistoryEntry {
  id: string;
  action: "CREATED" | "STATUS_CHANGED" | "TRANSFERRED" | "UPDATED" | "DELETED" | "DELIVERY_INFO_SET";
  user: SystemUser;
  timestamp: string;
  details: {
    reason?: string;
    oldValue?: string;
    newValue?: string;
    fromUnit?: StoreUnit;
    toUnit?: StoreUnit;
    oldStatus?: string;
    newStatus?: string;
    oldUnit?: StoreUnit;
    newUnit?: StoreUnit;
  };
}

export interface OrderDetails {
  orderId: string;
  amount: number;
  currency: string;
  orderedDate: string;
  expectedDelivery?: string;
  supplier?: string;
  notes?: string;
}

export interface Product {
  id: string;
  sku: string;
  noteId?: string; // Agrupa múltiplos produtos do mesmo pedido/nota
  name: string;
  category: ProductCategory;
  color: string;
  price: number;
  unit: StoreUnit;
  status: ProductStatus;
  image: string;
  sofaDetails: SofaDetails;
  createdAt: string;
  updatedAt: string;
  createdBy: SystemUser;
  soldAt?: string;
  soldBy?: SalesUser;
  soldUnit?: StoreUnit;
  soldPrice?: number;
  reservedBy?: SystemUser;
  reservedAt?: string;
  orderDetails?: OrderDetails;
  // Delivery information
  deliveryAddress?: string;
  deliveryReferencePoint?: string;
  deliveryType?: "Casa" | "Apartamento";
  deliveryFloor?: string;
  deliveryAccess?: "Escada" | "Elevador";
  deliveryStatus?: "Pendente" | "Em Rota" | "Entregue";
  deliveredAt?: string;
  history: HistoryEntry[];
}
