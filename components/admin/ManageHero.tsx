"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { revalidateAll } from "@/app/admin/(protected)/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function storagePath(prefix: string, base: string, extension: string) {
  const folder = [prefix, base].filter(Boolean).join("/");
  return `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${extension}`;
}

type ImageField = "desktop" | "mobile";

function HeroImageField({
  field,
  label,
  hint,
  src,
  uploading,
  onUpload,
}: {
  field: ImageField;
  label: string;
  hint?: string;
  src: string;
  uploading: boolean;
  onUpload: (field: ImageField, file: File) => void;
}) {
  return (
    <div>
      <span className="text-xs font-medium uppercase tracking-widest text-gray-500">
        {label}
      </span>
      {hint && <p className="mt-1 text-xs leading-5 text-gray-400">{hint}</p>}
      <div className="mt-2 flex items-start gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`${label} preview`}
          className="h-24 w-40 border border-gray-200 object-cover"
        />
        <label className="inline-flex cursor-pointer items-center gap-2 border border-black px-4 py-2 text-xs font-medium uppercase tracking-widest text-black transition-colors hover:bg-gray-100">
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading…" : "Upload"}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onUpload(field, file);
            }}
          />
        </label>
      </div>
    </div>
  );
}

export function ManageHero({
  initialHeading,
  initialSubheading,
  initialImage,
  initialImageMobile,
}: {
  initialHeading: string;
  initialSubheading: string;
  initialImage: string;
  initialImageMobile: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [heading, setHeading] = useState(initialHeading);
  const [subheading, setSubheading] = useState(initialSubheading);
  const [image, setImage] = useState(initialImage);
  const [imageMobile, setImageMobile] = useState(initialImageMobile);
  const [uploadingField, setUploadingField] = useState<ImageField | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  async function uploadImage(field: ImageField, file: File) {
    setUploadingField(field);
    setMessage(null);
    try {
      const extension = file.name.split(".").pop() ?? "jpg";
      const path = storagePath("hero", field, extension);
      const { error } = await supabase.storage
        .from("site-images")
        .upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("site-images").getPublicUrl(path);
      if (field === "desktop") setImage(data.publicUrl);
      else setImageMobile(data.publicUrl);
    } catch (e) {
      setMessage({
        kind: "error",
        text: e instanceof Error ? e.message : "Could not upload the image.",
      });
    } finally {
      setUploadingField(null);
    }
  }

  async function save() {
    if (!heading.trim()) {
      setMessage({ kind: "error", text: "Heading is required." });
      return;
    }
    setSaving(true);
    setMessage(null);

    const rows = [
      { key: "hero_heading", value: heading.trim() },
      { key: "hero_subheading", value: subheading.trim() },
      { key: "hero_image", value: image },
      { key: "hero_image_mobile", value: imageMobile },
    ];
    const { error } = await supabase.from("site_settings").upsert(rows);
    if (error) {
      setMessage({ kind: "error", text: error.message });
      setSaving(false);
      return;
    }
    setMessage({ kind: "success", text: "Homepage hero updated." });
    setSaving(false);
    await revalidateAll();
    router.refresh();
  }

  return (
    <section className="border border-gray-200 bg-white p-6">
      <h2 className="text-sm font-medium uppercase tracking-widest text-black">
        Homepage Hero
      </h2>

      <div className="mt-5 space-y-4">
        <Input
          label="Heading"
          value={heading}
          onChange={(event) => setHeading(event.target.value)}
        />
        <div>
          <label className="text-xs font-medium uppercase tracking-widest text-gray-500">
            Subheading
          </label>
          <textarea
            value={subheading}
            onChange={(event) => setSubheading(event.target.value)}
            rows={2}
            className="mt-1.5 w-full resize-y border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none"
          />
        </div>

        <HeroImageField
          field="desktop"
          label="Desktop Image"
          hint="Shown on tablets and larger screens."
          src={image}
          uploading={uploadingField === "desktop"}
          onUpload={uploadImage}
        />

        <HeroImageField
          field="mobile"
          label="Mobile Image"
          hint="Shown on phones."
          src={imageMobile}
          uploading={uploadingField === "mobile"}
          onUpload={uploadImage}
        />

        {message && (
          <p
            className={`flex items-center gap-1.5 text-sm ${
              message.kind === "success" ? "text-gray-700" : "text-red-600"
            }`}
          >
            {message.kind === "success" && <Check className="h-4 w-4" />}
            {message.text}
          </p>
        )}

        <Button
          onClick={save}
          disabled={saving || uploadingField !== null}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Hero"}
        </Button>
      </div>
    </section>
  );
}
