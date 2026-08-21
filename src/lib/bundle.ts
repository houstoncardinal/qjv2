import type { ShopifyProduct } from "@/lib/shopify";

/**
 * Build Your Own Bundle — pick one ring, one necklace/chain, one bracelet, and one pair of
 * earrings and unlock 10% off, applied automatically to the Shopify cart (see cartStore.ts).
 */

export type BundleSlotKey = "ring" | "necklace" | "bracelet" | "earring";

export interface BundleSlot {
  key: BundleSlotKey;
  label: string;
  sub: string;
  /** Shopify Storefront search query used to fetch candidate products for this slot. */
  query: string;
  /** productType values (lowercase) that satisfy this slot. */
  types: string[];
}

export const BUNDLE_SLOTS: BundleSlot[] = [
  {
    key: "ring",
    label: "Ring",
    sub: "Engagement & stackable",
    query: "product_type:ring",
    types: ["ring"],
  },
  {
    key: "necklace",
    label: "Necklace / Chain",
    sub: "Tennis chains & pendants",
    query: "product_type:necklace OR product_type:pendant",
    types: ["necklace", "pendant"],
  },
  {
    key: "bracelet",
    label: "Bracelet",
    sub: "Tennis bracelets",
    query: "product_type:bracelet",
    types: ["bracelet"],
  },
  {
    key: "earring",
    label: "Earrings",
    sub: "Studs & hoops",
    query: "product_type:earring",
    types: ["earring"],
  },
];

/** Must exactly match the discount code created in Shopify Admin — see the setup notes. */
export const BUNDLE_DISCOUNT_CODE = "BUNDLE10";
export const BUNDLE_DISCOUNT_PERCENT = 10;

function slotForProductType(productType: string | undefined): BundleSlot | undefined {
  const type = (productType ?? "").toLowerCase();
  return BUNDLE_SLOTS.find((slot) => slot.types.includes(type));
}

/**
 * A cart qualifies once it has at least one item from every bundle slot. Structural typing
 * (rather than importing CartItem from the cart store) avoids a circular import.
 */
export function isBundleEligible(items: Array<{ product: ShopifyProduct }>): boolean {
  const filledSlots = new Set(
    items.map((item) => slotForProductType(item.product.node.productType)?.key).filter(Boolean),
  );
  return BUNDLE_SLOTS.every((slot) => filledSlots.has(slot.key));
}
