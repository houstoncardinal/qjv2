import { Link } from "@tanstack/react-router";
import { ChevronDown, Layers, Menu, Search, Sparkles, User } from "lucide-react";
import { useEffect, useState } from "react";
import { CartDrawer } from "@/components/CartDrawer";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

const shopLinks: Array<{ label: string; q?: string }> = [
  { label: "Shop All" },
  { label: "Rings", q: "product_type:ring" },
  { label: "Chains", q: "product_type:necklace" },
  { label: "Bracelets", q: "product_type:bracelet" },
  { label: "Earrings", q: "product_type:earring" },
];

const navLinkClass =
  "py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:text-[var(--gold)]";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const token = useAuthStore((s) => s.token);

  // Read persisted auth after hydration to avoid SSR mismatch.
  useEffect(() => {
    setSignedIn(useAuthStore.getState().isAuthenticated());
  }, [token]);

  return (
    <header className="sticky top-0 z-50">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="bg-foreground py-2 text-center">
        <p className="text-[9px] uppercase tracking-[0.32em] text-background/90">
          Free U.S. shipping over $100 · 14-day returns · GRA certified moissanite
        </p>
      </div>

      <div className="glass border-x-0 border-t-0">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-5 sm:px-8">
          <button
            type="button"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
            className="-ml-1 grid h-11 w-11 place-items-center text-foreground lg:hidden"
          >
            <Menu aria-hidden="true" className="h-5 w-5" />
          </button>

          <Link to="/" aria-label="Qureshi Jewelers — home" className="flex shrink-0 items-center">
            <img
              src="/QURESHIJEWELERSLOGO.png"
              alt="Qureshi Jewelers"
              className="h-8 w-auto sm:h-9"
            />
          </Link>

          <nav aria-label="Primary" className="mx-auto hidden items-center gap-9 lg:flex">
            <div className="group relative">
              <Link
                to="/shop"
                className={cn(navLinkClass, "flex items-center gap-1.5")}
                activeProps={{ className: "text-[var(--gold)]" }}
              >
                Shop
                <ChevronDown
                  aria-hidden="true"
                  className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
                />
              </Link>
              <div className="invisible absolute left-1/2 top-full z-50 w-48 -translate-x-1/2 translate-y-1 border border-border bg-card opacity-0 shadow-lg transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                {shopLinks.map((l) => (
                  <Link
                    key={l.label}
                    to="/shop"
                    search={l.q ? { q: l.q } : {}}
                    className="block px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-secondary hover:text-[var(--gold)]"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              to="/craftsmanship"
              className={navLinkClass}
              activeProps={{ className: "text-[var(--gold)]" }}
            >
              Our Craft
            </Link>
            <Link
              to="/about"
              className={navLinkClass}
              activeProps={{ className: "text-[var(--gold)]" }}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={navLinkClass}
              activeProps={{ className: "text-[var(--gold)]" }}
            >
              Contact
            </Link>
            <Link
              to="/bundle"
              className="flex items-center gap-1.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--gold)] transition-opacity hover:opacity-75"
              activeProps={{ className: "opacity-100" }}
            >
              <Layers aria-hidden="true" className="h-3.5 w-3.5" /> Build a Bundle
            </Link>
            <Link
              to="/rewards"
              className="flex items-center gap-1.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--gold)] transition-opacity hover:opacity-75"
              activeProps={{ className: "opacity-100" }}
            >
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5" /> Rewards
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <Link
              to="/shop"
              aria-label="Search the collection"
              className="hidden h-11 w-11 place-items-center text-foreground/70 transition-colors hover:text-foreground sm:grid"
            >
              <Search aria-hidden="true" className="h-[18px] w-[18px]" />
            </Link>
            <Link
              to="/account"
              aria-label={signedIn ? "Your account and rewards" : "Sign in to your account"}
              className="relative hidden h-11 w-11 place-items-center text-foreground/70 transition-colors hover:text-foreground sm:grid"
            >
              <User aria-hidden="true" className="h-[18px] w-[18px]" />
              {signedIn && (
                <span
                  aria-hidden="true"
                  className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[var(--gold)]"
                />
              )}
            </Link>
            <CartDrawer />
          </div>
        </div>

        <div
          id="mobile-nav"
          className={cn("border-t border-border lg:hidden", open ? "block" : "hidden")}
        >
          <nav aria-label="Mobile" className="mx-auto flex max-w-[1400px] flex-col px-5 py-2">
            <p className="pb-1 pt-3 text-[9px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Shop
            </p>
            {shopLinks.map((l) => (
              <Link
                key={l.label}
                to="/shop"
                search={l.q ? { q: l.q } : {}}
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/craftsmanship"
              onClick={() => setOpen(false)}
              className="border-b border-border/60 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground"
            >
              Our Craft
            </Link>
            <Link
              to="/about"
              onClick={() => setOpen(false)}
              className="border-b border-border/60 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground"
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="border-b border-border/60 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground"
            >
              Contact
            </Link>
            <Link
              to="/bundle"
              onClick={() => setOpen(false)}
              className="border-b border-border/60 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gold)]"
            >
              Build a Bundle
            </Link>
            <Link
              to="/rewards"
              onClick={() => setOpen(false)}
              className="border-b border-border/60 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gold)]"
            >
              Rewards
            </Link>
            <Link
              to="/account"
              onClick={() => setOpen(false)}
              className="py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground"
            >
              {signedIn ? "My account" : "Sign in"}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
