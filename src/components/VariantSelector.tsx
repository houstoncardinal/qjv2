import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { ShopifyProduct } from "@/lib/shopify";

type Variant = ShopifyProduct["node"]["variants"]["edges"][number]["node"];

function metalSwatch(value: string): string | null {
  const v = value.toLowerCase();
  if (/rose|pink/.test(v)) return "swatch-rose";
  if (/yellow gold|gold|champagne|brass/.test(v) && !/white/.test(v)) return "swatch-gold";
  if (/silver|white|platinum|rhodium|steel|s925|sterling/.test(v)) return "swatch-silver";
  if (/black|onyx|gunmetal|noir/.test(v)) return "swatch-ink";
  return null;
}

function metalSub(value: string): string {
  const v = value.toLowerCase();
  if (/rose/.test(v)) return "Warm blush";
  if (/white/.test(v)) return "Rhodium finish";
  if (/gold/.test(v)) return "5× 18K plated";
  if (/silver|sterling|s925/.test(v)) return "Solid S925";
  if (/black/.test(v)) return "Black rhodium";
  return "Premium finish";
}

function optionKind(name: string): "metal" | "size" | "measure" | "plain" {
  const n = name.toLowerCase();
  if (/colou?r|metal|plating|finish|tone/.test(n)) return "metal";
  if (/size/.test(n)) return "size";
  if (/length|width|carat|ct|inch|chain|diameter|mm/.test(n)) return "measure";
  return "plain";
}

export interface VariantSelectorProps {
  product: ShopifyProduct;
  onVariantChange: (variant: Variant | undefined) => void;
}

export function VariantSelector({ product, onVariantChange }: VariantSelectorProps) {
  const node = product.node;
  const variants = useMemo(() => node.variants.edges.map((e) => e.node), [node]);

  const options = useMemo(
    () =>
      (node.options ?? []).filter(
        (o) =>
          o.values.length > 0 &&
          o.name.toLowerCase() !== "title" &&
          o.values[0] !== "Default Title",
      ),
    [node],
  );

  const initial = useMemo(() => {
    const base = variants.find((v) => v.availableForSale) ?? variants[0];
    const map: Record<string, string> = {};
    base?.selectedOptions.forEach((o) => {
      map[o.name] = o.value;
    });
    return map;
  }, [variants]);

  const [selection, setSelection] = useState<Record<string, string>>(initial);

  const matched = useMemo(
    () =>
      variants.find((v) => v.selectedOptions.every((o) => selection[o.name] === o.value)) ??
      variants.find((v) => v.availableForSale) ??
      variants[0],
    [variants, selection],
  );

  useEffect(() => {
    onVariantChange(matched);
  }, [matched, onVariantChange]);

  const isValueAvailable = (name: string, value: string) =>
    variants.some(
      (v) =>
        v.availableForSale &&
        v.selectedOptions.every((o) =>
          o.name === name ? o.value === value : (selection[o.name] ?? o.value) === o.value,
        ),
    );

  if (options.length === 0) return null;

  return (
    <div className="space-y-6">
      {options.map((option) => {
        const kind = optionKind(option.name);
        const active = selection[option.name];
        const select = (value: string) =>
          setSelection((s) => ({ ...s, [option.name]: value }));

        return (
          <div key={option.name}>
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                {option.name}
              </p>
              {active && (
                <p className="text-[10px] uppercase tracking-[0.16em] text-foreground/70">
                  {active}
                </p>
              )}
            </div>

            {kind === "metal" ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {option.values.map((value) => {
                  const swatch = metalSwatch(value);
                  const selected = active === value;
                  const available = isValueAvailable(option.name, value);
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => select(value)}
                      className={cn(
                        "flex flex-col items-center gap-2 border px-3 py-3 transition-all duration-300",
                        selected
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-card text-foreground hover:border-foreground/45",
                        !available && "opacity-45",
                      )}
                    >
                      <span
                        className={cn(
                          "h-4 w-4 rounded-full ring-1 ring-border",
                          swatch ?? "bg-secondary",
                        )}
                      />
                      <span className="text-[9px] uppercase tracking-[0.14em]">{value}</span>
                      <span
                        className={cn(
                          "text-[8px] tracking-wide",
                          selected ? "text-background/60" : "text-muted-foreground",
                        )}
                      >
                        {metalSub(value)}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : kind === "size" ? (
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                {option.values.map((value) => {
                  const selected = active === value;
                  const available = isValueAvailable(option.name, value);
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => select(value)}
                      className={cn(
                        "flex flex-col items-center gap-0.5 border py-2.5 transition-all duration-300",
                        selected
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-card text-foreground hover:border-foreground/45",
                        !available && "text-muted-foreground line-through opacity-45",
                      )}
                    >
                      <span className="text-xs tracking-wide">{value}</span>
                      <span
                        className={cn(
                          "text-[7px] uppercase tracking-[0.18em]",
                          selected ? "text-background/60" : "text-muted-foreground",
                        )}
                      >
                        {option.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const selected = active === value;
                  const available = isValueAvailable(option.name, value);
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => select(value)}
                      className={cn(
                        "border px-5 py-2.5 text-[10px] uppercase tracking-[0.16em] transition-all duration-300",
                        selected
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-card text-foreground/80 hover:border-foreground/45",
                        !available && "text-muted-foreground line-through opacity-45",
                      )}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
