import { useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";

export function useCartSync() {
  const syncCart = useCartStore((state) => state.syncCart);
  const attachBuyerIdentity = useCartStore((state) => state.attachBuyerIdentity);
  const token = useAuthStore((state) => state.token);

  // Keep the live Shopify cart tied to the signed-in Shopify customer.
  useEffect(() => {
    if (token) void attachBuyerIdentity();
  }, [token, attachBuyerIdentity]);

  useEffect(() => {
    syncCart();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") syncCart();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [syncCart]);
}
