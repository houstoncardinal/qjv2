import { SHOPIFY_API_VERSION, SHOPIFY_STORE_PERMANENT_DOMAIN } from "@/lib/shopify";

/**
 * Shopify Admin API access — SERVER-ONLY. Never import this file from client components;
 * it reads `process.env['SHOPIFY_ADMIN_API_TOKEN']`, which must stay off the client bundle.
 * Used exclusively by the rewards-sync webhook (api.webhooks.orders-paid.ts) and the points
 * redemption endpoint (api.rewards.redeem.ts).
 */

const ADMIN_API_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

async function adminApiRequest(query: string, variables: Record<string, unknown> = {}) {
  const token = process.env["SHOPIFY_ADMIN_API_TOKEN"];
  if (!token) throw new Error("SHOPIFY_ADMIN_API_TOKEN is not configured on the server.");

  const response = await fetch(ADMIN_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify Admin API HTTP error: ${response.status}`);
  }

  const data = await response.json();
  if (data.errors) {
    throw new Error(
      `Shopify Admin API error: ${data.errors.map((e: { message: string }) => e.message).join(", ")}`,
    );
  }

  return data;
}

export interface CustomerRewardsState {
  amountSpent: number;
  currencyCode: string;
  lifetimePoints: number;
  availablePoints: number;
}

const REWARDS_STATE_QUERY = `
  query CustomerRewardsState($id: ID!) {
    customer(id: $id) {
      id
      amountSpent { amount currencyCode }
      lifetimePoints: metafield(namespace: "custom", key: "rewards_lifetime_points") { value }
      availablePoints: metafield(namespace: "custom", key: "rewards_available_points") { value }
    }
  }
`;

/** Reads the customer's Shopify-side spend total and current points balances in one round-trip. */
export async function fetchCustomerRewardsState(
  customerGid: string,
): Promise<CustomerRewardsState> {
  const data = await adminApiRequest(REWARDS_STATE_QUERY, { id: customerGid });
  const c = data?.data?.customer;
  return {
    amountSpent: c?.amountSpent?.amount ? parseFloat(c.amountSpent.amount) : 0,
    currencyCode: c?.amountSpent?.currencyCode ?? "USD",
    lifetimePoints: c?.lifetimePoints?.value ? parseInt(c.lifetimePoints.value, 10) : 0,
    availablePoints: c?.availablePoints?.value ? parseInt(c.availablePoints.value, 10) : 0,
  };
}

const METAFIELDS_SET_MUTATION = `
  mutation SetRewardsMetafields($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields { id key value }
      userErrors { field message }
    }
  }
`;

/** Writes tier + both point balances back onto the Shopify customer as metafields. */
export async function setCustomerRewardsMetafields(
  customerGid: string,
  values: { tierKey: string; lifetimePoints: number; availablePoints: number },
): Promise<void> {
  const data = await adminApiRequest(METAFIELDS_SET_MUTATION, {
    metafields: [
      {
        ownerId: customerGid,
        namespace: "custom",
        key: "rewards_tier",
        type: "single_line_text_field",
        value: values.tierKey,
      },
      {
        ownerId: customerGid,
        namespace: "custom",
        key: "rewards_lifetime_points",
        type: "number_integer",
        value: String(values.lifetimePoints),
      },
      {
        ownerId: customerGid,
        namespace: "custom",
        key: "rewards_available_points",
        type: "number_integer",
        value: String(values.availablePoints),
      },
    ],
  });

  const userErrors = data?.data?.metafieldsSet?.userErrors;
  if (userErrors?.length > 0) {
    throw new Error(
      `Failed to set rewards metafields: ${userErrors.map((e: { message: string }) => e.message).join(", ")}`,
    );
  }
}

const DISCOUNT_CODE_CREATE_MUTATION = `
  mutation CreateRedemptionCode($input: DiscountCodeBasicInput!) {
    discountCodeBasicCreate(basicCodeDiscount: $input) {
      codeDiscountNode {
        id
        codeDiscount {
          ... on DiscountCodeBasic {
            codes(first: 1) { nodes { code } }
          }
        }
      }
      userErrors { field message code }
    }
  }
`;

function randomRedemptionCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `CIRCLE-${code}`;
}

/**
 * Creates a single-use, customer-scoped Shopify discount code worth `dollarsOff` — a real
 * Shopify discount, visible under Discounts in Admin, not a locally-fabricated coupon.
 */
export async function createRedemptionDiscountCode(
  customerGid: string,
  dollarsOff: number,
): Promise<string> {
  const code = randomRedemptionCode();

  const data = await adminApiRequest(DISCOUNT_CODE_CREATE_MUTATION, {
    input: {
      title: `Qureshi Circle points redemption — ${code}`,
      code,
      startsAt: new Date().toISOString(),
      customerSelection: { customers: { add: [customerGid] } },
      customerGets: {
        value: { discountAmount: { amount: dollarsOff, appliesOnEachItem: false } },
        items: { all: true },
      },
      appliesOncePerCustomer: true,
      usageLimit: 1,
    },
  });

  const userErrors = data?.data?.discountCodeBasicCreate?.userErrors;
  if (userErrors?.length > 0) {
    throw new Error(
      `Failed to create redemption code: ${userErrors.map((e: { message: string }) => e.message).join(", ")}`,
    );
  }

  const createdCode =
    data?.data?.discountCodeBasicCreate?.codeDiscountNode?.codeDiscount?.codes?.nodes?.[0]?.code;
  if (!createdCode) throw new Error("Shopify did not return a discount code.");
  return createdCode as string;
}
