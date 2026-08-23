import { createFileRoute, Link } from "@tanstack/react-router";
import { Gem, Hammer, ShieldCheck, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { RETURN_WINDOW_DAYS, SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/craftsmanship")({
  head: () => ({
    meta: [
      { title: "Craftsmanship | Qureshi Jewelers Atelier" },
      {
        name: "description",
        content:
          "Inside the Qureshi Jewelers atelier: GRA-certified moissanite, 18K gold plated sterling silver, and hand-finishing that takes days per piece.",
      },
      { property: "og:title", content: "Craftsmanship | Qureshi Jewelers" },
      {
        property: "og:description",
        content: "Hand-set moissanite, 18K gold plating, and a lifetime warranty on every piece.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: `${SITE_URL}/craftsmanship` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/craftsmanship` }],
  }),
  component: Craftsmanship,
});

const pillars = [
  {
    icon: Gem,
    title: "The Stone",
    body: "Every moissanite is GRA certified, cut to ideal proportions and graded for D-colour brilliance that outperforms diamond in fire.",
  },
  {
    icon: Hammer,
    title: "The Setting",
    body: "Sterling silver is cast, filed and polished by hand, then plated in 18K gold at a thickness built to live with you, not to fade.",
  },
  {
    icon: Sparkles,
    title: "The Finish",
    body: "Each piece passes three inspections — stone security, plating depth, and final polish — before it is boxed in our signature case.",
  },
  {
    icon: ShieldCheck,
    title: "The Promise",
    body: `A lifetime warranty on craftsmanship, complimentary re-polishing, and ${RETURN_WINDOW_DAYS}-day returns on every order, anywhere in the world.`,
  },
];

function Craftsmanship() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="main-content">
        <section className="mx-auto max-w-4xl px-6 pb-16 pt-20 text-center">
          <p className="eyebrow">The Atelier</p>
          <h1 className="mt-5 font-display text-5xl leading-[1.05] md:text-6xl">
            Made slowly, so it lasts a lifetime
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Qureshi Jewelers exists for the moments worth marking. Each piece is produced in small
            runs by a team of bench jewelers who have spent decades setting stones by hand — no
            mass casting, no shortcuts, no compromise on the details you only notice up close.
          </p>
        </section>

        <section className="mx-auto grid max-w-6xl gap-px border border-border bg-border px-0 sm:grid-cols-2">
          {pillars.map((p) => (
            <article key={p.title} className="glass-panel p-10">
              <p.icon className="h-5 w-5 text-[var(--gold)]" />
              <h2 className="mt-6 font-display text-2xl">{p.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </article>
          ))}
        </section>

        <section className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p className="eyebrow">Our standard</p>
          <blockquote className="mt-6 font-display text-3xl leading-snug md:text-4xl">
            “If it would not pass as an heirloom in thirty years, it does not leave the bench.”
          </blockquote>
          <div className="mt-10">
            <Button asChild variant="gold" size="lg">
              <Link to="/shop">Explore the collection</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
