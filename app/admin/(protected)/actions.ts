"use server";

import { revalidatePath } from "next/cache";

export async function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/settings");
}
