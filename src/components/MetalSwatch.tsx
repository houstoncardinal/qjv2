import { cn } from "@/lib/utils";

export type MetalKey = "gold" | "white-gold" | "silver" | "rose" | "ink" | "two-tone" | "plain";

/** Map any Shopify option value to a metal finish family. */
export function metalKey(value: string): MetalKey {
  const v = value.toLowerCase().replace(/[_\-/]+/g, " ");
  if (/two ?tone|mixed|multi/.test(v)) return "two-tone";
  if (/rose|pink|blush/.test(v)) return "rose";
  if (/white gold|rhodium/.test(v)) return "white-gold";
  if (/black|onyx|gunmetal|noir|obsidian/.test(v)) return "ink";
  if (/gold|champagne|brass|yellow/.test(v)) return "gold";
  if (/silver|platinum|steel|sterling|s925|925/.test(v)) return "silver";
  return "plain";
}


export function isMetalOptionName(name: string) {
  return /colou?r|metal|plating|finish|tone|material/i.test(name);
}

const FACE: Record<MetalKey, string> = {
  gold: "metal-face-gold",
  "white-gold": "metal-face-white-gold",
  silver: "metal-face-silver",
  rose: "metal-face-rose",
  ink: "metal-face-ink",
  "two-tone": "metal-face-two-tone",
  plain: "metal-face-plain",
};

export const METAL_SUBTITLE: Record<MetalKey, string> = {
  gold: "5× 18K plated",
  "white-gold": "Rhodium finish",
  silver: "Solid S925",
  rose: "Warm blush plate",
  ink: "Black rhodium",
  "two-tone": "Mixed finish",
  plain: "Premium finish",
};

const SIZE: Record<"xs" | "sm" | "md" | "lg", string> = {
  xs: "h-3.5 w-3.5",
  sm: "h-5 w-5",
  md: "h-7 w-7",
  lg: "h-9 w-9",
};

/** A single polished metal disc. Purely presentational. */
export function MetalSwatch({
  value,
  size = "sm",
  selected = false,
  unavailable = false,
  className,
}: {
  value: string;
  size?: keyof typeof SIZE;
  selected?: boolean;
  unavailable?: boolean;
  className?: string;
}) {
  const key = metalKey(value);
  return (
    <span
      aria-hidden="true"
      title={value}
      className={cn(
        "metal-swatch relative inline-block shrink-0 rounded-full",
        SIZE[size],
        FACE[key],
        selected && "metal-swatch-selected",
        unavailable && "opacity-40 saturate-50",
        className,
      )}
    />
  );
}

/** Compact swatch row used on product cards. */
export function MetalSwatchRow({
  values,
  max = 4,
  className,
}: {
  values: string[];
  max?: number;
  className?: string;
}) {
  const shown = values.slice(0, max);
  const extra = values.length - shown.length;
  if (shown.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex -space-x-1.5">
        {shown.map((v) => (
          <MetalSwatch
            key={v}
            value={v}
            size="xs"
            className="ring-2 ring-card transition-transform duration-300 hover:z-10 hover:-translate-y-0.5"
          />
        ))}
      </div>
      <span className="text-[8px] uppercase tracking-[0.22em] text-muted-foreground">
        {extra > 0 ? `${values.length} finishes` : shown.length > 1 ? `${shown.length} finishes` : "One finish"}
      </span>
    </div>
  );
}
