import type { Item } from "@/lib/types";

// Static placeholder catalog used until Supabase wiring lands (Phase 6),
// after which the category pages / navbar search read from the items table.
export const defaultItems: Item[] = [
  // --- stitched ---
  {
    id: "stitched-sana-lawn",
    categorySlug: "stitched",
    name: "Sana Lawn Embroidered Suit",
    price: 7890,
    stock: 12,
    announcement: "New Arrival",
    description:
      "A lightweight lawn three-piece with delicate threadwork on the neckline and sleeves.",
    images: ["/images/items/stitched-1.jpg"],
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: "stitched-mariam-silk",
    categorySlug: "stitched",
    name: "Mariam Silk Kameez",
    price: 9450,
    stock: 5,
    announcement: null,
    description:
      "Pure silk kameez with a subtle sheen, cut for an easy everyday silhouette.",
    images: ["/images/items/stitched-2.jpg"],
    createdAt: "2026-06-15T00:00:00.000Z",
  },
  {
    id: "stitched-ayesha-chiffon",
    categorySlug: "stitched",
    name: "Ayesha Chiffon Shirt",
    price: 6750,
    stock: 0,
    announcement: "Sale",
    description:
      "Flowing chiffon shirt with printed detail — a graceful choice for evening wear.",
    images: ["/images/items/stitched-3.jpg"],
    createdAt: "2026-05-20T00:00:00.000Z",
  },

  // --- unstitched ---
  {
    id: "unstitched-shalimar",
    categorySlug: "unstitched",
    name: "Shalimar 3-Piece Unstitched",
    price: 4290,
    stock: 25,
    announcement: "New Arrival",
    description:
      "Unstitched lawn suit with embroidered dupatta — tailor it to your fit.",
    images: ["/images/items/unstitched-1.jpg"],
    createdAt: "2026-07-05T00:00:00.000Z",
  },
  {
    id: "unstitched-gulnaz",
    categorySlug: "unstitched",
    name: "Gulnaz Lawn Suit",
    price: 3850,
    stock: 18,
    announcement: null,
    description:
      "Classic unstitched lawn suit in a breathable weave, ideal for summer.",
    images: ["/images/items/unstitched-2.jpg"],
    createdAt: "2026-06-10T00:00:00.000Z",
  },
  {
    id: "unstitched-mughal-heritage",
    categorySlug: "unstitched",
    name: "Mughal Heritage Suit",
    price: 5400,
    stock: 7,
    announcement: null,
    description:
      "Inspired by timeless Mughal motifs, this unstitched suit comes with a matching trouser.",
    images: ["/images/items/unstitched-3.jpg"],
    createdAt: "2026-05-01T00:00:00.000Z",
  },

  // --- other-brands-sale ---
  {
    id: "sale-branded-saree",
    categorySlug: "other-brands-sale",
    name: "Branded Saree — Sale",
    price: 6900,
    stock: 9,
    announcement: "Sale",
    description:
      "Select brand sarees at marked-down prices while stock lasts.",
    images: ["/images/items/other-brands-sale-1.jpg"],
    createdAt: "2026-06-25T00:00:00.000Z",
  },
  {
    id: "sale-pret-shirt",
    categorySlug: "other-brands-sale",
    name: "Pret Collection Shirt",
    price: 2990,
    stock: 14,
    announcement: "Sale",
    description:
      "Ready-to-wear pret shirt from our partner brands, priced for quick sale.",
    images: ["/images/items/other-brands-sale-2.jpg"],
    createdAt: "2026-06-20T00:00:00.000Z",
  },

  // --- bottoms ---
  {
    id: "bottoms-plain-trouser",
    categorySlug: "bottoms",
    name: "Plain Trouser",
    price: 1890,
    stock: 30,
    announcement: null,
    description:
      "Everyday plain trouser in comfortable cotton with a flattering fit.",
    images: ["/images/items/bottoms-1.jpg"],
    createdAt: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "bottoms-embroidered-capri",
    categorySlug: "bottoms",
    name: "Embroidered Capri Pants",
    price: 2450,
    stock: 16,
    announcement: "New Arrival",
    description:
      "Capri pants finished with a touch of embroidery at the hem.",
    images: ["/images/items/bottoms-2.jpg"],
    createdAt: "2026-07-02T00:00:00.000Z",
  },
  {
    id: "bottoms-chiffon-palazzo",
    categorySlug: "bottoms",
    name: "Chiffon Palazzo",
    price: 2750,
    stock: 8,
    announcement: null,
    description:
      "Wide-leg palazzo in airy chiffon — pairs with any of our kameez.",
    images: ["/images/items/bottoms-3.jpg"],
    createdAt: "2026-05-18T00:00:00.000Z",
  },

  // --- new-arrivals ---
  {
    id: "new-sitara-festive",
    categorySlug: "new-arrivals",
    name: "Sitara Festive Suit",
    price: 11200,
    stock: 6,
    announcement: "New Arrival",
    description:
      "Our newest festive silhouette — rich detailing made for special occasions.",
    images: ["/images/items/new-arrivals-1.jpg", "/images/items/new-arrivals-2.jpg"],
    createdAt: "2026-07-10T00:00:00.000Z",
  },
  {
    id: "new-zeba-khaddar",
    categorySlug: "new-arrivals",
    name: "Zeba Khaddar Kameez",
    price: 5350,
    stock: 11,
    announcement: "New Arrival",
    description:
      "Khaddar kameez with a soft finish — new to the collection this week.",
    images: ["/images/items/new-arrivals-2.jpg"],
    createdAt: "2026-07-08T00:00:00.000Z",
  },

  // --- co-ords ---
  {
    id: "coords-luna",
    categorySlug: "co-ords",
    name: "Luna Co-ord Set",
    price: 8450,
    stock: 4,
    announcement: null,
    description:
      "A matching co-ord set with a tailored top and trousers in one print.",
    images: ["/images/items/co-ords-1.jpg", "/images/items/co-ords-2.jpg"],
    createdAt: "2026-06-22T00:00:00.000Z",
  },
  {
    id: "coords-hera",
    categorySlug: "co-ords",
    name: "Hera 2-Piece Co-ord",
    price: 7290,
    stock: 9,
    announcement: "New Arrival",
    description:
      "Two-piece co-ord with clean lines — easy to dress up or down.",
    images: ["/images/items/co-ords-2.jpg"],
    createdAt: "2026-07-03T00:00:00.000Z",
  },
  {
    id: "coords-noor-festival",
    categorySlug: "co-ords",
    name: "Noor Festival Co-ord",
    price: 9800,
    stock: 3,
    announcement: null,
    description:
      "Festival-ready co-ord set with elevated detailing throughout.",
    images: ["/images/items/co-ords-3.jpg"],
    createdAt: "2026-06-28T00:00:00.000Z",
  },
];
