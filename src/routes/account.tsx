import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Crown,
  ExternalLink,
  Gift,
  Loader2,
  LogOut,
  Package,
  Sparkles,
  User,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { MetalSwatch } from "@/components/MetalSwatch";
import { useAuthStore } from "@/stores/authStore";
import {
  fetchCustomer,
  loginCustomer,
  logoutCustomer,
  recoverCustomer,
  registerCustomer,
  updateCustomer,
  type CustomerProfile,
} from "@/lib/customer";
import { summarizeRewards, questsFor, TIERS, POINTS_PER_DOLLAR_CREDIT } from "@/lib/rewards";
import { formatMoney } from "@/lib/shopify";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account & Rewards | Qureshi Jewelers" },
      {
        name: "description",
        content:
          "Sign in to track Qureshi Jewelers orders, manage your profile and follow your Qureshi Circle rewards tier and points balance.",
      },
      { property: "og:title", content: "My Account & Rewards | Qureshi Jewelers" },
      {
        property: "og:description",
        content: "Track orders, manage details and earn Qureshi Circle rewards points.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: AccountPage,
});

type Mode = "login" | "register" | "recover";

function AuthPanel() {
  const [mode, setMode] = useState<Mode>("login");
  const setSession = useAuthStore((s) => s.setSession);
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "recover") {
        const { error: err } = await recoverCustomer(form.email);
        if (err) setError(err);
        else toast.success("Reset link sent", { description: form.email, position: "top-center" });
      } else if (mode === "register") {
        const { error: err } = await registerCustomer({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
        });
        if (err) {
          setError(err);
        } else {
          const login = await loginCustomer(form.email, form.password);
          if (login.token) {
            setSession(login.token, login.expiresAt, form.email);
            await queryClient.invalidateQueries({ queryKey: ["customer"] });
            toast.success("Welcome to the Qureshi Circle", { position: "top-center" });
          } else {
            setMode("login");
          }
        }
      } else {
        const login = await loginCustomer(form.email, form.password);
        if (login.error || !login.token) {
          setError(login.error ?? "Incorrect email or password.");
        } else {
          setSession(login.token, login.expiresAt, form.email);
          await queryClient.invalidateQueries({ queryKey: ["customer"] });
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We could not reach the store right now. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-[1560px] gap-10 px-6 py-12 sm:px-10 lg:grid-cols-2 lg:py-16">
      <div>
        <p className="text-[10px] uppercase tracking-[0.42em] text-[var(--gold)]">
          The Qureshi Circle
        </p>
        <h1 className="mt-4 font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
          Your account, orders <span className="italic">and rewards</span>
        </h1>
        <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground">
          One account tracks every order, saves your details for faster checkout and earns points on
          every piece — redeemable as store credit.
        </p>

        <ul className="mt-8 grid gap-px bg-border sm:grid-cols-2">
          {TIERS.map((t) => (
            <li key={t.key} className="bg-card p-5">
              <div className="flex items-center gap-3">
                <MetalSwatch value={t.swatch} size="sm" />
                <p className="text-[10px] uppercase tracking-[0.22em] text-foreground">{t.name}</p>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                From {t.threshold} pts · {t.multiplier}× earning
              </p>
              <p className="mt-1.5 text-[11px] text-muted-foreground">{t.perks[0]}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="glass-panel h-fit p-7 sm:p-9">
        <div className="flex gap-1 border-b border-border pb-4">
          {(["login", "register"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={cn(
                "min-h-11 px-5 text-[10px] uppercase tracking-[0.24em] transition-colors",
                mode === m ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m === "login" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-6 space-y-5">
          {mode === "register" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-[9px] uppercase tracking-[0.24em]">
                  First name
                </Label>
                <Input id="firstName" value={form.firstName} onChange={set("firstName")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-[9px] uppercase tracking-[0.24em]">
                  Last name
                </Label>
                <Input id="lastName" value={form.lastName} onChange={set("lastName")} />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[9px] uppercase tracking-[0.24em]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={set("email")}
            />
          </div>

          {mode !== "recover" && (
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[9px] uppercase tracking-[0.24em]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                minLength={5}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={form.password}
                onChange={set("password")}
              />
            </div>
          )}

          {error && (
            <p role="alert" className="text-[11px] text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" variant="gold" size="lg" className="w-full" disabled={busy}>
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "login" ? (
              "Sign in"
            ) : mode === "register" ? (
              "Create account · +100 pts"
            ) : (
              "Send reset link"
            )}
          </Button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "recover" ? "login" : "recover");
              setError(null);
            }}
            className="w-full text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            {mode === "recover" ? "Back to sign in" : "Forgot your password?"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ customer, token }: { customer: CustomerProfile; token: string }) {
  const clearSession = useAuthStore((s) => s.clearSession);
  const queryClient = useQueryClient();
  const summary = summarizeRewards(customer.orders);
  const quests = questsFor(summary, true);
  const [profile, setProfile] = useState({
    firstName: customer.firstName ?? "",
    lastName: customer.lastName ?? "",
    phone: customer.phone ?? "",
  });

  const save = useMutation({
    mutationFn: () => updateCustomer(token, profile),
    onSuccess: async (res) => {
      if (res.error) toast.error(res.error, { position: "top-center" });
      else {
        toast.success("Details updated", { position: "top-center" });
        await queryClient.invalidateQueries({ queryKey: ["customer"] });
      }
    },
  });

  const signOut = async () => {
    await logoutCustomer(token);
    clearSession();
    queryClient.removeQueries({ queryKey: ["customer"] });
    toast.success("Signed out", { position: "top-center" });
  };

  return (
    <div className="mx-auto max-w-[1560px] px-6 py-12 sm:px-10 lg:py-16">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.42em] text-[var(--gold)]">
            {summary.tier.name}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-[1.05] sm:text-5xl">
            Welcome back{customer.firstName ? `, ${customer.firstName}` : ""}
          </h1>
          <p className="mt-3 text-xs text-muted-foreground">{customer.email}</p>
        </div>
        <Button variant="outline" onClick={signOut} className="min-h-11">
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>

      {/* Rewards */}
      <section className="mt-10 grid gap-px bg-border lg:grid-cols-[1.4fr_1fr]">
        <div className="bg-foreground p-8 text-background sm:p-10">
          <div className="flex items-center gap-3">
            <Crown className="h-4 w-4 text-[var(--gold)]" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-background/70">
              Points balance
            </p>
          </div>
          <p className="mt-5 font-display text-6xl text-[var(--gold)] sm:text-7xl">
            {summary.lifetimePoints.toLocaleString()}
          </p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-background/60">
            Worth ${summary.creditValue} in store credit · {POINTS_PER_DOLLAR_CREDIT} pts = $1
          </p>

          <div className="mt-8">
            <div className="flex items-baseline justify-between text-[10px] uppercase tracking-[0.22em] text-background/70">
              <span>{summary.tier.name}</span>
              <span>{summary.nextTier ? summary.nextTier.name : "Top tier reached"}</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden bg-background/20">
              <div
                className="h-full tier-bar transition-[width] duration-1000"
                style={{ width: `${Math.round(summary.tierProgress * 100)}%` }}
              />
            </div>
            <p className="mt-3 text-[11px] text-background/60">
              {summary.nextTier
                ? `${summary.pointsToNextTier} points to ${summary.nextTier.name}`
                : "You unlocked every Circle benefit."}
            </p>
          </div>

          <ul className="mt-8 grid gap-2 sm:grid-cols-3">
            {summary.tier.perks.map((p) => (
              <li
                key={p}
                className="flex items-start gap-2 bg-background/10 p-3 text-[11px] text-background/80"
              >
                <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-[var(--gold)]" /> {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card p-8 sm:p-10">
          <div className="flex items-center gap-3">
            <Gift className="h-4 w-4 text-[var(--gold)]" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Milestones
            </p>
          </div>
          <ul className="mt-6 space-y-3">
            {quests.map((q) => (
              <li
                key={q.id}
                className={cn(
                  "flex items-center gap-4 border p-4 transition-colors",
                  q.complete ? "border-[var(--gold)]/45 bg-secondary/50" : "border-border bg-card",
                )}
              >
                <span
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full border",
                    q.complete
                      ? "border-transparent bg-foreground text-background"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {q.complete ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <span className="text-[10px]">·</span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] uppercase tracking-[0.18em] text-foreground">
                    {q.label}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">{q.detail}</span>
                </span>
                <span className="shrink-0 text-[9px] uppercase tracking-[0.2em] text-[var(--gold)]">
                  {q.reward}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[11px] leading-relaxed text-muted-foreground">
            Points are calculated from your completed Shopify orders and update automatically after
            each purchase. Contact the atelier to redeem credit at checkout.
          </p>
        </div>
      </section>

      {/* Orders */}
      <section className="mt-12">
        <div className="flex items-center gap-3 border-b border-border pb-5">
          <Package className="h-4 w-4 text-[var(--gold)]" />
          <h2 className="font-display text-3xl">Order history</h2>
          <span className="ml-auto text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {summary.orderCount} order{summary.orderCount === 1 ? "" : "s"} ·{" "}
            {formatMoney(
              summary.lifetimeSpend,
              customer.orders[0]?.totalPrice.currencyCode ?? "USD",
            )}{" "}
            lifetime
          </span>
        </div>

        {customer.orders.length === 0 ? (
          <div className="border border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">No orders yet.</p>
            <Link
              to="/shop"
              className="mt-6 inline-flex min-h-11 items-center gap-2 bg-foreground px-8 py-3.5 text-[10px] uppercase tracking-[0.26em] text-background transition-opacity hover:opacity-85"
            >
              Start shopping <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <ul className="mt-6 grid gap-px bg-border">
            {customer.orders.map((o) => (
              <li key={o.id} className="grid gap-5 bg-card p-6 sm:grid-cols-[auto_1fr_auto]">
                <div className="flex -space-x-3">
                  {o.lineItems
                    .slice(0, 3)
                    .map((l, i) =>
                      l.imageUrl ? (
                        <img
                          key={`${o.id}-${i}`}
                          src={l.imageUrl}
                          alt={l.title}
                          loading="lazy"
                          className="h-16 w-16 border-2 border-card object-cover"
                        />
                      ) : null,
                    )}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-foreground">
                    Order #{o.orderNumber}
                  </p>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {new Date(o.processedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    · {o.fulfillmentStatus?.toLowerCase().replace(/_/g, " ") ?? "processing"} ·{" "}
                    {o.financialStatus?.toLowerCase().replace(/_/g, " ") ?? "pending"}
                  </p>
                  <p className="mt-1.5 line-clamp-1 text-[11px] text-muted-foreground">
                    {o.lineItems.map((l) => `${l.quantity}× ${l.title}`).join(" · ")}
                  </p>
                  <p className="mt-1.5 text-[9px] uppercase tracking-[0.2em] text-[var(--gold)]">
                    +{Math.floor(parseFloat(o.totalPrice.amount))} pts earned
                  </p>
                </div>
                <div className="flex flex-col items-start gap-3 sm:items-end">
                  <p className="font-display text-2xl">
                    {formatMoney(o.totalPrice.amount, o.totalPrice.currencyCode)}
                  </p>
                  <a
                    href={o.statusUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Track order <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Profile */}
      <section className="mt-12 grid gap-px bg-border lg:grid-cols-2">
        <div className="bg-card p-8">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-[var(--gold)]" />
            <h2 className="font-display text-2xl">Your details</h2>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="acc-first" className="text-[9px] uppercase tracking-[0.24em]">
                First name
              </Label>
              <Input
                id="acc-first"
                value={profile.firstName}
                onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acc-last" className="text-[9px] uppercase tracking-[0.24em]">
                Last name
              </Label>
              <Input
                id="acc-last"
                value={profile.lastName}
                onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="acc-phone" className="text-[9px] uppercase tracking-[0.24em]">
                Phone
              </Label>
              <Input
                id="acc-phone"
                value={profile.phone}
                placeholder="+1 555 000 0000"
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
          </div>
          <Button
            variant="gold"
            className="mt-6 min-h-11"
            onClick={() => save.mutate()}
            disabled={save.isPending}
          >
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save details"}
          </Button>
        </div>

        <div className="bg-card p-8">
          <h2 className="font-display text-2xl">Default address</h2>
          {customer.defaultAddress ? (
            <address className="mt-5 space-y-1 not-italic text-sm text-muted-foreground">
              {customer.defaultAddress.formatted.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </address>
          ) : (
            <p className="mt-5 text-sm text-muted-foreground">
              No saved address yet — the address you use at checkout is stored on your Shopify
              account automatically.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function AccountPage() {
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)();
  const clearSession = useAuthStore((s) => s.clearSession);

  const { data, isLoading } = useQuery({
    queryKey: ["customer", token],
    queryFn: async () => {
      const profile = await fetchCustomer(token as string);
      if (!profile) clearSession();
      return profile;
    },
    enabled: Boolean(token) && isAuthenticated,
    staleTime: 15_000,
  });

  return (
    <div className="min-h-screen bg-card">
      <SiteHeader />
      <main id="main-content">
        {!isAuthenticated ? (
          <AuthPanel />
        ) : isLoading ? (
          <div className="mx-auto max-w-[1560px] space-y-5 px-6 py-16 sm:px-10">
            <Skeleton className="h-12 w-72" />
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : data ? (
          <Dashboard customer={data} token={token as string} />
        ) : (
          <AuthPanel />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
