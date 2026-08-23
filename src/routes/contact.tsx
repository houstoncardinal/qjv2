import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Clock, Mail, MessageCircle, Package, Phone, Send } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitShopifyForm } from "@/lib/shopifyForm";
import {
  FREE_SHIPPING_MINIMUM,
  RETURN_LIMIT_DAYS,
  RETURN_WINDOW_DAYS,
  SITE_URL,
  SUPPORT_EMAIL,
  SUPPORT_HOURS,
  SUPPORT_PHONE,
  breadcrumbLd,
  faqLd,
} from "@/lib/site";

const title = "Contact Qureshi Jewelers | Client Care & Order Support";
const description =
  "Reach Qureshi Jewelers client care for sizing help, order status, returns and custom moissanite requests. Email, phone and a direct message form answered within one business day.";

const faqs = [
  {
    q: "Do you offer free shipping?",
    a: `Yes. Standard shipping is free across the United States on all orders over $${FREE_SHIPPING_MINIMUM}. Every parcel is insured and tracked.`,
  },
  {
    q: "What is your return policy?",
    a: `Unworn pieces can be returned within ${RETURN_WINDOW_DAYS} days of delivery in their original condition and packaging. To keep pricing fair for everyone, we accept one return per customer in any ${RETURN_LIMIT_DAYS}-day period.`,
  },
  {
    q: "Is moissanite a real gemstone?",
    a: "Yes. Moissanite is a naturally occurring silicon carbide crystal, grown in a lab for gem quality. It scores 9.25 on the Mohs scale and refracts more light than diamond, so it reads brighter in person.",
  },
  {
    q: "How fast do orders ship?",
    a: "In-stock pieces are dispatched within one business day. U.S. delivery typically takes 2–5 business days after dispatch, with tracking emailed at handover.",
  },
  {
    q: "Can I resize my ring?",
    a: "Yes. Contact client care with your order number and we will guide you through resizing. Complimentary resizing is included for Gold Circle members and above.",
  },
];

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/contact` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/contact` }],
  }),
  component: ContactPage,
});

const channels = [
  {
    icon: Mail,
    title: "Email client care",
    value: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}`,
    sub: "Replies within one business day",
  },
  {
    icon: Phone,
    title: "Call the atelier",
    value: SUPPORT_PHONE,
    href: `tel:${SUPPORT_PHONE.replace(/[^\d+]/g, "")}`,
    sub: SUPPORT_HOURS,
  },
  {
    icon: Package,
    title: "Order & returns help",
    value: "Track or return an order",
    href: "/account",
    sub: `${RETURN_WINDOW_DAYS}-day return window`,
  },
];

function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  return (
    <div className="min-h-screen bg-card">
      <SiteHeader />

      <main id="main-content">
        <section className="border-b border-border bg-background">
          <div className="mx-auto max-w-[1100px] px-6 py-14 sm:px-10">
            <p className="text-[10px] uppercase tracking-[0.42em] text-[var(--gold)]">
              We are here
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] sm:text-5xl">Contact us</h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Sizing questions, metal advice, order status, returns or a custom piece — a real
              person from the atelier will answer. {SUPPORT_HOURS}.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] px-6 py-12 sm:px-10">
          <ul className="grid gap-px border border-border bg-border md:grid-cols-3">
            {channels.map((c) => (
              <li key={c.title} className="bg-card p-7">
                <c.icon aria-hidden="true" className="h-5 w-5 text-[var(--gold)]" />
                <h2 className="mt-4 font-display text-xl">{c.title}</h2>
                {c.href.startsWith("/") ? (
                  <Link
                    to={c.href}
                    className="mt-2 inline-flex min-h-11 items-center text-sm text-foreground underline underline-offset-4"
                  >
                    {c.value}
                  </Link>
                ) : (
                  <a
                    href={c.href}
                    className="mt-2 inline-flex min-h-11 items-center text-sm text-foreground underline underline-offset-4"
                  >
                    {c.value}
                  </a>
                )}
                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {c.sub}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-y border-border bg-background py-14">
          <div className="mx-auto grid max-w-[1100px] gap-10 px-6 sm:px-10 md:grid-cols-[1fr_0.85fr]">
            <div>
              <MessageCircle aria-hidden="true" className="h-5 w-5 text-[var(--gold)]" />
              <h2 className="mt-4 font-display text-3xl">Send us a message</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Include your order number if your question is about an existing purchase — it lets
                us answer in one reply instead of three.
              </p>

              {status === "sent" ? (
                <div className="mt-8 flex items-start gap-3 border border-border bg-card p-6">
                  <Check
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0 text-[var(--gold)]"
                  />
                  <div>
                    <p className="font-display text-lg">Message sent</p>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      Thank you — client care will reply within one business day. Need to reach us
                      right away instead?{" "}
                      <a
                        href={`mailto:${SUPPORT_EMAIL}`}
                        className="underline hover:text-foreground"
                      >
                        Email {SUPPORT_EMAIL}
                      </a>
                      .
                    </p>
                  </div>
                </div>
              ) : (
                <form
                  className="mt-8 space-y-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const data = new FormData(form);
                    const topic = String(data.get("topic") || "General enquiry");
                    const order = String(data.get("order") || "");
                    const message = String(data.get("message") || "");
                    setStatus("sending");
                    void submitShopifyForm({
                      form_type: "contact",
                      utf8: "✓",
                      "contact[name]": String(data.get("name") || ""),
                      "contact[email]": String(data.get("email") || ""),
                      "contact[body]": `Topic: ${topic}${order ? `\nOrder number: ${order}` : ""}\n\n${message}`,
                    }).then(() => {
                      setStatus("sent");
                      form.reset();
                    });
                  }}
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full name</Label>
                      <Input id="name" name="name" required autoComplete="name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input id="email" name="email" type="email" required autoComplete="email" />
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="topic">Topic</Label>
                      <select
                        id="topic"
                        name="topic"
                        className="h-10 w-full border border-input bg-background px-3 text-sm focus-visible:outline-none"
                      >
                        <option>General enquiry</option>
                        <option>Sizing & fit</option>
                        <option>Order status</option>
                        <option>Return or exchange</option>
                        <option>Custom piece</option>
                        <option>Wholesale</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="order">Order number (optional)</Label>
                      <Input id="order" name="order" placeholder="#1042" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">How can we help?</Label>
                    <Textarea id="message" name="message" rows={6} required />
                  </div>
                  <Button
                    type="submit"
                    disabled={status === "sending"}
                    className="min-h-11 w-full sm:w-auto"
                  >
                    <Send aria-hidden="true" className="mr-2 h-4 w-4" />
                    {status === "sending" ? "Sending…" : "Send message"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Prefer email? Write to{" "}
                    <a href={`mailto:${SUPPORT_EMAIL}`} className="underline hover:text-foreground">
                      {SUPPORT_EMAIL}
                    </a>{" "}
                    directly.
                  </p>
                </form>
              )}
            </div>

            <aside className="border border-border bg-card p-7">
              <Clock aria-hidden="true" className="h-5 w-5 text-[var(--gold)]" />
              <h2 className="mt-4 font-display text-2xl">Quick answers</h2>
              <dl className="mt-6 space-y-6">
                {faqs.map((f) => (
                  <div key={f.q}>
                    <dt className="text-sm font-medium">{f.q}</dt>
                    <dd className="mt-2 text-xs leading-relaxed text-muted-foreground">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>
        </section>
      </main>

      <SiteFooter />
      <JsonLd data={faqLd(faqs)} />
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", url: "/" },
          { name: "Contact", url: "/contact" },
        ])}
      />
    </div>
  );
}
