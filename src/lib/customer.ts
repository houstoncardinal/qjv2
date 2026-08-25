import { storefrontApiRequest } from "@/lib/shopify";

/**
 * Shopify-hosted customer account surfaces.
 * The store uses Shopify's new customer accounts on its own subdomain, so every
 * hosted link points there (passwordless login also covers registration).
 */
export const SHOPIFY_ACCOUNTS_ORIGIN = "https://account.qureshijewelers.com";

export const SHOPIFY_ACCOUNT_URLS = {
  login: SHOPIFY_ACCOUNTS_ORIGIN,
  register: SHOPIFY_ACCOUNTS_ORIGIN,
  account: `${SHOPIFY_ACCOUNTS_ORIGIN}/profile`,
  orders: `${SHOPIFY_ACCOUNTS_ORIGIN}/orders`,
} as const;


export interface CustomerOrderLine {
  title: string;
  quantity: number;
  imageUrl: string | null;
}

export interface CustomerOrder {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  statusUrl: string;
  totalPrice: { amount: string; currencyCode: string };
  lineItems: CustomerOrderLine[];
}

export interface CustomerAddress {
  id: string;
  formatted: string[];
}

export interface CustomerProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  createdAt: string;
  defaultAddress: CustomerAddress | null;
  orders: CustomerOrder[];
}

export interface ShopifyUserError {
  field: string[] | null;
  message: string;
}

const CUSTOMER_QUERY = `
  query Customer($token: String!) {
    customer(customerAccessToken: $token) {
      id
      firstName
      lastName
      email
      phone
      createdAt
      defaultAddress { id formatted }
      orders(first: 30, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            statusUrl
            totalPrice { amount currencyCode }
            lineItems(first: 20) {
              edges { node { title quantity variant { image { url } } } }
            }
          }
        }
      }
    }
  }
`;

const LOGIN_MUTATION = `
  mutation Login($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken { accessToken expiresAt }
      customerUserErrors { field message }
    }
  }
`;

const REGISTER_MUTATION = `
  mutation Register($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer { id email }
      customerUserErrors { field message }
    }
  }
`;

const RECOVER_MUTATION = `
  mutation Recover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors { field message }
    }
  }
`;

const LOGOUT_MUTATION = `
  mutation Logout($token: String!) {
    customerAccessTokenDelete(customerAccessToken: $token) {
      deletedAccessToken
      userErrors { field message }
    }
  }
`;

const UPDATE_MUTATION = `
  mutation UpdateCustomer($token: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $token, customer: $customer) {
      customer { id firstName lastName email phone }
      customerUserErrors { field message }
    }
  }
`;

export const ACCOUNTS_DISABLED_MESSAGE =
  "Customer accounts aren't switched on for this store yet. Enable customer account access for the Storefront API in your Shopify admin and sign-in will start working instantly.";

function isScopeError(err: unknown) {
  return err instanceof Error && /access scope|Access denied/i.test(err.message);
}

/** Runs a storefront call and converts Shopify scope errors into a readable message. */
async function customerRequest(query: string, variables: Record<string, unknown>) {
  try {
    return await storefrontApiRequest(query, variables);
  } catch (err) {
    if (isScopeError(err)) throw new Error(ACCOUNTS_DISABLED_MESSAGE);
    throw err;
  }
}

function firstError(errors: ShopifyUserError[] | undefined): string | null {
  return errors && errors.length > 0 ? (errors[0]?.message ?? "Something went wrong.") : null;
}


export async function loginCustomer(email: string, password: string) {
  const data = await customerRequest(LOGIN_MUTATION, { input: { email, password } });
  const payload = data?.data?.customerAccessTokenCreate;
  const error = firstError(payload?.customerUserErrors);
  if (error) return { token: null, expiresAt: null, error };
  const token = payload?.customerAccessToken;
  if (!token) return { token: null, expiresAt: null, error: "Incorrect email or password." };
  return { token: token.accessToken as string, expiresAt: token.expiresAt as string, error: null };
}

export async function registerCustomer(input: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  acceptsMarketing?: boolean;
}) {
  const data = await customerRequest(REGISTER_MUTATION, { input });
  const error = firstError(data?.data?.customerCreate?.customerUserErrors);
  return { error };
}

export async function recoverCustomer(email: string) {
  const data = await customerRequest(RECOVER_MUTATION, { email });
  return { error: firstError(data?.data?.customerRecover?.customerUserErrors) };
}

export async function logoutCustomer(token: string) {
  try {
    await customerRequest(LOGOUT_MUTATION, { token });
  } catch {
    /* token already invalid — local sign-out is enough */
  }
}

export async function updateCustomer(
  token: string,
  customer: { firstName?: string; lastName?: string; phone?: string; email?: string },
) {
  const data = await customerRequest(UPDATE_MUTATION, { token, customer });
  return { error: firstError(data?.data?.customerUpdate?.customerUserErrors) };
}

export async function fetchCustomer(token: string): Promise<CustomerProfile | null> {
  const data = await customerRequest(CUSTOMER_QUERY, { token });
  const c = data?.data?.customer;
  if (!c) return null;

  const orders: CustomerOrder[] = (c.orders?.edges ?? []).map(
    (e: {
      node: {
        id: string;
        orderNumber: number;
        processedAt: string;
        financialStatus: string | null;
        fulfillmentStatus: string | null;
        statusUrl: string;
        totalPrice: { amount: string; currencyCode: string };
        lineItems: {
          edges: Array<{
            node: { title: string; quantity: number; variant: { image: { url: string } | null } | null };
          }>;
        };
      };
    }) => ({
      id: e.node.id,
      orderNumber: e.node.orderNumber,
      processedAt: e.node.processedAt,
      financialStatus: e.node.financialStatus,
      fulfillmentStatus: e.node.fulfillmentStatus,
      statusUrl: e.node.statusUrl,
      totalPrice: e.node.totalPrice,
      lineItems: (e.node.lineItems?.edges ?? []).map((l) => ({
        title: l.node.title,
        quantity: l.node.quantity,
        imageUrl: l.node.variant?.image?.url ?? null,
      })),
    }),
  );

  return {
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    phone: c.phone,
    createdAt: c.createdAt,
    defaultAddress: c.defaultAddress ?? null,
    orders,
  };
}


/**
 * Detects whether this storefront token is allowed to run customer mutations
 * (`unauthenticated_write_customers`). When it is not, the UI falls back to
 * Shopify-hosted customer accounts so sign-in still works against the store.
 */
let accountsEnabledCache: boolean | null = null;

export async function checkAccountsEnabled(): Promise<boolean> {
  if (accountsEnabledCache !== null) return accountsEnabledCache;
  try {
    await storefrontApiRequest(LOGIN_MUTATION, {
      input: { email: "storefront-probe@example.invalid", password: "probe-password" },
    });
    accountsEnabledCache = true;
  } catch (err) {
    accountsEnabledCache = !isScopeError(err);
  }
  return accountsEnabledCache;
}

/**
 * Opens a Shopify-hosted account URL as a real top-level navigation.
 * Shopify sends `X-Frame-Options: DENY`, so if the app is running inside a
 * frame (Lovable preview, an embed) an in-frame load fails with
 * ERR_BLOCKED_BY_RESPONSE. Try a new tab first, then break out of the frame.
 */
export function openShopifyAccount(url: string) {
  if (typeof window === "undefined") return;
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (win) return;
  try {
    if (window.top && window.top !== window.self) {
      window.top.location.href = url;
      return;
    }
  } catch {
    /* cross-origin parent — fall through to same-frame navigation */
  }
  window.location.href = url;
}
