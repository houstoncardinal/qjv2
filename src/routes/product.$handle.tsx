import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
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
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { VariantSelector, prettyValue } from "@/components/VariantSelector";
import { MetalSwatch, isMetalOptionName } from "@/components/MetalSwatch";
import { JsonLd } from "@/components/JsonLd";
import { OFFER_POLICY_LD, SITE_NAME, SITE_URL, breadcrumbLd, faqLd } from "@/lib/site";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchProductByHandle,
  fetchProducts,
  formatMoney,
  isOnSale,
  sanitizeShopifyHtml,
  shortDescription,
  variantImageIndex,
  type ShopifyProduct,
} from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { cn } from "@/lib/utils";

type Variant = ShopifyProduct["node"]["variants"]["edges"][number]["node"];

const FALLBACK_DESCRIPTION_FOR = (name: string) =>
  `Shop ${name} — hand-set VVS1 D colour moissanite in 18K gold, white gold or rose gold plated S925 sterling silver. GRA certified with insured worldwide shipping.`;

export const Route = createFileRoute("/product/$handle")({
  loader: ({ params }) => fetchProductByHandle(params.handle),
  head: (ctx) => {
    const node = ctx.loaderData?.node;
    const name = node?.title ?? ctx.params.handle.replace(/-/g, " ");
    const rawDescription = node ? shortDescription(node) : "";
    const description =
      rawDescription.length > 10
        ? rawDescription.length > 160
          ? `${rawDescription.slice(0, 157)}...`
          : rawDescription
        : FALLBACK_DESCRIPTION_FOR(name);
    const image = node?.images.edges[0]?.node.url;
    const price = node?.priceRange.minVariantPrice;
    const url = `${SITE_URL}/product/${ctx.params.handle}`;

    return {
      meta: [
        { title: `${name} | Qureshi Jewelers` },
        { name: "description", content: description },
        { property: "og:title", content: `${name} | Qureshi Jewelers` },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
        ...(price
          ? [
              { property: "product:price:amount", content: price.amount },
              { property: "product:price:currency", content: price.currencyCode },
            ]
          : []),
        { name: "twitter:card", content: "summary_large_image" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: ProductDetail,
});

const trustGrid = [
  { icon: BadgeCheck, title: "GRA Certified", sub: "Certificate included" },
  { icon: Truck, title: "Free U.S. Shipping", sub: "On orders over $100" },
  { icon: RotateCcw, title: "14-Day Returns", sub: "Unworn, original packaging" },
  { icon: ShieldCheck, title: "Gift Ready", sub: "Luxury packaging" },
];

const productFaqs = [
  {
    q: "Will it tarnish?",
    a: "The solid S925 base carries five layers of plating sealed with a protective e-coat, so daily wear holds its finish for years.",
  },
  {
    q: "Is it hypoallergenic?",
    a: "Yes — nickel-free, lead-free and cadmium-free, safe for sensitive skin.",
  },
  {
    q: "Is it good for an engagement ring?",
    a: "Yes. Moissanite scores 9.25 on the Mohs scale, second only to diamond, so it holds up to everyday wear as an engagement or wedding ring stone.",
  },
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

/** Long Shopify intros push price and options below the fold on phones, so clamp with an in-place expander. */
function ProductSummary({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mt-5">
      <p
        className={cn(
          "text-sm leading-relaxed text-muted-foreground",
          !expanded && "line-clamp-3 lg:line-clamp-none",
        )}
      >
        {text}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 text-[9px] uppercase tracking-[0.24em] text-foreground underline underline-offset-4 lg:hidden"
      >
        {expanded ? "Show less" : "Read more"}
      </button>
    </div>
  );
}

function joinWithOr(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} or ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} or ${items[items.length - 1]}`;
}

const PRONG_WORDS: Record<string, string> = {
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
};

/** Pulls a stated prong count (e.g. "4-prong claw inlay") out of the product copy, if any. */
function prongSettingText(description: string): string | null {
  const match = description.match(/\b(one|two|three|four|five|six|\d+)[- ]prong\b/i);
  if (!match?.[1]) return null;
  const raw = match[1].toLowerCase();
  const count = PRONG_WORDS[raw] ?? raw;
  return `${count}-Prong Setting`;
}

function ProductDetail() {
  const { handle } = Route.useParams();
  const addItem = useCartStore((s) => s.addItem);
  const isCartLoading = useCartStore((s) => s.isLoading);

  const [activeImage, setActiveImage] = useState(0);
  const [variant, setVariant] = useState<Variant | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);

  const onVariantChange = useCallback((v: Variant | undefined) => setVariant(v), []);

  const loaderData = Route.useLoaderData();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", handle],
    queryFn: () => fetchProductByHandle(handle),
    initialData: loaderData ?? undefined,
  });

  const { data: related } = useQuery({
    queryKey: ["products", "related"],
    queryFn: () => fetchProducts(12),
  });

  // Swap the gallery to the image that matches the selected colour/metal variant.
  useEffect(() => {
    if (!product || !variant) return;
    const idx = variantImageIndex(product, variant);
    if (idx >= 0) setActiveImage(idx);
  }, [product, variant]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main
          id="main-content"
          className="mx-auto grid max-w-[1400px] gap-12 px-5 py-14 sm:px-8 lg:grid-cols-2"
        >
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
        <main id="main-content" className="mx-auto max-w-3xl px-6 py-32 text-center">
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
  const onSale = isOnSale(variant?.price, variant?.compareAtPrice);
  const metalValue = variant?.selectedOptions.find((o) =>
    /colou?r|metal|plating|finish/i.test(o.name),
  )?.value;
  const summary = shortDescription(node);
  const descriptionHtml = sanitizeShopifyHtml(node.descriptionHtml);

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: node.title,
    description: node.description,
    sku: (variant?.id ?? node.id).split("/").pop(),
    image: images.map((i) => i.node.url),
    brand: { "@type": "Brand", name: SITE_NAME },
    material: "Moissanite, S925 sterling silver, 18K gold plating",
    category: node.productType || "Jewelry",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: node.priceRange.minVariantPrice.currencyCode,
      lowPrice: Number(node.priceRange.minVariantPrice.amount),
      highPrice: Math.max(
        ...node.variants.edges.map((v) => Number(v.node.price.amount)),
        Number(node.priceRange.minVariantPrice.amount),
      ),
      offerCount: node.variants.edges.length,
      availability: node.variants.edges.some((v) => v.node.availableForSale)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@id": `${SITE_URL}/#organization` },
      ...OFFER_POLICY_LD,
    },
  };

  const handleAddToCart = async (checkout = false) => {
    if (!variant) return;
    const { success } = await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity,
      selectedOptions: variant.selectedOptions || [],
    });

    if (!success) {
      toast.error("Couldn't add to bag", {
        description: "Please check your connection and try again.",
        position: "top-center",
      });
      return;
    }

    if (checkout) {
      const url = useCartStore.getState().checkoutUrl;
      if (url) window.open(url, "_blank");
      return;
    }

    toast.success("Added to bag", {
      description: `${node.title} · ${variant.title}`,
      position: "top-center",
    });
  };

  const relatedProducts = (related ?? []).filter((p) => p.node.handle !== handle).slice(0, 4);

  const metalOption = node.options.find((o) => isMetalOptionName(o.name));
  const platingValues = metalOption?.values.map(prettyValue) ?? [];
  const platingText = platingValues.length
    ? `5× Gold Plated in ${joinWithOr(platingValues)}`
    : "5× 18K Gold Plated";

  const specs: Array<[string, string]> = [
    ["Base Metal", "Solid S925 Sterling Silver"],
    ["Plating", platingText],
    ["Stone", "VVS1 Moissanite · D Colour"],
    ["Setting", prongSettingText(node.description) ?? "Classic prong solitaire"],
    ["Finish", "Tarnish-resistant e-coat"],
    ["Certificate", "GRA included"],
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main id="main-content">
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

        <div className="mx-auto grid max-w-[1560px] grid-cols-1 gap-10 px-5 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          {/* Gallery */}
          <div className="min-w-0 lg:flex lg:gap-4">
            {images.length > 1 && (
              <div className="scroll-strip order-first hidden max-h-[720px] flex-col gap-3 overflow-y-auto lg:flex">
                {images.map((img, i) => (
                  <button
                    key={img.node.url}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "h-20 w-20 shrink-0 overflow-hidden border bg-card transition-all duration-300",
                      i === activeImage
                        ? "border-[var(--gold)]"
                        : "border-border opacity-65 hover:opacity-100",
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
              <div className="relative aspect-square overflow-hidden border border-border bg-card">
                {images[activeImage]?.node && (
                  <img
                    src={images[activeImage]!.node.url}
                    alt={images[activeImage]!.node.altText ?? node.title}
                    loading="eager"
                    fetchPriority="high"
                    className="h-full w-full object-cover"
                  />
                )}
                {metalValue && (
                  <span className="glass-strong absolute left-5 top-5 flex items-center gap-2.5 px-3.5 py-2 text-[8px] uppercase tracking-[0.22em] text-foreground">
                    <MetalSwatch value={metalValue} size="xs" />
                    {prettyValue(metalValue)}
                  </span>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous image"
                      onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                      className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center bg-background/85 text-foreground backdrop-blur transition-opacity hover:opacity-80"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next image"
                      onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                      className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center bg-background/85 text-foreground backdrop-blur transition-opacity hover:opacity-80"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <span className="absolute bottom-4 right-4 bg-background/85 px-3 py-1.5 text-[9px] tracking-widest text-muted-foreground backdrop-blur">
                      {activeImage + 1} / {images.length}
                    </span>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="scroll-strip mt-3 flex gap-2 overflow-x-auto lg:hidden">
                  {images.map((img, i) => (
                    <button
                      key={img.node.url}
                      onClick={() => setActiveImage(i)}
                      className={cn(
                        "h-16 w-16 shrink-0 overflow-hidden border transition-all duration-300",
                        i === activeImage
                          ? "border-[var(--gold)]"
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
          </div>

          {/* Buy box */}
          <div className="min-w-0 lg:sticky lg:top-6 lg:self-start">
            {node.productType && (
              <p className="text-[9px] uppercase tracking-[0.34em] text-[var(--gold)]">
                {node.productType}
              </p>
            )}
            <h1 className="mt-3 break-words font-display text-3xl leading-[1.1] sm:text-4xl lg:text-5xl">
              {node.title}
            </h1>

            {summary && <ProductSummary text={summary} />}

            <div className="mt-7 flex flex-wrap items-baseline gap-3 border-b border-border pb-7">
              <p className="font-display text-4xl sm:text-5xl">
                {formatMoney(price.amount, price.currencyCode)}
              </p>
              {onSale && variant?.compareAtPrice && (
                <>
                  <p className="text-lg text-muted-foreground line-through">
                    {formatMoney(
                      variant.compareAtPrice.amount,
                      variant.compareAtPrice.currencyCode,
                    )}
                  </p>
                  <span className="bg-[var(--gold)] px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] text-[oklch(0.18_0.01_60)]">
                    Sale
                  </span>
                </>
              )}
              <span className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                {price.currencyCode} · Tax included
              </span>
            </div>

            <div className="mt-8">
              <VariantSelector product={product} onVariantChange={onVariantChange} />
            </div>

            <div className="mt-6 space-y-2">
              <p className="flex items-center gap-2.5 border border-border bg-secondary/60 px-4 py-3 text-[10px] tracking-wide text-muted-foreground">
                <Info className="h-3.5 w-3.5 shrink-0 text-[var(--gold)]" />
                Need another size? Add a note at checkout and we will craft it for you.
              </p>
              <p className="flex items-center gap-2.5 border border-border bg-secondary/60 px-4 py-3 text-[10px] tracking-wide text-muted-foreground">
                <Truck className="h-3.5 w-3.5 shrink-0 text-[var(--gold)]" />
                Ships within 24 hours · Free U.S. shipping on orders over $100.
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
        <section className="border-t border-border bg-secondary/50 py-12">
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
                {descriptionHtml ? (
                  <div
                    className="rich-text"
                    dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                  />
                ) : (
                  <p className="whitespace-pre-line">{node.description}</p>
                )}
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
                  Dispatched within 24 hours with insured tracked delivery. Standard shipping is
                  free across the United States on orders over $100. Returns accepted within 14 days
                  in original condition and packaging — one return per customer every 14 days.
                </p>
              </Accordion>
              <Accordion title="Common Questions">
                <dl className="space-y-4">
                  {productFaqs.map((f) => (
                    <div key={f.q}>
                      <dt className="font-medium text-foreground">{f.q}</dt>
                      <dd className="mt-1">{f.a}</dd>
                    </div>
                  ))}
                </dl>
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
          <section className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8">
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
      <JsonLd data={productLd} />
      <JsonLd data={faqLd(productFaqs)} />
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", url: "/" },
          { name: "Shop", url: "/shop" },
          { name: node.title, url: `/product/${node.handle}` },
        ])}
      />
    </div>
  );
}
