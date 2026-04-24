// =============================================================================
// Analytics adapter — stub implementation
// TODO: wire up to real analytics provider (GA4, Segment, PostHog, etc.)
// Payload shape is defined here so the provider swap is a one-file change.
// =============================================================================

type EventProps = Record<string, unknown>;

function trackEvent(name: string, props?: EventProps): void {
  if (typeof window === "undefined") return;
  // TODO: replace with provider call, e.g. analytics.track(name, props)
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", name, props ?? {});
  }
}

// =============================================================================
// Homepage events
// =============================================================================

export const HomeAnalytics = {
  heroShopClick(): void {
    // TODO: fire home_hero_shop_click
    trackEvent("home_hero_shop_click");
  },

  dropListClick(): void {
    // TODO: fire home_drop_list_click
    trackEvent("home_drop_list_click");
  },

  categoryClick(label: string): void {
    // TODO: fire home_category_click with label
    trackEvent("home_category_click", { label });
  },

  leadSubmit(payload: { region: string; interests: string[]; locale: string }): void {
    // TODO: fire home_lead_submit with payload
    trackEvent("home_lead_submit", payload);
  },

  productClick(productId: string): void {
    // TODO: fire home_product_click with productId
    trackEvent("home_product_click", { productId });
  },
};
