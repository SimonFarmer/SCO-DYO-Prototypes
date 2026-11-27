import type { ReactNode } from "react"
import { InfoIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

/** A line in the popover: "SETTING" over "Timeless Solitaire Engagement Ring ..... $690". */
export interface PriceExplainedRow {
  label: string
  name: ReactNode
  /** Left out where there's no price yet (the stone before step 2). */
  price?: string
}

/**
 * "Price explained" link and popover (Figma 7336:167016, the Diamond Quickview's): one row per part (caps label,
 * then its name and price), a rule, then the Ring Total. Opens on hover; click or tap still works. Every Price
 * Explained popover uses it (Diamond Quickview and PDP, Settings PDP, the accordion's ring total), so they match.
 */
export function PriceExplainedPopover({
  rows,
  total,
  totalLabel = "Ring Total:",
  align,
}: {
  rows: PriceExplainedRow[]
  total: string
  totalLabel?: string
  align?: "start" | "center" | "end"
}) {
  return (
    <Popover>
      <PopoverTrigger openOnHover delay={100} render={<Button variant="link" className="h-auto gap-0.5 px-0" />}>
        Price explained
        <InfoIcon />
      </PopoverTrigger>
      {/* Figma: 302px wide — closest width token is w-80 (320px). */}
      <PopoverContent align={align} className="flex w-80 flex-col gap-3">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-0.75">
            <p className="type-label-xs font-semibold text-primary">{row.label}</p>
            <div className="flex items-start gap-2 text-xs">
              <p className="flex-1 tracking-[0.12px] text-muted-foreground">{row.name}</p>
              {row.price && <p className="font-semibold whitespace-nowrap text-primary">{row.price}</p>}
            </div>
          </div>
        ))}
        <Separator className="bg-muted" />
        <div className="flex items-start gap-2 text-sm font-semibold text-primary">
          <p className="flex-1">{totalLabel}</p>
          <p className="whitespace-nowrap">{total}</p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
