# D'OUTRO LADO — Catalog Launch Checklist
> Etapa 10 · April 2026  
> Run this checklist for every SKU before enabling it in the live storefront.

---

## Per-Product Checklist

Copy this block for each launch SKU:

```
SKU: ___________  |  Product: _______________________  |  Status: 🔲 / ✅ / ❌

[ ] Name — final, no placeholder text
[ ] Slug — URL-safe, no accents or spaces
[ ] Short description — filled, professional copy
[ ] Long description — filled (used on PDP body text)
[ ] Category + subcategory — assigned and correct
[ ] Retail price BRL — confirmed and non-zero
[ ] Cost BRL — filled (enables margin reporting)
[ ] Weight range — assigned (S / M / L / XL — drives freight calculation)
[ ] Wholesale min qty — configured
[ ] Material — described
[ ] Stock qty — > 0
[ ] is_active = true
[ ] featured = true (if hero product)
[ ] Primary media — at least 1 image set as primary
[ ] Media alt text — filled on primary image
[ ] Video poster URL — filled (if product has video)
[ ] Available for all launch countries — checked in admin
[ ] Appears on /brands/moda — confirmed visually
[ ] Appears on homepage featured (if featured) — confirmed
[ ] PDP loads correctly — no 404, price and media shown
[ ] Add to cart → checkout flow — tested
```

---

## Launch SKU Register

| SKU | Product name | Price BRL | Stock | Media | Countries | Status |
|---|---|---|---|---|---|---|
| — | — | — | — | 🔲 | 🔲 | 🔲 |
| — | — | — | — | 🔲 | 🔲 | 🔲 |
| — | — | — | — | 🔲 | 🔲 | 🔲 |
| — | — | — | — | 🔲 | 🔲 | 🔲 |

*(Fill with actual SKUs before go-live)*

---

## Catalog Health Checks

Run these in the admin before launching:

- [ ] `/admin/products` — no "quase pronto" SKUs with stock = 0 and `is_active = true`
- [ ] `/admin/stock` — stock overview shows expected quantities
- [ ] `/brands/moda` — product grid renders with ≥ 1 product
- [ ] Homepage — featured grid shows ≥ 1 product (empty state is a brand signal; avoid it on day 1)
- [ ] At least 4 products are `featured = true` (fills the homepage 4-column grid)
- [ ] At least 1 campaign is active (optional, but homepage campaigns section hides gracefully if none)

---

## Media Standards (minimum for launch)

| Standard | Requirement |
|---|---|
| Primary image | Required on every launch SKU |
| Alt text | Required on primary image |
| Image format | JPG or WebP preferred |
| Recommended resolution | ≥ 800×1000px (portrait) |
| Video | Optional; if present, poster URL required |
| Max file size | < 5 MB per image (Supabase Storage limit applies) |

---

## Notes / Known Gaps

| SKU | Gap | Severity | Owner |
|---|---|---|---|
| — | — | — | — |
