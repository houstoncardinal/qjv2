import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Check,
  Crown,
  Gem,
  Heart,
  Leaf,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { MetalSwatch } from "@/components/MetalSwatch";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";
import { TIERS } from "@/lib/rewards";
import { BUNDLE_SLOTS } from "@/lib/bundle";
import { RETURN_WINDOW_DAYS, SITE_URL } from "@/lib/site";
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
      { property: "og:url", content: SITE_URL },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
  component: Home,
});

const CATEGORY_INFO = [
  { label: "Rings", sub: "Engagement & stackable", q: "product_type:ring" },
  { label: "Chains", sub: "Tennis & cuban links", q: "product_type:necklace", imageIndex: 2 },
  { label: "Bracelets", sub: "Tennis bracelets", q: "product_type:bracelet" },
  { label: "Earrings", sub: "Studs & hoops", q: "product_type:earring" },
] as const;

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

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  return reduced;
}

function Home() {
  const showHeroVideo = !usePrefersReducedMotion();
  const all = useShopifyProducts("home-all", undefined, 24);
  const rings = useShopifyProducts("home-rings", "product_type:ring", 12);
  const chains = useShopifyProducts("home-chains", "product_type:necklace", 12);
  const bracelets = useShopifyProducts("home-bracelets", "product_type:bracelet", 12);
  const earrings = useShopifyProducts("home-earrings", "product_type:earring", 12);

  const allProducts = all.data ?? [];
  const ringProducts = rings.data?.length ? rings.data : allProducts;
  const chainProducts = chains.data?.length ? chains.data : allProducts.slice(6);
  const trending = allProducts.slice(-4);

  const categoryQueries = [rings, chains, bracelets, earrings] as const;
  const categoryTiles = CATEGORY_INFO.map((info, i) => {
    const products = categoryQueries[i]?.data;
    const idx = "imageIndex" in info ? info.imageIndex : 0;
    const product = products?.[idx] ?? products?.[0];
    return { ...info, image: product?.node.images.edges[0]?.node.url };
  });

  return (
    <div className="min-h-screen bg-card">
      <SiteHeader />

      <main id="main-content">
        {/* Hero — light, editorial, full-bleed photography */}
        <section
          aria-labelledby="hero-heading"
          className="relative isolate flex min-h-[40vh] items-center overflow-hidden bg-background lg:min-h-[44vh]"
        >
          {/* Full-width banner photography */}
          <div aria-hidden="true" className="absolute inset-0">
            {/* Mobile & tablet: static banner — mostly veiled anyway, no reason to ship video weight */}
            <img
              src="/hero-banner.jpg"
              alt=""
              loading="eager"
              fetchPriority="high"
              className="h-full w-full object-cover object-[62%_38%] lg:hidden"
            />
            {/* Desktop: looping ambient footage, falls back to the static banner if the OS prefers reduced motion */}
            {showHeroVideo ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster="/hero-banner.jpg"
                className="hidden h-full w-full object-cover object-[65%_58%] lg:block"
              >
                <source src="/herobg.mp4" type="video/mp4" />
              </video>
            ) : (
              <img
                src="/hero-banner.jpg"
                alt=""
                loading="eager"
                fetchPriority="high"
                className="hidden h-full w-full object-cover object-[68%_42%] lg:block"
              />
            )}
            {/* Editorial light veil — opaque behind the copy, sheer over the photography */}
            <div
              className="absolute inset-0 hidden lg:block"
              style={{
                background:
                  "linear-gradient(102deg, var(--background) 0%, var(--background) 32%, oklch(0.985 0.002 90 / 0.93) 42%, oklch(0.985 0.002 90 / 0.6) 54%, oklch(0.985 0.002 90 / 0.18) 68%, oklch(0.985 0.002 90 / 0) 82%)",
              }}
            />
            <div
              className="absolute inset-0 lg:hidden"
              style={{
                background:
                  "linear-gradient(185deg, var(--background) 0%, var(--background) 38%, oklch(0.985 0.002 90 / 0.93) 52%, oklch(0.985 0.002 90 / 0.93) 100%)",
              }}
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
          </div>

          <div className="relative mx-auto w-full max-w-[1560px] px-5 py-12 sm:px-10 sm:py-14 lg:py-16">
            <div className="max-w-xl">
              <div className="mb-4 flex min-w-0 items-center gap-3">
                <span className="text-[10px] uppercase tracking-[0.32em] text-[var(--gold)] sm:tracking-[0.38em]">
                  Qureshi Jewelers
                </span>
                <div className="h-px w-10 shrink-0 bg-[var(--gold)]/70 sm:w-16" />
              </div>

              <h1
                id="hero-heading"
                className="font-display text-[clamp(2rem,9vw,2.6rem)] leading-[1.1] text-balance hyphens-none text-foreground sm:text-[2.75rem] lg:text-[3.4rem]"
              >
                <span className="block">Moissanite fine jewelry</span>
                <span className="block italic font-normal text-foreground/85">in 18K gold.</span>
              </h1>

              <p className="mt-4 max-w-md text-pretty text-[0.9375rem] leading-[1.7] text-muted-foreground sm:text-base">
                Engagement rings, tennis chains, bracelets and earrings — hand-set with{" "}
                <span className="font-medium text-foreground">GRA-certified VVS1 moissanite</span>{" "}
                over solid sterling silver, inspected before it ships.
              </p>

              <div className="mt-7 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
                <Link
                  to="/shop"
                  className="group flex min-h-12 items-center justify-center gap-3 bg-foreground px-6 py-3.5 text-center text-[10px] uppercase tracking-[0.22em] text-background transition-opacity hover:opacity-85 sm:px-8 sm:tracking-[0.24em]"
                >
                  Discover the collection{" "}
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/craftsmanship"
                  className="flex min-h-12 items-center justify-center border border-foreground/25 bg-background/70 px-6 py-3.5 text-center text-[10px] uppercase tracking-[0.22em] text-foreground backdrop-blur-sm transition-colors hover:border-foreground sm:px-8 sm:tracking-[0.24em] lg:bg-transparent lg:backdrop-blur-none"
                >
                  Our craftsmanship
                </Link>
              </div>

              <p className="mt-5 text-[9px] uppercase tracking-[0.24em] text-muted-foreground">
                Complimentary express shipping on U.S. orders over $100
              </p>
            </div>
          </div>

          {/* Bottom hairline into the next section */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-border" />
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
                    {c.image ? (
                      <img
                        src={c.image}
                        alt={`${c.label} — moissanite ${c.sub.toLowerCase()}`}
                        loading="lazy"
                        width={896}
                        height={1120}
                        className="absolute inset-0 h-full w-full scale-[0.92] object-contain transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[0.99]"
                      />
                    ) : (
                      <Skeleton className="absolute inset-0 h-full w-full" />
                    )}
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

        {/* Build Your Own Bundle promo — gamified merchandising */}
        <section className="border-y border-border bg-foreground py-14 text-background lg:py-20">
          <div className="mx-auto max-w-[1560px] px-6 sm:px-10">
            <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
              <div>
                <p className="text-[10px] uppercase tracking-[0.42em] text-[var(--gold)]">
                  Curate Your Own
                </p>
                <h2 className="mt-4 font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
                  Build Your Own <span className="italic">Bundle</span>
                </h2>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-background/65">
                  Choose one ring, one necklace or chain, one bracelet and one pair of earrings —
                  10% comes off automatically the moment your set is complete. No code needed.
                </p>
                <Link
                  to="/bundle"
                  className="group mt-8 inline-flex items-center gap-3 bg-[var(--gold)] px-9 py-4 text-[10px] uppercase tracking-[0.26em] text-[oklch(0.18_0.01_60)] transition-opacity hover:opacity-90"
                >
                  Start building{" "}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-px bg-background/15 sm:grid-cols-4">
                {BUNDLE_SLOTS.map((slot, i) => (
                  <div
                    key={slot.key}
                    className="flex flex-col items-center gap-3 bg-foreground px-4 py-8 text-center"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-background/25 text-[11px] text-background/70">
                      {i + 1}
                    </span>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-background/80">
                      {slot.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Rewards / gamification band */}
        <section className="border-y border-border bg-background">
          <div className="mx-auto grid max-w-[1560px] gap-px bg-border px-0 lg:grid-cols-[1.25fr_1.5fr] lg:items-stretch">
            <div className="flex flex-col justify-center bg-card p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <Crown aria-hidden="true" className="h-4 w-4 text-[var(--gold)]" />
                <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                  The Qureshi Circle
                </p>
              </div>
              <h2 className="mt-2.5 font-display text-3xl leading-[1.05] sm:text-4xl">
                Earn points, <span className="italic">unlock metal tiers</span>
              </h2>
              <p className="mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                1 point per $1, bonus points for milestones, and 20 points equals $1 of store
                credit. Free to join — members start with 100 points.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/account"
                  className="min-h-10 bg-foreground px-8 py-3 text-[10px] uppercase tracking-[0.26em] text-background transition-opacity hover:opacity-85"
                >
                  Join free · +100 pts
                </Link>
                <Link
                  to="/rewards"
                  className="min-h-10 border border-border px-8 py-3 text-[10px] uppercase tracking-[0.26em] text-foreground/75 transition-colors hover:border-foreground hover:text-foreground"
                >
                  How it works
                </Link>
              </div>
            </div>

            <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
              {TIERS.map((t) => (
                <div key={t.key} className="flex flex-col bg-card p-5">
                  <div className="flex items-center gap-2.5">
                    <MetalSwatch value={t.swatch} size="sm" />
                    <p className="font-display text-lg leading-tight">{t.name}</p>
                  </div>
                  <p className="mt-1.5 text-[9px] uppercase tracking-[0.22em] text-[var(--gold)]">
                    {t.threshold}+ pts · {t.multiplier}× points
                  </p>
                  <ul className="mt-2.5 space-y-1">
                    {t.perks.map((perk) => (
                      <li
                        key={perk}
                        className="flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground"
                      >
                        <Check
                          aria-hidden="true"
                          className="mt-[3px] h-3 w-3 shrink-0 text-[var(--gold)]"
                        />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
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
                  copy: `Free resizing within 60 days, ${RETURN_WINDOW_DAYS}-day returns and a support team that answers in hours, not weeks.`,
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
