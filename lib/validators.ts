import { z } from "zod";

export const addressSchema = z.object({
  line1: z.string().trim().min(1, "Address is required"),
  country: z.string().trim().min(1, "Country is required"),
  province: z.string().trim().min(1, "Province is required"),
  city: z.string().trim().min(1, "City is required"),
});

export const orderItemSchema = z.object({
  itemId: z.string().trim().min(1),
  name: z.string().trim().min(1),
  description: z.string(),
  price: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
});

export const cartLineSchema = z.object({
  itemId: z.string().trim().min(1),
  quantity: z.number().int().positive(),
});

export const checkoutRequestSchema = z.object({
  shippingAddress: addressSchema,
  lines: z.array(cartLineSchema).min(1),
  shippingCost: z.number().int().nonnegative(),
  promoCode: z.string().trim().toUpperCase().optional().nullable(),
});
