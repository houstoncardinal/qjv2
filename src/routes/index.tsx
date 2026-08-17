import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Gem, ShieldCheck, Sparkles, Truck } from "lucide-react";
import heroImage from "@/assets/hero-light.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProducts } from "@/lib/shopify";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Qureshi Jewelers | GRA-Certified Moissanite Fine Jewelry" },
      {
        name: "description",
        content:
          "Discover GRA-certified D colour VVS1 moissanite engagement rings, tennis bracelets, necklaces and earrings in 18K gold, silver and rose gold plated S925 sterling silver.",
      },
      { property: "og:title", content: "Qureshi Jewelers | Moissanite Fine Jewelry" },
      {
        property: "og:description",
        content:
          "Brilliant, GRA-certified moissanite jewelry in gold, silver and rose gold finishes. Shipped worldwide.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const categories = [
  { label: "Rings", query: "product_type:ring", swatch: "swatch-gold" },
  { label: "Necklaces", query: "product_type:necklace", swatch: "swatch-silver" },
  { label: "Earrings", query: "product_type:earring", swatch: "swatch-rose" },
  { label: "Bracelets", query: "product_type:bracelet", swatch: "swatch-ink" },
];

const finishes = [
  { label: "18K Gold", swatch: "swatch-gold" },
  { label: "Rhodium Silver", swatch: "swatch-silver" },
  { label: "Rose Gold", swatch: "swatch-rose" },
];

function Home() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => fetchProducts(8),
  });

  const products = data ?? [];

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="relative min-h-[82vh] overflow-hidden bg-porcelain">
          <img
            src={heroImage}
            alt="Moissanite rings in gold, rose gold and silver arranged on white silk"
            width={1920}
            height={1200}
            className="absolute inset-0 h-full w-full object-cover object-right"
          />
          <div className="absolute inset-0 bg-[linear-gradient(100deg,oklch(1_0_0/0.96)_0%,oklch(1_0_0/0.8)_38%,oklch(1_0_0/0.1)_66%,transparent_100%)]" />
          <div className="relative mx-auto flex min-h-[82vh] max-w-7xl items-center px-6 py-24">
            <div className="max-w-xl rise-in">
              <p className="eyebrow">GRA Certified · D Colour · VVS1</p>
              <h1 className="mt-6 font-display text-6xl leading-[1.02] tracking-tight sm:text-7xl">
                Brilliance,
                <br />
                <span className="italic text-gold">without compromise</span>
              </h1>
              <p className="mt-7 max-w-md text-base leading-relaxed text-muted-foreground">
                Hand-set moissanite finished in 18K gold, rhodium silver and rose gold over S925
                sterling silver. The fire of a diamond, the conscience of a modern house.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-5">
                {finishes.map((f) => (
                  <span key={f.label} className="flex items-center gap-2">
                    <span className={`h-5 w-5 rounded-full ring-1 ring-border ${f.swatch}`} />
                    <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                      {f.label}
                    </span>
                  </span>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <Button asChild variant="gold" size="lg" className="rounded-full">
                  <Link to="/shop">
                    Shop the collection <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outlineGold" size="lg" className="rounded-full">
                  <Link to="/craftsmanship">Our craftsmanship</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee */}
        <section className="overflow-hidden border-y border-border bg-foreground py-4">
          <div className="marquee-track flex w-max gap-14 whitespace-nowrap">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-14">
                {[
                  "GRA Certificate Included",
                  "18K Gold · Silver · Rose Gold",
                  "Insured Worldwide Shipping",
                  "D Colour · VVS1 Clarity",
                  "Secure Shopify Checkout",
                ].map((t) => (
                  <span
                    key={t + i}
                    className="text-[9px] uppercase tracking-[0.38em] text-background/75"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.label}
                to="/shop"
                search={{ q: c.query }}
                className="group glass-panel relative overflow-hidden rounded-lg p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
              >
                <span className={`block h-8 w-8 rounded-full ring-1 ring-border ${c.swatch}`} />
                <h3 className="mt-6 font-display text-2xl">{c.label}</h3>
                <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  Shop now
                </p>
                <ArrowRight className="mt-6 h-4 w-4 text-[var(--gold)] transition-transform duration-500 group-hover:translate-x-1.5" />
              </Link>
            ))}
          </div>
        </section>

        {/* Featured products */}
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Curated</p>
              <h2 className="mt-3 font-display text-4xl sm:text-5xl">Signature pieces</h2>
            </div>
            <Link
              to="/shop"
              className="hidden text-[10px] uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              View all
            </Link>
          </div>
          <div className="mt-5 hairline" />

          <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading &&
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-[4/5] w-full" />
                  <Skeleton className="mt-5 h-4 w-3/4" />
                  <Skeleton className="mt-2 h-4 w-1/3" />
                </div>
              ))}
            {!isLoading && products.map((p) => <ProductCard key={p.node.id} product={p} />)}
          </div>

          {!isLoading && products.length === 0 && (
            <p className="py-20 text-center text-muted-foreground">
              {isError ? "Unable to load products right now." : "No products found."}
            </p>
          )}
        </section>

        {/* Value props */}
        <section className="border-t border-border bg-secondary/50">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Gem, title: "GRA Certified", copy: "Every stone graded D colour, VVS1." },
              {
                icon: Sparkles,
                title: "Three Finishes",
                copy: "18K gold, rhodium silver, rose gold.",
              },
              { icon: Truck, title: "Insured Delivery", copy: "Tracked and protected worldwide." },
              {
                icon: ShieldCheck,
                title: "Secure Checkout",
                copy: "Payments processed by Shopify.",
              },
            ].map((v) => (
              <div key={v.title}>
                <v.icon className="h-5 w-5 text-[var(--gold)]" />
                <h3 className="mt-4 font-display text-xl">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.copy}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
