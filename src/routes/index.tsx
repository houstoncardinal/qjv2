import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Gem, ShieldCheck, Sparkles, Truck } from "lucide-react";
import heroImage from "@/assets/hero-jewelry.jpg";
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
          "Discover GRA-certified D colour VVS1 moissanite engagement rings, tennis bracelets, necklaces and earrings in 18K gold plated S925 sterling silver.",
      },
      { property: "og:title", content: "Qureshi Jewelers | Moissanite Fine Jewelry" },
      {
        property: "og:description",
        content:
          "Brilliant, GRA-certified moissanite jewelry set in 18K gold plated sterling silver. Shipped worldwide.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const categories = [
  { label: "Rings", query: "product_type:ring" },
  { label: "Necklaces", query: "product_type:necklace" },
  { label: "Earrings", query: "product_type:earring" },
  { label: "Bracelets", query: "product_type:bracelet" },
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
        <section className="relative min-h-[86vh] overflow-hidden">
          <img
            src={heroImage}
            alt="Moissanite pendant and gold rings worn against black silk"
            width={1600}
            height={1200}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-background/55" />
          <div className="absolute inset-0 bg-[image:var(--gradient-veil)]" />
          <div className="relative mx-auto flex min-h-[86vh] max-w-7xl flex-col justify-end px-6 pb-24 pt-32">
            <div className="max-w-2xl rise-in">
              <p className="eyebrow">GRA Certified · D Colour · VVS1</p>
              <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-tight sm:text-7xl">
                Brilliance,{" "}
                <span className="text-gold italic">without compromise</span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
                Hand-set moissanite in 18K gold plating over S925 sterling silver. The fire of a
                diamond, the conscience of a modern house.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Button asChild variant="gold" size="lg">
                  <Link to="/shop">
                    Shop the collection <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outlineGold" size="lg">
                  <Link to="/craftsmanship">Our craftsmanship</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee */}
        <section className="overflow-hidden border-y border-border/60 bg-card/40 py-4">
          <div className="marquee-track flex w-max gap-14 whitespace-nowrap">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-14">
                {[
                  "GRA Certificate Included",
                  "18K Gold Plated S925",
                  "Insured Worldwide Shipping",
                  "D Colour · VVS1 Clarity",
                  "Secure Shopify Checkout",
                ].map((t) => (
                  <span
                    key={t + i}
                    className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground"
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.label}
                to="/shop"
                search={{ q: c.query }}
                className="group relative overflow-hidden border border-border/70 bg-card/40 p-8 transition-colors hover:border-primary/50"
              >
                <p className="eyebrow">Shop</p>
                <h3 className="mt-3 font-display text-2xl transition-colors group-hover:text-primary">
                  {c.label}
                </h3>
                <ArrowRight className="mt-6 h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
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
              className="hidden text-[11px] uppercase tracking-[0.25em] text-primary hover:underline sm:block"
            >
              View all
            </Link>
          </div>
          <div className="mt-4 hairline" />

          <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading &&
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-[4/5] w-full" />
                  <Skeleton className="mt-5 h-4 w-3/4" />
                  <Skeleton className="mt-2 h-4 w-1/3" />
                </div>
              ))}
            {!isLoading &&
              products.map((p) => <ProductCard key={p.node.id} product={p} />)}
          </div>

          {!isLoading && products.length === 0 && (
            <p className="py-20 text-center text-muted-foreground">
              {isError ? "Unable to load products right now." : "No products found."}
            </p>
          )}
        </section>

        {/* Value props */}
        <section className="border-t border-border/60 bg-card/40">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Gem, title: "GRA Certified", copy: "Every stone graded D colour, VVS1." },
              {
                icon: Sparkles,
                title: "18K Gold Plated",
                copy: "Over solid S925 sterling silver.",
              },
              { icon: Truck, title: "Insured Delivery", copy: "Tracked and protected worldwide." },
              {
                icon: ShieldCheck,
                title: "Secure Checkout",
                copy: "Payments processed by Shopify.",
              },
            ].map((v) => (
              <div key={v.title}>
                <v.icon className="h-5 w-5 text-primary" />
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
