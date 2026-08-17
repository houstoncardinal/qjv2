import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <span className="font-display text-2xl tracking-[0.25em] text-ivory">QURESHI</span>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              GRA-certified D colour VVS1 moissanite set in 18K gold plating over S925 sterling
              silver. Made to be worn every day, made to last a lifetime.
            </p>
          </div>
          <div>
            <p className="eyebrow">Explore</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/shop" className="hover:text-primary">
                  All Jewelry
                </Link>
              </li>
              <li>
                <Link to="/craftsmanship" className="hover:text-primary">
                  Craftsmanship
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="eyebrow">Client Care</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Secure Shopify checkout</li>
              <li>Insured worldwide shipping</li>
              <li>GRA certificate included</li>
            </ul>
          </div>
        </div>
        <div className="mt-14 hairline" />
        <p className="mt-6 text-center text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          © {new Date().getFullYear()} Qureshi Jewelers
        </p>
      </div>
    </footer>
  );
}
