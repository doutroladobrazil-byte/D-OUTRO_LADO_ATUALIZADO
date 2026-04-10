/**
 * Bag recovery job — standalone script for cron execution.
 *
 * Usage:
 *   node dist/jobs/bag-recovery.job.js
 *
 * Or via HTTP trigger (Render cron / external scheduler):
 *   POST /api/internal/recovery/process
 *   Authorization: Bearer $RECOVERY_JOB_SECRET
 *
 * This script calls the same processAbandonedBags() logic directly,
 * so it can be run in-process by a scheduler (e.g. node-cron) without
 * the HTTP overhead.
 */

import "../config/env.js"; // Ensure env is loaded before anything else
import { processAbandonedBags } from "../domains/recovery/recovery.service.js";

async function main() {
  const start = Date.now();
  const result = await processAbandonedBags();
  const elapsed = Date.now() - start;
  process.stdout.write(
    `[bag-recovery] processed=${result.processed} elapsed=${elapsed}ms\n`
  );
}

main().catch((err) => {
  process.stderr.write(`[bag-recovery] FATAL: ${err}\n`);
  process.exit(1);
});
