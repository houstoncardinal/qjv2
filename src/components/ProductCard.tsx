import { Link } from "@tanstack/react-router";
import { Loader2, Star } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney, type ShopifyProduct } from "@/lib/shopify";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function metalDots(product: ShopifyProduct) {
  const option = product.node.options?.find((o) => /colou?r|metal|plating|tone/i.test(o.name));
  if (!option) return [];
  return option.values
    .map((v) => {
      const s = v.toLowerCase();
      if (/rose|pink/.test(s)) return "swatch-rose";
      if (/gold|champagne/.test(s) && !/white/.test(s)) return "swatch-gold";
      if (/silver|white|platinum|rhodium|steel/.test(s)) return "swatch-silver";
      if (/black|onyx/.test(s)) return "swatch-ink";
      return null;
    })
    .filter(Boolean)
    .slice(0, 4) as string[];
}

export function ProductCard({
  product,
  compact = false,
}: {
  product: ShopifyProduct;
  compact?: boolean;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const node = product.node;
  const image = node.images.edges[0]?.node;
  const hoverImage = node.images.edges[1]?.node;
  const variant =
    node.variants.edges.find((v) => v.node.availableForSale)?.node ?? node.variants.edges[0]?.node;
  const price = node.priceRange.minVariantPrice;
  const dots = metalDots(product);
  const bestSeller = (node.tags ?? []).some((t) => /best|trending|featured/i.test(t));

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("Added to bag", { description: node.title, position: "top-center" });
  };

  return (
    <article className="group h-full">
      <Link
        to="/product/$handle"
        params={{ handle: node.handle }}
        className="flex h-full flex-col border border-border bg-card transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]"
      >
        <div className="relative aspect-square overflow-hidden bg-secondary/60">
          {image && (
            <img
              src={image.url}
              alt={image.altText ?? node.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
            />
          )}
          {hoverImage && (
            <img
              src={hoverImage.url}
              alt={hoverImage.altText ?? node.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          )}

          {bestSeller && (
            <span className="absolute left-2.5 top-2.5 bg-foreground px-2.5 py-1 text-[7px] uppercase tracking-[0.2em] text-background">
              Best Seller
            </span>
          )}

          {dots.length > 0 && (
            <div className="absolute bottom-2.5 left-2.5 flex gap-1">
              {dots.map((d, i) => (
                <span
                  key={d + i}
                  className={`h-3 w-3 rounded-full ring-1 ring-background/70 ${d}`}
                  aria-hidden
                />
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isLoading || !variant}
            className="glass-strong absolute inset-x-2.5 bottom-2.5 translate-y-2 py-2.5 text-[9px] uppercase tracking-[0.22em] text-foreground opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100"
          >
            {isLoading ? (
              <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" />
            ) : (
              "Quick add"
            )}
          </button>
        </div>

        <div className={cn("flex flex-1 flex-col p-3.5", compact && "p-3")}>
          <div className="flex items-center gap-0.5 text-[var(--gold)]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-2.5 w-2.5 fill-current" />
            ))}
          </div>
          <h3
            className={cn(
              "mt-2 line-clamp-2 text-[11px] leading-snug tracking-wide text-foreground/85 transition-colors group-hover:text-[var(--gold)]",
              compact && "text-[10px]",
            )}
          >
            {node.title}
          </h3>
          <p className="mt-auto pt-3 text-xs tracking-wide text-foreground">
            <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              From{" "}
            </span>
            {formatMoney(price.amount, price.currencyCode)}
          </p>
        </div>
      </Link>
    </article>
  );
}
