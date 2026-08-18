import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingBag, Minus, Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatMoney } from "@/lib/shopify";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/rewards";

export const CartDrawer = () => {
  const {
    items,
    isLoading,
    isSyncing,
    isOpen,
    setOpen,
    updateQuantity,
    removeItem,
    getCheckoutUrl,
    syncCart,
  } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + parseFloat(item.price.amount) * item.quantity,
    0,
  );
  const currency = items[0]?.price.currencyCode ?? "USD";
  const pointsEarned = Math.floor(totalPrice);


  useEffect(() => {
    if (isOpen) syncCart();
  }, [isOpen, syncCart]);

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) {
      window.open(checkoutUrl, "_blank");
      setIsOpen(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-foreground">
          <ShoppingBag className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full px-1 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full bg-card border-border">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="font-display text-2xl tracking-wide">Your Selection</SheetTitle>
          <SheetDescription className="tracking-widest text-xs uppercase">
            {totalItems === 0
              ? "No pieces reserved"
              : `${totalItems} piece${totalItems !== 1 ? "s" : ""} reserved`}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col flex-1 pt-6 min-h-0 px-4">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Your selection is empty</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                <div className="space-y-5">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex gap-4">
                      <div className="w-20 h-20 bg-secondary rounded-sm overflow-hidden flex-shrink-0">
                        {item.product.node.images?.edges?.[0]?.node && (
                          <img
                            src={item.product.node.images.edges[0].node.url}
                            alt={item.product.node.title}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm leading-snug line-clamp-2">
                          {item.product.node.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.selectedOptions.map((option) => option.value).join(" • ")}
                        </p>
                        <p className="mt-1 text-sm text-foreground/80">
                          {formatMoney(item.price.amount, item.price.currencyCode)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeItem(item.variantId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 space-y-4 py-5 border-t border-border bg-card">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em]">
                    <span className="text-muted-foreground">
                      {totalPrice >= FREE_SHIPPING_THRESHOLD
                        ? "Free insured shipping unlocked"
                        : `${formatMoney(FREE_SHIPPING_THRESHOLD - totalPrice, currency)} to free shipping`}
                    </span>
                    <span className="text-[var(--gold)]">+{pointsEarned} pts</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden bg-secondary">
                    <div
                      className="h-full tier-bar transition-[width] duration-700"
                      style={{
                        width: `${Math.min(100, Math.round((totalPrice / FREE_SHIPPING_THRESHOLD) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="font-display text-2xl">{formatMoney(totalPrice, currency)}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Taxes and shipping calculated at checkout. Points post to your account after the
                  order completes.
                </p>

                <Button
                  onClick={handleCheckout}
                  variant="gold"
                  className="w-full"
                  size="lg"
                  disabled={items.length === 0 || isLoading || isSyncing}
                >
                  {isLoading || isSyncing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Secure Checkout
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
