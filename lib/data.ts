import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { defaultCategories } from "@/lib/categories";
import { defaultItems } from "@/lib/items";
import type { Category, Item, Order, ShippingRate } from "@/lib/types";

type CategoryRow = {
  slug: string;
  display_name: string;
  hero_image: string;
  hero_caption: string | null;
};

type ItemRow = {
  id: string;
  category_slug: string;
  name: string;
  price: number;
  stock: number;
  announcement: string | null;
  description: string;
  images: string[];
  created_at: string;
};

function mapCategory(row: CategoryRow): Category {
  return {
    slug: row.slug,
    displayName: row.display_name,
    heroImage: row.hero_image,
    heroCaption: row.hero_caption,
  };
}

function mapItem(row: ItemRow): Item {
  return {
    id: row.id,
    categorySlug: row.category_slug,
    name: row.name,
    price: row.price,
    stock: row.stock,
    announcement: row.announcement,
    description: row.description,
    images: row.images ?? [],
    createdAt: row.created_at,
  };
}

// These fall back to the static defaults (lib/categories.ts, lib/items.ts)
// if Supabase is unreachable, so the storefront stays browsable during dev.
export const getCategories = cache(async (): Promise<Category[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("slug");

    if (error || !data) throw error;
    return data.map(mapCategory);
  } catch {
    return defaultCategories;
  }
});

export const getCategory = cache(
  async (slug: string): Promise<Category | null> => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error || !data) throw error;
      return mapCategory(data);
    } catch {
      return defaultCategories.find((c) => c.slug === slug) ?? null;
    }
  },
);

export const getItems = cache(
  async (categorySlug?: string): Promise<Item[]> => {
    try {
      const supabase = await createClient();
      let query = supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

      if (categorySlug) {
        query = query.eq("category_slug", categorySlug);
      }

      const { data, error } = await query;

      if (error || !data) throw error;
      return data.map(mapItem);
    } catch {
      if (categorySlug) {
        return defaultItems.filter((i) => i.categorySlug === categorySlug);
      }
      return defaultItems;
    }
  },
);

export const getItem = cache(async (id: string): Promise<Item | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) throw error;
    return mapItem(data);
  } catch {
    return defaultItems.find((i) => i.id === id) ?? null;
  }
});

export const getHeroSettings = cache(async () => {
  const defaults = {
    heading: "Elegance in Every Thread",
    subheading:
      "Stitched, unstitched, co-ords, and more — curated for the modern Pakistani woman.",
    image: "/images/hero.jpg",
    imageMobile: "/images/hero.jpg",
  };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("key,value");

    if (error || !data) throw error;
    const values = Object.fromEntries(data.map((row) => [row.key, row.value]));

    return {
      heading: values.hero_heading ?? defaults.heading,
      subheading: values.hero_subheading ?? defaults.subheading,
      image: values.hero_image ?? defaults.image,
      imageMobile: values.hero_image_mobile ?? defaults.imageMobile,
    };
  } catch {
    return defaults;
  }
});

type ShippingRateRow = {
  country: string;
  province: string | null;
  cost: number;
};

export const getShippingRates = cache(async (): Promise<ShippingRate[]> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("shipping_rates")
      .select("country,province,cost")
      .order("country");

    if (error || !data) throw error;
    return data.map((row: ShippingRateRow) => ({
      country: row.country,
      province: row.province,
      cost: row.cost,
    }));
  } catch {
    return [];
  }
});

type OrderRow = {
  id: string;
  account_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: {
    line1: string;
    country: string;
    province: string;
    city: string;
  };
  items: {
    itemId: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
  }[];
  shipping_cost: number;
  promo_code: string | null;
  discount: number;
  total_price: number;
  payment_method: "COD";
  status: Order["status"];
  created_at: string;
};

export function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    accountId: row.account_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    shippingAddress: row.shipping_address,
    items: row.items,
    shippingCost: row.shipping_cost,
    promoCode: row.promo_code,
    discount: row.discount,
    totalPrice: row.total_price,
    paymentMethod: row.payment_method,
    status: row.status,
    createdAt: row.created_at,
  };
}

export const getOrder = cache(async (id: string): Promise<Order | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) throw error;
    return mapOrder(data);
  } catch {
    return null;
  }
});

export const getItemCoverImages = cache(
  async (itemIds: string[]): Promise<Record<string, string>> => {
    if (itemIds.length === 0) return {};
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("items")
        .select("id,images")
        .in("id", itemIds);

      if (error || !data) throw error;
      return Object.fromEntries(
        data
          .filter((row) => row.images && row.images.length > 0)
          .map((row) => [row.id, row.images[0]]),
      );
    } catch {
      return {};
    }
  },
);
