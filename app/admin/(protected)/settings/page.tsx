import { createClient } from "@/lib/supabase/server";
import { ManageHero } from "@/components/admin/ManageHero";
import { ManageShipping } from "@/components/admin/ManageShipping";
import { ManagePromos } from "@/components/admin/ManagePromos";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const [
    { data: settings },
    { data: shipping },
    { data: promos },
  ] = await Promise.all([
    supabase.from("site_settings").select("key,value"),
    supabase
      .from("shipping_rates")
      .select("id,country,province,cost")
      .order("country")
      .order("province", { nullsFirst: true }),
    supabase.from("promo_codes").select("code,type,value,active").order("code"),
  ]);

  const heroMap = Object.fromEntries(
    (settings ?? []).map((row) => [row.key, row.value]),
  );

  const heroImage = heroMap.hero_image ?? "/images/hero.jpg";
  const heroImageMobile = heroMap.hero_image_mobile ?? "/images/hero.jpg";

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
          Site Content
        </p>
        <h1 className="mt-2 font-serif text-3xl text-black">Settings</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
          Edit the homepage hero, shipping rates, and promo codes. Changes
          publish to the storefront immediately.
        </p>
      </header>

      <div className="grid items-start gap-10 xl:grid-cols-2">
        <ManageHero
          initialHeading={heroMap.hero_heading ?? "Elegance in Every Thread"}
          initialSubheading={
            heroMap.hero_subheading ??
            "Stitched, unstitched, co-ords, and more — curated for the modern Pakistani woman."
          }
          initialImage={heroImage}
          initialImageMobile={heroImageMobile}
        />
      </div>

      <div className="grid items-start gap-10 xl:grid-cols-2">
        <ManageShipping
          initial={
            shipping?.map((rate) => ({
              id: rate.id,
              country: rate.country,
              province: rate.province,
              cost: rate.cost,
            })) ?? []
          }
        />
        <ManagePromos
          initial={
            promos?.map((promo) => ({
              code: promo.code,
              type: promo.type,
              value: promo.value,
              active: promo.active,
            })) ?? []
          }
        />
      </div>
    </div>
  );
}
