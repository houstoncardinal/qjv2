import { Link } from "@tanstack/react-router";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney, type ShopifyProduct } from "@/lib/shopify";
import { toast } from "sonner";

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

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const node = product.node;
  const image = node.images.edges[0]?.node;
  const hoverImage = node.images.edges[1]?.node;
  const variant =
    node.variants.edges.find((v) => v.node.availableForSale)?.node ?? node.variants.edges[0]?.node;
  const price = node.priceRange.minVariantPrice;
  const dots = metalDots(product);

  const handleAddToCart = async () => {
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("Added to your selection", {
      description: node.title,
      position: "top-center",
    });
  };

  return (
    <article className="group">
      <Link
        to="/product/$handle"
        params={{ handle: node.handle }}
        className="relative block aspect-[4/5] overflow-hidden rounded-sm bg-secondary"
      >
        {image && (
          <img
            src={image.url}
            alt={image.altText ?? node.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
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

        {node.productType && (
          <span className="glass absolute left-4 top-4 rounded-full px-3 py-1 text-[9px] uppercase tracking-[0.24em] text-foreground/80">
            {node.productType}
          </span>
        )}

        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <Button
            variant="outlineGold"
            className="glass-strong w-full rounded-full"
            onClick={(e) => {
              e.preventDefault();
              void handleAddToCart();
            }}
            disabled={isLoading || !variant}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" /> Add to bag
              </>
            )}
          </Button>
        </div>
      </Link>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link to="/product/$handle" params={{ handle: node.handle }}>
            <h3 className="font-display text-lg leading-snug line-clamp-2 transition-colors group-hover:text-[var(--gold)]">
              {node.title}
            </h3>
          </Link>
          <p className="mt-1.5 text-sm tracking-wide text-foreground/70">
            {formatMoney(price.amount, price.currencyCode)}
          </p>
        </div>
        {dots.length > 0 && (
          <div className="flex shrink-0 gap-1.5 pt-1">
            {dots.map((d, i) => (
              <span
                key={d + i}
                className={`h-3.5 w-3.5 rounded-full ring-1 ring-border ${d}`}
                aria-hidden
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
