import type { Request, Response } from "express";
import Stripe from "stripe";
import { env } from "../../config/env.js";
import { stripe } from "../../lib/stripe.js";
import { fail, ok } from "../../utils/http.js";
import {
  attachStripeSession,
  buildOrder,
  cancelOrderAtCheckout,
  deductStockForOrder,
  markOrderAwaitingPayment,
  updatePaymentStatus,
} from "../orders/orders.service.js";
import {
  attachSessionToReservations,
  checkAndReserve,
  consumeReservations,
  consumeReservationsByOrder,
  releaseReservations,
  releaseReservationsBySession,
} from "../orders/reservation.service.js";
import { logSystemEvent } from "../admin/system-log.service.js";
import { clearCart, getCartByProfile } from "../cart/cart.service.js";

// =============================================================================
// POST /stripe/checkout
// =============================================================================

/**
 * Full checkout flow:
 * 1. Build + persist order
 * 2. Reserve stock (throws → cancels order, no Stripe session created)
 * 3a. Mock mode → consume reservations, mark order processing, return
 * 3b. Stripe mode → create session (throws → release reservations, cancel order)
 * 4. Attach session ID to order + reservations, mark awaiting_payment
 * 5. Clear cart, return session URL
 *
 * Failure semantics:
 *   - reservation failure: order cancelled, reservation never created
 *   - Stripe session failure: order cancelled, reservations released
 *   - Everything else (post-session): Stripe will eventually fire
 *     checkout.session.expired which releases reservations + cancels order
 */
export async function createCheckoutSession(req: Request, res: Response) {
  // Stage 14: req.user is optional — guest checkout uses optionalAuth
  const profileId = req.user?.profileId;
  const role = req.user?.role ?? "customer";

  // Track built order so the catch block can cancel it on pre-payment failure
  let orderId: string | null = null;
  let reservationCreated = false;

  try {
    // ── 1. Build + persist the order ──────────────────────────────────────
    const orderPreview = await buildOrder(req.body, role, profileId);
    orderId = orderPreview.orderId;

    // ── 2. Reserve stock ──────────────────────────────────────────────────
    // Throws with a human-readable message when any item is unavailable.
    await checkAndReserve(
      orderPreview.items.map((item) => ({
        productId: item.productId,
        slug: item.slug,
        name: item.name,
        quantity: item.quantity,
      })),
      orderPreview.orderId
    );
    reservationCreated = true;

    // ── 3a. Mock mode — treat as payment confirmed immediately ─────────────
    if (!stripe || env.PAYMENTS_MODE !== "stripe") {
      // Consume the reservations (stock hold is no longer needed — mock = paid)
      await consumeReservationsByOrder(orderPreview.orderId);
      // Clear cart
      if (profileId) {
        const cart = await getCartByProfile(profileId, orderPreview.brand).catch(() => null);
        if (cart?.id) await clearCart(cart.id);
      }
      return ok(res, {
        mode: "mock",
        sessionId: `mock_${orderPreview.publicId}`,
        checkoutUrl: null,
        orderPreview,
      });
    }

    // ── 3b. Stripe mode — create checkout session ─────────────────────────
    //
    // All-in pricing: the total already embeds freight + tax + logistics + margin.
    // Distributed proportionally across line items so sum = totalBRL exactly.
    const totalCents = Math.round(orderPreview.totalBRL * 100);
    const items = orderPreview.items;
    const lineAmountCents: number[] = [];
    let allocatedCents = 0;
    for (let i = 0; i < items.length - 1; i++) {
      const cents = Math.round((items[i].lineTotalBRL / orderPreview.subtotalBRL) * totalCents);
      lineAmountCents.push(cents);
      allocatedCents += cents;
    }
    lineAmountCents.push(totalCents - allocatedCents);

    // Stage 14: pre-fill Stripe customer email from contact snapshot
    const contactEmail = (req.body as Record<string, unknown>)?.contact &&
      typeof (req.body as Record<string, { email?: string }>).contact.email === "string"
        ? (req.body as Record<string, { email?: string }>).contact.email
        : undefined;

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        success_url: `${env.APP_URL}/brands/${orderPreview.brand}/checkout?status=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.APP_URL}/brands/${orderPreview.brand}/checkout?status=cancelled`,
        ...(contactEmail ? { customer_email: contactEmail } : {}),
        metadata: {
          orderId: orderPreview.orderId,
          publicId: orderPreview.publicId,
          brand: orderPreview.brand,
          region: orderPreview.region,
          pricingTier: orderPreview.pricingTier,
        },
        line_items: items.map((item, i) => ({
          quantity: 1,
          price_data: {
            currency: "brl",
            unit_amount: lineAmountCents[i],
            product_data: {
              name: item.quantity > 1 ? `${item.name} × ${item.quantity}` : item.name,
              metadata: { sku: item.sku, slug: item.slug },
            },
          },
        })),
      });
    } catch (stripeError) {
      // Stripe session creation failed — release reservations, cancel order
      await releaseReservations(orderPreview.orderId).catch(() => {});
      await cancelOrderAtCheckout(
        orderPreview.orderId,
        `Stripe session creation failed: ${stripeError instanceof Error ? stripeError.message : "unknown"}`
      ).catch(() => {});
      throw stripeError;
    }

    // ── 4. Attach session + mark awaiting_payment ─────────────────────────
    await attachStripeSession(orderPreview.orderId, session.id);
    await attachSessionToReservations(orderPreview.orderId, session.id);
    await markOrderAwaitingPayment(orderPreview.orderId);

    // ── 5. Clear cart ─────────────────────────────────────────────────────
    if (profileId) {
      const cart = await getCartByProfile(profileId, orderPreview.brand).catch(() => null);
      if (cart?.id) await clearCart(cart.id);
    }

    return ok(res, {
      mode: "stripe",
      sessionId: session.id,
      checkoutUrl: session.url,
      orderPreview,
    });

  } catch (error) {
    // If order was persisted but we failed before or during reservation,
    // cancel the order so it doesn't appear as a pending real order in admin.
    if (orderId && !reservationCreated) {
      await cancelOrderAtCheckout(
        orderId,
        error instanceof Error ? error.message : "reservation failed"
      ).catch(() => {});
    }
    return fail(res, error instanceof Error ? error.message : "Unable to create checkout session", 400);
  }
}

