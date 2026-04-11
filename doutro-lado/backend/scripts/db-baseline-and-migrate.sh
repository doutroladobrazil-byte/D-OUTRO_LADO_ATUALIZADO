#!/usr/bin/env bash
# =============================================================================
# db-baseline-and-migrate.sh
#
# USE CASE A: Database was set up via Supabase SQL Editor (schema.sql).
#   → Marks all migrations as "applied" without re-running SQL.
#
# USE CASE B: Database was already migrated via Prisma.
#   → Just runs prisma migrate deploy for any pending migrations.
#
# Run from: doutro-lado/backend/
# Usage:
#   DATABASE_URL="postgresql://postgres:PASS@db.REF.supabase.co:5432/postgres" \
#     bash scripts/db-baseline-and-migrate.sh
#
# Or set DATABASE_URL in backend/.env first, then just:
#   bash scripts/db-baseline-and-migrate.sh
# =============================================================================
set -euo pipefail

# Load .env if it exists
if [[ -f ".env" ]]; then
  export $(grep -v '^#' .env | grep -v '^$' | xargs)
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL is not set."
  echo ""
  echo "Usage:"
  echo "  1. Create backend/.env with:"
  echo "     DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECTREF.supabase.co:5432/postgres"
  echo "  2. Then run: bash scripts/db-baseline-and-migrate.sh"
  echo ""
  echo "  Or pass inline:"
  echo "  DATABASE_URL='postgresql://...' bash scripts/db-baseline-and-migrate.sh"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
cd "$BACKEND_DIR"

echo "=== Step 1: Validate Prisma schema ==="
npx prisma validate
echo ""

echo "=== Step 2: Check if _prisma_migrations table exists ==="
# Use Node.js with the postgres package to check for migration table
HAS_MIGRATIONS_TABLE=$(node --input-type=module <<'EOF'
import postgres from 'postgres';
const db = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  max: 1,
  connect_timeout: 10,
});
try {
  const r = await db`SELECT to_regclass('_prisma_migrations') AS t`;
  console.log(r[0].t ? 'yes' : 'no');
} catch(e) {
  console.error('error:', e.message);
  process.exit(1);
} finally {
  await db.end();
}
EOF
)

echo "  → _prisma_migrations table: $HAS_MIGRATIONS_TABLE"
echo ""

ALL_MIGRATION_NAMES=(
  "20260406000000_init"
  "20260406000001_stage1_catalog"
  "20260406000002_stage4_auth"
  "20260406000003_stage6_gift_kits"
  "20260406000004_stage7_stripe"
  "20260406000005_stage9_i18n"
  "20260406000006_stage11_pricing"
)

if [[ "$HAS_MIGRATIONS_TABLE" == "no" ]]; then
  echo "==================================================================="
  echo "  No Prisma migration history found."
  echo "  Assuming database was set up via Supabase SQL Editor (schema.sql)."
  echo "  All migrations will be marked as 'applied' without re-running SQL."
  echo "  (All migration SQL uses IF NOT EXISTS — safe to re-run if needed)"
  echo "==================================================================="
  echo ""

  for migration in "${ALL_MIGRATION_NAMES[@]}"; do
    echo "  Marking as applied: $migration"
    npx prisma migrate resolve --applied "$migration"
  done

  echo ""
  echo "=== All migrations marked. Running status check ==="
  npx prisma migrate status

elif [[ "$HAS_MIGRATIONS_TABLE" == "yes" ]]; then
  echo "=== Prisma migration history found. ==="
  echo ""
  echo "=== Checking status ==="
  npx prisma migrate status || true
  echo ""
  echo "=== Deploying pending migrations ==="
  npx prisma migrate deploy
  echo ""
  echo "=== Final status ==="
  npx prisma migrate status

else
  echo "ERROR: Unexpected response from database check."
  exit 1
fi

echo ""
echo "================================================================="
echo " Done!"
echo " All Prisma migrations are now tracked in _prisma_migrations."
echo " Run 'npx prisma migrate status' to verify at any time."
echo "================================================================="
