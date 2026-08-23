import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Gem, Globe2, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { RETURN_POLICY_SHORT, SHIPPING_POLICY_SHORT, SITE_URL, breadcrumbLd } from "@/lib/site";

const title = "About Qureshi Jewelers | Ethical Moissanite Fine Jewelry";
const description =
  "Qureshi Jewelers hand-sets GRA-certified VVS1 D colour moissanite in 18K gold plated S925 sterling silver — lab-grown brilliance, conflict-free sourcing and a lifetime warranty.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/about` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/about` }],
  }),
  component: AboutPage,
});

const pillars = [
  {
    icon: Gem,
    title: "Stones that outperform",
    body: "Every stone is GRA certified at VVS1 clarity and D colour, cut to ideal proportions. Moissanite refracts more fire than diamond — at a fraction of the cost, with none of the mining.",
  },
  {
    icon: ShieldCheck,
    title: "Metal that lasts",
    body: "Solid S925 sterling silver, plated in 18K yellow, white or rose gold at a thickness built for daily wear. No hollow shanks, no plated brass, no shortcuts.",
  },
  {
    icon: Globe2,
    title: "Sourcing without compromise",
    body: "Lab-grown stones and recycled silver mean no conflict minerals and a fraction of the carbon and water footprint of mined diamond jewelry.",
  },
  {
    icon: HeartHandshake,
    title: "Service that stays",
    body: "Lifetime warranty on craftsmanship, complimentary re-plating for Circle members, and a client care team that answers within one business day.",
  },
];

const stats = [
  { value: "18K", label: "Gold plating thickness standard" },
  { value: "VVS1", label: "Minimum clarity, D colour" },
  { value: "40+", label: "Hand-finishing steps per piece" },
  { value: "Lifetime", label: "Craftsmanship warranty" },
];

const timeline = [
  {
    year: "The idea",
    body: "A family of bench jewelers refused to accept that brilliance had to mean a mined stone and a four-figure invoice. The first moissanite solitaire was set by hand on a kitchen bench.",
  },
  {
    year: "The atelier",
    body: "A dedicated workshop, GRA certification on every stone, and a plating standard written to survive real life rather than a photoshoot.",
  },
  {
    year: "Today",
    body: "Thousands of engagements, anniversaries and self-gifts later, every order still passes through a human hand before it is boxed.",
  },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-card">
      <SiteHeader />

      <main id="main-content">
        <section className="border-b border-border bg-foreground text-background">
          <div className="mx-auto max-w-[1100px] px-6 py-16 sm:px-10">
            <p className="text-[10px] uppercase tracking-[0.42em] text-[var(--gold)]">
              Our story
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] sm:text-6xl">
              Brilliance, engineered. <span className="italic">Never mined.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-background/70">
              Qureshi Jewelers exists for the person who wants the fire of a flawless stone and the
              integrity of knowing exactly where it came from. We hand-set GRA-certified VVS1
              moissanite into solid sterling silver, plate it in 18K gold, and stand behind it for
              life.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="flex min-h-11 items-center bg-background px-8 py-4 text-[10px] uppercase tracking-[0.26em] text-foreground transition-opacity hover:opacity-85"
              >
                Shop the collection
              </Link>
              <Link
                to="/contact"
                className="flex min-h-11 items-center border border-background/30 px-8 py-4 text-[10px] uppercase tracking-[0.26em] text-background/85 transition-colors hover:border-background"
              >
                Talk to client care
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-background">
          <div className="mx-auto grid max-w-[1100px] grid-cols-2 gap-px bg-border px-0 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-background px-6 py-8 text-center">
                <p className="font-display text-3xl">{s.value}</p>
                <p className="mt-2 text-[9px] uppercase tracking-[0.24em] text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] px-6 py-14 sm:px-10">
          <h2 className="font-display text-3xl sm:text-4xl">What we refuse to compromise on</h2>
          <ul className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-2">
            {pillars.map((p) => (
              <li key={p.title} className="bg-card p-7">
                <p.icon aria-hidden="true" className="h-5 w-5 text-[var(--gold)]" />
                <h3 className="mt-4 font-display text-xl">{p.title}</h3>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{p.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-y border-border bg-background py-14">
          <div className="mx-auto max-w-[1100px] px-6 sm:px-10">
            <h2 className="font-display text-3xl sm:text-4xl">How we got here</h2>
            <ol className="mt-8 grid gap-8 md:grid-cols-3">
              {timeline.map((t, i) => (
                <li key={t.year} className="border-t border-border pt-5">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[var(--gold)]">
                    0{i + 1} · {t.year}
                  </span>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] px-6 py-14 sm:px-10">
          <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div>
              <Sparkles aria-hidden="true" className="h-5 w-5 text-[var(--gold)]" />
              <h2 className="mt-4 font-display text-3xl sm:text-4xl">Our promise to you</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {SHIPPING_POLICY_SHORT}. {RETURN_POLICY_SHORT}. Every order ships insured and
                tracked with its GRA certificate, in packaging you can hand over as-is.
              </p>
            </div>
            <div className="border border-border bg-background p-7">
              <Award aria-hidden="true" className="h-5 w-5 text-[var(--gold)]" />
              <h3 className="mt-4 font-display text-xl">The Qureshi Circle</h3>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Every purchase earns points toward store credit, free express shipping and
                complimentary re-plating.
              </p>
              <Link
                to="/rewards"
                className="mt-5 inline-flex min-h-11 items-center text-[10px] uppercase tracking-[0.26em] text-foreground underline underline-offset-8"
              >
                Explore rewards
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", url: "/" },
          { name: "About", url: "/about" },
        ])}
      />
    </div>
  );
}
