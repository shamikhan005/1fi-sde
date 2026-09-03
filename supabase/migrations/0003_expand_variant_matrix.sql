-- Expands the initial two-SKU seeds into complete Color x Storage matrices.
-- This migration is additive and is safe to apply after 0001 and 0002.

insert into public.product_option_values (id, option_id, value, label, swatch_hex, position)
values
  ('30000000-0000-4000-8000-000000000012', '20000000-0000-4000-8000-000000000002', '512gb', '512 GB', null, 1)
on conflict (option_id, value) do update set
  label = excluded.label,
  swatch_hex = excluded.swatch_hex,
  position = excluded.position;

insert into public.product_variants (id, product_id, sku, mrp_paise, sale_price_paise)
values
  ('40000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000001', 'IPH17P-SIL-512', 14490000, 13740000),
  ('40000000-0000-4000-8000-000000000008', '10000000-0000-4000-8000-000000000001', 'IPH17P-ORG-512', 14490000, 13740000),
  ('40000000-0000-4000-8000-000000000009', '10000000-0000-4000-8000-000000000002', 'S24U-GRY-512', 13999900, 11999900),
  ('40000000-0000-4000-8000-000000000010', '10000000-0000-4000-8000-000000000002', 'S24U-VLT-256', 12999900, 10999900),
  ('40000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000003', 'PXL9P-OBS-256', 9999900, 8999900),
  ('40000000-0000-4000-8000-000000000012', '10000000-0000-4000-8000-000000000003', 'PXL9P-POR-128', 8999900, 7999900)
on conflict (sku) do update set
  mrp_paise = excluded.mrp_paise,
  sale_price_paise = excluded.sale_price_paise,
  is_active = true;

insert into public.variant_option_values (variant_id, option_value_id)
values
  ('40000000-0000-4000-8000-000000000007', '30000000-0000-4000-8000-000000000001'),
  ('40000000-0000-4000-8000-000000000007', '30000000-0000-4000-8000-000000000012'),
  ('40000000-0000-4000-8000-000000000008', '30000000-0000-4000-8000-000000000002'),
  ('40000000-0000-4000-8000-000000000008', '30000000-0000-4000-8000-000000000012'),
  ('40000000-0000-4000-8000-000000000009', '30000000-0000-4000-8000-000000000004'),
  ('40000000-0000-4000-8000-000000000009', '30000000-0000-4000-8000-000000000007'),
  ('40000000-0000-4000-8000-000000000010', '30000000-0000-4000-8000-000000000005'),
  ('40000000-0000-4000-8000-000000000010', '30000000-0000-4000-8000-000000000006'),
  ('40000000-0000-4000-8000-000000000011', '30000000-0000-4000-8000-000000000008'),
  ('40000000-0000-4000-8000-000000000011', '30000000-0000-4000-8000-000000000011'),
  ('40000000-0000-4000-8000-000000000012', '30000000-0000-4000-8000-000000000009'),
  ('40000000-0000-4000-8000-000000000012', '30000000-0000-4000-8000-000000000010')
on conflict do nothing;

-- Every SKU has an explicit image record. Storage variants share their color's
-- visual because capacity does not alter the phone's physical finish.
insert into public.variant_images (id, variant_id, storage_path, alt_text, position, is_primary)
values
  ('50000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'iphone-17-pro-silver.png', 'Silver iPhone 17 Pro front and back', 0, true),
  ('50000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000002', 'iphone-17-pro-cosmic-orange.png', 'Cosmic Orange iPhone 17 Pro front and back', 0, true),
  ('50000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000003', 'galaxy-s24-ultra-gray.png', 'Titanium Gray Galaxy S24 Ultra front and back', 0, true),
  ('50000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000004', 'galaxy-s24-ultra-titanium-violet.png', 'Titanium Violet Galaxy S24 Ultra front and back', 0, true),
  ('50000000-0000-4000-8000-000000000005', '40000000-0000-4000-8000-000000000005', 'pixel-9-pro-obsidian.png', 'Obsidian Pixel 9 Pro front and back', 0, true),
  ('50000000-0000-4000-8000-000000000006', '40000000-0000-4000-8000-000000000006', 'pixel-9-pro-porcelain.png', 'Porcelain Pixel 9 Pro front and back', 0, true),
  ('50000000-0000-4000-8000-000000000007', '40000000-0000-4000-8000-000000000007', 'iphone-17-pro-silver.png', 'Silver iPhone 17 Pro, 512 GB, front and back', 0, true),
  ('50000000-0000-4000-8000-000000000008', '40000000-0000-4000-8000-000000000008', 'iphone-17-pro-cosmic-orange.png', 'Cosmic Orange iPhone 17 Pro, 512 GB, front and back', 0, true),
  ('50000000-0000-4000-8000-000000000009', '40000000-0000-4000-8000-000000000009', 'galaxy-s24-ultra-gray.png', 'Titanium Gray Galaxy S24 Ultra, 512 GB, front and back', 0, true),
  ('50000000-0000-4000-8000-000000000010', '40000000-0000-4000-8000-000000000010', 'galaxy-s24-ultra-titanium-violet.png', 'Titanium Violet Galaxy S24 Ultra, 256 GB, front and back', 0, true),
  ('50000000-0000-4000-8000-000000000011', '40000000-0000-4000-8000-000000000011', 'pixel-9-pro-obsidian.png', 'Obsidian Pixel 9 Pro, 256 GB, front and back', 0, true),
  ('50000000-0000-4000-8000-000000000012', '40000000-0000-4000-8000-000000000012', 'pixel-9-pro-porcelain.png', 'Porcelain Pixel 9 Pro, 128 GB, front and back', 0, true)
on conflict (variant_id, position) do update set
  storage_path = excluded.storage_path,
  alt_text = excluded.alt_text,
  is_primary = excluded.is_primary;
