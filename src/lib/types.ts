import type { CategoryId, PaymentMethodId, PickupPointId } from "./config";

export type ArtKind =
  | "tomato"
  | "onion"
  | "pepper"
  | "carrot"
  | "cabbage"
  | "leaf"
  | "plantain"
  | "banana"
  | "orange"
  | "pineapple"
  | "sack"
  | "egg"
  | "bottle"
  | "bread"
  | "jar"
  | "box"
  | "chicken"
  | "beans";

export interface Product {
  id: string;
  name: string;
  unit: string; // "1 kg", "crate of 30"
  category: CategoryId;
  price: number; // our price
  marketPrice: number; // typical price at the open market / supermarket
  stock: number;
  farm: string;
  art: ArtKind;
  image?: string; // optional real photo in /public/products
  description?: string;
  active: boolean;
  supplierId?: string; // linked supplier (farm / maker); `farm` shows its name
  bundle?: BundleItem[]; // for boxes: what goes in one box
}

/** One component of a box, in the component product's own unit (0.4 of a 5 kg bag = 2 kg). */
export interface BundleItem {
  productId: string;
  qty: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  phone?: string;
  location?: string;
  notes?: string;
}

export interface OrderLine {
  productId: string;
  name: string;
  unit: string;
  price: number;
  marketPrice: number;
  qty: number;
}

export const orderStatuses = ["received", "confirmed", "packed", "ready", "collected", "cancelled"] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export interface Order {
  id: string;
  code: string; // short code shown at pickup, e.g. CB-7K3Q
  createdAt: string;
  dropDate: string; // ISO date of the pickup day
  customer: {
    name: string;
    phone: string;
    studentId?: string;
  };
  pickupPoint: PickupPointId;
  payment: PaymentMethodId;
  notes?: string;
  lines: OrderLine[];
  total: number;
  marketTotal: number;
  status: OrderStatus;
}
