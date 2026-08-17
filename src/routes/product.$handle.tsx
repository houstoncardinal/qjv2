import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, ShieldCheck, Truck, Gem } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProductByHandle, fetchProducts, formatMoney } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$handle")({
  head: ({ params }) => {
    const name = params.handle.replace(/-/g, " ");
    return {
      meta: [
        { title: `${name} | Qureshi Jewelers` },
        {
          name: "description",
          content: `Discover ${name} — hand-finished moissanite jewelry in 18K gold plated sterling silver, GRA certified and shipped worldwide.`,
        },
        { property: "og:title", content: `${name} | Qureshi Jewelers` },
        {
          property: "og:description",
          content: `Hand-finished moissanite jewelry, GRA certified and shipped worldwide.`,
        },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { handle } = Route.useParams();
  const addItem = useCartStore((s) => s.addItem);
  const isCartLoading = useCartStore((s) => s.isLoading);

  const [activeImage, setActiveImage] = useState(0);
  const [variantId, setVariantId] = useState<string | null>(null);

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
        <main className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-2">
          <Skeleton className="aspect-[4/5] w-full" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-32 w-full" />
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
  const variants = node.variants.edges.map((v) => v.node);
  const selected = variants.find((v) => v.id === variantId) ?? variants[0];

  const handleAddToCart = async () => {
    if (!selected) return;
    await addItem({
      product,
      variantId: selected.id,
      variantTitle: selected.title,
      price: selected.price,
      quantity: 1,
      selectedOptions: selected.selectedOptions || [],
    });
    toast.success("Added to your selection", {
      description: node.title,
      position: "top-center",
    });
  };

  const relatedProducts = (related ?? []).filter((p) => p.node.handle !== handle).slice(0, 4);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-12">
        <nav className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-primary">
            Home
          </Link>
          <span className="px-2">/</span>
          <Link to="/shop" className="transition-colors hover:text-primary">
            Collection
          </Link>
        </nav>

        <div className="mt-10 grid gap-14 lg:grid-cols-2">
          <div>
            <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
              {images[activeImage]?.node && (
                <img
                  src={images[activeImage]!.node.url}
                  alt={images[activeImage]!.node.altText ?? node.title}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={img.node.url}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "h-20 w-16 shrink-0 overflow-hidden border transition-colors",
                      i === activeImage ? "border-primary" : "border-border hover:border-primary/50",
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

          <div className="lg:pt-4">
            {node.productType && <p className="eyebrow">{node.productType}</p>}
            <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">{node.title}</h1>
            <p className="mt-4 text-xl text-primary">
              {selected
                ? formatMoney(selected.price.amount, selected.price.currencyCode)
                : formatMoney(
                    node.priceRange.minVariantPrice.amount,
                    node.priceRange.minVariantPrice.currencyCode,
                  )}
            </p>

            {variants.length > 1 && (
              <div className="mt-8">
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Select option
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVariantId(v.id)}
                      disabled={!v.availableForSale}
                      className={cn(
                        "border px-4 py-2 text-xs uppercase tracking-[0.16em] transition-colors",
                        selected?.id === v.id
                          ? "border-primary text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50",
                        !v.availableForSale && "cursor-not-allowed line-through opacity-40",
                      )}
                    >
                      {v.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="gold"
              size="lg"
              className="mt-8 w-full"
              onClick={handleAddToCart}
              disabled={isCartLoading || !selected || !selected.availableForSale}
            >
              {isCartLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : selected?.availableForSale ? (
                "Add to selection"
              ) : (
                "Sold out"
              )}
            </Button>

            {node.description && (
              <p className="mt-8 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {node.description}
              </p>
            )}

            <ul className="mt-10 space-y-4 border-t border-border pt-8 text-sm text-muted-foreground">
              <li className="flex items-center gap-3">
                <Gem className="h-4 w-4 text-primary" /> GRA-certified moissanite, hand-set by our
                artisans
              </li>
              <li className="flex items-center gap-3">
                <Truck className="h-4 w-4 text-primary" /> Complimentary insured worldwide shipping
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-primary" /> Lifetime warranty and 30-day
                returns
              </li>
            </ul>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-28">
            <p className="eyebrow">You may also love</p>
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
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
