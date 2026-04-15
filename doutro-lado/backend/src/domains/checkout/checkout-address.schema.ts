import { z } from "zod";
import { COUNTRY_CODES } from "../../config/constants.js";

/**
 * Checkout address + contact payload — Stage 14.
 *
 * Collected on checkout for both guest and authenticated users.
 * Used to populate the snapshot columns on the orders table so the order
 * is self-contained and fully operational without relying on profile/address
 * records that may change after purchase.
 *
 * Country consistency rule: address.countryCode must match the order's
 * countryCode (validated in buildOrder / createCheckoutSession).
 */
export const checkoutAddressSchema = z.object({
  /** Buyer's full name — appears on shipping label. */
  fullName: z.string().min(2).max(200).trim(),
  /** Buyer's email — used for order confirmation and Stripe session. */
  email: z.string().email().max(200).toLowerCase().trim(),
  /** Buyer's phone — needed for DHL/courier contact. */
  phone: z.string().min(5).max(50).trim(),
  /** Street address line 1. */
  line1: z.string().min(1).max(200).trim(),
  /** Apartment, suite, unit, etc. (optional). */
  line2: z.string().max(200).trim().optional(),
  /** City or locality. */
  city: z.string().min(1).max(100).trim(),
  /**
   * State, province, region, or canton.
   * Required for US; optional for countries where it doesn't apply.
   */
  stateRegion: z.string().max(100).trim().optional(),
  /** Postal / ZIP code. Required for all 6 MVP countries. */
  postalCode: z.string().min(1).max(20).trim(),
  /** ISO 3166-1 alpha-2 destination country code. Must match the order's countryCode. */
  countryCode: z
    .string()
    .length(2)
    .transform((v) => v.toUpperCase())
    .refine((v) => (COUNTRY_CODES as readonly string[]).includes(v), {
      message: "Unsupported destination country.",
    }),
});

export type CheckoutAddress = z.infer<typeof checkoutAddressSchema>;
