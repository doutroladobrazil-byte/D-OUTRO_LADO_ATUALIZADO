-- Stage 17: Country commercial policies (customer-facing text + returns config)
-- Separated from country_commerce_rules (pricing logic) into its own table.
-- One row per supported_country code. Upserted by seed, editable via admin.

CREATE TABLE IF NOT EXISTS country_policies (
  country_code          VARCHAR(2) PRIMARY KEY,
  -- Delivery
  delivery_note         TEXT,          -- short line shown next to freight total in checkout
  shipping_policy_summary TEXT,         -- full shipping policy paragraph
  -- Returns
  returns_enabled       BOOLEAN NOT NULL DEFAULT true,
  returns_window_days   INT     NOT NULL DEFAULT 14,
  returns_policy_summary TEXT,         -- full returns policy paragraph
  -- Duties & taxes
  duties_and_taxes_summary TEXT,        -- one-liner shown before payment
  -- Support
  support_email         TEXT,
  support_whatsapp_or_contact TEXT,
  -- Checkout / confirmation copy
  checkout_notice       TEXT,           -- small notice shown in checkout sidebar
  order_confirmation_note TEXT,         -- paragraph appended to confirmation email
  -- Audit
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_country_policies_country
    FOREIGN KEY (country_code)
    REFERENCES supported_countries(code)
    ON DELETE CASCADE
);

COMMENT ON TABLE country_policies IS
  'Customer-facing commercial policies per country: shipping, returns, duties, support contacts.';
