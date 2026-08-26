import { createFileRoute } from "@tanstack/react-router";
import { computeTierAndPoints } from "@/lib/rewards";
import { fetchCustomerRewardsState, setCustomerRewardsMetafields } from "@/lib/shopifyAdmin";

/**
 * Shopify webhook: order paid → recompute the customer's Qureshi Circle tier from their real
 * lifetime spend (Shopify's own `Customer.amountSpent`) and write it back as customer metafields
 * (`custom.rewards_tier`, `custom.rewards_lifetime_points`, `custom.rewards_available_points`).
 * This is what makes tier membership a fact Shopify itself knows — visible in Admin, usable in
 * Flow/segments — not just something this storefront computes on the fly.
 *
 * Lifetime points only ever grow with spend and drive tier standing. Available points are a
 * separate, spendable balance: only the newly-earned delta since the last sync is added to it,
 * so points a customer has already redeemed for credit (see api.rewards.redeem.ts) stay spent
 * instead of being silently restored the next time they place an order.
 *
 * One-time setup required in Shopify Admin (see project notes): a custom app with
 * `read_customers`/`write_customers` Admin API scopes, a webhook pointed at this route's URL for
 * the "Order payment" event, and `SHOPIFY_ADMIN_API_TOKEN` / `SHOPIFY_WEBHOOK_SECRET` set as
 * server environment variables (never VITE_-prefixed — must stay off the client bundle).
 */

async function verifyShopifyHmac(rawBody: string, hmacHeader: string | null): Promise<boolean> {
  const secret = process.env["SHOPIFY_WEBHOOK_SECRET"];
  if (!secret || !hmacHeader) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const computed = btoa(String.fromCharCode(...new Uint8Array(signature)));

  if (computed.length !== hmacHeader.length) return false;
  let mismatch = 0;
  for (let i = 0; i < computed.length; i++) {
    mismatch |= computed.charCodeAt(i) ^ hmacHeader.charCodeAt(i);
  }
  return mismatch === 0;
}

export const Route = createFileRoute("/api/webhooks/orders-paid")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const hmacHeader = request.headers.get("X-Shopify-Hmac-Sha256");

        if (!(await verifyShopifyHmac(rawBody, hmacHeader))) {
          return new Response("Invalid signature", { status: 401 });
        }

        let payload: { customer?: { id?: number | string } };
        try {
          payload = JSON.parse(rawBody);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const customerId = payload.customer?.id;
        if (!customerId) {
          // Guest checkout — no Shopify customer record to tier. Ack so Shopify doesn't retry.
          return new Response("No customer on order", { status: 200 });
        }

        const customerGid = `gid://shopify/Customer/${customerId}`;

        try {
          const state = await fetchCustomerRewardsState(customerGid);
          const { tier, lifetimePoints: newLifetimePoints } = computeTierAndPoints(
            state.amountSpent,
          );

          // Only the newly-earned points since the last sync are added to the spendable balance,
          // so previously redeemed points don't get silently restored.
          const earnedDelta = Math.max(0, newLifetimePoints - state.lifetimePoints);
          const newAvailablePoints = state.availablePoints + earnedDelta;

          await setCustomerRewardsMetafields(customerGid, {
            tierKey: tier.key,
            lifetimePoints: newLifetimePoints,
            availablePoints: newAvailablePoints,
          });
        } catch (error) {
          console.error("Rewards sync failed:", error);
          // 500 so Shopify retries the delivery — this is a transient failure, not a bad payload.
          return new Response("Rewards sync failed", { status: 500 });
        }

        return new Response("OK", { status: 200 });
      },
    },
  },
});
