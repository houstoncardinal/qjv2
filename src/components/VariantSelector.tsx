import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { ShopifyProduct } from "@/lib/shopify";
import {
  MetalSwatch,
  METAL_SUBTITLE,
  metalKey,
  isMetalOptionName,
} from "@/components/MetalSwatch";

type Variant = ShopifyProduct["node"]["variants"]["edges"][number]["node"];

function metalSub(value: string): string {
  return METAL_SUBTITLE[metalKey(value)];
}

function optionKind(name: string): "metal" | "size" | "measure" | "plain" {
  const n = name.toLowerCase();
  if (isMetalOptionName(n)) return "metal";
  if (/size/.test(n)) return "size";
  if (/length|width|carat|ct|inch|chain|diameter|mm/.test(n)) return "measure";
  return "plain";
}

export function prettyValue(value: string) {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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
                  {prettyValue(active)}
                </p>
              )}
            </div>

            {kind === "metal" ? (
              <div className="mt-3.5 grid gap-2.5 sm:grid-cols-3">
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
                        "group relative flex items-center gap-3 border px-3.5 py-3 text-left transition-all duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                        selected
                          ? "border-foreground bg-secondary/60 shadow-[var(--shadow-soft)]"
                          : "border-border bg-card hover:-translate-y-0.5 hover:border-foreground/40 hover:shadow-[var(--shadow-soft)]",
                        !available && "opacity-55",
                      )}
                    >
                      <MetalSwatch
                        value={value}
                        size="md"
                        selected={selected}
                        unavailable={!available}
                        className="transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-[10px] uppercase tracking-[0.16em] text-foreground">
                          {prettyValue(value)}
                        </span>
                        <span className="mt-0.5 block text-[9px] tracking-wide text-muted-foreground">
                          {available ? metalSub(value) : "Sold out"}
                        </span>
                      </span>
                      {selected && (
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-0 bottom-0 h-[2px] tier-bar"
                        />
                      )}
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
                      <span className="max-w-full truncate px-1 text-xs tracking-wide">{prettyValue(value)}</span>
                      <span
                        className={cn(
                          "text-[7px] uppercase tracking-[0.18em]",
                          selected ? "text-background/60" : "text-muted-foreground",
                        )}
                      >
                        <span className="block truncate px-1">{option.name}</span>
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
                        "max-w-full break-words border px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] transition-all duration-300",
                        selected
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-card text-foreground/80 hover:border-foreground/45",
                        !available && "text-muted-foreground line-through opacity-45",
                      )}
                    >
                      {prettyValue(value)}
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
