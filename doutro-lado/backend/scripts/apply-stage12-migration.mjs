/**
 * apply-stage12-migration.mjs
 *
 * Applies the Stage 12 migration directly via postgres.js, bypassing the
 * Prisma CLI (which requires the schema-engine binary and a direct DB URL).
 *
 * Usage:
 *   node scripts/apply-stage12-migration.mjs
 *
 * Reads DATABASE_URL from environment (or .env if dotenv is available).
 * Safe to re-run — all DDL uses IF NOT EXISTS and ON CONFLICT DO NOTHING.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import postgres from 'postgres';

const __dir = dirname(fileURLToPath(import.meta.url));

// ── Load .env if present ────────────────────────────────────────────────────
try {
  const { config } = await import('dotenv');
  config({ path: join(__dir, '..', '.env') });
} catch {
  // dotenv not installed — rely on environment
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL is not set.');
  process.exit(1);
}

const MIGRATION_NAME = '20260413000007_stage12_country_first';
const MIGRATION_FILE = join(
  __dir, '..', 'prisma', 'migrations', MIGRATION_NAME, 'migration.sql'
);

const sql = readFileSync(MIGRATION_FILE, 'utf8');

// ── Connect ─────────────────────────────────────────────────────────────────
const db = postgres(DATABASE_URL, {
  ssl: 'require',
  max: 1,
  connect_timeout: 20,
  // postgres.js default: runs each tagged-template as a single statement.
  // For multi-statement SQL we use db.unsafe().
});

try {
  console.log(`Connecting to database…`);
  await db`SELECT 1`;
  console.log('Connected.\n');

  // Check if already applied
  const existing = await db`
    SELECT id FROM _prisma_migrations
    WHERE migration_name = ${MIGRATION_NAME}
    LIMIT 1
  `.catch(() => []);

  if (existing.length > 0) {
    console.log(`Migration "${MIGRATION_NAME}" is already recorded — skipping SQL execution.`);
    console.log('Done.');
    await db.end();
    process.exit(0);
  }

  console.log(`Applying migration: ${MIGRATION_NAME}`);
  console.log('Running SQL…\n');

  // Execute the full migration SQL
  await db.unsafe(sql);

  // Record in _prisma_migrations
  await db`
    INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, applied_steps_count)
    VALUES (
      gen_random_uuid()::text,
      'applied-via-script',
      now(),
      ${MIGRATION_NAME},
      1
    )
    ON CONFLICT DO NOTHING
  `;

  console.log(`\nMigration "${MIGRATION_NAME}" applied successfully.`);
  console.log('Tables created: supported_countries, country_commerce_rules, country_shipping_rules');
  console.log('Orders table: new country snapshot columns added');
  console.log('Currencies: CHF and SGD added');
  console.log('Seeded: 6 MVP countries with commerce and shipping rules');

} catch (err) {
  console.error('\nMigration failed:', err.message);
  await db.end().catch(() => {});
  process.exit(1);
}

await db.end();
process.exit(0);
