import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
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

function optionKind(name: string): "metal" | "size" | "measure" | "plain" {
  const n = name.toLowerCase();
  if (/colou?r|metal|plating|finish|tone/.test(n)) return "metal";
  if (/size/.test(n)) return "size";
  if (/length|width|carat|ct|inch|chain|diameter/.test(n)) return "measure";
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
        (o) => o.values.length > 0 && o.name.toLowerCase() !== "title" && o.values[0] !== "Default Title",
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
    <div className="space-y-8">
      {options.map((option) => {
        const kind = optionKind(option.name);
        const active = selection[option.name];

        return (
          <div key={option.name}>
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-[10px] uppercase tracking-[0.34em] text-muted-foreground">
                {option.name}
              </p>
              {active && (
                <p className="text-xs tracking-wide text-foreground/70">{active}</p>
              )}
            </div>

            {kind === "metal" ? (
              <div className="mt-4 flex flex-wrap gap-3">
                {option.values.map((value) => {
                  const swatch = metalSwatch(value);
                  const selected = active === value;
                  const available = isValueAvailable(option.name, value);
                  return (
                    <button
                      key={value}
                      type="button"
                      title={value}
                      aria-label={`${option.name}: ${value}`}
                      aria-pressed={selected}
                      onClick={() => setSelection((s) => ({ ...s, [option.name]: value }))}
                      className={cn(
                        "group relative h-11 w-11 rounded-full p-[3px] transition-all duration-300",
                        selected
                          ? "ring-1 ring-foreground/70 ring-offset-2 ring-offset-background"
                          : "ring-1 ring-border hover:ring-foreground/30",
                        !available && "opacity-40",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-full w-full items-center justify-center rounded-full shadow-inner",
                          swatch ??
                            "bg-secondary text-[10px] uppercase tracking-widest text-foreground/60",
                        )}
                      >
                        {!swatch && value.slice(0, 2)}
                        {selected && swatch && (
                          <Check className="h-4 w-4 text-[oklch(0.2_0.01_60)] drop-shadow" />
                        )}
                      </span>
                      {!available && (
                        <span className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(to_top_right,transparent_47%,currentColor_48%,currentColor_52%,transparent_53%)] text-foreground/40" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div
                className={cn(
                  "mt-4 flex flex-wrap gap-2",
                  kind === "size" && "gap-2",
                )}
              >
                {option.values.map((value) => {
                  const selected = active === value;
                  const available = isValueAvailable(option.name, value);
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setSelection((s) => ({ ...s, [option.name]: value }))}
                      className={cn(
                        "relative overflow-hidden border px-4 text-xs tracking-[0.14em] transition-all duration-300",
                        kind === "size"
                          ? "h-11 min-w-11 rounded-full"
                          : "h-11 rounded-full",
                        selected
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-[var(--glass-bg)] text-foreground/75 backdrop-blur hover:border-foreground/40",
                        !available && "text-muted-foreground line-through opacity-50",
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
