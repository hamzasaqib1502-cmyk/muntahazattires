-- Muntaha's Attires — Phase 6 schema + RLS + storage + RPC.
-- Run against the Supabase database (SQL editor or `supabase db push`).

-- ---------------------------------------------------------------------------
-- Tables (Section 3 of AGENTS.md)
-- ---------------------------------------------------------------------------

create table if not exists public.categories (
  slug text primary key,
  display_name text not null,
  hero_image text not null,
  hero_caption text
);

create table if not exists public.items (
  id text primary key,
  category_slug text not null references public.categories (slug),
  name text not null,
  price integer not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  announcement text,
  description text not null default '',
  images text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.accounts (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  first_name text not null default '',
  last_name text not null default '',
  phone text not null default '',
  role text not null default 'customer'
    check (role in ('customer', 'admin')),
  addresses jsonb not null default '[]'::jsonb
);

create table if not exists public.shipping_rates (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  province text,
  cost integer not null check (cost >= 0)
);

create table if not exists public.promo_codes (
  code text primary key,
  type text not null check (type in ('percent', 'flat')),
  value integer not null check (value >= 0),
  active boolean not null default true
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address jsonb not null,
  items jsonb not null,
  shipping_cost integer not null default 0,
  promo_code text,
  discount integer not null default 0,
  total_price integer not null,
  payment_method text not null default 'COD' check (payment_method = 'COD'),
  status text not null default 'placed'
    check (status in ('placed', 'processing', 'shipped', 'delivered')),
  created_at timestamptz not null default now()
);

create index if not exists orders_account_id_idx on public.orders (account_id);

-- Editable homepage content (admin settings, Phase 11). Stored as key/value.
create table if not exists public.site_settings (
  key text primary key,
  value text not null
);

-- ---------------------------------------------------------------------------
-- Auth: auto-create an accounts row for every signup
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.accounts (id, email, first_name, last_name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security (Section 9b)
-- ---------------------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.items enable row level security;
alter table public.accounts enable row level security;
alter table public.shipping_rates enable row level security;
alter table public.promo_codes enable row level security;
alter table public.orders enable row level security;
alter table public.site_settings enable row level security;

-- Public catalog data: readable by anyone.
create policy "public read" on public.categories
  for select using (true);
create policy "public read" on public.items
  for select using (true);
create policy "public read" on public.shipping_rates
  for select using (true);
create policy "public read" on public.site_settings
  for select using (true);

-- Admin-only writes on catalog / settings tables.
create policy "admin write" on public.categories
  for all
  using (exists (select 1 from public.accounts where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.accounts where id = auth.uid() and role = 'admin'));

create policy "admin write" on public.items
  for all
  using (exists (select 1 from public.accounts where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.accounts where id = auth.uid() and role = 'admin'));

create policy "admin write" on public.shipping_rates
  for all
  using (exists (select 1 from public.accounts where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.accounts where id = auth.uid() and role = 'admin'));

create policy "admin write" on public.promo_codes
  for all
  using (exists (select 1 from public.accounts where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.accounts where id = auth.uid() and role = 'admin'));

create policy "admin write" on public.site_settings
  for all
  using (exists (select 1 from public.accounts where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.accounts where id = auth.uid() and role = 'admin'));

-- promo_codes intentionally has no public select — validated server-side only.

-- Accounts: users read/update only their own row; admins read all.
create policy "own account" on public.accounts
  for select using (auth.uid() = id);
create policy "own account update" on public.accounts
  for update using (auth.uid() = id);
create policy "admin read all accounts" on public.accounts
  for select
  using (exists (select 1 from public.accounts a where a.id = auth.uid() and a.role = 'admin'));

-- Orders: customers see/insert only their own; admins see all + update status.
create policy "own orders select" on public.orders
  for select using (auth.uid() = account_id);
create policy "own orders insert" on public.orders
  for insert with check (auth.uid() = account_id);
create policy "admin orders select" on public.orders
  for select
  using (exists (select 1 from public.accounts where id = auth.uid() and role = 'admin'));
create policy "admin orders update" on public.orders
  for update
  using (exists (select 1 from public.accounts where id = auth.uid() and role = 'admin'));

-- ---------------------------------------------------------------------------
-- Storage buckets + policies (Section 9e)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

-- Public read on both buckets.
create policy "ma public read product-images" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "ma public read site-images" on storage.objects
  for select using (bucket_id = 'site-images');

-- Admin-only writes to both buckets.
create policy "ma admin write product-images" on storage.objects
  for all
  using (
    bucket_id = 'product-images'
    and exists (select 1 from public.accounts where id = auth.uid() and role = 'admin')
  )
  with check (
    bucket_id = 'product-images'
    and exists (select 1 from public.accounts where id = auth.uid() and role = 'admin')
  );

create policy "ma admin write site-images" on storage.objects
  for all
  using (
    bucket_id = 'site-images'
    and exists (select 1 from public.accounts where id = auth.uid() and role = 'admin')
  )
  with check (
    bucket_id = 'site-images'
    and exists (select 1 from public.accounts where id = auth.uid() and role = 'admin')
  );

-- ---------------------------------------------------------------------------
-- place_order RPC: transactional stock check + decrement + order insert.
-- SECURITY DEFINER so the check/insert happen atomically and bypass RLS;
-- the API route enforces that the caller places only their own order.
-- ---------------------------------------------------------------------------

create or replace function public.place_order(
  p_account_id uuid,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_shipping_address jsonb,
  p_items jsonb,
  p_shipping_cost integer,
  p_promo_code text,
  p_discount integer
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_item jsonb;
  v_item_id text;
  v_quantity integer;
begin
  -- Atomically decrement stock; raise if any line exceeds available stock.
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_item_id := v_item ->> 'itemId';
    v_quantity := (v_item ->> 'quantity')::integer;

    update public.items
       set stock = stock - v_quantity
     where id = v_item_id
       and stock >= v_quantity;

    if not found then
      raise exception 'Insufficient stock for item %', v_item_id;
    end if;
  end loop;

  insert into public.orders (
    account_id,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    items,
    shipping_cost,
    promo_code,
    discount,
    total_price,
    payment_method,
    status
  )
  values (
    p_account_id,
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_shipping_address,
    p_items,
    p_shipping_cost,
    p_promo_code,
    p_discount,
    (
      select coalesce(sum((x ->> 'price')::integer * (x ->> 'quantity')::integer), 0)
      from jsonb_array_elements(p_items) as x
    ) + p_shipping_cost - p_discount,
    'COD',
    'placed'
  )
  returning * into v_order;

  return v_order;
end;
$$;

revoke execute on function public.place_order(uuid, text, text, text, jsonb, jsonb, integer, text, integer) from anon, public;
grant execute on function public.place_order(uuid, text, text, text, jsonb, jsonb, integer, text, integer) to authenticated;
