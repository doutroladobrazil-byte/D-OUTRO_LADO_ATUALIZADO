/**
 * seed-country-policies.mjs
 *
 * Seeds country_policies table with English commercial policy text for the 6 MVP countries:
 * CH (Switzerland), IE (Ireland), DE (Germany), IS (Iceland), SG (Singapore), US (United States)
 *
 * Safe to re-run — uses ON CONFLICT DO UPDATE.
 *
 * Usage:
 *   node scripts/seed-country-policies.mjs
 */

import postgres from 'postgres';

try {
  const { config } = await import('dotenv');
  const { dirname, join } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const __dir = dirname(fileURLToPath(import.meta.url));
  config({ path: join(__dir, '..', '.env') });
} catch {
  // dotenv not installed — rely on environment
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL is not set.');
  process.exit(1);
}

const db = postgres(DATABASE_URL, { ssl: 'require', max: 1, connect_timeout: 20 });

const policies = [
  {
    country_code: 'CH',
    delivery_note: 'Ships via DHL Express. Estimated 5–8 business days. VAT included.',
    shipping_policy_summary:
      'Orders to Switzerland are shipped via DHL Express with full tracking. Estimated delivery is 5–8 business days from dispatch. Swiss VAT (7.7%) is included in the displayed price. Customs clearance is handled by D\'OUTRO LADO — no additional duties will be charged at delivery.',
    returns_enabled: true,
    returns_window_days: 14,
    returns_policy_summary:
      'We accept returns within 14 days of delivery for Switzerland orders. Items must be unused, unworn, and in original packaging. Contact our support team to initiate a return. Return shipping costs are the responsibility of the customer.',
    duties_and_taxes_summary:
      'Swiss VAT (7.7%) is included in your total. No additional import duties apply — all fees are pre-paid.',
    support_email: 'support@doutrolado.com',
    support_whatsapp_or_contact: null,
    checkout_notice:
      'Free duties and VAT included. Delivered by DHL Express in 5–8 business days.',
    order_confirmation_note:
      'Your order will be dispatched within 1–2 business days. You will receive a tracking link via email once shipped. For any questions, contact support@doutrolado.com.',
  },
  {
    country_code: 'IE',
    delivery_note: 'Ships via DHL Express. Estimated 5–8 business days. VAT included.',
    shipping_policy_summary:
      'Orders to Ireland are shipped via DHL Express with full tracking. Estimated delivery is 5–8 business days from dispatch. Irish VAT (23%) is included in the displayed price. No additional customs fees apply for EU residents.',
    returns_enabled: true,
    returns_window_days: 14,
    returns_policy_summary:
      'We accept returns within 14 days of delivery for Ireland orders. Items must be unused, unworn, and in original packaging. Contact our support team to initiate a return. Return shipping costs are the responsibility of the customer.',
    duties_and_taxes_summary:
      'Irish VAT (23%) is included in your total. No additional import duties apply — all fees are pre-paid.',
    support_email: 'support@doutrolado.com',
    support_whatsapp_or_contact: null,
    checkout_notice:
      'VAT included. Delivered by DHL Express in 5–8 business days.',
    order_confirmation_note:
      'Your order will be dispatched within 1–2 business days. You will receive a tracking link via email once shipped. For any questions, contact support@doutrolado.com.',
  },
  {
    country_code: 'DE',
    delivery_note: 'Ships via DHL Express. Estimated 5–8 business days. VAT included.',
    shipping_policy_summary:
      'Orders to Germany are shipped via DHL Express with full tracking. Estimated delivery is 5–8 business days from dispatch. German VAT (19%) is included in the displayed price. No additional customs fees apply for EU residents.',
    returns_enabled: true,
    returns_window_days: 14,
    returns_policy_summary:
      'We accept returns within 14 days of delivery for Germany orders. Items must be unused, unworn, and in original packaging. Contact our support team to initiate a return. Return shipping costs are the responsibility of the customer.',
    duties_and_taxes_summary:
      'German VAT (19%) is included in your total. No additional import duties apply — all fees are pre-paid.',
    support_email: 'support@doutrolado.com',
    support_whatsapp_or_contact: null,
    checkout_notice:
      'VAT included. Delivered by DHL Express in 5–8 business days.',
    order_confirmation_note:
      'Your order will be dispatched within 1–2 business days. You will receive a tracking link via email once shipped. For any questions, contact support@doutrolado.com.',
  },
  {
    country_code: 'IS',
    delivery_note: 'Ships via DHL Express. Estimated 6–10 business days. Import fees pre-paid.',
    shipping_policy_summary:
      'Orders to Iceland are shipped via DHL Express with full tracking. Estimated delivery is 6–10 business days from dispatch. Icelandic VAT (24%) and import fees are included in the displayed price. No additional charges will be applied at delivery.',
    returns_enabled: true,
    returns_window_days: 14,
    returns_policy_summary:
      'We accept returns within 14 days of delivery for Iceland orders. Items must be unused, unworn, and in original packaging. Contact our support team to initiate a return. Return shipping costs are the responsibility of the customer.',
    duties_and_taxes_summary:
      'Icelandic VAT (24%) and import fees are included in your total. No additional charges at delivery.',
    support_email: 'support@doutrolado.com',
    support_whatsapp_or_contact: null,
    checkout_notice:
      'All import fees included. Delivered by DHL Express in 6–10 business days.',
    order_confirmation_note:
      'Your order will be dispatched within 1–2 business days. You will receive a tracking link via email once shipped. For any questions, contact support@doutrolado.com.',
  },
  {
    country_code: 'SG',
    delivery_note: 'Ships via DHL Express. Estimated 7–12 business days. GST included.',
    shipping_policy_summary:
      'Orders to Singapore are shipped via DHL Express with full tracking. Estimated delivery is 7–12 business days from dispatch. Singaporean GST (9%) is included in the displayed price. No additional import duties apply.',
    returns_enabled: true,
    returns_window_days: 14,
    returns_policy_summary:
      'We accept returns within 14 days of delivery for Singapore orders. Items must be unused, unworn, and in original packaging. Contact our support team to initiate a return. Return shipping costs are the responsibility of the customer.',
    duties_and_taxes_summary:
      'Singapore GST (9%) is included in your total. No additional import duties apply — all fees are pre-paid.',
    support_email: 'support@doutrolado.com',
    support_whatsapp_or_contact: null,
    checkout_notice:
      'GST included. Delivered by DHL Express in 7–12 business days.',
    order_confirmation_note:
      'Your order will be dispatched within 1–2 business days. You will receive a tracking link via email once shipped. For any questions, contact support@doutrolado.com.',
  },
  {
    country_code: 'US',
    delivery_note: 'Ships via DHL Express. Estimated 7–12 business days. All fees included.',
    shipping_policy_summary:
      'Orders to the United States are shipped via DHL Express with full tracking. Estimated delivery is 7–12 business days from dispatch. US customs duties and import fees are included in the displayed price. No additional charges will be applied at delivery.',
    returns_enabled: true,
    returns_window_days: 14,
    returns_policy_summary:
      'We accept returns within 14 days of delivery for US orders. Items must be unused, unworn, and in original packaging. Contact our support team to initiate a return. Return shipping costs are the responsibility of the customer.',
    duties_and_taxes_summary:
      'US customs duties and import taxes are included in your total. No surprise charges at delivery.',
    support_email: 'support@doutrolado.com',
    support_whatsapp_or_contact: null,
    checkout_notice:
      'All duties and taxes included. Delivered by DHL Express in 7–12 business days.',
    order_confirmation_note:
      'Your order will be dispatched within 1–2 business days. You will receive a tracking link via email once shipped. For any questions, contact support@doutrolado.com.',
  },
];

