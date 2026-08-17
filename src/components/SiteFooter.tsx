import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/50">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <span className="font-display text-3xl tracking-[0.3em] text-foreground">QURESHI</span>
            <div className="mt-5 h-px w-16 gold-rule" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              GRA-certified D colour VVS1 moissanite set in 18K gold, rhodium silver and rose gold
              plating over S925 sterling silver. Made to be worn every day, made to last a lifetime.
            </p>
            <div className="mt-7 flex gap-2">
              <span className="h-6 w-6 rounded-full swatch-gold" aria-hidden />
              <span className="h-6 w-6 rounded-full swatch-silver" aria-hidden />
              <span className="h-6 w-6 rounded-full swatch-rose" aria-hidden />
            </div>
          </div>
          <div>
            <p className="eyebrow">Explore</p>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/shop" className="transition-colors hover:text-foreground">
                  All Jewelry
                </Link>
              </li>
              <li>
                <Link to="/craftsmanship" className="transition-colors hover:text-foreground">
                  Craftsmanship
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="eyebrow">Client Care</p>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li>Secure Shopify checkout</li>
              <li>Insured worldwide shipping</li>
              <li>GRA certificate included</li>
              <li>Lifetime craftsmanship warranty</li>
            </ul>
          </div>
        </div>
        <div className="mt-16 hairline" />
        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.34em] text-muted-foreground">
          © {new Date().getFullYear()} Qureshi Jewelers
        </p>
      </div>
    </footer>
  );
}
