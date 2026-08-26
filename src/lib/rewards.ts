import type { CustomerOrder } from "@/lib/customer";

/**
 * The Qureshi Circle — a metal-tiered rewards program.
 * Points and tiers are derived from real Shopify order history, so the
 * numbers a member sees always match what they actually spent.
 */

export interface RewardTier {
  key: "silver" | "gold" | "rose" | "black";
  name: string;
  swatch: string;
  threshold: number; // lifetime points required
  multiplier: number; // points earned per $1
  perks: string[];
}

export const TIERS: RewardTier[] = [
  {
    key: "silver",
    name: "Silver Circle",
    swatch: "Silver",
    threshold: 0,
    multiplier: 1,
    perks: [
      "1 point per $1 spent, redeemable as store credit",
      "A free gift on your birthday, every year",
      "Early access to new restocks before they go public",
    ],
  },
  {
    key: "gold",
    name: "Gold Circle",
    swatch: "Gold",
    threshold: 500,
    multiplier: 1.25,
    perks: [
      "1.25× points on every order, no exceptions",
      "Free express shipping on all U.S. orders",
      "Complimentary ring resizing, anytime",
    ],
  },
  {
    key: "rose",
    name: "Rose Circle",
    swatch: "Rose Gold",
    threshold: 1500,
    multiplier: 1.5,
    perks: [
      "1.5× points on every order",
      "Priority access to atelier support",
      "A free annual cleaning & polish kit",
    ],
  },
  {
    key: "black",
    name: "Black Diamond",
    swatch: "Black",
    threshold: 3500,
    multiplier: 2,
    perks: [
      "2× points on every order, our top rate",
      "Private one-on-one styling appointments",
      "First look at new drops, before anyone else",
    ],
  },
];

export const POINTS_PER_DOLLAR = 1;
/** 100 points = $5 store credit at redemption. */
export const POINTS_PER_DOLLAR_CREDIT = 20;

export interface RewardsSummary {
  /** Cumulative points ever earned — never decreases on redemption, drives tier standing. */
  lifetimePoints: number;
  /** Spendable balance — lifetime points minus whatever has already been redeemed for credit. */
  availablePoints: number;
  lifetimeSpend: number;
  orderCount: number;
  tier: RewardTier;
  nextTier: RewardTier | null;
  pointsToNextTier: number;
  tierProgress: number; // 0..1
  creditValue: number; // availablePoints converted to redeemable USD
}

export function tierForPoints(points: number): RewardTier {
  return [...TIERS].reverse().find((t) => points >= t.threshold) ?? (TIERS[0] as RewardTier);
}

/** Derives tier + next-tier progress from a final lifetime-points balance. */
function progressFromPoints(lifetimePoints: number) {
  const currentTier = tierForPoints(lifetimePoints);
  const idx = TIERS.findIndex((t) => t.key === currentTier.key);
  const nextTier = TIERS[idx + 1] ?? null;
  const span = nextTier ? nextTier.threshold - currentTier.threshold : 1;
  const tierProgress = nextTier
    ? Math.min(1, Math.max(0, (lifetimePoints - currentTier.threshold) / span))
    : 1;
  return { tier: currentTier, nextTier, tierProgress };
}

/**
 * The single source of truth for turning lifetime spend into a tier + points balance.
 * Used both client-side (from the customer's Storefront order history) and server-side
 * (from Shopify's authoritative `Customer.amountSpent`, in the rewards-sync webhook), so
 * the two can never drift apart.
 */
export function computeTierAndPoints(lifetimeSpend: number) {
  const basePoints = Math.floor(lifetimeSpend * POINTS_PER_DOLLAR);
  const provisionalTier = tierForPoints(basePoints);
  const lifetimePoints = Math.floor(basePoints * provisionalTier.multiplier);
  return { lifetimePoints, ...progressFromPoints(lifetimePoints) };
}

export function summarizeRewards(orders: CustomerOrder[]): RewardsSummary {
  const paid = orders.filter((o) => (o.financialStatus ?? "").toUpperCase() !== "REFUNDED");
  const lifetimeSpend = paid.reduce((sum, o) => sum + parseFloat(o.totalPrice.amount || "0"), 0);
  const {
    lifetimePoints,
    tier: currentTier,
    nextTier,
    tierProgress,
  } = computeTierAndPoints(lifetimeSpend);

  return {
    lifetimePoints,
    // No redemption history to subtract before Shopify sync exists — assume nothing spent yet.
    availablePoints: lifetimePoints,
    lifetimeSpend,
    orderCount: paid.length,
    tier: currentTier,
    nextTier,
    pointsToNextTier: nextTier ? Math.max(0, nextTier.threshold - lifetimePoints) : 0,
    tierProgress,
    creditValue: Math.floor(lifetimePoints / POINTS_PER_DOLLAR_CREDIT),
  };
}

/**
 * Overlays Shopify's own synced points (from the rewards-sync webhook's customer metafields)
 * onto a client-computed summary, once available — Shopify's figures become authoritative since
 * they reflect `Customer.amountSpent` plus any redemptions already spent toward past orders.
 * Tier standing is driven by lifetime points (never decreases); the redeemable dollar value is
 * driven by available points (decreases as credit is redeemed).
 */
export function withShopifySync(
  summary: RewardsSummary,
  shopifyLifetimePoints: number,
  shopifyAvailablePoints: number,
): RewardsSummary {
  const { tier, nextTier, tierProgress } = progressFromPoints(shopifyLifetimePoints);
  return {
    ...summary,
    lifetimePoints: shopifyLifetimePoints,
    availablePoints: shopifyAvailablePoints,
    tier,
    nextTier,
    pointsToNextTier: nextTier ? Math.max(0, nextTier.threshold - shopifyLifetimePoints) : 0,
    tierProgress,
    creditValue: Math.floor(shopifyAvailablePoints / POINTS_PER_DOLLAR_CREDIT),
  };
}

/** Milestone quests that unlock as a member shops. */
export interface Quest {
  id: string;
  label: string;
  detail: string;
  reward: string;
  complete: boolean;
}

export function questsFor(summary: RewardsSummary, hasProfile: boolean): Quest[] {
  return [
    {
      id: "join",
      label: "Join the Circle",
      detail: "Create your account",
      reward: "+100 pts",
      complete: hasProfile,
    },
    {
      id: "first-order",
      label: "First piece",
      detail: "Place your first order",
      reward: "+250 pts",
      complete: summary.orderCount >= 1,
    },
    {
      id: "stack",
      label: "Start a stack",
      detail: "Three orders placed",
      reward: "+500 pts",
      complete: summary.orderCount >= 3,
    },
    {
      id: "gold",
      label: "Reach Gold Circle",
      detail: "500 lifetime points",
      reward: "Free express shipping",
      complete: summary.lifetimePoints >= 500,
    },
  ];
}

export const FREE_SHIPPING_THRESHOLD = 100;
