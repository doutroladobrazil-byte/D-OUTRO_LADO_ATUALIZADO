import type { Request, Response } from "express";
import Stripe from "stripe";
import { env } from "../../config/env.js";
import { stripe } from "../../lib/stripe.js";
import { fail, ok } from "../../utils/http.js";
import { buildOrder } from "../orders/orders.service.js";

export async function createCheckoutSession(req: Request, res: Response) {
  try {
    const orderPreview = buildOrder(req.body, req.user?.role);

    if (!stripe || env.PAYMENTS_MODE !== "stripe") {
      return ok(res, {
        mode: "mock",
        sessionId: `mock_${orderPreview.publicId}`,
        checkoutUrl: null,
        orderPreview
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${env.APP_URL}/checkout?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.APP_URL}/checkout?status=cancelled`,
      metadata: {
        publicId: orderPreview.publicId,
        region: orderPreview.region,
        pricingTier: orderPreview.pricingTier
      },
      line_items: [
        ...orderPreview.items.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: "brl",
            unit_amount: Math.round(item.unitPriceBRL * 100),
            product_data: {
              name: item.name,
              metadata: {
                sku: item.sku,
                slug: item.slug
              }
            }
          }
        })),
        {
          quantity: 1,
          price_data: {
            currency: "brl",
            unit_amount: Math.round(orderPreview.freightBRL * 100),
            product_data: {
              name: `Frete internacional (${orderPreview.estimatedWeightRange})`
            }
          }
        }
      ]
    });

    return ok(res, {
      mode: "stripe",
      sessionId: session.id,
      checkoutUrl: session.url,
      orderPreview
    });
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : "Unable to create checkout session", 400);
  }
}

function readRawBody(body: unknown) {
  if (Buffer.isBuffer(body)) return body;
  if (typeof body === "string") return Buffer.from(body);
  return null;
}

export async function handleStripeWebhook(req: Request, res: Response) {
  if (!stripe || env.PAYMENTS_MODE !== "stripe" || !env.STRIPE_WEBHOOK_SECRET) {
    return ok(res, { received: true, mode: "mock" });
  }

  const signature = req.header("stripe-signature");
  const rawBody = readRawBody(req.body);
  if (!signature || !rawBody) {
    return fail(res, "Missing webhook signature or raw body", 400);
  }

  try {
    const event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
    const checkoutSession = event.data.object as Stripe.Checkout.Session;

    return ok(res, {
      received: true,
      mode: "stripe",
      eventType: event.type,
      publicId: checkoutSession.metadata?.publicId ?? null
    });
  } catch (error) {
    return fail(res, error instanceof Error ? error.message : "Invalid webhook payload", 400);
  }
}
