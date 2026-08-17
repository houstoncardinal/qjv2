import { Link } from "@tanstack/react-router";
import { CartDrawer } from "@/components/CartDrawer";

const links = [
  { to: "/", label: "Maison" },
  { to: "/shop", label: "Collection" },
  { to: "/craftsmanship", label: "Craftsmanship" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50">
      <div className="bg-foreground py-2 text-center">
        <p className="text-[9px] uppercase tracking-[0.4em] text-background">
          Complimentary insured shipping · GRA certificate with every piece
        </p>
      </div>
      <div className="glass border-x-0 border-t-0">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <nav className="hidden flex-1 items-center gap-9 md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="relative text-[10px] uppercase tracking-[0.32em] text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <Link to="/" className="flex flex-1 flex-col items-center md:flex-none">
            <span className="font-display text-2xl leading-none tracking-[0.3em] text-foreground">
              QURESHI
            </span>
            <span className="mt-1 text-[8px] uppercase tracking-[0.55em] text-[var(--gold)]">
              Jewelers
            </span>
          </Link>

          <div className="flex flex-1 items-center justify-end gap-2">
            <CartDrawer />
          </div>
        </div>
        <div className="flex justify-center gap-7 pb-3 md:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
