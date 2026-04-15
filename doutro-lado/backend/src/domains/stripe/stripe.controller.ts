import type { Request, Response } from "express";
import Stripe from "stripe";
import { env } from "../../config/env.js";
import { stripe } from "../../lib/stripe.js";
import { fail, ok } from "../../utils/http.js";
import {
  attachStripeSession,
  buildOrder,
  deductStockForOrder,
  updatePaymentStatus,
} from "../orders/orders.service.js";
import { clearCart } from "../cart/cart.service.js";
import { getCartByProfile } from "../cart/cart.service.js";

// =============================================================================
// POST /stripe/checkout
// =============================================================================

/**
 * Full checkout flow:
 * 1. Build + persist the order from cart items (or raw payload)
 * 2. Create Stripe checkout session
 * 3. Persist payment_records row + attach stripe_session_id to order
 * 4. Clear the cart so it resets for next purchase
 * 5. Return { sessionId, checkoutUrl }
 */
export async function createCheckoutSession(req: Request, res: Response) {
  try {
    // Stage 14: req.user is optional — guest checkout uses optionalAuth.
    const profileId = req.user?.profileId;
    const role = req.user?.role ?? "customer";

    // Build the order — persisted to DB
    const orderPreview = await buildOrder(req.body, role, profileId);

    // ── Mock mode (no Stripe key) ───────────────────────────────────────────
    if (!stripe || env.PAYMENTS_MODE !== "stripe") {
      // Still clear cart on successful mock order
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

    // ── Real Stripe checkout session ────────────────────────────────────────
    //
    // All-in pricing: the total already embeds freight + tax + logistics + margin.
    // We do NOT create a separate freight/tax line item.
    //
    // The all-in total is distributed proportionally across product line items
    // so that sum(unit_amount × quantity) = totalBRL exactly.
    //
    // Algorithm:
    //   1. For each item i < N-1: lineAmountCents[i] = round(lineTotalBRL[i] / subtotalBRL * totalCents)
    //   2. Last item absorbs the remainder to guarantee exact sum.
    //   3. unit_amount = 1 (quantity folded into name) — avoids non-integer cents per unit.
    const totalCents = Math.round(orderPreview.totalBRL * 100);
    const items = orderPreview.items;

    const lineAmountCents: number[] = [];
    let allocatedCents = 0;
    for (let i = 0; i < items.length - 1; i++) {
      const cents = Math.round((items[i].lineTotalBRL / orderPreview.subtotalBRL) * totalCents);
      lineAmountCents.push(cents);
      allocatedCents += cents;
    }
    // Last item absorbs any rounding remainder
    lineAmountCents.push(totalCents - allocatedCents);

    // Stage 14: pre-fill Stripe customer email from contact snapshot when available.
    const contactEmail = (req.body as Record<string, unknown>)?.contact &&
      typeof (req.body as Record<string, { email?: string }>).contact.email === "string"
        ? (req.body as Record<string, { email?: string }>).contact.email
        : undefined;

    const session = await stripe.checkout.sessions.create({
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

    // Persist payment record + attach session ID to order
    await attachStripeSession(orderPreview.orderId, session.id);

    // Clear cart after successful order + session creation
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
        // Deduct stock once — idempotent via stock_deducted_at
        const orderId = session.metadata?.orderId;
        if (orderId) await deductStockForOrder(orderId);
        break;
      }
      case "checkout.session.expired": {
        // User abandoned checkout
        await updatePaymentStatus(session.id, "failed");
        break;
      }
      case "charge.refunded": {
        // Refund issued — session ID stored in charge metadata or payment record
        // Handled separately; mark as refunded if we have the session ID
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
        // Unhandled event type — acknowledge safely
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
