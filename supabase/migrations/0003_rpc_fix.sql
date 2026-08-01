-- Phase 6 fixes applied after the initial schema run:
--
--  1. RLS infinite recursion: the "admin ..." policies on catalog/settings
--     tables and the "admin read all accounts" policy reference `accounts`
--     inside a subquery while the table's own policies are being evaluated.
--     Postgres rejects this ("infinite recursion detected in policy for
--     relation accounts") and public reads of `items` fail with HTTP 500.
--     Fix: a SECURITY DEFINER helper `public.is_admin()` that reads the role 
--     without re-entering RLS, used by every admin policy.
--
--  2. place_order was hidden from the API (404) because EXECUTE was revoked
--     from `public`, which also stripped it from the service_role. Restore
--     EXECUTE for authenticated + service_role, and harden the function so a
--     caller can only place an order for their own account.

-- ---------------------------------------------------------------------------
-- 1. Admin helper + rewritten policies
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.accounts
    where id = auth.uid()
      and role = 'admin'
  );
$$;

drop policy if exists "admin write" on public.categories;
drop policy if exists "admin write" on public.items;
drop policy if exists "admin write" on public.shipping_rates;
drop policy if exists "admin write" on public.promo_codes;
drop policy if exists "admin write" on public.site_settings;
drop policy if exists "admin read all accounts" on public.accounts;
drop policy if exists "ma admin write product-images" on storage.objects;
drop policy if exists "ma admin write site-images" on storage.objects;

create policy "admin write" on public.categories
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin write" on public.items
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin write" on public.shipping_rates
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin write" on public.promo_codes
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin write" on public.site_settings
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin read all accounts" on public.accounts
  for select
  using (public.is_admin());

create policy "ma admin write product-images" on storage.objects
  for all
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "ma admin write site-images" on storage.objects
  for all
  using (bucket_id = 'site-images' and public.is_admin())
  with check (bucket_id = 'site-images' and public.is_admin());

-- ---------------------------------------------------------------------------
-- 2. place_order: caller guard + correct EXECUTE grants
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
  if p_account_id <> auth.uid() then
    raise exception 'You can only place orders for your own account.';
  end if;

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
grant execute on function public.place_order(uuid, text, text, text, jsonb, jsonb, integer, text, integer) to authenticated, service_role;
