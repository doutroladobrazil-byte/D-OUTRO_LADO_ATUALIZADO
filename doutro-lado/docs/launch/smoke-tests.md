# Smoke Tests — D'OUTRO LADO

Run these after every deploy to production before opening traffic. Each test is a binary pass/fail.

---

## How to Run

Execute manually or use the script below (`scripts/smoke-test.sh`) against the production URL.

Set:
```bash
export BASE_URL=https://doutrolado.com
export API_URL=https://doutrolado.com/api
```

---

## 1. Storefront

### 1.1 Catalog loads
```bash
curl -s "$BASE_URL" | grep -q "D'OUTRO LADO" && echo PASS || echo FAIL
```
Manual: Open `$BASE_URL` — product grid appears, no blank page, no React error.

### 1.2 Primary media visible
Manual: At least one product card shows an image (not a gray placeholder).

### 1.3 Product detail page loads
```bash
# Replace {slug} with a real product slug
curl -s "$BASE_URL/products/{slug}" | grep -q "Ver produto\|Add to cart" && echo PASS || echo FAIL
```

### 1.4 API catalog responds
```bash
curl -sf "$API_URL/products?brand=moda" | python3 -m json.tool | grep -q '"id"' && echo PASS || echo FAIL
```

---

## 2. Health

### 2.1 Liveness
```bash
curl -sf "$API_URL/health/live" | grep -q '"ok":true' && echo PASS || echo FAIL
```

### 2.2 Readiness — all checks must pass
```bash
curl -sf "$API_URL/health/ready" | grep -q '"ok":true' && echo PASS || echo FAIL
```
On failure: inspect `checks` object to identify which dependency is unhealthy.

---

## 3. Countries

### 3.1 Active countries returned
```bash
curl -sf "$API_URL/countries" | grep -q '"checkoutEnabled":true' && echo PASS || echo FAIL
```

### 3.2 Country detail (policy + commerce rule)
```bash
# Replace CH with an active country code
curl -sf "$API_URL/countries/CH" | grep -q '"currency"' && echo PASS || echo FAIL
```

---

## 4. Checkout Flow

### 4.1 Bag simulation responds
```bash
curl -sf -X POST "$API_URL/bag/simulate" \
  -H "Content-Type: application/json" \
  -d '{"countryCode":"CH","currency":"CHF","items":[{"type":"product","productSlug":"{slug}","quantity":1}]}' \
  | grep -q '"isValid"' && echo PASS || echo FAIL
```

### 4.2 Checkout initiation (mock mode)
Only valid when `PAYMENTS_MODE=mock`:
```bash
# This will fail in stripe mode — use manual test instead
curl -sf -X POST "$API_URL/stripe/checkout" \
  -H "Content-Type: application/json" \
  -d '{"brand":"moda","countryCode":"CH","currency":"CHF","items":[{"productSlug":"{slug}","quantity":1}],"contact":{"fullName":"Test User","email":"test@test.com","phone":"+41000000000","line1":"Bahnhofstrasse 1","city":"Zurich","postalCode":"8001","countryCode":"CH"}}' \
  | grep -q '"mode"' && echo PASS || echo FAIL
```

### 4.3 Stripe checkout session (manual, stripe mode)
1. Add a product to cart on the storefront
2. Go to checkout, select a country, fill contact form
3. Click "Proceed to payment"
4. Verify redirect to Stripe hosted checkout
5. Use Stripe test card `4242 4242 4242 4242`, any future date, any CVC
6. Verify redirect back with `?status=success`
7. Verify order confirmation email received

---

## 5. Post-Payment (manual)

### 5.1 Order appears in admin
1. Complete a checkout (step 4.3 above)
2. Go to `/admin/orders`
3. Order appears with `payment_status = paid` and `order_status = processing`

### 5.2 Stock deducted
1. Note stock level before purchase (admin `/admin/inventory`)
2. Complete purchase of quantity N
3. Verify stock decreased by N in inventory view

### 5.3 Reservation released after expiry
1. Start checkout (create Stripe session), but do NOT complete payment — wait for TTL
2. After `RESERVATION_TTL_MINUTES`, trigger expiry manually:
```bash
curl -X POST "$API_URL/internal/reservations/expire" \
  -H "Authorization: Bearer $RECOVERY_JOB_SECRET"
```
3. Verify the item is available again in bag simulation

---

## 6. Admin

### 6.1 Admin login
1. Go to `/admin`
2. Redirects to `/login` if unauthenticated
3. After login as admin, redirects back to `/admin`
4. Dashboard shows non-zero metrics (if orders exist)

### 6.2 Admin overview responds
```bash
# Requires admin token — test manually in browser
# Or use: curl with Authorization: Bearer <admin-token>
curl -sf "$API_URL/admin/overview" -H "Authorization: Bearer $ADMIN_TOKEN" | grep -q '"ok":true' && echo PASS || echo FAIL
```

### 6.3 Media upload works
1. Go to `/admin/products/{id}`
2. Upload a test image via the media manager
3. Image appears in the product gallery
4. Image appears on the storefront product card after refresh

---

## 7. Email

### 7.1 Order confirmation
- After completing a Stripe checkout, verify the confirmation email arrives within 2 minutes
- Email contains: order ID, item list, destination country, support contact

---

## Quick Run Sequence (5 minutes)

1. `curl $API_URL/health/ready` — must be all green
2. Open storefront — catalog and images load
3. Open a product page — loads correctly
4. Simulate a bag — API responds
5. Complete a Stripe test checkout — end-to-end
6. Check admin orders — order appears
7. Check email — confirmation received

---

## Known Limitations

- Smoke tests do not cover: Twilio WhatsApp, bag recovery emails (requires delayed job), wholesale pricing
- Stripe mode tests require a Stripe test or live account configured
- Media upload requires Supabase storage configured
