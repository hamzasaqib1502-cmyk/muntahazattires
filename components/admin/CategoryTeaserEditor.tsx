"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { revalidateCatalog } from "@/app/admin/(protected)/category/[slug]/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Category } from "@/lib/types";

type Message = {
  kind: "success" | "error";
  text: string;
};

function storagePath(prefix: string, base: string, extension: string) {
  const folder = [prefix, base].filter(Boolean).join("/");
  return `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${extension}`;
}

export function CategoryTeaserEditor({ category }: { category: Category }) {
  const router = useRouter();
  const supabase = createClient();
  const [displayName, setDisplayName] = useState(category.displayName);
  const [heroImage, setHeroImage] = useState(category.heroImage);
  const [heroCaption, setHeroCaption] = useState(category.heroCaption ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  async function uploadImage(file: File) {
    setUploading(true);
    setMessage(null);
    try {
      const extension = file.name.split(".").pop() ?? "jpg";
      const path = storagePath("categories", category.slug, extension);
      const { error } = await supabase.storage
        .from("site-images")
        .upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("site-images").getPublicUrl(path);
      setHeroImage(data.publicUrl);
    } catch (e) {
      setMessage({
        kind: "error",
        text: e instanceof Error ? e.message : "Could not upload the image.",
      });
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!displayName.trim()) {
      setMessage({ kind: "error", text: "Display name is required." });
      return;
    }
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from("categories")
      .update({
        display_name: displayName.trim(),
        hero_caption: heroCaption.trim() || null,
        hero_image: heroImage,
      })
      .eq("slug", category.slug);

    if (error) {
      setMessage({ kind: "error", text: error.message });
      setSaving(false);
      return;
    }
    setMessage({ kind: "success", text: "Saved." });
    setSaving(false);
    await revalidateCatalog(category.slug);
    router.refresh();
  }

  return (
    <section className="border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-widest text-black">
            Category Teaser
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Image, caption, and display name shown on the homepage teaser
            section for this category.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button
            onClick={() => void save()}
            disabled={saving || uploading}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
          {message && (
            <p
              className={`flex items-center gap-1.5 text-xs ${
                message.kind === "success" ? "text-gray-600" : "text-red-600"
              }`}
            >
              {message.kind === "success" && <Check className="h-3.5 w-3.5" />}
              {message.text}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[200px_1fr]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt=""
            className="aspect-[3/4] w-40 border border-gray-200 object-cover"
          />
          <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 border border-black px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest text-black transition-colors hover:bg-gray-100">
            <Upload className="h-3.5 w-3.5" />
            {uploading ? "Uploading…" : "Upload"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadImage(file);
              }}
            />
          </label>
        </div>

        <div className="space-y-4">
          <Input
            label="Display name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
          <div>
            <label className="text-xs font-medium uppercase tracking-widest text-gray-500">
              Caption (optional)
            </label>
            <textarea
              value={heroCaption}
              onChange={(event) => setHeroCaption(event.target.value)}
              rows={3}
              className="mt-1.5 w-full resize-y border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
