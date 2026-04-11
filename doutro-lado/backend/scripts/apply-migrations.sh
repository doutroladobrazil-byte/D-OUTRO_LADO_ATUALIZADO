#!/usr/bin/env bash
# =============================================================================
# apply-migrations.sh
# Run from: doutro-lado/backend/
# Usage: DATABASE_URL="postgresql://..." bash scripts/apply-migrations.sh
# =============================================================================
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL is not set."
  echo "Usage: DATABASE_URL='postgresql://...' bash scripts/apply-migrations.sh"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Prisma validate ==="
cd "$BACKEND_DIR"
npx prisma validate

echo ""
echo "=== Prisma migrate status ==="
npx prisma migrate status || true

echo ""
echo "=== Applying migrations ==="
npx prisma migrate deploy

echo ""
echo "=== Done. Migration status after apply ==="
npx prisma migrate status
