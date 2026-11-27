import { useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { CaretLeftIcon } from "@phosphor-icons/react"
import { SectionDivider, StepIntro } from "@/components/dyo/finishing-sections"
import { StoneCtas } from "@/components/stones/stone-ctas"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DiamondQuickview } from "@/components/diamond/diamond-quickview"
import { formatSize, gemById, stoneImage, stoneShape, stoneSpecs, stoneTitle, stoneType, toQuickviewDiamond, type SpecKey, type StonePick, type StoneTypeId } from "@/data/stones"
import { formatPrice } from "@/lib/format"
import { useFlow, useStepNumber } from "@/flow/flow-context"
import { FLOW_ROUTES } from "@/flow/flow-paths"
import { cn } from "@/lib/utils"
import { useStudyViewAll } from "@/flow/study/study"
import { PickQuickview } from "@/flow/study/study-quickviews"
import { useRingBuild } from "@/state/ring-build"
import { useFlowSelectDiamond } from "./use-flow-stone"
import type { ShopBy } from "@/pages/test-2/variants"
import { effectiveShape, useFlowStonePrefs as useStonePrefs, type StoneSim } from "./simulator"
import { FlowStoneStepLayout as StoneStepLayout } from "./stone-step-layout"

/**
 * The line under the picks heading that ties them back to the shopper's choices, with the values in bold
 * (Figma 8173:188141): "Based on your preferred size of **2.25 ct** and ring budget of **$3,500 – $7,000**."
 */
