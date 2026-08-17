import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { Loader2, ShieldCheck, Truck, Gem, RotateCcw, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { VariantSelector } from "@/components/VariantSelector";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProductByHandle, fetchProducts, formatMoney, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { cn } from "@/lib/utils";

type Variant = ShopifyProduct["node"]["variants"]["edges"][number]["node"];

export const Route = createFileRoute("/product/$handle")({
  head: ({ params }) => {
    const name = params.handle.replace(/-/g, " ");
    return {
      meta: [
        { title: `${name} | Qureshi Jewelers` },
        {
          name: "description",
          content: `Discover ${name} — hand-finished moissanite jewelry in 18K gold, silver and rose gold plating over S925 sterling silver, GRA certified and shipped worldwide.`,
        },
        { property: "og:title", content: `${name} | Qureshi Jewelers` },
        {
          property: "og:description",
          content: "Hand-finished moissanite jewelry, GRA certified and shipped worldwide.",
        },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductDetail,
});

const assurances = [
  { icon: Gem, text: "GRA-certified moissanite, hand-set by our bench jewelers" },
  { icon: Truck, text: "Complimentary insured worldwide shipping" },
  { icon: RotateCcw, text: "30-day returns, no questions asked" },
  { icon: ShieldCheck, text: "Lifetime craftsmanship warranty" },
];

function ProductDetail() {
  const { handle } = Route.useParams();
  const addItem = useCartStore((s) => s.addItem);
  const isCartLoading = useCartStore((s) => s.isLoading);

  const [activeImage, setActiveImage] = useState(0);
  const [variant, setVariant] = useState<Variant | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);

  const onVariantChange = useCallback((v: Variant | undefined) => setVariant(v), []);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", handle],
    queryFn: () => fetchProductByHandle(handle),
  });

  const { data: related } = useQuery({
    queryKey: ["products", "related"],
    queryFn: () => fetchProducts(8),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto grid max-w-7xl gap-14 px-6 py-16 lg:grid-cols-2">
          <Skeleton className="aspect-[4/5] w-full" />
          <div className="space-y-5">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-40 w-full" />
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-6 py-32 text-center">
          <p className="eyebrow">Not found</p>
          <h1 className="mt-4 font-display text-4xl">This piece is no longer available</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            It may have been retired from the atelier. Explore the current collection instead.
          </p>
          <Button asChild variant="gold" className="mt-8">
            <Link to="/shop">View the collection</Link>
          </Button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const node = product.node;
  const images = node.images.edges;
  const price = variant?.price ?? node.priceRange.minVariantPrice;
  const soldOut = variant ? !variant.availableForSale : false;

  const handleAddToCart = async () => {
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("Added to your selection", {
      description: `${node.title} · ${variant.title}`,
      position: "top-center",
    });
  };

  const relatedProducts = (related ?? []).filter((p) => p.node.handle !== handle).slice(0, 4);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-10">
        <nav className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <span className="px-2 text-[var(--gold)]">/</span>
          <Link to="/shop" className="transition-colors hover:text-foreground">
            Collection
          </Link>
          {node.productType && (
            <>
              <span className="px-2 text-[var(--gold)]">/</span>
              <span className="text-foreground/70">{node.productType}</span>
            </>
          )}
        </nav>

        <div className="mt-8 grid gap-14 lg:grid-cols-[1.1fr_1fr]">
          {/* Gallery */}
          <div className="flex gap-4">
            {images.length > 1 && (
              <div className="hidden w-20 shrink-0 flex-col gap-3 sm:flex">
                {images.map((img, i) => (
                  <button
                    key={img.node.url}
                    onMouseEnter={() => setActiveImage(i)}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "aspect-square overflow-hidden rounded-sm border transition-all duration-300",
                      i === activeImage
                        ? "border-foreground/70"
                        : "border-border opacity-70 hover:opacity-100",
                    )}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img
                      src={img.node.url}
                      alt={img.node.altText ?? node.title}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-secondary">
                {images[activeImage]?.node && (
                  <img
                    src={images[activeImage]!.node.url}
                    alt={images[activeImage]!.node.altText ?? node.title}
                    className="h-full w-full object-cover"
                  />
                )}
                <span className="glass absolute left-4 top-4 rounded-full px-3 py-1 text-[9px] uppercase tracking-[0.24em] text-foreground/80">
                  GRA Certified
                </span>
              </div>
              {images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto sm:hidden">
                  {images.map((img, i) => (
                    <button
                      key={img.node.url}
                      onClick={() => setActiveImage(i)}
                      className={cn(
                        "h-16 w-14 shrink-0 overflow-hidden rounded-sm border",
                        i === activeImage ? "border-foreground" : "border-border",
                      )}
                      aria-label={`View image ${i + 1}`}
                    >
                      <img
                        src={img.node.url}
                        alt={img.node.altText ?? node.title}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Buy panel */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <div className="glass-panel rounded-lg p-8">
              {node.vendor && <p className="eyebrow">{node.vendor}</p>}
              <h1 className="mt-3 font-display text-4xl leading-tight">{node.title}</h1>
              <div className="mt-4 flex items-center gap-4">
                <p className="text-2xl tracking-wide">
                  {formatMoney(price.amount, price.currencyCode)}
                </p>
                <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Tax included
                </span>
              </div>

              <div className="my-7 gold-rule" />

              <VariantSelector product={product} onVariantChange={onVariantChange} />

              <div className="mt-8 flex items-center gap-4">
                <div className="flex h-12 items-center rounded-full border border-border bg-[var(--glass-bg)] backdrop-blur">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    className="grid h-12 w-11 place-items-center text-foreground/70 transition-colors hover:text-foreground"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm">{quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    className="grid h-12 w-11 place-items-center text-foreground/70 transition-colors hover:text-foreground"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <Button
                  variant="gold"
                  size="lg"
                  className="h-12 flex-1 rounded-full"
                  onClick={handleAddToCart}
                  disabled={isCartLoading || !variant || soldOut}
                >
                  {isCartLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : soldOut ? (
                    "Sold out"
                  ) : (
                    "Add to bag"
                  )}
                </Button>
              </div>

              <ul className="mt-8 grid gap-3 border-t border-border pt-7 text-xs text-muted-foreground">
                {assurances.map((a) => (
                  <li key={a.text} className="flex items-center gap-3">
                    <a.icon className="h-3.5 w-3.5 text-[var(--gold)]" />
                    {a.text}
                  </li>
                ))}
              </ul>
            </div>

            {node.description && (
              <details open className="group mt-4 rounded-lg border border-border bg-card p-6">
                <summary className="cursor-pointer list-none text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Description
                </summary>
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground/75">
                  {node.description}
                </p>
              </details>
            )}

            <details className="mt-3 rounded-lg border border-border bg-card p-6">
              <summary className="cursor-pointer list-none text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Materials &amp; care
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-foreground/75">
                S925 sterling silver base finished in 18K gold, rhodium silver or rose gold plating.
                Store in the supplied pouch, keep away from perfume and chlorine, and polish with
                the enclosed cloth to maintain lustre.
              </p>
            </details>

            <details className="mt-3 rounded-lg border border-border bg-card p-6">
              <summary className="cursor-pointer list-none text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Shipping &amp; returns
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-foreground/75">
                Dispatched within 1–2 business days with insured tracked delivery worldwide. Returns
                accepted within 30 days in original condition and packaging.
              </p>
            </details>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-28">
            <p className="eyebrow">You may also love</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">Complete the look</h2>
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.node.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
