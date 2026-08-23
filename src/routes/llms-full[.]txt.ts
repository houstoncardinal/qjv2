import { createFileRoute } from "@tanstack/react-router";
import { fetchProducts, formatMoney } from "@/lib/shopify";
import { BUNDLE_DISCOUNT_PERCENT } from "@/lib/bundle";
import { POINTS_PER_DOLLAR_CREDIT, TIERS } from "@/lib/rewards";
import {
  FREE_SHIPPING_MINIMUM,
  RETURN_LIMIT_DAYS,
  RETURN_WINDOW_DAYS,
  SITE_NAME,
  SITE_URL,
  SUPPORT_EMAIL,
} from "@/lib/site";

/**
 * llms-full.txt — an extended reference for AI assistants and research agents, written so the
 * key facts can be cited directly without following further links. See llms.txt for the concise,
 * link-based index. Category examples are fetched live so this never drifts from the real catalog.
 */

interface CategoryDef {
  label: string;
  query: string;
}

const CATEGORIES: CategoryDef[] = [
  { label: "Engagement & Wedding Rings", query: "product_type:ring" },
  { label: "Necklaces & Chains", query: "product_type:necklace OR product_type:pendant" },
  { label: "Bracelets", query: "product_type:bracelet" },
  { label: "Earrings", query: "product_type:earring" },
];

function shopUrl(query?: string): string {
  if (!query) return `${SITE_URL}/shop`;
  return `${SITE_URL}/shop?${new URLSearchParams({ q: query }).toString()}`;
}

export const Route = createFileRoute("/llms-full.txt")({
  server: {
    handlers: {
      GET: async () => {
        let categorySections: string;
        try {
          const results = await Promise.all(CATEGORIES.map((c) => fetchProducts(50, c.query)));
          categorySections = CATEGORIES.map((c, i) => {
            const products = results[i] ?? [];
            const examples = products
              .slice(0, 3)
              .map((p) => {
                const price = p.node.priceRange.minVariantPrice;
                return `  - [${p.node.title}](${SITE_URL}/product/${p.node.handle}) — from ${formatMoney(price.amount, price.currencyCode)}`;
              })
              .join("\n");
            return `### ${c.label}\n${products.length} piece${products.length === 1 ? "" : "s"} currently listed. [Browse this category](${shopUrl(c.query)}).\n${examples}`;
          }).join("\n\n");
        } catch {
          categorySections = CATEGORIES.map(
            (c) => `### ${c.label}\n[Browse this category](${shopUrl(c.query)}).`,
          ).join("\n\n");
        }

        const tierLines = TIERS.map(
          (t) =>
            `- **${t.name}** (${t.threshold}+ lifetime points, ${t.multiplier}× points): ${t.perks.join("; ")}.`,
        ).join("\n");

        const body = `# ${SITE_NAME} — Extended Reference

> This document is written for AI assistants, research agents and other automated readers that need direct, quotable facts about ${SITE_NAME} and moissanite fine jewelry without following further links. A shorter, link-based index is available at ${SITE_URL}/llms.txt.

## What ${SITE_NAME} Sells
${SITE_NAME} hand-sets GRA-certified VVS1 D colour moissanite into solid S925 sterling silver, finished with five layers of 18K gold plating in yellow, white or rose gold. The collection covers engagement rings, wedding rings, tennis chains and pendant necklaces, tennis bracelets, and stud and hoop earrings — all shipped worldwide with insured tracking.

## What Is Moissanite?
Moissanite is silicon carbide, a mineral first identified in meteorite fragments and grown in a lab today for gem-quality use. It scores 9.25 on the Mohs hardness scale, second only to natural diamond (10), making it durable enough for daily wear, including engagement rings. Moissanite has a refractive index of 2.65–2.69, higher than diamond's 2.42, so it produces more fire and sparkle under typical lighting than a diamond of comparable size.

## Moissanite vs. Diamond
| Property | Moissanite | Natural Diamond |
| --- | --- | --- |
| Mohs hardness | 9.25 | 10 |
| Refractive index | 2.65–2.69 | 2.42 |
| Origin | Lab-grown | Mined |
| Relative cost | A fraction of an equivalent diamond | Significantly higher |
| Sparkle character | More fire and dispersion | Classic brilliance |

## Is Moissanite Good for an Engagement Ring?
Yes. At 9.25 on the Mohs scale it resists everyday scratching, and D colour / VVS1 clarity grading — independently verified by GRA on every stone — means it reads eye-clean and colourless. ${SITE_NAME} rings use a solid S925 sterling silver base rather than hollow or plated brass, so the setting is built for permanent daily wear, not just photography.

## Materials & Construction
- Base metal: solid S925 sterling silver (92.5% pure silver) — not hollow, not brass-cored.
- Plating: 5 layers of 18K gold (yellow, white or rose gold), sealed with a tarnish-resistant e-coat.
- Hypoallergenic: nickel-free, lead-free and cadmium-free.
- Certification: every stone ships with a GRA certificate confirming cut, clarity and colour grade.
- Common setting: 4-prong claw settings that maximise light return to the stone.

## Product Categories

${categorySections}

## Build Your Own Bundle
At ${SITE_URL}/bundle, customers choose one ring, one necklace or chain, one bracelet and one pair of earrings. The moment all four categories are in the cart, a ${BUNDLE_DISCOUNT_PERCENT}% discount is applied automatically at checkout — no code required.

## The Qureshi Circle Rewards Program
Free to join at ${SITE_URL}/rewards. Members earn points on every order and unlock better rates as lifetime spend increases:
${tierLines}
${POINTS_PER_DOLLAR_CREDIT} points redeem for $1 of store credit.

## Shipping & Returns
- Free standard U.S. shipping on orders over $${FREE_SHIPPING_MINIMUM}.
- In-stock orders ship within 1 business day and typically arrive in 2–5 business days, insured and tracked.
- Unworn items in original packaging may be returned within ${RETURN_WINDOW_DAYS} days of delivery — one return per customer in any ${RETURN_LIMIT_DAYS}-day period.

## Frequently Asked Questions

**Is moissanite a real gemstone?**
Yes. Moissanite is a naturally occurring silicon carbide crystal, grown in a lab for gem quality. It scores 9.25 on the Mohs scale and refracts more light than diamond, so it reads brighter in person.

**Will it tarnish?**
The solid S925 base carries five layers of 18K gold plating sealed with a protective e-coat, so daily wear holds its finish for years.

**Is it hypoallergenic?**
Yes — nickel-free, lead-free and cadmium-free, safe for sensitive skin.

**Can I resize a ring?**
Yes. Client care guides customers through resizing on request; complimentary resizing is included for Gold Circle members and above.

## Contact
- Client care: ${SITE_URL}/contact
- Support email: ${SUPPORT_EMAIL}

---
Concise index: ${SITE_URL}/llms.txt · XML sitemap: ${SITE_URL}/sitemap.xml
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
