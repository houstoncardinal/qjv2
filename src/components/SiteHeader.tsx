import { Link } from "@tanstack/react-router";
import { Menu, Search, User } from "lucide-react";
import { useState } from "react";
import { CartDrawer } from "@/components/CartDrawer";
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

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-foreground py-2 text-center">
        <p className="text-[9px] uppercase tracking-[0.32em] text-background/90">
          Free shipping on orders over $250 · GRA certified moissanite
        </p>
      </div>

      <div className="glass border-x-0 border-t-0">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-5 sm:px-8">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen((o) => !o)}
            className="-ml-1 grid h-9 w-9 place-items-center text-foreground lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/" className="flex shrink-0 flex-col leading-none">
            <span className="font-display text-2xl tracking-[0.02em] text-foreground">Qureshi</span>
            <span className="mt-0.5 text-[7px] uppercase tracking-[0.5em] text-muted-foreground">
              Jewelers
            </span>
          </Link>

          <nav className="mx-auto hidden items-center gap-8 lg:flex">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to="/shop"
                search={l.q ? { q: l.q } : {}}
                className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/craftsmanship"
              className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              Our Craft
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <Link
              to="/shop"
              aria-label="Search the collection"
              className="hidden h-9 w-9 place-items-center text-foreground/70 transition-colors hover:text-foreground sm:grid"
            >
              <Search className="h-[18px] w-[18px]" />
            </Link>
            <span className="hidden h-9 w-9 place-items-center text-foreground/70 sm:grid">
              <User className="h-[18px] w-[18px]" />
            </span>
            <CartDrawer />
          </div>
        </div>

        <div className={cn("border-t border-border lg:hidden", open ? "block" : "hidden")}>
          <div className="mx-auto flex max-w-[1400px] flex-col px-5 py-2">
            {[...navLinks, { label: "Our Craft" }].map((l) => (
              <Link
                key={l.label}
                to={l.label === "Our Craft" ? "/craftsmanship" : "/shop"}
                search={"q" in l && l.q ? { q: l.q } : {}}
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-3 text-[10px] uppercase tracking-[0.24em] text-muted-foreground last:border-0"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
