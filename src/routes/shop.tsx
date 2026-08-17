import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProducts } from "@/lib/shopify";
import { cn } from "@/lib/utils";

type ShopSearch = { q?: string | undefined };

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    q: typeof search["q"] === "string" && search["q"].length > 0 ? search["q"] : undefined,
  }),

  head: () => ({
    meta: [
      { title: "The Collection | Qureshi Jewelers Moissanite Jewelry" },
      {
        name: "description",
        content:
          "Browse the full Qureshi Jewelers collection: moissanite rings, necklaces, earrings, bracelets and anklets in 18K gold plated sterling silver.",
      },
      { property: "og:title", content: "The Collection | Qureshi Jewelers" },
      {
        property: "og:description",
        content: "GRA-certified moissanite rings, necklaces, earrings and bracelets.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Shop,
});

const filters = [
  { label: "All", query: undefined },
  { label: "Rings", query: "product_type:ring" },
  { label: "Necklaces", query: "product_type:necklace OR product_type:pendant" },
  { label: "Earrings", query: "product_type:earring" },
  { label: "Bracelets", query: "product_type:bracelet" },
];

function Shop() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", q ?? "all"],
    queryFn: () => fetchProducts(100, q),
  });

  const products = data ?? [];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-16">
        <p className="eyebrow">The Collection</p>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">Every piece, certified</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Moissanite graded D colour and VVS1 clarity, hand-set in 18K gold plating over S925
          sterling silver.
        </p>

        <div className="mt-10 flex flex-wrap gap-2">
          {filters.map((f) => {
            const active = (f.query ?? undefined) === q;
            return (
              <button
                key={f.label}
                onClick={() => navigate({ search: { q: f.query } })}
                className={cn(
                  "border px-5 py-2 text-[10px] uppercase tracking-[0.25em] transition-colors",
                  active
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 hairline" />

        <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[4/5] w-full" />
                <Skeleton className="mt-5 h-4 w-3/4" />
              </div>
            ))}
          {!isLoading && products.map((p) => <ProductCard key={p.node.id} product={p} />)}
        </div>

        {!isLoading && products.length === 0 && (
          <p className="py-24 text-center text-muted-foreground">
            {isError ? "Unable to load products right now." : "No products found."}
          </p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
