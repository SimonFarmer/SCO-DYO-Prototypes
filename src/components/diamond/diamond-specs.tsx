import { Fragment } from "react"
import type { Diamond } from "@/data/diamonds"
import { cn } from "@/lib/utils"

export type SpecKey = "carat" | "cut" | "color" | "clarity"
export type SpecLayout = "tiles" | "list"

const LABEL: Record<SpecKey, string> = { carat: "Carat", cut: "Cut", color: "Color", clarity: "Clarity" }

function specValue(diamond: Diamond, key: SpecKey) {
  return key === "carat" ? `${diamond.carat.toFixed(2)} ct` : diamond[key]
}

/**
 * Vertical spec table (Figma “Product Details List” / “Spec List” rows): 48px rows,
 * semibold label left, value right, input-colour dividers between rows.
 */
export function SpecList({ diamond, order, className }: { diamond: Diamond; order: SpecKey[]; className?: string }) {
  return (
    <dl className={cn("flex flex-col", className)}>
      {order.map((key, i) => (
        <div
          key={key}
          className={cn("flex h-12 items-center justify-between gap-4 px-3", i < order.length - 1 && "border-b border-border-subtle")}
        >
          <dt className="text-sm font-semibold text-foreground">{LABEL[key]}</dt>
          <dd className="text-sm font-medium text-primary">{specValue(diamond, key)}</dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * Horizontal spec tiles (Figma Specs Row “Grid / Cells”): four equal cells with a left
 * divider, Label XS name over the value.
 */
export function SpecTiles({ diamond, order, className }: { diamond: Diamond; order: SpecKey[]; className?: string }) {
  return (
    <dl className={cn("grid grid-cols-4", className)}>
      {order.map((key) => (
        <div key={key} className="flex min-w-0 flex-col gap-1.5 border-l border-border-subtle p-3">
          <dt className="type-label-xs font-semibold text-primary">{LABEL[key]}</dt>
          <dd className="text-sm font-semibold text-foreground">{specValue(diamond, key)}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Compact spec trio on the GLP tile (Clarity | Color | Cut). */
export function TileSpecs({ diamond }: { diamond: Diamond }) {
  const items: SpecKey[] = ["clarity", "color", "cut"]
  return (
    <dl className="flex items-start gap-2">
      {items.map((key, i) => (
        <Fragment key={key}>
          {i > 0 && <span aria-hidden className="h-8 w-px shrink-0 bg-border-subtle" />}
          <div className="flex min-w-16 flex-1 flex-col gap-1 py-0.5">
            {/* Figma: 10px medium label — closest token is text-xxs (11px). */}
            <dt className="text-xxs leading-3 font-medium text-muted-foreground">{LABEL[key]}</dt>
            <dd className="text-xxs leading-3 font-semibold tracking-[0.5px] text-primary">{specValue(diamond, key)}</dd>
          </div>
        </Fragment>
      ))}
    </dl>
  )
}
