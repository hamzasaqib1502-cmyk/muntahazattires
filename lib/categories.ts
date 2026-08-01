import type { Category } from "@/lib/types";

// Static defaults used until Supabase wiring lands (Phase 6). Phase 3+
// replaces this with a DB fetch of the categories table.
export const defaultCategories: Category[] = [
  {
    slug: "stitched",
    displayName: "Stitched",
    heroImage: "/images/categories/stitched.jpg",
    heroCaption: null,
  },
  {
    slug: "unstitched",
    displayName: "Unstitched",
    heroImage: "/images/categories/unstitched.jpg",
    heroCaption: null,
  },
  {
    slug: "other-brands-sale",
    displayName: "Other Brands Sale",
    heroImage: "/images/categories/other-brands-sale.jpg",
    heroCaption: null,
  },
  {
    slug: "bottoms",
    displayName: "Bottoms",
    heroImage: "/images/categories/bottoms.jpg",
    heroCaption: null,
  },
  {
    slug: "new-arrivals",
    displayName: "New Arrivals",
    heroImage: "/images/categories/new-arrivals.jpg",
    heroCaption: null,
  },
  {
    slug: "co-ords",
    displayName: "Co-Ords",
    heroImage: "/images/categories/co-ords.jpg",
    heroCaption: null,
  },
];
