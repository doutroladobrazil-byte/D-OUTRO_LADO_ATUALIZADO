create extension if not exists "pgcrypto";

-- =============================================================================
-- Profiles
-- =============================================================================
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text unique not null,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'wholesale', 'admin')),
  is_active boolean not null default true,
  preferred_language text default 'en',
  preferred_currency text default 'USD',
  created_at timestamptz not null default now()
);

-- =============================================================================
-- Catalog — Categories & Subcategories
-- =============================================================================
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  brand text not null check (brand in ('casa', 'moda')),
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (category_id, slug)
);

-- =============================================================================
-- Catalog — Products
-- =============================================================================
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  brand text not null check (brand in ('casa', 'moda')),
  category_id uuid references categories(id) on delete set null,
  subcategory_id uuid references subcategories(id) on delete set null,

  -- Identity
  name text not null,
  slug text unique not null,
  sku text unique not null,

  -- Copy
  short_description text,
  long_description text,
  seo_title text,
  seo_description text,

  -- Physical metadata
  material text,
  dimensions text,
  origin text,
  care_instructions text,

  -- Weight (range is required for freight; grams is optional for precision)
  weight_range text not null check (weight_range in ('100g-1kg','1-3kg','3-5kg','5-10kg','10-15kg','15-20kg')),
  weight_grams integer,

  -- Pricing
  retail_price_brl numeric(12,2) not null,
  wholesale_price_brl numeric(12,2),
  wholesale_min_qty integer not null default 1,

  -- Stock
  stock integer not null default 0,

  -- Merchandising
  badge text,
  collection text,
  tags text[] not null default '{}',
  is_featured boolean not null default false,
  position integer not null default 0,

  -- Status
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  alt_text text,
  position integer not null default 0
);

-- =============================================================================
-- Catalog — Wholesale Rules
-- =============================================================================
create table if not exists wholesale_rules (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('product','category','global')),
  target_id uuid,
  min_quantity integer not null default 1,
  discount_percent numeric(5,2),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- Customer — Favorites, Carts, Addresses
-- =============================================================================
create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (profile_id, product_id)
);

create table if not exists carts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  brand text not null check (brand in ('casa', 'moda')),
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, brand)
);

create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references carts(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity integer not null default 1,
  unique (cart_id, product_id)
);

create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  country text not null,
  region text,
  city text,
  postal_code text,
  line_1 text not null,
  line_2 text,
  is_default boolean not null default false
);

-- =============================================================================
-- Shipping
-- =============================================================================
create table if not exists shipping_regions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  is_active boolean not null default true
);

create table if not exists shipping_rates (
  id uuid primary key default gen_random_uuid(),
  shipping_region_id uuid not null references shipping_regions(id) on delete cascade,
  weight_range text not null check (weight_range in ('100g-1kg','1-3kg','3-5kg','5-10kg','10-15kg','15-20kg')),
  amount_brl numeric(12,2) not null,
  created_at timestamptz not null default now(),
  unique (shipping_region_id, weight_range)
);

-- =============================================================================
-- i18n
-- =============================================================================
create table if not exists currencies (
  code text primary key,
  symbol text not null,
  is_active boolean not null default true
);

create table if not exists languages (
  code text primary key,
  label text not null,
  is_active boolean not null default true
);

-- =============================================================================
-- Gift Kits
-- =============================================================================
create table if not exists gift_kits (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  name text not null,
  message text,
  packaging_type text,
  total_weight_range text,
  total_amount_brl numeric(12,2) default 0,
  created_at timestamptz not null default now()
);

create table if not exists gift_kit_items (
  id uuid primary key default gen_random_uuid(),
  kit_id uuid not null references gift_kits(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity integer not null default 1
);

-- =============================================================================
-- Orders
-- =============================================================================
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null,
  profile_id uuid references profiles(id) on delete set null,
  address_id uuid references addresses(id),
  brand text not null check (brand in ('casa', 'moda')),
  currency text not null default 'USD',
  subtotal_brl numeric(12,2) not null default 0,
  freight_brl numeric(12,2) not null default 0,
  total_brl numeric(12,2) not null default 0,
  order_status text not null default 'created'
    check (order_status in ('created','processing','packing','shipped','delivered','cancelled')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending','paid','failed','refunded')),
  fiscal_status text not null default 'pending'
    check (fiscal_status in ('pending','in_review','issued','rejected')),
  shipping_region text,
  is_export_order boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  brand text not null check (brand in ('casa', 'moda')),
  product_name text not null,
  sku text,
  quantity integer not null,
  unit_price_brl numeric(12,2) not null,
  line_total_brl numeric(12,2) not null,
  weight_range text not null
);

-- =============================================================================
-- Payments & Fiscal
-- =============================================================================
create table if not exists payment_records (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  provider text not null default 'stripe',
  provider_payment_id text,
  status text not null,
  amount_brl numeric(12,2) not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists fiscal_records (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  invoice_number text,
  access_key text,
  observations text,
  status text not null default 'pending'
    check (status in ('pending','in_review','issued','rejected')),
  issued_at timestamptz,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- CMS — Banners, Sliders, Settings
-- =============================================================================
create table if not exists banners (
  id uuid primary key default gen_random_uuid(),
  brand text not null check (brand in ('casa','moda')),
  title text not null,
  subtitle text,
  highlight text,
  cta_label text,
  cta_url text,
  image_url text,
  is_active boolean not null default true,
  position integer not null default 0
);

create table if not exists sliders (
  id uuid primary key default gen_random_uuid(),
  brand text not null check (brand in ('casa','moda')),
  title text not null,
  subtitle text,
  cta_label text,
  cta_url text,
  image_url text,
  is_active boolean not null default true,
  position integer not null default 0
);

create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- Analytics & Admin
-- =============================================================================
create table if not exists recommendation_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  product_id uuid references products(id) on delete set null,
  event_type text not null,
  created_at timestamptz not null default now()
);

create table if not exists admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_profile_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  payload jsonb,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- Stage 1 migration — apply these ALTER TABLE statements if upgrading
-- an existing database instead of running the schema from scratch.
-- =============================================================================
-- alter table categories    add column if not exists image_url text;
-- alter table categories    add column if not exists position integer not null default 0;
-- alter table categories    add column if not exists is_active boolean not null default true;
-- alter table subcategories add column if not exists description text;
-- alter table subcategories add column if not exists position integer not null default 0;
-- alter table subcategories add column if not exists is_active boolean not null default true;
-- alter table subcategories add constraint if not exists subcategories_category_id_slug_unique unique (category_id, slug);
-- alter table products      add column if not exists seo_title text;
-- alter table products      add column if not exists seo_description text;
-- alter table products      add column if not exists weight_grams integer;
-- alter table products      add column if not exists collection text;
-- alter table products      add column if not exists origin text;
-- alter table products      add column if not exists care_instructions text;
-- alter table products      add column if not exists position integer not null default 0;
-- alter table banners       add column if not exists highlight text;
-- alter table orders        add constraint if not exists orders_order_status_check
--   check (order_status in ('created','processing','packing','shipped','delivered','cancelled'));
-- alter table orders        add constraint if not exists orders_payment_status_check
--   check (payment_status in ('pending','paid','failed','refunded'));
-- alter table orders        add constraint if not exists orders_fiscal_status_check
--   check (fiscal_status in ('pending','in_review','issued','rejected'));
