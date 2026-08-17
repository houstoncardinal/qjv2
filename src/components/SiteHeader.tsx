import { Link } from "@tanstack/react-router";
import { CartDrawer } from "@/components/CartDrawer";

const links = [
  { to: "/", label: "Maison" },
  { to: "/shop", label: "Collection" },
  { to: "/craftsmanship", label: "Craftsmanship" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <nav className="hidden flex-1 items-center gap-9 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Link to="/" className="flex flex-1 flex-col items-center md:flex-none">
          <span className="font-display text-2xl leading-none tracking-[0.25em] text-ivory">
            QURESHI
          </span>
          <span className="mt-1 text-[9px] uppercase tracking-[0.5em] text-primary">Jewelers</span>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-2">
          <CartDrawer />
        </div>
      </div>
      <div className="flex md:hidden justify-center gap-6 pb-3">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground"
            activeProps={{ className: "text-primary" }}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