// =============================================================================
// POST /stripe/webhook (raw body — registered in app.ts BEFORE json middleware)
// =============================================================================

function readRawBody(body: unknown) {
  if (Buffer.isBuffer(body)) return body;
  if (typeof body === "string") return Buffer.from(body);
  return null;
}

export async function handleStripeWebhook(req: Request, res: Response) {
  // Mock mode — acknowledge without processing
  if (!stripe || env.PAYMENTS_MODE !== "stripe" || !env.STRIPE_WEBHOOK_SECRET) {
    return ok(res, { received: true, mode: "mock" });
  }

  const signature = req.header("stripe-signature");
  const rawBody = readRawBody(req.body);
  if (!signature || !rawBody) {
    return fail(res, "Missing webhook signature or raw body", 400);
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : "Invalid webhook payload", 400);
  }

  const session = event.data.object as Stripe.Checkout.Session;

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        // Payment succeeded (card authorized and charged)
        const paymentIntentId =
          typeof session.payment_intent === "string" ? session.payment_intent : undefined;
        await updatePaymentStatus(session.id, "paid", paymentIntentId);
        // Consume active reservations (idempotent — only transitions 'active')
        await consumeReservations(session.id);
        // Deduct stock once — idempotent via stock_deducted_at
        const orderId = session.metadata?.orderId;
        if (orderId) {
          await deductStockForOrder(orderId);
          await logSystemEvent("payment_confirmed", "order", orderId, {
            stripeSessionId: session.id,
            paymentIntentId,
          });
        }
        break;
      }

      case "checkout.session.expired": {
        // User abandoned / session timed out — release stock hold
        await updatePaymentStatus(session.id, "failed");

        // Release reservations — prefer orderId from metadata for direct FK lookup
        const expiredOrderId = session.metadata?.orderId;
        if (expiredOrderId) {
          await releaseReservations(expiredOrderId);
        } else {
          // Fallback: release by stripe session ID
          await releaseReservationsBySession(session.id);
        }
        await logSystemEvent("checkout_expired", "order", expiredOrderId ?? session.id, {
          stripeSessionId: session.id,
        });
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const checkoutSessionId =
          typeof charge.metadata?.checkout_session_id === "string"
            ? charge.metadata.checkout_session_id
            : null;
        if (checkoutSessionId) {
          await updatePaymentStatus(checkoutSessionId, "refunded");
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    // Log but do not return 4xx — Stripe will retry on 4xx but not on 2xx
    console.error("[webhook] Processing error:", err);
  }

  return ok(res, {
    received: true,
    mode: "stripe",
    eventType: event.type,
    publicId: session.metadata?.publicId ?? null,
  });
}
