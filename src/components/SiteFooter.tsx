import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

const columns: Array<{ title: string; links: Array<{ label: string; to: string; q?: string }> }> = [
  {
    title: "Shop",
    links: [
      { label: "Chains", to: "/shop", q: "product_type:necklace" },
      { label: "Tennis Bracelets", to: "/shop", q: "product_type:bracelet" },
      { label: "Stud Earrings", to: "/shop", q: "product_type:earring" },
      { label: "Engagement Rings", to: "/shop", q: "product_type:ring" },
      { label: "All Pieces", to: "/shop" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Moissanite Guide", to: "/craftsmanship" },
      { label: "Size Guide", to: "/craftsmanship" },
      { label: "Our Craft", to: "/craftsmanship" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Shipping & FAQ", to: "/craftsmanship" },
      { label: "Returns", to: "/craftsmanship" },
      { label: "Contact Us", to: "/craftsmanship" },
    ],
  },
];

export function SiteFooter() {
  return (
    <>
      {/* Newsletter */}
      <section className="bg-foreground py-12 text-background">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <p className="text-[9px] uppercase tracking-[0.42em] text-[var(--gold)]">
            The Inner Circle
          </p>
          <h2 className="mt-5 font-display text-4xl sm:text-5xl">
            First access. <span className="italic">Always.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-background/65">
            Join our private list. First to see new drops, limited finishes, and members-only
            pricing. No noise — just the good stuff.
          </p>
          <form
            className="mx-auto mt-8 flex max-w-md items-center gap-3 border-b border-background/25 pb-2"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              required
              placeholder="Your email address"
              aria-label="Email address"
              className="w-full bg-transparent py-2 text-sm text-background placeholder:text-background/40 focus:outline-none"
            />
            <button
              type="submit"
              className="flex shrink-0 items-center gap-2 bg-background px-6 py-2.5 text-[10px] uppercase tracking-[0.24em] text-foreground transition-opacity hover:opacity-85"
            >
              Subscribe <ArrowRight className="h-3 w-3" />
            </button>
          </form>
          <p className="mt-4 text-[10px] tracking-wide text-background/40">
            Unsubscribe anytime. No sharing, ever.
          </p>
        </div>
      </section>

      <footer className="bg-secondary">
        <div className="mx-auto max-w-[1400px] px-6 py-12">
          <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
            <div>
              <span className="font-display text-3xl">Qureshi</span>
              <span className="mt-1 block text-[7px] uppercase tracking-[0.5em] text-muted-foreground">
                Jewelers
              </span>
              <p className="mt-5 max-w-xs text-xs leading-relaxed text-muted-foreground">
                Hand-set VVS1 moissanite in solid S925 sterling silver. GRA certified. Built for
                those who demand brilliance without compromise.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["GRA Certified", "VVS1 · D Color", "S925 Silver"].map((b) => (
                  <span
                    key={b}
                    className="border border-border px-3 py-1.5 text-[8px] uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                  {col.title}
                </p>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        to={l.to}
                        search={l.q ? { q: l.q } : {}}
                        className="text-xs text-foreground/75 transition-colors hover:text-foreground"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
            <p className="text-[9px] uppercase tracking-[0.24em] text-muted-foreground">
              © {new Date().getFullYear()} Qureshi Jewelers · All rights reserved
            </p>
            <div className="flex gap-6">
              {["Privacy Policy", "Terms & Conditions", "GRA Certificate"].map((t) => (
                <span
                  key={t}
                  className="text-[9px] uppercase tracking-[0.24em] text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
