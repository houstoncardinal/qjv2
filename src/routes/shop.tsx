import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { JsonLd } from "@/components/JsonLd";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";
import { SITE_URL, breadcrumbLd } from "@/lib/site";
import { cn } from "@/lib/utils";

type ShopSearch = { q?: string | undefined };

const filters = [
  { label: "All", query: undefined },
  { label: "Rings", query: "product_type:ring" },
  { label: "Necklaces", query: "product_type:necklace OR product_type:pendant" },
  { label: "Earrings", query: "product_type:earring" },
  { label: "Bracelets", query: "product_type:bracelet" },
];

/** e.g. "product_type:ring" -> "Moissanite Rings | Qureshi Jewelers" for keyword-relevant, filter-aware meta. */
function metaForQuery(q: string | undefined) {
  const filter = filters.find((f) => f.query === q);
  const category = filter && filter.label !== "All" ? filter.label : null;

  if (!category) {
    return {
      title: "The Collection | Qureshi Jewelers Moissanite Jewelry",
      description:
        "Browse the full Qureshi Jewelers collection: moissanite rings, necklaces, earrings, bracelets and anklets in 18K gold plated sterling silver.",
    };
  }

  return {
    title: `Moissanite ${category} | Qureshi Jewelers`,
    description: `Shop moissanite ${category.toLowerCase()} — GRA-certified VVS1 D colour stones hand-set in 18K gold, white gold and rose gold plated S925 sterling silver.`,
  };
}

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    q: typeof search["q"] === "string" && search["q"].length > 0 ? search["q"] : undefined,
  }),

  head: (ctx) => {
    const { title, description } = metaForQuery(ctx.match.search.q);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { property: "og:url", content: `${SITE_URL}/shop` },
      ],
      // Canonical stays pinned to the base /shop URL regardless of filter, so filtered views
      // earn their own relevant title/description without splitting ranking signal across
      // query-string permutations of the same underlying page.
      links: [{ rel: "canonical", href: `${SITE_URL}/shop` }],
    };
  },
  component: Shop,
});

function itemListLd(products: ShopifyProduct[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/product/${p.node.handle}`,
      name: p.node.title,
      image: p.node.images.edges[0]?.node.url,
    })),
  };
}

function Shop() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", q ?? "all"],
    queryFn: () => fetchProducts(100, q),
  });

  const products = data ?? [];
  const activeFilter = filters.find((f) => f.query === q);
  const activeCategory = activeFilter && activeFilter.label !== "All" ? activeFilter.label : null;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="main-content" className="mx-auto max-w-7xl px-6 pb-16 pt-10">
        <p className="eyebrow">{activeCategory ? "Shop" : "The Collection"}</p>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">
          {activeCategory ? `Moissanite ${activeCategory}` : "Every piece, certified"}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Moissanite graded D colour and VVS1 clarity, hand-set in 18K gold, rhodium silver and rose
          gold plating over S925 sterling silver.
        </p>

        <div className="mt-7 flex flex-wrap gap-2">
          {filters.map((f) => {
            const active = (f.query ?? undefined) === q;
            return (
              <button
                key={f.label}
                onClick={() => navigate({ search: { q: f.query } })}
                className={cn(
                  "rounded-full border px-6 py-2.5 text-[10px] uppercase tracking-[0.28em] transition-all duration-300",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-[var(--glass-bg)] text-muted-foreground backdrop-blur hover:border-foreground/40 hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 hairline" />


        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[4/5] w-full" />
                <Skeleton className="mt-5 h-4 w-3/4" />
              </div>
            ))}
          {!isLoading &&
            products.map((p, i) => <ProductCard key={p.node.id} product={p} eager={i < 4} />)}
        </div>

        {!isLoading && products.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">
            {isError ? "Unable to load products right now." : "No products found."}
          </p>
        )}
      </main>
      <SiteFooter />
      {products.length > 0 && <JsonLd data={itemListLd(products)} />}
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", url: "/" },
          { name: activeCategory ?? "Shop", url: "/shop" },
        ])}
      />
    </div>
  );
}
