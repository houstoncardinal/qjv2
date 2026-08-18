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
    perks: ["1 point per $1 spent", "Birthday gift", "Early access to restocks"],
  },
  {
    key: "gold",
    name: "Gold Circle",
    swatch: "Gold",
    threshold: 500,
    multiplier: 1.25,
    perks: ["1.25× points", "Free express shipping", "Complimentary resizing"],
  },
  {
    key: "rose",
    name: "Rose Circle",
    swatch: "Rose Gold",
    threshold: 1500,
    multiplier: 1.5,
    perks: ["1.5× points", "Priority atelier support", "Annual cleaning kit"],
  },
  {
    key: "black",
    name: "Black Diamond",
    swatch: "Black",
    threshold: 3500,
    multiplier: 2,
    perks: ["2× points", "Private styling appointments", "First look at drops"],
  },
];

export const POINTS_PER_DOLLAR = 1;
/** 100 points = $5 store credit at redemption. */
export const POINTS_PER_DOLLAR_CREDIT = 20;

export interface RewardsSummary {
  lifetimePoints: number;
  lifetimeSpend: number;
  orderCount: number;
  tier: RewardTier;
  nextTier: RewardTier | null;
  pointsToNextTier: number;
  tierProgress: number; // 0..1
  creditValue: number; // redeemable USD
}

export function tierForPoints(points: number): RewardTier {
  return [...TIERS].reverse().find((t) => points >= t.threshold) ?? (TIERS[0] as RewardTier);
}

export function summarizeRewards(orders: CustomerOrder[]): RewardsSummary {
  const paid = orders.filter((o) => (o.financialStatus ?? "").toUpperCase() !== "REFUNDED");
  const lifetimeSpend = paid.reduce((sum, o) => sum + parseFloat(o.totalPrice.amount || "0"), 0);
  const basePoints = Math.floor(lifetimeSpend * POINTS_PER_DOLLAR);
  const tier = tierForPoints(basePoints);
  const lifetimePoints = Math.floor(basePoints * tier.multiplier);
  const currentTier = tierForPoints(lifetimePoints);
  const idx = TIERS.findIndex((t) => t.key === currentTier.key);
  const nextTier = TIERS[idx + 1] ?? null;
  const span = nextTier ? nextTier.threshold - currentTier.threshold : 1;
  const tierProgress = nextTier
    ? Math.min(1, Math.max(0, (lifetimePoints - currentTier.threshold) / span))
    : 1;

  return {
    lifetimePoints,
    lifetimeSpend,
    orderCount: paid.length,
    tier: currentTier,
    nextTier,
    pointsToNextTier: nextTier ? Math.max(0, nextTier.threshold - lifetimePoints) : 0,
    tierProgress,
    creditValue: Math.floor(lifetimePoints / POINTS_PER_DOLLAR_CREDIT),
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
