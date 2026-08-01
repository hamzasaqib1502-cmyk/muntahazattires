export type Category = {
  slug: string;
  displayName: string;
  heroImage: string;
  heroCaption?: string | null;
};

export type Item = {
  id: string;
  categorySlug: string;
  name: string;
  price: number;
  stock: number;
  announcement?: string | null;
  description: string;
  images: string[];
  createdAt: string;
};

export type CartLine = {
  itemId: string;
  quantity: number;
};

export type Address = {
  line1: string;
  country: string;
  province: string;
  city: string;
};

export type Account = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: "customer" | "admin";
  addresses: Address[];
};

export type ShippingRate = {
  country: string;
  province?: string | null;
  cost: number;
};

export type PromoCode = {
  code: string;
  type: "percent" | "flat";
  value: number;
  active: boolean;
};

export type OrderItem = {
  itemId: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
};

export type OrderStatus = "placed" | "processing" | "shipped" | "delivered";

export type Order = {
  id: string;
  accountId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address;
  items: OrderItem[];
  shippingCost: number;
  promoCode?: string | null;
  discount: number;
  totalPrice: number;
  paymentMethod: "COD";
  status: OrderStatus;
  createdAt: string;
};

export const CATEGORY_SLUGS = [
  "stitched",
  "unstitched",
  "other-brands-sale",
  "bottoms",
  "new-arrivals",
  "co-ords",
] as const;
