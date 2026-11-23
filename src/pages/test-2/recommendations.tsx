import { useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { CaretLeftIcon, XIcon } from "@phosphor-icons/react"
import { EllipsisVertical } from "lucide-react"
import { SectionDivider, StepIntro } from "@/components/dyo/finishing-sections"
import { useNotInTest } from "@/components/prototype/not-in-test"
import { StoneCtas } from "@/components/stones/stone-ctas"
import { Button } from "@/components/ui/button"
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DELIVERY, SETTING } from "@/data/dyo"
import { formatSize, gemById, recommend, stoneImage, stoneShape, stoneSpecs, stoneTitle, stoneType, type SpecKey, type StonePick, type StoneTypeId } from "@/data/stones"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { effectiveShape, useStonePrefs, type StoneSim } from "./preferences"
import { StoneStepLayout } from "./stone-step-layout"
import type { ShopBy } from "./variants"

/**
 * The line under the picks heading that ties them back to the shopper's choices, with the values in bold
 * (Figma 8173:188141): "Based on your preferred size of **2.25 ct** and ring budget of **$3,500 – $7,000**."
 */
function Basis({ shopBy, sim }: { shopBy: ShopBy; sim: StoneSim }) {
  const size = <span className="font-semibold">{formatSize(sim.size, sim.sizes.unit)}</span>
  const budget = <span className="font-semibold">{`${formatPrice(sim.budgetLo)} – ${formatPrice(sim.budgetHi)}`}</span>
  return (
    <p className="text-sm leading-5 font-medium text-muted-foreground">
      {shopBy === "size" ? (
        <>Based on your preferred size of {size}.</>
      ) : shopBy === "budget" ? (
        <>Based on your ring budget of {budget}.</>
      ) : !sim.inBudget ? (
        <>
          Based on your preferred size of {size}, outside your ring budget of {budget}.
        </>
      ) : (
        <>
          Based on your preferred size of {size} and ring budget of {budget}.
        </>
      )}
    </p>
  )
}

/** "Round Natural Diamonds", "Round Lab-Grown Diamonds", "Oval Rubies" */
function picksHeading(type: StoneTypeId, shape: string, gem: string) {
  const shapeName = stoneShape(shape).label
  if (type !== "gemstone") return `${shapeName} ${stoneType(type).plpLabel}`
  const name = gemById(gem).label
  return `${shapeName} ${name.endsWith("y") ? `${name.slice(0, -1)}ies` : `${name}s`}`
}

/**
 * Carat (Size for gemstones) · Clarity · Color · Cut in one row, a divider left of each cell (Figma 8173:188141);
 * the cells this pick optimises are picked out in green.
 */
function SpecStrip({ pick, highlight = true }: { pick: StonePick; /** false: every cell plain (the details overlay) */ highlight?: boolean }) {
  const specs = stoneSpecs(pick.stone)
  const cells: { key: SpecKey; label: string; value: string }[] = [
    pick.stone.type === "gemstone"
      ? { key: "size", label: "Size", value: `${pick.stone.size.toFixed(1)} mm` }
      : { key: "size", label: "Carat", value: `${pick.stone.carat.toFixed(2)} ct` },
    { key: "clarity", label: "Clarity", value: specs.clarity },
    { key: "color", label: "Color", value: specs.color },
    { key: "cut", label: "Cut", value: specs.cut },
  ]
  return (
    <dl className="flex w-full">
      {cells.map((c) => {
        const on = highlight && pick.highlight.includes(c.key)
        return (
          // A divider on the left of every cell; the cells this pick optimises are green (success tokens).
          <div
            key={c.key}
            className={cn(
              "flex min-w-0 flex-1 flex-col gap-1 border-l px-2.5 py-2",
              on ? "border-success/50 bg-success-foreground/50 font-semibold text-success" : "border-border-subtle bg-background",
            )}
          >
            <dt className={cn("text-xxs leading-3 font-semibold tracking-[1px] uppercase", !on && "text-muted-foreground")}>{c.label}</dt>
            <dd className={cn("text-xs leading-4 tabular-nums", !on && "tracking-[0.12px] text-primary")}>{c.value}</dd>
          </div>
        )
      })}
    </dl>
  )
}

/**
 * Pick tile (Figma 8173:188141): photo; the pick and what it's optimized for, with the radio; the 4Cs row;
 * then View details and the stone price. Selection only changes the border.
 */
