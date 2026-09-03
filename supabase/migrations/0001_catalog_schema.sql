create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  brand text not null check (char_length(brand) > 0),
  name text not null check (char_length(name) > 0),
  description text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  code text not null check (code ~ '^[a-z][a-z0-9_]*$'),
  display_name text not null,
  position smallint not null default 0 check (position >= 0),
  unique (product_id, code)
);

create table if not exists public.product_option_values (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references public.product_options(id) on delete cascade,
  value text not null,
  label text not null,
  swatch_hex text check (swatch_hex is null or swatch_hex ~ '^#[0-9A-Fa-f]{6}$'),
  position smallint not null default 0 check (position >= 0),
  unique (option_id, value)
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  mrp_paise bigint not null check (mrp_paise > 0),
  sale_price_paise bigint not null check (sale_price_paise > 0 and sale_price_paise <= mrp_paise),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.variant_option_values (
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  option_value_id uuid not null references public.product_option_values(id) on delete restrict,
  primary key (variant_id, option_value_id)
);

create table if not exists public.variant_images (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  storage_path text not null check (char_length(storage_path) > 0),
  alt_text text not null,
  position smallint not null default 0 check (position >= 0),
  is_primary boolean not null default false,
  unique (variant_id, position)
);

create unique index if not exists variant_images_one_primary_per_variant
  on public.variant_images (variant_id)
  where is_primary;

create table if not exists public.emi_plan_templates (
  id uuid primary key default gen_random_uuid(),
  tenure_months smallint not null check (tenure_months > 0),
  annual_interest_rate_bps integer not null check (annual_interest_rate_bps >= 0),
  cashback_paise bigint not null default 0 check (cashback_paise >= 0),
  position smallint not null default 0 check (position >= 0),
  is_active boolean not null default true,
  unique (tenure_months, annual_interest_rate_bps, cashback_paise)
);

create table if not exists public.product_emi_plans (
  product_id uuid not null references public.products(id) on delete cascade,
  plan_id uuid not null references public.emi_plan_templates(id) on delete restrict,
  is_enabled boolean not null default true,
  primary key (product_id, plan_id)
);

create index if not exists product_variants_product_id_idx
  on public.product_variants (product_id);
create index if not exists product_options_product_id_idx
  on public.product_options (product_id);
create index if not exists variant_option_values_option_value_id_idx
  on public.variant_option_values (option_value_id);
create index if not exists product_emi_plans_product_id_idx
  on public.product_emi_plans (product_id);

alter table public.products enable row level security;
alter table public.product_options enable row level security;
alter table public.product_option_values enable row level security;
alter table public.product_variants enable row level security;
alter table public.variant_option_values enable row level security;
alter table public.variant_images enable row level security;
alter table public.emi_plan_templates enable row level security;
alter table public.product_emi_plans enable row level security;

create policy "public reads active products" on public.products
  for select to anon, authenticated using (is_active);
create policy "public reads options for active products" on public.product_options
  for select to anon, authenticated using (
    exists (select 1 from public.products where products.id = product_options.product_id and products.is_active)
  );
create policy "public reads option values for active products" on public.product_option_values
  for select to anon, authenticated using (
    exists (
      select 1 from public.product_options
      join public.products on products.id = product_options.product_id
      where product_options.id = product_option_values.option_id and products.is_active
    )
  );
create policy "public reads active variants" on public.product_variants
  for select to anon, authenticated using (
    is_active and exists (select 1 from public.products where products.id = product_variants.product_id and products.is_active)
  );
create policy "public reads active variant choices" on public.variant_option_values
  for select to anon, authenticated using (
    exists (select 1 from public.product_variants where product_variants.id = variant_option_values.variant_id and product_variants.is_active)
  );
create policy "public reads active variant images" on public.variant_images
  for select to anon, authenticated using (
    exists (select 1 from public.product_variants where product_variants.id = variant_images.variant_id and product_variants.is_active)
  );
create policy "public reads active emi templates" on public.emi_plan_templates
  for select to anon, authenticated using (is_active);
create policy "public reads enabled product plans" on public.product_emi_plans
  for select to anon, authenticated using (
    is_enabled and exists (select 1 from public.products where products.id = product_emi_plans.product_id and products.is_active)
  );

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;
