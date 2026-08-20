import { cn } from "@/lib/utils";

/** A round-brilliant moissanite/diamond, viewed top-down — used to compare stone sizes. */
export function DiamondFace({
  size,
  selected = false,
  unavailable = false,
  className,
}: {
  size: number;
  selected?: boolean;
  unavailable?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "metal-swatch diamond-face relative inline-block shrink-0 rounded-full",
        selected && "metal-swatch-selected",
        unavailable && "opacity-40 saturate-50",
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}
