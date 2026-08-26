import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Gift, Sparkles, Star, Ticket, Truck } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { MetalSwatch } from "@/components/MetalSwatch";
import { TIERS, POINTS_PER_DOLLAR_CREDIT } from "@/lib/rewards";
import { SITE_URL, breadcrumbLd } from "@/lib/site";

/**
 * Google's loyalty-program structured data (schema.org MemberProgram / MemberProgramTier) —
 * newer and less common than Product/FAQPage markup, so validate with the Rich Results Test
 * after launch. Tier requirements are points-based, matching how membership actually works here
 * (no paid membership fee).
 */
function memberProgramLd() {
  return {
    "@context": "https://schema.org",
    "@type": "MemberProgram",
    name: "The Qureshi Circle",
    description:
      "Free loyalty program: earn points on every order and unlock metal-tier benefits — faster shipping, complimentary resizing and store credit.",
    hasTiers: TIERS.map((t) => ({
      "@type": "MemberProgramTier",
      name: t.name,
      description: `${t.perks.join(" ")} Redeemable at ${POINTS_PER_DOLLAR_CREDIT} points = $1 credit.`,
      hasTierBenefit: [
        "TierBenefitLoyaltyPoints",
        ...(t.key !== "silver" ? ["TierBenefitLoyaltyShipping"] : []),
      ],
      hasTierRequirement: `${t.threshold}+ lifetime points (${t.multiplier}× earning rate)`,
    })),
  };
}

export const Route = createFileRoute("/rewards")({
  head: () => ({
    meta: [
      { title: "The Qureshi Circle Rewards Program | Qureshi Jewelers" },
      {
        name: "description",
        content:
          "Earn points on every moissanite purchase, unlock Silver, Gold, Rose and Black Diamond tiers, and turn points into store credit with the Qureshi Circle.",
      },
      { property: "og:title", content: "The Qureshi Circle Rewards Program" },
      {
        property: "og:description",
        content: "Points on every order, metal-tier perks and store credit at Qureshi Jewelers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: `${SITE_URL}/rewards` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/rewards` }],
  }),
  component: RewardsPage,
});

const earnWays = [
  { icon: Star, label: "Shop any piece", value: "1 pt per $1" },
  { icon: Gift, label: "Create an account", value: "+100 pts" },
  { icon: Sparkles, label: "First order placed", value: "+250 pts" },
  { icon: Truck, label: "Reach Gold Circle", value: "Free express shipping" },
];

function RewardsPage() {
  return (
    <div className="min-h-screen bg-card">
      <SiteHeader />
      <main id="main-content">
        <section className="relative overflow-hidden bg-foreground py-16 text-background lg:py-20">
          <div className="mx-auto max-w-[1560px] px-6 sm:px-10">
            <p className="text-[10px] uppercase tracking-[0.42em] text-[var(--gold)]">
              Members Only
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1] sm:text-6xl lg:text-7xl">
              The Qureshi Circle
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-background/70">
              Every order earns points. Points unlock metal tiers, and tiers unlock faster shipping,
              complimentary resizing and store credit — {POINTS_PER_DOLLAR_CREDIT} points equals $1.
            </p>
            <Link
              to="/account"
              className="mt-8 inline-flex min-h-11 items-center gap-3 bg-background px-9 py-4 text-[10px] uppercase tracking-[0.26em] text-foreground transition-opacity hover:opacity-85"
            >
              Join free · +100 pts <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="bg-card py-14 lg:py-20">
          <div className="mx-auto max-w-[1560px] px-6 sm:px-10">
            <h2 className="font-display text-4xl sm:text-5xl">Ways to earn</h2>
            <div className="mt-8 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
              {earnWays.map((w) => (
                <div key={w.label} className="bg-card p-7">
                  <w.icon className="h-5 w-5 text-[var(--gold)]" />
                  <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-foreground">
                    {w.label}
                  </p>
                  <p className="mt-2 font-display text-2xl text-[var(--gold)]">{w.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-background py-14 lg:py-20">
          <div className="mx-auto max-w-[1560px] px-6 sm:px-10">
            <h2 className="font-display text-4xl sm:text-5xl">Metal tiers</h2>
            <div className="mt-8 grid gap-px bg-border lg:grid-cols-4">
              {TIERS.map((t) => (
                <div key={t.key} className="bg-card p-7">
                  <MetalSwatch value={t.swatch} size="lg" />
                  <p className="mt-6 font-display text-2xl">{t.name}</p>
                  <p className="mt-1.5 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {t.threshold}+ pts · {t.multiplier}× earning
                  </p>
                  <ul className="mt-5 space-y-2.5">
                    {t.perks.map((p) => (
                      <li
                        key={p}
                        className="flex items-start gap-2 text-[11px] text-muted-foreground"
                      >
                        <Ticket className="mt-0.5 h-3 w-3 shrink-0 text-[var(--gold)]" /> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[11px] text-muted-foreground">
              Points are calculated from completed orders on your account and refresh automatically
              after each purchase.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
      <JsonLd data={memberProgramLd()} />
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", url: "/" },
          { name: "Rewards", url: "/rewards" },
        ])}
      />
    </div>
  );
}
