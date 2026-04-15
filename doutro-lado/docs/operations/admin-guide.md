# Admin Operations Guide — D'OUTRO LADO

Quick reference for day-to-day admin tasks. Each section covers one operation with the minimum steps to do it correctly.

---

## 1. Adding a Product

1. Go to `/admin/products` → click "New product"
2. Fill required fields:
   - **Name**, **SKU**, **Slug** (auto-generated from name, editable)
   - **Category** (select from dropdown)
   - **Retail price (BRL)** — customer-facing price
   - **Stock** — initial physical units available
   - **Weight range** — used for freight calculation
3. Optional but recommended:
   - **Short description** — shown on product cards and PDP
   - **Cost price (BRL)** — needed for margin snapshots in orders
   - **Featured** — shows first in catalog grid
4. Click "Create product" — you will be redirected to the product edit page
5. Add media (see section 2 below)
6. Enable for specific countries if needed (see section 5)

---

## 2. Configuring Product Media

1. Go to `/admin/products/{id}` → scroll to "Fotos e vídeos do produto"
2. Click "+ Adicionar mídia" and select files
   - Images: JPG, PNG, WEBP (recommended for web)
   - Videos: MP4, WEBM (provide a poster image for the thumbnail)
3. The **first uploaded item** is automatically set as primary; change it anytime with "Principal"
4. **Set alt text**: click the gray text below each item → type description → Enter to save
   - Alt text is used for accessibility and image search
5. **Set video poster**: click "Definir capa do vídeo…" → paste a public image URL → Enter to save
6. Reorder items with ↑↓ buttons — order determines display on the product page
7. The **primary** item (star icon) appears on product cards in the catalog

Important:
- Primary image should be the clean product shot (no text overlays)
- If primary is a video with no poster, the catalog card shows a play icon instead of an image
- Deleted media is removed from storage immediately — there is no undo

---

## 3. Configuring Country Policy

Each active checkout country has two sets of data:

**Commerce rule** (set once, changes rarely):
- Currency code (CHF, EUR, USD, SGD, ISK)
- Tax display mode
- Allow guest checkout (true/false)
- Estimated delivery range (days)

**Policy** (editable in admin):
- Delivery note — shown in checkout sidebar
- Returns policy — shown in checkout policy panel
- Duties & taxes summary — customer-facing customs explanation
- Support email — shown in checkout and order confirmation email
- Checkout notice — shown on checkout page (e.g. important restrictions)
- Order confirmation note — included in confirmation email

To edit: `/admin/countries/{CODE}` (e.g. `/admin/countries/ch`)

Changes take effect immediately on the next page load — no redeploy needed.

---

## 4. Reviewing Product Cost

Cost price drives margin calculation in order snapshots.

1. Go to `/admin/products/{id}` → find "Cost price (BRL)" field
2. Enter the actual landed cost in BRL (product cost + logistics to warehouse)
3. Save — all future orders for this product will use this cost for margin reporting

Note: Cost price does not affect the customer-facing price. It is only used in `/admin/orders/{id}` margin snapshot.

---

## 5. Enabling a Product for a Country

Products are not available in all countries by default.

1. Go to `/admin/products/{id}` → scroll to "Country Availability"
2. Toggle on each country where the product should be available
3. Save — takes effect immediately

If a product is available worldwide, enable it for all active countries. If it is restricted (e.g. customs issues), disable the relevant countries.

---

## 6. Reviewing an Order After Purchase

1. Go to `/admin/orders` → find the order (search by customer name, email, or order ID)
2. Order detail shows:
   - Customer info (name, email, phone, shipping address)
   - Destination country + estimated delivery
   - Payment status: `awaiting_payment` → `paid` → `refunded`
   - Order status: `pending_payment` → `processing` → `shipped` → `delivered` / `cancelled`
   - Financial snapshot: product cost, gateway fee, gross margin, net margin
3. To update status (e.g. mark as shipped): use the status dropdowns and click Save

---

## 7. Identifying Guest vs Authenticated Orders

| Indicator | Authenticated | Guest |
|---|---|---|
| `Profile ID` in order detail | Present | Absent / null |
| `Is Guest` field | No | Yes |
| Customer email | From Supabase auth | From contact form |

Guest orders do not appear in the customer's "My Account" page — they can only be tracked via the order confirmation email. If a guest needs their order info, look up by public order ID in admin.

---

## 8. Checking Stock & Reservations

1. Go to `/admin/inventory`
2. Each row shows: SKU, stock (total), reserved (active checkouts), available (stock − reserved)
3. `available = 0` means the product cannot be added to new checkouts
4. If `available = 0` but `stock > 0`, there are active reservations — they expire after `RESERVATION_TTL_MINUTES` (default: 20 min)
5. To force-release stuck reservations: trigger the expiry endpoint manually (see `docs/runbooks/reservation-stuck.md`)

---

## 9. Common Operational Pitfalls

- **Primary media not set** → catalog card shows gradient only (no image) → set a primary image immediately after creating a product
- **Cost price missing** → margin snapshot in orders shows `null` → fill it before launching the product
- **Country policy empty** → checkout sidebar shows no delivery/returns info for that country → fill all policy fields before enabling checkout for a country
- **Stock = 0** → product is effectively unavailable even if `is_active = true` → update stock before marketing the product
- **Stripe in mock mode** → `PAYMENTS_MODE=mock` → payments succeed without real money → verify `PAYMENTS_MODE=stripe` in production
