import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, Truck } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import {
  FREE_SHIPPING_MINIMUM,
  RETURN_LIMIT_DAYS,
  RETURN_WINDOW_DAYS,
  SITE_URL,
  SUPPORT_EMAIL,
  breadcrumbLd,
  faqLd,
} from "@/lib/site";

const title = "Terms & Conditions, Shipping and Returns | Qureshi Jewelers";
const description = `Qureshi Jewelers terms of sale, warranty, free U.S. shipping over $${FREE_SHIPPING_MINIMUM} and our ${RETURN_WINDOW_DAYS}-day return policy — one return per customer every ${RETURN_LIMIT_DAYS} days.`;

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/terms` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/terms` }],
  }),
  component: TermsPage,
});

const policyFaqs = [
  {
    q: "How long do I have to return an item?",
    a: `Unworn items in original condition and packaging may be returned within ${RETURN_WINDOW_DAYS} days of delivery.`,
  },
  {
    q: "How many returns can I make?",
    a: `One return per customer in any ${RETURN_LIMIT_DAYS}-day period. Additional returns in the same period cannot be accepted.`,
  },
  {
    q: "When is shipping free?",
    a: `Standard shipping is free everywhere in the United States on orders over $${FREE_SHIPPING_MINIMUM}. Orders below that threshold are charged a flat standard rate at checkout.`,
  },
];

const sections: Array<{ heading: string; body: string[] }> = [
  {
    heading: "1. Agreement",
    body: [
      "By browsing this store, creating an account or placing an order you agree to these Terms & Conditions. If you do not agree, please do not use the store. These terms do not affect statutory consumer rights that cannot be waived.",
    ],
  },
  {
    heading: "2. Products, pricing and availability",
    body: [
      "All prices are listed in U.S. dollars and exclude sales tax and any duties, which are calculated at checkout where applicable. Stone weights are given as diamond-equivalent carat weight; measurements are approximate within normal handcrafting tolerance, and screen colour rendering may vary slightly from the finished piece.",
      "We may correct pricing or description errors and cancel affected orders with a full refund. Stock is limited and availability is confirmed only when your order is accepted.",
    ],
  },
  {
    heading: "3. Orders and payment",
    body: [
      "Placing an order is an offer to buy. Your order is accepted when we send a confirmation email. Payment is captured at checkout through our payment processors; we reserve the right to cancel and refund orders that fail fraud or address verification.",
    ],
  },
  {
    heading: "4. Shipping",
    body: [
      `Standard shipping is free within the United States on all orders over $${FREE_SHIPPING_MINIMUM}. Orders under that amount are charged a flat standard shipping rate shown at checkout. Expedited options are available at cost.`,
      "In-stock pieces are dispatched within one business day of order confirmation. U.S. transit is typically 2–5 business days after dispatch. Every parcel is insured and tracked, and tracking is emailed at handover to the carrier.",
      "Once a parcel is handed to the carrier, delivery timelines are outside our control. Undeliverable parcels returned due to an incorrect address may incur reshipment costs.",
    ],
  },
  {
    heading: "5. Returns and exchanges",
    body: [
      `You may return an eligible item within ${RETURN_WINDOW_DAYS} days of delivery. Items must be unworn, undamaged and returned in the original packaging with the GRA certificate included.`,
      `To keep pricing sustainable for every customer, we accept one return per customer in any ${RETURN_LIMIT_DAYS}-day period. A second return requested inside the same period cannot be accepted.`,
      `Start a return by emailing ${SUPPORT_EMAIL} with your order number. We issue a prepaid return label for U.S. orders, and refunds are processed to the original payment method within 5–7 business days of the returned item passing inspection.`,
      "Non-returnable: custom, engraved and resized pieces, earrings (for hygiene reasons) once the seal is broken, gift cards, and items showing wear, damage or alteration.",
      "Exchanges for a different metal or size follow the same window and are shipped once the original item is received.",
    ],
  },
  {
    heading: "6. Warranty",
    body: [
      "Every piece carries a lifetime warranty against manufacturing defects in setting and construction. The warranty does not cover normal wear of plating, impact damage, loss, or damage caused by chemicals, chlorine or improper storage. Complimentary re-plating is offered to eligible Qureshi Circle members.",
    ],
  },
  {
    heading: "7. Qureshi Circle rewards",
    body: [
      "Points are earned on the merchandise value of delivered orders and hold no cash value. Points from a returned order are reversed. We may adjust tier thresholds and rewards with notice, and may suspend accounts engaged in abuse of the program.",
    ],
  },
  {
    heading: "8. Accounts",
    body: [
      "You are responsible for the accuracy of your account details and for keeping your password secure. Notify us immediately of unauthorised use. We may suspend accounts used for fraud, resale abuse or repeated return abuse.",
    ],
  },
  {
    heading: "9. Intellectual property",
    body: [
      "All product imagery, copy, designs and branding on this store are owned by Qureshi Jewelers and may not be reproduced or used commercially without written permission.",
    ],
  },
  {
    heading: "10. Liability and governing law",
    body: [
      "To the fullest extent permitted by law, our liability for any claim relating to a product or order is limited to the amount you paid for it. These terms are governed by the laws of the State of Texas, United States, without regard to conflict of law rules.",
    ],
  },
];

function TermsPage() {
  return (
    <div className="min-h-screen bg-card">
      <SiteHeader />

      <main id="main-content">
        <section className="border-b border-border bg-background">
          <div className="mx-auto max-w-[900px] px-6 py-14 sm:px-10">
            <p className="text-[10px] uppercase tracking-[0.42em] text-[var(--gold)]">Legal</p>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] sm:text-5xl">
              Terms &amp; Conditions
            </h1>
            <p className="mt-4 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              Effective 1 January 2026
            </p>

            <div className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-2">
              <div className="bg-card p-6">
                <Truck aria-hidden="true" className="h-5 w-5 text-[var(--gold)]" />
                <h2 className="mt-3 font-display text-xl">
                  Free U.S. shipping over ${FREE_SHIPPING_MINIMUM}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Insured and tracked on every order, dispatched within one business day.
                </p>
              </div>
              <div className="bg-card p-6">
                <RotateCcw aria-hidden="true" className="h-5 w-5 text-[var(--gold)]" />
                <h2 className="mt-3 font-display text-xl">{RETURN_WINDOW_DAYS}-day returns</h2>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  One return per customer every {RETURN_LIMIT_DAYS} days, on unworn pieces in
                  original packaging.
                </p>
              </div>
            </div>
          </div>
        </section>

        <article className="mx-auto max-w-[900px] px-6 py-14 sm:px-10">
          {sections.map((s) => (
            <section
              key={s.heading}
              className="mb-10 border-t border-border pt-7 first:border-0 first:pt-0"
            >
              <h2 className="font-display text-2xl">{s.heading}</h2>
              {s.body.map((p) => (
                <p
                  key={p.slice(0, 30)}
                  className="mt-4 text-sm leading-relaxed text-muted-foreground"
                >
                  {p}
                </p>
              ))}
            </section>
          ))}
        </article>
      </main>

      <SiteFooter />
      <JsonLd data={faqLd(policyFaqs)} />
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", url: "/" },
          { name: "Terms & Conditions", url: "/terms" },
        ])}
      />
    </div>
  );
}
