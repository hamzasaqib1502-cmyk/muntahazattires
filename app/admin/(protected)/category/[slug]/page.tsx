import { notFound } from "next/navigation";
import { getCategory, getItems } from "@/lib/data";
import { CategoryManager } from "@/components/admin/CategoryManager";

export default async function AdminCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, items] = await Promise.all([
    getCategory(slug),
    getItems(slug),
  ]);
  if (!category) notFound();

  return (
    <CategoryManager category={category} initialItems={items} />
  );
}
