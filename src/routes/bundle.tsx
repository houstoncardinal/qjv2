import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { VariantSelector } from "@/components/VariantSelector";
import { MetalSwatchRow, isMetalOptionName } from "@/components/MetalSwatch";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { fetchProducts, formatMoney, type ShopifyProduct } from "@/lib/shopify";
import {
  BUNDLE_SLOTS,
  BUNDLE_DISCOUNT_PERCENT,
  type BundleSlot,
  type BundleSlotKey,
} from "@/lib/bundle";
import { useCartStore } from "@/stores/cartStore";
import { cn } from "@/lib/utils";

type Variant = ShopifyProduct["node"]["variants"]["edges"][number]["node"];
type SlotSelection = { product: ShopifyProduct; variant: Variant | undefined };

export const Route = createFileRoute("/bundle")({
  head: () => ({
    meta: [
      { title: "Build Your Own Bundle | Qureshi Jewelers" },
      {
        name: "description",
        content:
          "Pick a ring, a necklace or chain, a bracelet and a pair of earrings, and save 10% instantly — applied automatically, no code needed.",
      },
      { property: "og:title", content: "Build Your Own Bundle" },
      {
        property: "og:description",
        content: "Curate your own moissanite set across four categories and unlock 10% off.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/bundle" },
    ],
    links: [{ rel: "canonical", href: "/bundle" }],
  }),
  component: BundlePage,
});

function useSlotProducts(slot: BundleSlot) {
  return useQuery({
    queryKey: ["bundle-slot-products", slot.key],
    queryFn: () => fetchProducts(12, slot.query),
  });
}

