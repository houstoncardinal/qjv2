import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Gem,
  Info,
  Loader2,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { VariantSelector } from "@/components/VariantSelector";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchProductByHandle,
  fetchProducts,
  formatMoney,
  type ShopifyProduct,
} from "@/lib/shopify";
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
          content: `Shop ${name} — hand-set VVS1 D colour moissanite in 18K gold, white gold or rose gold plated S925 sterling silver. GRA certified with insured worldwide shipping.`,
        },
        { property: "og:title", content: `${name} | Qureshi Jewelers` },
        {
          property: "og:description",
          content: "Hand-set VVS1 moissanite, GRA certified and shipped worldwide.",
        },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductDetail,
});

const trustGrid = [
  { icon: BadgeCheck, title: "GRA Certified", sub: "Certificate included" },
  { icon: Truck, title: "Free Shipping", sub: "Insured & tracked" },
  { icon: RotateCcw, title: "30-Day Returns", sub: "No questions asked" },
  { icon: ShieldCheck, title: "Gift Ready", sub: "Luxury packaging" },
];

function Accordion({
  title,
  children,
  open = false,
}: {
  title: string;
  children: React.ReactNode;
  open?: boolean;
}) {
  return (
    <details open={open} className="group border-b border-border">
      <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-[10px] uppercase tracking-[0.26em] text-foreground">
        {title}
        <Plus className="h-3.5 w-3.5 text-muted-foreground transition-transform group-open:rotate-45" />
      </summary>
      <div className="pb-6 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </details>
  );
}

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
    queryFn: () => fetchProducts(12),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto grid max-w-[1400px] gap-12 px-5 py-14 sm:px-8 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-5">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-48 w-full" />
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
  const metalValue = variant?.selectedOptions.find((o) =>
    /colou?r|metal|plating|finish/i.test(o.name),
  )?.value;
  const shortDescription = node.description.split(/\.\s/).slice(0, 3).join(". ");

  const handleAddToCart = async (checkout = false) => {
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity,
      selectedOptions: variant.selectedOptions || [],
    });
    if (checkout) {
      const url = useCartStore.getState().checkoutUrl;
      if (url) {
        window.location.href = url;
        return;
      }
    }
    toast.success("Added to bag", {
      description: `${node.title} · ${variant.title}`,
      position: "top-center",
    });
  };

  const relatedProducts = (related ?? []).filter((p) => p.node.handle !== handle).slice(0, 4);

  const specs: Array<[string, string]> = [
    ["Base Metal", "Solid S925 Sterling Silver"],
    ["Plating", metalValue ? `5× ${metalValue}` : "5× 18K Gold · Rose Gold · White Gold"],
    ["Stone", "VVS1 Moissanite · D Colour"],
    ["Setting", "Classic prong solitaire"],
    ["Finish", "Tarnish-resistant e-coat"],
    ["Certificate", "GRA included"],
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <div className="mx-auto max-w-[1400px] px-5 pt-6 sm:px-8">
          <nav className="text-[9px] uppercase tracking-[0.24em] text-muted-foreground">
            <Link to="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <span className="px-2">/</span>
            <Link to="/shop" className="transition-colors hover:text-foreground">
              Shop
            </Link>
            {node.productType && (
              <>
                <span className="px-2">/</span>
                <span className="text-foreground/70">{node.productType}</span>
              </>
            )}
          </nav>
        </div>

        <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-8 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {/* Gallery */}
          <div>
            <div className="relative aspect-square overflow-hidden border border-border bg-card">
              {images[activeImage]?.node && (
                <img
                  src={images[activeImage]!.node.url}
                  alt={images[activeImage]!.node.altText ?? node.title}
                  className="h-full w-full object-cover"
                />
              )}
              {metalValue && (
                <span className="absolute left-4 top-4 flex items-center gap-2 bg-background/90 px-3 py-1.5 text-[8px] uppercase tracking-[0.2em] text-foreground backdrop-blur">
                  <span className="h-2.5 w-2.5 rounded-full swatch-gold" />
                  {metalValue}
                </span>
              )}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center bg-background/85 text-foreground backdrop-blur transition-opacity hover:opacity-80"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center bg-background/85 text-foreground backdrop-blur transition-opacity hover:opacity-80"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <span className="absolute bottom-3 right-3 bg-background/85 px-2.5 py-1 text-[9px] tracking-widest text-muted-foreground backdrop-blur">
                    {activeImage + 1} / {images.length}
                  </span>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="scroll-strip mt-3 flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={img.node.url}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "h-16 w-16 shrink-0 overflow-hidden border transition-all duration-300",
                      i === activeImage
                        ? "border-foreground"
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
          </div>

          {/* Buy box */}
          <div>
            <h1 className="font-display text-3xl leading-tight sm:text-4xl">{node.title}</h1>

            <div className="mt-3 flex items-center gap-2">
              <span className="flex items-center gap-0.5 text-[var(--gold)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-current" />
                ))}
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Be the first to review
              </span>
            </div>

            {shortDescription && (
              <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
                {shortDescription}
              </p>
            )}

            <div className="mt-6 flex items-baseline gap-3">
              <p className="font-display text-4xl">
                {formatMoney(price.amount, price.currencyCode)}
              </p>
              <span className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                {price.currencyCode} · Tax included
              </span>
            </div>

            <div className="mt-7">
              <VariantSelector product={product} onVariantChange={onVariantChange} />
            </div>

            <div className="mt-6 space-y-2">
              <p className="flex items-center gap-2.5 border border-border bg-secondary/60 px-4 py-3 text-[10px] tracking-wide text-muted-foreground">
                <Info className="h-3.5 w-3.5 shrink-0 text-[var(--gold)]" />
                Need another size? Add a note at checkout and we will craft it for you.
              </p>
              <p className="flex items-center gap-2.5 border border-border bg-secondary/60 px-4 py-3 text-[10px] tracking-wide text-muted-foreground">
                <Truck className="h-3.5 w-3.5 shrink-0 text-[var(--gold)]" />
                Ships within 24 hours · Free insured delivery on orders over $250.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-12 items-center border border-border bg-card">
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

              <button
                type="button"
                onClick={() => void handleAddToCart(false)}
                disabled={isCartLoading || !variant || soldOut}
                className="flex h-12 flex-1 items-center justify-center gap-2 bg-foreground text-[10px] uppercase tracking-[0.24em] text-background transition-opacity hover:opacity-85 disabled:opacity-50"
              >
                {isCartLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : soldOut ? (
                  "Sold out"
                ) : (
                  <>
                    <ShoppingBag className="h-3.5 w-3.5" /> Add to bag
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => void handleAddToCart(true)}
              disabled={isCartLoading || !variant || soldOut}
              className="mt-2 h-12 w-full border border-foreground text-[10px] uppercase tracking-[0.24em] text-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
            >
              Buy it now
            </button>

            <div className="mt-6 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
              {trustGrid.map((t) => (
                <div key={t.title} className="bg-card px-3 py-5 text-center">
                  <t.icon className="mx-auto h-4 w-4 text-[var(--gold)]" />
                  <p className="mt-2 text-[8px] uppercase tracking-[0.18em] text-foreground">
                    {t.title}
                  </p>
                  <p className="mt-1 text-[8px] text-muted-foreground">{t.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Details */}
        <section className="border-t border-border bg-secondary/50 py-16">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <div className="border border-border bg-card">
              <p className="border-b border-border px-6 py-4 text-[10px] uppercase tracking-[0.26em] text-foreground">
                Materials & Details
              </p>
              <dl>
                {specs.map(([k, v], i) => (
                  <div
                    key={k}
                    className={cn(
                      "flex items-center justify-between gap-6 px-6 py-3.5",
                      i % 2 === 1 && "bg-secondary/50",
                    )}
                  >
                    <dt className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                      {k}
                    </dt>
                    <dd className="text-right text-xs text-foreground/85">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-10">
              <Accordion title="Description" open>
                <p className="whitespace-pre-line">{node.description}</p>
              </Accordion>
              <Accordion title="Why VVS Moissanite?">
                <p>
                  Moissanite has a refractive index of 2.65–2.69 versus 2.42 for diamond, producing
                  more fire and scintillation in every lighting condition. Each stone is lab
                  created, graded D colourless with VVS1 clarity, and passes standard thermal
                  diamond testers.
                </p>
              </Accordion>
              <Accordion title="Shipping & Returns">
                <p>
                  Dispatched within 24 hours with insured tracked delivery worldwide. Free shipping
                  on orders over $250. Returns accepted within 30 days in original condition and
                  packaging, and complimentary resizing within 60 days.
                </p>
              </Accordion>
              <Accordion title="Common Questions">
                <p>
                  Will it tarnish? The solid S925 base carries five layers of plating sealed with a
                  protective e-coat, so daily wear holds its finish for years. Is it hypoallergenic?
                  Yes — nickel-free, lead-free and cadmium-free. Is it good for an engagement ring?
                  Moissanite scores 9.25 on the Mohs scale, second only to diamond.
                </p>
              </Accordion>
              <Accordion title="Reviews">
                <p>No reviews yet — be the first to share how this piece wears.</p>
              </Accordion>
            </div>

            <div className="mt-10 flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              <Gem className="h-3 w-3 text-[var(--gold)]" />
              <Link to="/shop" className="transition-colors hover:text-foreground">
                Continue shopping
              </Link>
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.34em] text-muted-foreground">
                  Our Collection
                </p>
                <h2 className="mt-3 font-display text-3xl sm:text-4xl">More Fine Pieces</h2>
              </div>
              <Link
                to="/shop"
                className="text-[9px] uppercase tracking-[0.26em] text-muted-foreground transition-colors hover:text-foreground"
              >
                View all
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
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
