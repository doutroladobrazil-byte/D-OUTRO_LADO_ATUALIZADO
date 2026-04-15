# Runbook: Country Policy Misconfigured

## Symptom

- Checkout page for a specific country shows incorrect or missing delivery/returns information
- Order confirmation email missing country-specific note or support contact
- Country appears in checkout selector but has no commerce rule (currency, tax, etc.)
- Customer from a specific country cannot complete checkout ("country not supported")
- Admin country policy editor shows empty fields for an active country

---

## Possible Causes

| Cause | How to identify |
|---|---|
| Country not seeded in `supported_countries` | `/api/countries` does not return the country |
| `checkout_enabled = false` for the country | Country not visible in checkout selector |
| `country_commerce_rules` row missing | `/api/countries/{code}` has `commerceRule: null` |
| `country_policies` row missing | `/api/countries/{code}` has `policy: null` |
| Wrong currency code in commerce rule | Checkout shows wrong currency |
| `allow_guest_checkout = false` and customer is not logged in | "Guest checkout not available" error |
| Policy fields left blank | Checkout policy panel shows nothing |

---

## How to Verify

1. **Check country list**:
   ```bash
   curl https://your-api.com/api/countries | python3 -m json.tool
   ```
   Look for the country code. Verify `checkoutEnabled: true`.

2. **Check country detail**:
   ```bash
   curl https://your-api.com/api/countries/CH | python3 -m json.tool
   ```
   Verify: `commerceRule` has currency/tax/guestCheckout, `policy` has deliveryNote/supportEmail.

3. **Admin UI**: Go to `/admin/countries` — country should appear with an "Edit policy →" link.
   Click through to the policy editor and check which fields are empty.

---

## How to Mitigate

### Country not active / not in checkout
1. Go to Supabase Studio → `supported_countries` table
2. Find the country row, set `checkout_enabled = true`, `is_active = true`
3. Or re-run the seed script: `wsl bash -c "node scripts/seed-country-policies.mjs"`

### Commerce rule missing
Run the commerce rule seed script, or insert manually via Supabase Studio:
```sql
INSERT INTO country_commerce_rules (country_code, currency, tax_display_mode, allow_guest_checkout, estimated_delivery_min_days, estimated_delivery_max_days)
VALUES ('CH', 'CHF', 'included', false, 5, 10)
ON CONFLICT (country_code) DO UPDATE SET ...;
```

### Policy missing / empty fields
1. Go to `/admin/countries/{code}` in the admin UI
2. Fill in: Delivery note, Returns policy, Support email, Checkout notice, Order confirmation note
3. Click "Save changes"
4. Verify by re-fetching `/api/countries/{code}` — `policy` should be populated

Or re-run the policy seed:
```bash
wsl bash -c "node scripts/seed-country-policies.mjs"
```

### Wrong currency
1. Admin: `/admin/countries/{code}` — commerce rule section shows currency (read-only in UI)
2. Update directly in DB:
   ```sql
   UPDATE country_commerce_rules SET currency = 'CHF' WHERE country_code = 'CH';
   ```

### Guest checkout blocked unexpectedly
1. Check `allow_guest_checkout` in `country_commerce_rules` for the country
2. Update via DB:
   ```sql
   UPDATE country_commerce_rules SET allow_guest_checkout = true WHERE country_code = 'IE';
   ```

---

## When to Escalate

- Commerce rule seed script fails repeatedly with DB errors
- Policy editor in admin shows 500 errors when saving
- Country is visible but products cannot be added to checkout (may be country availability issue — see `product_country_availability` table)