function BundlePage() {
  const addBundleItems = useCartStore((s) => s.addBundleItems);
  const isCartLoading = useCartStore((s) => s.isLoading);
  const [selections, setSelections] = useState<Partial<Record<BundleSlotKey, SlotSelection>>>({});
  const [adding, setAdding] = useState(false);

  const pickProduct = (key: BundleSlotKey, product: ShopifyProduct) => {
    setSelections((s) => ({ ...s, [key]: { product, variant: undefined } }));
  };
  const setVariant = (key: BundleSlotKey, variant: Variant | undefined) => {
    setSelections((s) => {
      const current = s[key];
      return current ? { ...s, [key]: { ...current, variant } } : s;
    });
  };
  const clearSlot = (key: BundleSlotKey) => {
    setSelections((s) => {
      const next = { ...s };
      delete next[key];
      return next;
    });
  };

  const filledSlots = BUNDLE_SLOTS.filter((slot) => selections[slot.key]?.variant);
  const allFilled = filledSlots.length === BUNDLE_SLOTS.length;
  const subtotal = filledSlots.reduce(
    (sum, slot) => sum + parseFloat(selections[slot.key]!.variant!.price.amount),
    0,
  );
  const currency = filledSlots[0]
    ? selections[filledSlots[0].key]!.variant!.price.currencyCode
    : "USD";
  const discounted = subtotal * (1 - BUNDLE_DISCOUNT_PERCENT / 100);
  const savings = subtotal - discounted;

  const handleAddBundle = async () => {
    if (!allFilled) return;
    const items = BUNDLE_SLOTS.map((slot) => {
      const sel = selections[slot.key];
      const variant = sel?.variant;
      if (!sel || !variant) throw new Error("Bundle slot missing a variant");
      return {
        product: sel.product,
        variantId: variant.id,
        variantTitle: variant.title,
        price: variant.price,
        quantity: 1,
        selectedOptions: variant.selectedOptions || [],
      };
    });

    setAdding(true);
    try {
      await addBundleItems(items);
      toast.success("Bundle added to your bag", {
        description: "10% off has been applied automatically.",
        position: "top-center",
      });
      useCartStore.getState().setOpen(true);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main id="main-content">
        <section className="relative isolate overflow-hidden border-b border-border bg-[oklch(0.14_0.004_60)] py-16 text-background lg:py-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse 65% 55% at 12% 0%, oklch(0.72 0.085 84 / 0.16), transparent 60%), radial-gradient(ellipse 55% 45% at 100% 100%, oklch(0.72 0.006 250 / 0.1), transparent 55%), linear-gradient(155deg, oklch(0.18 0.005 60) 0%, oklch(0.14 0.004 60) 55%, oklch(0.12 0.004 60) 100%)",
            }}
          />

          <div className="relative mx-auto max-w-[900px] px-6 text-center sm:px-10">
            <p className="text-[10px] uppercase tracking-[0.42em] text-[var(--gold)]">
              Curate Your Own
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
              Build Your Own <span className="italic">Bundle</span>
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-background/65 sm:text-base">
              Choose one ring, one necklace or chain, one bracelet and one pair of earrings. The
              moment your set is complete, 10% comes off automatically — no code needed.
            </p>

            <div className="mx-auto mt-12 max-w-xl">
              <div className="flex items-start justify-center">
                {BUNDLE_SLOTS.map((slot, i) => {
                  const filled = Boolean(selections[slot.key]?.variant);
                  const isLast = i === BUNDLE_SLOTS.length - 1;
                  return (
                    <div key={slot.key} className={cn("flex items-center", !isLast && "flex-1")}>
                      <a href={`#${slot.key}`} className="group flex flex-col items-center gap-2.5">
                        <span
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-[11px] transition-all duration-500",
                            filled
                              ? "border-[var(--gold)] bg-[var(--gold)] text-[oklch(0.18_0.01_60)] shadow-[var(--shadow-gold)]"
                              : "border-background/25 text-background/55 group-hover:border-background/50",
                          )}
                        >
                          {filled ? <Check className="h-4 w-4" /> : i + 1}
                        </span>
                        <span className="whitespace-nowrap text-[9px] uppercase tracking-[0.18em] text-background/55 transition-colors group-hover:text-background/80">
                          {slot.label.split(" / ")[0]}
                        </span>
                      </a>
                      {!isLast && (
                        <span
                          className={cn(
                            "mx-1.5 mt-5 h-px flex-1 transition-colors duration-700",
                            filled ? "bg-[var(--gold)]" : "bg-background/15",
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <p
                className={cn(
                  "mt-6 text-[9px] uppercase tracking-[0.24em] transition-colors duration-500",
                  allFilled ? "text-[var(--gold)]" : "text-background/50",
                )}
              >
                {allFilled
                  ? "10% off unlocked"
                  : `${BUNDLE_SLOTS.length - filledSlots.length} more piece${BUNDLE_SLOTS.length - filledSlots.length === 1 ? "" : "s"} to unlock 10% off`}
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1560px] px-6 py-14 sm:px-10 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[56px_1fr_380px] lg:items-start lg:gap-10">
            <BundleStepRail selections={selections} />

            <div className="space-y-16">
              {BUNDLE_SLOTS.map((slot, i) => (
                <BundleSlotSection
                  key={slot.key}
                  index={i + 1}
                  slot={slot}
                  selection={selections[slot.key]}
                  onPick={(product) => pickProduct(slot.key, product)}
                  onVariantChange={(variant) => setVariant(slot.key, variant)}
                  onClear={() => clearSlot(slot.key)}
                />
              ))}
            </div>

            <div className="lg:sticky lg:top-24">
              <BundleSummary
                selections={selections}
                allFilled={allFilled}
                subtotal={subtotal}
                discounted={discounted}
                savings={savings}
                currency={currency}
                onAdd={() => void handleAddBundle()}
                loading={adding || isCartLoading}
              />
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function BundleStepRail({
  selections,
}: {
  selections: Partial<Record<BundleSlotKey, SlotSelection>>;
}) {
  return (
    <div className="hidden lg:sticky lg:top-32 lg:flex lg:h-fit lg:w-14 lg:flex-col lg:items-center">
      {BUNDLE_SLOTS.map((slot, i) => {
        const filled = Boolean(selections[slot.key]?.variant);
        const isLast = i === BUNDLE_SLOTS.length - 1;
        return (
          <div key={slot.key} className="flex flex-col items-center">
            <a
              href={`#${slot.key}`}
              title={slot.label}
              aria-label={`Jump to ${slot.label}`}
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[11px] transition-all duration-500",
                filled
                  ? "border-[var(--gold)] bg-[var(--gold)] text-[oklch(0.18_0.01_60)] shadow-[var(--shadow-gold)]"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
              )}
            >
              {filled ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </a>
            {!isLast && (
              <span
                className={cn(
                  "my-1 h-12 w-px transition-colors duration-700",
                  filled ? "bg-[var(--gold)]" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function BundleSlotSection({
  index,
  slot,
  selection,
  onPick,
  onVariantChange,
  onClear,
}: {
  index: number;
  slot: BundleSlot;
  selection: SlotSelection | undefined;
  onPick: (product: ShopifyProduct) => void;
  onVariantChange: (variant: Variant | undefined) => void;
  onClear: () => void;
}) {
  const { data: products, isLoading } = useSlotProducts(slot);
  const filled = Boolean(selection?.variant);

  return (
    <section id={slot.key} aria-labelledby={`slot-${slot.key}`} className="scroll-mt-28">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] transition-all duration-500 lg:hidden",
            filled
              ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]"
              : "border-border text-muted-foreground",
          )}
        >
          {filled ? <Check className="h-3.5 w-3.5" /> : index}
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={`slot-${slot.key}`} className="font-display text-2xl leading-tight">
            {slot.label}
          </h2>
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {slot.sub}
          </p>
        </div>
        {selection && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 text-[9px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
          >
            Change piece
          </button>
        )}
      </div>

      <div className="mt-6">
        {selection ? (
          <div className="rise-in border border-[var(--gold)]/30 bg-card shadow-[var(--shadow-soft)]">
            <div className="gold-rule" />
            <div className="grid gap-8 p-6 sm:grid-cols-[220px_1fr] sm:p-8">
              <div className="aspect-[4/5] overflow-hidden bg-secondary">
                {selection.product.node.images.edges[0]?.node && (
                  <img
                    src={selection.product.node.images.edges[0].node.url}
                    alt={
                      selection.product.node.images.edges[0].node.altText ??
                      selection.product.node.title
                    }
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.24em] text-[var(--gold)]">
                  <Check className="h-3 w-3" /> Selected
                </p>
                <h3 className="mt-2 font-display text-xl leading-snug">
                  {selection.product.node.title}
                </h3>
                <p className="mt-2 text-sm text-foreground/70">
                  {selection.variant
                    ? formatMoney(
                        selection.variant.price.amount,
                        selection.variant.price.currencyCode,
                      )
                    : " "}
                </p>
                <div className="mt-5">
                  <VariantSelector
                    key={selection.product.node.id}
                    product={selection.product}
                    onVariantChange={onVariantChange}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {(products ?? []).map((product) => (
              <BundleProductCard
                key={product.node.id}
                product={product}
                onSelect={() => onPick(product)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function BundleProductCard({
  product,
  onSelect,
}: {
  product: ShopifyProduct;
  onSelect: () => void;
}) {
  const node = product.node;
  const image = node.images.edges[0]?.node;
  const price = node.priceRange.minVariantPrice;
  const option = node.options?.find((o) => isMetalOptionName(o.name));
  const finishes = (option?.values ?? []).filter((v) => v !== "Default Title");

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex flex-col border border-border/70 bg-card text-left transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[var(--gold)]/45 hover:shadow-[var(--shadow-soft)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-card">
        {image && (
          <img
            src={image.url}
            alt={image.altText ?? node.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
          />
        )}
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-[oklch(0.14_0.004_60)]/55 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <span className="mb-3.5 flex items-center gap-1.5 bg-[var(--gold)] px-3.5 py-1.5 text-[9px] uppercase tracking-[0.2em] text-[oklch(0.18_0.01_60)]">
            <Check className="h-3 w-3" /> Select
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <h3 className="line-clamp-2 text-xs leading-snug text-foreground">{node.title}</h3>
        {finishes.length > 0 && <MetalSwatchRow values={finishes} className="mt-0.5" />}
        <p className="mt-auto pt-1.5 text-[11px] text-foreground/75">
          {formatMoney(price.amount, price.currencyCode)}
        </p>
      </div>
    </button>
  );
}

function BundleSummary({
  selections,
  allFilled,
  subtotal,
  discounted,
  savings,
  currency,
  onAdd,
  loading,
}: {
  selections: Partial<Record<BundleSlotKey, SlotSelection>>;
  allFilled: boolean;
  subtotal: number;
  discounted: number;
  savings: number;
  currency: string;
  onAdd: () => void;
  loading: boolean;
}) {
  const remaining = BUNDLE_SLOTS.filter((slot) => !selections[slot.key]?.variant).length;

  return (
    <div
      className={cn(
        "border bg-card p-6 transition-all duration-500",
        allFilled
          ? "border-[var(--gold)]/40 shadow-[var(--shadow-elevated)]"
          : "border-border shadow-[var(--shadow-soft)]",
      )}
    >
      {allFilled && <div className="gold-rule -mx-6 -mt-6 mb-6" />}
      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Your Bundle</p>

      <div className="mt-5 space-y-3">
        {BUNDLE_SLOTS.map((slot) => {
          const sel = selections[slot.key];
          const filled = Boolean(sel?.variant);
          const image = sel?.product.node.images.edges[0]?.node;
          return (
            <div key={slot.key} className="flex items-center gap-3">
              <div
                className={cn(
                  "relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden bg-secondary transition-shadow duration-500",
                  filled && "shadow-[0_0_0_1px_var(--gold)]",
                )}
              >
                {image ? (
                  <img src={image.url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[9px] uppercase text-muted-foreground">
                    {slot.label[0]}
                  </span>
                )}
                {filled && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--gold)] text-[oklch(0.18_0.01_60)]">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] text-foreground">
                  {sel?.product.node.title ?? slot.label}
                </p>
                <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                  {sel?.variant
                    ? formatMoney(sel.variant.price.amount, sel.variant.price.currencyCode)
                    : "Not chosen yet"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 space-y-2 border-t border-border pt-5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Subtotal</span>
          <span className={cn(allFilled && "line-through")}>{formatMoney(subtotal, currency)}</span>
        </div>
        {allFilled && (
          <div className="flex justify-between text-xs text-[var(--gold)]">
            <span>Bundle discount ({BUNDLE_DISCOUNT_PERCENT}%)</span>
            <span>&minus;{formatMoney(savings, currency)}</span>
          </div>
        )}
        <div className="flex items-baseline justify-between pt-1">
          <span className="text-xs uppercase tracking-[0.2em] text-foreground">
            {allFilled ? "Bundle total" : "Estimated total"}
          </span>
          <span className="font-display text-2xl">
            {formatMoney(allFilled ? discounted : subtotal, currency)}
          </span>
        </div>
      </div>

      {allFilled && (
        <p className="rise-in shimmer-line mt-4 flex items-center justify-center gap-2 px-3 py-2.5 text-[10px] uppercase tracking-[0.2em] text-[oklch(0.18_0.01_60)]">
          <Sparkles aria-hidden="true" className="h-3.5 w-3.5" /> 10% off unlocked
        </p>
      )}

      <Button
        variant={allFilled ? "gold" : "outline"}
        size="lg"
        className="mt-6 w-full"
        disabled={!allFilled || loading}
        onClick={onAdd}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : allFilled ? (
          "Add Bundle to Bag"
        ) : (
          `Choose ${remaining} more piece${remaining === 1 ? "" : "s"}`
        )}
      </Button>

      <p className="mt-3 text-center text-[10px] text-muted-foreground">
        Discount applies automatically at checkout — no code needed.
      </p>
    </div>
  );
}
