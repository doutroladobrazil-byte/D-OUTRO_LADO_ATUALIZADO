// =============================================================================
// Analytics adapter — stub implementation
// TODO: wire up to real analytics provider (GA4, Segment, PostHog, etc.)
// Payload shape is defined here so the provider swap is a one-file change.
// =============================================================================

type EventProps = Record<string, unknown>;

function trackEvent(name: string, props?: EventProps): void {
  if (typeof window === "undefined") return;
  // Push to dataLayer when available (GTM / GA4)
  const win = window as unknown as { dataLayer?: unknown[] };
  if (Array.isArray(win.dataLayer)) {
    win.dataLayer.push({ event: name, ...props });
  }
  // TODO: replace / augment with provider call, e.g. analytics.track(name, props)
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", name, props ?? {});
  }
}

// =============================================================================
// Homepage events
// =============================================================================

export const HomeAnalytics = {
  viewHome(): void {
    trackEvent("view_home");
  },

  heroShopClick(): void {
    trackEvent("home_hero_shop_click");
  },

  dropListClick(): void {
    trackEvent("home_drop_list_click");
  },

  categoryClick(label: string): void {
    trackEvent("home_category_click", { label });
  },

  styleClick(label: string): void {
    trackEvent("home_style_click", { label });
  },

  productClick(productId: string): void {
    trackEvent("home_product_click", { productId });
  },

  serviceClick(label: string): void {
    trackEvent("home_service_click", { label });
  },

  giftClick(): void {
    trackEvent("home_gift_click");
  },

  leadSubmit(payload: { region: string; interests: string[]; locale: string }): void {
    trackEvent("lead_submit", payload);
  },

  leadSubmitSuccess(payload: { region: string; interests: string[]; locale: string }): void {
    trackEvent("lead_submit_success", payload);
  },

  leadSubmitError(reason: string): void {
    trackEvent("lead_submit_error", { reason });
  },
};

// =============================================================================
// Mobile menu events
// =============================================================================

export const MobileMenuAnalytics = {
  open(): void {
    trackEvent("mobile_menu_open");
  },

  close(): void {
    trackEvent("mobile_menu_close");
  },

  linkClick(label: string): void {
    trackEvent("mobile_menu_link_click", { label });
  },

  searchClick(): void {
    trackEvent("mobile_menu_search_click");
  },

  dropListClick(): void {
    trackEvent("mobile_menu_drop_list_click");
  },

  cartClick(): void {
    trackEvent("mobile_menu_cart_click");
  },
};

// =============================================================================
// Product events
// =============================================================================

export const ProductAnalytics = {
  view(productId: string, name: string): void {
    trackEvent("product_view", { productId, name });
  },

  addToCart(productId: string, name: string, price?: number): void {
    trackEvent("product_add_to_cart", { productId, name, price });
  },

  buyNow(productId: string, name: string, price?: number): void {
    trackEvent("product_buy_now", { productId, name, price });
  },
};

// =============================================================================
// Cart & Checkout events
// =============================================================================

export const CheckoutAnalytics = {
  cartView(itemCount: number): void {
    trackEvent("cart_view", { itemCount });
  },

  beginCheckout(itemCount: number, value?: number): void {
    trackEvent("begin_checkout", { itemCount, value });
  },

  countrySelected(countryCode: string): void {
    trackEvent("checkout_country_selected", { countryCode });
  },

  paymentStarted(countryCode: string, value?: number): void {
    trackEvent("checkout_payment_started", { countryCode, value });
  },

  purchase(orderId: string, value: number, currency: string): void {
    trackEvent("purchase", { orderId, value, currency });
  },
};

// =============================================================================
// Admin — Creative events
// =============================================================================

export const CreativeAnalytics = {
  uploadStarted(slotKey: string): void {
    trackEvent("creative_upload_started", { slotKey });
  },

  uploadSuccess(slotKey: string): void {
    trackEvent("creative_upload_success", { slotKey });
  },

  uploadError(slotKey: string, reason: string): void {
    trackEvent("creative_upload_error", { slotKey, reason });
  },

  activated(slotKey: string): void {
    trackEvent("creative_activated", { slotKey });
  },

  deactivated(slotKey: string): void {
    trackEvent("creative_deactivated", { slotKey });
  },
};
