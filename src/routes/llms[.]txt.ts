import { createFileRoute } from "@tanstack/react-router";
import { fetchProducts } from "@/lib/shopify";
import { BUNDLE_DISCOUNT_PERCENT } from "@/lib/bundle";
import {
  FREE_SHIPPING_MINIMUM,
  RETURN_WINDOW_DAYS,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

/**
 * llms.txt — a concise, link-based index for AI assistants and agentic crawlers, per the
 * llmstxt.org convention. Category counts are fetched live so this never drifts from the real
 * catalog. See llms-full.txt for an expanded reference with facts embedded inline.
 */

interface CategoryDef {
  label: string;
  query: string;
  blurb: string;
}

const CATEGORIES: CategoryDef[] = [
  {
    label: "Engagement & Wedding Rings",
    query: "product_type:ring",
    blurb:
      "GRA-certified VVS1 D colour moissanite solitaire and stackable engagement and wedding rings in 18K gold, white gold and rose gold plated S925 sterling silver.",
  },
  {
    label: "Necklaces & Chains",
    query: "product_type:necklace OR product_type:pendant",
    blurb: "Moissanite tennis chains, pendants and necklaces.",
  },
  {
    label: "Bracelets",
    query: "product_type:bracelet",
    blurb: "Moissanite tennis bracelets.",
  },
  {
    label: "Earrings",
    query: "product_type:earring",
    blurb: "Moissanite stud and hoop earrings.",
  },
];

function shopUrl(query?: string): string {
  if (!query) return `${SITE_URL}/shop`;
  return `${SITE_URL}/shop?${new URLSearchParams({ q: query }).toString()}`;
}

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async () => {
        let categoryLines: string;
        try {
          const results = await Promise.all(CATEGORIES.map((c) => fetchProducts(50, c.query)));
          categoryLines = CATEGORIES.map((c, i) => {
            const count = results[i]?.length ?? 0;
            return `- [${c.label}](${shopUrl(c.query)}): ${c.blurb} (${count} piece${count === 1 ? "" : "s"} currently listed)`;
          }).join("\n");
        } catch {
          categoryLines = CATEGORIES.map(
            (c) => `- [${c.label}](${shopUrl(c.query)}): ${c.blurb}`,
          ).join("\n");
        }

        const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION} Every stone is independently GRA certified and lab-grown rather than mined, hand-set by bench jewelers and backed by a lifetime craftsmanship warranty.

## Shop
- [Full Collection](${shopUrl()}): Every piece — rings, necklaces, chains, bracelets and earrings in moissanite and 18K gold plated S925 sterling silver.
${categoryLines}
- [Build Your Own Bundle](${SITE_URL}/bundle): Choose one ring, one necklace or chain, one bracelet and one pair of earrings and receive ${BUNDLE_DISCOUNT_PERCENT}% off automatically — no code needed.

## Company
- [About Us](${SITE_URL}/about): Qureshi Jewelers' story, sourcing standards and craftsmanship promise.
- [Craftsmanship](${SITE_URL}/craftsmanship): How every piece is hand-set, plated and inspected before it ships.
- [The Qureshi Circle Rewards Program](${SITE_URL}/rewards): Earn points on every order, unlock Silver, Gold, Rose and Black Diamond tiers, and redeem points for store credit.
- [Contact & Client Care](${SITE_URL}/contact): Sizing help, order status, returns and custom requests.

## Policies
- [Shipping & Returns](${SITE_URL}/terms): Free U.S. shipping on orders over $${FREE_SHIPPING_MINIMUM}; ${RETURN_WINDOW_DAYS}-day returns on unworn pieces.
- [Privacy Policy](${SITE_URL}/privacy)
- [Accessibility Statement](${SITE_URL}/accessibility)

## Optional
- [Extended reference (llms-full.txt)](${SITE_URL}/llms-full.txt): Moissanite facts, materials, certification, rewards tiers and full policy detail, written for direct citation.
- [XML Sitemap](${SITE_URL}/sitemap.xml)
`;

        return new Response(body, {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
