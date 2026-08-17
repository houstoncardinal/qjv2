import { Link } from "@tanstack/react-router";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney, type ShopifyProduct } from "@/lib/shopify";
import { toast } from "sonner";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const node = product.node;
  const image = node.images.edges[0]?.node;
  const hoverImage = node.images.edges[1]?.node;
  const variant =
    node.variants.edges.find((v) => v.node.availableForSale)?.node ?? node.variants.edges[0]?.node;
  const price = node.priceRange.minVariantPrice;

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
        className="block relative aspect-[4/5] overflow-hidden bg-secondary"
      >
        {image && (
          <img
            src={image.url}
            alt={image.altText ?? node.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
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
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[image:var(--gradient-veil)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {node.productType && (
          <span className="absolute left-4 top-4 border border-primary/40 bg-background/60 px-2 py-1 text-[9px] uppercase tracking-[0.22em] text-primary backdrop-blur">
            {node.productType}
          </span>
        )}
      </Link>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link to="/product/$handle" params={{ handle: node.handle }}>
            <h3 className="font-display text-lg leading-snug line-clamp-2 transition-colors group-hover:text-primary">
              {node.title}
            </h3>
          </Link>
          <p className="mt-1 text-sm text-primary">
            {formatMoney(price.amount, price.currencyCode)}
          </p>
        </div>
        <Button
          size="icon"
          variant="outlineGold"
          aria-label={`Add ${node.title} to cart`}
          onClick={handleAddToCart}
          disabled={isLoading || !variant}
          className="shrink-0"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>
    </article>
  );
}
