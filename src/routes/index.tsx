import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Crown,
  Gem,
  Heart,
  Leaf,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";

import catRingsAsset from "@/assets/cat-rings.avif.asset.json";
import catChainsAsset from "@/assets/cat-chains.avif.asset.json";
import catBraceletsAsset from "@/assets/cat-bracelets.jpg.asset.json";
import catEarringsAsset from "@/assets/cat-earrings.png.asset.json";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { MetalSwatch } from "@/components/MetalSwatch";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";
import { TIERS } from "@/lib/rewards";
import { cn } from "@/lib/utils";


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
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const categoryTiles = [
  { label: "Rings", sub: "Engagement & stackable", q: "product_type:ring", image: catRingsAsset.url },
  { label: "Chains", sub: "Tennis & cuban links", q: "product_type:necklace", image: catChainsAsset.url },
  { label: "Bracelets", sub: "Tennis bracelets", q: "product_type:bracelet", image: catBraceletsAsset.url },
  { label: "Earrings", sub: "Studs & hoops", q: "product_type:earring", image: catEarringsAsset.url },
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
  tone = "white",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  products: ShopifyProduct[];
  isLoading: boolean;
  ctaQuery?: string;
  ctaLabel: string;
  tone?: "white" | "porcelain";
}) {
  if (!isLoading && products.length === 0) return null;

  return (
    <section className={cn("bg-card", tone === "porcelain" && "bg-background")}>
      <div className="mx-auto max-w-[1560px] px-6 py-14 sm:px-10 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.42em] text-[var(--gold)]">{eyebrow}</p>
            <h2 className="mt-4 font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          <Link
            to="/shop"
            search={ctaQuery ? { q: ctaQuery } : {}}
            className="group flex items-center gap-2.5 border-b border-foreground/25 pb-1.5 text-[10px] uppercase tracking-[0.3em] text-foreground transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
          >
            View all{" "}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border border-border bg-card">
                  <Skeleton className="aspect-[4/5] w-full" />
                  <div className="space-y-3 p-5">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            : products.slice(0, 4).map((p) => <ProductCard key={p.node.id} product={p} />)}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/shop"
            search={ctaQuery ? { q: ctaQuery } : {}}
            className="group flex items-center gap-2.5 bg-foreground px-10 py-4 text-[10px] uppercase tracking-[0.28em] text-background transition-opacity hover:opacity-85"
          >
            {ctaLabel}{" "}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/shop"
            className="border border-border px-10 py-4 text-[10px] uppercase tracking-[0.28em] text-foreground/75 transition-colors hover:border-foreground hover:text-foreground"
          >
            Shop all
          </Link>
        </div>
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
  const trending = allProducts.slice(-4);

  return (
    <div className="min-h-screen bg-card">
      <SiteHeader />

      <main id="main-content">
        {/* Hero — dark, premium, editorial */}
        <section
          aria-labelledby="hero-heading"
          className="relative isolate overflow-hidden bg-[oklch(0.14_0.004_60)] text-[oklch(0.99_0.002_90)]"
        >
          {/* Editorial jewelry backdrop */}
          <img
            src={heroAsset.url}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, oklch(0.14 0.004 60 / 0.82), oklch(0.14 0.004 60 / 0.72) 45%, oklch(0.14 0.004 60 / 0.9))",
            }}
          />
          {/* Subtle metallic gradient sheen */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% -20%, oklch(0.72 0.085 84 / 0.25), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, oklch(0.72 0.006 250 / 0.15), transparent)",
            }}
          />

          <div className="relative mx-auto max-w-[1560px] px-6 py-16 sm:px-10 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <header className="mb-8 inline-flex flex-col items-center gap-3">
                <span className="text-[10px] uppercase tracking-[0.36em] text-[oklch(0.72_0.085_84)]">
                  Qureshi Jewelers
                </span>
                <div className="h-px w-14 bg-[oklch(0.72_0.085_84)]/60" />
              </header>


              <h1
                id="hero-heading"
                className="font-display text-[2.8rem] leading-[1.02] text-[oklch(1_0_0)] sm:text-6xl lg:text-[4.8rem]"
              >
                Pure Elegance
                <br />
                <span className="italic font-normal text-[oklch(0.99_0.002_90)]/90">Redefined</span>
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-sm leading-[1.9] text-[oklch(0.99_0.002_90)]/70 sm:text-base">
                Masterfully crafted with{" "}
                <span className="font-medium text-[oklch(1_0_0)]">
                  18K Gold over S925 Sterling Silver
                </span>
                . GRA-certified VVS1 D-colour moissanite, hand-set and inspected before it ships.
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/shop"
                  className="group flex min-h-11 items-center gap-3 bg-[oklch(1_0_0)] px-8 py-4 text-[10px] uppercase tracking-[0.24em] text-[oklch(0.14_0.004_60)] transition-colors hover:bg-[oklch(0.99_0.002_90)]"
                >
                  Discover the collection{" "}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/craftsmanship"
                  className="flex min-h-11 items-center border border-[oklch(1_0_0_/_0.22)] px-8 py-4 text-[10px] uppercase tracking-[0.24em] text-[oklch(0.99_0.002_90)]/90 transition-colors hover:border-[oklch(1_0_0)] hover:text-[oklch(1_0_0)]"
                >
                  Our craftsmanship
                </Link>
              </div>

              <p className="mt-6 text-[9px] uppercase tracking-[0.24em] text-[oklch(0.99_0.002_90)]/75">
                Complimentary express shipping on U.S. orders over $100
              </p>
            </div>
          </div>

          {/* Bottom gradient fade into the next section */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-[oklch(1_0_0_/_0.12)]" />
        </section>

        {/* Marquee assurance strip */}
        <section aria-label="Service promises" className="border-b border-border bg-card">
          <div className="mx-auto grid max-w-[1560px] grid-cols-2 gap-px bg-border px-0 sm:grid-cols-4">
            {[
              { icon: BadgeCheck, label: "GRA certified stones" },
              { icon: Truck, label: "Free insured shipping" },
              { icon: ShieldCheck, label: "Lifetime warranty" },
              { icon: Sparkles, label: "Points on every order" },
            ].map((t) => (
              <div
                key={t.label}
                className="flex items-center justify-center gap-2.5 bg-card px-4 py-4 text-center"
              >
                <t.icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[var(--gold)]" />
                <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                  {t.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Shop by category — high in the funnel */}
        <section className="bg-card">
          <div className="mx-auto max-w-[1560px] px-6 py-14 sm:px-10 lg:py-16">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.42em] text-[var(--gold)]">Browse</p>
                <h2 className="mt-3 font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
                  Shop by Category
                </h2>
              </div>
              <Link
                to="/shop"
                className="group flex items-center gap-2.5 border-b border-foreground/25 pb-1.5 text-[10px] uppercase tracking-[0.3em] transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]"
              >
                View all{" "}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {categoryTiles.map((c) => {
                return (
                  <Link
                    key={c.label}
                    to="/shop"
                    search={{ q: c.q }}
                    className="group relative aspect-[4/5] overflow-hidden border border-border bg-card"
                  >
                    <img
                      src={c.image}
                      alt={`${c.label} — moissanite ${c.sub.toLowerCase()}`}
                      loading="lazy"
                      width={896}
                      height={1120}
                      className="absolute inset-0 h-full w-full scale-[0.92] object-contain transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[0.99]"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,var(--card)_38%,transparent)]" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <p className="font-display text-3xl text-foreground">{c.label}</p>
                      <p className="mt-1 text-[9px] uppercase tracking-[0.26em] text-muted-foreground">
                        {c.sub}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.26em] text-[var(--gold)] transition-transform duration-500 group-hover:translate-x-1">
                        Shop now <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Rewards / gamification band */}
        <section className="border-y border-border bg-background">
          <div className="mx-auto grid max-w-[1560px] gap-px bg-border px-0 lg:grid-cols-[1.1fr_1.4fr]">
            <div className="bg-card p-8 sm:p-10">
              <div className="flex items-center gap-3">
                <Crown aria-hidden="true" className="h-4 w-4 text-[var(--gold)]" />
                <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                  The Qureshi Circle
                </p>
              </div>
              <h2 className="mt-5 font-display text-4xl leading-[1.05] sm:text-5xl">
                Earn points, <span className="italic">unlock metal tiers</span>
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                1 point per $1, bonus points for milestones, and 20 points equals $1 of store credit.
                Free to join — members start with 100 points.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/account"
                  className="min-h-11 bg-foreground px-8 py-4 text-[10px] uppercase tracking-[0.26em] text-background transition-opacity hover:opacity-85"
                >
                  Join free · +100 pts
                </Link>
                <Link
                  to="/rewards"
                  className="min-h-11 border border-border px-8 py-4 text-[10px] uppercase tracking-[0.26em] text-foreground/75 transition-colors hover:border-foreground hover:text-foreground"
                >
                  How it works
                </Link>
              </div>
            </div>

            <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
              {TIERS.map((t) => (
                <div key={t.key} className="flex flex-col bg-card p-6">
                  <MetalSwatch value={t.swatch} size="md" />
                  <p className="mt-5 font-display text-xl leading-tight">{t.name}</p>
                  <p className="mt-1.5 text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                    {t.threshold}+ pts · {t.multiplier}×
                  </p>
                  <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                    {t.perks[1] ?? t.perks[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>


        <ProductRow
          eyebrow="Curated Collection"
          title="Engagement Rings"
          subtitle="Solitaires, halos and stackable bands, hand-set in every finish and available in full and half sizes."
          products={ringProducts}
          isLoading={rings.isLoading && all.isLoading}
          ctaQuery="product_type:ring"
          ctaLabel="Shop engagement rings"
        />

        <ProductRow
          eyebrow="Everyday Brilliance"
          title="Necklaces & Chains"
          subtitle="Tennis chains, cuban links and pendant necklaces finished in 18K gold, white gold and rose gold."
          products={chainProducts}
          isLoading={chains.isLoading && all.isLoading}
          ctaQuery="product_type:necklace"
          ctaLabel="Shop necklaces"
          tone="porcelain"
        />

        {/* Why choose */}
        <section className="border-y border-border bg-foreground py-14 text-background lg:py-20">
          <div className="mx-auto max-w-[1560px] px-6 sm:px-10">
            <div className="max-w-2xl">
              <p className="text-[10px] uppercase tracking-[0.42em] text-[var(--gold)]">
                The Difference
              </p>
              <h2 className="mt-4 font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
                Why Choose Qureshi Jewelers?
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-background/60">
                Every stone independently graded, every setting finished by hand, every order
                insured door to door.
              </p>
            </div>

            <div className="mt-10 grid gap-px bg-background/15 md:grid-cols-3">
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
                <div key={c.title} className="bg-foreground p-8">
                  <c.icon className="h-5 w-5 text-[var(--gold)]" />
                  <h3 className="mt-6 font-display text-2xl">{c.title}</h3>
                  <p className="mt-4 text-xs leading-relaxed text-background/60">{c.copy}</p>
                </div>
              ))}
            </div>

            <div className="mt-px grid gap-px bg-background/15 sm:grid-cols-3">
              {[
                { stat: "100%", label: "GRA certified stones" },
                { stat: "24/7", label: "Client care" },
                { stat: "5×", label: "18K gold plating layers" },
              ].map((s) => (
                <div key={s.stat} className="bg-foreground p-8">
                  <p className="font-display text-4xl text-[var(--gold)]">{s.stat}</p>
                  <p className="mt-2 text-[9px] uppercase tracking-[0.26em] text-background/60">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ProductRow
          eyebrow="Just In"
          title="Latest & Trending"
          subtitle="The pieces moving fastest this month, restocked weekly."
          products={trending}
          isLoading={all.isLoading}
          ctaLabel="Shop new arrivals"
        />

        {/* Sustainability panel */}
        <section className="bg-background py-14 lg:py-20">
          <div className="mx-auto max-w-4xl px-6 text-center sm:px-10">
            <span className="inline-flex items-center gap-2 border border-border bg-card px-5 py-2 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
              <Leaf className="h-3 w-3 text-[var(--gold)]" /> Sustainably created
            </span>
            <h2 className="mt-8 font-display text-4xl leading-[1.05] sm:text-6xl">
              Brilliance that never costs <span className="italic">the earth.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Lab-created moissanite delivers more fire and brilliance than diamond, with none of
              the mining impact — and it is independently verified, not just claimed.
            </p>

            <div className="mt-9 grid gap-px border border-border bg-border sm:grid-cols-3">
              {[
                { stat: "0", label: "Carats mined" },
                { stat: "100%", label: "Lab created" },
                { stat: "~97%", label: "Lower footprint" },
              ].map((s) => (
                <div key={s.label} className="bg-card p-6 text-left">
                  <p className="font-display text-4xl">{s.stat}</p>
                  <p className="mt-2 text-[9px] uppercase tracking-[0.24em] text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-px grid gap-px border border-border bg-border text-left sm:grid-cols-3">
              {[
                { k: "Certification", v: "GRA · D Colourless" },
                { k: "Clarity", v: "VVS1 · Eye clean" },
                { k: "Refractive index", v: "2.65–2.69 vs diamond 2.42" },
              ].map((r) => (
                <div key={r.k} className="bg-card p-6">
                  <p className="text-[8px] uppercase tracking-[0.26em] text-muted-foreground">
                    {r.k}
                  </p>
                  <p className="mt-2 text-xs text-foreground/85">{r.v}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing conversion band */}
        <section className="relative overflow-hidden bg-foreground py-16 text-background lg:py-20">
          <div className="mx-auto grid max-w-[1560px] items-center gap-10 px-6 sm:px-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.42em] text-[var(--gold)]">
                Start earning today
              </p>
              <h2 className="mt-4 font-display text-4xl leading-[1.03] sm:text-5xl lg:text-6xl">
                Every piece you buy <span className="italic">pays you back.</span>
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-relaxed text-background/70">
                Join the Qureshi Circle free, collect 100 points instantly and earn on every order —
                redeemable as store credit on your next piece.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/account"
                  className="group flex min-h-11 items-center gap-3 bg-background px-9 py-4 text-[10px] uppercase tracking-[0.26em] text-foreground transition-opacity hover:opacity-85"
                >
                  Join the Circle{" "}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/shop"
                  className="flex min-h-11 items-center border border-background/30 px-9 py-4 text-[10px] uppercase tracking-[0.26em] text-background/85 transition-colors hover:border-background"
                >
                  Shop the collection
                </Link>
              </div>
            </div>

            <ul className="grid gap-px bg-background/15 sm:grid-cols-2">
              {[
                { icon: BadgeCheck, title: "GRA Certified", copy: "Certificate with every order" },
                { icon: Sparkles, title: "VVS1 · D Colour", copy: "Eye-clean, maximum fire" },
                { icon: Truck, title: "Free U.S. Shipping", copy: "On every order over $100" },
                { icon: ShieldCheck, title: "Lifetime Warranty", copy: "Craftsmanship guaranteed" },
              ].map((t) => (
                <li key={t.title} className="bg-foreground p-6">
                  <t.icon aria-hidden="true" className="h-5 w-5 text-[var(--gold)]" />
                  <p className="mt-4 text-[10px] uppercase tracking-[0.24em] text-background">
                    {t.title}
                  </p>
                  <p className="mt-1.5 text-[11px] text-background/60">{t.copy}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
