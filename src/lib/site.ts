/**
 * Single source of truth for brand, policy and SEO facts.
 * Policy numbers live here so page copy, structured data and the cart
 * never drift apart.
 */

export const SITE_NAME = "Qureshi Jewelers";
export const SITE_TAGLINE = "VVS1 Moissanite Hand-Set in 18K Gold";
export const SITE_DESCRIPTION =
  "GRA-certified VVS1 D colour moissanite engagement rings, tennis bracelets, chains and stud earrings, hand-set in 18K gold, white gold and rose gold plated S925 sterling silver.";

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
  "@id": "/#organization",
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: "/",
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
  "@id": "/#website",
  name: SITE_NAME,
  url: "/",
  description: SITE_DESCRIPTION,
  publisher: { "@id": "/#organization" },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: "/shop?q={search_term_string}" },
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
      item: t.url,
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
