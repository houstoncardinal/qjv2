import { createFileRoute, Link } from "@tanstack/react-router";
import { Contrast, Ear, Keyboard, MousePointer2, ScanEye, Type } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/accessibility")({
  head: () => ({
    meta: [
      { title: "Accessibility Statement | Qureshi Jewelers" },
      {
        name: "description",
        content:
          "How Qureshi Jewelers makes shopping fine moissanite jewelry accessible: keyboard navigation, screen reader support, reduced motion, contrast and assisted ordering.",
      },
      { property: "og:title", content: "Accessibility at Qureshi Jewelers" },
      {
        property: "og:description",
        content:
          "Our commitment to WCAG 2.1 AA, keyboard and screen reader support, and personal assisted-shopping help.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/accessibility" },
    ],
    links: [{ rel: "canonical", href: "/accessibility" }],
  }),
  component: Accessibility,
});

const features = [
  {
    icon: Keyboard,
    title: "Full keyboard navigation",
    body: "Every link, filter, variant swatch and checkout control is reachable with Tab and operable with Enter or Space, with a visible gold focus indicator at all times.",
  },
  {
    icon: ScanEye,
    title: "Screen reader support",
    body: "Semantic landmarks, descriptive alt text on product imagery, labelled icon controls and live announcements when items are added to your bag.",
  },
  {
    icon: MousePointer2,
    title: "Skip to content",
    body: "A skip link appears on first Tab so keyboard and switch users can bypass the navigation and go straight to the page content.",
  },
  {
    icon: Contrast,
    title: "Contrast & high-contrast mode",
    body: "Body text and interface controls target WCAG 2.1 AA contrast, and glass panels fall back to solid bordered surfaces in forced-colours mode.",
  },
  {
    icon: Type,
    title: "Zoom & reflow",
    body: "Layouts reflow cleanly to 200% zoom and down to 320px width, with tap targets sized for limited dexterity on touch devices.",
  },
  {
    icon: Ear,
    title: "Reduced motion",
    body: "If your device requests reduced motion, parallax, shimmer and long transitions are switched off automatically across the store.",
  },
];

function Accessibility() {
  return (
    <div className="min-h-screen bg-card">
      <SiteHeader />

      <main id="main-content">
        <section className="border-b border-border bg-background">
          <div className="mx-auto max-w-[1100px] px-6 py-14 sm:px-10">
            <p className="text-[10px] uppercase tracking-[0.42em] text-[var(--gold)]">
              Everyone welcome
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] sm:text-5xl">
              Accessibility Statement
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Qureshi Jewelers is committed to making fine jewelry shopping usable by everyone,
              including people who browse with screen readers, keyboards, switch devices, voice
              control, magnification or reduced motion settings. We build to the Web Content
              Accessibility Guidelines (WCAG) 2.1 Level AA.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] px-6 py-14 sm:px-10">
          <h2 className="font-display text-3xl">What we have built in</h2>
          <ul className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-2">
            {features.map((f) => (
              <li key={f.title} className="bg-card p-7">
                <f.icon aria-hidden="true" className="h-5 w-5 text-[var(--gold)]" />
                <h3 className="mt-4 font-display text-xl">{f.title}</h3>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{f.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-y border-border bg-foreground py-14 text-background">
          <div className="mx-auto max-w-[1100px] px-6 sm:px-10">
            <h2 className="font-display text-3xl">Assisted shopping</h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-background/70">
              If any part of this store is difficult to use, our client care team will complete your
              order with you over email or phone — including sizing guidance, metal selection and
              checkout — at no extra cost. Tell us the assistance you need and we will adapt.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="mailto:care@qureshijewelers.com?subject=Accessibility%20assistance"
                className="flex min-h-11 items-center bg-background px-8 py-4 text-[10px] uppercase tracking-[0.26em] text-foreground transition-opacity hover:opacity-85"
              >
                Email client care
              </a>
              <Link
                to="/shop"
                className="flex min-h-11 items-center border border-background/30 px-8 py-4 text-[10px] uppercase tracking-[0.26em] text-background/85 transition-colors hover:border-background hover:text-background"
              >
                Browse the collection
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] px-6 py-14 sm:px-10">
          <h2 className="font-display text-3xl">Feedback and ongoing work</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            We audit the storefront regularly with automated tooling and keyboard and screen reader
            testing. Accessibility is never finished — if you encounter a barrier, please report it
            to care@qureshijewelers.com with the page address and what happened. We aim to respond
            within two business days.
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