function PickTile({ pick, selected, onSelect, onDetails }: { pick: StonePick; selected: boolean; onSelect: () => void; onDetails: () => void }) {
  const img = stoneImage(pick.stone)
  return (
    <div
      onClick={onSelect}
      // Phones: the 4Cs pill and price run the full tile width under the photo; from md the photo has its own column.
      className={cn(
        "grid cursor-pointer grid-cols-[--spacing(13.5)_minmax(0,1fr)] items-start gap-x-3 gap-y-4 bg-background md:gap-x-5",
        selected ? "border-2 border-primary p-3.75" : "border border-border-subtle p-4 hover:border-border",
      )}
    >
      <div className="size-13.5 overflow-hidden bg-secondary md:row-span-3">
        {/* Gemstones without a photo: Shane Co.'s ring render, cropped in on the stone. */}
        <img
          src={img.src}
          alt=""
          className={cn("size-full", img.render ? "origin-[50%_30%] scale-[2.4] object-contain" : img.photo ? "object-cover" : "object-contain p-2.5 mix-blend-multiply")}
        />
      </div>
      <div className="flex items-start gap-4 text-primary">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-sm leading-5 font-semibold">{pick.label}</p>
          <p className="text-xs leading-4 tracking-[0.12px]">Optimized for {pick.optimizedFor}</p>
        </div>
        <RadioGroupItem value={pick.kind} aria-label={`${pick.label}: ${stoneTitle(pick.stone)}`} className="border-primary" />
      </div>
      <div className="col-span-2 md:col-span-1 md:col-start-2">
        <SpecStrip pick={pick} />
      </div>
      {/* View details, then the stone price (the ring total is in the Ring Summary below). */}
      <div className="col-span-2 flex items-baseline justify-between gap-3 text-primary md:col-span-1 md:col-start-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDetails()
          }}
          className="shrink-0 cursor-pointer type-label-xs underline"
        >
          View details
        </button>
        <p className="text-sm leading-5 font-semibold whitespace-nowrap">{formatPrice(pick.stone.price)}</p>
      </div>
    </div>
  )
}

/** "Round Natural Diamond", "Oval Ruby": the stone without its size (the 4Cs row carries that). */
function pickName(stone: StonePick["stone"]) {
  const shape = stoneShape(stone.shape).label
  return stone.type === "gemstone" ? `${shape} ${gemById(stone.gem).label}` : `${shape} ${stoneType(stone.type).noun}`
}

/**
 * Pick details overlay (Figma 8197:189137): one image of the stone on the left; on the right the stone, what it's
 * optimized for, the 4Cs, View Full Details · certificate, then the price with the ship date, Select and the
 * "more" menu. The page behind dims to 50% black. Phones stack the image over the details.
 */
function PickDetails({
  pick,
  kind,
  onOpenChange,
  onSelect,
}: {
  pick: StonePick | null
  kind: "Diamond" | "Gemstone"
  onOpenChange: (open: boolean) => void
  onSelect: () => void
}) {
  const notInTest = useNotInTest()
  const img = pick ? stoneImage(pick.stone) : null
  return (
    <Dialog open={pick !== null} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/50 supports-backdrop-filter:backdrop-blur-none" />
        <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto bg-background text-primary outline-none duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 md:w-230 md:grid-cols-2">
          {pick && img && (
            <>
              {/* A single image of the stone, whatever else it has (the face-up photo, or the ring render). */}
              <div className="relative aspect-square bg-secondary">
                <img
                  src={img.src}
                  alt={`${stoneTitle(pick.stone)}, face up`}
                  className={cn("absolute inset-0 size-full", img.render ? "object-contain mix-blend-multiply" : "object-cover")}
                />
              </div>
              <div className="flex flex-col justify-between gap-8 border-b border-border-subtle p-5 md:p-10">
                <div className="flex flex-col gap-8">
                  <div className="flex items-start gap-6">
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <DialogPrimitive.Title className="type-h4 text-primary">{pickName(pick.stone)}</DialogPrimitive.Title>
                      <p className="text-xs leading-4 tracking-[0.12px]">Optimized for {pick.optimizedFor}</p>
                    </div>
                    <DialogPrimitive.Close aria-label="Close" className="flex size-8 shrink-0 cursor-pointer items-center justify-center text-primary">
                      <XIcon className="size-5" />
                    </DialogPrimitive.Close>
                  </div>
                  <SpecStrip pick={pick} highlight={false} />
                  <div className="flex items-start gap-2 type-label-xs">
                    <button type="button" onClick={() => notInTest("Stone details")} className="cursor-pointer type-label-xs underline">
                      View Full Details
                    </button>
                    {pick.stone.type !== "gemstone" && (
                      <>
                        <span aria-hidden>∙</span>
                        <button type="button" onClick={() => notInTest("The GIA certificate")} className="cursor-pointer type-label-xs underline">
                          GIA Certificate
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-6">
                  <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-base leading-6 font-semibold">{formatPrice(pick.stone.price)}</span>
                    <span className="text-xs leading-4 tracking-[0.12px]">Order now and it ships {DELIVERY.shipBy.replace("By", "by")}.</span>
                  </p>
                  <div className="h-px bg-border-subtle" />
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={onSelect}>
                      Select this {kind}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="outline" size="icon" aria-label="More options" className="border-border-subtle" />}>
                        <EllipsisVertical />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => notInTest("Adding to a ring")}>Add to a ring</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => notInTest("Adding to a pendant")}>Add to a pendant</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => notInTest("Adding a loose stone to bag")}>Add loose stone to bag</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  )
}

