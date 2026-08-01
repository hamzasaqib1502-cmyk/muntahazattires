"use server";

import { revalidatePath } from "next/cache";

export async function revalidateCatalog(slug: string) {
  revalidatePath("/");
  revalidatePath(`/category/${slug}`);
  revalidatePath(`/admin/category/${slug}`);
}
