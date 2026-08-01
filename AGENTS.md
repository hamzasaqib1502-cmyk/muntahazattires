# AGENT.md — Muntaha's Attires (E-Commerce Website)

> This is the master spec for opencode, working inside a **Next.js** project (App Router).
> Build phase by phase, in the order given below. Do not skip ahead. After each phase,
> the app should run and the features described should be visibly/functionally complete
> before moving to the next phase. Treat every "Phase" as its own mini-spec: read it in
> full, plan the file changes, then implement.

---

## 0. Project Summary

**Brand:** Muntaha's Attires
**Sells:** Traditional Pakistani clothing — women only.
**Stack:**
- **Next.js (App Router, TypeScript)** — use Server Components by default; mark a
  component `"use client"` only when it needs interactivity/state (cart widget, forms,
  carousel, admin forms, hamburger menu, etc.).
- **Tailwind CSS** for all styling.
- **Supabase is the entire backend** — Postgres database, Auth, and Storage, all in one
  project. Do not introduce Prisma, Firebase, NextAuth, or a separate Express server —
  Supabase replaces all of them:
  - **Database:** Supabase Postgres holds every table in Section 3 — categories, items,
    accounts (customer/admin info + addresses combined), shipping_rates, promo_codes,
    and orders (fully denormalized order records).
  - **Auth:** Supabase Auth (email + password, with email confirmation turned ON in
    Supabase's Auth settings) handles signup/login/session for customers AND for the
    admin (the admin is just a row in `accounts` with `role = 'admin'`, not a separate
    system).
  - **Storage:** Supabase Storage buckets hold every item image, category teaser image,
    the hero image, and the logo. No external image host needed.
  - **Row Level Security (RLS) must be enabled on every table**, with explicit policies
    — see Phase 6 for the full policy set. Do not leave any table with RLS disabled or
    with an "allow all" policy.
  - Use `@supabase/supabase-js` plus `@supabase/ssr` for cookie-based session handling
    across Server Components, Route Handlers, and `middleware.ts`.
- **State:** Zustand for client-side cart state (persisted to `localStorage` for guests,
  synced/merged with the account on login). Server data (catalog, orders, settings) is
  fetched via Server Components / Route Handlers calling Supabase — no need for a global
  client store for that.
- **Icons:** `lucide-react`.

**No animated/scroll-driven hero.** The hero section is a simple, static, full-bleed
background image with a heading, short subtext, and one CTA button. Do not add
parallax, scroll-triggered reveals, or any scroll-linked motion to it. Standard hover/
transition effects on buttons and product cards are fine and expected — just nothing
tied to scroll position.

**Why a database is required (not just local state):** the admin needs durable CRUD
over categories/items/site text/images, stock counts must be enforced server-side so
two customers can't oversell the last item, orders must be recorded and the admin
notified, and customer accounts/sessions must persist across visits. Supabase covers
all of this in one project — just make sure RLS policies are correct, since with RLS
enabled, Postgres blocks all access by default until a policy explicitly allows it.

---

## 1. Design System — Black & White Minimalist

The site is monochrome. Product photography supplies all the color on the page — the UI
itself (chrome, buttons, text, backgrounds) stays black, white, and gray. Do not add a
brand accent color (no purple/rust/gold) unless Muntaha explicitly asks for one later.

### Colors (Tailwind `theme.extend.colors`)
```js
colors: {
  white: '#ffffff',
  black: '#0a0a0a',       // near-black, not pure #000 (softer on large fills)
  gray: {
    50:  '#fafafa',
    100: '#f2f2f2',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#333333',
    800: '#1f1f1f',
    900: '#141414',
  },
}
```
- Page background: `white` (or `gray-50` for subtly separated sections).
- Body text: `gray-900`/`black`. Secondary/muted text: `gray-500`.
- Borders/dividers: `gray-200`.
- No color is used to convey status/state (e.g. "in stock") — use icons, weight, and
  text (e.g. a small dot + label, or strikethrough) instead of green/red.

### Typography
- Headings: an elegant serif (e.g. `"Playfair Display", serif`) — the one place the
  design gets personality, since color is off the table.
- Body/UI: a clean sans-serif (e.g. `"Inter", sans-serif`).
- Load both via `next/font/google` and register in `tailwind.config.ts` under
  `fontFamily: { serif: [...], sans: [...] }`.
- Prices always `font-sans font-semibold text-black`, prefixed `Rs.` with thousands
  separators (e.g. `Rs. 5,290`). No accent color on price — weight/size carries the
  emphasis instead.

### Spacing / Shape
- Generous whitespace; minimal, mostly-square corners (`rounded-sm`, occasionally
  `rounded-md` — avoid anything that reads as "soft"/playful).
- Buttons: solid black background, white uppercase tracked-out text
  (`bg-black text-white tracking-wide uppercase text-sm font-medium`), sharp corners.
  Secondary buttons: outline style (`border border-black text-black`, transparent fill).
- Section labels (like "UNSTITCHED - NEW ARRIVALS" in the reference image) use
  `text-gray-500 uppercase text-xs tracking-widest font-medium` instead of a color
  accent.
- Hairline `border-gray-200` dividers between sections instead of background-color
  changes, to keep the whole page feeling like one continuous monochrome surface.

### Reference product-card visual (must match exactly, minus color)
- A `div`/wrapper with the product photo as a **CSS background-image** (`bg-cover
  bg-center`), fixed aspect ratio (e.g. `aspect-[3/4]`). `next/image` with `fill` +
  `object-cover` is fine too.
- Bottom-left overlay (gradient scrim `bg-gradient-to-t from-black/70 to-transparent`
  for legibility — this is the one place true black is used heavily, deliberately) with:
  1. Item name — uppercase, bold, white.
  2. Announcement tag (optional) — smaller, white/gray-300, uppercase, maybe with a
     small bordered "pill" (`border border-white/60`) instead of a color badge.
  3. Price — white, semibold.
- Whole card is clickable (`<Link>`) → routes to the item detail page.
- Hover state: subtle zoom on the image (`transition-transform group-hover:scale-105`,
  `overflow-hidden` on parent) and a soft shadow lift.

---

## 2. Site Map (Next.js App Router file paths)

```
app/page.tsx                              Home ("/")
app/category/[slug]/page.tsx              Category listing
app/item/[id]/page.tsx                    Item detail
app/cart/page.tsx                         Full-page cart ("View Bag")
app/checkout/page.tsx                     Checkout flow (auth-gated)
app/account/page.tsx                      Order history / profile (Phase 12, nice-to-have)
app/admin/login/page.tsx                  Admin auth
app/admin/page.tsx                        Admin dashboard (protected)
app/admin/category/[slug]/page.tsx        Admin CRUD table for a category
app/admin/settings/page.tsx               Shipping rates, promo codes, site content
app/api/.../route.ts                      Route Handlers (see Phase 6)
middleware.ts                             Protects /admin/* and /checkout (session check)
app/not-found.tsx                         404 page
```

Category slugs (fixed, seeded at project init):
`stitched`, `unstitched`, `other-brands-sale`, `bottoms`, `new-arrivals`, `co-ords`

---

## 3. Data Model (shape this exactly; used for both the Supabase schema and TS types)

```ts
Category {
  slug: string            // e.g. "unstitched"
  displayName: string     // e.g. "Unstitched"
  heroImage: string       // used on the homepage teaser section for this category
  heroCaption?: string    // editable text under/over the image
}

Item {
  id: string
  categorySlug: string
  name: string
  price: number           // in PKR, integer
  stock: number
  announcement?: string   // e.g. "NEW ARRIVAL", "SALE", optional badge text
  description: string
  images: string[]        // first = card/cover image, rest = carousel
  createdAt: string
}

CartLine {
  itemId: string
  quantity: number
}

// One consolidated table for account info — no separate addresses table.
// A customer's saved address(es) live directly on this record.
Account {
  id: string              // = auth.users.id
  email: string           // verified via Supabase Auth
  firstName: string
  lastName: string
  phone: string
  role: 'customer' | 'admin'
  addresses: Address[]    // stored as jsonb — one or more saved addresses; the one
                          // used at checkout gets copied (not referenced) into the
                          // order at time of purchase, per the Order shape below
}

Address {
  line1: string
  country: string
  province: string
  city: string
}

ShippingRate {
  country: string
  province?: string       // allow province-level override, else country-level default
  cost: number
}

PromoCode {
  code: string
  type: 'percent' | 'flat'
  value: number
  active: boolean
}

// Orders are fully self-contained/denormalized: everything needed to fulfill and
// audit the order is stored directly on the order row itself, not just referenced
// via foreign keys. This means an order stays accurate and readable even if the
// customer later edits their account info, changes their address, or an item's
// name/price/description changes or the item is deleted from the catalog.
Order {
  id: string
  accountId: string          // fk -> accounts.id, for "my orders" lookups
  customerName: string       // snapshot of firstName + lastName at time of order
  customerEmail: string      // snapshot of email at time of order
  customerPhone: string      // snapshot of phone at time of order
  shippingAddress: Address   // snapshot of the address used for this order
  items: {                   // snapshot of each purchased item, not just an id
    itemId: string
    name: string
    description: string
    price: number
    quantity: number
  }[]
  shippingCost: number
  promoCode?: string
  discount: number
  totalPrice: number          // items subtotal + shippingCost - discount
  paymentMethod: 'COD'
  status: 'placed' | 'processing' | 'shipped' | 'delivered'
  createdAt: string
}
```

---

## 4. Phase 1 — Project Scaffold

1. `npx create-next-app@latest` — TypeScript, App Router, Tailwind CSS, ESLint: yes.
   `src/` directory layout is fine if preferred, just stay consistent with the paths in
   this doc (adjust `app/...` → `src/app/...` if so).
2. Configure `tailwind.config.ts` with the design tokens from Section 1.
3. Install: `zustand`, `lucide-react`, `@supabase/supabase-js`, `@supabase/ssr`, `zod`
   (for form/API validation). Create a Supabase project (or use an existing one) and add
   `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and a server-only
   `SUPABASE_SERVICE_ROLE_KEY`, used ONLY in trusted server contexts — never exposed to
   the client) to `.env.local`.
4. Set up folder structure:
```
app/
  (site)/                     route group for the public storefront layout
    layout.tsx                 Navbar + Footer wrapper
    page.tsx                   Home
    category/[slug]/page.tsx
    item/[id]/page.tsx
    cart/page.tsx
    checkout/page.tsx
    account/page.tsx
  admin/
    layout.tsx                 Admin shell (sidebar/topbar)
    login/page.tsx
    page.tsx
    category/[slug]/page.tsx
    settings/page.tsx
  api/
    auth/[...nextauth]/route.ts
    categories/route.ts
    items/route.ts
    items/[id]/route.ts
    orders/route.ts
    shipping-rates/route.ts
    promo-codes/validate/route.ts
components/
  layout/          Navbar, MobileMenu, Footer
  home/            Hero, CategoryTeaser
  product/         ProductCard, ProductGrid, ProductCarousel
  cart/            CartWidget, CartLineItem
  checkout/        AddressForm, ShippingSummary, PromoCodeInput
  admin/           AdminTable, ItemForm, ProtectedShell
  ui/              Button, Input, Modal, Badge  (shared primitives)
store/             useCartStore.ts (Zustand)
lib/
  supabase/        client.ts (browser client), server.ts (server/RSC client using
                    @supabase/ssr), middleware.ts helper, admin.ts (service-role client,
                    server-only, for privileged operations if ever needed)
  formatCurrency.ts, validators.ts
supabase/
  migrations/       SQL migration files (schema + RLS policies, checked into git)
public/
  logo.png                (provided by Muntaha — placeholder until supplied)
  images/                  (category + item placeholder images go here)
middleware.ts
```
5. Global layout: put `<Navbar />` and `<Footer />` in `app/(site)/layout.tsx` so the
   admin section (which has its own `app/admin/layout.tsx`) doesn't inherit them.
6. Stub every route above as a page that renders a heading only, so navigation can be
   tested end-to-end before content is built out.

**Definition of done:** app builds, all routes navigate, Tailwind styles apply, folder
structure matches above.

---

## 5. Phase 2 — Navbar & Mobile Menu

`components/layout/Navbar.tsx` (client component for interactivity, can wrap a server
component if needed for cart-count data).

**Layout (desktop, left to right):**
`[Hamburger icon] [Logo]` on the far left — `[flex-1 spacer]` —
`[Search icon] [Cart icon w/ item-count badge] [Sign In]` on the right.

**Hamburger click →** slide-in drawer (from the left) containing:
- Logo at top
- An explicit "✕ Close" button
- Vertical list of all 6 categories (`<Link href="/category/[slug]">`)
- Overlay behind the drawer that closes it on click; `Escape` key also closes it.
- Trap focus inside the drawer while open.

**Search icon click →** expands into an inline search input (or small modal) that
filters items by name across all categories, showing a live dropdown of matches linking
to `/item/[id]`. Back this with a Route Handler (`app/api/search/route.ts`) or a simple
client-side filter over a cached catalog list — either is fine for the initial scale.

**Cart icon →** opens `<CartWidget />` (Phase 8) as a right-side slide-over panel; badge
shows total quantity across all lines from `useCartStore`.

**Sign In →** if logged out: opens a modal or links to `/checkout` (auth step lives
there per Phase 9) — or build a lightweight dropdown with "Sign in" / "Create account"
backed by Supabase Auth. If logged in: shows the user's first name (from the `accounts`
table) with a small profile menu (Orders, Sign out) — read the session via the Supabase
server client in a Server Component and pass it down, or `supabase.auth.getUser()` on
the client.

**Responsive:** below `md`, search/cart/sign-in icons remain visible (icon-only, no
labels); the hamburger drawer becomes full-width.

---

## 6. Phase 3 — Home Page

Route: `app/(site)/page.tsx` (Server Component; can be `async` and fetch categories/
hero content directly from Supabase using the server client).

### 6a. Hero Section — static, no animation
`components/home/Hero.tsx`.
- Full-bleed section (`h-screen` or `min-h-[85vh]`), background image via `next/image`
  with `fill` + `object-cover` (source: `/images/hero.jpg`, editable later via Admin
  Settings).
- Centered or left-aligned overlay content: heading (serif, large), one short subheading
  line, and a single CTA button ("Shop New Arrivals" → `/category/new-arrivals`).
- A `bg-black/30` (or similar) scrim over the image so text stays legible — adjust
  opacity to taste against the actual supplied hero image.
- Standard, non-scroll-linked transitions only (e.g. a simple fade/slide-in on mount is
  fine if desired, but nothing tied to scroll position, no parallax).
- Fully static markup otherwise — no `IntersectionObserver`, no scroll listeners, no
  `framer-motion` scroll hooks needed for this section.

### 6b. Six Category Teaser Sections
`components/home/CategoryTeaser.tsx`, rendered once per category, **alternating**
image-left/text-right and image-right/text-left for visual rhythm. Each section:
- One large display image (`heroImage` from the Category data model).
- Category display name (serif, large).
- Optional short caption (`heroCaption`).
- "Shop Now →" link/button routing to `/category/[slug]`.
- Entire section (or its image) is clickable, not just the button.
- All 6 images + captions must be editable from Admin Settings (Phase 11).

**Responsive:** stack to single column (image on top, text below) under `md`.

---

## 7. Phase 4 — Category Listing Page

Route: `app/(site)/category/[slug]/page.tsx` (Server Component, fetch items for that
`slug` from Supabase at request time, or with ISR — `export const revalidate = ...` —
if using periodic static regeneration instead of a fully dynamic fetch).

- Page header: category display name + optional description (editable by admin).
- Grid of `ProductCard`s:
  - `grid-cols-1` on mobile, `grid-cols-2` on `sm`, **`grid-cols-3` from `md` up**
    (hard cap of 3 per row — do not go to 4 even on very wide screens; constrain with a
    `max-w` container instead).
  - Renders however many items the admin has uploaded to that category (no pagination
    needed initially).
  - Empty state: friendly message/icon if a category has zero items yet.
- Optional filters/sort (price low-high/high-low) — nice-to-have, not blocking.
- `generateMetadata` for a sensible page `<title>` per category (SEO — Next.js makes
  this easy, use it).

---

## 8. Phase 5 — Item Detail Page

Route: `app/(site)/item/[id]/page.tsx` (Server Component fetches the item; the carousel
and Add-to-Cart controls are client components nested inside).

Two-column layout on desktop (stack on mobile):

**Left column — image carousel:** `components/product/ProductCarousel.tsx`
("use client")
- Main large image, `< >` arrow buttons (`lucide-react` ChevronLeft/ChevronRight) to
  cycle through `item.images`.
- Small dot indicators or thumbnail strip below for direct navigation.
- Basic swipe gesture support on touch (`onTouchStart`/`onTouchEnd` delta check).

**Right column:**
- Item name (large, serif) + price.
- Stock status (e.g. "In stock — 4 left" / "Out of stock" — disable Add to Cart at 0).
- Description/details text block.
- Quantity selector (stepper, clamped between 1 and `stock`).
- **Large black "Add to Cart" button** — black background, white uppercase text,
  visually dominant in this column.
- Clicking Add to Cart: pushes/increments a `CartLine` in `useCartStore`, shows a toast
  or opens the cart widget to confirm.
- Quantity can never exceed `item.stock` — validate client-side here and again
  server-side at checkout/order-creation time.

---

## 9. Phase 6 — Supabase: Schema, RLS, Storage & Auth Wiring

### 9a. Schema
Create SQL migrations (`supabase/migrations/`) for every entity in Section 3:

```
categories        (slug pk, display_name, hero_image, hero_caption)

items             (id pk, category_slug fk, name, price, stock, announcement,
                   description, images text[], created_at)
                   -- one row per item: its Storage image URLs live in `images`,
                   -- and its name/price/description/stock all live on this same
                   -- row — this is the single table the admin CRUDs per category.

accounts          (id pk = auth.users.id, email, first_name, last_name, phone,
                   role text default 'customer' check (role in ('customer','admin')),
                   addresses jsonb default '[]')
                   -- ONE table holds all of a customer's info AND their address(es)
                   -- (as a jsonb array of {line1,country,province,city} objects) —
                   -- there is no separate addresses table.

shipping_rates    (id pk, country, province nullable, cost)

promo_codes       (code pk, type check (type in ('percent','flat')), value, active bool)

orders            (id pk, account_id fk -> accounts.id,
                   customer_name, customer_email, customer_phone,     -- snapshots
                   shipping_address jsonb,                            -- snapshot
                   items jsonb,        -- array of {item_id,name,description,price,
                                       --            quantity} snapshots, NOT just
                                       --            item ids/foreign keys
                   shipping_cost, promo_code nullable, discount, total_price,
                   payment_method default 'COD', status, created_at)
                   -- ONE table holds the full order record: line items (with
                   -- description), total price, shipping cost, shipping address,
                   -- and the customer's email/phone/name — all as a durable
                   -- snapshot, per spec. No separate order_lines table needed
                   -- since `items` is stored as a single jsonb column here.
```

`accounts` is created via a `handle_new_user()` trigger on `auth.users` insert (standard
Supabase pattern) so every signup automatically gets a matching `accounts` row with
`role = 'customer'`, `email` copied from `auth.users`, and `first_name`/`last_name`/
`phone` populated from the signup form's metadata. Muntaha's own admin row is the ONE
exception — promote it to `role = 'admin'` manually via the Supabase SQL editor/
dashboard after she creates her account; do not expose any UI that lets a customer
self-assign the admin role.

### 9b. Row Level Security — enable on every table, no exceptions
Run `alter table <table> enable row level security;` for every table above. Postgres
then denies all access until a policy explicitly grants it — write these policies:

```sql
-- categories, items, shipping_rates: public catalog data, readable by anyone
create policy "public read" on categories for select using (true);
create policy "public read" on items for select using (true);
create policy "public read" on shipping_rates for select using (true);

-- writes to catalog/settings tables: admins only
create policy "admin write" on categories for all
  using (exists (select 1 from accounts where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from accounts where id = auth.uid() and role = 'admin'));
-- repeat the same "admin write" pattern for items and shipping_rates

-- accounts: a user can read/update only their own row (including their own
-- addresses jsonb column); admins can read all accounts
create policy "own account" on accounts for select using (auth.uid() = id);
create policy "own account update" on accounts for update using (auth.uid() = id);
create policy "admin read all accounts" on accounts for select
  using (exists (select 1 from accounts a where a.id = auth.uid() and a.role = 'admin'));

-- promo_codes: readable only via the validate Route Handler using the service-role
-- key (server-side), NOT directly queryable by anon/authenticated clients — either
-- skip a public select policy entirely, or restrict select to admins only, same
-- pattern as categories' admin-write policy above.

-- orders: a customer can see/insert only their own; admins see all
create policy "own orders select" on orders for select using (auth.uid() = account_id);
create policy "own orders insert" on orders for insert
  with check (auth.uid() = account_id);
create policy "admin orders select" on orders for select
  using (exists (select 1 from accounts where id = auth.uid() and role = 'admin'));
create policy "admin orders update" on orders for update
  using (exists (select 1 from accounts where id = auth.uid() and role = 'admin'));
  -- update policy needed so the admin can change order.status from the dashboard
```

Adjust exact syntax as needed once the schema is finalized, but the shape must hold:
**public read on catalog data, admin-only writes on catalog/settings, strictly
owner-scoped reads/writes on personal data (accounts/orders), and no table left
without RLS enabled.** Never use the service-role key from client code — it bypasses
RLS entirely and must only appear in server-only files (e.g. `lib/supabase/admin.ts`,
never imported into a `"use client"` component).

### 9c. Auth
- Use `@supabase/ssr` to create a browser client (`lib/supabase/client.ts`) and a
  server client (`lib/supabase/server.ts`) that reads/writes the auth cookie correctly
  in Server Components, Route Handlers, and Server Actions.
- Turn on **"Confirm email"** in Supabase Auth settings so every signup is verified by
  email before the account is fully usable — this satisfies "every email will be
  authenticated" from the spec.
- Signup collects first name, last name, and phone (stored on the `accounts` row via
  the trigger — pass them as `options.data` in `supabase.auth.signUp()` and read them
  in `handle_new_user()` — or via a follow-up `update` call right after signup)
  alongside Supabase's built-in email/password fields.
- Sign in shows the "Welcome back, {firstName}" greeting per Phase 9 (site) using the
  session's linked `accounts` row.

### 9d. Route Handlers (thin wrappers around Supabase calls, for anything needing
server-side logic Supabase's client-side queries can't safely do alone — e.g. stock
decrement transactions, promo validation, admin checks):
```
POST   /api/orders                 create the order row (with the full snapshot shape
                                    from Section 3: items jsonb, customer name/email/
                                    phone, shipping_address, shipping_cost, total_price)
                                    and decrement stock atomically — use a Postgres
                                    function/RPC via `supabase.rpc('place_order', {...})`
                                    so the stock check + decrement + order insert happen
                                    in one transaction and can't race between two buyers
POST   /api/promo-codes/validate    server-side lookup using the service-role client
                                    (keeps promo_codes un-queryable from the client)
GET    /api/admin/orders            admin-only; still safe to just query Supabase
                                    directly from a Server Component instead if simpler
```
Everything else (reading categories/items, reading/updating a user's own profile or
addresses) can query Supabase directly from Server Components or client components via
`supabase-js` — RLS is what keeps it safe, so a dedicated Route Handler isn't required
for simple reads.

### 9e. Storage
- Create Supabase Storage buckets: `product-images` (item photos), `site-images` (hero
  + category teasers + logo).
- `product-images` and `site-images`: public read (bucket policy `public: true`, or a
  storage RLS policy allowing `select` to everyone); **writes (insert/update/delete)
  restricted to admin** via a storage policy checking the same `accounts.role = 'admin'`
  condition as above.
- Store the resulting public URL (or storage path) in `items.images[]` /
  `categories.hero_image`.

### 9f. `middleware.ts`
Use the `@supabase/ssr` middleware helper to refresh the session cookie on every
request, and:
- Redirect to `/admin/login` if a request to `/admin/*` (other than `/admin/login`
  itself) doesn't have a session with `role = 'admin'` (check via an `accounts` lookup,
  cached per-request).
- Optionally gate `/checkout` similarly if there's no session at all — though the
  checkout page itself already shows a sign-in/create-account form per Phase 9(site),
  so this is a belt-and-suspenders redirect rather than the primary mechanism.

---

## 10. Phase 7 — Cart Widget & Cart Page

**Cart widget** (`components/cart/CartWidget.tsx`, slide-over, opened from navbar cart
icon):
- List of `CartLineItem`s: small thumbnail, name, unit price, quantity stepper (+/-
  clamped to stock — fetch current stock or trust last-known value with a server
  re-check at checkout), remove (trash icon) button, in-stock/out-of-stock badge.
- Running subtotal at the bottom.
- Three actions:
  1. **"View Bag"** → navigates to `/cart` and closes the widget.
  2. **"Continue Shopping"** → just closes the widget.
  3. **"Checkout"** → navigates to `/checkout`.

**Cart page** (`app/(site)/cart/page.tsx`): same line-item list, larger layout, order
summary sidebar (subtotal, "shipping calculated at checkout," Checkout button).

Persist `useCartStore` to `localStorage` (Zustand `persist` middleware) so a guest's
cart survives a refresh.

---

## 11. Phase 8 — Checkout Flow

Route: `app/(site)/checkout/page.tsx`.

1. **If not logged in:** tabbed Sign In / Create Account form (client component calling
   `supabase.auth.signInWithPassword()` / `supabase.auth.signUp()` directly).
   - Create account: first name, last name, email (confirmation email required per
     Phase 6), **phone number**, password. On signup, also write first/last name and
     phone to the `accounts` row created by the `handle_new_user()` trigger (an
     `update` call right after signup, or pass them as `options.data` in `signUp()`
     and read them in the trigger).
   - Sign in: email + password. On success, show **"Welcome back, {firstName}"**. If
     the signed-in account is missing a phone number (e.g. it was never collected),
     prompt for it here before allowing checkout to proceed, since every order record
     needs one.
2. **Address step:** address line, **country** (dropdown), **province/state**
   (dependent dropdown or free text), **city**. Offer to save this to the account's
   `addresses` array for reuse next time (with a simple "use a saved address" picker
   if the account already has one or more).
3. **Shipping cost:** fetched from `/api/shipping-rates`, matched against the chosen
   country/province (fallback to a country-level default); shown in the order summary.
   Rates are entirely admin-controlled (Phase 11) — checkout only reads them.
4. **Promo code:** input + "Apply" → `POST /api/promo-codes/validate`; success shows
   discount + adjusted total; failure shows inline error.
5. **Payment method:** Cash on Delivery only — shown as a pre-selected, disabled radio/
   card (no other options rendered).
6. **Place Order:** creates the `Order` via `POST /api/orders` (Route Handler
   decrements stock transactionally, so concurrent orders can't oversell). The order
   row must be written as the full denormalized snapshot from Section 3 — customer
   name, email, and phone; the shipping address used; each purchased item's name,
   description, price, and quantity; shipping cost; discount; and total price — not
   just foreign keys to the account/cart. Then clear the cart and redirect to a
   confirmation screen ("Thank you — your order #___ has been placed").
7. **Admin notification:** on order creation, email Muntaha (via the mail provider
   already needed for verification) and/or increment a "new orders" badge on the Admin
   Dashboard. Implement both if time allows — email is the priority since the admin
   panel won't always be open.

---

## 12. Phase 9 — Admin Authentication

- `app/admin/login/page.tsx`: single email/password form calling
  `supabase.auth.signInWithPassword()` directly (Muntaha is the only admin — no signup
  flow here). After sign-in, check the `role` column on the matching `accounts` row for
  the logged-in user; if it's not `'admin'`, sign the session back out and show an
  error rather than granting access.
- `middleware.ts` protects all `app/admin/*` routes except `/admin/login`, redirecting
  unauthenticated/non-admin sessions to `/admin/login` (see Phase 6's middleware note).
- **Re-authenticate every time she opens the panel:** configure a short Supabase
  session/JWT expiry for the admin experience (e.g. sign her out of the admin area on
  every fresh browser session rather than relying on Supabase's default persistent
  session/refresh-token behavior) — e.g. call `supabase.auth.signOut()` when the admin
  layout mounts and no `/admin` page was directly deep-linked from a still-fresh login,
  or simply always show `/admin/login` first and never silently reuse a stored session
  for `/admin/*`, per spec ("authenticate every time she opens it").

---

## 13. Phase 10 — Admin: Category CRUD

Route: `app/admin/category/[slug]/page.tsx`.

- Table/grid view of all items in that category (thumbnail column + name/price/stock +
  edit/delete actions — a dense table scans better than cards for many items).
- **Create:** form (modal or separate route) — name, price, stock, announcement
  (optional), description, image upload(s) via
  `supabase.storage.from('product-images').upload(...)` (bucket set up in Phase 6;
  first upload = cover image, rest = carousel; support reordering or at least multiple
  inputs).
- **Edit:** same form, pre-filled, `PUT` to update.
- **Delete:** confirm dialog before removing.
- Changes reflect on the public category page — use `revalidatePath('/category/[slug]')`
  (Next.js Server Action/Route Handler cache invalidation) after any mutation so the
  storefront updates without a manual redeploy.

---

## 14. Phase 11 — Admin: Site Content & Settings

Route: `app/admin/settings/page.tsx`.

- **Homepage hero:** edit hero background image + heading/subheading text.
- **Category teasers:** edit each of the 6 categories' `heroImage` + `heroCaption` +
  `displayName` shown on the homepage.
- **Shipping rates:** CRUD list of country/province → cost.
- **Promo codes:** CRUD list of codes, type (percent/flat), value, active toggle.
- **Orders view:** list of incoming orders (Phase 8 notification counterpart), each
  showing the customer's name/email/phone, shipping address, purchased items (with
  description, price, quantity), shipping cost, and total price straight off the order
  row — plus status update capability (placed → processing → shipped → delivered).

This is the "she can edit virtually anything" requirement — if new editable text/images
are discovered during build that aren't listed above (e.g. footer content, about page
copy), add them here rather than hardcoding.

---

## 15. Phase 12 — Responsiveness & Polish Pass

Do this as a dedicated final pass across the whole app:
- Breakpoints to explicitly test: `375px` (small phone), `640px` (`sm`), `768px`
  (`md`), `1024px` (`lg`), `1440px+` (`xl`/desktop).
- Confirm product grid never exceeds 3 columns, hero readable on short mobile
  viewports, drawer/cart widget don't overflow the viewport, forms (checkout/admin)
  are usable with on-screen keyboards (avoid fixed heights that clip inputs).
- Run a Lighthouse pass; fix obvious accessibility issues (alt text on every product
  image using item name, focus states on all interactive elements, color contrast on
  text-over-image overlays).
- Confirm `next/image` is used (or at least explicit `width`/`height`/`sizes`) wherever
  large images are rendered, to avoid layout shift and to get Next's built-in
  optimization/responsive `srcset`.

---

## 16. Assets Checklist (to be supplied by Muntaha into `/public`)

- `logo.png` — main logo (navbar + drawer + footer)
- `images/hero.jpg` — hero background (static image only, no video/animation needed)
- `images/categories/{slug}.jpg` — one teaser image per category (6 files)
- Item images uploaded directly through the admin panel once Phase 10 is live (a few
  placeholders are fine for earlier-phase development).

---

## 17. Open Questions for Muntaha (resolve before/while building)

1. Confirm navbar icon placement (see note in Phase 2) — hamburger+logo left,
   search/cart/sign-in right, as implemented, or a different arrangement.
2. Confirm whether "Other brands sale" items need a distinct visual badge (e.g. brand
   name) beyond the standard `announcement` field.
3. Once the Supabase project exists, share the project URL/anon key with opencode (or
   have it create the project via the Supabase CLI/dashboard) before Phase 6 begins —
   everything after Phase 5 depends on the schema + RLS policies being in place.
