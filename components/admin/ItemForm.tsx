"use client";

import { useState } from "react";
import { Loader2, Star, Trash2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Item } from "@/lib/types";

function randomSuffix(length: number) {
  return Math.random().toString(36).slice(2, 2 + length);
}

function storagePath(prefix: string, base: string, extension: string) {
  const folder = [prefix, base].filter(Boolean).join("/");
  return `${folder}/${Date.now()}-${randomSuffix(6)}.${extension}`;
}

function mapRow(row: {
  id: string;
  category_slug: string;
  name: string;
  price: number;
  stock: number;
  announcement: string | null;
  description: string;
  images: string[];
  created_at: string;
}): Item {
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

export function ItemForm({
  open,
  onClose,
  categorySlug,
  initial,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  categorySlug: string;
  initial?: Item | null;
  onSaved: (item: Item) => void;
}) {
  const supabase = createClient();
  const isEdit = Boolean(initial);

  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [stock, setStock] = useState(initial ? String(initial.stock) : "");
  const [announcement, setAnnouncement] = useState(
    initial?.announcement ?? "",
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    const bucket = "product-images";

    try {
      const base = initial?.id ?? `new-${randomSuffix(8)}`;
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const extension = file.name.split(".").pop() ?? "jpg";
        const path = storagePath(categorySlug, base, extension);
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(path, file, { upsert: false });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      setImages((current) => [...current, ...uploaded]);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not upload the image(s).",
      );
    } finally {
      setUploading(false);
    }
  }

  async function removeImage(url: string) {
    setImages((current) => current.filter((image) => image !== url));
  }

  function makeCover(url: string) {
    setImages((current) => [
      url,
      ...current.filter((image) => image !== url),
    ]);
  }

  async function save() {
    const parsedPrice = Number(price);
    const parsedStock = Number(stock);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!Number.isInteger(parsedPrice) || parsedPrice < 0) {
      setError("Price must be a whole number of rupees.");
      return;
    }
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      setError("Stock must be a whole number.");
      return;
    }
    if (images.length === 0) {
      setError("At least one image is required.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      name: name.trim(),
      price: parsedPrice,
      stock: parsedStock,
      announcement: announcement.trim() || null,
      description: description.trim(),
      images,
    };

    if (isEdit && initial) {
      const { data, error: updateError } = await supabase
        .from("items")
        .update(payload)
        .eq("id", initial.id)
        .select()
        .single();
      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
      onSaved(mapRow(data));
    } else {
      const slugBase = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const id = `${slugBase || "item"}-${randomSuffix(4)}`;
      const { data, error: insertError } = await supabase
        .from("items")
        .insert({
          id,
          category_slug: categorySlug,
          ...payload,
        })
        .select()
        .single();
      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }
      onSaved(mapRow(data));
    }
  }

  const inputClass =
    "w-full border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none";
  const labelClass =
    "text-xs font-medium uppercase tracking-widest text-gray-500";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Item" : "Add Item"}
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Item name"
            />
          </div>
          <div>
            <Input
              label="Price (Rs.)"
              type="number"
              min={0}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="e.g. 4990"
            />
          </div>
          <div>
            <Input
              label="Stock"
              type="number"
              min={0}
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              placeholder="e.g. 10"
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Announcement (optional)"
              value={announcement}
              onChange={(event) => setAnnouncement(event.target.value)}
              placeholder="e.g. NEW ARRIVAL / SALE"
            />
          </div>
          <div className="sm:col-span-2">
            <span className={labelClass}>Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="Fabric, fit, and details…"
              className={`${inputClass} mt-1.5 resize-y`}
            />
          </div>
        </div>

        <div>
          <span className={labelClass}>Images</span>
          {images.length > 0 && (
            <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {images.map((url, index) => (
                <li key={url} className="relative border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Image ${index + 1}`}
                    className="aspect-[3/4] w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-1.5 py-1">
                    <button
                      onClick={() => makeCover(url)}
                      title={index === 0 ? "Cover image" : "Make cover"}
                      className={`p-0.5 ${
                        index === 0
                          ? "text-white"
                          : "text-gray-300 hover:text-white"
                      }`}
                    >
                      <Star
                        className="h-3.5 w-3.5"
                        fill={index === 0 ? "currentColor" : "none"}
                      />
                    </button>
                    <button
                      onClick={() => removeImage(url)}
                      title="Remove image"
                      className="p-0.5 text-gray-300 transition-colors hover:text-white"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {index === 0 && (
                    <span className="absolute left-1 top-1 bg-black px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-widest text-white">
                      Cover
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

          <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 border border-dashed border-gray-300 px-4 py-4 text-sm text-gray-500 transition-colors hover:border-black hover:text-black">
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading…" : "Upload images"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              disabled={uploading}
              onChange={(event) => uploadFiles(event.target.files)}
            />
          </label>
          <p className="mt-1.5 text-xs text-gray-400">
            The first image is the cover shown on cards and listings.
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving || uploading}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Add Item"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
