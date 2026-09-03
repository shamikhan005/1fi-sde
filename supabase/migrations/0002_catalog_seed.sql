-- Upload the matching PNG files from supabase/storage-assets/ to this public
-- bucket before opening the app. Paths below are deliberately stable.

insert into public.products (id, slug, brand, name, description)
values
  ('10000000-0000-4000-8000-000000000001', 'iphone-17-pro', 'Apple', 'iPhone 17 Pro', 'A polished flagship experience with a brilliant display and pro-level camera system.'),
  ('10000000-0000-4000-8000-000000000002', 'samsung-s24-ultra', 'Samsung', 'Galaxy S24 Ultra', 'A powerful large-screen flagship built for work, creativity and everyday productivity.'),
  ('10000000-0000-4000-8000-000000000003', 'google-pixel-9-pro', 'Google', 'Pixel 9 Pro', 'A refined AI-first smartphone with an advanced camera and all-day performance.')
on conflict (slug) do update set
  brand = excluded.brand,
  name = excluded.name,
  description = excluded.description,
  is_active = true;

insert into public.product_options (id, product_id, code, display_name, position)
values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'color', 'Color', 0),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'storage', 'Storage', 1),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', 'color', 'Color', 0),
  ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000002', 'storage', 'Storage', 1),
  ('20000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000003', 'color', 'Color', 0),
  ('20000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000003', 'storage', 'Storage', 1)
on conflict (product_id, code) do update set display_name = excluded.display_name, position = excluded.position;

insert into public.product_option_values (id, option_id, value, label, swatch_hex, position)
values
  ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'silver', 'Silver', '#D9D8D2', 0),
  ('30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 'cosmic-orange', 'Cosmic Orange', '#F57432', 1),
  ('30000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000002', '256gb', '256 GB', null, 0),
  ('30000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000003', 'titanium-gray', 'Titanium Gray', '#55565A', 0),
  ('30000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000003', 'titanium-violet', 'Titanium Violet', '#716487', 1),
  ('30000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000004', '256gb', '256 GB', null, 0),
  ('30000000-0000-4000-8000-000000000007', '20000000-0000-4000-8000-000000000004', '512gb', '512 GB', null, 1),
  ('30000000-0000-4000-8000-000000000008', '20000000-0000-4000-8000-000000000005', 'obsidian', 'Obsidian', '#303030', 0),
  ('30000000-0000-4000-8000-000000000009', '20000000-0000-4000-8000-000000000005', 'porcelain', 'Porcelain', '#EFE9DF', 1),
  ('30000000-0000-4000-8000-000000000010', '20000000-0000-4000-8000-000000000006', '128gb', '128 GB', null, 0),
  ('30000000-0000-4000-8000-000000000011', '20000000-0000-4000-8000-000000000006', '256gb', '256 GB', null, 1)
on conflict (option_id, value) do update set label = excluded.label, swatch_hex = excluded.swatch_hex, position = excluded.position;

insert into public.product_variants (id, product_id, sku, mrp_paise, sale_price_paise)
values
  ('40000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'IPH17P-SIL-256', 13490000, 12740000),
  ('40000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'IPH17P-ORG-256', 13490000, 12740000),
  ('40000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', 'S24U-GRY-256', 12999900, 10999900),
  ('40000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000002', 'S24U-VLT-512', 13999900, 11999900),
  ('40000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000003', 'PXL9P-OBS-128', 8999900, 7999900),
  ('40000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000003', 'PXL9P-POR-256', 9999900, 8999900)
on conflict (sku) do update set mrp_paise = excluded.mrp_paise, sale_price_paise = excluded.sale_price_paise, is_active = true;

insert into public.variant_option_values (variant_id, option_value_id)
values
  ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001'),
  ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000003'),
  ('40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002'),
  ('40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000003'),
  ('40000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000004'),
  ('40000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000006'),
  ('40000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000005'),
  ('40000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000007'),
  ('40000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000008'),
  ('40000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000010'),
  ('40000000-0000-4000-8000-000000000006', '30000000-0000-4000-8000-000000000009'),
  ('40000000-0000-4000-8000-000000000006', '30000000-0000-4000-8000-000000000011')
on conflict do nothing;

insert into public.variant_images (id, variant_id, storage_path, alt_text, position, is_primary)
values
  ('50000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'iphone-17-pro-silver.png', 'Silver iPhone 17 Pro front and back', 0, true),
  ('50000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000002', 'iphone-17-pro-silver.png', 'Cosmic Orange iPhone 17 Pro front and back', 0, true),
  ('50000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000003', 'galaxy-s24-ultra-gray.png', 'Titanium Gray Galaxy S24 Ultra front and back', 0, true),
  ('50000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000004', 'galaxy-s24-ultra-gray.png', 'Titanium Violet Galaxy S24 Ultra front and back', 0, true),
  ('50000000-0000-4000-8000-000000000005', '40000000-0000-4000-8000-000000000005', 'pixel-9-pro-porcelain.png', 'Obsidian Pixel 9 Pro front and back', 0, true),
  ('50000000-0000-4000-8000-000000000006', '40000000-0000-4000-8000-000000000006', 'pixel-9-pro-porcelain.png', 'Porcelain Pixel 9 Pro front and back', 0, true)
on conflict (variant_id, position) do update set storage_path = excluded.storage_path, alt_text = excluded.alt_text, is_primary = excluded.is_primary;

insert into public.emi_plan_templates (id, tenure_months, annual_interest_rate_bps, cashback_paise, position)
values
  ('60000000-0000-4000-8000-000000000001', 3, 0, 750000, 0),
  ('60000000-0000-4000-8000-000000000002', 6, 0, 750000, 1),
  ('60000000-0000-4000-8000-000000000003', 12, 0, 750000, 2),
  ('60000000-0000-4000-8000-000000000004', 24, 0, 750000, 3),
  ('60000000-0000-4000-8000-000000000005', 36, 1050, 750000, 4),
  ('60000000-0000-4000-8000-000000000006', 48, 1050, 750000, 5)
on conflict (tenure_months, annual_interest_rate_bps, cashback_paise) do update set position = excluded.position, is_active = true;

insert into public.product_emi_plans (product_id, plan_id)
select products.id, plans.id
from public.products as products
cross join public.emi_plan_templates as plans
where products.slug in ('iphone-17-pro', 'samsung-s24-ultra', 'google-pixel-9-pro')
  and plans.id in (
    '60000000-0000-4000-8000-000000000001',
    '60000000-0000-4000-8000-000000000002',
    '60000000-0000-4000-8000-000000000003',
    '60000000-0000-4000-8000-000000000004',
    '60000000-0000-4000-8000-000000000005',
    '60000000-0000-4000-8000-000000000006'
  )
on conflict (product_id, plan_id) do update set is_enabled = true;
