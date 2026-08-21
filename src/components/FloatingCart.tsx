import { useEffect, useState } from "react";
import { ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney } from "@/lib/shopify";
import { BUNDLE_DISCOUNT_PERCENT } from "@/lib/bundle";

export function FloatingCart() {
  const { items, setOpen, getCheckoutUrl, bundleDiscountActive } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + parseFloat(item.price.amount) * item.quantity,
    0,
  );
  const currency = items[0]?.price.currencyCode ?? "USD";
  const estimatedTotal = bundleDiscountActive
    ? totalPrice * (1 - BUNDLE_DISCOUNT_PERCENT / 100)
    : totalPrice;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || totalItems === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[380px]">
      <div className="glass-strong overflow-hidden rounded-sm shadow-[var(--shadow-elevated)]">
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <ShoppingBag className="h-4 w-4 text-foreground" />
              <span className="absolute -right-1.5 -top-1.5 grid h-3.5 min-w-[14px] place-items-center rounded-full bg-foreground px-1 text-[8px] text-background">
                {totalItems}
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-foreground">
              {totalItems} {totalItems === 1 ? "item" : "items"} in bag
            </p>
            {bundleDiscountActive && (
              <span className="flex items-center gap-1 text-[9px] uppercase tracking-[0.18em] text-[var(--gold)]">
                <Sparkles aria-hidden="true" className="h-3 w-3" /> −{BUNDLE_DISCOUNT_PERCENT}%
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
          >
            View
          </button>
        </div>

        <div className="grid grid-cols-2 gap-px bg-border/50">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center justify-center gap-2 bg-card/80 px-4 py-3.5 text-[10px] uppercase tracking-[0.22em] text-foreground transition-colors hover:bg-card"
          >
            Edit bag
          </button>
          <button
            type="button"
            onClick={() => {
              const url = getCheckoutUrl();
              if (url) window.open(url, "_blank");
            }}
            className="group flex items-center justify-center gap-2 bg-foreground px-4 py-3.5 text-[10px] uppercase tracking-[0.22em] text-background transition-opacity hover:opacity-90"
          >
            {formatMoney(estimatedTotal, currency)}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
