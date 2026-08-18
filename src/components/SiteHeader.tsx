import { Link } from "@tanstack/react-router";
import { Menu, Search, Sparkles, User } from "lucide-react";
import { useEffect, useState } from "react";
import { CartDrawer } from "@/components/CartDrawer";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

export const navLinks: Array<{ label: string; q?: string }> = [
  { label: "Shop All" },
  { label: "Chains", q: "product_type:necklace" },
  { label: "Bracelets", q: "product_type:bracelet" },
  { label: "Earrings", q: "product_type:earring" },
  { label: "Rings", q: "product_type:ring" },
];

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


          <Link to="/" aria-label="Qureshi Jewelers — home" className="flex shrink-0 flex-col leading-none">
            <span className="font-display text-2xl tracking-[0.02em] text-foreground">Qureshi</span>
            <span className="mt-0.5 text-[7px] uppercase tracking-[0.5em] text-muted-foreground">
              Jewelers
            </span>
          </Link>

          <nav aria-label="Primary" className="mx-auto hidden items-center gap-8 lg:flex">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to="/shop"
                search={l.q ? { q: l.q } : {}}
                className="py-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/craftsmanship"
              className="py-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              Our Craft
            </Link>
            <Link
              to="/rewards"
              className="flex items-center gap-1.5 py-2 text-[10px] uppercase tracking-[0.22em] text-[var(--gold)] transition-opacity hover:opacity-75"
              activeProps={{ className: "opacity-100" }}
            >
              <Sparkles aria-hidden="true" className="h-3 w-3" /> Rewards
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
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to="/shop"
                search={l.q ? { q: l.q } : {}}
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-3.5 text-[10px] uppercase tracking-[0.24em] text-muted-foreground"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/craftsmanship"
              onClick={() => setOpen(false)}
              className="border-b border-border/60 py-3.5 text-[10px] uppercase tracking-[0.24em] text-muted-foreground"
            >
              Our Craft
            </Link>
            <Link
              to="/rewards"
              onClick={() => setOpen(false)}
              className="border-b border-border/60 py-3.5 text-[10px] uppercase tracking-[0.24em] text-[var(--gold)]"
            >
              Rewards
            </Link>
            <Link
              to="/account"
              onClick={() => setOpen(false)}
              className="py-3.5 text-[10px] uppercase tracking-[0.24em] text-muted-foreground"
            >
              {signedIn ? "My account" : "Sign in"}
            </Link>
          </nav>


        </div>
      </div>
    </header>
  );
}
