import { useState, type ReactNode } from "react"
import { CaretLeftIcon } from "@phosphor-icons/react"
import { DiamondQuickview } from "@/components/diamond/diamond-quickview"
import { Button } from "@/components/ui/button"
import { RadioGroup } from "@/components/ui/radio-group"
import { stoneTitle, toQuickviewDiamond, type StonePick } from "@/data/stones"
import { PickTile, pickHeadline } from "@/flow/stone/recommendations-page"

/**
 * Full-flow study · Flow B: the recommendations inside the Stone step of the accordion, in place of the drawer. The
 * step-by-step flow's page (FlowStoneRecommendations) in the panel: Edit preferences, the heading and what the
 * picks are based on, Test 2's headline tiles stacked with one selected, then Select and View All. The panel's
 * price box shows the selected stone, so there is no separate Ring Summary.
 */
export function InlineRecommendations({
  picks,
  selected,
  onChoose,
  heading,
  basis,
  bySize,
  onEditPreferences,
  onSelect,
  onFullDetails,
  viewAll,
}: {
  picks: StonePick[]
  selected: StonePick | null
  onChoose: (kind: StonePick["kind"]) => void
  /** "Round Natural Diamonds" */
  heading: string
  /** "Based on your preferred size of 1.00 ct …" */
  basis: ReactNode
  /** Carat first (or outside the budget): the biggest pick is "near your preferred size". */
  bySize: boolean
  onEditPreferences: () => void
  onSelect: (pick: StonePick) => void
  /** Quickview's Full Details: the Diamond PDP. */
  onFullDetails: (pick: StonePick) => void
  /** The View All button, as the preferences show it (guarded in part 2). */
  viewAll: ReactNode
}) {
  const [quickview, setQuickview] = useState<StonePick | null>(null)
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      <div className="flex flex-col gap-4.5">
        <button
          type="button"
          onClick={onEditPreferences}
          className="flex h-6 cursor-pointer items-center gap-0.5 self-start type-label-xs text-primary underline"
        >
          <CaretLeftIcon className="size-4" />
          Edit preferences
        </button>
        <div className="flex flex-col gap-2">
          <h2 className="type-h4 text-primary">{heading}</h2>
          {basis}
        </div>
      </div>
      {selected ? (
        <RadioGroup value={selected.kind} onValueChange={(v) => onChoose(v as StonePick["kind"])} aria-label="Recommended stones" className="gap-2">
          {picks.map((p) => (
            <PickTile
              key={p.kind}
              pick={p}
              selected={p.kind === selected.kind}
              onSelect={() => onChoose(p.kind)}
              onDetails={() => setQuickview(p)}
              headline={pickHeadline(p, bySize)}
            />
          ))}
        </RadioGroup>
      ) : (
        <div className="flex flex-col gap-2 bg-bg-input-50 p-4">
          <p className="type-h5 text-primary">No stones match these preferences</p>
          <p className="text-xs leading-4 text-muted-foreground">Edit your preferences to see recommendations.</p>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Button className="w-full" disabled={!selected} onClick={() => selected && onSelect(selected)}>
          Select this Diamond
        </Button>
        {viewAll}
      </div>
      <DiamondQuickview
        diamond={quickview && toQuickviewDiamond(quickview.stone)}
        title={quickview ? stoneTitle(quickview.stone) : undefined}
        onOpenChange={(o) => !o && setQuickview(null)}
        onSelect={() => {
          const picked = quickview
          setQuickview(null)
          if (picked) onSelect(picked)
        }}
        onViewDetails={() => {
          const picked = quickview
          setQuickview(null)
          if (picked) onFullDetails(picked)
        }}
      />
    </div>
  )
}
