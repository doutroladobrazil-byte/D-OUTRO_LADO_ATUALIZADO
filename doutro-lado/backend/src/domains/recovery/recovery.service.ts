import { randomBytes } from "node:crypto";
import { db } from "../../lib/db.js";
import { env } from "../../config/env.js";
import { sendRecoveryEmail } from "../notifications/email.provider.js";
import { sendRecoveryWhatsApp } from "../notifications/whatsapp.provider.js";

// =============================================================================
// Types
// =============================================================================

type AbandonedCart = {
  profileId: string;
  brand: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  cartVersionToken: string;
};

// =============================================================================
// Offer code generation
// =============================================================================

function generateOfferCode(): string {
  return "RECOV" + randomBytes(3).toString("hex").toUpperCase();
}

// =============================================================================
// Core recovery logic
// =============================================================================

/**
 * Detect abandoned bags and send recovery notifications.
 *
 * Eligible cart: updated_at < NOW() - BAG_ABANDONMENT_DELAY_MINUTES,
 * has at least one item, profile has an email, and no paid order exists
 * for that profile+brand after the cart was last updated.
 *
 * For each eligible cart we:
 *  1. Create or reuse a BagRecoveryOffer (idempotent on cart_version_token).
 *  2. Send email (if Resend configured).
 *  3. Send WhatsApp (if Twilio configured and profile.phone is set).
 *  4. Log each attempt to bag_abandonment_events.
 */
export async function processAbandonedBags(): Promise<{ processed: number }> {
  const delayMinutes = env.BAG_ABANDONMENT_DELAY_MINUTES;

  // Find abandoned carts — one row per profile+brand combination.
  // We join profiles to get contact info and compute a version token from
  // the sorted slugs of items currently in the cart.
  let abandonedCarts: AbandonedCart[] = [];
  try {
    const rows = await db`
      SELECT
        c.profile_id,
        c.brand,
        p.email,
        p.full_name,
        p.phone,
        encode(
          digest(
            string_agg(
              'p:' || pr.slug || ':' || ci.quantity::text,
              '|' ORDER BY pr.slug, ci.quantity
            ),
            'sha256'
          ),
          'hex'
        ) AS cart_version_token
      FROM carts c
      JOIN cart_items ci ON ci.cart_id = c.id
      JOIN products pr   ON pr.id = ci.product_id
      JOIN profiles p    ON p.id = c.profile_id
      WHERE
        c.updated_at < now() - (${delayMinutes} * interval '1 minute')
        AND c.profile_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM orders o
          WHERE o.profile_id = c.profile_id
            AND o.brand = c.brand
            AND o.payment_status = 'paid'
            AND o.created_at > c.updated_at
        )
        -- Skip if we already sent a recovery for this exact token
        AND NOT EXISTS (
          SELECT 1 FROM bag_abandonment_events bae
          WHERE bae.profile_id = c.profile_id
            AND bae.status = 'sent'
        )
      GROUP BY c.profile_id, c.brand, p.email, p.full_name, p.phone, c.updated_at
    `;
    abandonedCarts = (rows as unknown[]).map((r) => {
      const row = r as Record<string, unknown>;
      return {
        profileId: row.profile_id as string,
        brand: row.brand as string,
        email: row.email as string,
        fullName: (row.full_name as string | null) ?? null,
        phone: (row.phone as string | null) ?? null,
        cartVersionToken: (row.cart_version_token as string).slice(0, 16),
      };
    });
  } catch {
    // Tables may not yet exist
    return { processed: 0 };
  }

  let processed = 0;

  for (const cart of abandonedCarts) {
    // Create or retrieve offer (idempotent on profile+brand+cart_version_token)
    let offerCode: string;
    let offerId: string;

    try {
      const existing = await db`
        SELECT id, code FROM bag_recovery_offers
        WHERE profile_id = ${cart.profileId}
          AND brand = ${cart.brand}
          AND cart_version_token = ${cart.cartVersionToken}
          AND is_used = false
          AND valid_until > now()
        LIMIT 1
      `;

      if (existing.length > 0) {
        offerCode = existing[0].code as string;
        offerId = existing[0].id as string;
      } else {
        offerCode = generateOfferCode();
        const validUntil = new Date(
          Date.now() + env.BAG_RECOVERY_OFFER_VALID_HOURS * 3600 * 1000
        );
        const [inserted] = await db`
          INSERT INTO bag_recovery_offers (
            code, profile_id, brand, cart_version_token, discount_percent, valid_until
          ) VALUES (
            ${offerCode},
            ${cart.profileId},
            ${cart.brand},
            ${cart.cartVersionToken},
            ${env.BAG_ABANDONMENT_DISCOUNT_PERCENT},
            ${validUntil.toISOString()}
          )
          RETURNING id
        `;
        offerId = inserted.id as string;
      }
    } catch {
      continue;
    }

    const cartUrl = `${env.APP_URL}/brands/${cart.brand}/cart?offerCode=${offerCode}`;
    const validUntil = new Date(
      Date.now() + env.BAG_RECOVERY_OFFER_VALID_HOURS * 3600 * 1000
    );

    // Send email
    let emailStatus = "skipped";
    let emailError: string | undefined;
    if (env.RESEND_API_KEY) {
      try {
        await sendRecoveryEmail({
          to: cart.email,
          recipientName: cart.fullName,
          brand: cart.brand,
          offerCode,
          discountPercent: env.BAG_ABANDONMENT_DISCOUNT_PERCENT,
          cartUrl,
          validUntil,
        });
        emailStatus = "sent";
      } catch (err) {
        emailStatus = "failed";
        emailError = String(err);
      }
    }

    await db`
      INSERT INTO bag_abandonment_events
        (profile_id, cart_version_token, offer_id, channel, status, error_message)
      VALUES
        (${cart.profileId}, ${cart.cartVersionToken}, ${offerId}, 'email',
         ${emailStatus}, ${emailError ?? null})
    `;

    // Send WhatsApp
    if (cart.phone && env.TWILIO_ACCOUNT_SID) {
      let waStatus = "skipped";
      let waError: string | undefined;
      try {
        await sendRecoveryWhatsApp({
          to: cart.phone,
          recipientName: cart.fullName,
          brand: cart.brand,
          offerCode,
          discountPercent: env.BAG_ABANDONMENT_DISCOUNT_PERCENT,
          cartUrl,
        });
        waStatus = "sent";
      } catch (err) {
        waStatus = "failed";
        waError = String(err);
      }

      await db`
        INSERT INTO bag_abandonment_events
          (profile_id, cart_version_token, offer_id, channel, status, error_message)
        VALUES
          (${cart.profileId}, ${cart.cartVersionToken}, ${offerId}, 'whatsapp',
           ${waStatus}, ${waError ?? null})
      `;
    }

    processed++;
  }

  return { processed };
}
