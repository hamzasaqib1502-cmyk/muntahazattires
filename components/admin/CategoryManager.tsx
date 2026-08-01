"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { revalidateCatalog } from "@/app/admin/(protected)/category/[slug]/actions";
import { CategoryTeaserEditor } from "@/components/admin/CategoryTeaserEditor";
import { ItemForm } from "@/components/admin/ItemForm";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/formatCurrency";
import type { Category, Item } from "@/lib/types";

export function CategoryManager({
  category,
  initialItems,
}: {
  category: Category;
  initialItems: Item[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [items, setItems] = useState<Item[]>(initialItems);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState<Item | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  async function refresh(slug: string) {
    await revalidateCatalog(slug);
    router.refresh();
  }

  function handleSaved(saved: Item) {
    setItems((current) => {
      const exists = current.some((item) => item.id === saved.id);
      return exists
        ? current.map((item) => (item.id === saved.id ? saved : item))
        : [saved, ...current];
    });
    setFormOpen(false);
    setEditing(null);
    void refresh(category.slug);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeletingBusy(true);

    const { error } = await supabase
      .from("items")
      .delete()
      .eq("id", deleting.id);

    if (!error) {
      for (const url of deleting.images) {
        const pathMatch = url.match(/product-images\/(.+)$/);
        if (pathMatch) {
          await supabase.storage.from("product-images").remove([pathMatch[1]]);
        }
      }
      setItems((current) => current.filter((item) => item.id !== deleting.id));
      setDeleting(null);
      void refresh(category.slug);
    }

    setDeletingBusy(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
            Catalog
          </p>
          <h1 className="mt-2 font-serif text-3xl text-black">{category.slug}</h1>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="mt-6">
        <CategoryTeaserEditor category={category} />
      </div>

      <div className="mt-10">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
          Items
        </p>

        {items.length === 0 ? (
          <p className="mt-4 border border-gray-200 bg-white px-5 py-10 text-sm text-gray-500">
            No items in this category yet. Add your first one.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-medium uppercase tracking-widest text-gray-500">
                  <th className="px-4 py-3 font-medium">Image</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <div className="relative h-14 w-11 overflow-hidden bg-gray-100">
                        <Image
                          src={item.images[0] ?? "/logo.png"}
                          alt=""
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-black">{item.name}</p>
                      {item.announcement && (
                        <p className="text-xs uppercase tracking-widest text-gray-400">
                          {item.announcement}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-black">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          item.stock === 0
                            ? "text-gray-400"
                            : item.stock < 5
                              ? "font-medium text-black"
                              : "text-gray-700"
                        }
                      >
                        {item.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditing(item);
                            setFormOpen(true);
                          }}
                          aria-label={`Edit ${item.name}`}
                          className="p-2 text-gray-500 transition-colors hover:text-black"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleting(item)}
                          aria-label={`Delete ${item.name}`}
                          className="p-2 text-gray-500 transition-colors hover:text-black"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ItemForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        categorySlug={category.slug}
        initial={editing}
        onSaved={handleSaved}
      />

      <Modal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Delete item?"
      >
        {deleting && (
          <>
            <p className="text-sm leading-6 text-gray-600">
              &ldquo;{deleting.name}&rdquo; will be permanently removed from
              the store and its images deleted.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setDeleting(null)}
                disabled={deletingBusy}
              >
                Cancel
              </Button>
              <Button onClick={confirmDelete} disabled={deletingBusy}>
                {deletingBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
