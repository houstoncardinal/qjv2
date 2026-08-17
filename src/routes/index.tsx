import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Gem,
  Heart,
  Leaf,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import heroImage from "@/assets/hero-light.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Qureshi Jewelers | VVS1 Moissanite Hand-Set in 18K Gold" },
      {
        name: "description",
        content:
          "GRA-certified VVS1 D colour moissanite engagement rings, tennis bracelets, chains and stud earrings in 18K gold, white gold and rose gold plated S925 sterling silver.",
      },
      { property: "og:title", content: "Qureshi Jewelers | VVS1 Moissanite Fine Jewelry" },
      {
        property: "og:description",
        content:
          "Hand-set VVS1 moissanite in solid S925 sterling silver. GRA certified, shipped worldwide.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const categoryTiles = [
  { label: "Rings", sub: "Engagement & stackable", q: "product_type:ring" },
  { label: "Chains", sub: "Tennis & cuban links", q: "product_type:necklace" },
  { label: "Bracelets", sub: "Tennis bracelets", q: "product_type:bracelet" },
  { label: "Earrings", sub: "Studs & hoops", q: "product_type:earring" },
];

function useShopifyProducts(key: string, query?: string, count = 12) {
  return useQuery({
    queryKey: ["products", key, query ?? "all"],
    queryFn: () => fetchProducts(count, query),
  });
}

function ProductRow({
  eyebrow,
  title,
  subtitle,
  products,
  isLoading,
  ctaQuery,
  ctaLabel,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  products: ShopifyProduct[];
  isLoading: boolean;
  ctaQuery?: string;
  ctaLabel: string;
}) {
  if (!isLoading && products.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[9px] uppercase tracking-[0.34em] text-muted-foreground">{eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl">{title}</h2>
          {subtitle && <p className="mt-2 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <Link
          to="/shop"
          search={ctaQuery ? { q: ctaQuery } : {}}
          className="flex items-center gap-2 text-[9px] uppercase tracking-[0.26em] text-muted-foreground transition-colors hover:text-foreground"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-border bg-card">
                <Skeleton className="aspect-square w-full" />
                <div className="space-y-2 p-3.5">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          : products.slice(0, 6).map((p) => <ProductCard key={p.node.id} product={p} compact />)}
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Link
          to="/shop"
          search={ctaQuery ? { q: ctaQuery } : {}}
          className="flex items-center gap-2 bg-foreground px-7 py-3 text-[9px] uppercase tracking-[0.24em] text-background transition-opacity hover:opacity-85"
        >
          {ctaLabel} <ArrowRight className="h-3 w-3" />
        </Link>
        <Link
          to="/shop"
          className="border border-border px-7 py-3 text-[9px] uppercase tracking-[0.24em] text-foreground/75 transition-colors hover:border-foreground"
        >
          Shop all
        </Link>
      </div>
    </section>
  );
}

