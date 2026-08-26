import { createFileRoute } from "@tanstack/react-router";
import { storefrontApiRequest } from "@/lib/shopify";
import { POINTS_PER_DOLLAR_CREDIT, tierForPoints } from "@/lib/rewards";
import {
  createRedemptionDiscountCode,
  fetchCustomerRewardsState,
  setCustomerRewardsMetafields,
} from "@/lib/shopifyAdmin";

/**
 * Redeems a signed-in customer's full available Qureshi Circle points balance for a real,
 * single-use Shopify discount code, then deducts the redeemed points from their spendable
 * balance. Lifetime points (tier standing) are untouched — only the available balance moves.
 *
 * The caller authenticates with their real Shopify customer access token (the same one issued
 * by customerAccessTokenCreate at sign-in) — resolved here via the Storefront API, so this route
 * only ever acts on the token holder's own account, never an arbitrary customer id from the body.
 *
 * Requires the same SHOPIFY_ADMIN_API_TOKEN as the rewards-sync webhook, additionally scoped
 * with write_discounts (to create the redemption code) alongside read_customers/write_customers.
 */

const CUSTOMER_ID_QUERY = `
  query CustomerId($token: String!) {
    customer(customerAccessToken: $token) { id }
  }
`;

export const Route = createFileRoute("/api/rewards/redeem")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { customerAccessToken?: string };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid request body." }, { status: 400 });
        }

        const token = body.customerAccessToken;
        if (!token) {
          return Response.json({ error: "Missing customer access token." }, { status: 400 });
        }

        let customerGid: string;
        try {
          const data = await storefrontApiRequest(CUSTOMER_ID_QUERY, { token });
          const id = data?.data?.customer?.id;
          if (!id) {
            return Response.json({ error: "Not signed in." }, { status: 401 });
          }
          customerGid = id as string;
        } catch {
          return Response.json({ error: "Could not verify your session." }, { status: 401 });
        }

        try {
          const state = await fetchCustomerRewardsState(customerGid);

          if (state.availablePoints < POINTS_PER_DOLLAR_CREDIT) {
            return Response.json(
              {
                error: `You need at least ${POINTS_PER_DOLLAR_CREDIT} points to redeem — you have ${state.availablePoints}.`,
              },
              { status: 400 },
            );
          }

          const dollarsOff = Math.floor(state.availablePoints / POINTS_PER_DOLLAR_CREDIT);
          const pointsUsed = dollarsOff * POINTS_PER_DOLLAR_CREDIT;
          const remainingPoints = state.availablePoints - pointsUsed;

          const code = await createRedemptionDiscountCode(customerGid, dollarsOff);

          // Deduct the redeemed points; lifetime points (tier standing) stay exactly as they were.
          await setCustomerRewardsMetafields(customerGid, {
            tierKey: tierForPoints(state.lifetimePoints).key,
            lifetimePoints: state.lifetimePoints,
            availablePoints: remainingPoints,
          });

          return Response.json({ code, dollarsOff, remainingPoints });
        } catch (error) {
          console.error("Points redemption failed:", error);
          return Response.json({ error: "Could not redeem points right now." }, { status: 500 });
        }
      },
    },
  },
});
