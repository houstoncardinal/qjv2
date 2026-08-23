import { Link } from "@tanstack/react-router";
import { Loader2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney, isOnSale, type ShopifyProduct } from "@/lib/shopify";
import { MetalSwatchRow, isMetalOptionName } from "@/components/MetalSwatch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function metalOption(product: ShopifyProduct) {
  return product.node.options?.find((o) => isMetalOptionName(o.name));
}

export function ProductCard({
  product,
  compact = false,
  eager = false,
}: {
  product: ShopifyProduct;
  compact?: boolean;
  /** Load the primary image eagerly — use for cards in the first, above-the-fold row. */
  eager?: boolean;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const node = product.node;
  const image = node.images.edges[0]?.node;
  const hoverImage = node.images.edges[1]?.node;
  const variant =
    node.variants.edges.find((v) => v.node.availableForSale)?.node ?? node.variants.edges[0]?.node;
  const price = node.priceRange.minVariantPrice;
  const option = metalOption(product);
  const finishes = (option?.values ?? []).filter((v) => v !== "Default Title");
  const bestSeller = (node.tags ?? []).some((t) => /best|trending|featured/i.test(t));
  const soldOut = node.variants.edges.every((v) => !v.node.availableForSale);
  const onSale = Boolean(variant) && isOnSale(variant?.price, variant?.compareAtPrice);
  const points = Math.floor(parseFloat(price.amount || "0"));

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!variant) return;
    const { success } = await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    if (success) {
      toast.success("Added to bag", { description: node.title, position: "top-center" });
    } else {
      toast.error("Couldn't add to bag", {
        description: "Please check your connection and try again.",
        position: "top-center",
      });
    }
  };

  return (
    <article className="group h-full">
      <Link
        to="/product/$handle"
        params={{ handle: node.handle }}
        className="flex h-full flex-col border border-border/70 bg-card transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[var(--gold)]/45 hover:shadow-[var(--shadow-elevated)]"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-card">
          {image && (
            <img
              src={image.url}
              alt={image.altText ?? node.title}
              loading={eager ? "eager" : "lazy"}
              fetchPriority={eager ? "high" : undefined}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
            />
          )}
          {hoverImage && (
            <img
              src={hoverImage.url}
              alt={hoverImage.altText ?? node.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-[900ms] group-hover:opacity-100"
            />
          )}

          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3.5">
            {bestSeller ? (
              <span className="bg-foreground px-3 py-1.5 text-[8px] uppercase tracking-[0.22em] text-background">
                Best Seller
              </span>
            ) : onSale ? (
              <span className="bg-[var(--gold)] px-3 py-1.5 text-[8px] uppercase tracking-[0.22em] text-[oklch(0.18_0.01_60)]">
                Sale
              </span>
            ) : (
              <span />
            )}
            {soldOut && (
              <span className="glass-strong px-3 py-1.5 text-[8px] uppercase tracking-[0.22em] text-foreground">
                Sold out
              </span>
            )}
          </div>

          {!soldOut && (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isLoading || !variant}
              className="glass-strong absolute inset-x-3.5 bottom-3.5 flex translate-y-3 items-center justify-center gap-2 py-3.5 text-[9px] uppercase tracking-[0.24em] text-foreground opacity-0 transition-all duration-[500ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5" /> Quick add
                </>
              )}
            </button>
          )}
        </div>

        <div className={cn("flex flex-1 flex-col bg-card p-5", compact && "p-4")}>
          {node.productType && (
            <p className="text-[8px] uppercase tracking-[0.3em] text-muted-foreground">
              {node.productType}
            </p>
          )}
          <h3
            className={cn(
              "mt-2.5 line-clamp-2 font-display text-lg leading-snug text-foreground transition-colors group-hover:text-[var(--gold)]",
              compact && "text-base",
            )}
          >
            {node.title}
          </h3>

          {finishes.length > 0 && <MetalSwatchRow values={finishes} className="mt-3.5" />}

          <div className="mt-auto flex items-end justify-between gap-3 pt-5">
            <div>
              <p className="text-sm tracking-wide text-foreground">
                <span className="text-[8px] uppercase tracking-[0.24em] text-muted-foreground">
                  From{" "}
                </span>
                {onSale && variant
                  ? formatMoney(variant.price.amount, variant.price.currencyCode)
                  : formatMoney(price.amount, price.currencyCode)}
                {onSale && variant?.compareAtPrice && (
                  <span className="ml-1.5 text-muted-foreground line-through">
                    {formatMoney(
                      variant.compareAtPrice.amount,
                      variant.compareAtPrice.currencyCode,
                    )}
                  </span>
                )}
              </p>
              {points > 0 && (
                <p className="mt-1.5 text-[8px] uppercase tracking-[0.2em] text-[var(--gold)]">
                  Earn {points} pts
                </p>
              )}
            </div>
            <span className="text-[8px] uppercase tracking-[0.22em] text-muted-foreground transition-colors group-hover:text-[var(--gold)]">
              View
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
