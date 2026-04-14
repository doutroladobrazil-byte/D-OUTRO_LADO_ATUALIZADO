/**
 * seed-reference-data.mjs
 *
 * Seeds reference tables that are not covered by Prisma migrations:
 *   - currencies (base rows: BRL, USD, EUR, AED — CHF/SGD added in Stage 12 migration)
 *   - languages
 *   - exchange_rates
 *   - shipping_regions
 *   - bag_pricing_rules
 *   - site_settings
 *
 * Safe to re-run — all inserts use ON CONFLICT DO NOTHING / DO UPDATE.
 *
 * Usage:
 *   node scripts/seed-reference-data.mjs
 */

import postgres from 'postgres';

// ── Load .env if present ────────────────────────────────────────────────────
try {
  const { config } = await import('dotenv');
  const { dirname, join } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const __dir = dirname(fileURLToPath(import.meta.url));
  config({ path: join(__dir, '..', '.env') });
} catch {
  // dotenv not installed — rely on environment
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL is not set.');
  process.exit(1);
}

const db = postgres(DATABASE_URL, {
  ssl: 'require',
  max: 1,
  connect_timeout: 20,
});

try {
  console.log('Connecting to database…');
  await db`SELECT 1`;
  console.log('Connected.\n');

  // ── Currencies ─────────────────────────────────────────────────────────────
  console.log('Seeding currencies…');
  await db`
    INSERT INTO currencies (code, symbol, is_active)
    VALUES
      ('BRL', 'R$',  true),
      ('USD', '$',   true),
      ('EUR', '€',   true),
      ('AED', 'AED', true),
      ('CHF', 'Fr.', true),
      ('SGD', 'S$',  true)
    ON CONFLICT (code) DO UPDATE
      SET symbol = EXCLUDED.symbol, is_active = EXCLUDED.is_active
  `;
  console.log('  ✓ currencies');

  // ── Languages ──────────────────────────────────────────────────────────────
  console.log('Seeding languages…');
  await db`
    INSERT INTO languages (code, label, is_active)
    VALUES
      ('pt', 'Português', true),
      ('en', 'English',   true),
      ('de', 'Deutsch',   true),
      ('ar', 'العربية',   false)
    ON CONFLICT (code) DO UPDATE
      SET label = EXCLUDED.label, is_active = EXCLUDED.is_active
  `;
  console.log('  ✓ languages');

  // ── Exchange rates ─────────────────────────────────────────────────────────
  console.log('Seeding exchange_rates…');
  await db`
    INSERT INTO exchange_rates (from_currency, to_currency, rate, source)
    VALUES
      ('BRL', 'BRL', 1.0,  'static'),
      ('BRL', 'USD', 0.18, 'static'),
      ('BRL', 'EUR', 0.17, 'static'),
      ('BRL', 'AED', 0.67, 'static'),
      ('BRL', 'CHF', 0.16, 'static'),
      ('BRL', 'SGD', 0.24, 'static')
    ON CONFLICT (from_currency, to_currency) DO UPDATE
      SET rate = EXCLUDED.rate, source = EXCLUDED.source, fetched_at = now()
  `;
  console.log('  ✓ exchange_rates');

  // ── Shipping regions (legacy) ──────────────────────────────────────────────
  console.log('Seeding shipping_regions…');
  await db`
    INSERT INTO shipping_regions (code, name, is_active)
    VALUES
      ('north-america', 'North America', true),
      ('europe',        'Europe',        true),
      ('middle-east',   'Middle East',   true)
    ON CONFLICT (code) DO NOTHING
  `;
  console.log('  ✓ shipping_regions');

  // ── Bag pricing rules (legacy) ─────────────────────────────────────────────
  console.log('Seeding bag_pricing_rules…');
  await db`
    INSERT INTO bag_pricing_rules (region, tax_brl, logistics_brl, margin_percent, is_active)
    VALUES
      ('North America', 0.00, 0.00, 0.00, true),
      ('Europe',        0.00, 0.00, 0.00, true),
      ('Middle East',   0.00, 0.00, 0.00, true)
    ON CONFLICT (region) DO NOTHING
  `;
  console.log('  ✓ bag_pricing_rules');

  // ── Site settings ──────────────────────────────────────────────────────────
  console.log('Seeding site_settings…');
  await db`
    INSERT INTO site_settings (key, value)
    VALUES
      ('platform.defaultCurrency',  '"BRL"'),
      ('platform.defaultLanguage',  '"pt"'),
      ('platform.supportedRegions', '["North America","Europe","Middle East"]'),
      ('platform.brands',           '["moda"]')
    ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = now()
  `;
  console.log('  ✓ site_settings');

  console.log('\nAll reference data seeded successfully.');

} catch (err) {
  console.error('\nSeeding failed:', err.message);
  await db.end().catch(() => {});
  process.exit(1);
}

await db.end();
process.exit(0);
