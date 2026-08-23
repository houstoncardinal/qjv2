/**
 * Single source of truth for brand, policy and SEO facts.
 * Policy numbers live here so page copy, structured data and the cart
 * never drift apart.
 */

export const SITE_URL = "https://www.qureshijewelers.com";

export const SITE_NAME = "Qureshi Jewelers";
export const SITE_TAGLINE = "VVS1 Moissanite Hand-Set in 18K Gold";
export const SITE_DESCRIPTION =
  "GRA-certified VVS1 D colour moissanite engagement rings, tennis bracelets, chains and stud earrings, hand-set in 18K gold, white gold and rose gold plated S925 sterling silver.";

/**
 * Fallback social-share image for pages that don't set their own (product pages use their real
 * product photo instead). A real, already-hosted product shot — swap for a dedicated branded
 * banner whenever one exists.
 */
export const SITE_OG_IMAGE =
  "https://cdn.shopify.com/s/files/1/0729/6385/0319/files/H94a9b18aa5c14616b6bd0e4e358b4e76h-1781937290160-ku8jna.png?v=1786995060";

export const SUPPORT_EMAIL = "care@qureshijewelers.com";
export const SUPPORT_PHONE = "+1 (312) 555-0184";
export const SUPPORT_HOURS = "Monday–Friday, 9am–6pm CT";

/** Free standard shipping across the United States above this order subtotal (USD). */
export const FREE_SHIPPING_MINIMUM = 100;
/** Return window in days from delivery. */
export const RETURN_WINDOW_DAYS = 14;
/** One return per customer per this many days. */
export const RETURN_LIMIT_DAYS = 14;
export const RETURN_POLICY_SHORT = `${RETURN_WINDOW_DAYS}-day returns · one return per customer every ${RETURN_LIMIT_DAYS} days`;
export const SHIPPING_POLICY_SHORT = `Free U.S. shipping on orders over $${FREE_SHIPPING_MINIMUM}`;

export const SOCIAL_LINKS = [
  "https://www.instagram.com/qureshijewelers",
  "https://www.tiktok.com/@qureshijewelers",
];

export const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "JewelryStore",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  email: SUPPORT_EMAIL,
  telephone: SUPPORT_PHONE,
  priceRange: "$$-$$$",
  currenciesAccepted: "USD",
  paymentAccepted: "Credit Card, Debit Card, Apple Pay, Google Pay, Shop Pay",
  areaServed: "US",
  sameAs: SOCIAL_LINKS,
  address: {
    "@type": "PostalAddress",
    addressCountry: "US",
    addressRegion: "IL",
    addressLocality: "Chicago",
  },
  makesOffer: {
    "@type": "Offer",
    itemOffered: {
      "@type": "Product",
      name: "GRA-certified moissanite fine jewelry",
      material: "Moissanite, S925 sterling silver, 18K gold plating",
    },
  },
} as const;

export const WEBSITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  publisher: { "@id": `${SITE_URL}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/shop?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
} as const;

export function breadcrumbLd(trail: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: t.url.startsWith("http") ? t.url : `${SITE_URL}${t.url}`,
    })),
  };
}

export function faqLd(items: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

/** Shared shipping + returns policy blocks reused inside Product structured data. */
export const OFFER_POLICY_LD = {
  shippingDetails: {
    "@type": "OfferShippingDetails",
    shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "USD" },
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
      transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 5, unitCode: "DAY" },
    },
  },
  hasMerchantReturnPolicy: {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "US",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: RETURN_WINDOW_DAYS,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/FreeReturn",
  },
} as const;
