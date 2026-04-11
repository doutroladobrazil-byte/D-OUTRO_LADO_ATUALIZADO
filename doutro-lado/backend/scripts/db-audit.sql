-- =============================================================================
-- D'OUTRO LADO — Database Audit Script
-- Run this in Supabase SQL Editor to compare your live DB against the
-- expected schema defined in prisma/schema.prisma and supabase/schema.sql
-- =============================================================================

-- 1. List all tables in public schema
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Check for required tables (run each individually or all at once)
SELECT
  t.expected_table,
  CASE WHEN it.table_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END AS status
FROM (VALUES
  ('profiles'),
  ('categories'),
  ('subcategories'),
  ('products'),
  ('product_images'),
  ('media_assets'),
  ('product_media'),
  ('wholesale_rules'),
  ('favorites'),
  ('carts'),
  ('cart_items'),
  ('addresses'),
  ('shipping_regions'),
  ('shipping_rates'),
  ('currencies'),
  ('languages'),
  ('exchange_rates'),
  ('product_translations'),
  ('gift_kits'),
  ('gift_kit_items'),
  ('orders'),
  ('order_items'),
  ('payment_records'),
  ('fiscal_records'),
  ('banners'),
  ('sliders'),
  ('site_settings'),
  ('recommendation_events'),
  ('admin_logs'),
  ('bag_pricing_rules'),
  ('bag_recovery_offers'),
  ('bag_abandonment_events')
) t(expected_table)
LEFT JOIN information_schema.tables it
  ON it.table_schema = 'public' AND it.table_name = t.expected_table
ORDER BY status DESC, t.expected_table;

-- 3. Check profiles columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. Check orders columns (should have: pricing_version, stock_deducted_at, offer_code, discount_brl, stripe_session_id, estimated_weight_range)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'orders'
ORDER BY ordinal_position;

-- 5. Check gift_kits columns (should have: brand, packaging_type, subtotal_brl, packaging_surcharge_brl, updated_at)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'gift_kits'
ORDER BY ordinal_position;

-- 6. Check order_items columns (should have: gift_kit_id)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'order_items'
ORDER BY ordinal_position;

-- 7. Check triggers
SELECT trigger_name, event_object_schema, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema IN ('public', 'auth')
   OR event_object_schema IN ('public', 'auth')
ORDER BY event_object_table, trigger_name;

-- 8. Check functions
SELECT routine_name, routine_schema
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- 9. Check bag_pricing_rules data
SELECT * FROM bag_pricing_rules ORDER BY region;

-- 10. Check migration history
SELECT id, migration_name, finished_at
FROM _prisma_migrations
ORDER BY finished_at DESC NULLS LAST;

-- 11. Validate auth trigger
SELECT
  t.trigger_name,
  t.event_object_schema || '.' || t.event_object_table AS target_table,
  t.action_timing,
  t.event_manipulation,
  r.routine_name AS function_called
FROM information_schema.triggers t
LEFT JOIN information_schema.routines r
  ON r.routine_schema = 'public' AND r.routine_name = 'handle_new_auth_user'
WHERE t.trigger_name = 'on_auth_user_created';

-- 12. Row counts (basic health check)
SELECT
  'profiles' AS tbl, COUNT(*)::text AS rows FROM profiles
UNION ALL SELECT 'categories', COUNT(*)::text FROM categories
UNION ALL SELECT 'products',   COUNT(*)::text FROM products
UNION ALL SELECT 'orders',     COUNT(*)::text FROM orders
UNION ALL SELECT 'carts',      COUNT(*)::text FROM carts
UNION ALL SELECT 'shipping_regions', COUNT(*)::text FROM shipping_regions
UNION ALL SELECT 'bag_pricing_rules', COUNT(*)::text FROM bag_pricing_rules
ORDER BY tbl;
