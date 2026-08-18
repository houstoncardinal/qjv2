import { toast } from "sonner";

export const SHOPIFY_API_VERSION = "2025-07";
export const SHOPIFY_STORE_PERMANENT_DOMAIN = "bruirq-yi.myshopify.com";
export const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
export const SHOPIFY_STOREFRONT_TOKEN = "25f675f27973120243ec84b9a94c8efa";

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    descriptionHtml?: string;
    handle: string;
    productType?: string;
    vendor?: string;
    tags?: string[];
    priceRange: {
      minVariantPrice: { amount: string; currencyCode: string };
    };
    images: {
      edges: Array<{ node: { url: string; altText: string | null } }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: { amount: string; currencyCode: string };
          availableForSale: boolean;
          image?: { url: string; altText: string | null } | null;
          selectedOptions: Array<{ name: string; value: string }>;
        };
      }>;
    };
    options: Array<{ name: string; values: string[] }>;
  };
}

export const PRODUCT_FIELDS = `
  id
  title
  description
  descriptionHtml
  handle
  productType
  vendor
  tags
  priceRange { minVariantPrice { amount currencyCode } }
  images(first: 8) { edges { node { url altText } } }
  variants(first: 30) {
    edges {
      node {
        id
        title
        price { amount currencyCode }
        availableForSale
        image { url altText }
        selectedOptions { name value }
      }
    }
  }
  options { name values }
`;

export const STOREFRONT_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges { node { ${PRODUCT_FIELDS} } }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  query GetProduct($handle: String!) {
    productByHandle(handle: $handle) { ${PRODUCT_FIELDS} }
  }
`;

export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 402) {
    toast.error("Shopify: Payment required", {
      description:
        "Shopify API access requires an active Shopify billing plan. Visit https://admin.shopify.com to upgrade.",
    });
    return;
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(
      `Error calling Shopify: ${data.errors.map((e: { message: string }) => e.message).join(", ")}`,
    );
  }

  return data;
}

export async function fetchProducts(first = 50, query?: string): Promise<ShopifyProduct[]> {
  const data = await storefrontApiRequest(STOREFRONT_QUERY, { first, query: query ?? null });
  return (data?.data?.products?.edges ?? []) as ShopifyProduct[];
}

export async function fetchProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
  const node = data?.data?.productByHandle;
  return node ? ({ node } as ShopifyProduct) : null;
}

export function formatMoney(amount: string | number, currencyCode = "USD") {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currencyCode} ${value.toFixed(2)}`;
  }
}

/** Normalise a string for loose matching (lowercase, alphanumeric only). */
function norm(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const GENERIC_TOKENS = /^(\d+k?|k|plated|plating|color|colour|finish|tone|metal|the|and)$/;

/**
 * Work out which gallery image belongs to a variant.
 * 1. Match the colour/metal option value against image alt text / filename
 *    (many stores name files "whitegold-123.jpg" without assigning variant images).
 * 2. Fall back to Shopify's own variant image when it is distinct.
 * Returns -1 when nothing matches so callers keep the current image.
 */
export function variantImageIndex(
  product: ShopifyProduct,
  variant?: {
    image?: { url: string } | null;
    selectedOptions: Array<{ name: string; value: string }>;
  } | null,
): number {
  if (!variant) return -1;
  const images = product.node.images.edges;
  if (images.length < 2) return -1;

  const colorOption = variant.selectedOptions.find((o) =>
    /colou?r|metal|plating|finish|tone|material/i.test(o.name),
  );

  if (colorOption) {
    const words = norm(colorOption.value)
      .split(" ")
      .filter((w) => w.length > 2 && !GENERIC_TOKENS.test(w));
    const phrase = words.join("");

    if (phrase) {
      const compacts = images.map((e) =>
        norm(`${e.node.altText ?? ""} ${decodeURIComponent(e.node.url.split("/").pop() ?? "")}`).replace(/ /g, ""),
      );

      // Exact colour phrase in the filename/alt text wins.
      const exact = compacts.findIndex((c) => c.includes(phrase));
      if (exact >= 0) return exact;

      // Otherwise require every colour word to appear, and only if it is unique.
      const hits = compacts
        .map((c, i) => (words.every((w) => c.includes(w)) ? i : -1))
        .filter((i) => i >= 0);
      if (hits.length === 1) return hits[0]!;
    }
  }

  if (variant.image?.url) {
    const target = variant.image.url.split("?")[0];
    const distinct = new Set(
      product.node.variants.edges.map((v) => v.node.image?.url?.split("?")[0] ?? ""),
    );
    // Only trust variant images when the store actually assigns different ones.
    if (distinct.size > 1) {
      const i = images.findIndex((e) => e.node.url.split("?")[0] === target);
      if (i >= 0) return i;
    }
  }

  return -1;
}

/**
 * Minimal allowlist sanitiser for Shopify `descriptionHtml`.
 * Strips scripts/styles/iframes, event handlers and javascript: URLs while
 * keeping the merchant's formatting (bold, lists, headings, tables, links).
 */
export function sanitizeShopifyHtml(html?: string | null): string {
  if (!html) return "";
  return html
    .replace(/<\s*(script|style|iframe|object|embed|link|meta)[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta)\b[^>]*\/?>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, "");
}

/** First paragraph / sentence-ish summary taken from the Shopify description. */
export function shortDescription(product: ShopifyProduct["node"]): string {
  const html = product.descriptionHtml ?? "";
  const firstBlock = html
    .split(/<\/(?:p|div|li|h[1-6])>/i)[0]
    ?.replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  const text = firstBlock && firstBlock.length > 20 ? firstBlock : product.description;
  return (text || "").split(/\n/)[0]!.trim();
}