try {
  console.log('Connecting to database…');
  await db`SELECT 1`;
  console.log('Connected.\n');

  console.log('Seeding country_policies…');
  for (const p of policies) {
    await db`
      INSERT INTO country_policies (
        country_code,
        delivery_note,
        shipping_policy_summary,
        returns_enabled,
        returns_window_days,
        returns_policy_summary,
        duties_and_taxes_summary,
        support_email,
        support_whatsapp_or_contact,
        checkout_notice,
        order_confirmation_note,
        updated_at
      ) VALUES (
        ${p.country_code},
        ${p.delivery_note},
        ${p.shipping_policy_summary},
        ${p.returns_enabled},
        ${p.returns_window_days},
        ${p.returns_policy_summary},
        ${p.duties_and_taxes_summary},
        ${p.support_email},
        ${p.support_whatsapp_or_contact},
        ${p.checkout_notice},
        ${p.order_confirmation_note},
        NOW()
      )
      ON CONFLICT (country_code) DO UPDATE SET
        delivery_note                 = EXCLUDED.delivery_note,
        shipping_policy_summary       = EXCLUDED.shipping_policy_summary,
        returns_enabled               = EXCLUDED.returns_enabled,
        returns_window_days           = EXCLUDED.returns_window_days,
        returns_policy_summary        = EXCLUDED.returns_policy_summary,
        duties_and_taxes_summary      = EXCLUDED.duties_and_taxes_summary,
        support_email                 = EXCLUDED.support_email,
        support_whatsapp_or_contact   = EXCLUDED.support_whatsapp_or_contact,
        checkout_notice               = EXCLUDED.checkout_notice,
        order_confirmation_note       = EXCLUDED.order_confirmation_note,
        updated_at                    = NOW()
    `;
    console.log(`  ✓ ${p.country_code}`);
  }

  console.log('\nCountry policies seeded successfully.');
} catch (err) {
  console.error('\nSeeding failed:', err.message);
  await db.end().catch(() => {});
  process.exit(1);
}

await db.end();
process.exit(0);
