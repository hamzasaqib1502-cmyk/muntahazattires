import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getCategories, getItems } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [categories, items] = await Promise.all([
    getCategories(),
    getItems(),
  ]);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let userFirstName: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("accounts")
      .select("first_name")
      .eq("id", user.id)
      .maybeSingle();
    userFirstName = data?.first_name ?? null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        categories={categories}
        items={items}
        userFirstName={userFirstName}
      />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} />
    </div>
  );
}