function Home() {
  const all = useShopifyProducts("home-all", undefined, 24);
  const rings = useShopifyProducts("home-rings", "product_type:ring", 12);
  const chains = useShopifyProducts("home-chains", "product_type:necklace", 12);

  const allProducts = all.data ?? [];
  const ringProducts = rings.data?.length ? rings.data : allProducts;
  const chainProducts = chains.data?.length ? chains.data : allProducts.slice(6);
  const trending = allProducts.slice(-6);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-foreground text-background">
          <img
            src={heroImage}
            alt="VVS1 moissanite rings in 18K gold and rose gold on silk"
            width={1920}
            height={1200}
            className="absolute inset-0 h-full w-full object-cover opacity-45 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-[linear-gradient(95deg,oklch(0.16_0.005_60/0.97)_0%,oklch(0.16_0.005_60/0.88)_45%,oklch(0.16_0.005_60/0.55)_100%)]" />
          <div className="relative mx-auto max-w-[1400px] px-5 py-24 sm:px-8 sm:py-28">
            <div className="max-w-2xl rise-in">
              <p className="text-[9px] uppercase tracking-[0.4em] text-[var(--gold)]">
                GRA Certified · D Colour · VVS1
              </p>
              <h1 className="mt-6 font-display text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
                VVS1 Moissanite
                <br />
                Hand-Set in 18K Gold
              </h1>
              <p className="mt-6 max-w-lg text-sm leading-relaxed text-background/70">
                Expertly crafted VVS1 moissanite set in precious 18K gold. Certified for those who
                demand quality that lasts — backed by GRA certification and a lifetime guarantee.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  to="/shop"
                  className="flex items-center gap-2 bg-background px-8 py-3.5 text-[10px] uppercase tracking-[0.24em] text-foreground transition-opacity hover:opacity-85"
                >
                  Shop the collection <ArrowRight className="h-3 w-3" />
                </Link>
                <Link
                  to="/craftsmanship"
                  className="border border-background/30 px-8 py-3.5 text-[10px] uppercase tracking-[0.24em] text-background/85 transition-colors hover:border-background"
                >
                  Our craftsmanship
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
                {[
                  { icon: BadgeCheck, label: "GRA Certified" },
                  { icon: Truck, label: "Free Insured Shipping" },
                  { icon: ShieldCheck, label: "Lifetime Warranty" },
                ].map((t) => (
                  <span key={t.label} className="flex items-center gap-2">
                    <t.icon className="h-3.5 w-3.5 text-[var(--gold)]" />
                    <span className="text-[9px] uppercase tracking-[0.24em] text-background/70">
                      {t.label}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Scrolling product strip */}
        <section className="border-b border-border bg-card">
          <div className="scroll-strip flex gap-3 overflow-x-auto px-5 py-4 sm:px-8">
            {(allProducts.length ? allProducts : []).slice(0, 14).map((p) => (
              <Link
                key={p.node.id}
                to="/product/$handle"
                params={{ handle: p.node.handle }}
                className="group w-[104px] shrink-0"
              >
                <div className="aspect-square overflow-hidden bg-secondary/60">
                  {p.node.images.edges[0]?.node && (
                    <img
                      src={p.node.images.edges[0]!.node.url}
                      alt={p.node.images.edges[0]!.node.altText ?? p.node.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-[8px] uppercase leading-tight tracking-[0.12em] text-muted-foreground">
                  {p.node.title}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <ProductRow
          eyebrow="Curated Collection"
          title="Engagement Rings"
          subtitle="Solitaires, halos and stackable bands in every finish."
          products={ringProducts}
          isLoading={rings.isLoading && all.isLoading}
          ctaQuery="product_type:ring"
          ctaLabel="Shop engagement rings"
        />

        <div className="bg-secondary/60">
          <ProductRow
            eyebrow="Everyday Brilliance"
            title="Necklaces & Chains"
            subtitle="Tennis chains, cuban links and pendants."
            products={chainProducts}
            isLoading={chains.isLoading && all.isLoading}
            ctaQuery="product_type:necklace"
            ctaLabel="Shop necklaces"
          />
        </div>

        <ProductRow
          eyebrow="Just In"
          title="Latest & Trending"
          subtitle="The pieces moving fastest this month."
          products={trending}
          isLoading={all.isLoading}
          ctaLabel="Shop new arrivals"
        />

        {/* Why choose */}
        <section className="border-y border-border bg-secondary/60 py-20">
          <div className="mx-auto max-w-[1400px] px-5 text-center sm:px-8">
            <p className="text-[9px] uppercase tracking-[0.34em] text-muted-foreground">
              The Difference
            </p>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl">Why Choose Qureshi Jewelers?</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Every stone independently graded, every setting finished by hand, every order insured
              door to door.
            </p>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: Heart,
                  title: "Crafted with Care",
                  copy: "Every stone is hand-set by bench jewelers and inspected under 10× magnification before it ships.",
                },
                {
                  icon: Gem,
                  title: "Customer First",
                  copy: "Free resizing within 60 days, 30-day returns and a support team that answers in hours, not weeks.",
                },
                {
                  icon: Award,
                  title: "Premium Quality",
                  copy: "Solid S925 sterling silver with 5 layers of 18K plating and a protective e-coat that resists tarnish.",
                },
              ].map((c) => (
                <div key={c.title} className="glass-panel p-8 text-left">
                  <c.icon className="h-5 w-5 text-[var(--gold)]" />
                  <h3 className="mt-5 font-display text-xl">{c.title}</h3>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{c.copy}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {[
                { stat: "100%", label: "GRA certified stones" },
                { stat: "24/7", label: "Client care" },
                { stat: "5×", label: "18K gold plating layers" },
              ].map((s) => (
                <div key={s.stat} className="border border-border bg-card p-6">
                  <p className="font-display text-3xl">{s.stat}</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.24em] text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sustainability panel */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
            <span className="inline-flex items-center gap-2 border border-border px-4 py-1.5 text-[8px] uppercase tracking-[0.26em] text-muted-foreground">
              <Leaf className="h-3 w-3 text-[var(--gold)]" /> Sustainably created
            </span>
            <h2 className="mt-6 font-display text-4xl sm:text-5xl">
              Brilliance that never costs <span className="italic">the earth.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Lab-created moissanite delivers more fire and brilliance than diamond, with none of
              the mining impact — and it is independently verified, not just claimed.
            </p>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                { stat: "0", label: "Carats mined" },
                { stat: "100%", label: "Lab created" },
                { stat: "~97%", label: "Lower footprint" },
              ].map((s) => (
                <div key={s.label} className="border border-border bg-card p-6 text-left">
                  <p className="font-display text-3xl">{s.stat}</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-3 grid gap-3 border border-border bg-card p-6 text-left sm:grid-cols-3">
              {[
                { k: "Certification", v: "GRA · D Colourless" },
                { k: "Clarity", v: "VVS1 · Eye clean" },
                { k: "Refractive index", v: "2.65–2.69 vs diamond 2.42" },
              ].map((r) => (
                <div key={r.k}>
                  <p className="text-[8px] uppercase tracking-[0.24em] text-muted-foreground">
                    {r.k}
                  </p>
                  <p className="mt-1.5 text-xs text-foreground/85">{r.v}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust row */}
        <section className="border-y border-border bg-secondary/60">
          <div className="mx-auto grid max-w-[1400px] gap-8 px-5 py-12 text-center sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
            {[
              { icon: BadgeCheck, title: "GRA Certified", copy: "Certificate with every order" },
              { icon: Sparkles, title: "VVS1 · D Colour", copy: "Eye-clean, maximum fire" },
              { icon: Truck, title: "Free Shipping", copy: "Insured and tracked worldwide" },
              { icon: ShieldCheck, title: "Lifetime Warranty", copy: "Craftsmanship guaranteed" },
            ].map((t) => (
              <div key={t.title} className="flex flex-col items-center">
                <t.icon className="h-5 w-5 text-[var(--gold)]" />
                <p className="mt-3 text-[9px] uppercase tracking-[0.26em] text-foreground">
                  {t.title}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">{t.copy}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Shop by category */}
        <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8">
          <p className="text-[9px] uppercase tracking-[0.34em] text-muted-foreground">Browse</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl">Shop by Category</h2>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categoryTiles.map((c, i) => {
              const img = allProducts.filter((p) =>
                new RegExp(c.label.slice(0, 4), "i").test(p.node.productType ?? ""),
              )[0]?.node.images.edges[0]?.node ??
                allProducts[i]?.node.images.edges[0]?.node;
              return (
                <Link
                  key={c.label}
                  to="/shop"
                  search={{ q: c.q }}
                  className="group relative aspect-[4/3] overflow-hidden bg-secondary"
                >
                  {img && (
                    <img
                      src={img.url}
                      alt={`${c.label} collection`}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,oklch(0.16_0.005_60/0.75),transparent_55%)]" />
                  <div className="absolute bottom-4 left-5">
                    <p className="font-display text-2xl text-background">{c.label}</p>
                    <p className="text-[8px] uppercase tracking-[0.24em] text-background/70">
                      {c.sub}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