export function Basis({ shopBy, sim }: { shopBy: ShopBy; sim: StoneSim }) {
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
export function picksHeading(type: StoneTypeId, shape: string, gem: string) {
  const shapeName = stoneShape(shape).label
  if (type !== "gemstone") return `${shapeName} ${stoneType(type).plpLabel}`
  const name = gemById(gem).label
  return `${shapeName} ${name.endsWith("y") ? `${name.slice(0, -1)}ies` : `${name}s`}`
}

/**
 * Carat (Size for gemstones) · Clarity · Color · Cut in one row, a divider left of each cell (Figma 8173:188141);
 * the cells this pick optimises are lightly shaded.
 */
export function SpecStrip({ pick, plain = false }: { pick: StonePick; /** No shading (the headline tiles) */ plain?: boolean }) {
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
      {cells.map((c) => (
        // A divider on the left of every cell; the cells this pick optimises are lightly shaded.
        <div
          key={c.key}
          className={cn("flex min-w-0 flex-1 flex-col gap-1 border-l border-border-subtle px-2.5 py-2", !plain && pick.highlight.includes(c.key) ? "bg-bg-input-50" : "bg-background")}
        >
          <dt className="text-xxs leading-3 font-semibold tracking-[1px] text-muted-foreground uppercase">{c.label}</dt>
          <dd className="text-xs leading-4 tracking-[0.12px] text-primary tabular-nums">{c.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * Pick tile (Figma 8173:187709): photo; the pick and what it's optimized for, with the radio; the 4Cs pill;
 * then the stone price, ring total and View details. Selection only changes the border.
 */
export function PickTile({
  pick,
  selected,
  onSelect,
  onDetails,
  headline,
}: {
  pick: StonePick
  selected: boolean
  onSelect: () => void
  onDetails: () => void
  /**
   * The accordion flow's tile (Figma 8224:180625, as Test 2's 8212:97435): this headline over the stone, plain 4Cs,
   * a 72px photo and "STONE ONLY" price, no ring total. Without it, the /flow tile as before.
   */
  headline?: string
}) {
  const { setting: SETTING } = useRingBuild()
  const img = stoneImage(pick.stone)
  if (headline) return <HeadlineTile pick={pick} selected={selected} onSelect={onSelect} onDetails={onDetails} headline={headline} img={img} />
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
      <div className="col-span-2 flex flex-col gap-0.5 text-primary md:col-span-1 md:col-start-2">
        <p className="text-sm leading-5 font-semibold">{formatPrice(pick.stone.price)}</p>
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-xs leading-4 tracking-[0.12px]">Ring Total: {formatPrice(SETTING.price + pick.stone.price)}</p>
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
        </div>
      </div>
    </div>
  )
}

function HeadlineTile({
  pick,
  selected,
  onSelect,
  onDetails,
  headline,
  img,
}: {
  pick: StonePick
  selected: boolean
  onSelect: () => void
  onDetails: () => void
  headline: string
  img: ReturnType<typeof stoneImage>
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "grid cursor-pointer grid-cols-[--spacing(18)_minmax(0,1fr)] items-start gap-x-4 gap-y-4 bg-background md:gap-x-5",
        selected ? "border-2 border-primary p-3.75" : "border border-border-subtle p-4 hover:border-border",
      )}
    >
      <div className="size-18 overflow-hidden bg-secondary md:row-span-3">
        <img
          src={img.src}
          alt=""
          className={cn("size-full", img.render ? "origin-[50%_30%] scale-[2.4] object-contain" : img.photo ? "object-cover" : "object-contain p-2.5 mix-blend-multiply")}
        />
      </div>
      <div className="flex items-start gap-4 text-primary">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-sm leading-5 font-semibold">{headline}</p>
          <p className="text-xs leading-4 tracking-[0.12px]">{stoneTitle(pick.stone)}</p>
        </div>
        <RadioGroupItem value={pick.kind} aria-label={`${headline}: ${stoneTitle(pick.stone)}`} className="border-primary" />
      </div>
      <div className="col-span-2 md:col-span-1 md:col-start-2">
        <SpecStrip pick={pick} plain />
      </div>
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
        <p className="flex items-baseline gap-2 whitespace-nowrap">
          <span className="text-xxs leading-3 tracking-[1px] uppercase">Stone only</span>
          <span className="text-sm leading-5 font-semibold">{formatPrice(pick.stone.price)}</span>
        </p>
      </div>
    </div>
  )
}

/**
 * Each pick's headline (Test 2's tiles, Figma 8212:97435): the labels the full-flow study asks about (Biggest stone /
 * Best balance / Top grades). `nearSize`: matched on size (carat first, or outside the budget) rather than the budget.
 */
export function pickHeadline(pick: StonePick, nearSize: boolean) {
  if (pick.kind === "size") return `Biggest stone ${nearSize ? "near your preferred size" : "within your budget"}`
  if (pick.kind === "value") return pick.stone.type === "gemstone" ? "Best balance of size, color and clarity" : "Best balance of size, sparkle and color"
  return "Top grades, slightly smaller size"
}

/** Ring Summary (Figma 8038:26505): setting and stone lines, divider, ring total. */
export function RingSummaryBox({ stone }: { stone: StonePick["stone"] }) {
  const { setting: SETTING } = useRingBuild()
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

const STUDY_PICK_ORDER: StonePick["kind"][] = ["size", "value", "quality"]

/**
 * Full DYO flow · 2b Stone recommendations. A copy of Test 2's page (src/pages/test-2/recommendations.tsx,
 * re-synced with Lewis's Figma 8173:188141 version) so Test 2 stays untouched. Differences: priced with the
 * flow's setting; Select puts the stone in the build and moves on to step 3; View details opens the Quickview
 * (flow t31 B) or the Diamond PDP (t31 A), and the Quickview's Full Details opens the Diamond PDP.
 * Keep it in sync with Test 2.
 */
export function FlowStoneRecommendations() {
  const navigate = useNavigate()
  const stoneStep = useStepNumber("stone")
  const flow = useFlow()
  const selectDiamond = useFlowSelectDiamond()
  const viewAll = useStudyViewAll()
  const { variant, prefs, sim, matching, picks: flowPicks, matchedBy, href } = useStonePrefs()
  // The study's recommendations are the same in both flows: Test 2's order (biggest stone, best balance, top grades).
  const picks = useMemo(
    () => (flow?.study ? [...flowPicks].sort((a, b) => STUDY_PICK_ORDER.indexOf(a.kind) - STUDY_PICK_ORDER.indexOf(b.kind)) : flowPicks),
    [flowPicks, flow?.study],
  )
  const opensQuickview = flow?.config.t31 !== "A"
  const toPdp = (id: string) => {
    navigate(flow ? flow.path(`${FLOW_ROUTES.diamond(id)}?from=recs`) : FLOW_ROUTES.diamond(id))
    window.scrollTo({ top: 0 })
  }
  // Matched as View All is: with Budget first, near the Preview Size as well as in the budget (simulator matchMode).
  const [selectedKind, setSelectedKind] = useState(picks[0]?.kind)
  const [quickview, setQuickview] = useState<StonePick | null>(null)
  const selected = picks.find((p) => p.kind === selectedKind) ?? picks[0]
  const kind = prefs.type === "gemstone" ? "Gemstone" : "Diamond"

  return (
    <div data-variant={variant.id}>
      <StoneStepLayout prefs={prefs} size={selected?.stone.size ?? sim.size} gallery="full">
        <StepIntro eyebrow={`Step ${stoneStep} of 3 · Stone`} title="Stone Recommendations" />
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
            <Basis shopBy={matchedBy} sim={sim} />
          </div>
        </div>
        {selected ? (
          <>
            <RadioGroup value={selected.kind} onValueChange={(v) => setSelectedKind(v as StonePick["kind"])} aria-label="Recommended stones" className="gap-2">
              {picks.map((p) => (
                <PickTile
                  key={p.kind}
                  pick={p}
                  selected={p.kind === selected.kind}
                  onSelect={() => setSelectedKind(p.kind)}
                  onDetails={() => (opensQuickview ? setQuickview(p) : toPdp(p.stone.id))}
                  // The study's recommendations are the same in both flows: Test 2's headline tiles.
                  headline={flow?.study ? pickHeadline(p, matchedBy === "size" || !sim.inBudget) : undefined}
                />
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
          onPrimary={() => selected && selectDiamond(toQuickviewDiamond(selected.stone))}
          primaryDisabled={!selected}
          viewAllDisabled={sim.blocked}
          shape={prefs.shape}
          count={matching.length}
          onViewAll={viewAll.guard(() => navigate(href("diamonds", { from: "recs" })))}
        />
      </StoneStepLayout>
      {/* The Diamond GLP's Quickview, for diamonds and gemstones (ring total = this setting + the stone). Selecting
          there picks the stone and moves on, as the page's Select button does; the full details page is Test 3. */}
      {/* Part 3 of the full-flow study: the pick's own Quickview, saying why it was picked (Figma 8287:14562). */}
      {flow?.study?.part === 3 ? (
        <PickQuickview
          pick={quickview}
          nearSize={matchedBy === "size" || !sim.inBudget}
          onClose={() => setQuickview(null)}
          onSelect={(p) => {
            setQuickview(null)
            selectDiamond(toQuickviewDiamond(p.stone))
          }}
          onFullDetails={(p) => {
            setQuickview(null)
            toPdp(p.stone.id)
          }}
        />
      ) : (
        <DiamondQuickview
          diamond={quickview && toQuickviewDiamond(quickview.stone)}
          title={quickview ? stoneTitle(quickview.stone) : undefined}
          noun={kind}
          certificate={prefs.type === "gemstone" ? null : undefined}
          onOpenChange={(open) => !open && setQuickview(null)}
          onSelect={() => {
            const picked = quickview
            setQuickview(null)
            if (picked) selectDiamond(toQuickviewDiamond(picked.stone))
          }}
          onViewDetails={() => {
            const picked = quickview
            setQuickview(null)
            if (picked) toPdp(picked.stone.id)
          }}
        />
      )}
    </div>
  )
}