/** Ring Summary (Figma 8038:26505): setting and stone lines, divider, ring total. */
function RingSummaryBox({ stone }: { stone: StonePick["stone"] }) {
  const rows = [
    {
      label: `Setting: ${SETTING.name.replace(/ Engagement Ring$/, "")}, ${SETTING.metal.replace("14K", "14k")}`,
      price: SETTING.price,
    },
    { label: `Stone: ${stoneTitle(stone)}`, price: stone.price },
  ]
  return (
    <div className="flex flex-col gap-4 bg-bg-input-50 p-4" aria-live="polite">
      <h2 className="type-h4 text-primary">Ring Summary</h2>
      <div className="flex flex-col gap-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start justify-between gap-4">
            <p className="text-xs leading-4 font-medium text-primary">{r.label}</p>
            <p className="text-sm leading-none font-semibold whitespace-nowrap text-muted-foreground">{formatPrice(r.price)}</p>
          </div>
        ))}
      </div>
      <div className="h-px bg-border-subtle" />
      <div className="flex items-start justify-between gap-4 text-base leading-6 font-semibold text-primary">
        <span>Ring Total:</span>
        <span className="whitespace-nowrap">{formatPrice(SETTING.price + stone.price)}</span>
      </div>
    </div>
  )
}

/**
 * Test 2 · Recommendations (2b), Figma 8038:26505 ("Stone Recommendations"): three real stones from stock
 * (Best Value, Largest Size, Finest Quality) as selectable tiles, then the Ring Summary and CTAs.
 */
export function Test2Recommendations() {
  const navigate = useNavigate()
  const notInTest = useNotInTest()
  const { variant, prefs, sim, matching, href } = useStonePrefs()
  const { shopBy } = variant
  const picks = useMemo(
    () =>
      sim.blocked
        ? []
        : recommend({
            scope: sim.scope,
            mode: sim.pickMode,
            size: sim.size,
            stoneMin: sim.stoneMin,
            stoneMax: sim.stoneMax,
          }),
    [sim],
  )
  const [selectedKind, setSelectedKind] = useState(picks[0]?.kind)
  const [quickview, setQuickview] = useState<StonePick | null>(null)
  const selected = picks.find((p) => p.kind === selectedKind) ?? picks[0]
  const kind = prefs.type === "gemstone" ? "Gemstone" : "Diamond"

  return (
    <div data-variant={variant.id}>
      <StoneStepLayout prefs={prefs} size={selected?.stone.size ?? sim.size} gallery="full">
        <StepIntro eyebrow="Step 2 of 3 · Stone" title="Stone Recommendations" />
        <SectionDivider />
        {/* Figma 8173:187709: Edit preferences, then what the picks are ("Round Natural Diamonds"), over the tiles. */}
        <div className="flex flex-col gap-4.5">
          <button
            type="button"
            onClick={() => navigate(href("preferences"))}
            className="flex h-6 cursor-pointer items-center gap-0.5 self-start type-label-xs text-primary underline"
          >
            <CaretLeftIcon className="size-4" />
            Edit preferences
          </button>
          <div className="flex flex-col gap-2">
            <h2 className="type-h4 text-primary">{picksHeading(prefs.type, effectiveShape(prefs), prefs.gem)}</h2>
            <Basis shopBy={shopBy} sim={sim} />
          </div>
        </div>
        {selected ? (
          <>
            <RadioGroup value={selected.kind} onValueChange={(v) => setSelectedKind(v as StonePick["kind"])} aria-label="Recommended stones" className="gap-2">
              {picks.map((p) => (
                <PickTile key={p.kind} pick={p} selected={p.kind === selected.kind} onSelect={() => setSelectedKind(p.kind)} onDetails={() => setQuickview(p)} />
              ))}
            </RadioGroup>
            <RingSummaryBox stone={selected.stone} />
          </>
        ) : (
          <div className="flex flex-col gap-2 bg-bg-input-50 p-4">
            <p className="type-h5 text-primary">No stones match these preferences</p>
            <p className="text-xs leading-4 text-muted-foreground">Edit your preferences to see recommendations.</p>
          </div>
        )}
        <StoneCtas
          primary={`Select This ${kind}`}
          onPrimary={() => notInTest("Finishing touches (step 3)")}
          primaryDisabled={!selected}
          viewAllDisabled={sim.blocked}
          shape={prefs.shape}
          count={matching.length}
          onViewAll={() => navigate(href("diamonds", { from: "recs" }))}
        />
      </StoneStepLayout>
      {/* Pick details (Figma 8197:189137). Selecting there picks the stone and moves on, as the page's Select button
          does; the full details page is Test 3. */}
      <PickDetails
        pick={quickview}
        kind={kind}
        onOpenChange={(open) => !open && setQuickview(null)}
        onSelect={() => {
          if (quickview) setSelectedKind(quickview.kind)
          setQuickview(null)
          notInTest("Finishing touches (step 3)")
        }}
      />
    </div>
  )
}
