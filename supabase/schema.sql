-- ============================================================
-- Lestic — Supabase Schema
-- Run this in the Supabase SQL editor (Dashboard > SQL > New query).
-- ============================================================

-- ---------- PRODUCTS ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  sku text unique,
  title text not null,
  brand text,
  model text,
  price int not null default 0,
  quantity int not null default 0,
  status text not null default 'draft'
    check (status in ('draft', 'available', 'sold_out', 'hidden')),
  featured boolean not null default false,
  use_case text,
  processor text,
  ram text,
  storage text,
  gpu text,
  display text,
  resolution text,
  refresh_rate text,
  os text default 'Windows 11 Pro',
  battery_health text,
  condition text,
  condition_grade text check (condition_grade in ('A', 'B', 'C')),
  warranty text,
  accessories text,
  description text,
  view_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- PRODUCT IMAGES ----------
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- LEADS ----------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  product_title text not null,
  product_sku text,
  product_slug text,
  price_at_enquiry int,
  customer_name text not null,
  whatsapp text not null,
  email text,
  lead_type text not null default 'booking'
    check (lead_type in ('booking', 'contact')),
  address text,
  city text,
  state text,
  pin text,
  preferred_contact_time text,
  message text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'inspection', 'negotiation', 'purchased', 'lost')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migration for databases created before the lead_type/email columns existed.
-- Idempotent — safe to run multiple times.
alter table public.leads add column if not exists email text;
alter table public.leads add column if not exists lead_type text not null default 'booking';

-- ---------- VIEW COUNTER ----------
create or replace function public.increment_view_count(row_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.products
  set view_count = view_count + 1
  where id = row_id;
end;
$$;

-- ---------- ADMIN USERS ----------
-- Links Supabase Auth users to admin access.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  created_at timestamptz not null default now()
);

-- ---------- UPDATED_AT TRIGGER ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.leads enable row level security;
alter table public.admin_users enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
  );
$$;

-- ---------- PRODUCTS ----------
-- Anyone can view listings that are available or sold out.
-- Admins can view everything (including drafts and hidden listings).
create policy "products_public_select"
  on public.products for select
  using (status in ('available', 'sold_out') or public.is_admin());

-- Only admins can modify products.
create policy "products_admin_insert"
  on public.products for insert
  with check (public.is_admin());

create policy "products_admin_update"
  on public.products for update
  using (public.is_admin());

create policy "products_admin_delete"
  on public.products for delete
  using (public.is_admin());

-- ---------- PRODUCT IMAGES ----------
create policy "product_images_public_select"
  on public.product_images for select
  using (true);

create policy "product_images_admin_insert"
  on public.product_images for insert
  with check (public.is_admin());

create policy "product_images_admin_update"
  on public.product_images for update
  using (public.is_admin());

create policy "product_images_admin_delete"
  on public.product_images for delete
  using (public.is_admin());

-- ---------- LEADS ----------
-- Anyone may submit an enquiry (the public booking form).
create policy "leads_public_insert"
  on public.leads for insert
  with check (true);

-- Only admins may read or update leads. No public access to customer data.
create policy "leads_admin_select"
  on public.leads for select
  using (public.is_admin());

create policy "leads_admin_update"
  on public.leads for update
  using (public.is_admin());

create policy "leads_admin_delete"
  on public.leads for delete
  using (public.is_admin());

-- ---------- ADMIN USERS ----------
create policy "admin_users_admin_select"
  on public.admin_users for select
  using (public.is_admin());

-- ============================================================
-- STORAGE — product images bucket
-- Bucket is public-read, admin-write. Create it once:
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product_images_bucket_public_read" on storage.objects;
create policy "product_images_bucket_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "product_images_bucket_admin_write" on storage.objects;
create policy "product_images_bucket_admin_write"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_bucket_admin_update" on storage.objects;
create policy "product_images_bucket_admin_update"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_bucket_admin_delete" on storage.objects;
create policy "product_images_bucket_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

-- ============================================================
-- RATE LIMITING
-- Dedicated counter storage for serverless-safe rate limiting.
-- Stores only a key + timestamp per event — no personal data.
-- RLS is enabled with NO policies, so anon/authenticated are blocked
-- from every row operation even though the PRIVILEGES block below
-- grants table access; only rate_limit_hit (security definer) and
-- service_role can read/write these rows.
-- ============================================================
create table if not exists public.rate_limits (
  id bigint generated always as identity primary key,
  rkey text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limits_rkey_created_idx
  on public.rate_limits (rkey, created_at);

create index if not exists rate_limits_created_idx
  on public.rate_limits (created_at);

alter table public.rate_limits enable row level security;

-- Atomic check-and-record. The per-key advisory lock serializes
-- concurrent calls, so two simultaneous requests for the same key
-- cannot both pass the limit. Returns true if allowed, false if over.
create or replace function public.rate_limit_hit(
  p_key text,
  p_limit int,
  p_window_seconds int
) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  hit_count int;
begin
  p_limit := least(greatest(p_limit, 1), 1000);
  p_window_seconds := least(greatest(p_window_seconds, 1), 86400);

  perform pg_advisory_xact_lock(hashtextextended(p_key, 0));

  delete from public.rate_limits
  where rkey = p_key
    and created_at < now() - (p_window_seconds * interval '1 second');

  -- Bound the table regardless of key churn.
  delete from public.rate_limits where created_at < now() - interval '1 day';

  select count(*) into hit_count
  from public.rate_limits
  where rkey = p_key;

  if hit_count >= p_limit then
    return false;
  end if;

  insert into public.rate_limits (rkey) values (p_key);
  return true;
end;
$$;

-- ============================================================
-- TABLE / SEQUENCE / FUNCTION PRIVILEGES
-- RLS controls which rows roles can see or change, but the roles
-- still need table-level privileges to run queries at all. Tables
-- created via the SQL editor may not receive Supabase's automatic
-- grants, which produces "permission denied for table ...".
-- GRANT statements are idempotent — safe to run multiple times.
-- ============================================================

grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant execute on all functions in schema public to anon, authenticated, service_role;

-- New tables/sequences/functions created later get the same privileges.
alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public
  grant execute on functions to anon, authenticated, service_role;

-- ---------- RATE LIMITING PRIVILEGES ----------
-- Make the limiter callable by the public roles (server actions run as
-- anon/authenticated). The table itself stays locked down: revoke the
-- broad grants above so clients cannot read/delete rate-limit rows.
grant execute on function public.rate_limit_hit(text, int, int)
  to anon, authenticated, service_role;

revoke all on table public.rate_limits from anon, authenticated;
