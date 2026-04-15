/**
 * Stage 15 — System Event Logger
 *
 * Writes system-generated events to admin_logs with adminProfileId = null.
 * Used for reservation lifecycle, payment confirmation, and stock deduction
 * audit trail. Failures are non-fatal (logged to stderr, not re-thrown).
 *
 * Recognized actions:
 *   reservation_created   — stock reserved at checkout start
 *   reservation_consumed  — reservation consumed on payment webhook
 *   reservation_expired   — reservation TTL elapsed
 *   reservation_released  — reservation released on cancel/manual
 *   payment_confirmed     — checkout.session.completed received
 *   stock_decremented     — physical stock deducted after payment
 */

import { db } from "../../lib/db.js";

export async function logSystemEvent(
  action: string,
  entityType: string,
  entityId: string,
  payload?: Record<string, unknown>
): Promise<void> {
  try {
    await db`
      INSERT INTO admin_logs (admin_profile_id, action, entity_type, entity_id, payload)
      VALUES (NULL, ${action}, ${entityType}, ${entityId}, ${payload ? JSON.stringify(payload) : null})
    `;
  } catch (err) {
    // Non-fatal — log to stderr but do not propagate
    console.error("[system-log] Failed to write event:", action, entityType, entityId, err);
  }
}
